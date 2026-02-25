//  @/src/stores/transaction/transactionStore.js 

import { ref, computed } from 'vue';

import { useTransaccion } from '@/composables/useTransaction';
import { useInventory } from '@/composables/useInventory';
import { useTraceability } from '@/composables/useTraceability';
import { useExpenses } from '@/composables/useExpenses';
import { round2, multiplyMoney, addMoney, parseMoneyFloat, roundStock } from '@/utils/mathUtils';
import { serverTimestamp, Timestamp, getFirestore, doc, writeBatch } from 'firebase/firestore';
import { calculatePaymentStatus, validateNewPayment } from '@/utils/paymentCalculator';
import { ANONYMOUS_CLIENT_ID } from '@/types/client';
import { trackTransactionCreated, isValidTransactionForStreak } from '@/analytics';
import { ensureBusinessId } from '@/composables/useBusinessUtils';
import { useDailySummary } from '@/composables/useDailySummary';
// ⚡ FASE 3: Optimistic UI
import { useOptimisticSync } from '@/composables/useOptimisticSync';
import { useProductCache } from '@/composables/useProductCache';

import { v4 as uuidv4 } from "uuid";

import { useExpensesStore } from "@/stores/expensesStore"; // Importa el store de expenses
import { useInventoryStore } from "@/stores/inventoryStore"; // Importa el store de inventario
import { fromJSON } from 'postcss';
const expensesStore = useExpensesStore(); // Usa el store



const status = ref(null);
const transactionsInStore = ref([]);

const transactionToAdd = ref({
  uuid: null,
  type: null,      // 'income' o 'expense'
  account: null,
  // Campos para transacciones de ingreso:
  items: [],
  /**
   * itemsAndStockLogs: Relación entre items vendidos y sus stockLogs
   * Estructura extendida para soportar afectación de materiales en composición:
   * [
   *   {
   *     itemUuid: "prod-123",           // UUID del producto vendido
   *     stockLogUuid: "log-456",        // UUID del stockLog del producto
   *     materialStockLogs: [             // NUEVO: StockLogs de materiales en composición
   *       {
   *         materialId: "mat-001",       // UUID del material
   *         stockLogUuid: "log-789",     // UUID del stockLog del material
   *         quantityUsed: 0.15,          // Cantidad usada por unidad
   *         description: "CARNE MOLIDA"  // Nombre del material (denormalizado)
   *       }
   *     ]
   *   }
   * ]
   */
  itemsAndStockLogs: [],
  // NUEVOS CAMPOS PARA PAGOS PARCIALES Y CLIENTES:
  payments: [],           // Array de pagos realizados
  paymentStatus: 'completed',  // 'pending' | 'partial' | 'completed'
  totalPaid: 0,           // Calculado automáticamente
  balance: 0,             // Calculado automáticamente
  clientId: null,         // UUID del cliente o null para anónimo
  clientName: 'Cliente Anónimo', // Nombre denormalizado
  // Campos para transacciones de egreso:
  description: null,
  category: null,
  subcategory: null,
  amount: 0,
  notes: null, // Notas adicionales sobre el gasto
  expenseId: null, // ID del expense individual en Firestore
  oldOrNewExpense: null, // 'new' o 'old'
  // Campos para transacciones de egreso tipo 'materials':
  materialItems: [], // Array de materiales/insumos comprados
  materialItemsAndStockLogs: [], // Relación entre items y stockLogs
  // Campos para clasificación contable:
  paylabor: null,        // 'DIRECT_SERVICE' | 'PRODUCTION_SUPPORT' | 'ADMIN_SUPPORT'
  overheadUsage: null,   // 'PRODUCE' | 'ADMIN' | 'MIXED'
  bucket: null,          // 'DIRECT_MATERIAL' | 'COGS_RESALE' | 'DIRECT_LABOR' | 'MANUFACTURING_OH' | 'OVERHEAD'
  splits: null,          // Array de { bucket, amount, percentage } para overhead MIXED
  // Campos para transfers:
  fromAccount: null,
  toAccount: null,
});

const itemToAddInTransaction = ref({
  description: null,
  quantity: null,
  price: null,
  oldOrNewProduct: null,
  selectedProductUuid: null,
  unit: null,
  stock: null,
  trackStock: true, // ✅ true por defecto para productos MERCH
  proceedAnyway: false, // Flag para indicar que se procedió con stock insuficiente
  composition: null, // Composición de materiales del producto (si aplica)
  compositionStockValidation: null, // Resultado de validación de stock de materiales
  type: null, // Tipo de producto: MERCH, PRODUCT, SERVICE, RAW_MATERIAL
});

const itemToAddInExpenseMaterial = ref({
  description: null,
  quantity: null,
  cost: null, // Para gastos usamos 'cost' en lugar de 'price'
  oldOrNewProduct: null,
  selectedProductUuid: null,
  unit: null,
  stock: null,
  trackStock: true, // Por defecto los materiales tienen seguimiento
});


const currentStepOfAddTransaction = ref(0);

