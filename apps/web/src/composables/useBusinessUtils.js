// src/composables/useBusinessUtils.js
import { useBusinessStore } from "@/stores/businessStore";
import { useRoute } from "vue-router";

export function ensureBusinessId() {
  const businessStore = useBusinessStore();
  const route = useRoute();

  // Obtener businessId desde el store o desde la ruta
  let businessId = businessStore.getBusinessId;

  // Si no está en el store, intentar obtenerlo de la ruta
  if (!businessId && route.params.businessId) {
    businessId = route.params.businessId;
  }

  if (!businessId) {
    console.warn("⚠️ No hay un negocio activo seleccionado. Algunos composables pueden no funcionar correctamente.");
    return null; // Retornar null en lugar de lanzar error
  }

  return businessId;
}

export function requireBusinessId() {
  const businessId = ensureBusinessId();

  if (!businessId) {
    throw new Error("⚠️ No hay un negocio activo seleccionado. Por favor, selecciona o crea uno.");
  }

  return businessId;
}
