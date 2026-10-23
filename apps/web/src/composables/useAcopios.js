import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import appFirebase from '@/firebaseInit';
import { ensureBusinessId } from "@/composables/useBusinessUtils";
import { v4 as uuidv4 } from 'uuid';
import { useTransaccion } from "@/composables/useTransaction";
import { useInventory } from "@/composables/useInventory";
import { useSupplierStore } from "@/stores/supplierStore";
import { useCashOpeningValidation } from "@/composables/useCashOpeningValidation";

const db = getFirestore(appFirebase);

export function useAcopios() {
  const { createTransaction, updateTransaction } = useTransaccion();
  const { createStockLog } = useInventory();
  const supplierStore = useSupplierStore();

  const saveAcopio = async (acopioData) => {
    try {
      const businessId = ensureBusinessId();
      if (!businessId) throw new Error('No hay negocio activo');

      // 0. Validar apertura de caja obligatoria antes de registrar acopio
      const { checkCashOpening } = useCashOpeningValidation();
      const hasOpening = await checkCashOpening(businessId);
      if (!hasOpening) {
        throw new Error('Debes aperturar la caja primero antes de registrar un acopio');
      }

      const acopioId = acopioData.uuid || uuidv4();
      const transactionId = acopioData.transactionId || uuidv4();

      const agreedPrice = Number(acopioData.agreedPrice) || 0;
      const totalAmount = Number(acopioData.quantity) * agreedPrice;

      // 1. Crear documento de Acopio
      const acopioDoc = {
        uuid: acopioId,
        productId: acopioData.productId,
        productDescription: acopioData.productDescription,
        unit: acopioData.unit || 'uni',
        quantity: Number(acopioData.quantity),
        agreedPrice: agreedPrice,
        totalAmount: totalAmount,
        supplierId: acopioData.supplierId,
        supplierName: acopioData.supplierName,
        transactionId: transactionId,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const acopioRef = doc(db, 'businesses', businessId, 'acopios', acopioId);
      await setDoc(acopioRef, acopioDoc);

      // 2. Crear Transacción de Egreso (Expense) de tipo materials
      const transactionDoc = {
        uuid: transactionId,
        id: transactionId,
        type: 'expense',
        category: 'materials',
        description: `Acopio: ${acopioData.productDescription}`,
        amount: totalAmount,
        balance: totalAmount,
        totalPaid: 0,
        paymentStatus: 'pending',
        supplierId: acopioData.supplierId,
        supplierName: acopioData.supplierName,
        acopioId: acopioId,
        payments: [
          {
            uuid: uuidv4(),
            amount: 0,
            isInitial: true,
            date: new Date(),
            account: 'cash',
            notes: 'Acopio a crédito (sin desembolso inicial)'
          }
        ],
        account: 'cash', // Cuenta por defecto
        materialItems: [
          {
            uuid: acopioData.productId,
            productId: acopioData.productId,
            description: acopioData.productDescription,
            quantity: Number(acopioData.quantity),
            cost: agreedPrice,
            totalCost: totalAmount,
            unit: acopioData.unit || 'uni',
            oldOrNewProduct: 'old'
          }
        ]
      };

      await createTransaction(transactionDoc);

      // 3. Incrementar Stock del Producto (Crear Stock Log)
      const stockLogItem = {
        uuid: acopioData.productId,
        description: acopioData.productDescription,
        quantity: Number(acopioData.quantity),
        cost: agreedPrice,
        price: 0,
        unit: acopioData.unit || 'uni',
        transactionId: transactionId,
        supplierId: acopioData.supplierId,
        supplierName: acopioData.supplierName,
        oldOrNewProduct: 'old',
        isAcopio: true,
        acopioId: acopioId
      };

      // Usar type: 'buy' para que actualice stock y costo del producto
      const stockLogId = await createStockLog(stockLogItem, 'buy');

      // Actualizar la transacción con el stockLogId generado
      if (stockLogId) {
        transactionDoc.materialItems[0].stockLogId = stockLogId;
        transactionDoc.materialItemsAndStockLogs = [{
          itemUuid: acopioData.productId,
          stockLogUuid: stockLogId
        }];
        await updateTransaction(transactionId, {
          materialItems: transactionDoc.materialItems,
          materialItemsAndStockLogs: transactionDoc.materialItemsAndStockLogs
        });
      }

      // 4. Actualizar metadata del proveedor (socio)
      await supplierStore.updateSupplierMetadata(acopioData.supplierId);

      return { acopioId, transactionId };
    } catch (error) {
      console.error('Error al guardar acopio:', error);
      throw error;
    }
  };

  const getAcopiosListener = (callback) => {
    const businessId = ensureBusinessId();
    if (!businessId) return () => {};

    const acopiosRef = collection(db, 'businesses', businessId, 'acopios');
    const q = query(acopiosRef, orderBy('createdAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
      const acopios = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(acopios);
    });
  };

  const updateAcopioPriceAndExpense = async (acopioId, newPrice) => {
    try {
      const businessId = ensureBusinessId();
      if (!businessId) throw new Error('No hay negocio activo');

      // 1. Obtener documento de acopio
      const acopioRef = doc(db, 'businesses', businessId, 'acopios', acopioId);
      const acopioSnap = await getDoc(acopioRef);
      if (!acopioSnap.exists()) throw new Error('El acopio no existe');

      const acopioData = acopioSnap.data();
      const newPriceNum = Number(newPrice);
      const newTotal = Number(acopioData.quantity) * newPriceNum;

      // 2. Actualizar documento de acopio
      await updateDoc(acopioRef, {
        agreedPrice: newPriceNum,
        totalAmount: newTotal,
        updatedAt: serverTimestamp()
      });

      // 3. Actualizar la transacción
      const transactionId = acopioData.transactionId;
      const transactionRef = doc(db, 'businesses', businessId, 'transactions', transactionId);
      const transactionSnap = await getDoc(transactionRef);

      if (transactionSnap.exists()) {
        const transData = transactionSnap.data();
        // Recalcular saldo pendiente (balance = newTotal - totalPaid)
        const totalPaid = transData.totalPaid || 0;
        const newBalance = Math.max(newTotal - totalPaid, 0);

        let newStatus = 'pending';
        if (newBalance <= 0) {
          newStatus = 'completed';
        } else if (totalPaid > 0) {
          newStatus = 'partial';
        }

        const updatedMaterialItems = (transData.materialItems || []).map(item => {
          if (item.productId === acopioData.productId) {
            return {
              ...item,
              cost: newPriceNum,
              totalCost: newTotal
            };
          }
          return item;
        });

        await updateDoc(transactionRef, {
          amount: newTotal,
          balance: newBalance,
          paymentStatus: newStatus,
          materialItems: updatedMaterialItems,
          updatedAt: serverTimestamp()
        });

        // 4. Actualizar el stockLog
        if (transData.materialItemsAndStockLogs && transData.materialItemsAndStockLogs.length > 0) {
          const stockLogUuid = transData.materialItemsAndStockLogs[0].stockLogUuid;
          const stockLogRef = doc(db, `businesses/${businessId}/products/${acopioData.productId}/stockLog`, stockLogUuid);
          const stockLogSnap = await getDoc(stockLogRef);

          if (stockLogSnap.exists()) {
            await updateDoc(stockLogRef, {
              cost: newPriceNum,
              updatedAt: serverTimestamp()
            });
            console.log(`✅ StockLog ${stockLogUuid} costo actualizado a S/ ${newPriceNum}`);
          }
        }
      }

      // 5. Actualizar metadata del proveedor
      await supplierStore.updateSupplierMetadata(acopioData.supplierId);

      console.log(`✅ Acopio y registros asociados actualizados a nuevo precio S/ ${newPriceNum}`);
      return true;
    } catch (error) {
      console.error('Error al actualizar precio del acopio:', error);
      throw error;
    }
  };

  /**
   * Elimina un acopio y revierte de forma integral todos los efectos generados:
   * 1. Elimina la transacción de egreso y pagos en cascada asociados (vía transactionStore).
   * 2. Revierte el stock del producto deduciendo la cantidad acopiada y borrando el stockLog.
   * 3. Recalcula las cuentas por pagar y estadísticas del socio/proveedor (pendingBalance, totalExpenses).
   * 4. Elimina el documento de acopio de businesses/{businessId}/acopios/{acopioId}.
   * 5. El trigger onTransactionWrite recalcula automáticamente el dailySummary.
   *
   * @param {string} acopioId - UUID del acopio a eliminar
   * @returns {Promise<boolean>} true si se eliminó con éxito
   */
  const deleteAcopio = async (acopioId) => {
    try {
      const businessId = ensureBusinessId();
      if (!businessId) throw new Error('No hay negocio activo');

      console.log(`🌾 [DELETE ACOPIO] Iniciando reversión y eliminación de acopio: ${acopioId}`);

      // 1. Obtener documento de acopio
      const acopioRef = doc(db, 'businesses', businessId, 'acopios', acopioId);
      const acopioSnap = await getDoc(acopioRef);

      let acopioData = null;
      if (acopioSnap.exists()) {
        acopioData = acopioSnap.data();
      }

      const transactionId = acopioData?.transactionId;
      const supplierId = acopioData?.supplierId;
      const productId = acopioData?.productId;
      const quantity = Number(acopioData?.quantity || 0);

      // Si el acopio ya fue liquidado o tiene abonos, no se puede eliminar directamente el acopio
      if (acopioData?.status === 'completed' || acopioData?.status === 'partial') {
        throw new Error('Este acopio cuenta con liquidaciones o pagos registrados. Debes anular la liquidación primero.');
      }

      // 2. Si tiene transacción enlazada, ejecutar eliminación con integridad mediante transactionStore
      if (transactionId) {
        const { useTransactionStore } = await import('@/stores/transaction/transactionStore');
        const transactionStore = useTransactionStore();

        try {
          // Se pasa callback auto-aprobado porque la confirmación ya fue solicitada en el modal de usuario
          await transactionStore.deleteOneTransactionByID(transactionId, () => Promise.resolve(true));
          console.log(`✅ [DELETE ACOPIO] Transacción ${transactionId} y efectos asociados revertidos por transactionStore`);
        } catch (txErr) {
          console.warn(`⚠️ [DELETE ACOPIO] No se pudo delegar a transactionStore (posiblemente ya no existe):`, txErr);

          // Reversión de contingencia del stock si la transacción estaba ausente
          if (productId && quantity > 0) {
            try {
              const productRef = doc(db, `businesses/${businessId}/products`, productId);
              const productDoc = await getDoc(productRef);
              if (productDoc.exists()) {
                const pData = productDoc.data();
                const newStock = Math.max((pData.stock || 0) - quantity, 0);
                await updateDoc(productRef, { stock: newStock });
                console.log(`✅ [DELETE ACOPIO] Stock revertido manualmente de contingencia: ${pData.stock} - ${quantity} = ${newStock}`);
              }
            } catch (pErr) {
              console.error('Error revirtiendo stock manualmente:', pErr);
            }
          }
        }
      }

      // 3. Asegurar que el documento de acopio esté eliminado en Firestore
      const freshAcopioSnap = await getDoc(acopioRef);
      if (freshAcopioSnap.exists()) {
        await deleteDoc(acopioRef);
        console.log(`✅ [DELETE ACOPIO] Documento de acopio ${acopioId} eliminado físicamente`);
      }

      // 4. Recalcular metadata del socio/proveedor (saldo adeudado, transacciones, etc.)
      if (supplierId) {
        await supplierStore.updateSupplierMetadata(supplierId);
        console.log(`✅ [DELETE ACOPIO] Metadata del socio ${supplierId} actualizada exitosamente`);
      }

      return true;
    } catch (error) {
      console.error('❌ Error al eliminar acopio:', error);
      throw error;
    }
  };

  /**
   * Anula la liquidación de un acopio sin eliminar el acopio ni modificar el inventario.
   * - Requiere que la caja del día esté aperturada.
   * - Elimina las transacciones de pago (type: 'payment'), reintegrando el dinero a Caja/Banco y actualizando DailySummary.
   * - Restablece la cuenta por pagar (gasto original) a estado 'pending' con balance íntegro.
   * - Actualiza el documento de acopio a status: 'pending'.
   * - Recalcula la deuda del socio en supplierStore.
   * - Mantiene el stock e inventario INTACTOS.
   * 
   * @param {string} acopioId - UUID del acopio cuya liquidación se revertirá
   * @returns {Promise<boolean>}
   */
  const revertAcopioLiquidation = async (acopioId) => {
    try {
      const businessId = ensureBusinessId();
      if (!businessId) throw new Error('No hay negocio activo');

      // 0. Validar apertura de caja obligatoria antes de revertir liquidación
      const { checkCashOpening, showOpeningRequiredToast } = useCashOpeningValidation();
      const hasOpening = await checkCashOpening(businessId);
      if (!hasOpening) {
        showOpeningRequiredToast(businessId);
        throw new Error('Debes aperturar la caja primero antes de anular una liquidación');
      }

      console.log(`🌾 [REVERT LIQUIDATION] Anulando liquidación de acopio: ${acopioId}`);

      // 1. Obtener documento de acopio
      const acopioRef = doc(db, 'businesses', businessId, 'acopios', acopioId);
      const acopioSnap = await getDoc(acopioRef);
      if (!acopioSnap.exists()) {
        throw new Error('El acopio no existe');
      }

      const acopioData = acopioSnap.data();
      const transactionId = acopioData.transactionId;
      const supplierId = acopioData.supplierId;
      const totalAmount = Number(acopioData.totalAmount || 0);

      const { useTransactionStore } = await import('@/stores/transaction/transactionStore');
      const transactionStore = useTransactionStore();

      // 2. Localizar y eliminar las transacciones de pago asociadas (type: 'payment')
      if (transactionId) {
        const qPayments = query(
          collection(db, 'businesses', businessId, 'transactions'),
          where('type', '==', 'payment'),
          where('relatedTransactionId', '==', transactionId)
        );
        const paymentsSnap = await getDocs(qPayments);

        const storePayments = (transactionStore.transactionsInStore?.value || []).filter(
          t => t.type === 'payment' && t.relatedTransactionId === transactionId
        );

        const paymentIdsToDelete = new Set();
        paymentsSnap.forEach(docSnap => paymentIdsToDelete.add(docSnap.id));
        storePayments.forEach(p => paymentIdsToDelete.add(p.uuid || p.id));

        console.log(`🗑️ [REVERT LIQUIDATION] Eliminando ${paymentIdsToDelete.size} pagos asociados al acopio ${acopioId}`);

        for (const paymentId of paymentIdsToDelete) {
          try {
            await deleteDoc(doc(db, 'businesses', businessId, 'transactions', paymentId));
            console.log(`  ✅ [REVERT LIQUIDATION] Pago ${paymentId} eliminado de Firestore`);
          } catch (pErr) {
            console.error(`  ❌ Error al eliminar pago ${paymentId}:`, pErr);
          }

          // Eliminar del store local reactivo
          if (Array.isArray(transactionStore.transactionsInStore?.value)) {
            const pIdx = transactionStore.transactionsInStore.value.findIndex(
              t => t.uuid === paymentId || t.id === paymentId
            );
            if (pIdx !== -1) {
              transactionStore.transactionsInStore.value.splice(pIdx, 1);
            }
          }
        }

        // 3. Restaurar la transacción original de egreso a estado 'pending' con balance completo
        const initialPaymentEntry = {
          uuid: uuidv4(),
          amount: 0,
          isInitial: true,
          date: new Date(),
          account: 'cash',
          notes: 'Acopio a crédito (liquidación anulada)'
        };

        const txRef = doc(db, 'businesses', businessId, 'transactions', transactionId);
        const txSnap = await getDoc(txRef);
        if (txSnap.exists()) {
          await updateDoc(txRef, {
            payments: [initialPaymentEntry],
            totalPaid: 0,
            balance: totalAmount,
            paymentStatus: 'pending',
            updatedAt: serverTimestamp()
          });
          console.log(`✅ [REVERT LIQUIDATION] Transacción ${transactionId} reabierta con balance S/ ${totalAmount}`);
        }

        // Actualizar en memoria en transactionStore
        if (Array.isArray(transactionStore.transactionsInStore?.value)) {
          const tIdx = transactionStore.transactionsInStore.value.findIndex(
            t => t.uuid === transactionId || t.id === transactionId
          );
          if (tIdx !== -1) {
            transactionStore.transactionsInStore.value[tIdx] = {
              ...transactionStore.transactionsInStore.value[tIdx],
              payments: [initialPaymentEntry],
              totalPaid: 0,
              balance: totalAmount,
              paymentStatus: 'pending'
            };
          }
        }
      }

      // 4. Actualizar el documento de acopio a estado 'pending'
      await updateDoc(acopioRef, {
        status: 'pending',
        updatedAt: serverTimestamp()
      });
      console.log(`✅ [REVERT LIQUIDATION] Acopio ${acopioId} restaurado a status: pending`);

      // 5. Recalcular metadata de deudas del socio
      if (supplierId) {
        await supplierStore.updateSupplierMetadata(supplierId);
        console.log(`✅ [REVERT LIQUIDATION] Metadata del socio ${supplierId} actualizada`);
      }

      // 6. Recargar dailySummary / balance reactivo si está disponible
      try {
        const { useAccountsBalanceStore } = await import('@/stores/AccountsBalanceApp/accountsBalanceStore');
        const accountsBalanceStore = useAccountsBalanceStore();
        if (accountsBalanceStore.loadFromDailySummary) {
          await accountsBalanceStore.loadFromDailySummary();
        }
      } catch (balErr) {
        console.warn('⚠️ No se pudo recargar accountsBalanceStore tras anular liquidación:', balErr);
      }

      return true;
    } catch (error) {
      console.error('❌ Error al anular liquidación del acopio:', error);
      throw error;
    }
  };

  return {
    saveAcopio,
    getAcopiosListener,
    updateAcopioPriceAndExpense,
    deleteAcopio,
    revertAcopioLiquidation
  };
}
