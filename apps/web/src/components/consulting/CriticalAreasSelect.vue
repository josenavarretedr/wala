<template>
  <div
    id="criticalAreasSelectWrapper"
    class="space-y-6 max-w-2xl mx-auto bg-white shadow-2xl shadow-gray-300/50 rounded-3xl border border-gray-100 p-5 sm:p-8 mb-20 font-display relative"
  >
    <!-- HEADER -->
    <div class="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
      <div class="flex items-center gap-3">
        <!-- Reusing standard UI progress dots style -->
        <div class="flex items-center gap-2">
          <div class="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold bg-orange-50 text-[#E35336] border border-orange-100">
            {{ currentStep < 3 ? currentStep + 1 : '✓' }}
          </div>
          <div class="flex items-center gap-1">
            <div
              v-for="idx in 4"
              :key="idx"
              :class="[
                'w-2 h-2 rounded-full transition-all duration-300',
                (idx - 1) <= currentStep ? 'bg-[#E35336] w-4' : 'bg-gray-200',
              ]"
            ></div>
          </div>
          <span class="text-xs text-gray-400 font-semibold font-mono">
            / 4
          </span>
        </div>
      </div>

      <!-- Close Button -->
      <button
        @click="$emit('close')"
        class="w-10 h-10 text-gray-400 hover:text-red-500 rounded-2xl flex items-center justify-center transition-all duration-200 hover:bg-gray-50 border border-transparent hover:border-gray-100"
        title="Volver"
      >
        <Xmark class="w-5 h-5" />
      </button>
    </div>

    <!-- MAIN STEPS -->
    <Transition name="fade-slide" mode="out-in">
      <!-- Steps 1 to 3: Selection & Justification -->
      <div v-if="currentStep < 3" :key="currentStep" class="space-y-6">
        <!-- Title & Instruction -->
        <div class="text-center space-y-2">
          <h2 class="text-xl sm:text-2xl font-black text-gray-800 tracking-tight">
            Definir Área Crítica #{{ currentStep + 1 }}
          </h2>
          <p class="text-xs sm:text-sm text-gray-400 max-w-md mx-auto font-medium">
            Selecciona una de las áreas críticas prioritarias de la lista (ordenadas de menor a mayor promedio en base a la última evaluación).
          </p>
        </div>

        <!-- Sorted list of selectable areas -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-h-[380px] overflow-y-auto pr-1">
          <button
            v-for="area in availableAreas"
            :key="area.key"
            @click="handleSelectArea(area.key)"
            :class="[
              'w-full p-4 sm:p-5 rounded-2xl transition-all duration-300 transform active:scale-[0.98] flex items-center gap-4 text-left border relative group shadow-sm hover:shadow-md cursor-pointer',
              selectedAreaInCurrentStep === area.key
                ? 'bg-[#E35336] text-white border-transparent shadow-[#E35336]/20'
                : 'bg-white text-gray-600 hover:bg-orange-50/40 border-gray-150 hover:border-orange-200/60',
            ]"
          >
            <!-- Area Icon -->
            <div
              :class="[
                'p-2.5 rounded-xl shrink-0 transition-colors duration-300',
                selectedAreaInCurrentStep === area.key
                  ? 'bg-white/20 backdrop-blur-md text-white'
                  : 'bg-orange-50 text-[#E35336] group-hover:bg-orange-100/60',
              ]"
            >
              <component :is="getAreaIcon(area.icon)" class="w-5 h-5 stroke-[2.5]" />
            </div>

            <!-- Area Information -->
            <div class="flex-1 min-w-0 pr-6">
              <span class="text-sm font-extrabold block truncate leading-snug">
                {{ area.name }}
              </span>
              <span
                :class="[
                  'text-[10px] font-bold font-mono tracking-wider uppercase inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md border',
                  selectedAreaInCurrentStep === area.key
                    ? 'bg-white/10 text-white border-white/20'
                    : 'bg-gray-50 text-gray-500 border-gray-200',
                ]"
              >
                Promedio: {{ area.score !== null ? area.score.toFixed(1) : '0.0' }} / 3.0
              </span>
            </div>

            <!-- Check Indicator -->
            <div
              v-if="selectedAreaInCurrentStep === area.key"
              class="absolute right-4 w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center text-white"
            >
              <Check class="w-4 h-4 stroke-[3]" />
            </div>
          </button>
        </div>

        <!-- Justification Section (Animates in when area is selected) -->
        <Transition name="expand">
          <div v-if="selectedAreaInCurrentStep" class="bg-orange-50/30 rounded-2xl border border-orange-100/50 p-4 sm:p-5 space-y-3">
            <label class="block text-xs font-black text-orange-950 uppercase tracking-widest">
              Justificación de la Selección
            </label>
            <p class="text-xs text-[#E35336]/80 leading-relaxed font-medium">
              Escribe un comentario o justificación técnica sobre por qué esta área requiere atención prioritaria y cuáles son las principales ineficiencias encontradas.
            </p>
            <textarea
              v-model="currentJustification"
              rows="3"
              class="w-full rounded-xl border-orange-200 shadow-sm focus:border-[#E35336] focus:ring-[#E35336] text-sm p-3.5 bg-white text-gray-700 placeholder-gray-400"
              placeholder="Ej: El negocio no separa las cuentas personales de la caja y carece de un salario formal asignado para el fundador, impidiendo medir el costo real de operación..."
            ></textarea>
          </div>
        </Transition>
      </div>

      <!-- Step 4: Success & Confirmation -->
      <div v-else key="success" class="space-y-6 text-center py-8">
        <!-- Success Icon -->
        <div class="mx-auto w-20 h-20 bg-[#E35336] text-white rounded-full flex items-center justify-center shadow-lg shadow-[#E35336]/20 transform animate-bounce">
          <Check class="w-10 h-10 stroke-[3.5]" />
        </div>

        <!-- Text -->
        <div class="space-y-2">
          <h2 class="text-2xl font-black text-gray-800 tracking-tight">
            ¡Áreas Críticas Listas!
          </h2>
          <p class="text-sm text-gray-400 font-medium max-w-sm mx-auto">
            Has identificado y documentado las 3 áreas críticas principales para el negocio. A continuación, un resumen de la selección:
          </p>
        </div>

        <!-- Summary Grid -->
        <div class="bg-gray-50 border border-gray-150/60 rounded-3xl p-5 space-y-3 text-left max-w-md mx-auto">
          <div
            v-for="(areaKey, idx) in flowStore.selectedAreas"
            :key="areaKey"
            class="flex items-start gap-3.5 p-3 rounded-2xl bg-white border border-gray-100 shadow-sm"
          >
            <div class="w-7 h-7 rounded-xl bg-orange-50 text-[#E35336] flex items-center justify-center shrink-0 border border-orange-100/60 text-xs font-black">
              {{ idx + 1 }}
            </div>
            <div class="flex-1 min-w-0">
              <span class="text-xs font-black text-gray-800 block truncate">
                {{ getAreaName(areaKey) }}
              </span>
              <p class="text-[11px] text-gray-500 line-clamp-2 mt-0.5 leading-relaxed font-medium">
                {{ flowStore.justifications[idx] }}
              </p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="pt-4">
          <button
            @click="handleFinished"
            class="inline-flex items-center gap-2 rounded-2xl bg-[#E35336] hover:bg-[#c2412b] text-white font-extrabold px-8 py-3.5 text-sm shadow-md shadow-[#E35336]/10 transition-all cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Regresar al Dashboard
          </button>
        </div>
      </div>
    </Transition>

    <!-- FIXED NAVIGATION BOTTOM BAR -->
    <div
      v-if="currentStep < 3"
      class="border-t border-gray-100 pt-4 mt-6 flex justify-between items-center gap-4"
    >
      <button
        @click="handlePrevStep"
        :disabled="currentStep === 0"
        class="inline-flex items-center gap-1.5 rounded-2xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-800 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-gray-600 px-5 py-3 text-xs font-bold transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
      >
        <NavArrowLeft class="w-4 h-4 stroke-[2.5]" />
        Anterior
      </button>

      <button
        @click="handleNextStep"
        :disabled="!selectedAreaInCurrentStep || !currentJustification.trim() || flowStore.saving"
        class="inline-flex items-center gap-1.5 rounded-2xl bg-[#E35336] text-white hover:bg-[#c2412b] disabled:opacity-40 disabled:hover:bg-[#E35336] px-6 py-3.5 text-xs font-bold transition-all duration-200 cursor-pointer disabled:cursor-not-allowed shadow-md shadow-[#E35336]/10"
      >
        {{ currentStep === 2 ? (flowStore.saving ? 'Guardando...' : 'Guardar y Finalizar') : 'Siguiente' }}
        <NavArrowRight v-if="currentStep < 2" class="w-4 h-4 stroke-[2.5]" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from "vue";
