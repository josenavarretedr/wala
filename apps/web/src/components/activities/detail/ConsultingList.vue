<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-100 mb-24">
    <div class="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
      <h2 class="text-base sm:text-lg font-bold text-gray-900">
        Asesorías Realizadas
      </h2>
      <p class="text-xs sm:text-sm text-gray-600 mt-1">
        Registro de todas las asesorías completadas para esta actividad
      </p>
    </div>

    <div class="p-4 sm:p-6">
      <!-- Empty State -->
      <div v-if="!participations.length" class="text-center py-12">
        <p class="text-xs sm:text-sm text-gray-500">
          No se han realizado asesorías aún
        </p>
      </div>

      <!-- Lista de Asesorías -->
      <div v-else class="space-y-4">
        <div
          v-for="monitoring in participations"
          :key="monitoring.id"
          class="bg-white rounded-xl shadow-sm border border-purple-200 transition-all duration-200 hover:shadow-md hover:border-purple-300"
        >
          <!-- Header con Score Principal -->
          <div
            @click="toggleExpand(monitoring.id)"
            class="p-4 sm:p-5 cursor-pointer"
          >
            <div class="flex items-start justify-between gap-4">
              <!-- Info Principal -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-2">
                  <h3
                    class="font-semibold text-gray-900 text-base sm:text-lg truncate"
                  >
                    {{ monitoring.userName }}
                  </h3>
                  <!-- Badge Modalidad -->
                  <!-- <div
                    :class="[
                      'inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium border',
                      getModalityClass(monitoring.monitoringData?.modality),
                    ]"
                  >
                    {{ getModalityLabel(monitoring.monitoringData?.modality) }}
                  </div> -->
                </div>
                <p class="text-sm text-gray-600 truncate">
                  {{ monitoring.businessName }}
                </p>
              </div>

              <!-- Score General (Destacado) -->
              <div
                class="flex items-center gap-3 border-l-2 border-purple-200 pl-4"
              >
                <div class="text-center">
                  <div
                    class="text-3xl sm:text-4xl font-bold text-purple-600 leading-none mb-1"
                  >
                    {{
                      monitoring.monitoringData?.overallScore?.toFixed(0) || "0"
                    }}
                  </div>
                  <p class="text-xs text-gray-500 font-medium mb-2">
                    de 63 pts
                  </p>
                  <!-- Badge Cohorte -->
                  <div
                    :class="[
                      'inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold',
                      getCohortClass(monitoring.monitoringData?.overallScore),
                    ]"
                  >
                    {{
                      getCohortLabel(monitoring.monitoringData?.overallScore)
                    }}
                  </div>
                </div>

                <!-- Botones de acción -->
                <div class="flex flex-col gap-2">
                  <button
                    @click.stop="$emit('view-details', monitoring)"
                    class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Ver detalles"
                  >
                    <InfoCircle class="w-5 h-5" />
                  </button>
                  <!-- <button
                    @click.stop="$emit('delete', monitoring)"
                    class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar asesoría"
                  >
                    <Trash class="w-5 h-5" />
                  </button> -->
                </div>
              </div>
            </div>

            <!-- Indicador de expansión -->
            <div
              v-if="
                monitoring.monitoringData?.categoryScores ||
                monitoring.monitoringData?.additionalComments
              "
              class="flex items-center justify-center mt-3 pt-3 border-t border-gray-100"
            >
              <button
                class="flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-700 font-medium transition-colors"
              >
                <span>{{
                  expandedIds.includes(monitoring.id)
                    ? "Ocultar detalles"
                    : "Ver detalles de evaluación"
                }}</span>
                <svg
                  :class="[
                    'w-4 h-4 transition-transform duration-200',
                    expandedIds.includes(monitoring.id) ? 'rotate-180' : '',
                  ]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>
          </div>

          <!-- Contenido Expandible -->
          <div
            v-if="expandedIds.includes(monitoring.id)"
            class="px-4 sm:px-5 pb-4 sm:pb-5 space-y-4 border-t border-gray-100"
          >
            <!-- Category Scores (Badges) -->
            <div v-if="monitoring.monitoringData?.categoryScores" class="pt-4">
              <p class="text-xs text-gray-500 font-medium mb-2.5">
                Evaluación por Categoría
              </p>
              <div class="flex flex-wrap gap-2">
                <div
                  v-for="(score, category) in monitoring.monitoringData
                    .categoryScores"
                  :key="category"
                  :class="[
                    'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border',
                    getCategoryColorClass(category),
                  ]"
                >
                  <span>{{ getCategoryLabel(category) }}</span>
                  <span
                    class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white bg-opacity-60 font-bold text-xs"
                  >
                    {{ score.toFixed(0) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Comentarios adicionales -->
            <div v-if="monitoring.monitoringData?.additionalComments">
              <p class="text-xs text-gray-500 font-medium mb-1.5">
                Comentarios:
              </p>
              <p class="text-sm text-gray-700 leading-relaxed">
                {{ monitoring.monitoringData.additionalComments }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { InfoCircle, Trash } from "@iconoir/vue";

defineProps({
  participations: {
    type: Array,
    default: () => [],
  },
});

defineEmits(["view-details", "delete"]);

const expandedIds = ref([]);

function toggleExpand(id) {
  const index = expandedIds.value.indexOf(id);
  if (index > -1) {
    expandedIds.value.splice(index, 1);
  } else {
    expandedIds.value.push(id);
  }
}

function getCategoryLabel(category) {
  const labels = {
    negocioFamilia: "Negocio y Familia",
    marketing: "Marketing",
    controlStock: "Control de Stock",
    compras: "Compras",
    costeo: "Costeo",
    mantenimientoRegistros: "Registros",
    planificacion: "Planificación",
  };
  return labels[category] || category;
}

function getCategoryColorClass(category) {
  // Colores basados en ConsultingForm.vue categories
  const colorClasses = {
    negocioFamilia: "bg-blue-50 text-blue-900 border-blue-200",
    marketing: "bg-green-50 text-green-900 border-green-200",
    controlStock: "bg-purple-50 text-purple-900 border-purple-200",
    compras: "bg-yellow-50 text-yellow-900 border-yellow-200",
    costeo: "bg-red-50 text-red-900 border-red-200",
    mantenimientoRegistros: "bg-indigo-50 text-indigo-900 border-indigo-200",
    planificacion: "bg-pink-50 text-pink-900 border-pink-200",
  };
  return colorClasses[category] || "bg-gray-50 text-gray-900 border-gray-200";
}

function getModalityLabel(modality) {
  const labels = {
    presencial: "Presencial",
    virtual: "Virtual",
    hibrido: "Híbrido",
  };
  return labels[modality] || modality || "N/A";
}

function getModalityClass(modality) {
  const classes = {
    presencial: "bg-blue-50 text-blue-700 border-blue-200",
    virtual: "bg-purple-50 text-purple-700 border-purple-200",
    hibrido: "bg-indigo-50 text-indigo-700 border-indigo-200",
  };
  return classes[modality] || "bg-gray-50 text-gray-700 border-gray-200";
}

function getCohortLabel(score) {
  if (!score) return "Sin Evaluar";
  if (score <= 21) return "Inicial";
  if (score <= 42) return "Intermedio";
  return "Avanzado";
}

function getCohortClass(score) {
  if (!score) return "bg-gray-100 text-gray-700";
  if (score <= 21) return "bg-amber-100 text-amber-800 border border-amber-300";
  if (score <= 42) return "bg-blue-100 text-blue-800 border border-blue-300";
  return "bg-green-100 text-green-800 border border-green-300";
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
