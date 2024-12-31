import { ref } from "vue";
import { useInventory } from "@/composables/useInventory";

const allItemsInInventory = ref([]); // Lista reactiva para almacenar los ítems

const itemToAddToInventory = ref({}); // Ítem a agregar al inventario


export function useInventoryStore() {
  const { getAllItemsInInventory, addItemToInventoryCmpsb } = useInventory();

  // Obtener los ítems en inventario
  const getItemsInInventory = async () => {
    try {
      const items = await getAllItemsInInventory(); // Esperar los datos
      allItemsInInventory.value = items; // Almacenar en la lista reactiva
    } catch (error) {
      console.error("Error fetching items: ", error);
    }
  };

  const addItemToInventory = async (item) => {
    try {
      const itemId = await addItemToInventoryCmpsb(item);
    }
    catch (error) {
      console.error('Error adding item:', error);
    }
  }

  return {
    allItemsInInventory,
    itemToAddToInventory,
    getItemsInInventory,
    addItemToInventory

  };
}