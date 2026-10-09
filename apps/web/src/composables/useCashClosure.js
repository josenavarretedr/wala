import { getFirestore, collection, setDoc, doc, getDocs, query, where, serverTimestamp, getDoc } from 'firebase/firestore';
import appFirebase from '@/firebaseInit';

import { ensureBusinessId } from "@/composables/useBusinessUtils";


const db = getFirestore(appFirebase);

export function useCashClosure() {
  const createCashClosure = async (cashClosureData) => {
    try {
      const businessId = ensureBusinessId();

      // ✅ IMPORTANTE: Validar que uuid existe
      if (!cashClosureData.uuid) {
        console.error('❌ Cash closure must have a uuid');
        throw new Error('Cash closure must have a uuid');
      }

      // ✅ IMPORTANTE: Establecer id = uuid para consistencia
      cashClosureData.id = cashClosureData.uuid;

      const cashClosureRef = doc(db, `businesses/${businessId}/cashClosures`, cashClosureData.uuid);
      await setDoc(cashClosureRef, {
        ...cashClosureData,
        id: cashClosureData.uuid, // Garantizar consistencia
        createdAt: serverTimestamp(),
      });

      console.log('✅ Cash closure created with uuid:', cashClosureData.uuid);
    } catch (error) {
      console.error('Error creating cash closure record: ', error);
      throw error;
    }
  };

  const getCashClosureById = async (cashClosureId) => {
    try {
      const businessId = ensureBusinessId();

      const cashClosureRef = doc(db, `businesses/${businessId}/cashClosures`, cashClosureId);
      const cashClosureSnap = await getDoc(cashClosureRef);
      if (cashClosureSnap.exists()) {
        return {
          id: cashClosureSnap.id,
          ...cashClosureSnap.data()
        };
      } else {
        console.log("No such cash closure!");
        return null;
      }
    } catch (error) {
      console.error("Error fetching cash closure by ID: ", error);
      throw error;
    }
  };

  const getCashClosuresForBusiness = async () => {
    try {
      const businessId = ensureBusinessId();

      const cashClosuresSnapshot = await getDocs(collection(db, `businesses/${businessId}/cashClosures`));
      const cashClosures = [];
      cashClosuresSnapshot.forEach(doc => {
        cashClosures.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      return cashClosures;
    } catch (error) {
      console.error('Error fetching cash closures for business: ', error);
      throw error;
    }
  };

  const checkCashClosureForToday = async () => {
    try {
      const businessId = ensureBusinessId();

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const q = query(
        collection(db, `businesses/${businessId}/cashClosures`),
        where('createdAt', '>=', today),
        where('createdAt', '<', tomorrow)
      );

      const querySnapshot = await getDocs(q);
      const cashClosures = [];
      querySnapshot.forEach(doc => {
        cashClosures.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      return cashClosures;
    } catch (error) {
      console.error('Error checking cash closure for today: ', error);
      throw error;
    }
  };

  // Puedes agregar más funciones aquí si necesitas funcionalidades adicionales para cashClosures en Firestore
  // como obtener cierres por rango de fechas, usuario, etc.

  return {
    createCashClosure,
    getCashClosureById,
    getCashClosuresForBusiness,
    checkCashClosureForToday
  };
}