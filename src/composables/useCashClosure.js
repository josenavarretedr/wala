import { getFirestore, collection, setDoc, doc, getDocs, query, where, serverTimestamp, getDoc } from 'firebase/firestore';
import appFirebase from '@/firebaseInit';
import { useBusinessStore } from '@/stores/businessStore';
const businessStore = useBusinessStore();
const businessId = businessStore.currentBusinessId;

const db = getFirestore(appFirebase);

export function useCashClosure() {
  const createCashClosure = async (cashClosureData) => {
    try {
      const cashClosureRef = doc(db, `business/${businessId}/cashClosures`, cashClosureData.uuid);
      await setDoc(cashClosureRef, {
        ...cashClosureData,
        createdAt: serverTimestamp(),
      });
      console.log('Cash closure record created in Firestore');
    } catch (error) {
      console.error('Error creating cash closure record: ', error);
      throw error;
    }
  };

  const getCashClosureById = async (cashClosureId) => {
    try {
      const cashClosureRef = doc(db, `business/${businessId}/cashClosures`, cashClosureId);
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

  const getCashClosuresForBusiness = async (businessId) => {
    try {
      const cashClosuresSnapshot = await getDocs(collection(db, `business/${businessId}/cashClosures`));
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

  const checkCashClosureForToday = async (businessId) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const q = query(
        collection(db, `business/${businessId}/cashClosures`),
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