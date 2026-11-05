import { computed } from 'vue';
import {
  isOnline,
  isSyncing,
  pendingCount,
  lastSyncTimestamp,
  processQueue,
  refreshPendingCount
} from '@/services/sync/syncQueue';
import { isEmulatorActive } from '@/services/firebase';

/**
 * Composable para exponer el estado reactivo de sincronización y conectividad
 */
export function useOfflineSync() {
  /**
   * Dispara una sincronización manual forzada
   */
  async function triggerManualSync() {
    await refreshPendingCount();
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      console.warn('[useOfflineSync] No hay conexión a internet para sincronizar manualmente.');
      return { success: false, reason: 'offline' };
    }
    await processQueue();
    return { success: true };
  }

  return {
    isOnline: computed(() => isOnline.value),
    isSyncing: computed(() => isSyncing.value),
    pendingCount: computed(() => pendingCount.value),
    lastSyncTimestamp: computed(() => lastSyncTimestamp.value),
    isEmulator: isEmulatorActive,
    triggerManualSync,
    refreshPendingCount
  };
}

export default useOfflineSync;
