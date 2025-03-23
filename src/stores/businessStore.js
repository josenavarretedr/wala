// src/stores/businessStore.js
import { defineStore } from "pinia";
import { ref } from "vue";
import { useAuthStore } from "@/stores/authStore";
import {
  fetchBusinessesByOwner,
  createBusiness,
  addBusinessCollaborator
} from "@/composables/useBusiness";

export const useBusinessStore = defineStore("business", () => {
  const businesses = ref([]);
  const currentBusinessId = ref(null);
  const loading = ref(false);
  const error = ref(null);

  const authStore = useAuthStore();

  // 🔍 Obtener negocios del usuario actual
  const fetchBusinessesForCurrentUser = async () => {
    loading.value = true;
    error.value = null;

    try {
      const uid = authStore.user?.value?.uid;
      if (!uid) throw new Error("Usuario no autenticado");

      const data = await fetchBusinessesByOwner(uid);
      businesses.value = data;
      return data;
    } catch (err) {
      error.value = err.message;
      console.error("Store - Error al obtener negocios:", err);
      return [];
    } finally {
      loading.value = false;
    }
  };

  // 🆕 Crear nuevo negocio
  const createNewBusiness = async (businessData) => {
    try {
      const uid = authStore.user?.value?.uid;
      if (!uid) throw new Error("Usuario no autenticado");

      const newId = await createBusiness(uid, businessData);

      businesses.value.push({
        id: newId,
        ...businessData,
        owner: uid,
        collaborators: [],
        createdAt: new Date(),
      });

      return newId;
    } catch (err) {
      error.value = err.message;
      console.error("Store - Error al crear negocio:", err);
      return null;
    }
  };

  // 🤝 Agregar colaborador
  const addCollaborator = async (businessId, collaboratorUid) => {
    try {
      await addBusinessCollaborator(businessId, collaboratorUid);
      return true;
    } catch (err) {
      error.value = err.message;
      console.error("Store - Error al agregar colaborador:", err);
      return false;
    }
  };

  const setCurrentBusinessId = (id) => {
    currentBusinessId.value = id;
  };

  return {
    businesses,
    currentBusinessId,
    loading,
    error,
    fetchBusinessesForCurrentUser,
    createNewBusiness,
    addCollaborator,
    setCurrentBusinessId
  };
});
