// inventoryStore.js
import { ref } from "vue";
import { useInventory } from "@/composables/useInventory";
import { useTraceability } from "@/composables/useTraceability";

const allItemsInInventory = ref([]); // Lista reactiva para almacenar los ítems

const itemToAddToInventory = ref({}); // Ítem a agregar al inventario


export function useInventoryStore() {
  const { getAllItemsInInventory, createItem, createStockLog, getProductById, updateProduct } = useInventory();
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
        // Verificar si el producto "old" realmente existe
        if (item.oldOrNewProduct === "old") {
          const productId = item.uuid || item.selectedProductUuid;

          // Buscar el producto en Firestore
          const productExists = await getProductById(productId);

          if (!productExists) {
            // Si no existe, convertir a "new"
            console.warn(
              `⚠️ Producto ${productId} marcado como "old" pero no existe. ` +
              `Convirtiendo a "new" automáticamente.`,
              { description: item.description, productId }
            );

            item.oldOrNewProduct = "new";

            // Log de trazabilidad para el cambio
            await operationChain.addStep('update', 'inventory', productId, {
              reason: 'auto_convert_old_to_new',
              severity: 'medium',
              tags: ['inventory_validation', 'auto_correction', 'data_integrity'],
              previousState: { oldOrNewProduct: 'old' },
              newState: { oldOrNewProduct: 'new' },
              metadata: {
                reason: 'Product marked as "old" but does not exist in Firestore'
              }
            });
          }
        }

        if (item.oldOrNewProduct === "new") {
          // === TRAZABILIDAD: Log de cada item nuevo ===
          await operationChain.addStep('create', 'inventory', item.uuid || item.selectedProductUuid, {
            newState: item,
            reason: 'new_product_addition',
            severity: 'medium',
            tags: ['inventory_creation', 'new_product', 'bulk_operation']
          });

          await createItem(item, 'MERCH'); // Asumimos tipo 'MERCH' para nuevos ítems
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

  const addStockLogInInventory = async (stockLog, typeStockLog = 'sell') => {
    try {
      // === TRAZABILIDAD: Log de creación de stock log ===
      const traceId = await logCreate(
        'stock_log',
        stockLog.logId || stockLog.uuid,
        { ...stockLog, type: typeStockLog },
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

      await createStockLog(stockLog, typeStockLog);
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

  const saveInventoryCount = async (countData) => {
    const operationChain = startOperationChain('inventory_count_adjustment');

    try {
      const { productId, productData, physicalStock, digitalStock, difference } = countData;

      // Validaciones estrictas
      if (!productId) {
        throw new Error('productId es requerido');
      }

      if (physicalStock === null || physicalStock === undefined) {
        throw new Error('physicalStock no puede ser null o undefined');
      }

      if (digitalStock === null || digitalStock === undefined) {
        throw new Error('digitalStock no puede ser null o undefined');
      }

      // Validar difference (puede ser 0, positivo o negativo)
      if (difference === null || difference === undefined) {
        throw new Error('difference no puede ser null o undefined');
      }

      console.log('💾 Datos de conteo validados:', {
        productId,
        physicalStock,
        digitalStock,
        difference,
        hasDifference: difference !== 0
      });

      // === TRAZABILIDAD: Iniciar cadena de operación ===
      const operationType = difference === 0 ? 'verification' : 'adjustment';
      await operationChain.addStep('update', 'inventory', productId, {
        oldState: { stock: digitalStock },
        newState: { stock: physicalStock },
        reason: difference === 0 ? 'inventory_count_verification' : 'inventory_count_adjustment',
        severity: difference === 0 ? 'low' : 'high',
        tags: ['inventory_count', operationType, 'physical_verification'],
        metadata: {
          difference,
          adjustmentType: difference > 0 ? 'surplus' : difference < 0 ? 'shortage' : 'verified',
          verificationDate: new Date().toISOString()
        }
      });

      // Crear el stock log de tipo 'count'
      const stockLogData = {
        uuid: productId,
        quantity: Math.abs(difference), // Valor absoluto de la diferencia
        cost: productData?.cost || null,
        price: productData?.price || null,
        physicalStock: Number(physicalStock),
        digitalStock: Number(digitalStock),
        difference: Number(difference),
        adjustmentType: difference > 0 ? 'surplus' : difference < 0 ? 'shortage' : 'verified'
      };

      console.log('📦 StockLog a crear:', stockLogData);

      // Guardar el stock log
      await createStockLog(stockLogData, 'count');

      // === TRAZABILIDAD: Finalizar operación ===
      await operationChain.finish({
        reason: 'inventory_count_completed',
        metadata: {
          productId,
          productDescription: productData?.description,
          previousStock: digitalStock,
          newStock: physicalStock,
          adjustment: difference,
          adjustmentType: difference > 0 ? 'surplus' : 'shortage',
          relatedEntities: [
            { type: 'inventory', id: productId, relationship: 'stock_adjusted' }
          ]
        }
      });

      console.log('✅ Inventory count saved successfully:', {
        productId,
        adjustment: difference,
        newStock: physicalStock
      });

      return { success: true, adjustment: difference };

    } catch (error) {
      console.error('❌ Error saving inventory count:', error);

      // === TRAZABILIDAD: Log de error ===
      await operationChain.addStep('error', 'inventory', 'count_operation', {
        newState: { error: error.message },
        reason: 'inventory_count_failed',
        severity: 'high',
        tags: ['inventory_error', 'count_failure', 'adjustment_error']
      });

      throw error;
    }
  };

  const updateProductDetails = async (productId, updatedData) => {
    const operationChain = startOperationChain('product_update');

    try {
      // === TRAZABILIDAD: Log de actualización ===
      await operationChain.addStep('update', 'inventory', productId, {
        oldState: { ...updatedData }, // Se debería pasar el estado anterior
        newState: updatedData,
        reason: 'product_information_update',
        severity: 'medium',
        tags: ['product_update', 'inventory_management'],
        metadata: {
          updatedFields: Object.keys(updatedData)
        }
      });

      const result = await updateProduct(productId, updatedData);

      // === TRAZABILIDAD: Finalizar operación ===
      await operationChain.finish({
        reason: 'product_update_completed',
        metadata: {
          productId,
          updatedFields: Object.keys(updatedData),
          relatedEntities: [
            { type: 'inventory', id: productId, relationship: 'updated' }
          ]
        }
      });

      console.log('✅ Product updated successfully with traceability');
      return result;

    } catch (error) {
      console.error('❌ Error updating product:', error);

      // === TRAZABILIDAD: Log de error ===
      await operationChain.addStep('error', 'inventory', productId, {
        newState: { error: error.message },
        reason: 'product_update_failed',
        severity: 'high',
        tags: ['product_error', 'update_failure']
      });

      throw error;
    }
  };

  return {
    allItemsInInventory,
    itemToAddToInventory,
    getItemsInInventory,
    getProductDetails,
    addStockLogInInventory,
    addItemToInventoryFromArryOfItemsNewOrOld,
    saveInventoryCount,
    updateProduct: updateProductDetails,
  };
}