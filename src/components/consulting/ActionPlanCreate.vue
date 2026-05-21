<template>
  <div
    id="actionPlanCreateWrapper"
    class="space-y-6 max-w-2xl mx-auto bg-white shadow-2xl shadow-gray-300/50 rounded-3xl border border-gray-100 p-5 sm:p-8 mb-20 font-display relative"
  >
    <!-- HEADER -->
    <div class="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
      <div class="flex items-center gap-3">
        <!-- Progress dots -->
        <div class="flex items-center gap-2">
          <div class="flex items-center justify-center w-8 h-8 rounded-full text-xs font-black bg-indigo-50 text-indigo-600 border border-indigo-150">
            {{ currentStep < 4 ? currentStep + 1 : '✓' }}
          </div>
          <div class="flex items-center gap-1">
            <div
              v-for="idx in 5"
              :key="idx"
              :class="[
                'w-2 h-2 rounded-full transition-all duration-300',
                (idx - 1) <= currentStep ? 'bg-indigo-600 w-4' : 'bg-gray-200',
              ]"
            ></div>
          </div>
          <span class="text-xs text-gray-400 font-semibold font-mono">
            / 5
          </span>
        </div>
      </div>

      <!-- Close Button -->
      <button
        @click="$emit('close')"
        class="w-10 h-10 text-gray-400 hover:text-red-500 rounded-2xl flex items-center justify-center transition-all duration-200 hover:bg-gray-50 border border-transparent hover:border-gray-100 cursor-pointer"
        title="Cancelar y volver"
      >
        <Xmark class="w-5 h-5" />
      </button>
    </div>

    <!-- MAIN STEPS -->
    <Transition name="fade-slide" mode="out-in">
      <!-- STEP 0: Select Critical Area -->
      <div v-if="currentStep === 0" key="step-0" class="space-y-6">
        <div class="text-center space-y-2">
          <span class="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 border border-indigo-150 text-indigo-700">
            Paso 1: Foco de Trabajo
          </span>
          <h2 class="text-xl sm:text-2xl font-black text-gray-800 tracking-tight">
            Selecciona el Área Crítica
          </h2>
          <p class="text-xs sm:text-sm text-gray-400 max-w-md mx-auto font-medium">
            Selecciona una de las 3 áreas críticas priorizadas del negocio para diseñar su plan de acción personalizado.
          </p>
        </div>

        <!-- 3 Selectable Critical Areas -->
        <div v-if="criticalAreas.length > 0" class="grid grid-cols-1 gap-4">
          <button
            v-for="area in criticalAreas"
            :key="area.areaKey"
            @click="handleSelectArea(area.areaKey)"
            :class="[
              'w-full p-5 rounded-[26px] transition-all duration-300 transform active:scale-[0.99] flex items-start gap-4 text-left border relative group shadow-sm hover:shadow-md cursor-pointer',
              flowStore.selectedAreaKey === area.areaKey
                ? 'bg-indigo-650 text-white border-transparent shadow-lg shadow-indigo-600/15'
                : 'bg-white text-gray-600 hover:bg-indigo-50/20 border-gray-150 hover:border-indigo-200/50',
            ]"
          >
            <!-- Area Icon -->
            <div
              :class="[
                'p-3.5 rounded-2xl shrink-0 transition-colors duration-300 border',
                flowStore.selectedAreaKey === area.areaKey
                  ? 'bg-white/10 text-white border-white/20'
                  : 'bg-indigo-50 text-indigo-600 border-indigo-100/30 group-hover:bg-indigo-100/50',
              ]"
            >
              <component :is="getAreaIcon(getIconName(area.areaKey))" class="w-6 h-6 stroke-[2.2]" />
            </div>

            <!-- Area details -->
            <div class="flex-1 min-w-0 pr-6 space-y-1">
              <span class="text-base font-extrabold block truncate leading-snug">
                {{ area.resumenArea }}
              </span>
              <div class="flex items-center gap-2 flex-wrap">
                <span
                  :class="[
                    'text-[9px] font-bold font-mono tracking-wider uppercase px-2 py-0.5 rounded border',
                    flowStore.selectedAreaKey === area.areaKey
                      ? 'bg-white/15 text-white border-white/25'
                      : 'bg-gray-50 text-gray-500 border-gray-250/50',
                  ]"
                >
                  Score: {{ area.score !== undefined ? area.score.toFixed(1) : '0.0' }} / 3.0
                </span>
                
                <span
                  :class="[
                    'inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border',
                    flowStore.selectedAreaKey === area.areaKey
                      ? 'bg-white/15 text-white border-white/25'
                      : getMaturityDetails(area.score).badgeClass
                  ]"
                >
                  <component :is="getMaturityDetails(area.score).icon" class="w-2.5 h-2.5 stroke-[2.5]" />
                  {{ getMaturityDetails(area.score).level }}
                </span>
              </div>
              <p 
                :class="[
                  'text-xs line-clamp-2 mt-1 leading-relaxed',
                  flowStore.selectedAreaKey === area.areaKey ? 'text-indigo-100/90' : 'text-gray-450 font-medium italic'
                ]"
              >
                &ldquo;{{ area.justification }}&rdquo;
              </p>
            </div>

            <!-- Check Indicator -->
            <div
              v-if="flowStore.selectedAreaKey === area.areaKey"
              class="absolute right-5 top-5 w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center text-white"
            >
              <Check class="w-4 h-4 stroke-[3]" />
            </div>
          </button>
        </div>

        <!-- Empty state if critical areas aren't defined -->
        <div v-else class="bg-amber-50/55 border border-dashed border-amber-200 rounded-[32px] p-8 text-center space-y-3">
          <div class="mx-auto w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
            <Xmark class="w-6 h-6 stroke-[2.2]" />
          </div>
          <h4 class="text-sm font-black text-amber-950 uppercase tracking-wider">No se han definido Áreas Críticas</h4>
          <p class="text-xs text-amber-700 font-semibold max-w-sm mx-auto leading-relaxed">
            Es necesario definir las 3 áreas críticas priorizadas del negocio en la pestaña "Áreas Críticas" antes de diseñar un Plan de Acción.
          </p>
        </div>
      </div>

      <!-- STEPS 1-3: Configure Actions for Indicators -->
      <div v-else-if="currentStep >= 1 && currentStep <= 3" :key="`step-${currentStep}`" class="space-y-6">
        <div v-if="currentIndicator" class="space-y-5">
          <!-- Indicator details -->
          <div class="text-center space-y-2">
            <span class="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 border border-indigo-150 text-indigo-700">
              Paso {{ currentStep + 1 }}: Indicador {{ currentIndicator.key }}
            </span>
            <h2 class="text-lg sm:text-xl font-black text-gray-800 tracking-tight leading-snug">
              {{ currentIndicator.title }}
            </h2>
            <p class="text-xs text-gray-400 max-w-md mx-auto font-medium">
              {{ currentIndicator.evaluates }}
            </p>
          </div>

          <!-- Diagnostic context details -->
          <div class="bg-gray-50 border border-gray-150 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 sm:items-center justify-between shadow-sm">
            <div class="space-y-0.5">
              <span class="text-[9px] font-black text-gray-400 uppercase tracking-wider block">Score de Diagnóstico</span>
              <p class="text-sm font-extrabold text-gray-800 flex items-center gap-1.5">
                <span class="font-mono bg-white border border-gray-200 px-1.5 py-0.5 rounded text-xs">
                  {{ indicatorScore }} / 3.0
                </span>
                <span class="text-gray-400 font-normal">(&ldquo;{{ getIndicatorLevelText(currentIndicator, indicatorScore) }}&rdquo;)</span>
              </p>
            </div>
            
            <div class="px-3.5 py-1.5 rounded-xl text-center bg-indigo-50 border border-indigo-100 text-indigo-700 shrink-0">
              <span class="text-[9px] font-black uppercase tracking-wider block opacity-75">Tramo Recomendado</span>
              <span class="text-xs font-bold font-mono">Nivel {{ indicatorScore }} &rarr; {{ Math.min(indicatorScore + 1, 3) }}</span>
            </div>
          </div>

          <!-- Suggested action cards -->
          <div class="space-y-4">
            <h3 class="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
              Acciones Recomendadas del Banco
            </h3>

            <div v-if="suggestedActions.length > 0" class="space-y-4">
              <div
                v-for="action in suggestedActions"
                :key="action.id"
                class="group border rounded-2xl overflow-hidden transition-all duration-300 bg-white"
                :class="[
                  flowStore.isActionSelected(`${currentIndicator.key}_${action.id}`)
                    ? 'border-indigo-600 shadow-md shadow-indigo-600/5'
                    : 'border-gray-200 hover:border-indigo-200 hover:shadow-sm'
                ]"
              >
                <!-- Card Header/Button -->
                <button
                  @click="handleToggleAction(action)"
                  class="w-full p-4 sm:p-5 flex items-start gap-4 text-left cursor-pointer transition-all duration-200"
                  :class="[
                    flowStore.isActionSelected(`${currentIndicator.key}_${action.id}`) ? 'bg-indigo-50/20' : 'bg-white'
                  ]"
                >
                  <!-- Selection box/circle -->
                  <div
                    class="w-6 h-6 rounded-xl border shrink-0 flex items-center justify-center transition-all duration-300"
                    :class="[
                      flowStore.isActionSelected(`${currentIndicator.key}_${action.id}`)
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'border-gray-300 bg-white group-hover:border-indigo-500'
                    ]"
                  >
                    <Check v-if="flowStore.isActionSelected(`${currentIndicator.key}_${action.id}`)" class="w-3.5 h-3.5 stroke-[3.5]" />
                  </div>

                  <!-- Text -->
                  <div class="flex-1 space-y-2">
                    <p 
                      class="text-xs sm:text-sm font-semibold leading-relaxed transition-colors duration-200"
                      :class="flowStore.isActionSelected(`${currentIndicator.key}_${action.id}`) ? 'text-gray-900 font-extrabold' : 'text-gray-700'"
                    >
                      {{ action.action }}
                    </p>
                    
                    <div class="flex items-center gap-3 text-[10px] font-bold">
                      <span class="text-indigo-650 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        {{ action.frequency }}
                      </span>
                      <span class="text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-200/50">
                        {{ action.wala }}
                      </span>
                    </div>
                  </div>
                </button>

                <!-- Customized Textarea (Expands when selected) -->
                <div
                  v-if="flowStore.isActionSelected(`${currentIndicator.key}_${action.id}`)"
                  class="border-t border-indigo-100 p-4 bg-indigo-50/10 space-y-2.5 animate-fadeIn"
                >
                  <label class="block text-[10px] font-black text-indigo-900 uppercase tracking-widest">
                    Personalizar Acción para el Emprendedor
                  </label>
                  <textarea
                    v-model="getActionTextModel(`${currentIndicator.key}_${action.id}`).value"
                    rows="3"
                    class="w-full rounded-xl border-indigo-150 focus:border-indigo-500 focus:ring-indigo-500 shadow-inner bg-white text-xs sm:text-sm p-3 font-semibold text-gray-700"
                    placeholder="Personaliza el texto de la acción para este cliente..."
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- Empty state for actions -->
            <div v-else class="text-center py-6 bg-gray-50 rounded-2xl border border-gray-200 border-dashed">
              <span class="text-xs font-semibold text-gray-400">No se encontraron acciones recomendadas para este indicador y score en el banco.</span>
            </div>
          </div>
        </div>
      </div>

      <!-- STEP 4: Review and Save -->
      <div v-else-if="currentStep === 4" key="step-4" class="space-y-6">
        <div class="text-center space-y-2">
          <span class="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 border border-indigo-150 text-indigo-700">
            Paso 5: Resumen y Cierre
          </span>
          <h2 class="text-xl sm:text-2xl font-black text-gray-800 tracking-tight">
            Revisión del Plan de Acción
          </h2>
          <p class="text-xs sm:text-sm text-gray-400 max-w-md mx-auto font-medium">
            Verifica la selección de acciones para la área crítica <strong>{{ selectedAreaName }}</strong> antes de guardarla.
          </p>
        </div>

        <!-- Summary list grouped by indicator -->
        <div class="bg-gray-50 border border-gray-150/60 rounded-[32px] p-5 sm:p-6 space-y-6 max-h-[380px] overflow-y-auto">
          <div v-if="flowStore.selectedActions.length > 0" class="space-y-6">
            <div
              v-for="indicator in groupedSelectedActions"
              :key="indicator.key"
              class="space-y-3"
            >
              <!-- Indicator header inside summary -->
              <div class="flex items-center gap-2 border-b border-gray-200/60 pb-2">
                <span class="text-[10px] font-black font-mono bg-indigo-600 text-white px-2 py-0.5 rounded shadow-sm">
                  {{ indicator.key }}
                </span>
                <h4 class="text-xs sm:text-sm font-black text-gray-850 truncate">
                  {{ indicator.title }}
                </h4>
              </div>

              <!-- Actions in indicator -->
              <div class="space-y-3.5 pl-1">
                <div
                  v-for="action in indicator.actions"
                  :key="action.id"
                  class="bg-white border border-gray-150 rounded-2xl p-4 shadow-sm space-y-2 relative"
                >
                  <p class="text-xs sm:text-sm font-bold text-gray-700 leading-relaxed pr-2">
                    {{ action.actionText }}
                  </p>
                  
                  <div class="flex items-center gap-2 text-[9px] font-black">
                    <span class="text-indigo-650 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded">
                      {{ action.frequency }}
                    </span>
                    <span class="text-gray-500 bg-gray-50 border border-gray-200/50 px-1.5 py-0.5 rounded">
                      {{ action.walaSection }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty summary state -->
          <div v-else class="text-center py-8 space-y-2">
            <div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400 border border-gray-200/40">
              <Book class="w-6 h-6" />
            </div>
            <h4 class="text-xs font-black text-gray-700 uppercase tracking-wider">Plan sin acciones seleccionadas</h4>
            <p class="text-[11px] text-gray-400 font-semibold max-w-xs mx-auto leading-relaxed">
              No has seleccionado ninguna acción. Puedes guardar un plan vacío o regresar a los pasos anteriores para agregar acciones.
            </p>
          </div>
        </div>
      </div>
    </Transition>

    <!-- FIXED NAVIGATION BOTTOM BAR -->
    <div
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
        :disabled="!isNextButtonEnabled || flowStore.saving"
        class="inline-flex items-center gap-1.5 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-45 disabled:hover:bg-indigo-600 px-6 py-3.5 text-xs font-bold transition-all duration-200 cursor-pointer disabled:cursor-not-allowed shadow-md shadow-indigo-600/10"
      >
        {{ currentStep === 4 ? (flowStore.saving ? 'Guardando...' : 'Guardar y Finalizar') : 'Siguiente' }}
        <NavArrowRight v-if="currentStep < 4" class="w-4 h-4 stroke-[2.5]" />
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
  BrightCrown,
  Leaf,
  Rocket,
  Group,
} from "@iconoir/vue";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebaseInit";
import { usePerformanceStore, AREAS_CONFIG } from "@/stores/performanceStore";
import { useActionPlanFlowStore } from "@/stores/actionPlanFlowStore";
import { getActionsForIndicator } from "@/utils/actionBankLoader";
import { useToast } from "@/composables/useToast";

