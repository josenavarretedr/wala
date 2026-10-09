<template>
  <div class="space-y-8 font-display">
    <!-- Header/Summary stats -->
    <div
      v-if="actionsList.length > 0"
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50 rounded-2xl p-5"
    >
      <div class="space-y-1">
        <h3
          class="text-sm font-extrabold text-gray-800 uppercase tracking-wider"
        >
          Avance del Plan
        </h3>
        <p class="text-xs text-gray-400 font-semibold leading-relaxed">
          Has completado
          <span class="text-[#E35336] font-black font-mono">{{
            completedCount
          }}</span>
          de
          <span class="text-[#E35336] font-black font-mono">{{
            actionsList.length
          }}</span>
          acciones recomendadas.
        </p>
      </div>

      <!-- Progress bar -->
      <div class="w-full sm:w-48 flex items-center gap-3 shrink-0">
        <div
          class="flex-1 bg-gray-200 h-3 rounded-full overflow-hidden border border-gray-100 shadow-inner"
        >
          <div
            class="bg-[#E35336] h-full rounded-full transition-all duration-550 ease-out shadow-sm shadow-[#E35336]/20"
            :style="{ width: `${progressPercent}%` }"
          ></div>
        </div>
        <span class="text-xs font-black font-mono text-gray-600">
          {{ progressPercent }}%
        </span>
      </div>
    </div>

    <!-- Grouped Actions List -->
    <div
      v-if="actionsList.length > 0 && groupedActions.length > 0"
      class="space-y-8"
    >
      <div
        v-for="group in groupedActions"
        :key="group.areaKey"
        class="bg-white rounded-[32px] space-y-5"
      >
        <!-- Area Title Header -->
        <div
          class="flex items-center justify-between border-b border-gray-100 pb-3"
        >
          <div class="flex items-center gap-3.5">
            <div
              class="p-3 bg-[#E35336]/10 text-[#E35336] rounded-2xl border border-[#E35336]/20"
            >
              <component
                :is="getAreaIcon(group.icon)"
                class="w-6 h-6 stroke-[2.2]"
              />
            </div>
            <div>
              <h3 class="text-base font-extrabold text-gray-850 leading-snug">
                {{ group.areaName }}
              </h3>
              <span
                class="text-[9px] font-black uppercase tracking-wider text-gray-400"
              >
                Área de Foco Priorizada
              </span>
            </div>
          </div>

          <!-- Progress badge for this specific area -->
          <span
            class="text-[10px] font-black font-mono bg-gray-50 border border-gray-200 text-gray-600 px-2 py-0.5 rounded-lg shadow-sm"
          >
            {{ group.completedCount }} / {{ group.actions.length }} listas
          </span>
        </div>

        <!-- Actions Cards inside this Area -->
        <div class="grid grid-cols-1 gap-4">
          <div
            v-for="action in group.actions"
            :key="action.id"
            class="group/card border rounded-2xl p-4 sm:p-5 transition-all duration-300 flex items-start gap-4 relative overflow-hidden bg-white"
            :class="[
              action.status === 'completed'
                ? 'border-emerald-100 bg-emerald-50/10 shadow-sm shadow-emerald-500/5'
                : 'border-gray-150/80 hover:border-[#E35336]/30 hover:bg-[#E35336]/5 hover:shadow-md hover:shadow-[#E35336]/5',
            ]"
          >
            <!-- Sleek Checkbox Toggle -->
            <button
              @click="toggleActionStatus(action)"
              class="w-6 h-6 rounded-xl border shrink-0 flex items-center justify-center transition-all duration-350 cursor-pointer"
              :class="[
                action.status === 'completed'
                  ? 'bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600 hover:border-emerald-600 shadow-md shadow-emerald-500/10'
                  : 'border-gray-300 bg-white hover:border-[#E35336] hover:shadow-sm',
              ]"
            >
              <Check
                v-if="action.status === 'completed'"
                class="w-3.5 h-3.5 stroke-[3.5] animate-scaleIn"
              />
            </button>

            <!-- Text & Info -->
            <div class="flex-1 min-w-0 space-y-2">
              <p
                class="text-xs sm:text-sm font-semibold leading-relaxed transition-all duration-300"
                :class="[
                  action.status === 'completed'
                    ? 'text-gray-400 line-through'
                    : 'text-gray-700 font-extrabold group-hover/card:text-gray-900',
                ]"
              >
                {{ action.actionText }}
              </p>

              <!-- Meta Footer -->
              <div
                class="flex items-center gap-2.5 flex-wrap text-[9px] font-black"
              >
                <span
                  class="text-[#E35336] bg-[#E35336]/10 border border-[#E35336]/20 px-2 py-0.5 rounded-md"
                >
                  {{ action.frequency }}
                </span>
                <span
                  class="text-gray-500 bg-gray-50 border border-gray-250/50 px-2 py-0.5 rounded-md"
                >
                  {{ action.walaSection }}
                </span>
                <span class="text-gray-400 font-mono font-medium">
                  Ind. {{ action.indicatorKey }}
                </span>
              </div>
            </div>

            <!-- Optional: Completed overlay background shine -->
            <div
              v-if="action.status === 'completed'"
              class="absolute right-0 top-0 bottom-0 w-1.5 bg-emerald-500"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Completado / Sin pendientes en modo onlyPending -->
    <div
      v-else-if="
        onlyPending && actionsList.length > 0 && groupedActions.length === 0
      "
      class="bg-emerald-50/50 border border-emerald-150 rounded-[28px] p-8 text-center space-y-4 max-w-lg mx-auto"
    >
      <div
        class="mx-auto w-12 h-12 bg-emerald-100 text-emerald-650 rounded-full flex items-center justify-center shadow-inner"
      >
        <Check class="w-6 h-6 stroke-[3.5] text-emerald-650" />
      </div>
      <div class="space-y-1.5">
        <h4
          class="text-sm font-black text-emerald-950 uppercase tracking-wider"
        >
          ¡Todo al día!
        </h4>
        <p
          class="text-xs text-emerald-700 font-semibold leading-relaxed max-w-sm mx-auto"
        >
          No tienes acciones pendientes en este momento. ¡Excelente trabajo
          manteniendo tu plan de acción al día!
        </p>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!loading"
      class="bg-gray-50/55 border border-dashed border-gray-200 rounded-[32px] p-8 text-center space-y-4 max-w-lg mx-auto"
    >
      <div
        class="mx-auto w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center shadow-inner"
      >
        <component :is="getAreaIcon('Book')" class="w-6 h-6 stroke-[2.2]" />
      </div>
      <div class="space-y-1.5">
        <h4 class="text-sm font-black text-gray-800 uppercase tracking-wider">
          Sin Plan de Acción Activo
        </h4>
        <p
          class="text-xs text-gray-450 font-semibold leading-relaxed max-w-sm mx-auto"
        >
          Aún no se ha estructurado un Plan de Acción para este negocio. Los
          planes de acción guían al emprendedor a realizar tareas concretas en
          sus áreas críticas de mejora.
        </p>
      </div>

      <button
        v-if="isAdminMode"
        @click="$emit('create-plan')"
        class="inline-flex items-center gap-1.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 text-xs font-bold shadow-md cursor-pointer transition-all duration-200"
      >
        <Check class="w-4 h-4 stroke-[2.5]" />
        Crear Plan de Acción
      </button>
    </div>

    <!-- Loading overlay inside component -->
    <div v-else class="py-12 flex flex-col items-center justify-center gap-3">
      <svg
        class="animate-spin h-8 w-8 text-[#E35336]"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span class="text-xs font-bold text-gray-400"
        >Actualizando plan de acción...</span
      >
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from "vue";
import {
  Home,
  Megaphone,
  Cart,
  Archive,
  Coins,
  Book,
  Calendar,
  Check,
} from "@iconoir/vue";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/firebaseInit";
import { AREAS_CONFIG } from "@/stores/performanceStore";
import { useToast } from "@/composables/useToast";

