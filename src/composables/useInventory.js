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

import { useBusinessStore } from '@/stores/businessStore';

const businessStore = useBusinessStore();
const businessId = businessStore.currentBusinessId;


import { v4 as uuidv4 } from 'uuid';

const db = getFirestore(appFirebase);

export function useInventory() {

  const createItem = async (item) => {
    try {
      const productRef = doc(db, `business/${businessId}/products`, item.uuid);
      await setDoc(productRef, {
        description: item.description,
        price: item.price,
        cost: null,
        stock: item.quantity || 0,
        createdAt: serverTimestamp(),
      });
      console.log("Item created successfully");
    } catch (error) {
      console.error("Error creating item: ", error);
      throw error;
    }
  };

  const createStockLog = async (item) => {
    try {

      const stockLog = {
        uuid: uuidv4(),
        quantity: item.quantity,
        type: 'sell',
      }

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
      console.log('transactionDataById: ', transactionDataById[0]);

      for (const pairOfTransactionAndStockLog of transactionDataById[0].itemsAndStockLogs) {

        const itemUuid = pairOfTransactionAndStockLog.itemUuid;
        const stockLogUuid = pairOfTransactionAndStockLog.stockLogUuid;

        const itemRef = doc(db, `business/${businessId}/products`, itemUuid);
        const itemDoc = await getDoc(itemRef);
        if (!itemDoc.exists()) {
          throw new Error(`Item with UUID ${itemUuid} does not exist`);
        }
        const itemData = itemDoc.data();

        const stockLog = itemData.stockLog.filter(log => log.uuid == stockLogUuid)[0];

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
  }

  const updateStock = async (productRef, stockLog) => {



    try {
      const itemDoc = await getDoc(productRef);
      const itemData = itemDoc.data();
      console.log(stockLog);

      let newStock = null;


      if (stockLog.type === 'sell') {
        if (stockLog.quantity > itemData.stock) {
          // throw new Error('Not enough stock to sell');
          return;
        } else {
          console.log(stockLog);
          newStock = itemData.stock - stockLog.quantity;

          if (newStock < 0) {
            newStock = 0;
          }
          console.log('newStock: ', newStock);
          await updateDoc(productRef, {
            stock: newStock
          });
        }
      }

      if (stockLog.type === 'buy') {
        newStock = itemData.stock + stockLog.quantity;
        console.log('newStock: ', newStock);

        await updateDoc(productRef, {
          stock: newStock
        });
      }

      if (stockLog.type === 'return') {
        newStock = itemData.stock + stockLog.quantity;
        console.log('newStock: ', newStock);
        await updateDoc(productRef, {
          stock: newStock
        });
      }

      console.log('Stock updated successfully');
    } catch (error) {
      console.error('Error updating stock: ', error);
      throw error;
    }
  }

  // Obtener todos los ítems en inventario
  const getAllItemsInInventory = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'business', businessId, 'products'));
      if (querySnapshot.empty) {
        return []; // Retorna un array vacío si no hay datos
      } else {
        let items = [];
        querySnapshot.forEach((doc) => {
          let productData = {
            uuid: doc.id,
            ...doc.data(),
          };
          items.push(productData);
        });
        console.log("Items fetched successfully desde useInventory.js");
        return items; // Retorna el array de productos
      }
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
