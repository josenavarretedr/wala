import {
  getFirestore,
  collection,
  getDocs,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
  arrayUnion,
  increment
} from "firebase/firestore";
import appFirebase from "@/firebaseInit";

import { v4 as uuidv4 } from 'uuid';

const db = getFirestore(appFirebase);

export function useInventory() {
  // Crear un nuevo ítem
  const createItem = async (item, businessId) => {
    try {

      const productRef = doc(db, `businesses/${businessId}/products`, item.uuid);
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

  const createStockLog = async (item, businessId = 'ferrercard') => {
    try {

      const stockLog = {
        uuid: uuidv4(),
        quantity: item.quantity,
        type: 'sell',
      }

      const productRef = doc(db, `businesses/${businessId}/products`, item.uuid);

      await updateDoc(productRef, {
        stockLog: arrayUnion({ ...stockLog, createdAt: new Date() }),
      });

      await updateStock(productRef, stockLog);

      console.log('Stock log created successfully');
    } catch (error) {
      console.error('Error creating stock log: ', error);
      throw error;
    }
  };

  const updateStock = async (productRef, stockLog) => {
    try {
      if (stockLog.type === 'sell') {
        await updateDoc(productRef, {
          stock: increment(-stockLog.quantity)
        });
      }

      if (stockLog.type === 'buy') {
        await updateDoc(productRef, {
          stock: increment(stockLog.quantity)
        });
      }

      console.log('Stock updated successfully');
    } catch (error) {
      console.error('Error updating stock: ', error);
      throw error;
    }
  }

  // Obtener todos los ítems en inventario
  const getAllItemsInInventory = async (businessId = "ferrercard") => {
    try {
      const querySnapshot = await getDocs(collection(db, 'businesses', businessId, 'products'));
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
    getAllItemsInInventory,
  };
}
