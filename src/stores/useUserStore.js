// stores/useUserStore.js
import { defineStore } from 'pinia';
import { ref } from 'vue';

import { getUserProfile, getUserCredencialInfo } from "@/api/utilsFirebase";

export const useUserStore = defineStore('user', () => {
  const userUUID = ref(null);
  const userProfile = ref(null);
  const userCredencial = ref(null);

  const initialState = {
    userUUID: null,
    userProfile: null,
    userCredencial: null,
  };

  const resetStore = () => {
    userUUID.value = initialState.userUUID;
    userProfile.value = initialState.userProfile;
    userCredencial.value = initialState.userCredencial;
  };


  // Función para suscribirse a cambios en tiempo real

  const setUserProfileToStore = async (userId) => {
    try {
      const userProfileFromStore = await getUserProfile(userId);
      userUUID.value = userId;
      userProfile.value = userProfileFromStore;
    } catch (error) {
      console.error("Error getting user savings:", error);
    }
  }

  const setUserCredencialToStore = async () => {
    try {
      const userCredencialFromStore = await getUserCredencialInfo();
      userCredencial.value = userCredencialFromStore;
    } catch (error) {
      console.error("Error getting user Credencial:", error);
    }
  }

  return {
    userUUID,
    userProfile,
    userCredencial,
    resetStore,
    setUserProfileToStore,
    setUserCredencialToStore,
  };
});
