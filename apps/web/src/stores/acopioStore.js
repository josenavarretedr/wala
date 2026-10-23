import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useAcopios } from '@/composables/useAcopios';

export const useAcopioStore = defineStore('acopioStore', () => {
  const acopios = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const unsubscribeAcopios = ref(null);

  const {
    saveAcopio,
    getAcopiosListener,
    updateAcopioPriceAndExpense,
    deleteAcopio: deleteAcopioFn,
    revertAcopioLiquidation: revertAcopioLiquidationFn
  } = useAcopios();

  async function fetchAcopios() {
    loading.value = true;
    error.value = null;

    try {
      // Limpiar listener anterior si existe
      if (unsubscribeAcopios.value) {
        unsubscribeAcopios.value();
      }

      unsubscribeAcopios.value = getAcopiosListener((data) => {
        acopios.value = data;
        loading.value = false;
      });
    } catch (err) {
      console.error('Error al escuchar acopios:', err);
      error.value = err.message;
      loading.value = false;
    }
  }

  async function registerNewAcopio(acopioData) {
    loading.value = true;
    error.value = null;
    try {
      const result = await saveAcopio(acopioData);
      loading.value = false;
      return result;
    } catch (err) {
      console.error('Error al registrar acopio en store:', err);
      error.value = err.message;
      loading.value = false;
      throw err;
    }
  }

  async function updateAcopioPrice(acopioId, newPrice) {
    loading.value = true;
    error.value = null;
    try {
      const result = await updateAcopioPriceAndExpense(acopioId, newPrice);
      loading.value = false;
      return result;
    } catch (err) {
      console.error('Error al actualizar precio de acopio en store:', err);
      error.value = err.message;
      loading.value = false;
      throw err;
    }
  }

  async function deleteAcopio(acopioId) {
    loading.value = true;
    error.value = null;
    try {
      const result = await deleteAcopioFn(acopioId);
      // Actualizar state local de inmediato por si el listener tarda unos ms
      acopios.value = acopios.value.filter(a => a.uuid !== acopioId && a.id !== acopioId);
      loading.value = false;
      return result;
    } catch (err) {
      console.error('Error al eliminar acopio en store:', err);
      error.value = err.message;
      loading.value = false;
      throw err;
    }
  }

  async function revertLiquidation(acopioId) {
    loading.value = true;
    error.value = null;
    try {
      const result = await revertAcopioLiquidationFn(acopioId);
      // Actualizar estado en memoria reactiva local inmediatamente
      const index = acopios.value.findIndex(a => a.uuid === acopioId || a.id === acopioId);
      if (index !== -1) {
        acopios.value[index] = {
          ...acopios.value[index],
          status: 'pending'
        };
      }
      loading.value = false;
      return result;
    } catch (err) {
      console.error('Error al anular liquidación en store:', err);
      error.value = err.message;
      loading.value = false;
      throw err;
    }
  }

  function cleanup() {
    if (unsubscribeAcopios.value) {
      unsubscribeAcopios.value();
      unsubscribeAcopios.value = null;
    }
  }

  return {
    acopios,
    loading,
    error,
    fetchAcopios,
    registerNewAcopio,
    updateAcopioPrice,
    deleteAcopio,
    revertLiquidation,
    cleanup
  };
});
