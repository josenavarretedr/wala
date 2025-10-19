// useInventory.js

import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import appFirebase from "@/firebaseInit";

import { ensureBusinessId } from "@/composables/useBusinessUtils";
import { v4 as uuidv4 } from 'uuid';

const db = getFirestore(appFirebase);

export function useInventory() {
  const createItem = async (item, type = 'MERCH') => {
    try {
      const businessId = ensureBusinessId();

      if (!businessId) {
        console.warn('No se puede crear item sin businessId activo');
        return null;
      }

      // const productRef = doc(db, 'business', businessId, 'products', item.uuid);
      let trackStock = false;

      if (type === 'MERCH' || type === 'RAW_MATERIAL') {
        trackStock = true;
      }

      const productRef = doc(collection(db, `businesses/${businessId}/products`), item.uuid);
      const itemDescriptionNormalized = item.description.trim().toUpperCase();
      await setDoc(productRef, {
        description: itemDescriptionNormalized,
        price: item.price,
        cost: null,
        stock: item.quantity || 0,
        createdAt: serverTimestamp(),
        unit: item.unit || 'uni',
        type,
        trackStock,
      });
      console.log('BusinessId', businessId);
      console.log("Item created successfully", item);
    } catch (error) {
      console.error("Error creating item: ", error);
      throw error;
    }
  };

  const createStockLog = async (item, typeStockLog = 'sell') => {
    try {
      const businessId = ensureBusinessId();

      if (!businessId) {
        console.warn('No se puede crear stock log sin businessId activo');
        return null;
      }

      const stockLog = {
        uuid: uuidv4(),
        quantity: item.quantity,
        type: typeStockLog,
      };

      // Siempre registrar cost y price para todos los movimientos
      // Esto permite tener histórico completo y análisis de rentabilidad

      // Registrar cost (costo del producto)
      if (item.cost !== undefined && item.cost !== null) {
        stockLog.cost = Number(item.cost);
      }

      // Registrar price (precio de venta/transacción)
      if (item.price !== undefined && item.price !== null) {
        stockLog.price = Number(item.price);
      }

      // Agregar referencia a la transacción si existe
      if (item.transactionId) {
        stockLog.transactionId = item.transactionId;
      }

      // Para conteos de inventario, agregar campos adicionales
      if (typeStockLog === 'count') {
        if (item.physicalStock !== undefined && item.physicalStock !== null) {
          stockLog.physicalStock = Number(item.physicalStock);
        }
        if (item.digitalStock !== undefined && item.digitalStock !== null) {
          stockLog.digitalStock = Number(item.digitalStock);
        }
        if (item.difference !== undefined && item.difference !== null) {
          stockLog.difference = Number(item.difference);
        }
        if (item.adjustmentType) {
          stockLog.adjustmentType = item.adjustmentType;
        }
      }

      const productRef = doc(db, `businesses/${businessId}/products`, item.uuid);

      // Verificar si el producto existe antes de actualizar
      const productDoc = await getDoc(productRef);

      if (!productDoc.exists()) {
        console.error('❌ Error: El producto no existe en Firestore', {
          productId: item.uuid,
          businessId,
          productDescription: item.description || 'N/A',
          typeStockLog,
          itemData: item
        });
        throw new Error(
          `El producto "${item.description || item.uuid}" no existe en Firestore.\n` +
          `ID: ${item.uuid}\n` +
          `Business: ${businessId}\n\n` +
          `Posibles causas:\n` +
          `1. El producto fue marcado como "old" pero nunca fue creado\n` +
          `2. El producto fue eliminado previamente\n` +
          `3. Error en la sincronización de datos\n\n` +
          `Solución: Verifica que el producto exista antes de crear stock logs, ` +
          `o márcalo como "new" si es la primera vez que se usa.`
        );
      }

      await updateDoc(productRef, {
        stockLog: arrayUnion({ ...stockLog, createdAt: new Date() }),
      });

      // Pasar quantityForStock si existe para ajustar el stock correctamente
      await updateStock(productRef, stockLog, item.quantityForStock);

      console.log('✅ Stock log created successfully:', {
        uuid: stockLog.uuid,
        type: typeStockLog,
        quantity: item.quantity,
        cost: stockLog.cost,
        price: stockLog.price,
        transactionId: stockLog.transactionId,
        ...(typeStockLog === 'count' && {
          physicalStock: stockLog.physicalStock,
          digitalStock: stockLog.digitalStock,
          difference: stockLog.difference,
          adjustmentType: stockLog.adjustmentType
        })
      });

      return stockLog.uuid;

    } catch (error) {
      console.error('Error creating stock log: ', error);
      throw error;
    }
  };

  const deleteStockLog = async (transactionDataById) => {
    try {
      const businessId = ensureBusinessId();

      if (!businessId) {
        console.warn('No se puede eliminar stock log sin businessId activo');
        return null;
      }


      for (const pair of transactionDataById[0].itemsAndStockLogs) {
        const itemUuid = pair.itemUuid;
        const stockLogUuid = pair.stockLogUuid;

        const itemRef = doc(db, `businesses/${businessId}/products`, itemUuid);
        const itemDoc = await getDoc(itemRef);
        if (!itemDoc.exists()) {
          throw new Error(`Item with UUID ${itemUuid} does not exist`);
        }

        const itemData = itemDoc.data();

        const stockLog = itemData.stockLog.find(log => log.uuid == stockLogUuid);
        stockLog.type = 'return';

        const updatedStockLog = itemData.stockLog.filter(log => log.uuid !== stockLogUuid);

        await updateDoc(itemRef, {
          stockLog: updatedStockLog
        });

        await updateStock(itemRef, stockLog);
      }

    } catch (error) {
      console.error('Error deleting stock log: ', error);
      throw error;
    }
  };

  const updateStock = async (productRef, stockLog, quantityForStock = undefined) => {
    try {
      const itemDoc = await getDoc(productRef);
      const itemData = itemDoc.data();

      let newStock = null;
      const updateData = {};

      if (stockLog.type === 'sell' || stockLog.type === 'waste') {
        // Usar quantityForStock si está disponible (venta con stock insuficiente)
        // De lo contrario, usar la cantidad del stockLog
        const quantityToDeduct = quantityForStock !== undefined ? quantityForStock : stockLog.quantity;

        // Si la cantidad a deducir es mayor al stock, solo deducir lo disponible
        if (quantityToDeduct > itemData.stock) {
          newStock = 0; // Stock no puede ser negativo
          console.log('⚠️ Cantidad a deducir mayor al stock disponible:', {
            cantidadSolicitada: stockLog.quantity,
            cantidadADeducir: quantityToDeduct,
            stockDisponible: itemData.stock,
            stockFinal: 0
          });
        } else {
          newStock = itemData.stock - quantityToDeduct;
        }
      }

      if (stockLog.type === 'buy' || stockLog.type === 'return') {
        newStock = itemData.stock + stockLog.quantity;

        // Si es una compra y viene un nuevo costo, actualizarlo
        if (stockLog.type === 'buy' && stockLog.cost !== undefined && stockLog.cost !== null) {
          updateData.cost = Number(stockLog.cost);
          console.log(`💰 Actualizando costo del producto a: S/ ${stockLog.cost}`);
        }
      }

      // Manejo especial para conteo de inventario (type: 'count')
      if (stockLog.type === 'count') {
        // Para conteos, el stock se establece directamente al valor físico contado
        if (stockLog.physicalStock === undefined || stockLog.physicalStock === null) {
          console.error('❌ Error: physicalStock es undefined o null', stockLog);
          throw new Error('physicalStock no puede ser undefined o null en un conteo de inventario');
        }

        newStock = Number(stockLog.physicalStock);
        console.log(`📊 Ajuste por conteo de inventario:`, {
          stockAnterior: itemData.stock,
          stockFisico: newStock,
          diferencia: stockLog.difference,
          tipoAjuste: stockLog.adjustmentType
        });
      }

      // Validar que newStock no sea null o undefined antes de actualizar
      if (newStock === null || newStock === undefined) {
        console.error('❌ Error: newStock es null o undefined', {
          type: stockLog.type,
          stockLog
        });
        throw new Error(`No se pudo calcular el nuevo stock para el tipo: ${stockLog.type}`);
      }

      // Actualizar stock (siempre)
      updateData.stock = Number(newStock);

      await updateDoc(productRef, updateData);
      console.log('✅ Stock updated successfully:', newStock);

      if (updateData.cost !== undefined) {
        console.log(`✅ Stock y costo actualizados: ${newStock} unidades, S/ ${updateData.cost}`);
      }
    } catch (error) {
      console.error('❌ Error updating stock: ', error);
      throw error;
    }
  };

  const getAllItemsInInventory = async () => {
    try {
      const businessId = ensureBusinessId();

      if (!businessId) {
        console.warn('No se puede obtener inventario sin businessId activo');
        return [];
      }

      const querySnapshot = await getDocs(collection(db, 'businesses', businessId, 'products'));
      if (querySnapshot.empty) return [];

      return querySnapshot.docs.map(doc => ({
        uuid: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching items: ", error);
      throw error;
    }
  };

  const getProductById = async (productId) => {
    try {
      const businessId = ensureBusinessId();

      if (!businessId) {
        console.warn('No se puede obtener producto sin businessId activo');
        return null;
      }

      const productRef = doc(db, 'businesses', businessId, 'products', productId);
      const productDoc = await getDoc(productRef);

      if (!productDoc.exists()) {
        console.warn(`Producto con ID ${productId} no encontrado`);
        return null;
      }

      return {
        uuid: productDoc.id,
        ...productDoc.data(),
      };
    } catch (error) {
      console.error("Error fetching product: ", error);
      throw error;
    }
  };

  const updateProduct = async (productId, updatedData) => {
    try {
      const businessId = ensureBusinessId();

      if (!businessId) {
        console.warn('No se puede actualizar producto sin businessId activo');
        return null;
      }

      const productRef = doc(db, 'businesses', businessId, 'products', productId);

      // Verificar si el producto existe
      const productDoc = await getDoc(productRef);
      if (!productDoc.exists()) {
        throw new Error(`Producto con ID ${productId} no existe`);
      }

      // Preparar datos de actualización
      const updatePayload = {};

      // Normalizar descripción si existe
      if (updatedData.description !== undefined) {
        updatePayload.description = updatedData.description.trim().toUpperCase();
      }

      // Actualizar precio si existe
      if (updatedData.price !== undefined && updatedData.price !== null) {
        updatePayload.price = Number(updatedData.price);
      }

      // Actualizar costo si existe
      if (updatedData.cost !== undefined && updatedData.cost !== null) {
        updatePayload.cost = Number(updatedData.cost);
      }

      // Actualizar unidad si existe
      if (updatedData.unit !== undefined) {
        updatePayload.unit = updatedData.unit;
      }

      // Actualizar tipo si existe
      if (updatedData.type !== undefined) {
        updatePayload.type = updatedData.type;
      }

      // Actualizar trackStock si existe
      if (updatedData.trackStock !== undefined) {
        updatePayload.trackStock = Boolean(updatedData.trackStock);
      }

      // Agregar timestamp de actualización
      updatePayload.updatedAt = serverTimestamp();

      await updateDoc(productRef, updatePayload);

      console.log('✅ Product updated successfully:', productId, updatePayload);
      return { success: true, productId, updatedFields: updatePayload };

    } catch (error) {
      console.error('❌ Error updating product:', error);
      throw error;
    }
  };

  return {
    createItem,
    createStockLog,
    deleteStockLog,
    getAllItemsInInventory,
    getProductById,
    updateProduct,
  };
}
