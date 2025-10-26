// src/composables/useExpenses.js

import { getFirestore, collection, setDoc, query, where, doc, getDocs, getDoc, deleteDoc, updateDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';
import appFirebase from '@/firebaseInit';
import { ensureBusinessId } from "@/composables/useBusinessUtils";
import { v4 as uuidv4 } from "uuid";


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
   * Crea un nuevo expense con su primer log
   * @param {Object} expenseData - Datos del expense (description, category, subcategory)
   * @param {Object} logData - Datos del primer log (amount, date, transactionRef, account, notes)
   * @returns {Promise<string>} UUID del expense creado
   */
  const createExpenseWithLog = async (expenseData, logData) => {
    try {
      const businessId = ensureBusinessId();
      const expenseId = uuidv4();

      const now = serverTimestamp();
      const nowDate = new Date(); // Para usar dentro de arrays

      const expenseDoc = {
        uuid: expenseId,
        description: expenseData.description,
        category: expenseData.category || null,
        subcategory: expenseData.subcategory || null,
        createdAt: now,
        updatedAt: now,
        logs: [
          {
            amount: logData.amount,
            date: logData.date, // Ya viene como serverTimestamp del store
            transactionRef: logData.transactionRef,
            account: logData.account,
            notes: logData.notes || null,
            logId: uuidv4(),
            createdAt: nowDate, // Usar Date() en lugar de serverTimestamp()
          }
        ],
        metadata: {
          totalSpent: logData.amount,
          occurrences: 1,
          lastUsedAt: nowDate, // Usar Date() en lugar de serverTimestamp()
          averageAmount: logData.amount,
        }
      };

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
   * @param {Object} logData - Datos del log (amount, date, transactionRef, account, notes)
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

      // Calcular metadata
      const totalSpent = logs.reduce((sum, log) => sum + (log.amount || 0), 0);
      const occurrences = logs.length;
      const averageAmount = totalSpent / occurrences;

      // Encontrar la fecha más reciente
      const lastLog = logs.reduce((latest, log) => {
        const logDate = log.date?.toDate?.() || new Date(log.date || 0);
        const latestDate = latest?.toDate?.() || new Date(latest || 0);
        return logDate > latestDate ? log.date : latest;
      }, logs[0].date);

      await updateDoc(expenseRef, {
        'metadata.totalSpent': totalSpent,
        'metadata.occurrences': occurrences,
        'metadata.averageAmount': averageAmount,
        'metadata.lastUsedAt': lastLog,
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
    // Funciones legacy
    createExpense,
    getAllExpenses,
    updateExpense,
    deleteExpenseByID,
    deleteExpenseByTransactionRef
  };
}