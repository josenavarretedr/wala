import { ref } from 'vue';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  increment,
  serverTimestamp,
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/firebaseInit';
import { useBusinessStore } from '@/stores/businessStore';
import { useInventory } from '@/composables/useInventory';
import { round2 } from '@/utils/mathUtils';

export function useSupplierManagement() {
  const businessStore = useBusinessStore();
  const { createStockLog } = useInventory();

  const purchaseQuotes = ref([]);
  const supplierIncidents = ref([]);
  const loading = ref(false);

  const ensureBusinessId = () => businessStore.business?.id || null;

  async function fetchPurchaseQuotes() {
    const businessId = ensureBusinessId();
    if (!businessId) return [];
    loading.value = true;
    try {
      const q = query(
        collection(db, 'businesses', businessId, 'purchaseQuotes'),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ uuid: d.id, ...d.data() }));
      purchaseQuotes.value = list;
      return list;
    } catch (err) {
      console.warn('⚠️ Error cargando cotizaciones:', err);
      purchaseQuotes.value = [];
      return [];
    } finally {
      loading.value = false;
    }
  }

  async function createPurchaseQuote(payload) {
    const businessId = ensureBusinessId();
    if (!businessId) throw new Error('No hay negocio activo');

    const quotes = [
      {
        name: payload.supplierAName?.trim(),
        price: Number(payload.supplierAPrice),
        supplierId: payload.supplierAId || null,
      },
      {
        name: payload.supplierBName?.trim(),
        price: Number(payload.supplierBPrice),
        supplierId: payload.supplierBId || null,
      },
      {
        name: payload.supplierCName?.trim(),
        price: Number(payload.supplierCPrice),
        supplierId: payload.supplierCId || null,
      },
    ].filter((q) => q.name && Number.isFinite(q.price) && q.price > 0);

    if (quotes.length < 2) {
      throw new Error('Ingresa al menos 2 proveedores con precio válido para comparar.');
    }

    const sorted = [...quotes].sort((a, b) => a.price - b.price);
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];
    const savingsPerUnit = round2(Math.max(0, worst.price - best.price));
    const quoteId = uuidv4();

    const quoteDoc = {
      uuid: quoteId,
      itemDescription: String(payload.itemDescription || '').trim(),
      quantity: Number(payload.quantity || 1),
      unit: payload.unit || 'uni',
      quotes,
      bestSupplierName: best.name,
      bestSupplierId: best.supplierId || null,
      bestPrice: round2(best.price),
      worstPrice: round2(worst.price),
      savingsPerUnit,
      estimatedTotalSavings: round2(savingsPerUnit * Number(payload.quantity || 1)),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'businesses', businessId, 'purchaseQuotes', quoteId), quoteDoc);
    await fetchPurchaseQuotes();
    return quoteDoc;
  }

  async function fetchSupplierIncidents(supplierId = null) {
    const businessId = ensureBusinessId();
    if (!businessId) return [];
    loading.value = true;
    try {
      const colRef = collection(db, 'businesses', businessId, 'supplierIncidents');
      const q = supplierId
        ? query(colRef, where('supplierId', '==', supplierId))
        : query(colRef, orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const list = snap.docs
        .map((d) => ({ uuid: d.id, ...d.data() }))
        .sort((a, b) => {
          const ta = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const tb = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return tb - ta;
        });
      supplierIncidents.value = list;
      return list;
    } catch (err) {
      console.warn('⚠️ Error cargando incidencias de proveedores:', err);
      supplierIncidents.value = [];
      return [];
    } finally {
      loading.value = false;
    }
  }

  async function createSupplierIncident({
    supplierId,
    supplierName = '',
    transactionId = null,
    reason,
    mode = 'claim', // 'claim' | 'discount' | 'return'
    amountAdjustment = 0,
    productId = null,
    productDescription = '',
    quantityReturned = 0,
    notes = '',
  }) {
    const businessId = ensureBusinessId();
    if (!businessId || !supplierId) throw new Error('Faltan datos del negocio o proveedor');

    const incidentId = uuidv4();
    const adj = round2(Number(amountAdjustment || 0));
    const qtyRet = Number(quantityReturned || 0);

    const incidentDoc = {
      uuid: incidentId,
      supplierId,
      supplierName,
      transactionId: transactionId || null,
      reason: String(reason || 'Incidencia en entrega').trim(),
      mode,
      amountAdjustment: adj,
      productId: productId || null,
      productDescription: productDescription || null,
      quantityReturned: qtyRet,
      notes: String(notes || '').trim() || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'businesses', businessId, 'supplierIncidents', incidentId), incidentDoc);

    // Siempre incrementar contador de confiabilidad en el proveedor
    const supplierRef = doc(db, 'businesses', businessId, 'suppliers', supplierId);
    const supplierUpdate = {
      incidentsCount: increment(1),
      lastIncidentAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Modo híbrido: ajuste financiero (nota de crédito / descuento / devolución con rebaja)
    if ((mode === 'discount' || mode === 'return') && adj > 0) {
      const supSnap = await getDoc(supplierRef);
      const currentPending = Number(supSnap.data()?.pendingBalance || 0);
      const nextPending = round2(Math.max(0, currentPending - adj));
      supplierUpdate.pendingBalance = nextPending;

      if (transactionId) {
        const txRef = doc(db, 'businesses', businessId, 'transactions', transactionId);
        const txSnap = await getDoc(txRef);
        if (txSnap.exists()) {
          const txData = txSnap.data();
          const newAmount = round2(Math.max(0, Number(txData.amount || 0) - adj));
          const totalPaid = round2(Number(txData.totalPaid || 0));
          const newBalance = round2(Math.max(0, newAmount - totalPaid));
          await updateDoc(txRef, {
            amount: newAmount,
            balance: newBalance,
            paymentStatus: newBalance === 0 ? 'completed' : txData.paymentStatus,
            supplierAdjustmentAmount: increment(adj),
            updatedAt: serverTimestamp(),
          });
        }
      }
    }

    await updateDoc(supplierRef, supplierUpdate);

    // Si hubo devolución física de mercadería/insumo, descontar stock con stockLog
    if (mode === 'return' && productId && qtyRet > 0) {
      await createStockLog(
        {
          uuid: productId,
          quantity: qtyRet,
          price: qtyRet > 0 && adj > 0 ? round2(adj / qtyRet) : 0,
          supplierId,
          supplierName,
        },
        'return_to_supplier'
      );
    }

    await fetchSupplierIncidents(supplierId);
    return incidentDoc;
  }

  return {
    purchaseQuotes,
    supplierIncidents,
    loading,
    fetchPurchaseQuotes,
    createPurchaseQuote,
    fetchSupplierIncidents,
    createSupplierIncident,
  };
}