const props = defineProps({
  businessId: {
    type: String,
    required: true,
  },
  isAdminMode: {
    type: Boolean,
    default: false,
  },
  onlyPending: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["create-plan"]);

const toast = useToast();
const actionsList = ref([]);
const loading = ref(false);
let unsubscribe = null;

// Start listening to Firestore Action Plan in real-time
const startListening = () => {
  if (unsubscribe) unsubscribe();
  if (!props.businessId) return;

  loading.value = true;
  const docRef = doc(
    db,
    "businesses",
    props.businessId,
    "consulting",
    "dossier",
  );

  unsubscribe = onSnapshot(
    docRef,
    (docSnap) => {
      loading.value = false;
      if (docSnap.exists()) {
        actionsList.value = docSnap.data().actionPlan || [];
      } else {
        actionsList.value = [];
      }
    },
    (err) => {
      console.error("Error al escuchar Plan de Acción:", err);
      loading.value = false;
    },
  );
};

// Toggle action status and write to Firestore
const toggleActionStatus = async (actionItem) => {
  const previousStatus = actionItem.status;
  const newStatus = previousStatus === "completed" ? "incomplete" : "completed";

  // Optimistic UI update
  actionItem.status = newStatus;

  try {
    const docRef = doc(
      db,
      "businesses",
      props.businessId,
      "consulting",
      "dossier",
    );

    // Build updated actions list
    const updatedActions = actionsList.value.map((act) => {
      if (act.id === actionItem.id) {
        return {
          ...act,
          status: newStatus,
          updatedAt: new Date().toISOString(),
        };
      }
      return act;
    });

    await setDoc(
      docRef,
      {
        actionPlan: updatedActions,
      },
      { merge: true },
    );

    if (newStatus === "completed") {
      toast.success("¡Acción completada! Sigue así 🚀");
    } else {
      toast.success("Acción marcada como pendiente");
    }
  } catch (error) {
    console.error("Error al actualizar estado de la acción:", error);
    toast.error("No se pudo actualizar el estado en el servidor");
    // Rollback on error
    actionItem.status = previousStatus;
  }
};

// Watchers and lifecycle
watch(
  () => props.businessId,
  () => {
    startListening();
  },
  { immediate: true },
);

onUnmounted(() => {
  if (unsubscribe) unsubscribe();
});

// Stats computations
const completedCount = computed(() => {
  return actionsList.value.filter((act) => act.status === "completed").length;
});

const progressPercent = computed(() => {
  if (actionsList.value.length === 0) return 0;
  return Math.round((completedCount.value / actionsList.value.length) * 100);
});

// Group actions by areaKey
const groupedActions = computed(() => {
  const groups = {};

  const filteredList = props.onlyPending
    ? actionsList.value.filter((act) => act.status !== "completed")
    : actionsList.value;

  filteredList.forEach((action) => {
    const key = action.areaKey;
    if (!groups[key]) {
      const areaInfo = AREAS_CONFIG.find((a) => a.key === key);
      groups[key] = {
        areaKey: key,
        areaName: areaInfo ? areaInfo.name : key,
        icon: areaInfo ? areaInfo.icon : "Home",
        actions: [],
        completedCount: 0,
      };
    }

    groups[key].actions.push(action);
    if (action.status === "completed") {
      groups[key].completedCount++;
    }
  });

  return Object.values(groups);
});

// Resolve icons
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

<script>
export default {
  name: "ActionPlanView",
};
</script>

<style scoped>
.font-display {
  font-family: "Outfit", "Inter", sans-serif;
}

@keyframes scaleIn {
  from {
    transform: scale(0.7);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-scaleIn {
  animation: scaleIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

/* Custom duration transitions */
.duration-550 {
  transition-duration: 550ms;
}
</style>
