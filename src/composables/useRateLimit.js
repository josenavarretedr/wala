/**
 * useRateLimit.js - Composable para controlar límite de shares por día
 * Free: 5 shares/día | Premium: 100 shares/día
 */

import { ref, computed } from 'vue';
import { useAuth } from '@/composables/useAuth';

import appFirebase from "@/firebaseInit";

import { serverTimestamp, getDoc, setDoc, updateDoc, doc, arrayUnion, getFirestore } from "firebase/firestore";


const db = getFirestore(appFirebase);
export function useRateLimit() {

  const { getCurrentUser } = useAuth();

  const limitData = ref(null);
  const isChecking = ref(false);
  const error = ref(null);

  // Límites por tipo de usuario
  const LIMITS = {
    free: 50,
    premium: 100
  };

  /**
   * Computed: Puede compartir
   */
  const canShare = computed(() => {
    if (!limitData.value) return true;

    const limit = limitData.value.isPremium ? LIMITS.premium : LIMITS.free;
    return limitData.value.count < limit;
  });

  /**
   * Computed: Shares restantes
   */
  const remainingShares = computed(() => {
    if (!limitData.value) return LIMITS.free;

    const limit = limitData.value.isPremium ? LIMITS.premium : LIMITS.free;
    const remaining = limit - limitData.value.count;
    return Math.max(0, remaining);
  });

  /**
   * Computed: Hora de reset
   */
  const resetTime = computed(() => {
    if (!limitData.value || !limitData.value.resetAt) return null;
    return limitData.value.resetAt.toDate();
  });

  /**
   * Verifica si el usuario puede compartir y actualiza el contador
   * @returns {Promise<boolean>} true si puede compartir
   */
  const checkLimit = async () => {
    // Obtener usuario actual
    const user = await getCurrentUser();

    if (!user || !user.uid) {
      error.value = 'Usuario no autenticado';
      return false;
    }

    isChecking.value = true;
    error.value = null;

    try {
      const userId = user.uid;
      const limitRef = doc(db, 'shareLimits', userId);
      const limitSnap = await getDoc(limitRef);

      const now = new Date();
      const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrowMidnight = new Date(todayMidnight);
      tomorrowMidnight.setDate(tomorrowMidnight.getDate() + 1);

      // Determinar si es premium
      // TODO: Integrar con sistema de suscripciones cuando esté disponible
      const isPremium = false; // Por ahora todos son free

      if (!limitSnap.exists()) {
        // Crear documento nuevo
        const newData = {
          userId: userId,
          count: 1,
          resetAt: tomorrowMidnight,
          isPremium: isPremium,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        await setDoc(limitRef, newData);

        limitData.value = {
          ...newData,
          resetAt: { toDate: () => tomorrowMidnight }
        };

        return true;
      }

      // Documento existe - verificar si necesita reset
      const data = limitSnap.data();
      const resetAt = data.resetAt?.toDate();

      if (!resetAt || now >= resetAt) {
        // Necesita reset
        const resetData = {
          count: 1,
          resetAt: tomorrowMidnight,
          isPremium: isPremium,
          updatedAt: serverTimestamp()
        };

        await updateDoc(limitRef, resetData);

        limitData.value = {
          ...data,
          ...resetData,
          resetAt: { toDate: () => tomorrowMidnight }
        };

        return true;
      }

      // No necesita reset - verificar límite
      const limit = isPremium ? LIMITS.premium : LIMITS.free;

      if (data.count >= limit) {
        // Excede el límite
        limitData.value = {
          ...data,
          isPremium: isPremium
        };

        error.value = isPremium
          ? `Has alcanzado tu límite de ${LIMITS.premium} shares diarios.`
          : `Has alcanzado tu límite de ${LIMITS.free} shares diarios. Actualiza a Premium para más.`;

        return false;
      }

      // Aún tiene cupo - incrementar
      await updateDoc(limitRef, {
        count: data.count + 1,
        isPremium: isPremium,
        updatedAt: serverTimestamp()
      });

      limitData.value = {
        ...data,
        count: data.count + 1,
        isPremium: isPremium
      };

      return true;

    } catch (err) {
      console.error('❌ Error verificando rate limit:', err);
      error.value = 'Error al verificar límite. Intenta nuevamente.';
      return false;

    } finally {
      isChecking.value = false;
    }
  };

  /**
   * Obtiene el estado actual del límite (sin incrementar)
   * @returns {Promise<void>}
   */
  const fetchLimitStatus = async () => {
    const user = await getCurrentUser();

    if (!user || !user.uid) return;

    try {
      const limitRef = doc(db, 'shareLimits', user.uid);
      const limitSnap = await getDoc(limitRef);

      if (limitSnap.exists()) {
        limitData.value = limitSnap.data();
      }
    } catch (err) {
      console.error('Error obteniendo status de límite:', err);
    }
  };

  return {
    canShare,
    remainingShares,
    resetTime,
    limitData,
    isChecking,
    error,
    checkLimit,
    fetchLimitStatus,
    LIMITS
  };
}
