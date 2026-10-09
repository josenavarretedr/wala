// stores/useSavingsStore.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { onSnapshot } from "firebase/firestore";
import { getUserSavings, getUserSavingsDocRef } from '@/api/savings';

export const useSavingsStore = defineStore('savings', () => {
  const savings = ref(null);
  const savingsRequestsDetails = ref([]);

  const initialState = {
    savings: null,
    savingsRequestsDetails: [],
  };

  // Función para restablecer el estado
  const resetStore = () => {
    savings.value = initialState.savings;
    savingsRequestsDetails.value = initialState.savingsRequestsDetails;
  };

  const resetSavingRequestsDetails = () => {
    savingsRequestsDetails.value = initialState.savingsRequestsDetails;
  }

  /**
   * Función para suscribirse a cambios en tiempo real de los ahorros del usuario
   * @param {string} userId - ID del usuario
   * @returns {Function} - Función para cancelar la suscripción
   */
  const subscribeToSavings = (userId) => {
    const savingsRef = getUserSavingsDocRef(userId);
    const unsubscribe = onSnapshot(savingsRef, (doc) => {
      if (doc.exists()) {
        savings.value = doc.data();  // Actualiza el estado del store
      }
    }, (error) => {
      console.error("Error listening to savings:", error);
    });

    return unsubscribe;  // Retorna la función para cancelar la suscripción
  };

  /**
   * Carga los ahorros del usuario en el estado del store
   * @param {string} userId - ID del usuario
   * @returns {Promise<Object>} - Los datos de ahorro cargados
   */
  const getUserSavingsToStore = async (userId) => {
    try {
      const savingData = await getUserSavings(userId);
      savings.value = savingData;
    } catch (error) {
      console.error("Error getting user savings:", error);
    }
  };

  const getApprovedSavingsRequests = () => {
    // Usamos filter para crear un nuevo array con las solicitudes de ahorro aprobadas
    const allSavingsRequestApproved = savingsRequestsDetails.value.filter(
      (requestDetail) =>
        requestDetail.typeRequest === "solicitud_ahorro" &&
        requestDetail.estado === "aprobado"
    );
    return allSavingsRequestApproved;
  };

  return {
    savings,
    savingsRequestsDetails,
    resetSavingRequestsDetails,
    resetStore,
    subscribeToSavings,
    getUserSavingsToStore,
    getApprovedSavingsRequests,
  };
});
