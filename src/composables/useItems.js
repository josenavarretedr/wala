import { getFirestore, collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import appFirebase from '@/firebaseInit';

import { useBusinessStore } from '@/stores/businessStore';
const businessStore = useBusinessStore();
const businessId = businessStore.currentBusinessId;


const db = getFirestore(appFirebase);

export function useTransaccion() {
  const createTransaction = async (transaction) => {
    try {
      console.log('businessId', businessId);
      const docRef = await addDoc(collection(db, 'business', businessId, 'transactions'), {
        ...transaction,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating transaction: ', error);
      throw error;
    }
  };

  const updateTransaction = async (transactionId, updatedData) => {
    try {
      const transactionRef = doc(db, 'business', businessId, 'transactions', transactionId);
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