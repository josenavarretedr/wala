// src/composables/useBusinessUtils.js
import { useBusinessStore } from "@/stores/businessStore";

export function ensureBusinessId() {
  const businessStore = useBusinessStore();
  const businessId = businessStore.currentBusinessId;

  if (!businessId) {
    throw new Error("⚠️ No hay un negocio activo seleccionado. Por favor, selecciona o crea uno.");
  }

  return businessId;
}
