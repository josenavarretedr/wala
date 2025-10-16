// useDailySummary.js
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import appFirebase from '@/firebaseInit';
import { ensureBusinessId } from '@/composables/useBusinessUtils';

/**
 * Composable para leer el dailySummary del día actual
 * Este documento es mantenido automáticamente por las Cloud Functions
 */
export function useDailySummary() {
  const db = getFirestore(appFirebase);

  /**
   * Obtiene el resumen del día actual
   * @returns {Promise<Object|null>} - Resumen del día o null si no existe
   */
  const getTodayDailySummary = async () => {
    try {
      const businessId = ensureBusinessId();

      if (!businessId) {
        console.error('❌ businessId no disponible para getTodayDailySummary');
        return null;
      }

      // Formatear la fecha actual como 'yyyy-LL-dd'
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const dayString = `${year}-${month}-${day}`;

      // Referencia al documento dailySummary
      const dailySummaryRef = doc(
        db,
        `businesses/${businessId}/dailySummaries/${dayString}`
      );

      const docSnap = await getDoc(dailySummaryRef);

      if (!docSnap.exists()) {
        console.log('ℹ️ No existe dailySummary para hoy:', dayString);
        return null;
      }

      const data = docSnap.data();
      console.log('✅ DailySummary cargado:', data);

      return data;
    } catch (error) {
      console.error('❌ Error obteniendo dailySummary:', error);
      return null;
    }
  };

  /**
   * Obtiene el resumen de un día específico
   * @param {string} dayString - Fecha en formato 'yyyy-LL-dd'
   * @returns {Promise<Object|null>} - Resumen del día o null si no existe
   */
  const getDailySummary = async (dayString) => {
    try {
      const businessId = ensureBusinessId();

      if (!businessId || !dayString) {
        console.error('❌ businessId y dayString son requeridos');
        return null;
      }

      const dailySummaryRef = doc(
        db,
        `businesses/${businessId}/dailySummaries/${dayString}`
      );

      const docSnap = await getDoc(dailySummaryRef);

      if (!docSnap.exists()) {
        console.log(`ℹ️ No existe dailySummary para ${dayString}`);
        return null;
      }

      return docSnap.data();
    } catch (error) {
      console.error('❌ Error obteniendo dailySummary:', error);
      return null;
    }
  };

  return {
    getTodayDailySummary,
    getDailySummary,
  };
}
