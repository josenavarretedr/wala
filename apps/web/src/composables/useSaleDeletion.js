import { ref } from 'vue';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/firebaseInit';
import { useBusinessStore } from '@/stores/businessStore';

/**
 * Mapea los códigos de bloqueo de `deleteSale` a mensajes claros en español y acciones sugeridas.
 *
 * @param {string|null} blockReason
 * @returns {{ title: string, message: string, canOpenCashRegister: boolean }}
 */
export function mapBlockReason(blockReason) {
  switch (blockReason) {
    case 'TODAY_NOT_OPENED':
      return {
        title: 'Apertura de caja requerida hoy',
        message:
          'Esta venta pertenece a un día ya cerrado. Para anularla mediante una Nota de Devolución que descuente el dinero e incorpore el stock hoy, primero debes aperturar la caja del día actual.',
        canOpenCashRegister: true,
      };
    case 'TODAY_ALREADY_CLOSED':
      return {
        title: 'La caja de hoy ya está cerrada',
        message:
          'El día contable actual ya tiene un cierre registrado. Podrás emitir la Nota de Devolución cuando apertures el siguiente día operativo.',
        canOpenCashRegister: false,
      };
    case 'ALREADY_REFUNDED':
      return {
        title: 'Venta ya devuelta',
        message: 'Esta venta ya fue anulada mediante una Nota de Devolución anteriormente.',
        canOpenCashRegister: false,
      };
    default:
      return {
        title: 'Operación no disponible',
        message: 'No se puede procesar la eliminación o devolución de esta venta en el estado actual.',
        canOpenCashRegister: false,
      };
  }
}

/**
 * Composable para previsualizar (`dryRun: true`) y ejecutar (`dryRun: false`)
 * la eliminación directa o Nota de Devolución de una venta mediante la Cloud Function `deleteSale`.
 */
export function useSaleDeletion() {
  const isLoadingPreview = ref(false);
  const isExecuting = ref(false);
  const error = ref(null);
  const previewData = ref(null);

  const resolveBusinessId = (explicitBusinessId) => {
    if (explicitBusinessId && explicitBusinessId !== 'null' && explicitBusinessId !== 'undefined') {
      return explicitBusinessId;
    }
    const businessStore = useBusinessStore();
    if (businessStore.getBusinessId) return businessStore.getBusinessId;

    const fromLocal = localStorage.getItem('currentBusinessId');
    if (fromLocal && fromLocal !== 'null' && fromLocal !== 'undefined') return fromLocal;

    try {
      const cached = localStorage.getItem('walla_current_business');
      if (cached) {
        const parsed = JSON.parse(cached);
        const bid = parsed?.businessId || parsed?.id;
        if (bid) return bid;
      }
    } catch (_) {}

    return null;
  };

  /**
   * Consulta en modo `dryRun: true` qué modo aplicará (`DIRECT_DELETE` o `REFUND_NOTE`),
   * si el día actual permite ejecutarlo y cuál será el impacto exacto en caja, inventario y cliente.
   */
  const previewSaleDeletion = async ({ businessId, saleUuid, reason = '' }) => {
    const resolvedBizId = resolveBusinessId(businessId);
    isLoadingPreview.value = true;
    error.value = null;

    try {
      const callable = httpsCallable(functions, 'deleteSale');
      const response = await callable({
        businessId: resolvedBizId,
        saleUuid,
        reason,
        dryRun: true,
      });

      previewData.value = response.data;
      return response.data;
    } catch (err) {
      console.error('❌ [useSaleDeletion] Error en previewSaleDeletion:', err);
      error.value = err?.message || 'No se pudo analizar el impacto de la eliminación.';
      throw err;
    } finally {
      isLoadingPreview.value = false;
    }
  };

  /**
   * Ejecuta de forma atómica en el servidor la eliminación directa (`DIRECT_DELETE`)
   * o la emisión de la Nota de Devolución (`REFUND_NOTE`).
   */
  const executeSaleDeletion = async ({ businessId, saleUuid, reason = '' }) => {
    const resolvedBizId = resolveBusinessId(businessId);
    isExecuting.value = true;
    error.value = null;

    try {
      const callable = httpsCallable(functions, 'deleteSale');
      const response = await callable({
        businessId: resolvedBizId,
        saleUuid,
        reason,
        dryRun: false,
      });

      return response.data;
    } catch (err) {
      console.error('❌ [useSaleDeletion] Error en executeSaleDeletion:', err);
      error.value = err?.message || 'Error al eliminar o anular la venta.';
      throw err;
    } finally {
      isExecuting.value = false;
    }
  };

  return {
    isLoadingPreview,
    isExecuting,
    error,
    previewData,
    previewSaleDeletion,
    executeSaleDeletion,
    mapBlockReason,
  };
}
