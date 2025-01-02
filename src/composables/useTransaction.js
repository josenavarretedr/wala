import { getFirestore, collection, setDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import appFirebase from '@/firebaseInit';

const db = getFirestore(appFirebase);

export function useTransaccion() {
  const createTransaction = async (transaction, businessId = 'ferrercard') => {
    try {
      const transactionRef = doc(db, `businesses/${businessId}/transaction`, transaction.uuid)
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

  return {
    createTransaction,
    updateTransaction,
  };
}