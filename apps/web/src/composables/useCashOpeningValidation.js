import { useAccountsBalanceStore } from "@/stores/AccountsBalanceApp/accountsBalanceStore";
import { useDailySummary } from "@/composables/useDailySummary";
import { useToast } from "@/composables/useToast";
import { ensureBusinessId } from "@/composables/useBusinessUtils";

export function useCashOpeningValidation() {
  const accountsBalanceStore = useAccountsBalanceStore();
  const { getTodayDailySummary, hasOpening: summaryHasOpening } = useDailySummary();
  const { error: toastError } = useToast();

  /**
   * Verifica si existe una apertura de caja activa para hoy.
   * Consulta el store de balance de cuentas, el dailySummary del backend y Firestore si es necesario.
   * 
   * @param {string} [businessId] - ID del negocio opcional
   * @returns {Promise<boolean>} True si hay apertura activa
   */
  const checkCashOpening = async (businessId = null) => {
    try {
      const bId = businessId || ensureBusinessId();
      if (!bId) return false;

      // 1. Verificar si ya está en memoria reactiva en accountsBalanceStore
      if (
        accountsBalanceStore.openingTransaction ||
        accountsBalanceStore.dailySummary?.hasOpening
      ) {
        return true;
      }

      // 2. Intentar cargar el dailySummary de hoy a través de accountsBalanceStore
      const loaded = await accountsBalanceStore.loadFromDailySummary();
      if (
        loaded &&
        (accountsBalanceStore.openingTransaction ||
          accountsBalanceStore.dailySummary?.hasOpening)
      ) {
        return true;
      }

      // 3. Fallback: Consultar directamente el dailySummary de hoy en Firestore
      const todaySummary = await getTodayDailySummary();
      if (todaySummary && summaryHasOpening(todaySummary)) {
        return true;
      }

      // 4. Fallback: Verificar si en transactionsInStore existe una transacción de tipo opening
      const { useTransactionStore } = await import('@/stores/transaction/transactionStore');
      const transactionStore = useTransactionStore();
      const hasOpeningInStore = (transactionStore.transactionsInStore?.value || []).some(
        tx => tx.type === 'opening'
      );
      if (hasOpeningInStore) {
        return true;
      }

      return false;
    } catch (err) {
      console.warn("⚠️ Error al verificar apertura de caja:", err);
      return false;
    }
  };

  /**
   * Muestra el toast de error indicando que se debe realizar la apertura antes de registrar acopios,
   * con enlace directo interactivo hacia la pantalla de apertura de caja.
   * 
   * @param {string} [businessId] - ID del negocio opcional
   */
  const showOpeningRequiredToast = (businessId = null) => {
    const bId = businessId || ensureBusinessId();
    toastError(
      "Debes aperturar la caja primero antes de registrar un acopio. Aperturar caja ahora",
      {
        duration: 4500,
        actionLink: bId ? {
          text: "Aperturar caja ahora",
          route: `/business/${bId}/accounts-balance`
        } : null
      }
    );
  };

  return {
    checkCashOpening,
    showOpeningRequiredToast
  };
}
