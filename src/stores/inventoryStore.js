import { ref } from "vue";
import { useInventory } from "@/composables/useInventory";

const allItemsInInventory = ref([]); // Lista reactiva para almacenar los ítems

const itemToAddToInventory = ref({}); // Ítem a agregar al inventario


export function useInventoryStore() {
  const { getAllItemsInInventory, createItem } = useInventory();

  // Obtener los ítems en inventario
  const getItemsInInventory = async () => {
    try {
      // TODO Aquí la funcion getAllItemsInInventory deberá de pasar el businessId que vendra desde el store de businessStore.js y no de manera estatica porque ahora tiene el valor de 'ferrercard'
      const items = await getAllItemsInInventory(); // Esperar los datos
      allItemsInInventory.value = items; // Almacenar en la lista reactiva
      console.log("Items fetched successfully desde useInventoryStore.js");
    } catch (error) {
      console.error("Error fetching items: ", error);
    }
  };

  const addItemToInventoryFromArryOfItemsNewOrOld = async (itemsList) => {
    try {
      for (const item of itemsList) {
        if (item.oldOrNewProduct === "new") {
          await createItem(item, 'ferrercard');
        }
      }
    }
    catch (error) {
      console.error('Error adding item:', error);
    }
  }

  const addStockLogInInventory = async (stockLog) => {
    try {
      await createStockLog(stockLog);
    } catch (error) {
      console.error('Error adding stock log:', error);
    }
  }

  return {
    allItemsInInventory,
    itemToAddToInventory,
    getItemsInInventory,
    addStockLogInInventory,
    addItemToInventoryFromArryOfItemsNewOrOld

  };
}