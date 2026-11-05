import { ref } from 'vue';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import {
  enqueueSyncItem,
  getPendingSyncQueue,
  removeSyncItem,
  updateSyncQueueItem,
  countPendingSyncItems
} from '@/services/db/indexedDB';

// Estado reactivo global del gestor de sincronización
export const isSyncing = ref(false);
export const pendingCount = ref(0);
export const lastSyncTimestamp = ref(null);
export const isOnline = ref(typeof navigator !== 'undefined' ? navigator.onLine : true);

let isProcessing = false;
let listenersInitialized = false;

/**
 * Actualiza el contador reactivo de mutaciones pendientes en el dispositivo
 */
export async function refreshPendingCount() {
  try {
    const count = await countPendingSyncItems();
    pendingCount.value = count;
    return count;
  } catch (err) {
    console.warn('[SyncQueue] No se pudo refrescar pendingCount:', err);
    return 0;
  }
}

/**
 * Registra una mutación en IndexedDB y despacha inmediatamente si hay conexión
 * @param {object} mutation
 * @param {string} mutation.collection
 * @param {string} mutation.docId
 * @param {'SET'|'UPDATE'} [mutation.action='SET']
 * @param {object} mutation.payload
 */
export async function enqueueMutation({ collection, docId, action = 'SET', payload }) {
  if (!collection || !docId) {
    throw new Error('[SyncQueue] collection y docId son obligatorios para encolar mutación.');
  }

  // 1. Guardar de forma persistente e inmediata en IndexedDB (Offline-First)
  const entry = await enqueueSyncItem({
    collection,
    docId: String(docId),
    action: action || 'SET',
    payload
  });

  await refreshPendingCount();

  // 2. Si el dispositivo tiene conexión, intentar despachar de inmediato en segundo plano
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    processQueue().catch((err) => {
      console.warn('[SyncQueue] Error al procesar cola inmediatamente tras enqueue:', err);
    });
  }

  return entry;
}

/**
 * Procesa en orden FIFO todos los elementos pendientes hacia Firestore/Emulador
 */
export async function processQueue() {
  if (isProcessing) {
    console.info('[SyncQueue] Proceso de cola ya en curso, esperando turno.');
    return;
  }

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    console.info('[SyncQueue] Dispositivo sin conexión. La cola permanecerá en espera.');
    isOnline.value = false;
    return;
  }

  isProcessing = true;
  isSyncing.value = true;

  try {
    const queue = await getPendingSyncQueue();
    pendingCount.value = queue.length;

    if (queue.length === 0) {
      isSyncing.value = false;
      isProcessing = false;
      return;
    }

    console.info(`[SyncQueue] Procesando ${queue.length} mutaciones pendientes en orden FIFO...`);

    for (const item of queue) {
      // Si la red se cae durante el procesamiento de la cola, detener el ciclo
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        console.warn('[SyncQueue] Conexión perdida durante el procesamiento. Deteniendo cola.');
        isOnline.value = false;
        break;
      }

      await updateSyncQueueItem(item.id, { status: 'syncing' });

      try {
        // Enviar mutación atómica a Firestore / Emulador
        const docRef = doc(db, item.collection, String(item.docId));
        await setDoc(docRef, item.payload, { merge: true });

        // En caso de éxito, remover de la cola local de IndexedDB
        await removeSyncItem(item.id);
        lastSyncTimestamp.value = new Date().toISOString();
        await refreshPendingCount();
        console.info(`[SyncQueue] Mutación sincronizada exitosamente: ${item.collection}/${item.docId}`);
      } catch (mutationError) {
        console.error(`[SyncQueue] Error al sincronizar ítem ${item.id} (${item.collection}/${item.docId}):`, mutationError);

        const nextAttempts = (item.attempts || 0) + 1;
        const isNetworkErr =
          !navigator.onLine ||
          mutationError.code === 'unavailable' ||
          mutationError.message?.toLowerCase().includes('offline') ||
          mutationError.message?.toLowerCase().includes('network') ||
          mutationError.message?.toLowerCase().includes('failed to fetch');

        if (isNetworkErr) {
          // Si es falla de red, preservar ítem, regresar a pending y detener la cola
          await updateSyncQueueItem(item.id, {
            status: 'pending',
            attempts: nextAttempts,
            lastError: mutationError.message || 'Error de red'
          });
          isOnline.value = false;
          console.warn('[SyncQueue] Falla de red detectada. Cola detenida para preservar orden FIFO.');
          break;
        } else {
          // Error fatal no recuperable de validación: marcar failed para no bloquear permanentemente la cola
          await updateSyncQueueItem(item.id, {
            status: 'failed',
            attempts: nextAttempts,
            lastError: mutationError.message || 'Error desconocido'
          });
        }
      }
    }
  } catch (queueErr) {
    console.error('[SyncQueue] Error general en processQueue:', queueErr);
  } finally {
    isSyncing.value = false;
    isProcessing = false;
    await refreshPendingCount();
  }
}

/**
 * Inicializa escuchadores globales de eventos online/offline en window
 */
export function initSyncQueueListeners() {
  if (typeof window === 'undefined' || listenersInitialized) return;

  window.addEventListener('online', () => {
    console.info('[SyncQueue] Evento online detectado. Reanudando sincronización...');
    isOnline.value = true;
    processQueue();
  });

  window.addEventListener('offline', () => {
    console.info('[SyncQueue] Evento offline detectado.');
    isOnline.value = false;
    isSyncing.value = false;
  });

  // Hidratar conteo inicial desde IndexedDB
  refreshPendingCount();

  listenersInitialized = true;
}

// Auto-inicializar listeners al cargar el módulo
if (typeof window !== 'undefined') {
  initSyncQueueListeners();
}

export default {
  enqueueMutation,
  processQueue,
  refreshPendingCount,
  initSyncQueueListeners,
  isSyncing,
  pendingCount,
  lastSyncTimestamp,
  isOnline
};
