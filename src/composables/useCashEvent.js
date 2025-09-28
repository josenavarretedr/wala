import {
  getFirestore,
  collection,
  setDoc,
  doc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import appFirebase from '@/firebaseInit';
import { ensureBusinessId } from "@/composables/useBusinessUtils";

const db = getFirestore(appFirebase);

export function useCashEvent() {
  const createCashEvent = async (cashEventData) => {
    try {
      const businessId = ensureBusinessId();
      const ref = doc(db, `businesses/${businessId}/cashEvents`, cashEventData.uuid);
      await setDoc(ref, { ...cashEventData, createdAt: serverTimestamp() });
      console.log('Cash event created in Firestore');
    } catch (error) {
      console.error('Error creating cash event: ', error);
      throw error;
    }
  };

  const getCashEventsForBusiness = async () => {
    try {
      const businessId = ensureBusinessId();
      const snapshot = await getDocs(collection(db, `businesses/${businessId}/cashEvents`));
      const events = [];
      snapshot.forEach(doc => {
        events.push({ id: doc.id, ...doc.data() });
      });
      return events;
    } catch (error) {
      console.error('Error fetching cash events: ', error);
      throw error;
    }
  };

  const checkCashEventForToday = async (type) => {
    try {
      const businessId = ensureBusinessId();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const q = query(
        collection(db, `business/${businessId}/cashEvents`),
        where('createdAt', '>=', today),
        where('createdAt', '<', tomorrow),
        where('type', '==', type)
      );

      const snapshot = await getDocs(q);
      const events = [];
      snapshot.forEach(doc => {
        events.push({ id: doc.id, ...doc.data() });
      });

      return events;
    } catch (error) {
      console.error('Error checking today cash event: ', error);
      throw error;
    }
  };

  return {
    createCashEvent,
    getCashEventsForBusiness,
    checkCashEventForToday,
  };
}
