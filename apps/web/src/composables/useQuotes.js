// @/composables/useQuotes.js

import { ref, computed } from 'vue';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
  orderBy
} from 'firebase/firestore';
import { ensureBusinessId } from './useBusinessUtils';
import { useTransactionStore } from '@/stores/transaction/transactionStore';
import { useTransactionFlowStore } from '@/stores/transaction/transactionFlowStore';

import appFirebase from '@/firebaseInit';

const db = getFirestore(appFirebase);


export function useQuotes() {
  const quotes = ref([]);
  const loading = ref(false);
  const error = ref(null);

  /**
   * Obtiene todas las cotizaciones del negocio
   * @param {string} status - Filtrar por estado: 'pending', 'converted', 'cancelled', 'expired', 'all'
   */
  const fetchQuotes = async (status = 'all') => {
    loading.value = true;
    error.value = null;

    try {
      const businessId = ensureBusinessId();
      const quotesRef = collection(db, 'businesses', businessId, 'quotes');

      let q;
      if (status === 'all') {
        q = query(quotesRef, orderBy('createdAt', 'desc'));
      } else {
        q = query(
          quotesRef,
          where('status', '==', status),
          orderBy('createdAt', 'desc')
        );
      }

      const snapshot = await getDocs(q);
      quotes.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convertir Timestamps a Date para facilitar el manejo
        createdAt: doc.data().createdAt?.toDate(),
        expiresAt: doc.data().expiresAt?.toDate(),
        convertedAt: doc.data().convertedAt?.toDate(),
      }));

      // Marcar como expiradas las cotizaciones pendientes que ya pasaron su fecha
      const now = new Date();
      const updates = [];

      for (const quote of quotes.value) {
        if (quote.status === 'pending' && quote.expiresAt && quote.expiresAt < now) {
          quote.status = 'expired';
          updates.push(updateQuoteStatus(quote.uuid, 'expired'));
        }
      }

      if (updates.length > 0) {
        await Promise.all(updates);
      }

      console.log(`✅ ${quotes.value.length} cotizaciones cargadas`);
      return quotes.value;

    } catch (err) {
      console.error('❌ Error cargando cotizaciones:', err);
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Obtiene una cotización específica por su UUID
   */
  const getQuoteById = async (quoteId) => {
    try {
      const businessId = ensureBusinessId();
      const quoteRef = doc(db, 'businesses', businessId, 'quotes', quoteId);

      const { getDoc } = await import('firebase/firestore');
      const snapshot = await getDoc(quoteRef);

      if (!snapshot.exists()) {
        throw new Error('Cotización no encontrada');
      }

      return {
        id: snapshot.id,
        ...snapshot.data(),
        createdAt: snapshot.data().createdAt?.toDate(),
        expiresAt: snapshot.data().expiresAt?.toDate(),
        convertedAt: snapshot.data().convertedAt?.toDate(),
      };

    } catch (err) {
      console.error('❌ Error obteniendo cotización:', err);
      throw err;
    }
  };

  /**
   * Actualiza el estado de una cotización
   */
  const updateQuoteStatus = async (quoteId, newStatus) => {
    try {
      const businessId = ensureBusinessId();
      const quoteRef = doc(db, 'businesses', businessId, 'quotes', quoteId);

      await updateDoc(quoteRef, {
        status: newStatus,
        updatedAt: Timestamp.now()
      });

      console.log(`✅ Cotización ${quoteId} actualizada a estado: ${newStatus}`);
      return true;

    } catch (err) {
      console.error('❌ Error actualizando estado de cotización:', err);
      throw err;
    }
  };

  /**
   * Cancela una cotización
   */
  const cancelQuote = async (quoteId) => {
    return await updateQuoteStatus(quoteId, 'cancelled');
  };

  /**
   * Elimina permanentemente una cotización
   */
  const deleteQuote = async (quoteId) => {
    try {
      const businessId = ensureBusinessId();
      const quoteRef = doc(db, 'businesses', businessId, 'quotes', quoteId);

      await deleteDoc(quoteRef);

      console.log(`✅ Cotización ${quoteId} eliminada`);
      return true;

    } catch (err) {
      console.error('❌ Error eliminando cotización:', err);
      throw err;
    }
  };

  /**
   * Convierte una cotización en una transacción de venta
   * Abre el flujo de transacciones con los datos pre-cargados
   */
  const convertQuoteToSale = async (quoteId) => {
    try {
      console.log('🔄 Convirtiendo cotización a venta:', quoteId);

      // 1. Obtener la cotización
      const quote = await getQuoteById(quoteId);

      if (quote.status !== 'pending') {
        throw new Error('Solo se pueden convertir cotizaciones pendientes');
      }

      // 2. Cargar datos en transactionStore
      const transactionStore = useTransactionStore();

      // Resetear primero
      transactionStore.resetTransactionToAdd();

      // 3. Pre-cargar datos de la cotización
      transactionStore.transactionToAdd.value.type = 'income';

      // ✅ GUARDAR REFERENCIA DE LA COTIZACIÓN
      transactionStore.transactionToAdd.value.quoteId = quote.uuid;
      transactionStore.transactionToAdd.value.quoteNumber = quote.quoteNumber;

      // Pre-cargar productos - VERIFICAR SI EXISTEN EN FIRESTORE
      const { useBusinessStore } = await import('@/stores/businessStore');
      const businessStore = useBusinessStore();

      const itemsWithVerifiedStatus = await Promise.all(
        quote.items.map(async (item) => {
          try {
            // Verificar si el producto existe en Firestore
            const productRef = doc(db, 'businesses', businessStore.getBusinessId, 'products', item.uuid);
            const productDoc = await getDoc(productRef);

            const exists = productDoc.exists();
            console.log(`🔍 Producto "${item.name}" (${item.uuid}): ${exists ? 'EXISTE' : 'NO EXISTE'} en Firestore`);

            return {
              uuid: item.uuid,
              name: item.name,
              description: item.description,
              quantity: item.quantity,
              unit: item.unit,
              price: item.price,
              oldOrNewProduct: exists ? 'old' : 'new', // ✅ Marcar correctamente según existencia
              selectedProductUuid: item.uuid
            };
          } catch (error) {
            console.warn(`⚠️ Error verificando producto ${item.name}:`, error);
            // En caso de error, marcar como "new" para forzar creación
            return {
              uuid: item.uuid,
              name: item.name,
              description: item.description,
              quantity: item.quantity,
              unit: item.unit,
              price: item.price,
              oldOrNewProduct: 'new',
              selectedProductUuid: item.uuid
            };
          }
        })
      );

      transactionStore.transactionToAdd.value.items = itemsWithVerifiedStatus;

      // Pre-cargar cliente
      if (quote.clientId) {
        transactionStore.setClientInfo({
          id: quote.clientId,
          name: quote.clientName
        });
      }

      // 4. Configurar flujo de transacciones para saltar a StepPaymentMethod
      const flowStore = useTransactionFlowStore();
      flowStore.resetFlow();
      flowStore.defineDynamicSteps('income');

      // Avanzar directamente al paso de método de pago (paso 1 en el array)
      // Los pasos son: [StepIncomeOrExpense, StepAddIncomeDetails, StepPaymentMethod, StepAttachClient, StepAddIncomePreview]
      flowStore.currentStep = 2; // StepPaymentMethod

      console.log('✅ Cotización cargada en el flujo de transacciones');
      console.log('📍 Posición actual:', flowStore.currentStep, flowStore.steps[flowStore.currentStep]?.label);
      console.log('🔗 Referencias guardadas:', {
        quoteId: quote.uuid,
        quoteNumber: quote.quoteNumber
      });

      return {
        success: true,
        quote,
        nextStep: 'payment_method'
      };

    } catch (err) {
      console.error('❌ Error convirtiendo cotización:', err);
      throw err;
    }
  };

  /**
   * Marca una cotización como convertida después de crear la venta
   */
  const markQuoteAsConverted = async (quoteId, transactionId) => {
    try {
      const businessId = ensureBusinessId();
      const quoteRef = doc(db, 'businesses', businessId, 'quotes', quoteId);

      await updateDoc(quoteRef, {
        status: 'converted',
        convertedToTransactionId: transactionId,
        convertedAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      console.log(`✅ Cotización ${quoteId} marcada como convertida`);
      return true;

    } catch (err) {
      console.error('❌ Error marcando cotización como convertida:', err);
      throw err;
    }
  };

  // Computed properties
  const pendingQuotes = computed(() =>
    quotes.value.filter(q => q.status === 'pending')
  );

  const convertedQuotes = computed(() =>
    quotes.value.filter(q => q.status === 'converted')
  );

  const cancelledQuotes = computed(() =>
    quotes.value.filter(q => q.status === 'cancelled')
  );

  const expiredQuotes = computed(() =>
    quotes.value.filter(q => q.status === 'expired')
  );

  const totalQuotesValue = computed(() =>
    pendingQuotes.value.reduce((sum, q) => sum + (q.total || 0), 0)
  );

  const totalQuotesCount = computed(() => quotes.value.length);

  const pendingQuotesCount = computed(() => pendingQuotes.value.length);

  return {
    quotes,
    loading,
    error,
    pendingQuotes,
    convertedQuotes,
    cancelledQuotes,
    expiredQuotes,
    totalQuotesValue,
    totalQuotesCount,
    pendingQuotesCount,
    fetchQuotes,
    getQuoteById,
    updateQuoteStatus,
    cancelQuote,
    deleteQuote,
    convertQuoteToSale,
    markQuoteAsConverted
  };
}
