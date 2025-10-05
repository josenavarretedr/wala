// src/composables/useTransaction.js

import { getFirestore, collection, setDoc, doc, updateDoc, serverTimestamp, getDocs, getDoc, query, where, deleteDoc } from 'firebase/firestore';
import appFirebase from '@/firebaseInit';

import { ensureBusinessId } from "@/composables/useBusinessUtils";


const db = getFirestore(appFirebase);

export function useTransaccion() {
  const createTransaction = async (transaction) => {
    try {
      const businessId = ensureBusinessId();
      const transactionRef = doc(db, 'businesses', businessId, 'transactions', transaction.uuid);

      await setDoc(transactionRef, {
        ...transaction,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error creating transaction: ', error);
      throw error;
    }
  };

  const updateTransaction = async (transactionId, updatedData) => {
    try {
      const businessId = ensureBusinessId();


      const transactionRef = doc(db, 'businesses', businessId, 'transactions', transactionId);
      await updateDoc(transactionRef, {
        ...updatedData,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating transaction: ', error);
      throw error;
    }
  };

  const getAllTransactions = async () => {
    try {
      const businessId = ensureBusinessId();


      console.log('El id del negocio es, desde el useTransactions: ', businessId);

      const transactionsSnapshot = await getDocs(collection(db, 'businesses', businessId, 'transactions'));

      const transactions = [];

      transactionsSnapshot.forEach(doc => {
        transactions.push({
          id: doc.id,
          ...doc.data(),
        });

        console.log(doc.id, " => ", doc.data());
      });

      return transactions
    } catch (error) {
      console.error('Error fetching transactions: ', error);
      throw error;
    }
  };

  const getTransactionsTodayCmps = async () => {
    const businessId = ensureBusinessId();
    console.log('El id del negocio es, desde el useTransactions: ', businessId);


    let transactions = [];
    // Obtén el inicio del día actual (00:00:00)
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    // Obtén el final del día actual (23:59:59)
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );
    const q = query(
      collection(db, `businesses/${businessId}/transactions`),
      where("createdAt", ">=", startOfDay),
      where("createdAt", "<", endOfDay)
    );

    // Ejecuta la consulta y almacena los resultados en `dailyData`
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      transactions.push(doc.data());
    });

    console.log('Se obtuvieron las transacciones de hoy, desde cpmposbale: ', transactions);

    return transactions;
  };

  const deleteTransactionByID = async (transactionID) => {
    try {
      const businessId = ensureBusinessId();
      console.log('Deleting transaction:', transactionID, 'from business:', businessId);

      const transactionRef = doc(db, `businesses/${businessId}/transactions`, transactionID);
      await deleteDoc(transactionRef);

      console.log('Transaction deleted successfully from Firebase');
    }
    catch (error) {
      console.error('Error deleting transaction: ', error);
      throw error;
    }
  }

  return {
    createTransaction,
    updateTransaction,
    deleteTransactionByID,
    getTransactionsTodayCmps,
    getAllTransactions,
  };
}