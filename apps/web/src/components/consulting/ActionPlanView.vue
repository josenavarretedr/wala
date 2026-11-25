<template>
  <div class="space-y-6 font-display">
    <!-- Selector de Ciclos (solo en vista completa) -->
    <div
      v-if="!onlyPending"
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-gray-150 rounded-2xl p-3.5 shadow-2xs"
    >
      <div class="flex items-center gap-2 flex-wrap">
        <button
          v-for="cycle in cycleOptions"
          :key="cycle.key"
          type="button"
          @click="selectViewCycle(cycle.key)"
          :class="[
            'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border',
            viewedCycleKey === cycle.key
              ? 'bg-[#E35336] text-white border-[#E35336] shadow-sm shadow-[#E35336]/20'
              : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100',
          ]"
        >
          <span>{{ cycle.label }}</span>
          <span
            v-if="activeCycleKey === cycle.key"
            :class="[
              'px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider',
              viewedCycleKey === cycle.key
                ? 'bg-white/25 text-white'
                : 'bg-emerald-100 text-emerald-700',
            ]"
          >
            Activo
          </span>
          <span
            v-if="getCycleCount(cycle.key) > 0"
            :class="[
              'text-[10px] font-mono font-bold',
              viewedCycleKey === cycle.key ? 'text-white/90' : 'text-gray-400',
            ]"
          >
            ({{ getCycleCount(cycle.key) }})
          </span>
        </button>
      </div>

      <div v-if="isAdminMode" class="flex items-center gap-2 flex-wrap">
        <button
          v-if="viewedCycleKey !== activeCycleKey"
          type="button"
          @click="handleSetActiveCycle(viewedCycleKey)"
          class="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
        >
          Activar {{ currentCycleLabel }}
        </button>
        <button
          type="button"
          @click="$emit('create-plan', viewedCycleKey)"
          class="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors cursor-pointer"
        >
          Editar {{ currentCycleLabel }}
        </button>
      </div>
    </div>

    <!-- Header/Summary stats -->
    <div
      v-if="actionsList.length > 0"
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50 rounded-2xl p-5"
    >
      <div class="space-y-1">
        <div class="flex items-center gap-2 flex-wrap">
          <h3
            class="text-sm font-extrabold text-gray-800 uppercase tracking-wider"
          >
            Avance del Plan — {{ currentCycleLabel }}
          </h3>
          <span
            v-if="onlyPending"
            class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200"
          >
            Ciclo Activo
          </span>
        </div>
        <p class="text-xs text-gray-500 font-semibold leading-relaxed">
          Has completado
          <span class="text-[#E35336] font-black font-mono">{{
            completedCount
          }}</span>
          de
          <span class="text-[#E35336] font-black font-mono">{{
            actionsList.length
          }}</span>
          acciones recomendadas
          <span v-if="notDoneCount > 0" class="text-gray-400">
            ({{ notDoneCount }} no realizada{{ notDoneCount > 1 ? "s" : "" }})
          </span>.
        </p>
      </div>

      <!-- Progress bar -->
      <div class="w-full sm:w-52 flex items-center gap-3 shrink-0">
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

          <!-- Progress badge & Área 6 consistency pill -->
          <div class="flex items-center gap-2 flex-wrap justify-end">
            <span
              v-if="
                (group.areaKey || '').toLowerCase().includes('registro') ||
                (group.areaName || '').toLowerCase().includes('registro')
              "
              :class="[
                'text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-lg border shadow-sm',
                weeklyConsistencyDays >= 5
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-sky-50 border-sky-200 text-sky-700',
              ]"
            >
              {{ Math.min(weeklyConsistencyDays, 5) }} / 5 días registrados esta semana
            </span>
            <span
              class="text-[10px] font-black font-mono bg-gray-50 border border-gray-200 text-gray-600 px-2.5 py-0.5 rounded-lg shadow-sm"
            >
              {{ group.completedCount }} / {{ group.actions.length }} listas
            </span>
          </div>
        </div>

        <!-- Actions Cards inside this Area -->
        <div class="grid grid-cols-1 gap-4">
          <div
            v-for="action in group.actions"
            :key="action.id"
            class="group/card border rounded-2xl p-4 sm:p-5 transition-all duration-300 relative overflow-hidden bg-white"
            :class="[
              action.status === 'completed'
                ? 'border-emerald-200 bg-emerald-50/15 shadow-sm shadow-emerald-500/5'
                : action.status === 'not_done'
                  ? 'border-rose-200 bg-rose-50/15'
                  : 'border-gray-200/80 hover:border-[#E35336]/40 hover:shadow-md hover:shadow-[#E35336]/5',
            ]"
          >
            <div class="flex items-start gap-4">
              <!-- Checkbox Toggle (Completed / In Progress) -->
              <button
                type="button"
                @click="toggleActionStatus(action)"
                class="w-6 h-6 rounded-xl border shrink-0 flex items-center justify-center transition-all duration-300 cursor-pointer mt-0.5"
                :class="[
                  action.status === 'completed'
                    ? 'bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600 hover:border-emerald-600 shadow-md shadow-emerald-500/10'
                    : action.status === 'not_done'
                      ? 'bg-rose-100 border-rose-300 text-rose-600 hover:bg-rose-200'
                      : 'border-gray-300 bg-white hover:border-[#E35336] hover:shadow-sm',
                ]"
                :title="
                  action.status === 'completed'
                    ? 'Marcar como en progreso'
                    : 'Marcar como completada'
                "
              >
                <Check
                  v-if="action.status === 'completed'"
                  class="w-3.5 h-3.5 stroke-[3.5] animate-scaleIn"
                />
                <Xmark
                  v-else-if="action.status === 'not_done'"
                  class="w-3.5 h-3.5 stroke-[3]"
                />
              </button>

              <!-- Text, Badges & Interactive Operational Slot -->
              <div class="flex-1 min-w-0 space-y-3">
                <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <p
                    class="text-xs sm:text-sm font-semibold leading-relaxed transition-all duration-300"
                    :class="[
                      action.status === 'completed'
                        ? 'text-gray-450 line-through'
                        : action.status === 'not_done'
                          ? 'text-gray-500'
                          : 'text-gray-800 font-bold',
                    ]"
                  >
                    {{ action.actionText }}
                  </p>

                  <!-- Estado rápido pill (solo en vista completa o hover) -->
                  <div class="flex items-center gap-1 shrink-0">
                    <button
                      v-if="action.status !== 'not_done'"
                      type="button"
                      @click="setActionStatus(action, 'not_done')"
                      class="px-2 py-0.5 rounded-lg text-[10px] font-bold text-gray-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                      title="Marcar como no realizada"
                    >
                      No realizada
                    </button>
                    <button
                      v-else
                      type="button"
                      @click="setActionStatus(action, 'in_progress')"
                      class="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer"
                    >
                      No realizada · Reabrir
                    </button>
                  </div>
                </div>

                <!-- Meta Footer: Archetype + Frequency + Indicator + Live WALA Evidence -->
                <div class="flex items-center gap-2 flex-wrap text-[10px] font-bold">
                  <span
                    :class="[
                      'px-2 py-0.5 rounded-md border',
                      getArchetypeBadgeClass(action.actionType),
                    ]"
                  >
                    {{ action.actionTypeLabel || 'Acción' }}
                  </span>
                  <span
                    class="text-[#E35336] bg-[#E35336]/10 border border-[#E35336]/20 px-2 py-0.5 rounded-md"
                  >
                    {{ action.frequency }}
                  </span>
                  <span class="text-gray-400 font-mono font-medium">
                    Ind. {{ action.indicatorKey }} · Tramo {{ action.tranche || '0-1' }}
                  </span>

                  <!-- Live WALA Evidence Badge -->
                  <span
                    v-if="getActionEvidence(action).hasEvidence"
                    :class="[
                      'px-2 py-0.5 rounded-md border inline-flex items-center gap-1',
                      getEvidenceBadgeClass(getActionEvidence(action).badgeColor),
                    ]"
                  >
                    <span>●</span>
                    {{ getActionEvidence(action).badgeText }}
                  </span>
                </div>

                <!-- Sugerencia automática cuando WALA detecta cumplimiento -->
                <div
                  v-if="
                    getActionEvidence(action).suggestedCompleted &&
                    action.status === 'in_progress'
                  "
                  class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200"
                >
                  <span class="text-[11px] font-bold text-emerald-900">
                    ✓ WALA detectó evidencia automática de cumplimiento. ¿Confirmar como completada?
                  </span>
                  <button
                    type="button"
                    @click="setActionStatus(action, 'completed')"
                    class="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shrink-0 cursor-pointer transition-colors"
                  >
                    Marcar completada
                  </button>
                </div>

                <!-- ============================================ -->
                <!-- ARQUETIPO 1: CONFIGURACIÓN ÚNICA (INLINE)    -->
                <!-- ============================================ -->
                <div
                  v-if="action.actionType === 'config' && action.configKey"
                  class="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-150 space-y-2.5"
                >
                  <div class="flex items-center justify-between gap-2 flex-wrap">
                    <span class="text-[11px] font-extrabold text-indigo-950 uppercase tracking-wider">
                      Configuración directa en WALA
                    </span>
                    <button
                      v-if="action.targetRoute"
                      type="button"
                      @click="navigateToActionModule(action)"
                      class="text-[11px] font-bold text-indigo-700 hover:underline cursor-pointer"
                    >
                      Abrir en Datos del Negocio →
                    </button>
                  </div>

                  <div class="flex flex-col sm:flex-row gap-2">
                    <!-- Select (ej. Canal principal de promoción) -->
                    <select
                      v-if="action.inputType === 'select'"
                      v-model="configDrafts[action.id]"
                      class="flex-1 px-3 py-2 rounded-lg border border-indigo-200 bg-white text-xs sm:text-sm font-semibold text-gray-800 focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="">Selecciona una opción...</option>
                      <option
                        v-for="opt in action.options || promoChannelOptions"
                        :key="opt.value"
                        :value="opt.value"
                      >
                        {{ opt.label }}
                      </option>
                    </select>

                    <!-- Currency / Hourly Rate -->
                    <div
                      v-else-if="
                        action.inputType === 'currency' ||
                        action.inputType === 'hourly_rate'
                      "
                      class="relative flex-1"
                    >
                      <span
                        class="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500"
                      >
                        S/
                      </span>
                      <input
                        v-model.number="configDrafts[action.id]"
                        type="number"
                        step="0.01"
                        min="0"
                        :placeholder="action.promptPlaceholder || '0.00'"
                        class="w-full pl-8 pr-3 py-2 rounded-lg border border-indigo-200 bg-white text-xs sm:text-sm font-semibold text-gray-800 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>

                    <!-- Text (ej. Meta principal del ciclo) -->
                    <input
                      v-else
                      v-model="configDrafts[action.id]"
                      type="text"
                      :placeholder="action.promptPlaceholder || 'Ingresa el valor...'"
                      class="flex-1 px-3 py-2 rounded-lg border border-indigo-200 bg-white text-xs sm:text-sm font-semibold text-gray-800 focus:border-indigo-500 focus:outline-none"
                    />

                    <button
                      type="button"
                      @click="handleSaveInlineConfig(action)"
                      :disabled="savingActionId === action.id"
                      class="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shrink-0 cursor-pointer transition-colors"
                    >
                      {{
                        savingActionId === action.id
                          ? "Guardando..."
                          : "Guardar en WALA"
                      }}
                    </button>
                  </div>
                </div>

                <!-- ============================================ -->
                <!-- CTA DE MÓDULO (habit, review, config sin key)-->
                <!-- ============================================ -->
                <div
                  v-if="
                    action.targetRoute &&
                    !(action.actionType === 'config' && action.configKey)
                  "
                  class="flex items-center gap-2 flex-wrap pt-0.5"
                >
                  <button
                    type="button"
                    @click="navigateToActionModule(action)"
                    class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border"
                    :class="
                      action.actionType === 'review'
                        ? 'bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100'
                        : 'bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100'
                    "
                  >
                    <span>{{ action.ctaLabel || 'Ir al módulo en WALA' }}</span>
                    <ArrowRight class="w-3.5 h-3.5" />
                  </button>

                  <button
                    v-if="action.actionType !== 'note'"
                    type="button"
                    @click="toggleNoteEditor(action.id)"
                    class="px-3 py-2 rounded-xl text-[11px] font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 cursor-pointer transition-colors"
                  >
                    {{
                      isNoteExpanded(action)
                        ? "Ocultar bitácora"
                        : action.entrepreneurNote || action.advisorNote
                          ? "Ver / editar bitácora"
                          : "+ Añadir nota / evidencia"
                    }}
                  </button>
                </div>

                <!-- ============================================ -->
                <!-- ARQUETIPO BITÁCORA / NOTA DE EVIDENCIA       -->
                <!-- ============================================ -->
                <div
                  v-if="action.actionType === 'note' || isNoteExpanded(action)"
                  class="p-3.5 rounded-xl bg-gray-50/90 border border-gray-200/80 space-y-2.5"
                >
                  <div class="flex items-center justify-between gap-2">
                    <label class="text-[10px] font-black text-gray-600 uppercase tracking-wider">
                      {{
                        action.actionType === "review"
                          ? "Conclusión / Decisión del período"
                          : "Bitácora y Evidencia en WALA"
                      }}
                    </label>
                    <button
                      v-if="action.actionType === 'note' && action.targetRoute"
                      type="button"
                      @click="navigateToActionModule(action)"
                      class="text-[11px] font-bold text-[#E35336] hover:underline cursor-pointer"
                    >
                      {{ action.ctaLabel || "Abrir módulo" }} →
                    </button>
                  </div>

                  <textarea
                    v-model="noteDrafts[action.id]"
                    rows="2"
                    :placeholder="
                      action.promptPlaceholder ||
                      'Anota aquí tu acuerdo, hallazgo o evidencia...'
                    "
                    class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-800 placeholder-gray-400 focus:border-[#E35336] focus:outline-none"
                  ></textarea>

                  <div v-if="isAdminMode" class="space-y-1">
                    <label class="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
                      Comentario del asesor (opcional)
                    </label>
                    <input
                      v-model="advisorNoteDrafts[action.id]"
                      type="text"
                      placeholder="Feedback o acuerdo para el seguimiento..."
                      class="w-full rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div class="flex justify-end">
                    <button
                      type="button"
                      @click="handleSaveActionNotes(action)"
                      :disabled="savingActionId === action.id"
                      class="px-3.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-900 disabled:opacity-50 text-white text-xs font-bold cursor-pointer transition-colors"
                    >
                      {{
                        savingActionId === action.id
                          ? "Guardando..."
                          : "Guardar en bitácora"
                      }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Completed / Not done right accent bar -->
            <div
              v-if="action.status === 'completed'"
              class="absolute right-0 top-0 bottom-0 w-1.5 bg-emerald-500"
            ></div>
            <div
              v-else-if="action.status === 'not_done'"
              class="absolute right-0 top-0 bottom-0 w-1.5 bg-rose-400"
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
          No tienes acciones pendientes en {{ currentCycleLabel }}. ¡Excelente trabajo
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
          Sin Plan de Acción en {{ currentCycleLabel }}
        </h4>
        <p
          class="text-xs text-gray-450 font-semibold leading-relaxed max-w-sm mx-auto"
        >
          Aún no se ha estructurado un Plan de Acción para {{ currentCycleLabel }}. Los
          planes de acción guían al emprendedor a realizar tareas concretas en
          sus áreas críticas de mejora.
        </p>
      </div>

      <button
        v-if="isAdminMode"
        @click="$emit('create-plan', viewedCycleKey)"
        class="inline-flex items-center gap-1.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 text-xs font-bold shadow-md cursor-pointer transition-all duration-200"
      >
        <Check class="w-4 h-4 stroke-[2.5]" />
        Crear Plan de {{ currentCycleLabel }}
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
import { ref, reactive, computed, watch, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import {
  Home,
  Megaphone,
  Cart,
  Archive,
  Coins,
  Book,
  Calendar,
  Check,
  Xmark,
  ArrowRight,
} from "@iconoir/vue";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/firebaseInit";
import { AREAS_CONFIG } from "@/stores/performanceStore";
import {
  CYCLE_OPTIONS,
  ACTION_STATUS,
  normalizeActionItem,
  useActionPlanFlowStore,
} from "@/stores/actionPlanFlowStore";
import { PROMO_CHANNEL_OPTIONS } from "@/config/actionBankMeta";
import { useActionEvidence } from "@/composables/useActionEvidence";
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

const router = useRouter();
const flowStore = useActionPlanFlowStore();
const toast = useToast();

const cycleOptions = CYCLE_OPTIONS;
const promoChannelOptions = PROMO_CHANNEL_OPTIONS;

const loading = ref(false);
const activeCycleKey = ref("ciclo1");
const selectedViewCycle = ref(null);
const actionsByCycle = ref({
  ciclo1: [],
  ciclo2: [],
  ciclo3: [],
});

const savingActionId = ref(null);
const expandedNoteIds = reactive({});
const configDrafts = reactive({});
const noteDrafts = reactive({});
const advisorNoteDrafts = reactive({});

let unsubscribe = null;

// Evidencia automática desde Datos del Negocio, Transacciones e Inventario
const {
  businessProfile,
  weeklyConsistencyDays,
  saveProfileConfigField,
  getEvidenceForAction,
  refreshEvidence,
} = useActionEvidence(computed(() => props.businessId));

const viewedCycleKey = computed(() => {
  if (props.onlyPending) {
    return activeCycleKey.value || "ciclo1";
  }
  return selectedViewCycle.value || activeCycleKey.value || "ciclo1";
});

const currentCycleLabel = computed(() => {
  const found = cycleOptions.find((c) => c.key === viewedCycleKey.value);
  return found ? found.label : "Ciclo 1";
});

const getCycleCount = (cycleKey) => {
  return (actionsByCycle.value[cycleKey] || []).length;
};

const selectViewCycle = (cycleKey) => {
  selectedViewCycle.value = cycleKey;
};

const actionsList = computed(() => {
  return actionsByCycle.value[viewedCycleKey.value] || [];
});

// Sincronizar drafts locales cuando llegan acciones o datos de perfil
const syncDrafts = () => {
  const profile = businessProfile.value || {};
  actionsList.value.forEach((act) => {
    if (act.configKey && configDrafts[act.id] === undefined) {
      const existing = profile[act.configKey];
      configDrafts[act.id] =
        existing !== undefined && existing !== null ? existing : "";
    }
    if (noteDrafts[act.id] === undefined) {
      noteDrafts[act.id] = act.entrepreneurNote || "";
    }
    if (advisorNoteDrafts[act.id] === undefined) {
      advisorNoteDrafts[act.id] = act.advisorNote || "";
    }
  });
};

watch([actionsList, businessProfile], syncDrafts, { deep: true, immediate: true });

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
    "dossier"
  );

  unsubscribe = onSnapshot(
    docRef,
    (docSnap) => {
      loading.value = false;
      if (!docSnap.exists()) {
        activeCycleKey.value = "ciclo1";
        actionsByCycle.value = { ciclo1: [], ciclo2: [], ciclo3: [] };
        return;
      }

      const data = docSnap.data();
      const actCycle = data.activeCycleKey || "ciclo1";
      activeCycleKey.value = actCycle;
      if (!selectedViewCycle.value) {
        selectedViewCycle.value = actCycle;
      }

      const byCycle = data.actionPlansByCycle || {};
      const legacyFlat = Array.isArray(data.actionPlan) ? data.actionPlan : [];

      const c1 =
        Array.isArray(byCycle.ciclo1) && byCycle.ciclo1.length > 0
          ? byCycle.ciclo1
          : legacyFlat;
      const c2 = Array.isArray(byCycle.ciclo2) ? byCycle.ciclo2 : [];
      const c3 = Array.isArray(byCycle.ciclo3) ? byCycle.ciclo3 : [];

      actionsByCycle.value = {
        ciclo1: c1.map((a) => normalizeActionItem(a, "ciclo1")).filter(Boolean),
        ciclo2: c2.map((a) => normalizeActionItem(a, "ciclo2")).filter(Boolean),
        ciclo3: c3.map((a) => normalizeActionItem(a, "ciclo3")).filter(Boolean),
      };
    },
    (err) => {
      console.error("Error al escuchar Plan de Acción:", err);
      loading.value = false;
    }
  );
};

// Persistir cambios parciales en una acción dentro del ciclo visto
const persistCycleActionPatch = async (actionItem, patch) => {
  const cycleKey = actionItem.cycleKey || viewedCycleKey.value || "ciclo1";
  const currentList = actionsByCycle.value[cycleKey] || [];
  const updatedList = currentList.map((act) =>
    act.id === actionItem.id
      ? {
          ...act,
          ...patch,
          updatedAt: new Date().toISOString(),
        }
      : act
  );

  actionsByCycle.value = {
    ...actionsByCycle.value,
    [cycleKey]: updatedList,
  };

  const docRef = doc(
    db,
    "businesses",
    props.businessId,
    "consulting",
    "dossier"
  );

  const payload = {
    activeCycleKey: activeCycleKey.value,
    actionPlansByCycle: actionsByCycle.value,
  };
  if (cycleKey === activeCycleKey.value) {
    payload.actionPlan = updatedList;
  }

  await setDoc(docRef, payload, { merge: true });
};

const setActionStatus = async (actionItem, newStatus) => {
  const previousStatus = actionItem.status;
  if (previousStatus === newStatus) return;

  actionItem.status = newStatus;
  try {
    await persistCycleActionPatch(actionItem, {
      status: newStatus,
      completedAt:
        newStatus === ACTION_STATUS.COMPLETED ? new Date().toISOString() : null,
    });

    if (newStatus === ACTION_STATUS.COMPLETED) {
      toast.success("¡Acción completada! Sigue así 🚀");
    } else if (newStatus === ACTION_STATUS.NOT_DONE) {
      toast.info("Acción marcada como no realizada");
    } else {
      toast.success("Acción marcada como en progreso");
    }
  } catch (error) {
    console.error("Error al actualizar estado de la acción:", error);
    toast.error("No se pudo actualizar el estado en el servidor");
    actionItem.status = previousStatus;
  }
};

const toggleActionStatus = async (actionItem) => {
  const next =
    actionItem.status === ACTION_STATUS.COMPLETED
      ? ACTION_STATUS.IN_PROGRESS
      : ACTION_STATUS.COMPLETED;
  await setActionStatus(actionItem, next);
};

const handleSetActiveCycle = async (cycleKey) => {
  const ok = await flowStore.setActiveCycle(props.businessId, cycleKey);
  if (ok) {
    activeCycleKey.value = cycleKey;
  }
};

const handleSaveInlineConfig = async (actionItem) => {
  if (!actionItem.configKey) return;
  let val = configDrafts[actionItem.id];
  if (
    actionItem.inputType === "currency" ||
    actionItem.inputType === "hourly_rate"
  ) {
    val = Number(val || 0);
    if (!(val > 0)) {
      toast.warning("Ingresa un monto válido mayor a 0");
      return;
    }
  } else if (!val || String(val).trim() === "") {
    toast.warning("Completa el campo antes de guardar");
    return;
  }

  savingActionId.value = actionItem.id;
  try {
    await saveProfileConfigField(actionItem.configKey, val);
    await refreshEvidence();

    if (actionItem.status === ACTION_STATUS.IN_PROGRESS) {
      await persistCycleActionPatch(actionItem, {
        status: ACTION_STATUS.COMPLETED,
        completedAt: new Date().toISOString(),
      });
    }
    toast.success("Guardado en Datos del Negocio y vinculado al plan ✓");
  } catch (err) {
    console.error("Error guardando configuración inline:", err);
    toast.error("No se pudo guardar la configuración");
  } finally {
    savingActionId.value = null;
  }
};

const handleSaveActionNotes = async (actionItem) => {
  savingActionId.value = actionItem.id;
  try {
    const entrepreneurNote = (noteDrafts[actionItem.id] || "").trim();
    const advisorNote = (advisorNoteDrafts[actionItem.id] || "").trim();
    await persistCycleActionPatch(actionItem, {
      entrepreneurNote,
      advisorNote,
    });
    toast.success("Evidencia guardada en la bitácora ✓");
  } catch (err) {
    console.error("Error guardando bitácora:", err);
    toast.error("No se pudo guardar en la bitácora");
  } finally {
    savingActionId.value = null;
  }
};

const navigateToActionModule = (actionItem) => {
  if (!props.businessId || !actionItem.targetRoute) return;
  const path = `/business/${props.businessId}/${actionItem.targetRoute}`;
  const query = actionItem.presetParams ? { ...actionItem.presetParams } : {};
  router.push({ path, query });
};

const toggleNoteEditor = (actionId) => {
  expandedNoteIds[actionId] = !expandedNoteIds[actionId];
};

const isNoteExpanded = (actionItem) => {
  return Boolean(
    expandedNoteIds[actionItem.id] ||
      (actionItem.entrepreneurNote && actionItem.entrepreneurNote.trim() !== "") ||
      (actionItem.advisorNote && actionItem.advisorNote.trim() !== "")
  );
};

const getActionEvidence = (action) => {
  return getEvidenceForAction(action);
};

const getArchetypeBadgeClass = (actionType) => {
  const map = {
    config: "bg-indigo-50 text-indigo-700 border-indigo-200",
    habit: "bg-sky-50 text-sky-700 border-sky-200",
    note: "bg-violet-50 text-violet-700 border-violet-200",
    review: "bg-teal-50 text-teal-700 border-teal-200",
  };
  return map[actionType] || "bg-gray-50 text-gray-600 border-gray-200";
};

const getEvidenceBadgeClass = (color) => {
  const map = {
    emerald: "bg-emerald-50 text-emerald-800 border-emerald-200",
    blue: "bg-blue-50 text-blue-800 border-blue-200",
    amber: "bg-amber-50 text-amber-800 border-amber-200",
    gray: "bg-gray-50 text-gray-500 border-gray-200",
  };
  return map[color] || map.gray;
};

// Watchers and lifecycle
watch(
  () => props.businessId,
  () => {
    startListening();
  },
  { immediate: true }
);

onUnmounted(() => {
  if (unsubscribe) unsubscribe();
});

// Stats computations
const completedCount = computed(() => {
  return actionsList.value.filter(
    (act) => act.status === ACTION_STATUS.COMPLETED
  ).length;
});

const notDoneCount = computed(() => {
  return actionsList.value.filter(
    (act) => act.status === ACTION_STATUS.NOT_DONE
  ).length;
});

const progressPercent = computed(() => {
  if (actionsList.value.length === 0) return 0;
  return Math.round((completedCount.value / actionsList.value.length) * 100);
});

// Group actions by areaKey
const groupedActions = computed(() => {
  const groups = {};

  const filteredList = props.onlyPending
    ? actionsList.value.filter(
        (act) =>
          act.status !== ACTION_STATUS.COMPLETED &&
          act.status !== ACTION_STATUS.NOT_DONE
      )
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
    if (action.status === ACTION_STATUS.COMPLETED) {
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
