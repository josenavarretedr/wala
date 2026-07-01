import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  query,
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

const db = getFirestore(appFirebase);

export function useAcopios() {
  const { createTransaction, updateTransaction } = useTransaccion();
  const { createStockLog } = useInventory();
  const supplierStore = useSupplierStore();

  const saveAcopio = async (acopioData) => {
    try {
      const businessId = ensureBusinessId();
      if (!businessId) throw new Error('No hay negocio activo');

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
        payments: [],
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
        oldOrNewProduct: 'old'
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

      // 5. Actualizar el costo del producto
      const productRef = doc(db, `businesses/${businessId}/products`, acopioData.productId);
      await updateDoc(productRef, {
        cost: newPriceNum,
        updatedAt: serverTimestamp()
      });

      // 6. Actualizar metadata del proveedor
      await supplierStore.updateSupplierMetadata(acopioData.supplierId);

      console.log(`✅ Acopio y registros asociados actualizados a nuevo precio S/ ${newPriceNum}`);
      return true;
    } catch (error) {
      console.error('Error al actualizar precio del acopio:', error);
      throw error;
    }
  };

  return {
    saveAcopio,
    getAcopiosListener,
    updateAcopioPriceAndExpense
  };
}
