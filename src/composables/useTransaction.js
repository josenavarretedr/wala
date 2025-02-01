import { getFirestore, collection, setDoc, doc, updateDoc, serverTimestamp, getDocs, deleteDoc } from 'firebase/firestore';
import appFirebase from '@/firebaseInit';

const db = getFirestore(appFirebase);

export function useTransaccion() {
  const createTransaction = async (transaction, businessId = 'ferrercard') => {
    try {
      const transactionRef = doc(db, `businesses/${businessId}/transactions`, transaction.uuid)
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
      const transactionRef = doc(db, 'businesses', updatedData.businessId, 'transactions', transactionId);
      await updateDoc(transactionRef, {
        ...updatedData,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating transaction: ', error);
      throw error;
    }
  };

  const getAllTransactions = async (businessId = 'ferrercard') => {
    try {
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

  const deleteTransactionByID = async (transactionID, businessId = 'ferrercard') => {
    try {
      const transactionRef = doc(db, `businesses/${businessId}/transactions`, transactionID);
      await deleteDoc(transactionRef);
    }
    catch (error) {
      console.error('Error fetching transactions: ', error);
      throw error;
    }

  }

  return {
    createTransaction,
    updateTransaction,
    deleteTransactionByID,
    getAllTransactions
  };
}