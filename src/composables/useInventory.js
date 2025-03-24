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
  const createItem = async (item) => {
    try {
      const businessId = ensureBusinessId();

      // const productRef = doc(db, 'business', businessId, 'products', item.uuid);

      const productRef = doc(collection(db, `business/${businessId}/products`), item.uuid);
      await setDoc(productRef, {
        description: item.description,
        price: item.price,
        cost: null,
        stock: item.quantity || 0,
        createdAt: serverTimestamp(),
      });
      console.log('BusinessId', businessId);
      console.log("Item created successfully", item);
    } catch (error) {
      console.error("Error creating item: ", error);
      throw error;
    }
  };

  const createStockLog = async (item) => {
    try {
      const businessId = ensureBusinessId();

      const stockLog = {
        uuid: uuidv4(),
        quantity: item.quantity,
        type: 'sell',
      };

      const productRef = doc(db, `business/${businessId}/products`, item.uuid);

      await updateDoc(productRef, {
        stockLog: arrayUnion({ ...stockLog, createdAt: new Date() }),
      });

      await updateStock(productRef, stockLog);

      console.log('Stock log created successfully');
      return stockLog.uuid;

    } catch (error) {
      console.error('Error creating stock log: ', error);
      throw error;
    }
  };

  const deleteStockLog = async (transactionDataById) => {
    try {
      const businessId = ensureBusinessId();


      for (const pair of transactionDataById[0].itemsAndStockLogs) {
        const itemUuid = pair.itemUuid;
        const stockLogUuid = pair.stockLogUuid;

        const itemRef = doc(db, `business/${businessId}/products`, itemUuid);
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

  const updateStock = async (productRef, stockLog) => {
    try {
      const itemDoc = await getDoc(productRef);
      const itemData = itemDoc.data();

      let newStock = null;

      if (stockLog.type === 'sell') {
        if (stockLog.quantity > itemData.stock) return;

        newStock = Math.max(itemData.stock - stockLog.quantity, 0);
      }

      if (stockLog.type === 'buy' || stockLog.type === 'return') {
        newStock = itemData.stock + stockLog.quantity;
      }

      await updateDoc(productRef, { stock: newStock });
      console.log('Stock updated successfully');
    } catch (error) {
      console.error('Error updating stock: ', error);
      throw error;
    }
  };

  const getAllItemsInInventory = async () => {
    try {
      const businessId = ensureBusinessId();

      const querySnapshot = await getDocs(collection(db, 'business', businessId, 'products'));
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

  return {
    createItem,
    createStockLog,
    deleteStockLog,
    getAllItemsInInventory,
  };
}
