<template>
  <Transition name="fade-slide" mode="out-in">
    <div class="w-full max-w-sm lg:max-w-lg mx-auto mt-6">
      <div
        class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6"
      >
        <!-- Header -->
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-lg sm:text-xl font-bold text-gray-800">
              {{ selectedDay ? "Resumen del día" : "Selecciona un día" }}
            </h3>
            <p class="text-xs sm:text-sm text-gray-500 mt-0.5">
              {{
                selectedDay
                  ? selectedDay.dateReadable
                  : "Haz click en un día del calendario para ver sus detalles"
              }}
            </p>
          </div>
          <button
            v-if="selectedDay"
            @click="closeDetails"
            class="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-lg hover:bg-gray-50"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- Contenido cuando HAY día seleccionado -->
        <div v-if="selectedDay">
          <!-- Estados del día (Lista minimalista) -->
          <div class="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4">
            <h4 class="text-xs font-semibold text-gray-500 uppercase mb-3">
              Estado del día
            </h4>
            <div class="space-y-2">
              <!-- Apertura -->
              <div class="flex items-center gap-2">
                <div
                  :class="[
                    'w-2 h-2 rounded-full',
                    selectedDay.hasOpening ? 'bg-red-500' : 'bg-gray-300',
                  ]"
                ></div>
                <span
                  :class="[
                    'text-sm',
                    selectedDay.hasOpening
                      ? 'text-gray-800 font-medium'
                      : 'text-gray-400',
                  ]"
                >
                  Apertura
                </span>
              </div>

              <!-- Transacciones -->
              <div class="flex items-center gap-2">
                <div
                  :class="[
                    'w-2 h-2 rounded-full',
                    selectedDay.hasTxn ? 'bg-red-500' : 'bg-gray-300',
                  ]"
                ></div>
                <span
                  :class="[
                    'text-sm',
                    selectedDay.hasTxn
                      ? 'text-gray-800 font-medium'
                      : 'text-gray-400',
                  ]"
                >
                  Transacciones
                </span>
              </div>

              <!-- Cierre -->
              <div class="flex items-center gap-2">
                <div
                  :class="[
                    'w-2 h-2 rounded-full',
                    selectedDay.hasClosure ? 'bg-red-500' : 'bg-gray-300',
                  ]"
                ></div>
                <span
                  :class="[
                    'text-sm',
                    selectedDay.hasClosure
                      ? 'text-gray-800 font-medium'
                      : 'text-gray-400',
                  ]"
                >
                  Cierre
                </span>
              </div>
            </div>
          </div>

          <!-- Resumen financiero -->
          <div v-if="selectedDay.hasTxn" class="space-y-3 mb-4">
            <!-- Grid de métricas -->
            <div class="grid grid-cols-2 gap-3">
              <!-- Ingresos -->
              <div class="bg-green-50 rounded-lg p-3">
                <span class="text-xs font-medium text-green-700">Ingresos</span>
                <p class="text-lg font-semibold text-green-800 mt-1">
                  S/{{
                    (selectedDay.summary.totals?.income || 0).toLocaleString(
                      "es-MX"
                    )
                  }}
                </p>
              </div>

              <!-- Egresos -->
              <div class="bg-red-50 rounded-lg p-3">
                <span class="text-xs font-medium text-red-700">Egresos</span>
                <p class="text-lg font-semibold text-red-800 mt-1">
                  S/{{
                    (selectedDay.summary.totals?.expense || 0).toLocaleString(
                      "es-MX"
                    )
                  }}
                </p>
              </div>
            </div>

            <!-- Resultado -->
            <div class="bg-blue-50 rounded-lg p-3">
              <span class="text-xs font-medium text-blue-700"
                >Resultado Operacional</span
              >
              <p
                :class="[
                  'text-xl font-bold mt-1',
                  (selectedDay.summary.operational?.result || 0) >= 0
                    ? 'text-blue-800'
                    : 'text-red-700',
                ]"
              >
                S/{{
                  (selectedDay.summary.operational?.result || 0).toLocaleString(
                    "es-MX"
                  )
                }}
              </p>
            </div>
          </div>

          <!-- Lista de transacciones (si hay) -->
          <div v-if="selectedDay.hasTxn">
            <ListRecordByDay :dayString="selectedDay.dayString" />
          </div>

          <!-- Mensaje si no hay datos -->
          <div
            v-if="!selectedDay.hasOpening && !selectedDay.hasTxn"
            class="bg-gray-50 rounded-lg p-6 text-center"
          >
            <div
              class="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3"
            >
              <svg
                class="w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h4 class="text-base font-semibold text-gray-800 mb-1">
              Sin actividad
            </h4>
            <p class="text-xs text-gray-500">
              No hay datos registrados para este día
            </p>
          </div>
        </div>

        <!-- Estado por defecto cuando NO hay día seleccionado -->
        <div v-else class="text-center py-8">
          <div
            class="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <CursorPointer class="text-red-500" />
          </div>
          <h4 class="text-lg font-semibold text-gray-800 mb-2">
            Selecciona un día
          </h4>
          <p class="text-sm text-gray-500">
            Haz click en cualquier día del calendario para ver sus detalles y
            transacciones
          </p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { watch } from "vue";
import ListRecordByDay from "@/components/HistorialRecords/ListRecordByDay.vue";
import { CursorPointer } from "@iconoir/vue";

// Emits
const emit = defineEmits(["clear-selection"]);

// Props
const props = defineProps({
  selectedDay: {
    type: Object,
    default: null,
  },
});

// Methods
const closeDetails = () => {
  // Emitir evento para limpiar la selección
  emit("clear-selection");
  // Scroll hacia arriba
  window.scrollTo({ top: 0, behavior: "smooth" });
};

// Watch para detectar cambios en selectedDay
watch(
  () => props.selectedDay,
  (newVal) => {
    if (newVal) {
      console.log("📊 Detalles del día cargados:", newVal);
    }
  }
);
</script>

<style scoped>
/* Animación de entrada suave */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
