// inventoryStore.js
import { ref } from "vue";
import { useInventory } from "@/composables/useInventory";
import { useTraceability } from "@/composables/useTraceability";

const allItemsInInventory = ref([]); // Lista reactiva para almacenar los ítems

const itemToAddToInventory = ref({}); // Ítem a agregar al inventario


export function useInventoryStore() {
  const { getAllItemsInInventory, createItem, createStockLog, getProductById } = useInventory();
  const { logInventoryOperation, logCreate, startOperationChain } = useTraceability();

  // Obtener los ítems en inventario
  const getItemsInInventory = async () => {
    try {
      // === TRAZABILIDAD: Log de acceso a inventario ===
      await logInventoryOperation(
        'read',
        'all_inventory_items',
        { action: 'fetch_inventory' },
        {},
        {
          reason: 'inventory_data_access',
          severity: 'low',
          tags: ['data_read', 'inventory_list'],
          component: 'InventoryStore.getItemsInInventory'
        }
      );

      const items = await getAllItemsInInventory(); // Esperar los datos
      allItemsInInventory.value = items; // Almacenar en la lista reactiva

      console.log("✅ Items fetched successfully with traceability from useInventoryStore.js");

    } catch (error) {
      console.error("❌ Error fetching items:", error);

      // === TRAZABILIDAD: Log de error ===
      await logInventoryOperation(
        'error',
        'all_inventory_items',
        { error: error.message },
        {},
        {
          reason: 'inventory_fetch_failed',
          severity: 'medium',
          tags: ['data_error', 'fetch_failure', 'inventory'],
          component: 'InventoryStore.getItemsInInventory'
        }
      );
    }
  };

  const addItemToInventoryFromArryOfItemsNewOrOld = async (itemsList) => {
    const operationChain = startOperationChain('bulk_add_inventory_items');

    try {
      let addedItemsCount = 0;
      const relatedEntities = [];

      for (const item of itemsList) {
        if (item.oldOrNewProduct === "new") {
          // === TRAZABILIDAD: Log de cada item nuevo ===
          await operationChain.addStep('create', 'inventory', item.uuid || item.selectedProductUuid, {
            newState: item,
            reason: 'new_product_addition',
            severity: 'medium',
            tags: ['inventory_creation', 'new_product', 'bulk_operation']
          });

          await createItem(item, 'ferrercard');
          addedItemsCount++;

          relatedEntities.push({
            type: 'inventory',
            id: item.uuid || item.selectedProductUuid,
            relationship: 'created'
          });
        }
      }

      // === TRAZABILIDAD: Finalizar operación bulk ===
      await operationChain.finish({
        reason: 'bulk_inventory_addition_completed',
        metadata: {
          totalProcessed: itemsList.length,
          newItemsAdded: addedItemsCount,
          relatedEntities
        }
      });

      console.log(`✅ Bulk inventory operation completed: ${addedItemsCount} new items added`);

    } catch (error) {
      console.error('❌ Error in bulk inventory operation:', error);

      // === TRAZABILIDAD: Log de error en operación bulk ===
      await operationChain.addStep('error', 'inventory', 'bulk_operation', {
        newState: { error: error.message },
        reason: 'bulk_inventory_addition_failed',
        severity: 'high',
        tags: ['inventory_error', 'bulk_operation', 'creation_failure']
      });

      throw error;
    }
  }

  const addStockLogInInventory = async (stockLog) => {
    try {
      // === TRAZABILIDAD: Log de creación de stock log ===
      const traceId = await logCreate(
        'stock_log',
        stockLog.logId || stockLog.uuid,
        stockLog,
        {
          reason: 'stock_log_creation',
          severity: 'medium',
          tags: ['stock_log', 'inventory_tracking'],
          component: 'InventoryStore.addStockLogInInventory',
          relatedEntities: [
            { type: 'inventory', id: stockLog.itemId, relationship: 'stock_logged' },
            { type: 'transaction', id: stockLog.transactionId, relationship: 'generates_stock_log' }
          ]
        }
      );

      await createStockLog(stockLog);
      console.log('✅ Stock log added with traceId:', traceId);

    } catch (error) {
      console.error('❌ Error adding stock log:', error);

      // === TRAZABILIDAD: Log de error ===
      await logInventoryOperation(
        'error',
        stockLog.itemId || 'unknown',
        { error: error.message },
        {},
        {
          reason: 'stock_log_creation_failed',
          severity: 'high',
          tags: ['stock_log_error', 'creation_failure'],
          component: 'InventoryStore.addStockLogInInventory'
        }
      );

      throw error;
    }
  }

  const getProductDetails = async (productId) => {
    try {
      // === TRAZABILIDAD: Log de acceso a detalles de producto ===
      await logInventoryOperation(
        'read',
        productId,
        { action: 'fetch_product_details' },
        {},
        {
          reason: 'product_details_access',
          severity: 'low',
          tags: ['data_read', 'product_details'],
          component: 'InventoryStore.getProductDetails'
        }
      );

      const product = await getProductById(productId);

      console.log("✅ Product details fetched successfully with traceability");
      return product;

    } catch (error) {
      console.error("❌ Error fetching product details:", error);

      // === TRAZABILIDAD: Log de error ===
      await logInventoryOperation(
        'error',
        productId,
        { error: error.message },
        {},
        {
          reason: 'product_details_fetch_failed',
          severity: 'medium',
          tags: ['data_error', 'fetch_failure', 'product_details'],
          component: 'InventoryStore.getProductDetails'
        }
      );

      throw error;
    }
  };

  return {
    allItemsInInventory,
    itemToAddToInventory,
    getItemsInInventory,
    getProductDetails,
    addStockLogInInventory,
    addItemToInventoryFromArryOfItemsNewOrOld
  };
}