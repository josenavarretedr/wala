import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import appFirebase from "@/firebaseInit";

const db = getFirestore(appFirebase);

export function useInventory() {
  // Crear un nuevo ítem
  const createItem = async (item) => {
    try {
      const docRef = await addDoc(
        collection(db, "businesses", item.businessId, "products"),
        {
          ...item,
          createdAt: serverTimestamp(),
        }
      );
      return docRef.id;
    } catch (error) {
      console.error("Error creating item: ", error);
      throw error;
    }
  };

  // Obtener todos los ítems en inventario
  const getAllItemsInInventory = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));

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
        return items; // Retorna el array de productos
      }
    } catch (error) {
      console.error("Error fetching items: ", error);
      throw error;
    }
  };

  return {
    createItem,
    getAllItemsInInventory,
  };
}
