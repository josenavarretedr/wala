<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-100 mb-24">
    <div class="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
      <h2 class="text-base sm:text-lg font-bold text-gray-900">
        Monitoreos Realizados
      </h2>
      <p class="text-xs sm:text-sm text-gray-600 mt-1">
        Registro de todos los monitoreos completados para esta actividad
      </p>
    </div>

    <div class="p-4 sm:p-6">
      <!-- Empty State -->
      <div v-if="!participations.length" class="text-center py-12">
        <p class="text-xs sm:text-sm text-gray-500">
          No se han realizado monitoreos aún
        </p>
      </div>

      <!-- Lista de Monitoreos -->
      <div v-else class="space-y-4">
        <div
          v-for="monitoring in participations"
          :key="monitoring.id"
          class="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1">
              <h3 class="font-semibold text-gray-900 text-sm sm:text-base">
                {{ monitoring.userName }}
              </h3>
              <p class="text-xs sm:text-sm text-gray-600">
                {{ monitoring.businessName }}
              </p>
            </div>
            <div class="flex items-center gap-2">
              <div class="text-right mr-2">
                <div class="text-xl sm:text-2xl font-bold text-purple-600">
                  {{
                    monitoring.monitoringData?.overallScore?.toFixed(1) || "N/A"
                  }}
                </div>
                <p class="text-xs text-gray-500">Score General</p>
              </div>
              <!-- Botones de acción -->
              <button
                @click="$emit('view-details', monitoring)"
                class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Ver detalles"
              >
                <InfoCircle class="w-5 h-5" />
              </button>
              <button
                @click="$emit('delete', monitoring)"
                class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Eliminar monitoreo"
              >
                <Trash class="w-5 h-5" />
              </button>
            </div>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            <div>
              <p class="text-xs text-gray-500">Modalidad</p>
              <p class="text-xs sm:text-sm font-medium text-gray-900">
                {{ monitoring.monitoringData?.modality || "N/A" }}
              </p>
            </div>
            <div>
              <p class="text-xs text-gray-500">Fecha Monitoreo</p>
              <p class="text-xs sm:text-sm font-medium text-gray-900">
                {{ formatDate(monitoring.monitoringData?.monitoringDate) }}
              </p>
            </div>
            <div>
              <p class="text-xs text-gray-500">Enviado</p>
              <p class="text-xs sm:text-sm font-medium text-gray-900">
                {{ formatDate(monitoring.submittedAt) }}
              </p>
            </div>
            <div>
              <p class="text-xs text-gray-500">Evidencias</p>
              <p class="text-xs sm:text-sm font-medium text-gray-900">
                {{ monitoring.monitoringData?.evidenceUrls?.length || 0 }}
              </p>
            </div>
          </div>

          <!-- Category Scores -->
          <div v-if="monitoring.monitoringData?.categoryScores" class="mt-3">
            <p class="text-xs text-gray-500 mb-2">Scores por Categoría:</p>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div
                v-for="(score, category) in monitoring.monitoringData
                  .categoryScores"
                :key="category"
                class="text-xs"
              >
                <span class="text-gray-600"
                  >{{ getCategoryLabel(category) }}:</span
                >
                <span class="font-semibold text-gray-900 ml-1">{{
                  score.toFixed(1)
                }}</span>
              </div>
            </div>
          </div>

          <!-- Comentarios adicionales -->
          <div
            v-if="monitoring.monitoringData?.additionalComments"
            class="mt-3 pt-3 border-t border-gray-100"
          >
            <p class="text-xs text-gray-500 mb-1">Comentarios:</p>
            <p class="text-xs sm:text-sm text-gray-700">
              {{ monitoring.monitoringData.additionalComments }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { InfoCircle, Trash } from "@iconoir/vue";

defineProps({
  participations: {
    type: Array,
    default: () => [],
  },
});

defineEmits(["view-details", "delete"]);

function getCategoryLabel(category) {
  const labels = {
    negocio: "Negocio",
    marketing: "Marketing",
    controlStock: "Control Stock",
    compras: "Compras",
    costeo: "Costeo",
    mantenimientoRegistros: "Registros",
    planificacion: "Planificación",
  };
  return labels[category] || category;
}

function formatDate(timestamp) {
  if (!timestamp) return "N/A";

  let date;
  if (timestamp.toDate) {
    date = timestamp.toDate();
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else {
    date = new Date(timestamp);
  }

  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
</script>