export function useTransactionStore() {
  const { createTransaction, updateTransaction, getAllTransactions, deleteTransactionByID, getTransactionsTodayCmps, getTransactionsByDay, getLastClosureTransactions } = useTransaccion();
  const { createStockLog, deleteStockLog, getProductById } = useInventory();
  const { logTransactionOperation, logInventoryOperation, startOperationChain } = useTraceability();

  // ⚡ FASE 3: Optimistic UI
  const { executeOptimistically } = useOptimisticSync();
  const { getProductCached, preloadProducts } = useProductCache();

  /**
   * Procesa los stockLogs de materiales en la composición de un producto
   * @param {string} productId - UUID del producto que contiene la composición
   * @param {number} quantitySold - Cantidad vendida del producto final
   * @param {string} transactionId - UUID de la transacción
   * @returns {Promise<Array>} Array de materialStockLogs creados
   */
  const processCompositionStockLogs = async (productId, quantitySold, transactionId) => {
    try {
      // Obtener el producto completo
      const product = await getProductById(productId);

      if (!product) {
        console.warn('⚠️ [COMPOSITION] Producto no encontrado:', productId);
        return [];
      }

      // Verificar si tiene composición
      if (!product.composition || !Array.isArray(product.composition) || product.composition.length === 0) {
        return [];
      }

      console.log('🧩 [COMPOSITION] Procesando stock de composición:', {
        productId,
        productName: product.description,
        quantitySold,
        materialsCount: product.composition.length
      });

      // ⚡ OPTIMIZACIÓN: Procesar materiales en paralelo
      const materialPromises = product.composition.map(async (material) => {
        try {
          const materialProductId = material.productId;
          const quantityPerUnit = parseFloat(material.quantity) || 0;
          // ✅ Aplicar redondeo para evitar decimales excesivos
          const totalQuantityNeeded = roundStock(quantityPerUnit * quantitySold);

          // Validar que el material existe
          const materialProduct = await getProductById(materialProductId);

          if (!materialProduct) {
            console.warn('⚠️ [COMPOSITION] Material no encontrado, saltando:', {
              materialId: materialProductId,
              description: material.description
            });
            return null; // Retornar null para filtrar después
          }

          // Solo procesar si el material tiene trackStock activado
          if (!materialProduct.trackStock) {
            console.log('ℹ️ [COMPOSITION] Material sin trackStock, saltando:', {
              materialId: materialProductId,
              description: materialProduct.description
            });
            return null; // Retornar null para filtrar después
          }

          // Crear el item para createStockLog
          const materialItem = {
            uuid: materialProductId,
            quantity: roundStock(totalQuantityNeeded), // ✅ Redondeo con mathUtils
            transactionId: transactionId,
            oldOrNewProduct: 'old', // Los materiales siempre deben existir
            description: materialProduct.description,
            unit: materialProduct.unit || 'uni',
            trackStock: true,
            cost: materialProduct.cost,
            price: materialProduct.price,
            relatedProductId: productId, // Vincular con el producto padre
            relatedTransactionType: 'income_composition' // Tipo especial para materiales de composición
          };

          console.log('  📦 Descontando material:', {
            material: materialProduct.description,
            quantityPerUnit,
            quantitySold,
            totalQuantity: materialItem.quantity,
            currentStock: materialProduct.stock
          });

          // Crear stockLog para el material
          const stockLogUuid = await createStockLog(materialItem, 'sell');

          console.log('  ✅ StockLog creado para material:', stockLogUuid);

          // Retornar objeto con información del material procesado
          return {
            materialId: materialProductId,
            stockLogUuid: stockLogUuid,
            quantityUsed: materialItem.quantity,
            description: materialProduct.description
          };

        } catch (materialError) {
          console.error('❌ [COMPOSITION] Error procesando material:', {
            materialId: material.productId,
            error: materialError.message
          });
          return null; // Continuar con otros materiales
        }
      });

      // Ejecutar en paralelo y filtrar resultados nulos
      const results = await Promise.all(materialPromises);
      const materialStockLogs = results.filter(result => result !== null);

      console.log(`✅ [COMPOSITION] Procesados ${materialStockLogs.length} materiales`);
      return materialStockLogs;

    } catch (error) {
      console.error('❌ [COMPOSITION] Error procesando composición:', error);
      return [];
    }
  };

  const addTransaction = async () => {
    // ⚡ FASE 3: OPTIMISTIC UI - Asignar UUID antes de optimistic update
    const transactionId = uuidv4();
    transactionToAdd.value.uuid = transactionId;

    // Crear snapshot de la transacción para local update
    const optimisticTransaction = {
      ...JSON.parse(JSON.stringify(transactionToAdd.value)),
      uuid: transactionId,
      createdAt: new Date(),
      isOptimistic: true, // ⚡ Flag para indicar que es optimista
      processingStatus: 'pending'
    };

    // ⚡ FASE 3: Local Update - Agregar transacción inmediatamente a la UI
    const localUpdate = () => {
      console.log('⚡ [OPTIMISTIC] Agregando transacción a UI:', transactionId);
      transactionsInStore.value.unshift(optimisticTransaction);
    };

    // ⚡ FASE 3: Remote Update - Toda la lógica de Firestore
    const remoteUpdate = async () => {
      let traceId = null;

      try {
        // 🔒 CRÍTICO: Crear copia inmutable de transactionToAdd para evitar que
        // se pierdan datos si el componente resetea el store durante el procesamiento async
        const transactionSnapshot = JSON.parse(JSON.stringify(transactionToAdd.value));

        console.log('🔒 [SNAPSHOT] Creada copia inmutable de transactionToAdd:', {
          type: transactionSnapshot.type,
          itemsCount: transactionSnapshot.items?.length || 0,
          amount: transactionSnapshot.amount,
          hasItems: !!transactionSnapshot.items && transactionSnapshot.items.length > 0
        });

        // === TRAZABILIDAD: Iniciar operación compleja ===
        const operationChain = startOperationChain('add_transaction');

        // Preparar datos para trazabilidad
        const relatedEntities = [];

        if (transactionSnapshot.type === 'income') {
          // Procesar transacción de ingreso:
          // 🔒 Calcular amount desde el snapshot
          transactionSnapshot.amount = transactionSnapshot.items.reduce((sum, item) => {
            return addMoney(sum, multiplyMoney(item.price, item.quantity));
          }, 0);

          // === TRAZABILIDAD: Log de items relacionados ===
          for (const item of transactionSnapshot.items) {
            relatedEntities.push({
              type: 'inventory',
              id: item.uuid || item.selectedProductUuid,
              relationship: 'stock_affected',
              impact: 'high'
            });
          }

          // ⚡ OPTIMIZACIÓN: Procesar items en paralelo
          console.log(`🚀 Procesando ${transactionSnapshot.items.length} items en paralelo...`);

          const itemsPromises = transactionSnapshot.items.map(async (item) => {
            // === TRAZABILIDAD: Log antes de crear stock log (fire-and-forget) ===
            operationChain.addStep('update', 'inventory', item.uuid || item.selectedProductUuid, {
              previousState: { stock: item.currentStock || 0 },
              newState: { stock: (item.currentStock || 0) + item.quantity },
              reason: 'stock_increase_from_income_transaction',
              severity: 'high',
              tags: ['stock_update', 'income_transaction']
            }).catch(err => console.warn('⚠️ Traceability log failed:', err));

            // Agregar transactionId al item para registrarlo en el stockLog
            const itemWithTransaction = {
              ...item,
              transactionId: transactionId,
              // IMPORTANTE: quantity siempre es la cantidad solicitada por el usuario
              // El ajuste de stock se hace en updateStock() de useInventory
              quantity: item.quantity,
              // Pasar también la cantidad máxima disponible para el ajuste
              quantityForStock: item.quantityForStock,
              // ✅ CAMPOS NECESARIOS PARA CREAR PRODUCTO NUEVO AUTOMÁTICAMENTE
              oldOrNewProduct: item.oldOrNewProduct,
              description: item.description,
              unit: item.unit,
              price: item.price,
              trackStock: item.trackStock !== undefined ? item.trackStock : true, // ✅ true para MERCH
              productType: 'MERCH' // Tipo por defecto para productos de venta
            };

            console.log('📦 Procesando item para stockLog:', {
              uuid: itemWithTransaction.uuid,
              description: itemWithTransaction.description,
              oldOrNewProduct: itemWithTransaction.oldOrNewProduct,
              quantity: itemWithTransaction.quantity,
              price: itemWithTransaction.price,
              trackStock: itemWithTransaction.trackStock
            });

            // Log de advertencia si se vendió con stock insuficiente
            if (item.proceedAnyway && item.requestedQuantity > item.actualQuantity) {
              console.warn('⚠️ Venta con stock insuficiente:', {
                producto: item.description,
                cantidadSolicitada: item.requestedQuantity,
                cantidadRealDescontada: item.actualQuantity,
                stockDisponible: item.stock,
                mensaje: 'StockLog registrará la cantidad solicitada, pero el stock solo se reducirá según disponibilidad'
              });
            }

            const itemUuid = item.uuid;

            // ⚡ Ejecutar stockLog y composición EN PARALELO
            console.log('🔍 Procesando stockLog y composición en paralelo para:', itemUuid);
            const [stockLogUuid, materialStockLogs] = await Promise.all([
              createStockLog(itemWithTransaction),
              processCompositionStockLogs(itemUuid, item.quantity, transactionId)
            ]);

            if (materialStockLogs.length > 0) {
              console.log(`✅ Afectados ${materialStockLogs.length} materiales en composición`);
            }

            // Retornar el registro con stockLogs de producto y materiales
            return {
              itemUuid,
              stockLogUuid,
              materialStockLogs // Array de stockLogs de materiales (puede estar vacío)
            };
          });

          // Ejecutar todos los items en paralelo
          transactionSnapshot.itemsAndStockLogs = await Promise.all(itemsPromises);
          console.log(`✅ ${transactionSnapshot.items.length} items procesados exitosamente`);
        } else if (transactionToAdd.value.type === 'expense') {
          // Importar funciones de useExpenses para gestionar expenses
          const { createExpenseWithLog, addLogToExpense, updateExpenseMetadata, getExpenseById } = useExpenses();

          // Instanciar inventoryStore para gestionar productos y stockLogs
          const inventoryStore = useInventoryStore();

          // Declarar expenseId al inicio para que esté disponible en todo el bloque
          let expenseId = null;

          // Para materials, calcular el total desde materialItems
          if (transactionToAdd.value.category === 'materials') {
            // 🛒 GESTIÓN DE INVENTARIO: Procesar materials en la colección 'products'
            console.log('🛒 Iniciando procesamiento de materials en inventario...');

            // Llamar a inventoryStore para crear/actualizar productos y stockLogs
            // Pasar el transactionId para vincular los stockLogs con la transacción
            const materialStockLogMap = await inventoryStore.addMaterialItemsToInventoryForPurchase(
              transactionToAdd.value.materialItems,
              transactionId // Pasar el UUID de la transacción
            );

            // Actualizar materialItems con los stockLogIds y productIds generados
            if (materialStockLogMap && materialStockLogMap.length > 0) {
              transactionToAdd.value.materialItems = transactionToAdd.value.materialItems.map(material => {
                const mapping = materialStockLogMap.find(m => m.materialUuid === material.uuid);
                if (mapping) {
                  return {
                    ...material,
                    productId: mapping.productId, // ✅ Agregar productId
                    stockLogId: mapping.stockLogId
                  };
                }
                return material;
              });

              // ✅ GUARDAR materialItemsAndStockLogs para reversión futura
              transactionToAdd.value.materialItemsAndStockLogs = materialStockLogMap.map(m => ({
                itemUuid: m.productId, // ID del producto en la colección products
                stockLogUuid: m.stockLogId // ID del stockLog
              }));

              console.log('✅ Materials procesados en inventario con stockLogIds:', materialStockLogMap);
              console.log('✅ materialItemsAndStockLogs guardado:', transactionToAdd.value.materialItemsAndStockLogs);
            }


            const materialTotal = (transactionToAdd.value.materialItems || []).reduce((sum, material) => {
              return sum + (material.cost || 0) * (material.quantity || 0);
            }, 0);
            transactionToAdd.value.amount = materialTotal;

            console.log('🛒 Expense de materials detectado:', {
              totalMaterials: transactionToAdd.value.materialItems?.length || 0,
              amount: materialTotal
            });

            // ✅ NUEVA ESTRUCTURA: Crear expense separado por cada compra
            const expenseData = {
              uuid: uuidv4(), // UUID único para cada compra
              description: transactionToAdd.value.description || 'Compra de materiales',
              category: 'materials',
              bucket: transactionToAdd.value.bucket || null, // DIRECT_MATERIAL o COGS_RESALE
            };

            // Preparar log data con materialItems incluidos
            const logData = {
              amount: transactionToAdd.value.amount,
              date: new Date(),
              transactionRef: transactionId,
              account: transactionToAdd.value.account,
              notes: transactionToAdd.value.notes || null,
              // Incluir materialItems con totalCost calculado
              materialItems: transactionToAdd.value.materialItems.map(item => ({
                ...item,
                totalCost: (item.cost || 0) * (item.quantity || 0)
              }))
            };

            console.log('✨ Creando expense individual para compra de materials');

            expenseId = await createExpenseWithLog(expenseData, logData);

            // Actualizar el expenseId en la transacción
            transactionToAdd.value.expenseId = expenseId;
            transactionToAdd.value.oldOrNewExpense = 'new';

            console.log('✅ Expense de materials creado con ID:', expenseId);
          } else {
            // Para otros tipos de gastos (labor, overhead)
            transactionToAdd.value.amount = transactionToAdd.value.amount || 0;

            // Preparar log data (usar new Date() en lugar de serverTimestamp para arrays)
            const logData = {
              amount: transactionToAdd.value.amount,
              date: new Date(),
              transactionRef: transactionId,
              account: transactionToAdd.value.account,
              notes: transactionToAdd.value.notes || null
            };

            // Verificar si es expense nuevo o existente
            if (transactionToAdd.value.oldOrNewExpense === 'old' && transactionToAdd.value.expenseId) {
              // Expense existente: agregar log
              expenseId = transactionToAdd.value.expenseId;

              console.log('📊 Agregando log a expense existente:', {
                expenseId,
                amount: logData.amount,
                description: transactionToAdd.value.description
              });

              await addLogToExpense(expenseId, logData);
              await updateExpenseMetadata(expenseId);

              console.log('✅ Log agregado y metadata actualizada para expense:', expenseId);
            } else {
              // Expense nuevo: crear con primer log
              const expenseData = {
                description: transactionToAdd.value.description,
                category: transactionToAdd.value.category,
                subcategory: transactionToAdd.value.subcategory || null,
                // Campos de clasificación contable
                bucket: transactionToAdd.value.bucket || null,
                paylabor: transactionToAdd.value.paylabor || null,
                overheadUsage: transactionToAdd.value.overheadUsage || null,
                splits: transactionToAdd.value.splits || null,
              };

              console.log('✨ Creando nuevo expense con primer log:', expenseData);

              expenseId = await createExpenseWithLog(expenseData, logData);

              // Actualizar el expenseId en la transacción
              transactionToAdd.value.expenseId = expenseId;

              console.log('✅ Nuevo expense creado con ID:', expenseId);
            }
          }

          // === TRAZABILIDAD: Log de gasto relacionado ===
          relatedEntities.push({
            type: 'expense',
            id: expenseId,
            relationship: 'generates_expense_log',
            impact: 'medium',
            metadata: {
              isNew: transactionToAdd.value.oldOrNewExpense === 'new',
              category: transactionToAdd.value.category,
              amount: transactionToAdd.value.amount,
              isMaterialPurchase: transactionToAdd.value.category === 'materials',
              materialItemsCount: transactionToAdd.value.materialItems?.length || 0
            }
          });

          // Mantener compatibilidad con expensesStore (legacy)
          expensesStore.resetExpenseToAdd();
        }

        // === PROCESAMIENTO DE PAGOS PARA INGRESOS ===
        if (transactionSnapshot.type === 'income') {
          // 🔒 Calcular el total desde el snapshot (no usar transactionToAdd.value)
          const totalAmount = transactionSnapshot.items.reduce((sum, item) => {
            return addMoney(sum, multiplyMoney(item.price, item.quantity));
          }, 0);

          // Si payments está vacío, crear payment inicial con el monto total
          if (!transactionSnapshot.payments || transactionSnapshot.payments.length === 0) {
            // Pago completo: crear payment con el monto total
            transactionSnapshot.payments = [{
              uuid: crypto.randomUUID(),
              amount: totalAmount,
              date: Timestamp.now(),
              account: transactionSnapshot.account || 'cash',
              notes: 'Pago completo al registrar',
              registeredBy: transactionSnapshot.userId || 'unknown'
            }];
          }

          // Calcular y agregar campos calculados de pago
          // Asegurarse de pasar total explícitamente
          const calculatedFields = calculatePaymentStatus({
            ...transactionSnapshot,
            total: totalAmount,
            amount: totalAmount
          });

          transactionSnapshot.paymentStatus = calculatedFields.paymentStatus;
          transactionSnapshot.totalPaid = calculatedFields.totalPaid;
          transactionSnapshot.balance = calculatedFields.balance;

          // Asegurar que clientId tenga un valor
          if (!transactionSnapshot.clientId) {
            transactionSnapshot.clientId = ANONYMOUS_CLIENT_ID;
            transactionSnapshot.clientName = 'Cliente Anónimo';
          }

          console.log('💰 Información de pago procesada:', {
            totalAmount,
            amount: transactionSnapshot.amount,
            payments: transactionSnapshot.payments.length,
            totalPaid: transactionSnapshot.totalPaid,
            balance: transactionSnapshot.balance,
            paymentStatus: transactionSnapshot.paymentStatus,
            clientId: transactionSnapshot.clientId
          });
        }

        // === TRAZABILIDAD: Log de creación de transacción (fire-and-forget) ===
        logTransactionOperation(
          'create',
          transactionId,
          transactionSnapshot,  // 🔒 Usar snapshot en lugar de transactionToAdd.value
          {
            reason: 'user_transaction_creation',
            severity: transactionSnapshot.amount > 10000 ? 'high' : 'medium',
            tags: [
              'transaction_creation',
              `transaction_${transactionSnapshot.type}`,
              `payment_${transactionSnapshot.account}`,
              transactionSnapshot.amount > 10000 ? 'high_value' : 'standard_value'
            ],
            relatedEntities,
            component: 'TransactionStore.addTransaction'
          }
        ).then(id => { traceId = id; }).catch(err => console.warn('⚠️ Traceability log failed:', err));

        // 🔒 SINCRONIZACIÓN FINAL: Si hay campos que fueron modificados en transactionToAdd.value
        //    durante el procesamiento de expenses, copiarlos al snapshot
        if (transactionSnapshot.type === 'expense') {
          // Los gastos pudieron haber modificado estos campos
          if (transactionToAdd.value.expenseId) {
            transactionSnapshot.expenseId = transactionToAdd.value.expenseId;
          }
          if (transactionToAdd.value.oldOrNewExpense) {
            transactionSnapshot.oldOrNewExpense = transactionToAdd.value.oldOrNewExpense;
          }
          if (transactionToAdd.value.materialItemsAndStockLogs) {
            transactionSnapshot.materialItemsAndStockLogs = transactionToAdd.value.materialItemsAndStockLogs;
          }
          if (transactionToAdd.value.amount !== undefined) {
            transactionSnapshot.amount = transactionToAdd.value.amount;
          }
          if (transactionToAdd.value.materialItems) {
            transactionSnapshot.materialItems = transactionToAdd.value.materialItems;
          }

          console.log('🔄 Sincronizados campos de expense al snapshot');
        }

        // ✅ DEBUG PASO 1: Verificar datos ANTES de limpiar (usando snapshot)
        console.log('🔍 [DEBUG PASO 1] transactionSnapshot ANTES de limpiar:', {
          uuid: transactionSnapshot.uuid,
          type: transactionSnapshot.type,
          account: transactionSnapshot.account,
          amount: transactionSnapshot.amount,
          description: transactionSnapshot.description,
          category: transactionSnapshot.category,
          items: transactionSnapshot.items?.length || 0,
          payments: transactionSnapshot.payments?.length || 0,
          itemsAndStockLogs: transactionSnapshot.itemsAndStockLogs?.length || 0,
          materialItems: transactionSnapshot.materialItems?.length || 0,
          materialItemsAndStockLogs: transactionSnapshot.materialItemsAndStockLogs?.length || 0,
          clientId: transactionSnapshot.clientId,
          clientName: transactionSnapshot.clientName,
          paymentStatus: transactionSnapshot.paymentStatus,
          balance: transactionSnapshot.balance,
          totalPaid: transactionSnapshot.totalPaid,
          fromAccount: transactionSnapshot.fromAccount,
          toAccount: transactionSnapshot.toAccount,
          bucket: transactionSnapshot.bucket,
          paylabor: transactionSnapshot.paylabor,
          overheadUsage: transactionSnapshot.overheadUsage,
          TODOS_LOS_CAMPOS: Object.keys(transactionSnapshot)
        });

        // ✅ PASO 2: Método NUEVO SEGURO - Limpiar solo undefined, mantener estructura
        // 🔒 USAR SNAPSHOT EN LUGAR DE transactionToAdd.value
        const cleanTransaction = Object.fromEntries(
          Object.entries(transactionSnapshot).map(([key, value]) => [
            key,
            value === undefined ? null : value
          ])
        );

        // ⚡ Asegurar que arrays se conserven correctamente (preservar estructura)
        if (transactionSnapshot.items) {
          cleanTransaction.items = [...transactionSnapshot.items];
        }
        if (transactionSnapshot.payments) {
          cleanTransaction.payments = [...transactionSnapshot.payments];
        }
        if (transactionSnapshot.itemsAndStockLogs) {
          cleanTransaction.itemsAndStockLogs = [...transactionSnapshot.itemsAndStockLogs];
        }
        if (transactionSnapshot.materialItems) {
          cleanTransaction.materialItems = [...transactionSnapshot.materialItems];
        }
        if (transactionSnapshot.materialItemsAndStockLogs) {
          cleanTransaction.materialItemsAndStockLogs = [...transactionSnapshot.materialItemsAndStockLogs];
        }
        if (transactionSnapshot.splits) {
          cleanTransaction.splits = [...transactionSnapshot.splits];
        }

        // ✅ DEBUG PASO 1: Verificar datos DESPUÉS de limpiar
        console.log('🔍 [DEBUG PASO 1] cleanTransaction DESPUÉS de limpiar:', {
          uuid: cleanTransaction.uuid,
          type: cleanTransaction.type,
          account: cleanTransaction.account,
          amount: cleanTransaction.amount,
          description: cleanTransaction.description,
          category: cleanTransaction.category,
          items: cleanTransaction.items?.length || 0,
          payments: cleanTransaction.payments?.length || 0,
          itemsAndStockLogs: cleanTransaction.itemsAndStockLogs?.length || 0,
          materialItems: cleanTransaction.materialItems?.length || 0,
          materialItemsAndStockLogs: cleanTransaction.materialItemsAndStockLogs?.length || 0,
          clientId: cleanTransaction.clientId,
          clientName: cleanTransaction.clientName,
          paymentStatus: cleanTransaction.paymentStatus,
          balance: cleanTransaction.balance,
          totalPaid: cleanTransaction.totalPaid,
          fromAccount: cleanTransaction.fromAccount,
          toAccount: cleanTransaction.toAccount,
          bucket: cleanTransaction.bucket,
          paylabor: cleanTransaction.paylabor,
          overheadUsage: cleanTransaction.overheadUsage,
          TODOS_LOS_CAMPOS: Object.keys(cleanTransaction)
        });

        // ⚡ FASE 3: Asegurar que el UUID esté presente (crítico para optimistic UI)
        cleanTransaction.uuid = transactionId;

        // ☁️ FASE 2: Agregar estado de procesamiento para Cloud Function
        cleanTransaction.processingStatus = 'pending';

        // Crear la transacción en Firestore (OPERACIÓN CRÍTICA)
        await createTransaction(cleanTransaction);
        console.log('✅ Transaction added successfully to Firestore');
        console.log('📊 Transaction data saved:', {
          uuid: cleanTransaction.uuid,
          type: cleanTransaction.type,
          amount: cleanTransaction.amount,
          balance: cleanTransaction.balance,
          clientId: cleanTransaction.clientId,
          clientName: cleanTransaction.clientName,
          paymentStatus: cleanTransaction.paymentStatus
        });

        // ⚡ Actualizar transacción optimista a confirmada
        const index = transactionsInStore.value.findIndex(t => t.uuid === transactionId);
        if (index !== -1) {
          transactionsInStore.value[index] = {
            ...transactionsInStore.value[index],
            ...cleanTransaction,
            isOptimistic: false // ⚡ Ya no es optimista
          };
          console.log('⚡ [OPTIMISTIC] Transacción confirmada en UI:', transactionId);
        }

        // ⚡ UI LISTA - Marcar como éxito inmediatamente
        status.value = 'success';

        // ☁️ FASE 2: OPERACIONES SECUNDARIAS AHORA EN CLOUD FUNCTION
        console.log('☁️ Operaciones secundarias delegadas a Cloud Function (processTransactionBackground)');

        // === ANALYTICS: Trackear transacción creada EN FRONTEND (para feedback inmediato) ===
        if (isValidTransactionForStreak(cleanTransaction.type)) {
          const businessId = ensureBusinessId();
          const today = new Date();
          const year = today.getFullYear();
          const month = String(today.getMonth() + 1).padStart(2, '0');
          const day = String(today.getDate()).padStart(2, '0');
          const dayId = `${year}-${month}-${day}`;

          // Fire-and-forget: no bloquear UI
          trackTransactionCreated({
            businessId,
            dayId,
            transactionType: cleanTransaction.type,
            amount: cleanTransaction.amount || cleanTransaction.total || 0,
            account: cleanTransaction.account,
            isFirstTransactionOfDay: false // Se recalcula en Cloud Function
          });
        }

        // === TRAZABILIDAD: Finalizar operación compleja (fire-and-forget) ===
        operationChain.finish({
          reason: 'transaction_creation_completed',
          metadata: {
            transactionId: transactionId,
            transactionType: transactionToAdd.value.type,
            totalValue: transactionToAdd.value.total,
            itemsCount: transactionToAdd.value.items?.length || 0
          }
        }).catch(err => console.warn('⚠️ Traceability finish failed:', err));

      } catch (error) {
        console.error('❌ Error adding transaction:', error);

        // === TRAZABILIDAD: Log de error ===
        if (traceId) {
          await logTransactionOperation(
            'error',
            transactionId || 'unknown',
            { error: error.message },
            {
              reason: 'transaction_creation_failed',
              severity: 'critical',
              tags: ['transaction_error', 'creation_failure'],
              component: 'TransactionStore.addTransaction'
            }
          );
        }

        status.value = 'error';
        throw error;
      }
    };

    // ⚡ FASE 3: Rollback - Remover transacción de la UI si falla
    const rollback = () => {
      console.log('⚡ [OPTIMISTIC] Revirtiendo transacción de UI:', transactionId);
      const index = transactionsInStore.value.findIndex(t => t.uuid === transactionId);
      if (index !== -1) {
        transactionsInStore.value.splice(index, 1);
      }
      status.value = 'error';
    };

    // ⚡ FASE 3: Ejecutar con Optimistic UI
    const result = await executeOptimistically(
      localUpdate,
      remoteUpdate,
      rollback,
      {
        type: 'add_transaction',
        operationType: 'add_transaction',
        entityId: transactionId,
        entityType: 'transaction',
        description: transactionToAdd.value.type === 'income'
          ? 'Registrar venta'
          : 'Registrar gasto'
      }
    );

    if (!result.success) {
      console.error('❌ [OPTIMISTIC] Transaction failed after all retries');
      throw new Error('Failed to add transaction after retries');
    }

    console.log('✅ [OPTIMISTIC] Transaction completed successfully');

    // ✅ Retornar el UUID de la transacción creada
    return { success: true, transactionId: transactionId, transactionUuid: transactionId };
  };

  const getTransactions = async () => {
    try {
      // === TRAZABILIDAD: Log de acceso a datos ===
      await logTransactionOperation(
        'read',
        'all_transactions',
        { action: 'fetch_all_transactions' },
        {
          reason: 'data_access_all_transactions',
          severity: 'low',
          tags: ['data_read', 'transaction_list'],
          component: 'TransactionStore.getTransactions'
        }
      );

      transactionsInStore.value = await getAllTransactions();
      console.log('✅ Transactions fetched with traceability');

    } catch (error) {
      console.error('❌ Error fetching transactions:', error);

      // === TRAZABILIDAD: Log de error ===
      await logTransactionOperation(
        'error',
        'all_transactions',
        { error: error.message },
        {
          reason: 'fetch_transactions_failed',
          severity: 'medium',
          tags: ['data_error', 'fetch_failure'],
          component: 'TransactionStore.getTransactions'
        }
      );
    }
  };

  const getTransactionsToday = async () => {
    try {
      // === TRAZABILIDAD: Log de acceso a datos del día ===
      await logTransactionOperation(
        'read',
        'today_transactions',
        { action: 'fetch_today_transactions', date: new Date().toISOString().split('T')[0] },
        {
          reason: 'data_access_today_transactions',
          severity: 'low',
          tags: ['data_read', 'transaction_list', 'daily_data'],
          component: 'TransactionStore.getTransactionsToday'
        }
      );

      transactionsInStore.value = await getTransactionsTodayCmps();
      console.log('✅ Today transactions fetched with traceability');

    } catch (error) {
      console.error('❌ Error fetching today transactions:', error);

      // === TRAZABILIDAD: Log de error ===
      await logTransactionOperation(
        'error',
        'today_transactions',
        { error: error.message },
        {
          reason: 'fetch_today_transactions_failed',
          severity: 'medium',
          tags: ['data_error', 'fetch_failure', 'daily_data'],
          component: 'TransactionStore.getTransactionsToday'
        }
      );
    }
  }

  /**
   * Obtiene las transacciones de un día específico y las almacena en transactionsInStore
   * @param {string} dayString - Fecha en formato 'yyyy-MM-dd'
   */
  const getTransactionsByDayStore = async (dayString) => {
    try {
      // === TRAZABILIDAD: Log de acceso a datos del día específico ===
      await logTransactionOperation(
        'read',
        'day_transactions',
        { action: 'fetch_day_transactions', date: dayString },
        {
          reason: 'data_access_specific_day_transactions',
          severity: 'low',
          tags: ['data_read', 'transaction_list', 'daily_data', 'specific_date'],
          component: 'TransactionStore.getTransactionsByDayStore'
        }
      );

      transactionsInStore.value = await getTransactionsByDay(dayString);
      console.log(`✅ Transactions for ${dayString} fetched with traceability`);

    } catch (error) {
      console.error(`❌ Error fetching transactions for ${dayString}:`, error);

      // === TRAZABILIDAD: Log de error ===
      await logTransactionOperation(
        'error',
        'day_transactions',
        { error: error.message, date: dayString },
        {
          reason: 'fetch_day_transactions_failed',
          severity: 'medium',
          tags: ['data_error', 'fetch_failure', 'daily_data', 'specific_date'],
          component: 'TransactionStore.getTransactionsByDayStore'
        }
      );
    }
  }

  /**
   * Obtiene todas las transacciones con balance pendiente (para Cuentas por Cobrar)
   * Filtra transacciones de tipo 'income' con balance > 0
   */
  const fetchPendingTransactions = async () => {
    try {
      console.log('🔄 Cargando transacciones con balance pendiente...');

      // === TRAZABILIDAD: Log de acceso a datos ===
      await logTransactionOperation(
        'read',
        'pending_transactions',
        { action: 'fetch_pending_transactions' },
        {
          reason: 'data_access_pending_transactions',
          severity: 'low',
          tags: ['data_read', 'accounts_receivable', 'pending_balance'],
          component: 'TransactionStore.fetchPendingTransactions'
        }
      );

      // Cargar todas las transacciones de tipo income con balance pendiente
      const allTransactions = await getAllTransactions();

      // Filtrar solo las que tienen balance pendiente
      const pendingTransactions = allTransactions.filter(t =>
        t.type === 'income' &&
        t.balance &&
        t.balance > 0
      );

      transactionsInStore.value = pendingTransactions;

      console.log(`✅ ${pendingTransactions.length} transacciones con balance pendiente cargadas`);
      return pendingTransactions;

    } catch (error) {
      console.error('❌ Error cargando transacciones pendientes:', error);

      // === TRAZABILIDAD: Log de error ===
      await logTransactionOperation(
        'error',
        'pending_transactions',
        { error: error.message },
        {
          reason: 'fetch_pending_transactions_failed',
          severity: 'medium',
          tags: ['data_error', 'fetch_failure', 'accounts_receivable'],
          component: 'TransactionStore.fetchPendingTransactions'
        }
      );

      throw error;
    }
  };

  /**
   * Obtiene las últimas transacciones de tipo "closure" del negocio
   * @param {number} limit - Número de transacciones a obtener (por defecto 5)
   * @returns {Promise<Array>} Array de transacciones de cierre
   */
  const getLastClosures = async (limit = 5) => {
    try {
      // === TRAZABILIDAD: Log de acceso a datos ===
      await logTransactionOperation(
        'read',
        'last_closure_transactions',
        { action: 'fetch_last_closures', limit },
        {
          reason: 'data_access_last_closures',
          severity: 'low',
          tags: ['data_read', 'closure_list', 'historical_data'],
          component: 'TransactionStore.getLastClosures'
        }
      );

      const closures = await getLastClosureTransactions(limit);
      console.log(`✅ Last ${closures.length} closure transactions fetched with traceability`);

      return closures;

    } catch (error) {
      console.error('❌ Error fetching last closures:', error);

      // === TRAZABILIDAD: Log de error ===
      await logTransactionOperation(
        'error',
        'last_closure_transactions',
        { error: error.message },
        {
          reason: 'fetch_last_closures_failed',
          severity: 'medium',
          tags: ['data_error', 'fetch_failure', 'historical_data'],
          component: 'TransactionStore.getLastClosures'
        }
      );

      return [];
    }
  };

  const getOneTransactionDataByID = (transactionId) => {
    return transactionsInStore.value.filter(t => t.uuid === transactionId);
  };

  const getAllIncomeTransactionsInStore = () => {
    return transactionsInStore.value.filter(t => t.type === 'income');
  }

  const getAllExpenseTransactionsInStore = () => {
    return transactionsInStore.value.filter(t => t.type === 'expense');
  }

  const getAllCashTransactionsInStore = () => {
    return transactionsInStore.value.filter(t => t.account === 'cash');
  }

  const getAllBankTransactionsInStore = () => {
    return transactionsInStore.value.filter(t => t.account === 'bank');
  }

  const resetTransactionToAdd = () => {
    transactionToAdd.value = {
      uuid: null,
      type: null,
      account: null,
      items: [],
      itemsAndStockLogs: [],
      // CAMPOS PARA PAGOS PARCIALES Y CLIENTES:
      payments: [],
      paymentStatus: 'completed',
      totalPaid: 0,
      balance: 0,
      clientId: null,
      clientName: 'Cliente Anónimo',
      description: null,
      category: null,
      subcategory: null,
      amount: null,
      notes: null, // Resetear notas
      expenseId: null,
      oldOrNewExpense: null,
      // Campos para transacciones de egreso tipo 'materials':
      materialItems: [], // Array de materiales/insumos comprados
      materialItemsAndStockLogs: [], // Relación entre items y stockLogs
      // Campos para clasificación contable:
      paylabor: null,
      overheadUsage: null,
      bucket: null,
      splits: null,
      fromAccount: null,
      toAccount: null,

    };

    currentStepOfAddTransaction.value = getSteps()[0] === "CajaDiaria" ? 0 : 1;
    resetItemToAddInTransaction();


  };

  const modifyTransaction = async (transactionId, updatedData) => {
    try {
      // Obtener estado anterior
      const previousTransaction = transactionsInStore.value.find(t => t.uuid === transactionId);

      // === TRAZABILIDAD: Log de modificación ===
      const traceId = await logTransactionOperation(
        'update',
        transactionId,
        updatedData,
        {
          reason: 'user_transaction_modification',
          severity: 'medium',
          tags: ['transaction_update', 'data_modification'],
          component: 'TransactionStore.modifyTransaction',
          previousState: previousTransaction
        }
      );

      await updateTransaction(transactionId, updatedData);

      // Actualizar estado local
      const index = transactionsInStore.value.findIndex(t => t.uuid === transactionId);
      if (index !== -1) {
        transactionsInStore.value[index] = { ...transactionsInStore.value[index], ...updatedData };
      }

      console.log('✅ Transaction modified with traceId:', traceId);

    } catch (error) {
      console.error('❌ Error updating transaction:', error);

      // === TRAZABILIDAD: Log de error ===
      await logTransactionOperation(
        'error',
        transactionId,
        { error: error.message },
        {
          reason: 'transaction_modification_failed',
          severity: 'high',
          tags: ['transaction_error', 'update_failure'],
          component: 'TransactionStore.modifyTransaction'
        }
      );

      throw error;
    }
  };

  const modifyTransactionToAddType = (type) => {
    transactionToAdd.value.type = type;
  };


  const modifyTransactionExpenseDescriptionAndCost = (description, cost) => {
    transactionToAdd.value.description = description;
    transactionToAdd.value.cost = cost
  }

  const modifyTransactionExpenseDescription = (description) => {
    transactionToAdd.value.description = description;
  }

  const modifyTransactionExpenseCost = (cost) => {
    transactionToAdd.value.cost = cost;
  }

  const getTransactionToAddTotal = () => {
    // Si no hay items o el array está vacío, devolver el amount o 0
    if (!transactionToAdd.value.items || transactionToAdd.value.items.length === 0) {
      return round2(transactionToAdd.value.amount || 0);
    }

    // Calcular total basado en items
    const total = transactionToAdd.value.items.reduce((sum, item) => {
      return addMoney(sum, multiplyMoney(item.price, item.quantity));
    }, 0);

  }

  const modifyTransactionToAddAccount = (account) => {
    transactionToAdd.value.account = account;
  }

  const nextStepToAddTransaction = () => {
    if (currentStepOfAddTransaction.value < totalSteps.value - 1) {
      currentStepOfAddTransaction.value++;
    }
  }

  const prevStepToAddTransaction = () => {
    if (currentStepOfAddTransaction.value > 0) {
      currentStepOfAddTransaction.value--;
    }
  }


  const modifyItemToAddInTransaction = (product) => {
    if (product.oldOrNewProduct === "old") {
      itemToAddInTransaction.value.uuid = product.selectedProductUuid;
    } else {
      itemToAddInTransaction.value.uuid = uuidv4();
    }
    itemToAddInTransaction.value.description = product.description;
    itemToAddInTransaction.value.quantity = product.quantity;
    itemToAddInTransaction.value.price = product.price;
    itemToAddInTransaction.value.oldOrNewProduct = product.oldOrNewProduct;
    itemToAddInTransaction.value.selectedProductUuid = product.selectedProductUuid;
    itemToAddInTransaction.value.unit = product.unit;
    itemToAddInTransaction.value.stock = product.stock ?? null;
    itemToAddInTransaction.value.trackStock = product.trackStock ?? true;
    itemToAddInTransaction.value.composition = product.composition ?? null;
    itemToAddInTransaction.value.compositionStockValidation = null; // Se validará reactivamente
    itemToAddInTransaction.value.type = product.type ?? null;
  }

  const modifyItemToAddInExpenseMaterial = (material) => {
    if (material.oldOrNewProduct === "old") {
      itemToAddInExpenseMaterial.value.uuid = material.selectedProductUuid;
    } else {
      itemToAddInExpenseMaterial.value.uuid = uuidv4();
    }
    itemToAddInExpenseMaterial.value.description = material.description;
    itemToAddInExpenseMaterial.value.quantity = material.quantity;
    itemToAddInExpenseMaterial.value.cost = material.cost;
    itemToAddInExpenseMaterial.value.oldOrNewProduct = material.oldOrNewProduct;
    itemToAddInExpenseMaterial.value.selectedProductUuid = material.selectedProductUuid;
    itemToAddInExpenseMaterial.value.unit = material.unit;
    itemToAddInExpenseMaterial.value.stock = material.stock ?? null;
    itemToAddInExpenseMaterial.value.trackStock = material.trackStock ?? true;
  }

  const resetItemToAddInTransaction = () => {
    itemToAddInTransaction.value = {
      description: null,
      quantity: null,
      price: null,
      oldOrNewProduct: null,
      selectedProductUuid: null,
      unit: null,
      stock: null,
      trackStock: true, // ✅ true por defecto para productos MERCH
      proceedAnyway: false,
      composition: null,
      compositionStockValidation: null,
      type: null,
    };
  }

  const resetItemToAddInExpenseMaterial = () => {
    itemToAddInExpenseMaterial.value = {
      description: null,
      quantity: null,
      cost: null,
      oldOrNewProduct: null,
      selectedProductUuid: null,
      unit: null,
      stock: null,
      trackStock: true,
    };
  }

  const resetTransactionInStore = () => {
    transactionsInStore.value = [];
  }

  const setExpenseDescription = (description) => { transactionToAdd.value.description = description; };
  const setExpenseAmount = (amount) => { transactionToAdd.value.amount = parseMoneyFloat(amount); };
  const setExpenseCategory = (category) => { transactionToAdd.value.category = category; }; // 'materials'|'labor'|'overhead'
  const setExpenseSubcategory = (subcategory) => { transactionToAdd.value.subcategory = subcategory; }; // 'office'|'travel'|'utilities' etc.

  // Nuevos setters para clasificación contable
  const setPayLabor = (role) => { transactionToAdd.value.paylabor = role; }; // 'DIRECT_SERVICE'|'PRODUCTION_SUPPORT'|'ADMIN_SUPPORT'
  const setOverheadUsage = (usage) => { transactionToAdd.value.overheadUsage = usage; }; // 'PRODUCE'|'ADMIN'|'MIXED'
  const setBucket = (bucket) => { transactionToAdd.value.bucket = bucket; };
  const setSplits = (splits) => { transactionToAdd.value.splits = splits; };

  // Funciones para manejar transferencias
  const setTransferFromAccount = (fromAccount) => { transactionToAdd.value.fromAccount = fromAccount; };
  const setTransferToAccount = (toAccount) => { transactionToAdd.value.toAccount = toAccount; };

  const addItemToTransaction = () => {
    const item = { ...itemToAddInTransaction.value };

    // ✅ GENERAR UUID PARA PRODUCTOS NUEVOS
    if (item.oldOrNewProduct === 'new' && !item.selectedProductUuid) {
      item.uuid = uuidv4();
      item.selectedProductUuid = item.uuid; // Mantener consistencia
      console.log('🆕 UUID generado para producto nuevo:', {
        description: item.description,
        uuid: item.uuid
      });
    } else if (item.oldOrNewProduct === 'old' && item.selectedProductUuid) {
      // Para productos existentes, usar el UUID del producto seleccionado
      item.uuid = item.selectedProductUuid;
    }

    // Si el producto tiene seguimiento de stock y se marcó "proceder de todos modos"
    if (item.trackStock && item.proceedAnyway) {
      const requestedQuantity = parseFloat(item.quantity) || 0;
      const availableStock = parseFloat(item.stock) || 0;

      // Calcular la cantidad real que se puede vender
      const actualQuantity = Math.min(requestedQuantity, availableStock);

      // Guardar la cantidad solicitada original y la cantidad real
      item.requestedQuantity = requestedQuantity;
      item.actualQuantity = actualQuantity;

      // La cantidad que se registrará en el stock es la real
      item.quantityForStock = actualQuantity;

      console.log('📊 Agregando item con stock insuficiente:', {
        descripcion: item.description,
        cantidadSolicitada: requestedQuantity,
        stockDisponible: availableStock,
        cantidadReal: actualQuantity,
        stockFinal: availableStock - actualQuantity
      });
    }

    transactionToAdd.value.items.push(item);

    // 🔍 DEBUG: Confirmar que el item se agregó
    console.log('✅ [addItemToTransaction] Item agregado:', {
      item,
      totalItems: transactionToAdd.value.items.length,
      allItems: transactionToAdd.value.items
    });

    // Resetear el item
    itemToAddInTransaction.value = {
      description: null,
      quantity: null,
      price: null,
      oldOrNewProduct: null,
      selectedProductUuid: null,
      unit: null,
      stock: null,
      trackStock: true, // ✅ true por defecto para productos MERCH
      proceedAnyway: false,
    };
  }

  const addMaterialItemToExpense = () => {
    const material = { ...itemToAddInExpenseMaterial.value };

    // Asegurar que materialItems existe
    if (!transactionToAdd.value.materialItems) {
      transactionToAdd.value.materialItems = [];
    }

    // Homogeneizar estructura con campos consistentes
    const materialItem = {
      uuid: material.uuid || uuidv4(), // Generar UUID si no existe
      productId: material.selectedProductUuid || null, // ID del producto en la collection 'products'
      description: material.description,
      quantity: material.quantity,
      unit: material.unit,
      cost: material.cost,
      oldOrNewProduct: material.oldOrNewProduct,
      stockLogId: null, // Se asignará después de crear el stockLog
    };

    // No hay validaciones de stock para compras de materiales
    // Solo agregamos el item al array
    transactionToAdd.value.materialItems.push(materialItem);

    console.log('📦 Material agregado a la compra:', {
      uuid: materialItem.uuid,
      productId: materialItem.productId,
      descripcion: materialItem.description,
      cantidad: materialItem.quantity,
      costo: materialItem.cost,
      unidad: materialItem.unit,
      tipo: materialItem.oldOrNewProduct
    });

    // Resetear el item
    itemToAddInExpenseMaterial.value = {
      description: null,
      quantity: null,
      cost: null,
      oldOrNewProduct: null,
      selectedProductUuid: null,
      unit: null,
      stock: null,
      trackStock: true,
    };
  }

  const removeItemToTransaction = (uuid) => {
    const index = transactionToAdd.value.items.findIndex(i => i.uuid === uuid);
    if (index !== -1) {
      transactionToAdd.value.items.splice(index, 1);
    }
  }

  const removeMaterialItemFromExpense = (uuid) => {
    const index = transactionToAdd.value.materialItems.findIndex(i => i.uuid === uuid);
    if (index !== -1) {
      transactionToAdd.value.materialItems.splice(index, 1);
    }
  }

  /**
   * Genera mensaje de advertencia para el modal de confirmación
   */
  const getDeleteWarningMessage = (transaction) => {
    const warnings = [];

    switch (transaction.type) {
      case 'income':
        warnings.push('⚠️ Esta acción revertirá el stock vendido');
        warnings.push(`📦 Se sumarán ${transaction.items?.length || 0} productos al inventario`);

        if (transaction.payments && transaction.payments.length > 1) {
          warnings.push(`💰 Esta venta tiene ${transaction.payments.length} pagos registrados`);
        }

        if (transaction.clientId && transaction.clientId !== ANONYMOUS_CLIENT_ID) {
          warnings.push(`👤 Se actualizará la información del cliente: ${transaction.clientName}`);
        }

        // Buscar payments relacionados
        const relatedPayments = transactionsInStore.value.filter(
          t => t.type === 'payment' && t.relatedTransactionId === transaction.uuid
        );

        if (relatedPayments.length > 0) {
          warnings.push(`🔗 Se eliminarán ${relatedPayments.length} pagos asociados`);
        }
        break;

      case 'expense':
        if (transaction.category === 'materials') {
          warnings.push('⚠️ Esta acción revertirá el stock de materiales');
          warnings.push(`📦 Se restarán ${transaction.materialItems?.length || 0} productos del inventario`);
        }
        warnings.push(`📊 Se eliminará el log del gasto: ${transaction.description || 'Sin descripción'}`);
        break;

      case 'payment':
        warnings.push('⚠️ Esta acción modificará el balance de la venta original');
        warnings.push(`💰 Se recalcularán los pagos y el saldo pendiente`);
        break;

      case 'transfer':
        warnings.push('⚠️ Se eliminará el registro de transferencia entre cuentas');
        break;

      case 'closure':
        warnings.push('⚠️ Estás eliminando el CIERRE del día actual');
        warnings.push('📊 El día quedará abierto para registrar nuevas transacciones');
        warnings.push('🔄 El dailySummary se actualizará automáticamente');
        warnings.push('💡 Podrás realizar un nuevo cierre cuando lo necesites');
        break;

      case 'opening':
        // Este caso nunca debería llegar aquí por la validación previa
        warnings.push('❌ Las aperturas son inmutables y no se pueden eliminar');
        break;
    }

    warnings.push('');
    warnings.push('⏱️ El dailySummary se recalculará automáticamente');
    warnings.push('');
    warnings.push('❓ ¿Está seguro de eliminar esta transacción?');

    return warnings.join('\n');
  };

  /**
   * Elimina una transacción tipo income y revierte todos sus efectos
   */
  const deleteIncomeTransaction = async (transactionToDelete) => {
    const { getFirestore, doc, updateDoc, getDoc } = await import('firebase/firestore');
    const { useClientStore } = await import('@/stores/clientStore');
    const { useInventory } = await import('@/composables/useInventory');
    const { useBusinessStore } = await import('@/stores/businessStore');

    const db = getFirestore();
    const clientStore = useClientStore();
    const businessStore = useBusinessStore();
    const businessId = businessStore.getBusinessId;
    const { getProductById } = useInventory();

    console.log('🗑️ [DELETE INCOME] Iniciando eliminación de venta:', transactionToDelete.uuid);

    // 1. REVERTIR STOCK - ⚡ OPTIMIZACIÓN: Procesar items en paralelo
    if (transactionToDelete.itemsAndStockLogs && transactionToDelete.itemsAndStockLogs.length > 0) {
      console.log(`⚡ Revirtiendo ${transactionToDelete.itemsAndStockLogs.length} items en paralelo...`);

      const revertPromises = transactionToDelete.itemsAndStockLogs.map(async (itemLog) => {
        const { itemUuid, stockLogUuid } = itemLog;

        console.log(`  📦 Revirtiendo stock para producto ${itemUuid}, stockLog ${stockLogUuid}`);

        try {
          // a) Obtener el producto
          const productRef = doc(db, `businesses/${businessId}/products`, itemUuid);
          const productDoc = await getDoc(productRef);

          if (!productDoc.exists()) {
            console.warn(`  ⚠️ Producto ${itemUuid} no encontrado, saltando...`);
            return { success: false, itemUuid, error: 'Producto no encontrado' };
          }

          const productData = productDoc.data();

          // b) Encontrar el stockLog específico
          const stockLog = productData.stockLog?.find(log => log.uuid === stockLogUuid);

          if (!stockLog) {
            console.warn(`  ⚠️ StockLog ${stockLogUuid} no encontrado, saltando...`);
            return { success: false, itemUuid, error: 'StockLog no encontrado' };
          }

          // c) Sumar la cantidad vendida al stock actual
          const newStock = (productData.stock || 0) + (stockLog.quantity || 0);

          // d) Eliminar el stockLog del array
          const updatedStockLogs = productData.stockLog.filter(log => log.uuid !== stockLogUuid);

          await updateDoc(productRef, {
            stock: newStock,
            stockLog: updatedStockLogs
          });

          console.log(`  ✅ Stock revertido: ${productData.stock} + ${stockLog.quantity} = ${newStock}`);

          // e) Log de trazabilidad por item (fire-and-forget)
          logInventoryOperation('revert', itemUuid, {
            reason: 'income_transaction_deleted',
            stockLogId: stockLogUuid,
            quantityReverted: stockLog.quantity,
            previousStock: productData.stock,
            newStock
          }).catch(err => console.warn('⚠️ Traceability log failed:', err));

          // 🧩 OPTIMIZACIÓN: Revertir materiales en composición EN PARALELO
          if (itemLog.materialStockLogs && itemLog.materialStockLogs.length > 0) {
            console.log(`  🔄 Revirtiendo ${itemLog.materialStockLogs.length} materiales en paralelo...`);

            const materialPromises = itemLog.materialStockLogs.map(async (materialLog) => {
              const { materialId, stockLogUuid: materialStockLogUuid, description } = materialLog;

              try {
                console.log(`    📦 Revirtiendo material: ${description}`);

                // a) Obtener el producto material
                const materialRef = doc(db, `businesses/${businessId}/products`, materialId);
                const materialDoc = await getDoc(materialRef);

                if (!materialDoc.exists()) {
                  console.warn(`    ⚠️ Material ${materialId} no encontrado, saltando...`);
                  return { success: false, materialId, error: 'Material no encontrado' };
                }

                const materialData = materialDoc.data();

                // b) Encontrar el stockLog específico del material
                const materialStockLog = materialData.stockLog?.find(log => log.uuid === materialStockLogUuid);

                if (!materialStockLog) {
                  console.warn(`    ⚠️ StockLog ${materialStockLogUuid} no encontrado en material, saltando...`);
                  return { success: false, materialId, error: 'StockLog no encontrado' };
                }

                // c) Sumar la cantidad usada al stock actual del material
                const newMaterialStock = (materialData.stock || 0) + (materialStockLog.quantity || 0);

                // d) Eliminar el stockLog del array
                const updatedMaterialStockLogs = materialData.stockLog.filter(
                  log => log.uuid !== materialStockLogUuid
                );

                await updateDoc(materialRef, {
                  stock: newMaterialStock,
                  stockLog: updatedMaterialStockLogs
                });

                console.log(`    ✅ Material revertido: ${materialData.stock} + ${materialStockLog.quantity} = ${newMaterialStock}`);

                // e) Log de trazabilidad para el material (fire-and-forget)
                logInventoryOperation('revert', materialId, {
                  reason: 'income_transaction_deleted_composition_material',
                  stockLogId: materialStockLogUuid,
                  quantityReverted: materialStockLog.quantity,
                  previousStock: materialData.stock,
                  newStock: newMaterialStock,
                  relatedProductId: itemUuid
                }).catch(err => console.warn('⚠️ Traceability log failed:', err));

                return { success: true, materialId };

              } catch (materialError) {
                console.error(`    ❌ Error revirtiendo material ${materialId}:`, materialError);
                return { success: false, materialId, error: materialError.message };
              }
            });

            // Ejecutar reversión de materiales en paralelo
            const materialResults = await Promise.allSettled(materialPromises);
            const failedMaterials = materialResults.filter(r => r.status === 'rejected' || r.value?.success === false);

            if (failedMaterials.length > 0) {
              console.warn(`  ⚠️ ${failedMaterials.length} materiales fallaron al revertir`);
            } else {
              console.log(`  ✅ Materiales de composición revertidos exitosamente`);
            }
          }

          return { success: true, itemUuid };

        } catch (itemError) {
          console.error(`  ❌ Error revirtiendo stock para ${itemUuid}:`, itemError);
          return { success: false, itemUuid, error: itemError.message };
        }
      });

      // Ejecutar reversión de todos los items en paralelo
      const results = await Promise.allSettled(revertPromises);
      const failedItems = results.filter(r => r.status === 'rejected' || r.value?.success === false);

      if (failedItems.length > 0) {
        console.warn(`⚠️ ${failedItems.length} items fallaron al revertir stock`);
      } else {
        console.log(`✅ Stock revertido exitosamente para ${transactionToDelete.itemsAndStockLogs.length} items`);
      }
    }

    // 2. ⚡ OPTIMIZACIÓN: Eliminar pagos asociados EN PARALELO
    const relatedPayments = transactionsInStore.value.filter(
      t => t.type === 'payment' && t.relatedTransactionId === transactionToDelete.uuid
    );

    if (relatedPayments.length > 0) {
      console.log(`  🔗 Eliminando ${relatedPayments.length} pagos asociados en paralelo`);
      const paymentPromises = relatedPayments.map(payment =>
        deleteTransactionByID(payment.uuid)
          .then(() => {
            console.log(`    ✅ Payment ${payment.uuid} eliminado`);
            return { success: true, paymentId: payment.uuid };
          })
          .catch(err => {
            console.error(`    ❌ Error eliminando payment ${payment.uuid}:`, err);
            return { success: false, paymentId: payment.uuid, error: err.message };
          })
      );

      await Promise.allSettled(paymentPromises);
    }

    // 3. ELIMINAR LA TRANSACCIÓN (OPERACIÓN CRÍTICA)
    await deleteTransactionByID(transactionToDelete.uuid);
    console.log(`  🗑️ Transacción eliminada de Firestore`);

    // 4. ⚡ OPERACIONES SECUNDARIAS EN BACKGROUND (fire-and-forget)
    const secondaryOps = [];

    // Actualizar metadata del cliente
    if (transactionToDelete.clientId && transactionToDelete.clientId !== ANONYMOUS_CLIENT_ID) {
      secondaryOps.push(
        (async () => {
          console.log(`  👤 Actualizando metadata del cliente ${transactionToDelete.clientId}`);
          await clientStore.updateClientMetadata(transactionToDelete.clientId);
          console.log('  ✅ Cliente metadata actualizada');
        })()
      );
    }

    // Log de trazabilidad
    secondaryOps.push(
      logTransactionOperation('delete', transactionToDelete.uuid, transactionToDelete, {
        reason: 'user_income_transaction_deletion',
        severity: 'high',
        tags: ['transaction_delete', 'income', 'stock_reverted', 'client_affected'],
        relatedEntities: [
          ...(transactionToDelete.itemsAndStockLogs || []).map(il => ({
            type: 'stockLog',
            id: il.stockLogUuid,
            relationship: 'deleted',
            impact: 'high'
          })),
          {
            type: 'client',
            id: transactionToDelete.clientId,
            relationship: 'metadata_recalculated',
            impact: 'medium'
          }
        ],
        component: 'TransactionStore.deleteIncomeTransaction'
      })
    );

    // Ejecutar operaciones secundarias sin bloquear
    Promise.allSettled(secondaryOps)
      .then(() => console.log('✅ [DELETE INCOME] Operaciones secundarias completadas'))
      .catch(err => console.warn('⚠️ Error en operaciones secundarias:', err));

    console.log('✅ [DELETE INCOME] Venta eliminada exitosamente');
  };

  /**
   * Elimina una transacción tipo expense (materials) y revierte stock
   */
  const deleteMaterialExpenseTransaction = async (transactionToDelete) => {
    const { getFirestore, doc, updateDoc, getDoc } = await import('firebase/firestore');
    const { useBusinessStore } = await import('@/stores/businessStore');
    const { useExpenses } = await import('@/composables/useExpenses');

    const db = getFirestore();
    const businessStore = useBusinessStore();
    const businessId = businessStore.getBusinessId;
    const { getExpenseById, updateExpenseMetadata } = useExpenses();

    console.log('🗑️ [DELETE MATERIAL EXPENSE] Iniciando eliminación de compra de materiales:', transactionToDelete.uuid);

    // 1. REVERTIR STOCK DE MATERIALES - Restar lo que se compró
    // Usar materialItemsAndStockLogs si existe, sino usar materialItems (fallback para transacciones antiguas)
    const stockLogsToRevert = transactionToDelete.materialItemsAndStockLogs && transactionToDelete.materialItemsAndStockLogs.length > 0
      ? transactionToDelete.materialItemsAndStockLogs
      : (transactionToDelete.materialItems || []).map(item => ({
        itemUuid: item.productId,
        stockLogUuid: item.stockLogId
      })).filter(log => log.itemUuid && log.stockLogUuid);

    console.log(`  📦 StockLogs a revertir: ${stockLogsToRevert.length}`, stockLogsToRevert);

    if (stockLogsToRevert.length > 0) {
      for (const materialLog of stockLogsToRevert) {
        const { itemUuid, stockLogUuid } = materialLog;

        console.log(`  📦 Revirtiendo stock de material ${itemUuid}, stockLog ${stockLogUuid}`);

        try {
          const productRef = doc(db, `businesses/${businessId}/products`, itemUuid);
          const productDoc = await getDoc(productRef);

          if (!productDoc.exists()) {
            console.warn(`  ⚠️ Producto ${itemUuid} no encontrado, saltando...`);
            continue;
          }

          const productData = productDoc.data();
          const stockLog = productData.stockLog?.find(log => log.uuid === stockLogUuid);

          if (!stockLog) {
            console.warn(`  ⚠️ StockLog ${stockLogUuid} no encontrado, saltando...`);
            continue;
          }

          // Restar la cantidad comprada del stock actual
          const newStock = Math.max((productData.stock || 0) - (stockLog.quantity || 0), 0);

          // Eliminar el stockLog del array
          const updatedStockLogs = productData.stockLog.filter(log => log.uuid !== stockLogUuid);

          await updateDoc(productRef, {
            stock: newStock,
            stockLog: updatedStockLogs
          });

          console.log(`  ✅ Stock revertido: ${productData.stock} - ${stockLog.quantity} = ${newStock}`);

          await logInventoryOperation('revert', itemUuid, {
            reason: 'material_expense_deleted',
            stockLogId: stockLogUuid,
            quantityReverted: stockLog.quantity,
            previousStock: productData.stock,
            newStock
          });
        } catch (itemError) {
          console.error(`  ❌ Error revirtiendo stock para ${itemUuid}:`, itemError);
        }
      }
    }

    // 2. ELIMINAR LOG DEL EXPENSE
    const expenseId = transactionToDelete.expenseId;

    if (expenseId) {
      console.log(`  📊 Eliminando log del expense ${expenseId}`);

      try {
        const expense = await getExpenseById(expenseId);

        if (expense && expense.logs) {
          // Filtrar el log que referencia esta transacción
          const updatedLogs = expense.logs.filter(
            log => log.transactionRef !== transactionToDelete.uuid
          );

          const expenseRef = doc(db, `businesses/${businessId}/expenses`, expenseId);

          // Si no quedan logs, podríamos considerar eliminar el expense completo
          if (updatedLogs.length === 0) {
            console.log(`  🗑️ No quedan logs, eliminando expense completo`);
            const { deleteDoc } = await import('firebase/firestore');
            await deleteDoc(expenseRef);
          } else {
            await updateDoc(expenseRef, { logs: updatedLogs });

            // 3. ACTUALIZAR METADATA DEL EXPENSE
            await updateExpenseMetadata(expenseId);
          }
        }
      } catch (expenseError) {
        console.error(`  ❌ Error actualizando expense ${expenseId}:`, expenseError);
      }
    }

    // 4. ELIMINAR LA TRANSACCIÓN
    await deleteTransactionByID(transactionToDelete.uuid);

    // 5. LOG DE TRAZABILIDAD
    await logTransactionOperation('delete', transactionToDelete.uuid, transactionToDelete, {
      reason: 'user_expense_transaction_deletion',
      severity: 'high',
      tags: ['transaction_delete', 'expense', 'expense_materials', 'stock_reverted'],
      relatedEntities: [
        {
          type: 'expense',
          id: expenseId,
          relationship: 'log_removed_metadata_updated',
          impact: 'high'
        },
        ...(transactionToDelete.materialItems || []).map(m => ({
          type: 'product',
          id: m.productId,
          relationship: 'stock_reverted',
          impact: 'high'
        }))
      ],
      component: 'TransactionStore.deleteMaterialExpenseTransaction'
    });

    console.log('✅ [DELETE MATERIAL EXPENSE] Compra de materiales eliminada exitosamente');
  };

  /**
   * Elimina una transacción tipo expense (otros) sin stock
   */
  const deleteOtherExpenseTransaction = async (transactionToDelete) => {
    const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
    const { useBusinessStore } = await import('@/stores/businessStore');
    const { useExpenses } = await import('@/composables/useExpenses');

    const db = getFirestore();
    const businessStore = useBusinessStore();
    const businessId = businessStore.getBusinessId;
    const { getExpenseById, updateExpenseMetadata } = useExpenses();

    console.log('🗑️ [DELETE OTHER EXPENSE] Iniciando eliminación de gasto:', transactionToDelete.uuid);

    // 1. ELIMINAR LOG DEL EXPENSE
    const expenseId = transactionToDelete.expenseId;

    if (expenseId) {
      console.log(`  📊 Eliminando log del expense ${expenseId}`);

      try {
        const expense = await getExpenseById(expenseId);

        if (expense && expense.logs) {
          const updatedLogs = expense.logs.filter(
            log => log.transactionRef !== transactionToDelete.uuid
          );

          const expenseRef = doc(db, `businesses/${businessId}/expenses`, expenseId);

          if (updatedLogs.length === 0) {
            console.log(`  🗑️ No quedan logs, eliminando expense completo`);
            const { deleteDoc } = await import('firebase/firestore');
            await deleteDoc(expenseRef);
          } else {
            await updateDoc(expenseRef, { logs: updatedLogs });

            // 2. ACTUALIZAR METADATA
            await updateExpenseMetadata(expenseId);
          }
        }
      } catch (expenseError) {
        console.error(`  ❌ Error actualizando expense ${expenseId}:`, expenseError);
      }
    }

    // 3. ELIMINAR TRANSACCIÓN
    await deleteTransactionByID(transactionToDelete.uuid);

    // 4. LOG DE TRAZABILIDAD
    await logTransactionOperation('delete', transactionToDelete.uuid, transactionToDelete, {
      reason: 'user_expense_transaction_deletion',
      severity: 'high',
      tags: ['transaction_delete', 'expense', `expense_${transactionToDelete.category}`, 'no_stock_impact'],
      relatedEntities: [
        {
          type: 'expense',
          id: expenseId,
          relationship: 'log_removed_metadata_updated',
          impact: 'high'
        }
      ],
      component: 'TransactionStore.deleteOtherExpenseTransaction'
    });

    console.log('✅ [DELETE OTHER EXPENSE] Gasto eliminado exitosamente');
  };

  /**
   * Elimina un payment específico del array payments[] de una transacción income
   * Sin eliminar la transacción payment completa de Firestore
   * @param {string} paymentUuid - UUID del payment en el array payments[]
   * @param {string} incomeTransactionId - UUID de la transacción income original
   */
  const deletePaymentFromIncomeTransaction = async (paymentUuid, incomeTransactionId) => {
    const { useClientStore } = await import('@/stores/clientStore');
    const { useBusinessStore } = await import('@/stores/businessStore');
    const clientStore = useClientStore();
    const businessStore = useBusinessStore();

    console.log('🗑️ [DELETE PAYMENT FROM ARRAY] Iniciando eliminación de payment:', {
      paymentUuid,
      incomeTransactionId
    });

    // 1. OBTENER TRANSACCIÓN INCOME ORIGINAL
    let incomeTransaction = transactionsInStore.value.find(
      t => t.uuid === incomeTransactionId
    );

    // Si no se encuentra por uuid, intentar buscar por id
    if (!incomeTransaction) {
      incomeTransaction = transactionsInStore.value.find(
        t => t.id === incomeTransactionId
      );
    }

    // Si aún no se encuentra, buscar en Firestore
    if (!incomeTransaction) {
      console.log('⚠️ Transacción income no encontrada en store, buscando en Firestore...');

      const businessId = businessStore.business?.id;
      if (!businessId) {
        throw new Error('❌ No se pudo obtener el businessId');
      }

      try {
        const db = getFirestore();
        const transactionRef = doc(db, 'businesses', businessId, 'transactions', incomeTransactionId);
        const transactionSnap = await import('firebase/firestore').then(({ getDoc }) => getDoc(transactionRef));

        if (transactionSnap.exists()) {
          const data = transactionSnap.data();
          incomeTransaction = {
            id: transactionSnap.id,
            ...data,
            // Convertir Timestamps si es necesario
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
          };
          console.log('✅ Transacción income cargada desde Firestore:', incomeTransaction.uuid || incomeTransaction.id);
        } else {
          throw new Error('⚠️ Transacción income no encontrada en Firestore');
        }
      } catch (error) {
        console.error('❌ Error al cargar transacción desde Firestore:', error);
        throw new Error('⚠️ No se pudo cargar la transacción income. Verifica que la venta original exista.');
      }
    }

    console.log(`  📝 Transacción income encontrada: ${incomeTransaction.uuid}`);

    // 2. ELIMINAR PAYMENT DEL ARRAY payments[]
    const updatedPayments = (incomeTransaction.payments || []).filter(
      p => p.uuid !== paymentUuid
    );

    console.log(`  🔄 Payments actualizados: ${incomeTransaction.payments?.length || 0} → ${updatedPayments.length}`);

    // 3. RECALCULAR ESTADO DE PAGO
    const updatedStatus = calculatePaymentStatus({
      ...incomeTransaction,
      payments: updatedPayments
    });

    console.log(`  💰 Estado recalculado:`, {
      paymentStatus: updatedStatus.paymentStatus,
      totalPaid: updatedStatus.totalPaid,
      balance: updatedStatus.balance
    });

    // 4. ACTUALIZAR TRANSACCIÓN INCOME
    await updateTransaction(incomeTransaction.uuid, {
      payments: updatedPayments,
      paymentStatus: updatedStatus.paymentStatus,
      totalPaid: updatedStatus.totalPaid,
      balance: updatedStatus.balance
    });

    console.log(`  ✅ Transacción income actualizada`);

    // 4.5. ELIMINAR LA TRANSACCIÓN PAYMENT DE FIRESTORE
    await deleteTransactionByID(paymentUuid);
    console.log(`  🗑️ Payment eliminado de Firestore`);

    // 5. ACTUALIZAR METADATA DEL CLIENTE
    if (incomeTransaction.clientId && incomeTransaction.clientId !== ANONYMOUS_CLIENT_ID) {
      console.log(`  👤 Actualizando metadata del cliente ${incomeTransaction.clientId}`);
      await clientStore.updateClientMetadata(incomeTransaction.clientId);
    }

    // 6. LOG DE TRAZABILIDAD
    await logTransactionOperation('update', incomeTransaction.uuid, incomeTransaction, {
      reason: 'payment_removed_from_array',
      severity: 'high',
      tags: ['payment_delete', 'income_updated', 'balance_recalculated'],
      relatedEntities: [
        {
          type: 'payment',
          id: paymentUuid,
          relationship: 'removed_from_payments_array',
          impact: 'high'
        },
        {
          type: 'client',
          id: incomeTransaction.clientId,
          relationship: 'metadata_recalculated',
          impact: 'medium'
        }
      ],
      component: 'TransactionStore.deletePaymentFromIncomeTransaction'
    });

    console.log('✅ [DELETE PAYMENT FROM ARRAY] Payment eliminado del array exitosamente');

    return {
      success: true,
      updatedTransaction: {
        ...incomeTransaction,
        payments: updatedPayments,
        ...updatedStatus
      }
    };
  };

  /**
   * Elimina una transacción tipo payment y actualiza la venta original
   */
  const deletePaymentTransaction = async (transactionToDelete) => {
    const { useClientStore } = await import('@/stores/clientStore');
    const clientStore = useClientStore();

    console.log('🗑️ [DELETE PAYMENT] Iniciando eliminación de pago:', transactionToDelete.uuid);

    // 1. OBTENER VENTA ORIGINAL
    const originalTransaction = transactionsInStore.value.find(
      t => t.uuid === transactionToDelete.relatedTransactionId
    );

    if (!originalTransaction) {
      console.warn('⚠️ Venta original no encontrada, solo eliminando payment');
      await deleteTransactionByID(transactionToDelete.uuid);
      return;
    }

    console.log(`  📝 Venta original encontrada: ${originalTransaction.uuid}`);

    // 2. ELIMINAR PAYMENT DEL ARRAY payments[]
    const updatedPayments = (originalTransaction.payments || []).filter(
      p => p.uuid !== transactionToDelete.uuid
    );

    console.log(`  🔄 Payments actualizados: ${originalTransaction.payments?.length || 0} → ${updatedPayments.length}`);

    // 3. RECALCULAR ESTADO DE PAGO
    const updatedStatus = calculatePaymentStatus({
      ...originalTransaction,
      payments: updatedPayments
    });

    console.log(`  💰 Estado recalculado:`, {
      paymentStatus: updatedStatus.paymentStatus,
      totalPaid: updatedStatus.totalPaid,
      balance: updatedStatus.balance
    });

    // 4. ACTUALIZAR VENTA ORIGINAL
    await updateTransaction(originalTransaction.uuid, {
      payments: updatedPayments,
      paymentStatus: updatedStatus.paymentStatus,
      totalPaid: updatedStatus.totalPaid,
      balance: updatedStatus.balance
    });

    // 5. ELIMINAR TRANSACCIÓN PAYMENT (ANTES de actualizar metadata)
    await deleteTransactionByID(transactionToDelete.uuid);
    console.log(`  🗑️ Payment eliminado de Firestore`);

    // 6. ACTUALIZAR METADATA DEL CLIENTE (DESPUÉS de eliminar para que el recálculo sea correcto)
    if (originalTransaction.clientId && originalTransaction.clientId !== ANONYMOUS_CLIENT_ID) {
      console.log(`  👤 Actualizando metadata del cliente ${originalTransaction.clientId}`);
      await clientStore.updateClientMetadata(originalTransaction.clientId);
    }

    // 7. LOG DE TRAZABILIDAD
    await logTransactionOperation('delete', transactionToDelete.uuid, transactionToDelete, {
      reason: 'user_payment_transaction_deletion',
      severity: 'high',
      tags: ['transaction_delete', 'payment', 'income_recalculated'],
      relatedEntities: [
        {
          type: 'transaction',
          id: transactionToDelete.relatedTransactionId,
          relationship: 'payment_removed_balance_recalculated',
          impact: 'high'
        },
        {
          type: 'client',
          id: originalTransaction.clientId,
          relationship: 'metadata_recalculated',
          impact: 'medium'
        }
      ],
      component: 'TransactionStore.deletePaymentTransaction'
    });

    console.log('✅ [DELETE PAYMENT] Pago eliminado exitosamente');
  };

  /**
   * Elimina una transacción tipo transfer
   */
  const deleteTransferTransaction = async (transactionToDelete) => {
    console.log('🗑️ [DELETE TRANSFER] Iniciando eliminación de transferencia:', transactionToDelete.uuid);

    // NO REQUIERE REVERSIÓN DE DATOS
    await deleteTransactionByID(transactionToDelete.uuid);

    // LOG DE TRAZABILIDAD
    await logTransactionOperation('delete', transactionToDelete.uuid, transactionToDelete, {
      reason: 'user_transfer_transaction_deletion',
      severity: 'medium',
      tags: ['transaction_delete', 'transfer'],
      component: 'TransactionStore.deleteTransferTransaction'
    });

    console.log('✅ [DELETE TRANSFER] Transferencia eliminada exitosamente');
  };

  /**
   * Elimina una transacción tipo closure (solo del día actual)
   * Opening es inmutable y nunca se puede eliminar
   */
  const deleteClosureTransaction = async (transactionToDelete) => {
    console.log('🗑️ [DELETE CLOSURE] Iniciando eliminación de cierre del día actual:', transactionToDelete.uuid);

    // ELIMINAR TRANSACCIÓN
    await deleteTransactionByID(transactionToDelete.uuid);

    // LOG DE TRAZABILIDAD CRÍTICA
    await logTransactionOperation('delete', transactionToDelete.uuid, transactionToDelete, {
      reason: 'user_closure_deletion_current_day',
      severity: 'critical',
      tags: ['transaction_delete', 'closure', 'same_day_operation', 'reopening_day'],
      component: 'TransactionStore.deleteClosureTransaction'
    });

    console.log('✅ [DELETE CLOSURE] Cierre eliminado exitosamente - El día queda abierto');
  };

  /**
   * Función principal de eliminación con integridad referencial
   * @param {string} transactionID - UUID de la transacción a eliminar
   * @param {Function} confirmCallback - Función callback que devuelve una promesa de confirmación
   * @returns {Promise<Object>} Resultado de la operación: { success: true } o { cancelled: true }
   */
  const deleteOneTransactionByID = async (transactionID, confirmCallback = null) => {
    try {
      // 0. OBTENER TRANSACCIÓN
      const transactionToDelete = transactionsInStore.value.find(t => t.uuid === transactionID);

      if (!transactionToDelete) {
        throw new Error(`Transaction with ID ${transactionID} not found in store`);
      }

      console.log('🗑️ [DELETE] Iniciando eliminación de transacción:', {
        uuid: transactionID,
        type: transactionToDelete.type,
        createdAt: transactionToDelete.createdAt?.toDate?.()?.toISOString?.() || 'unknown'
      });

      // 1. VALIDAR TIPO (opening inmutable, closure solo del día actual)
      if (transactionToDelete.type === 'opening') {
        throw new Error(
          '❌ No se pueden eliminar transacciones de tipo "opening".\n\n' +
          'Las aperturas son inmutables para mantener la integridad contable.'
        );
      }

      if (transactionToDelete.type === 'closure') {
        const isFromToday = isTransactionFromToday(transactionToDelete);

        if (!isFromToday) {
          throw new Error(
            '❌ No se pueden eliminar cierres de días anteriores.\n\n' +
            'Solo puedes eliminar el cierre del día actual para mantener la integridad contable.'
          );
        }

        console.log('⚠️ Eliminando cierre del día actual - Validación aprobada');
      }

      // 2. MOSTRAR MODAL DE CONFIRMACIÓN (si se proporciona callback)
      if (confirmCallback) {
        // Buscar payments relacionados para income
        const relatedPayments = transactionToDelete.type === 'income'
          ? transactionsInStore.value.filter(
            t => t.type === 'payment' && t.relatedTransactionId === transactionToDelete.uuid
          )
          : [];

        const confirmed = await confirmCallback({
          transaction: transactionToDelete,
          relatedPayments
        });

        if (!confirmed) {
          console.log('❌ Usuario canceló la eliminación');
          return { cancelled: true };
        }
      }

      // 3. EJECUTAR ELIMINACIÓN SEGÚN TIPO
      console.log(`🔄 Ejecutando eliminación para tipo: ${transactionToDelete.type}`);

      switch (transactionToDelete.type) {
        case 'income':
          await deleteIncomeTransaction(transactionToDelete);
          break;

        case 'expense':
          if (transactionToDelete.category === 'materials') {
            await deleteMaterialExpenseTransaction(transactionToDelete);
          } else {
            await deleteOtherExpenseTransaction(transactionToDelete);
          }
          break;

        case 'payment':
          await deletePaymentTransaction(transactionToDelete);
          break;

        case 'transfer':
          await deleteTransferTransaction(transactionToDelete);
          break;

        case 'closure':
          // Solo se permite eliminar closure del día actual (validación ya hecha arriba)
          await deleteClosureTransaction(transactionToDelete);
          break;

        default:
          throw new Error(`Unknown transaction type: ${transactionToDelete.type}`);
      }

      // 4. LOG DE TRAZABILIDAD GENERAL
      await logTransactionOperation(
        'delete',
        transactionID,
        transactionToDelete,
        {
          reason: 'user_transaction_deletion_completed',
          severity: 'high',
          tags: ['transaction_delete', `type_${transactionToDelete.type}`, 'data_removal'],
          component: 'TransactionStore.deleteOneTransactionByID'
        }
      );

      console.log('✅ [DELETE] Transaction deleted successfully with data integrity maintained');

      // 5. REFRESCAR STORE LOCAL
      await getTransactions();

      // 6. EL dailySummary SE RECALCULARÁ AUTOMÁTICAMENTE
      // por el onTransactionWrite de Firebase Functions

      return { success: true };

    } catch (error) {
      console.error('❌ [DELETE] Error deleting transaction: ', error);

      // Log de error
      await logTransactionOperation(
        'error',
        transactionID,
        { error: error.message },
        {
          reason: 'transaction_deletion_failed',
          severity: 'critical',
          tags: ['transaction_error', 'deletion_failure'],
          component: 'TransactionStore.deleteOneTransactionByID'
        }
      );

      throw error;
    }
  }; const getSteps = () => {
    const baseSteps = [
      "IncomeOrExpense",
      "CashOrBank",
      "AddIncomeOrExpense",
      "Summary",
    ];
    return transactionsInStore.value.length === 0
      ? ["CajaDiaria", ...baseSteps]
      : baseSteps;
  };

  const totalSteps = computed(() => getSteps().length);


  const hasCajaDiaria = computed(() => getSteps()[0] === "CajaDiaria");

  // Función helper para verificar si una transacción es de hoy
  const isTransactionFromToday = (transaction) => {
    if (!transaction.createdAt) return false;

    const today = new Date();
    const transactionDate = transaction.createdAt.toDate ? transaction.createdAt.toDate() : new Date(transaction.createdAt);

    return (
      transactionDate.getDate() === today.getDate() &&
      transactionDate.getMonth() === today.getMonth() &&
      transactionDate.getFullYear() === today.getFullYear()
    );
  };

  // Función para verificar si hay un cierre hoy
  const hasClosureToday = () => {
    return transactionsInStore.value.some(
      (transaction) => transaction.type === "closure" && isTransactionFromToday(transaction)
    );
  };

  /**
   * Agrega un nuevo pago a una transacción existente
   * @param {string} transactionId - UUID de la transacción
   * @param {Object} paymentData - Datos del nuevo pago
   */
  const addPayment = async (transactionId, paymentData) => {
    try {
      console.log('💰 Agregando pago a transacción:', transactionId);

      // Obtener la transacción del store
      const transaction = transactionsInStore.value.find(t => t.uuid === transactionId);

      if (!transaction) {
        throw new Error('Transacción no encontrada');
      }

      // Crear el objeto de pago completo
      const newPayment = {
        uuid: paymentData.uuid || crypto.randomUUID(),
        amount: paymentData.amount,
        date: paymentData.date || Timestamp.now(),
        method: paymentData.method,
        notes: paymentData.notes || '',
        registeredBy: paymentData.registeredBy
      };

      // Actualizar el array de payments
      const updatedPayments = [...(transaction.payments || []), newPayment];

      // Recalcular estado de pago
      const calculatedFields = calculatePaymentStatus({
        ...transaction,
        payments: updatedPayments
      });

      // Preparar actualización
      const updates = {
        payments: updatedPayments,
        paymentStatus: calculatedFields.paymentStatus,
        totalPaid: calculatedFields.totalPaid,
        balance: calculatedFields.balance
      };

      // Actualizar en Firestore
      const { updateTransaction } = useTransaccion();
      await updateTransaction(transactionId, updates);

      // Actualizar en el store local
      const index = transactionsInStore.value.findIndex(t => t.uuid === transactionId);
      if (index !== -1) {
        transactionsInStore.value[index] = {
          ...transactionsInStore.value[index],
          ...updates
        };
      }

      console.log('✅ Pago agregado exitosamente');
      return newPayment;
    } catch (error) {
      console.error('❌ Error agregando pago:', error);
      throw error;
    }
  };

  /**
   * Establece la información del cliente para la transacción
   */
  const setClientInfo = (clientId, clientName) => {
    transactionToAdd.value.clientId = clientId;
    transactionToAdd.value.clientName = clientName;
  };

  /**
   * Establece la información de pago para la transacción
   */
  const setPaymentInfo = (paymentMethod, isPartialPayment, partialAmount = null) => {
    console.log('💰 setPaymentInfo called:', {
      paymentMethod,
      isPartialPayment,
      partialAmount,
      currentPaymentStatus: transactionToAdd.value.paymentStatus
    });

    if (isPartialPayment && partialAmount) {
      // Pago parcial: crear payment con el monto parcial
      transactionToAdd.value.payments = [{
        uuid: crypto.randomUUID(),
        amount: partialAmount,
        date: Timestamp.now(),
        account: paymentMethod,
        notes: 'Pago inicial',
        registeredBy: transactionToAdd.value.userId || 'unknown'
      }];

      // Calcular estado
      const total = getTransactionToAddTotal();
      const calculatedFields = calculatePaymentStatus({
        ...transactionToAdd.value,
        total
      });

      transactionToAdd.value.paymentStatus = calculatedFields.paymentStatus;
      transactionToAdd.value.totalPaid = calculatedFields.totalPaid;
      transactionToAdd.value.balance = calculatedFields.balance;

      console.log('✅ Pago parcial establecido:', {
        paymentStatus: transactionToAdd.value.paymentStatus,
        totalPaid: transactionToAdd.value.totalPaid,
        balance: transactionToAdd.value.balance,
        payments: transactionToAdd.value.payments
      });
    } else {
      // Pago completo: se manejará en addTransaction
      transactionToAdd.value.payments = [];
      transactionToAdd.value.paymentStatus = 'completed';
      transactionToAdd.value.account = paymentMethod; // Mantener compatibilidad

      console.log('✅ Pago completo establecido:', {
        paymentStatus: transactionToAdd.value.paymentStatus,
        account: transactionToAdd.value.account
      });
    }
  };

  /**
   * Crea una transacción tipo 'payment' y actualiza la venta original
   * @param {Object} paymentData
   * @param {string} paymentData.relatedTransactionId - UUID de la venta
   * @param {number} paymentData.amount - Monto del pago
   * @param {string} paymentData.account - Método: cash|bank|yape|plin
   * @param {string} [paymentData.notes] - Notas opcionales
   */
  const createPaymentTransaction = async (paymentData) => {
    try {
      // Importar stores necesarios
      const { useAuthStore } = await import('@/stores/authStore');
      const { useBusinessStore } = await import('@/stores/businessStore');
      const { useClientStore } = await import('@/stores/clientStore');

      const authStore = useAuthStore();
      const businessStore = useBusinessStore();
      const currentUser = authStore.user;
      const businessId = businessStore.getBusinessId;

      if (!businessId) {
        throw new Error('No hay negocio activo');
      }
      if (!currentUser) {
        throw new Error('Usuario no autenticado');
      }

      console.log('💰 [PAYMENT] Iniciando creación de pago:', {
        relatedTransactionId: paymentData.relatedTransactionId,
        amount: paymentData.amount,
        account: paymentData.account
      });

      // 1. Obtener la transacción original
      const originalTransaction = transactionsInStore.value.find(
        t => t.uuid === paymentData.relatedTransactionId
      );

      if (!originalTransaction) {
        throw new Error('Transacción original no encontrada');
      }

      if (originalTransaction.type !== 'income') {
        throw new Error('Solo se pueden registrar pagos para ingresos');
      }

      console.log('📊 [PAYMENT] Transacción original encontrada:', {
        uuid: originalTransaction.uuid,
        type: originalTransaction.type,
        createdAt: originalTransaction.createdAt,
        balance: originalTransaction.balance
      });

      // 2. Validar el pago
      const validation = validateNewPayment(originalTransaction, paymentData.amount);
      if (!validation.valid) {
        throw new Error(validation.message);
      }

      // 3. Calcular balances
      const currentStatus = calculatePaymentStatus(originalTransaction);
      const previousBalance = currentStatus.balance;
      const newBalance = Math.max(previousBalance - paymentData.amount, 0);


      const paymentTransactionUuid = crypto.randomUUID(); // ✅ UUID único

      // 4. Crear el objeto payment para agregar al array
      const newPaymentEntry = {
        uuid: paymentTransactionUuid,
        amount: paymentData.amount,
        date: Timestamp.now(),
        account: paymentData.account,
        notes: paymentData.notes || `Pago registrado el ${new Date().toLocaleDateString('es-PE')}`,
        registeredBy: currentUser.uid
      };

      // 5. Crear la transacción tipo 'payment'

      const paymentTransaction = {
        uuid: paymentTransactionUuid,
        type: 'payment',
        amount: paymentData.amount,
        account: paymentData.account,
        createdAt: Timestamp.now(),

        // Referencia
        relatedTransactionId: originalTransaction.uuid,
        relatedTransactionTotal: originalTransaction.total || originalTransaction.amount || 0,

        // Cliente
        clientId: originalTransaction.clientId || ANONYMOUS_CLIENT_ID,
        clientName: originalTransaction.clientName || 'Cliente Anónimo',

        // Cálculos
        previousBalance,
        newBalance,

        // Metadata
        notes: paymentData.notes || '',
        registeredBy: currentUser.uid,
        businessId,
        userId: currentUser.uid
      };

      console.log('🆕 [PAYMENT] Nueva transacción payment creada:', {
        uuid: paymentTransaction.uuid,
        type: paymentTransaction.type,
        createdAt: paymentTransaction.createdAt,
        relatedTo: paymentTransaction.relatedTransactionId,
        amount: paymentTransaction.amount
      });

      // 6. Actualizar la transacción original
      const updatedPayments = [...(originalTransaction.payments || []), newPaymentEntry];
      const updatedStatus = calculatePaymentStatus({
        ...originalTransaction,
        payments: updatedPayments,
        total: originalTransaction.total || originalTransaction.amount || 0
      });

      console.log('🔄 [PAYMENT] Actualizando venta original:', {
        uuid: originalTransaction.uuid,
        newPaymentsCount: updatedPayments.length,
        newStatus: updatedStatus.paymentStatus,
        newBalance: updatedStatus.balance
      });

      // 7. Batch update en Firestore
      const db = getFirestore();
      const batch = writeBatch(db);

      // Crear payment transaction
      const paymentRef = doc(db, 'businesses', businessId, 'transactions', paymentTransactionUuid);
      batch.set(paymentRef, paymentTransaction);

      console.log('📝 [PAYMENT] Agregando payment transaction al batch:', {
        path: `businesses/${businessId}/transactions/${paymentTransactionUuid}`,
        type: paymentTransaction.type,
        createdAt: paymentTransaction.createdAt
      });

      // Actualizar transacción original
      const originalRef = doc(db, 'businesses', businessId, 'transactions', originalTransaction.uuid);
      batch.update(originalRef, {
        payments: updatedPayments,
        paymentStatus: updatedStatus.paymentStatus,
        totalPaid: updatedStatus.totalPaid,
        balance: updatedStatus.balance,
        updatedAt: Timestamp.now()
      });

      console.log('📝 [PAYMENT] Actualizando venta original en batch:', {
        path: `businesses/${businessId}/transactions/${originalTransaction.uuid}`,
        paymentsCount: updatedPayments.length,
        paymentStatus: updatedStatus.paymentStatus
      });

      await batch.commit();
      console.log('✅ [PAYMENT] Batch commit exitoso');

      // 8. Actualizar metadata del cliente si existe
      if (originalTransaction.clientId && originalTransaction.clientId !== ANONYMOUS_CLIENT_ID) {
        const clientStore = useClientStore();
        await clientStore.updateClientMetadata(originalTransaction.clientId);
        console.log('✅ [PAYMENT] Metadata del cliente actualizada');
      }

      // 9. Actualizar state local
      transactionsInStore.value.push(paymentTransaction);
      const index = transactionsInStore.value.findIndex(t => t.uuid === originalTransaction.uuid);
      if (index !== -1) {
        transactionsInStore.value[index] = {
          ...transactionsInStore.value[index],
          payments: updatedPayments,
          ...updatedStatus
        };
      }

      console.log('✅ [PAYMENT] Pago registrado exitosamente:', {
        paymentId: paymentTransaction.uuid,
        amount: paymentTransaction.amount,
        newBalance: updatedStatus.balance,
        newStatus: updatedStatus.paymentStatus,
        createdAt: 'HOY (Timestamp.now())'
      });

      return { success: true, paymentTransaction };

    } catch (error) {
      console.error('❌ Error creando pago:', error);
      throw error;
    }
  };

  /**
   * Genera el próximo número de cotización automáticamente
   * Formato: COT-YYYY-####
   */
  const getNextQuoteNumber = async () => {
    try {
      const businessId = ensureBusinessId();
      const db = getFirestore();
      const currentYear = new Date().getFullYear();

      // Buscar todas las cotizaciones del año actual
      const { collection, query, where, getDocs, orderBy, limit } = await import('firebase/firestore');
      const quotesRef = collection(db, 'businesses', businessId, 'quotes');
      const q = query(
        quotesRef,
        where('year', '==', currentYear),
        orderBy('quoteNumber', 'desc'),
        limit(1)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        // Primera cotización del año
        return `COT-${currentYear}-0001`;
      }

      // Obtener el último número y sumar 1
      const lastQuote = snapshot.docs[0].data();
      const lastNumber = parseInt(lastQuote.quoteNumber.split('-')[2]) || 0;
      const nextNumber = lastNumber + 1;

      return `COT-${currentYear}-${String(nextNumber).padStart(4, '0')}`;

    } catch (error) {
      console.error('❌ Error generando número de cotización:', error);
      // Fallback
      const currentYear = new Date().getFullYear();
      return `COT-${currentYear}-${String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')}`;
    }
  };

  /**
   * Guarda una cotización en Firestore
   * Las cotizaciones NO afectan inventario ni cuentas, solo se guardan para referencia
   * @param {number} expirationDays - Días de validez de la cotización
   */
  const addQuote = async (expirationDays = 15) => {
    try {
      console.log('📋 Iniciando guardado de cotización...');

      // Validaciones básicas
      if (!transactionToAdd.value.items || transactionToAdd.value.items.length === 0) {
        throw new Error('La cotización debe tener al menos un producto');
      }

      // Generar UUID y número de cotización
      const quoteUuid = uuidv4();
      const quoteNumber = await getNextQuoteNumber();
      const businessId = ensureBusinessId();
      const currentUser = await import('@/composables/useAuth').then(m => m.useAuth().getCurrentUser());

      // Calcular total
      const total = getTransactionToAddTotal();

      // Calcular fecha de expiración
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + expirationDays);

      // Crear objeto de cotización
      const quote = {
        uuid: quoteUuid,
        quoteNumber: quoteNumber,
        type: 'quote',
        status: 'pending', // pending | converted | cancelled | expired

        // Fechas
        createdAt: serverTimestamp(),
        expiresAt: Timestamp.fromDate(expirationDate),
        year: new Date().getFullYear(),
        expirationDays: expirationDays,

        // Cliente
        clientId: transactionToAdd.value.clientId || ANONYMOUS_CLIENT_ID,
        clientName: transactionToAdd.value.clientName || 'Cliente Anónimo',

        // Productos
        items: transactionToAdd.value.items.map(item => ({
          uuid: item.uuid || item.selectedProductUuid,
          name: item.name || item.description,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit || 'unidad',
          price: item.price,
          totalItemPrice: item.price * item.quantity
        })),

        // Totales
        total: total,
        amount: total,
        itemsCount: transactionToAdd.value.items.length,

        // Metadata
        businessId: businessId,
        userId: currentUser?.uid || 'unknown',
        convertedToTransactionId: null, // Se llenará cuando se convierta a venta
        convertedAt: null,

        // Notas
        notes: transactionToAdd.value.notes || ''
      };

      console.log('📋 Guardando cotización:', {
        quoteNumber: quote.quoteNumber,
        total: quote.total,
        itemsCount: quote.itemsCount,
        clientName: quote.clientName,
        expiresAt: expirationDate
      });

      // Guardar en Firestore en colección separada 'quotes'
      const db = getFirestore();
      const { doc, setDoc } = await import('firebase/firestore');
      const quoteRef = doc(db, 'businesses', businessId, 'quotes', quoteUuid);

      await setDoc(quoteRef, quote);

      console.log('✅ Cotización guardada exitosamente:', quoteNumber);

      // Actualizar metadata del cliente si existe
      if (quote.clientId && quote.clientId !== ANONYMOUS_CLIENT_ID) {
        try {
          const { useClientStore } = await import('@/stores/clientStore');
          const clientStore = useClientStore();
          await clientStore.updateClientMetadata(quote.clientId);
          console.log('✅ Metadata del cliente actualizada');
        } catch (clientError) {
          console.warn('⚠️ No se pudo actualizar metadata del cliente:', clientError);
        }
      }

      status.value = 'success';
      return { success: true, quoteNumber: quote.quoteNumber, quoteUuid: quote.uuid };

    } catch (error) {
      console.error('❌ Error guardando cotización:', error);
      status.value = 'error';
      throw error;
    }
  };

  return {
    transactionsInStore,
    transactionToAdd,
    currentStepOfAddTransaction,
    itemToAddInTransaction,
    itemToAddInExpenseMaterial,
    status,
    addTransaction,
    addQuote,
    getNextQuoteNumber,
    getTransactions,
    getTransactionsToday,
    getTransactionsByDayStore,
    fetchPendingTransactions,
    getLastClosures,
    getOneTransactionDataByID,
    getAllIncomeTransactionsInStore,
    getAllExpenseTransactionsInStore,
    getAllCashTransactionsInStore,
    getAllBankTransactionsInStore,
    deleteOneTransactionByID,
    resetTransactionToAdd,
    resetTransactionInStore,
    modifyTransaction,
    modifyTransactionToAddType,
    modifyTransactionExpenseDescriptionAndCost,
    modifyTransactionExpenseDescription,
    modifyTransactionExpenseCost,
    getTransactionToAddTotal,
    modifyTransactionToAddAccount,
    nextStepToAddTransaction,
    prevStepToAddTransaction,
    modifyItemToAddInTransaction,
    modifyItemToAddInExpenseMaterial,
    resetItemToAddInTransaction,
    resetItemToAddInExpenseMaterial,
    addItemToTransaction,
    addMaterialItemToExpense,
    setExpenseDescription,
    setExpenseAmount,
    setExpenseCategory,
    setTransferFromAccount,
    setTransferToAccount,
    setPayLabor,
    setOverheadUsage,
    setBucket,
    setSplits,
    removeItemToTransaction,
    removeMaterialItemFromExpense,
    getSteps,
    totalSteps,
    hasCajaDiaria,
    hasClosureToday,
    isTransactionFromToday,
    // NUEVAS FUNCIONES PARA PAGOS Y CLIENTES
    addPayment,
    setClientInfo,
    setPaymentInfo,
    createPaymentTransaction,
    deletePaymentFromIncomeTransaction
  };
}