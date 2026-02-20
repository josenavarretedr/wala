<template>
  <div v-if="showIndicator" class="sync-status-indicator">
    <!-- Indicador de sincronización pendiente -->
    <div v-if="hasPendingOperations" class="sync-pending">
      <div class="spinner"></div>
      <span class="sync-text">
        Sincronizando {{ pendingOperationsCount }}
        {{ pendingOperationsCount === 1 ? "operación" : "operaciones" }}...
      </span>
    </div>

    <!-- Indicador de operaciones fallidas -->
    <div v-if="hasFailedOperations" class="sync-failed">
      <div class="failed-header">
        <svg class="warning-icon" viewBox="0 0 20 20" fill="currentColor">
          <path
            fill-rule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clip-rule="evenodd"
          />
        </svg>
        <span class="failed-text">
          {{ failedOperationsCount }}
          {{
            failedOperationsCount === 1
              ? "operación falló"
              : "operaciones fallaron"
          }}
        </span>
      </div>

      <!-- Lista de operaciones fallidas -->
      <div class="failed-operations-list">
        <div
          v-for="operation in failedOperations"
          :key="operation.id"
          class="failed-operation-item"
        >
          <div class="operation-info">
            <span class="operation-desc">{{
              operation.metadata?.description || "Operación desconocida"
            }}</span>
            <span class="operation-attempts"
              >Intentos: {{ operation.attempts }}/{{
                operation.maxAttempts
              }}</span
            >
          </div>
          <div class="operation-error" v-if="operation.error">
            {{ operation.error }}
          </div>
        </div>
      </div>

      <!-- Botón de reintento -->
      <button @click="handleRetry" class="retry-button" :disabled="isRetrying">
        <svg
          v-if="!isRetrying"
          class="retry-icon"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
            clip-rule="evenodd"
          />
        </svg>
        <div v-else class="spinner-small"></div>
        {{ isRetrying ? "Reintentando..." : "Reintentar todo" }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useOptimisticSync } from "@/composables/useOptimisticSync";

// Instanciar composable
const {
  hasPendingOperations,
  pendingOperationsCount,
  failedOperationsCount,
  failedOperations,
  retryFailedOperations,
} = useOptimisticSync();

// Estado local
const isRetrying = ref(false);

// Mostrar indicador si hay operaciones pendientes o fallidas
const showIndicator = computed(() => {
  return hasPendingOperations.value || failedOperationsCount.value > 0;
});

const hasFailedOperations = computed(() => {
  return failedOperationsCount.value > 0;
});

// Manejar reintento de operaciones fallidas
const handleRetry = async () => {
  isRetrying.value = true;
  try {
    await retryFailedOperations();
  } catch (error) {
    console.error("Error al reintentar operaciones:", error);
  } finally {
    isRetrying.value = false;
  }
};
</script>

<style scoped>
.sync-status-indicator {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 400px;
}

.sync-pending {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #3b82f6;
  color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease-out;
}

.sync-failed {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease-out;
}

.failed-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #dc2626;
  font-weight: 600;
}

.warning-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.sync-text {
  font-size: 14px;
  font-weight: 500;
}

.failed-text {
  font-size: 14px;
}

.failed-operations-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.failed-operation-item {
  padding: 8px;
  background: white;
  border: 1px solid #fecaca;
  border-radius: 4px;
  font-size: 13px;
}

.operation-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.operation-desc {
  color: #1f2937;
  font-weight: 500;
}

.operation-attempts {
  color: #6b7280;
  font-size: 12px;
}

.operation-error {
  color: #dc2626;
  font-size: 12px;
  margin-top: 4px;
  font-style: italic;
}

.retry-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.retry-button:hover:not(:disabled) {
  background: #b91c1c;
}

.retry-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.retry-icon {
  width: 16px;
  height: 16px;
}

/* Spinner para sincronización pendiente */
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Spinner pequeño para botón de reintento */
.spinner-small {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Animaciones */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Responsivo */
@media (max-width: 768px) {
  .sync-status-indicator {
    bottom: 16px;
    right: 16px;
    left: 16px;
    max-width: none;
  }
}

/* Scroll personalizado para lista de operaciones fallidas */
.failed-operations-list::-webkit-scrollbar {
  width: 6px;
}

.failed-operations-list::-webkit-scrollbar-track {
  background: #fee2e2;
  border-radius: 3px;
}

.failed-operations-list::-webkit-scrollbar-thumb {
  background: #fca5a5;
  border-radius: 3px;
}

.failed-operations-list::-webkit-scrollbar-thumb:hover {
  background: #f87171;
}
</style>
