// src/composables/useExpenses.js

import { getFirestore, collection, setDoc, query, where, doc, getDocs, getDoc, deleteDoc, updateDoc, serverTimestamp, arrayUnion, Timestamp } from 'firebase/firestore';
import appFirebase from '@/firebaseInit';
import { ensureBusinessId } from "@/composables/useBusinessUtils";
import { v4 as uuidv4 } from "uuid";
import { classifyOverhead } from '@/utils/overheadClassifier';


const db = getFirestore(appFirebase);

export function useExpenses() {
  /**
   * Busca expenses por descripción (case-insensitive)
   * @param {string} searchTerm - Término de búsqueda
   * @returns {Promise<Array>} Array de expenses que coinciden
   */
  const searchExpensesByDescription = async (searchTerm) => {
    try {
      const businessId = ensureBusinessId();
      const expensesSnapshot = await getDocs(collection(db, `businesses/${businessId}/expenses`));

      const expenses = [];
      const lowerSearchTerm = searchTerm.toLowerCase().trim();

      expensesSnapshot.forEach(doc => {
        const data = doc.data();
        const description = (data.description || '').toLowerCase();

        // Filtrar por descripción que contenga el término de búsqueda
        if (description.includes(lowerSearchTerm)) {
          expenses.push({
            id: doc.id,
            ...data,
          });
        }
      });

      console.log(`✅ Found ${expenses.length} expenses matching "${searchTerm}"`);
      return expenses;
    } catch (error) {
      console.error('❌ Error searching expenses: ', error);
      throw error;
    }
  };

  /**
   * Crea purchaseLogs para cada producto comprado
   * @param {string} businessId - ID del negocio
   * @param {Array} materialItems - Array de materials comprados
   * @param {string} expenseId - UUID del expense
   * @param {Object} logData - Datos del log (date, account, transactionRef)
   */
  const createPurchaseLogs = async (businessId, materialItems, expenseId, logData) => {
    try {
      const purchaseLogsPromises = materialItems
        .filter(item => item.productId) // Solo items con productId
        .map(async (item) => {
          const logId = uuidv4();
          const purchaseLogRef = doc(
            db,
            `businesses/${businessId}/products/${item.productId}/purchaseLogs`,
            logId
          );

          const purchaseLogData = {
            uuid: logId,
            date: logData.date,
            quantity: item.quantity || 0,
            cost: item.cost || 0,
            unit: item.unit || null,
            total: item.totalCost || 0,
            expenseRef: `businesses/${businessId}/expenses/${expenseId}`,
            account: logData.account,
            transactionRef: logData.transactionRef,
            businessId: businessId,
            createdAt: serverTimestamp(),
          };

          await setDoc(purchaseLogRef, purchaseLogData);
          console.log(`✅ PurchaseLog creado para producto ${item.productId}`);
        });

      await Promise.all(purchaseLogsPromises);
      console.log(`✅ ${purchaseLogsPromises.length} purchaseLogs creados`);
    } catch (error) {
      console.error('❌ Error creating purchaseLogs:', error);
      // No throw - permitir que el expense se cree aunque falle esto
    }
  };

  /**
   * Crea un nuevo expense con su primer log
   * @param {Object} expenseData - Datos del expense (description, category, subcategory, bucket, paylabor, overheadUsage, splits)
   * @param {Object} logData - Datos del primer log (amount, date, transactionRef, account, notes, materialItems)
   * @returns {Promise<string>} UUID del expense creado
   */
  const createExpenseWithLog = async (expenseData, logData) => {
    try {
      const businessId = ensureBusinessId();

      // Si se proporciona un UUID específico, usarlo
      const expenseId = expenseData.uuid || uuidv4();

      const now = serverTimestamp();
      const nowDate = new Date();

      // ========================================
      // ESTRUCTURA PARA MATERIALS (NUEVA)
      // ========================================
      if (expenseData.category === 'materials') {
        console.log('📦 Creando expense de MATERIALS (documento separado)');

        // Limpiar materialItems
        const cleanedMaterialItems = (logData.materialItems || []).map(item => ({
          uuid: item.uuid || null,
          productId: item.productId || null,
          description: item.description || null,
          quantity: item.quantity || 0,
          unit: item.unit || null,
          cost: item.cost || 0,
          totalCost: item.totalCost || 0,
          oldOrNewProduct: item.oldOrNewProduct || null,
          stockLogId: item.stockLogId || null,
        }));

        // Extraer productIds para indexación
        const productIds = cleanedMaterialItems
          .map(item => item.productId)
          .filter(Boolean); // Remover nulls

        // Calcular metadata
        const totalItems = cleanedMaterialItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
        const uniqueProducts = new Set(productIds).size;

        const expenseDoc = {
          uuid: expenseId,
          description: expenseData.description,
          category: 'materials',
          bucket: expenseData.bucket || null,
          amount: logData.amount, // Total de la compra
          date: logData.date,
          account: logData.account,
          transactionRef: logData.transactionRef,
          notes: logData.notes || null,
          materialItems: cleanedMaterialItems,
          productIds: productIds, // Para búsquedas indexadas
          metadata: {
            totalItems,
            uniqueProducts,
          },
          createdAt: now,
          updatedAt: now,
        };

        const expenseRef = doc(db, `businesses/${businessId}/expenses`, expenseId);
        await setDoc(expenseRef, expenseDoc);

        // Crear purchaseLogs para cada producto
        await createPurchaseLogs(businessId, cleanedMaterialItems, expenseId, logData);

        console.log('✅ Expense de materials creado:', expenseId, {
          items: cleanedMaterialItems.length,
          productIds: productIds.length,
          amount: logData.amount
        });

        return expenseId;
      }

      // ========================================
      // ESTRUCTURA PARA LABOR/OVERHEAD (CON LOGS)
      // ========================================
      const firstLog = {
        amount: logData.amount,
        date: logData.date,
        transactionRef: logData.transactionRef,
        account: logData.account,
        notes: logData.notes || null,
        logId: uuidv4(),
        createdAt: nowDate,
      };

      const expenseDoc = {
        uuid: expenseId,
        description: expenseData.description,
        category: expenseData.category || null,
        subcategory: expenseData.subcategory || null,
        // Campos de clasificación contable
        bucket: expenseData.bucket || null,
        paylabor: expenseData.paylabor || null,
        overheadUsage: expenseData.overheadUsage || null,
        splits: expenseData.splits || null,
        createdAt: now,
        updatedAt: now,
        logs: [firstLog],
        metadata: {
          totalSpent: logData.amount,
          occurrences: 1,
          lastUsedAt: nowDate,
          averageAmount: logData.amount,
        }
      };

      // ========================================
      // CLASIFICACIÓN AUTOMÁTICA DE OVERHEAD
      // ========================================
      if (expenseData.category === 'overhead') {
        console.log('🔍 Detectado expense tipo overhead, aplicando clasificación local...');

        const classification = classifyOverhead(expenseData.description);

        if (classification) {
          // Match exitoso con reglas locales
          expenseDoc.subcategory = classification.subcategory;
          expenseDoc.subsubcategory = classification.subsubcategory || null;
          expenseDoc.classificationSource = 'local_rules';
          expenseDoc.classificationConfidence = classification.confidence;
          expenseDoc.classificationMatchedRule = classification.matchedRule;

          console.log('✅ Overhead clasificado localmente:', {
            subcategory: classification.subcategory,
            subsubcategory: classification.subsubcategory,
            confidence: classification.confidence
          });
        } else {
          // Sin match local, marcar para procesamiento por IA
          expenseDoc.subcategory = null;
          expenseDoc.subsubcategory = null;
          expenseDoc.classificationSource = 'pending_ai';
          expenseDoc.classificationConfidence = null;

          console.log('⏳ Sin match local, expense marcado para clasificación IA');
        }
      }

      const expenseRef = doc(db, `businesses/${businessId}/expenses`, expenseId);
      await setDoc(expenseRef, expenseDoc);

      console.log('✅ Expense created with first log:', expenseId);
      return expenseId;
    } catch (error) {
      console.error('❌ Error creating expense with log: ', error);
      throw error;
    }
  };

  /**
   * Agrega un log a un expense existente
   * @param {string} expenseId - UUID del expense
   * @param {Object} logData - Datos del log (amount, date, transactionRef, account, notes, materialItems)
   */
  const addLogToExpense = async (expenseId, logData) => {
    try {
      const businessId = ensureBusinessId();
      const expenseRef = doc(db, `businesses/${businessId}/expenses`, expenseId);

      const nowDate = new Date(); // Usar Date() en lugar de serverTimestamp()

      const logWithId = {
        amount: logData.amount,
        date: logData.date, // Ya viene como serverTimestamp del store
        transactionRef: logData.transactionRef,
        account: logData.account,
        notes: logData.notes || null,
        logId: uuidv4(),
        createdAt: nowDate, // Usar Date() en lugar de serverTimestamp()
      };

      // Si el log incluye materialItems, agregarlos (limpiando undefined)
      if (logData.materialItems && logData.materialItems.length > 0) {
        logWithId.materialItems = logData.materialItems.map(item => {
          // Limpiar valores undefined y convertirlos a null
          return {
            uuid: item.uuid || null,
            productId: item.productId || null,
            description: item.description || null,
            quantity: item.quantity || 0,
            unit: item.unit || null,
            cost: item.cost || 0,
            totalCost: item.totalCost || 0,
            oldOrNewProduct: item.oldOrNewProduct || null,
            stockLogId: item.stockLogId || null,
          };
        });

        console.log('📦 Agregando materialItems al log:', {
          logId: logWithId.logId,
          itemsCount: logWithId.materialItems.length
        });
      }

      await updateDoc(expenseRef, {
        logs: arrayUnion(logWithId),
        updatedAt: serverTimestamp(),
      });

      console.log('✅ Log added to expense:', expenseId);
    } catch (error) {
      console.error('❌ Error adding log to expense: ', error);
      throw error;
    }
  };

  /**
   * Actualiza los metadatos calculados de un expense
   * @param {string} expenseId - UUID del expense
   */
  const updateExpenseMetadata = async (expenseId) => {
    try {
      const businessId = ensureBusinessId();
      const expenseRef = doc(db, `businesses/${businessId}/expenses`, expenseId);

      // Obtener el expense actual
      const expenseDoc = await getDoc(expenseRef);
      if (!expenseDoc.exists()) {
        throw new Error(`Expense ${expenseId} not found`);
      }

      const expenseData = expenseDoc.data();
      const logs = expenseData.logs || [];

      if (logs.length === 0) {
        console.warn('⚠️ No logs found for expense:', expenseId);
        return;
      }

      // Calcular metadata básica
      const totalSpent = logs.reduce((sum, log) => sum + (log.amount || 0), 0);
      const occurrences = logs.length;
      const averageAmount = totalSpent / occurrences;

      // Encontrar la fecha más reciente
      const lastLog = logs.reduce((latest, log) => {
        const logDate = log.date?.toDate?.() || new Date(log.date || 0);
        const latestDate = latest?.toDate?.() || new Date(latest || 0);
        return logDate > latestDate ? log.date : latest;
      }, logs[0].date);

      const metadata = {
        totalSpent,
        occurrences,
        averageAmount,
        lastUsedAt: lastLog,
      };

      // ✅ Si es expense de materials, calcular metadata extendida
      if (expenseData.category === 'materials') {
        const allMaterialItems = logs.flatMap(log => log.materialItems || []);

        // Total de items comprados
        metadata.totalItems = allMaterialItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

        // Productos únicos
        const uniqueProductIds = new Set(
          allMaterialItems
            .map(item => item.productId)
            .filter(Boolean)
        );
        metadata.uniqueProducts = uniqueProductIds.size;

        // Top 5 productos más comprados (por gasto total)
        const productStats = {};
        allMaterialItems.forEach(item => {
          if (!item.productId) return;

          if (!productStats[item.productId]) {
            productStats[item.productId] = {
              productId: item.productId,
              description: item.description,
              totalQuantity: 0,
              totalSpent: 0,
              occurrences: 0
            };
          }

          productStats[item.productId].totalQuantity += item.quantity || 0;
          productStats[item.productId].totalSpent += item.totalCost || 0;
          productStats[item.productId].occurrences += 1;
        });

        metadata.topProducts = Object.values(productStats)
          .sort((a, b) => b.totalSpent - a.totalSpent)
          .slice(0, 5);

        console.log('📊 Metadata extendida para materials:', {
          totalItems: metadata.totalItems,
          uniqueProducts: metadata.uniqueProducts,
          topProducts: metadata.topProducts.length
        });
      }

      await updateDoc(expenseRef, {
        metadata,
        updatedAt: serverTimestamp(),
      });

      console.log('✅ Expense metadata updated:', expenseId);
    } catch (error) {
      console.error('❌ Error updating expense metadata: ', error);
      throw error;
    }
  };

  /**
   * Obtiene un expense por su ID
   * @param {string} expenseId - UUID del expense
   * @returns {Promise<Object|null>} Expense data o null si no existe
   */
  const getExpenseById = async (expenseId) => {
    try {
      const businessId = ensureBusinessId();
      const expenseRef = doc(db, `businesses/${businessId}/expenses`, expenseId);
      const expenseDoc = await getDoc(expenseRef);

      if (!expenseDoc.exists()) {
        console.warn('⚠️ Expense not found:', expenseId);
        return null;
      }

      return {
        id: expenseDoc.id,
        ...expenseDoc.data(),
      };
    } catch (error) {
      console.error('❌ Error getting expense by ID: ', error);
      throw error;
    }
  };

  /**
   * Obtiene todos los expenses con metadata calculada
   * @returns {Promise<Array>} Array de expenses
   */
  const getAllExpensesWithMetadata = async () => {
    try {
      const businessId = ensureBusinessId();
      const expensesSnapshot = await getDocs(collection(db, `businesses/${businessId}/expenses`));

      const expenses = [];
      expensesSnapshot.forEach(doc => {
        expenses.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      console.log(`✅ Fetched ${expenses.length} expenses with metadata`);
      return expenses;
    } catch (error) {
      console.error('❌ Error fetching expenses: ', error);
      throw error;
    }
  };

  /**
   * Obtiene expenses por bucket y rango de fechas
   * Suma solo los logs que caen dentro del rango de fechas
   * @param {string} bucket - Ej: 'DIRECT_LABOR', 'OVERHEAD', 'DIRECT_MATERIAL'
   * @param {Date|Timestamp} startDate - Fecha de inicio
   * @param {Date|Timestamp} endDate - Fecha de fin
   * @returns {Promise<Array>} Array de expenses con sus logs filtrados y total calculado
   */
  const getExpensesByBucketAndDateRange = async (bucket, startDate, endDate) => {
    try {
      const businessId = ensureBusinessId();

      if (!bucket) {
        throw new Error('Bucket es requerido para filtrar expenses');
      }

      // Convertir fechas a Timestamp si son Date
      const startTimestamp = startDate instanceof Timestamp
        ? startDate
        : Timestamp.fromDate(startDate);
      const endTimestamp = endDate instanceof Timestamp
        ? endDate
        : Timestamp.fromDate(endDate);

      // Query por bucket
      const expensesQuery = query(
        collection(db, `businesses/${businessId}/expenses`),
        where('bucket', '==', bucket)
      );

      const expensesSnapshot = await getDocs(expensesQuery);

      const expensesInRange = [];
      let totalAmount = 0;

      for (const docSnapshot of expensesSnapshot.docs) {
        const expenseData = docSnapshot.data();
        const expenseId = docSnapshot.id;

        // ✅ Obtener logs del array dentro del documento (NO es una subcollection)
        const logs = expenseData.logs || [];

        // Filtrar logs por rango de fechas
        const logsInRange = [];
        let expenseAmountInRange = 0;

        logs.forEach(log => {
          const logDate = log.date;

          // Comparar fechas (logDate puede ser Timestamp o Date)
          const logTimestamp = logDate instanceof Timestamp ? logDate : Timestamp.fromDate(logDate);

          if (logTimestamp >= startTimestamp && logTimestamp <= endTimestamp) {
            logsInRange.push(log);
            expenseAmountInRange += Number(log.amount || 0);
          }
        });

        // Solo incluir expense si tiene logs en el rango
        if (logsInRange.length > 0) {
          expensesInRange.push({
            id: expenseId,
            ...expenseData,
            logsInRange, // Logs filtrados del período
            amountInRange: expenseAmountInRange // Total del período
          });

          totalAmount += expenseAmountInRange;
        }
      }

      console.log(`✅ Expenses encontrados:`, {
        bucket,
        startDate: startTimestamp.toDate(),
        endDate: endTimestamp.toDate(),
        count: expensesInRange.length,
        totalAmount
      });

      return {
        expenses: expensesInRange,
        totalAmount,
        count: expensesInRange.length
      };

    } catch (error) {
      console.error('❌ Error obteniendo expenses por bucket y fecha:', error);
      throw error;
    }
  };

  // ============================================
  // FUNCIONES LEGACY (mantener por compatibilidad)
  // ============================================

  const createExpense = async (expense, transactionRef) => {
    try {
      const businessId = ensureBusinessId();

      const expenseRef = doc(db, `businesses/${businessId}/expenses`, expense.uuid);
      await setDoc(expenseRef, {
        ...expense,
        transactionRef,
        createdAt: serverTimestamp(),
      });
      console.log('⚠️ Legacy expense created in Firestore (consider using createExpenseWithLog)');
    } catch (error) {
      console.error('Error creating expense: ', error);
      throw error;
    }
  };

  const getAllExpenses = async () => {
    try {
      const businessId = ensureBusinessId();

      const expensesSnapshot = await getDocs(collection(db, `businesses/${businessId}/expenses`));
      const expenses = [];
      expensesSnapshot.forEach(doc => {
        expenses.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      return expenses;
    } catch (error) {
      console.error('Error fetching expenses: ', error);
      throw error;
    }
  };

  const updateExpense = async (expenseId, updatedData) => {
    try {
      const businessId = ensureBusinessId();

      const expenseRef = doc(db, `businesses/${businessId}/expenses`, expenseId);
      await updateDoc(expenseRef, {
        ...updatedData,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating expense: ", error);
      throw error;
    }
  };

  const deleteExpenseByID = async (expenseID) => {
    try {
      const businessId = ensureBusinessId();

      const expenseRef = doc(db, `businesses/${businessId}/expenses`, expenseID);
      await deleteDoc(expenseRef);
      console.log('Expense deleted in Firestore');
    } catch (error) {
      console.error('Error deleting expense: ', error);
      throw error;
    }
  };

  const deleteExpenseByTransactionRef = async (transactionRef) => {
    try {
      const businessId = ensureBusinessId();

      const expensesQuery = query(
        collection(db, `businesses/${businessId}/expenses`),
        where("transactionRef", "==", transactionRef)
      );

      const expensesSnapshot = await getDocs(expensesQuery);

      expensesSnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
        console.log('Expense deleted in Firestore');
      });
    } catch (error) {
      console.error('Error deleting expense by transactionRef: ', error);
      throw error;
    }
  };

  return {
    // Nuevas funciones
    searchExpensesByDescription,
    createExpenseWithLog,
    addLogToExpense,
    updateExpenseMetadata,
    getExpenseById,
    getAllExpensesWithMetadata,
    getExpensesByBucketAndDateRange,
    // Funciones legacy
    createExpense,
    getAllExpenses,
    updateExpense,
    deleteExpenseByID,
    deleteExpenseByTransactionRef
  };
}