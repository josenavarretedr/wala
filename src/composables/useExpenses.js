import { getFirestore, collection, setDoc, query, where, doc, getDocs, deleteDoc, serverTimestamp } from 'firebase/firestore';
import appFirebase from '@/firebaseInit';


import { useBusinessStore } from '@/stores/businessStore';
const businessStore = useBusinessStore();

const businessId = businessStore.currentBusinessId;

const db = getFirestore(appFirebase);

export function useExpenses() {
  const createExpense = async (expense, transactionRef) => {
    try {
      const expenseRef = doc(db, `business/${businessId}/expenses`, expense.uuid); // Usa UUID del expense
      await setDoc(expenseRef, {
        ...expense,
        transactionRef,
        createdAt: serverTimestamp(),
      });
      console.log('Expense created in Firestore');
    } catch (error) {
      console.error('Error creating expense: ', error);
      throw error;
    }
  };

  const getAllExpenses = async (businessId) => {
    try {
      const expensesSnapshot = await getDocs(collection(db, `business/${businessId}/expenses`));
      const expenses = [];
      expensesSnapshot.forEach(doc => {
        expenses.push({
          id: doc.id, // ID del documento en Firestore (puede ser diferente del UUID)
          ...doc.data(),
        });
        console.log(doc.id, " => ", doc.data());
      });
      return expenses;
    } catch (error) {
      console.error('Error fetching expenses: ', error);
      throw error;
    }
  };

  // Actualiza un gasto existente
  const updateExpense = async (expenseId, updatedData) => {
    try {
      const expenseRef = doc(db, `business/${businessId}/expenses`, expenseId);
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
      const expenseRef = doc(db, `business/${businessId}/expenses`, expenseID);
      await deleteDoc(expenseRef);
      console.log('Expense deleted in Firestore');
    } catch (error) {
      console.error('Error deleting expense: ', error);
      throw error;
    }
  };

  const deleteExpenseByTransactionRef = async (transactionRef) => {
    try {
      // Creamos una consulta que solo recupere los documentos donde transactionRef es igual al valor dado.
      const expensesQuery = query(
        collection(db, `business/${businessId}/expenses`),
        where("transactionRef", "==", transactionRef)
      );

      const expensesSnapshot = await getDocs(expensesQuery);

      // Iteramos sobre los documentos filtrados y eliminamos cada uno.
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
    createExpense,
    getAllExpenses,
    updateExpense,
    deleteExpenseByID,
    deleteExpenseByTransactionRef
  };
}