import {
  Home,
  Megaphone,
  Cart,
  Archive,
  Coins,
  Book,
  Calendar,
  Xmark,
  NavArrowLeft,
  NavArrowRight,
  Check,
} from "@iconoir/vue";
import { usePerformanceStore, AREAS_CONFIG } from "@/stores/performanceStore";
import { useCriticalAreasFlowStore } from "@/stores/criticalAreasFlowStore";
import { useToast } from "@/composables/useToast";

const props = defineProps({
  businessId: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["close", "saved"]);

const performanceStore = usePerformanceStore();
const flowStore = useCriticalAreasFlowStore();
const toast = useToast();

const currentStep = computed(() => flowStore.currentStep);

// Local copy for quick reactivity within each step
const selectedAreaInCurrentStep = ref(null);
const currentJustification = ref("");

// Reset flow store when opening
onMounted(() => {
  flowStore.resetFlow();
  syncStepData();
});

// Watch currentStep to sync values
watch(
  () => flowStore.currentStep,
  () => {
    syncStepData();
  }
);

// Sync step values when step changes
const syncStepData = () => {
  if (flowStore.currentStep < 3) {
    selectedAreaInCurrentStep.value = flowStore.selectedAreas[flowStore.currentStep];
    currentJustification.value = flowStore.justifications[flowStore.currentStep] || "";
  }
};

// Identify the latest saved moment with evaluations (must be fully complete with 21 indicators)
const latestMomentId = computed(() => {
  const moments = ["inicial", "ciclo1", "ciclo2", "final"];
  
  // 1. Extract all 21 keys from AREAS_CONFIG
  const allIndicatorKeys = AREAS_CONFIG.flatMap((area) =>
    area.indicators.map((ind) => ind.key)
  );

  // 2. Filter moments that are fully complete
  const completedMoments = moments.filter((m) => {
    const scores = performanceStore.evaluations[m]?.scores;
    if (!scores) return false;
    return allIndicatorKeys.every(
      (key) => scores[key] !== undefined && scores[key] !== null && scores[key] !== ""
    );
  });

  if (completedMoments.length === 0) {
    return "inicial";
  }

  // 3. First search for newest savedAt date among completed moments
  let bestMoment = null;
  let bestTime = 0;
  
  completedMoments.forEach((m) => {
    const savedAt = performanceStore.evaluations[m]?.savedAt;
    if (savedAt) {
      const time = new Date(savedAt).getTime();
      if (time > bestTime) {
        bestTime = time;
        bestMoment = m;
      }
    }
  });
  
  if (bestMoment) return bestMoment;

  // 4. Fallback to latest chronological completed moment
  return completedMoments[completedMoments.length - 1];
});

// Calculate average scores for each area in the latest saved cycle
const latestScores = computed(() => {
  const moment = latestMomentId.value;
  return performanceStore.evaluations[moment]?.scores || {};
});

const getAreaScoreAverage = (area) => {
  const scores = latestScores.value;
  let total = 0;
  let count = 0;

  area.indicators.forEach((indicator) => {
    const val = scores[indicator.key];
    if (val !== undefined && val !== null) {
      total += Number(val);
      count++;
    }
  });

  return count > 0 ? Number((total / count).toFixed(2)) : 0;
};

// Compute area scores and order them from lowest to highest (ascending)
const sortedAreas = computed(() => {
  return AREAS_CONFIG.map((area) => {
    return {
      ...area,
      score: getAreaScoreAverage(area),
    };
  }).sort((a, b) => a.score - b.score);
});

// Filter out already selected areas from previous steps
const availableAreas = computed(() => {
  const currentIdx = flowStore.currentStep;
  const alreadyChosen = [];
  
  for (let i = 0; i < currentIdx; i++) {
    if (flowStore.selectedAreas[i]) {
      alreadyChosen.push(flowStore.selectedAreas[i]);
    }
  }

  return sortedAreas.value.filter((area) => !alreadyChosen.includes(area.key));
});

// Selection actions
const handleSelectArea = (areaKey) => {
  selectedAreaInCurrentStep.value = areaKey;
  flowStore.setArea(flowStore.currentStep, areaKey);
};

const handleNextStep = async () => {
  if (!selectedAreaInCurrentStep.value) return;
  if (!currentJustification.value || !currentJustification.value.trim()) return;

  // Save current step data to Pinia store
  flowStore.setJustification(flowStore.currentStep, currentJustification.value.trim());

  if (flowStore.currentStep < 2) {
    flowStore.nextStep();
  } else {
    // We are on step 3 (index 2). Let's save!
    const scoresMap = {};
    AREAS_CONFIG.forEach((area) => {
      scoresMap[area.key] = getAreaScoreAverage(area);
    });

    const success = await flowStore.saveCriticalAreas(props.businessId, scoresMap);
    if (success) {
      emit("saved");
      flowStore.nextStep(); // Advance to success step (index 3)
    }
  }
};

const handlePrevStep = () => {
  if (flowStore.currentStep > 0) {
    flowStore.prevStep();
  }
};

const handleFinished = () => {
  emit("close");
};

// Dynamic helper to resolve names and icons
const getAreaName = (areaKey) => {
  const config = AREAS_CONFIG.find((a) => a.key === areaKey);
  return config ? config.name : areaKey;
};

const getAreaIcon = (iconName) => {
  const mapping = {
    Home,
    Megaphone,
    Cart,
    Archive,
    Coins,
    Book,
    Calendar,
  };
  return mapping[iconName] || Home;
};
</script>

<style scoped>
.font-display {
  font-family: "Outfit", "Inter", sans-serif;
}

/* Slide Transition */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(15px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-15px);
}

/* Expand Transition */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 250px;
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0px;
  padding: 0 !important;
  border-color: transparent !important;
  margin-top: 0 !important;
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 5px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 9999px;
}
::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}

textarea {
  resize: none;
}
</style>