const props = defineProps({
  businessId: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["close", "saved"]);

const performanceStore = usePerformanceStore();
const flowStore = useActionPlanFlowStore();
const toast = useToast();

const currentStep = computed(() => flowStore.currentStep);
const criticalAreas = ref([]);

// Cargar áreas críticas al montar
const loadDossierData = async () => {
  if (!props.businessId) return;
  try {
    const docRef = doc(db, "businesses", props.businessId, "consulting", "dossier");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      criticalAreas.value = docSnap.data().criticalAreas || [];
    }
  } catch (err) {
    console.error("Error al cargar dossier para wizard:", err);
  }
};

onMounted(() => {
  flowStore.resetFlow();
  loadDossierData();
});

// Resolve icon name for areas
const getIconName = (areaKey) => {
  const config = AREAS_CONFIG.find((a) => a.key === areaKey);
  return config ? config.icon : "Home";
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

// Resolve selected area name
const selectedAreaName = computed(() => {
  if (!flowStore.selectedAreaKey) return "";
  const area = AREAS_CONFIG.find((a) => a.key === flowStore.selectedAreaKey);
  return area ? area.name : flowStore.selectedAreaKey;
});

// Sync indicators for currently selected area
const areaIndicators = computed(() => {
  if (!flowStore.selectedAreaKey) return [];
  const area = AREAS_CONFIG.find((a) => a.key === flowStore.selectedAreaKey);
  return area ? area.indicators : [];
});

// Current indicator details
const currentIndicator = computed(() => {
  if (currentStep.value < 1 || currentStep.value > 3) return null;
  const idx = currentStep.value - 1; // Step 1 -> Ind 0, Step 2 -> Ind 1, Step 3 -> Ind 2
  return areaIndicators.value[idx] || null;
});

// Identify latest saved moment from evaluation for scores
const latestMomentId = computed(() => {
  const moments = ["inicial", "ciclo1", "ciclo2", "final"];
  const allIndicatorKeys = AREAS_CONFIG.flatMap((area) =>
    area.indicators.map((ind) => ind.key)
  );

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
  return completedMoments[completedMoments.length - 1];
});

// Latest diagnostic scores
const latestScores = computed(() => {
  const moment = latestMomentId.value;
  return performanceStore.evaluations[moment]?.scores || {};
});

// Current indicator score
const indicatorScore = computed(() => {
  if (!currentIndicator.value) return 0;
  const score = latestScores.value[currentIndicator.value.key];
  return score !== undefined && score !== null ? Number(score) : 0;
});

// Cargar acciones sugeridas del indicador actual basadas en su score
const suggestedActions = computed(() => {
  if (!currentIndicator.value) return [];
  return getActionsForIndicator(currentIndicator.value.key, indicatorScore.value);
});

// Toggle selection helper
const handleToggleAction = (action) => {
  if (!currentIndicator.value) return;
  flowStore.toggleAction(action, currentIndicator.value.key, currentIndicator.value.title);
};

// Two-way bindings for actionText custom editing in textarea
const getActionTextModel = (actionId) => {
  return computed({
    get: () => {
      const action = flowStore.getAction(actionId);
      return action ? action.actionText : "";
    },
    set: (val) => {
      flowStore.updateActionText(actionId, val);
    },
  });
};

// Group selected actions for final review step
const groupedSelectedActions = computed(() => {
  const grouped = [];
  areaIndicators.value.forEach((indicator) => {
    const actions = flowStore.selectedActions.filter(
      (a) => a.indicatorKey === indicator.key
    );
    if (actions.length > 0) {
      grouped.push({
        key: indicator.key,
        title: indicator.title,
        actions,
      });
    }
  });
  return grouped;
});

// Determine maturity levels
const getMaturityDetails = (score) => {
  const numericScore = score !== undefined && score !== null ? Number(score) : null;
  if (numericScore === null || isNaN(numericScore)) {
    return {
      level: "Sin evaluar",
      icon: Leaf,
      badgeClass: "bg-slate-50 border-slate-200 text-slate-400",
    };
  }
  if (numericScore >= 2.5) {
    return {
      level: "Empresario",
      icon: BrightCrown,
      badgeClass: "bg-indigo-50 border-indigo-100 text-indigo-700",
    };
  } else if (numericScore >= 1.5) {
    return {
      level: "Gerente",
      icon: Group,
      badgeClass: "bg-emerald-50 border-emerald-100 text-emerald-700",
    };
  } else if (numericScore >= 0.5) {
    return {
      level: "Emprendedor",
      icon: Rocket,
      badgeClass: "bg-orange-50 border-orange-100 text-orange-700",
    };
  } else {
    return {
      level: "Aprendiz",
      icon: Leaf,
      badgeClass: "bg-rose-50 border-rose-100 text-rose-600",
    };
  }
};

const getIndicatorLevelText = (indicator, score) => {
  if (!indicator) return "";
  const idx = Math.min(Math.floor(score), 3);
  return indicator.levels[idx]?.text || "";
};

// Navigation helpers
const isNextButtonEnabled = computed(() => {
  if (currentStep.value === 0) {
    return flowStore.selectedAreaKey !== null;
  }
  // Indicators and summary steps are always nextable
  return true;
});

const handleSelectArea = (areaKey) => {
  flowStore.setArea(areaKey);
};

const handleNextStep = async () => {
  if (currentStep.value < 4) {
    flowStore.nextStep();
  } else {
    // Save action plan to Firestore
    const ok = await flowStore.saveActionPlan(props.businessId);
    if (ok) {
      emit("saved");
      emit("close");
    }
  }
};

const handlePrevStep = () => {
  flowStore.prevStep();
};
</script>

<script>
export default {
  name: "ActionPlanCreate",
};
</script>

<style scoped>
.font-display {
  font-family: "Outfit", "Inter", sans-serif;
}

/* Transitions */
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

.animate-fadeIn {
  animation: fadeIn 0.25s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
  resize: vertical;
}
</style>
