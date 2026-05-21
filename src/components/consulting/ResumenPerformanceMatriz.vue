<template>
  <div
    class="bg-white border border-gray-150/80 rounded-[32px] p-6 sm:p-8 shadow-xl shadow-gray-100/50 space-y-8 font-display"
  >
    <!-- Component Header -->
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5"
    >
      <div class="space-y-1">
        <span
          class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ring-1 ring-inset tracking-wide bg-indigo-50 text-indigo-700 ring-indigo-700/10 border border-indigo-100 uppercase"
        >
          {{ getMomentLabel(momentId) }}
        </span>
        <h3 class="text-xl font-extrabold text-gray-900 tracking-tight">
          Resumen de Desempeño
        </h3>
      </div>

      <!-- Average score badge -->
      <div
        class="flex items-center gap-3 bg-gray-50 border border-gray-150 px-4 py-2.5 rounded-2xl"
      >
        <span class="text-xs font-bold text-gray-400 uppercase tracking-wider"
          >Promedio Global:</span
        >
        <span
          :class="[
            'text-lg font-black px-3 py-0.5 rounded-xl border font-mono',
            getScoreBadgeColorClass(globalAverage),
          ]"
        >
          {{ globalAverage !== null ? globalAverage : "---" }}
        </span>
      </div>
    </div>

    <!-- 1. Clickable Area Badges (Filter Control) -->
    <div
      class="bg-gray-50/50 border border-gray-100 rounded-3xl p-5 sm:p-6 space-y-4"
    >
      <div class="flex items-center justify-between">
        <h4
          class="text-xs font-extrabold text-gray-400 uppercase tracking-widest"
        >
          Áreas Visibles en Gráfico
        </h4>
        <button
          @click="toggleAllAreas"
          class="text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-full transition-all duration-200 cursor-pointer shadow-sm shadow-blue-600/10"
        >
          {{ hasVisibleAreas ? "Ninguno" : "Todos" }}
        </button>
      </div>

      <!-- Badges Grid -->
      <div class="flex flex-wrap gap-2.5">
        <button
          v-for="area in AREAS_CONFIG"
          :key="area.id"
          @click="toggleArea(area.id)"
          :class="[
            'px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer border',
            visibleAreas.has(area.id)
              ? 'bg-blue-600 text-white border-transparent shadow-md shadow-blue-600/10 hover:bg-blue-700 hover:scale-[1.03]'
              : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-700',
          ]"
        >
          {{ area.name }}
        </button>
      </div>
    </div>

    <!-- 2. Interactive SVG/CSS Bar Chart -->
    <div
      class="relative bg-white border border-gray-150 rounded-3xl p-6 shadow-inner overflow-visible min-h-[360px]"
    >
      <!-- No data / No visible areas empty state -->
      <div
        v-if="visibleAreas.size === 0"
        class="absolute inset-0 flex flex-col items-center justify-center p-6 bg-white/90 z-20 transition-all duration-300 rounded-[22px]"
      >
        <GraphUp class="w-8 h-8 text-gray-450" />
        <h5 class="text-sm font-bold text-gray-800 mt-2">
          No hay áreas seleccionadas
        </h5>
        <p
          class="text-xs text-gray-400 mt-1 text-center max-w-xs leading-relaxed"
        >
          Activa una o más áreas en la sección de "Áreas Visibles" para
          renderizar el gráfico.
        </p>
      </div>

      <!-- Dynamic Chart Wrapper -->
      <div class="flex flex-col h-[280px] w-full">
        <!-- Grid drawing area -->
        <div class="relative flex-1 flex items-stretch select-none">
          <!-- Left Axis labels -->
          <div
            class="w-10 flex flex-col justify-between text-right pr-3 text-[10px] font-black text-gray-400/90 font-mono py-1.5 shrink-0 z-10"
          >
            <span>3.0</span>
            <span>2.5</span>
            <span>2.0</span>
            <span>1.5</span>
            <span>1.0</span>
            <span>0.5</span>
            <span>0.0</span>
          </div>

          <!-- Chart core drawing area with grid lines and background bands -->
          <div
            class="relative flex-1 border-b border-l border-gray-200/80 rounded-bl-sm overflow-hidden flex items-end"
          >
            <!-- Background bands mapping maturity zones -->
            <div class="absolute inset-0 flex flex-col pointer-events-none">
              <!-- Empresario band (2.5 - 3.0): 16.66% height -->
              <div
                class="h-[16.66%] bg-indigo-500/[0.03] border-b border-gray-100/50"
              ></div>
              <!-- Gerente band (1.5 - 2.4): 33.33% height -->
              <div
                class="h-[33.33%] bg-emerald-500/[0.03] border-b border-gray-100/50"
              ></div>
              <!-- Emprendedor band (0.5 - 1.4): 33.33% height -->
              <div
                class="h-[33.33%] bg-amber-500/[0.03] border-b border-gray-100/50"
              ></div>
              <!-- Aprendiz band (0.0 - 0.4): 16.66% height -->
              <div class="h-[16.66%] bg-rose-500/[0.03]"></div>
            </div>

            <!-- Horizontal fine grid line marks -->
            <div
              class="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40"
            >
              <div
                v-for="n in 6"
                :key="n"
                class="w-full border-t border-dashed border-gray-200"
              ></div>
              <div class="w-full"></div>
            </div>

            <!-- Vertical columns (bars) container -->
            <div
              class="absolute inset-x-0 bottom-0 top-3 flex items-end justify-around px-2 sm:px-6"
            >
              <div
                v-for="area in AREAS_CONFIG"
                :key="area.id"
                v-show="visibleAreas.has(area.id)"
                class="group relative flex flex-col items-center justify-end h-full w-full max-w-[48px] mx-1"
              >
                <!-- Bar Column element -->
                <div
                  :style="{
                    height: getBarHeightPercent(getAreaScoreAverage(area)),
                  }"
                  :class="[
                    'w-6 sm:w-8 rounded-t-[10px] transition-all duration-500 ease-out origin-bottom transform hover:scale-x-115 relative shadow-md shadow-gray-100 hover:shadow-lg cursor-pointer border-t',
                    getBarColorClass(getAreaScoreAverage(area)),
                  ]"
                  @mouseenter="
                    hoveredArea = { area, score: getAreaScoreAverage(area) }
                  "
                  @mouseleave="hoveredArea = null"
                >
                  <!-- Value display overlay pill -->
                  <div
                    class="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] font-extrabold font-mono px-1.5 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-md z-30"
                  >
                    {{
                      getAreaScoreAverage(area) !== null
                        ? getAreaScoreAverage(area)
                        : "---"
                    }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- X-Axis text labels below chart -->
        <div
          class="flex items-start justify-around pl-10 border-t border-transparent pt-3.5 select-none shrink-0"
        >
          <div
            v-for="area in AREAS_CONFIG"
            :key="area.id"
            v-show="visibleAreas.has(area.id)"
            class="text-[9px] sm:text-[10px] font-bold text-gray-400 text-center leading-tight truncate px-1 max-w-[64px]"
            :title="area.name"
          >
            <!-- Render short version or number for responsiveness -->
            <span class="block sm:hidden font-mono">{{ area.id }}</span>
            <span class="hidden sm:block truncate"
              >{{ area.id }}. {{ getAreaShortName(area.name) }}</span
            >
          </div>
        </div>
      </div>

      <!-- Dynamic hovering Tooltip details overlay -->
      <Transition name="fade-slide">
        <div
          v-if="hoveredArea"
          class="relative w-full mt-6 sm:absolute sm:top-4 sm:right-4 sm:left-auto sm:mt-0 bg-white/80 backdrop-blur-md text-slate-900 rounded-3xl p-5 shadow-xl shadow-slate-200/50 border border-white/30 z-30 sm:w-72 text-left space-y-4 pointer-events-none transition-all duration-300 ease-out transform translate-y-0"
        >
          <div class="space-y-1">
            <span
              class="text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono"
              >Área {{ String(hoveredArea.area.id).padStart(2, '0') }}</span
            >
            <h5 class="text-sm font-black truncate text-slate-800 leading-tight">
              {{ hoveredArea.area.name }}
            </h5>
          </div>

          <div class="h-px bg-slate-100"></div>

          <!-- Maturity Level Pill & Score Display -->
          <div class="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-bold text-slate-400">Nivel de Madurez:</span>
              
              <div
                :class="[
                  'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-xl border text-[10px] font-black uppercase tracking-wider',
                  getMaturityLevelDetails(hoveredArea.score).badgeColorClass
                ]"
              >
                <component :is="getMaturityLevelDetails(hoveredArea.score).icon" class="w-3.5 h-3.5 stroke-[2.5]" />
                {{ getMaturityLevelDetails(hoveredArea.score).level }}
              </div>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-[11px] font-bold text-slate-400">Promedio de Área:</span>
              <div class="flex items-baseline gap-0.5">
                <span class="text-base font-black font-mono text-slate-800">
                  {{ hoveredArea.score !== null ? hoveredArea.score.toFixed(1) : '---' }}
                </span>
                <span class="text-[10px] font-bold text-slate-400 font-mono">/ 3.0</span>
              </div>
            </div>
          </div>
          
          <p class="text-[10.5px] font-medium text-slate-500 leading-relaxed italic">
            {{ getMaturityLevelDetails(hoveredArea.score).description }}
          </p>
        </div>
      </Transition>
    </div>

    <!-- 3. Comments History Drawer/Accordion (Premium Traceability Feature) -->
    <div
      v-if="hasComments"
      class="border border-gray-150 rounded-[28px] overflow-hidden transition-all duration-300"
    >
      <button
        @click="isCommentsDrawerOpen = !isCommentsDrawerOpen"
        class="w-full flex items-center justify-between p-5 bg-gray-50 hover:bg-gray-100/80 text-left cursor-pointer transition-colors duration-200"
      >
        <div class="flex items-center gap-3">
          <Reports class="w-5 h-5 text-gray-500" />
          <div>
            <h4 class="text-sm font-extrabold text-gray-800">
              Observaciones y Evidencias de este Ciclo
            </h4>
            <p class="text-xs text-gray-400 mt-0.5">
              Revisa los comentarios de respaldo ingresados por el asesor
              durante la evaluación.
            </p>
          </div>
        </div>
        <span
          :class="[
            'text-xs font-bold px-2 py-0.5 rounded-md bg-gray-200/70 text-gray-600 transition-transform duration-200',
            isCommentsDrawerOpen ? 'rotate-180' : '',
          ]"
        >
          ▼
        </span>
      </button>

      <!-- Expandable section -->
      <div
        v-show="isCommentsDrawerOpen"
        class="border-t border-gray-100 bg-white p-5 space-y-4 max-h-[300px] overflow-y-auto"
      >
        <div
          v-for="comment in activeCommentsList"
          :key="comment.indicatorKey"
          class="flex items-start gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-150/60"
        >
          <div
            class="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 text-xs font-black flex items-center justify-center shrink-0 border border-indigo-150"
          >
            {{ comment.indicatorKey }}
          </div>
          <div class="space-y-1.5 flex-1 min-w-0">
            <h5 class="text-xs font-bold text-gray-800 truncate">
              {{ comment.indicatorTitle }}
            </h5>
            <p
              class="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium italic break-words"
            >
              "{{ comment.text }}"
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { GraphUp, Reports, Leaf, Rocket, Group, BrightCrown } from "@iconoir/vue";
import { AREAS_CONFIG } from "@/stores/performanceStore";

const props = defineProps({
  momentId: {
    type: String,
    required: true,
  },
  scores: {
    type: Object,
    required: true,
    default: () => ({}),
  },
  comments: {
    type: Object,
    required: false,
    default: () => ({}),
  },
});

const visibleAreas = ref(new Set(AREAS_CONFIG.map((a) => a.id)));
const hoveredArea = ref(null);
const isCommentsDrawerOpen = ref(false);

// Filter & Visibility actions
const toggleArea = (areaId) => {
  if (visibleAreas.value.has(areaId)) {
    visibleAreas.value.delete(areaId);
  } else {
    visibleAreas.value.add(areaId);
  }
};

const hasVisibleAreas = computed(() => visibleAreas.value.size > 0);

const toggleAllAreas = () => {
  if (hasVisibleAreas.value) {
    visibleAreas.value.clear();
  } else {
    visibleAreas.value = new Set(AREAS_CONFIG.map((a) => a.id));
  }
};

// Labels mapping
const getMomentLabel = (mId) => {
  const labels = {
    inicial: "Diagnóstico Inicial",
    ciclo1: "Ciclo 1",
    ciclo2: "Ciclo 2",
    final: "Ciclo Final",
  };
  return labels[mId] || mId;
};

const getAreaShortName = (name) => {
  // Return shortened area name for small horizontal labels
  const shorts = {
    "Negocios y familia": "Negocio & Fam.",
    Marketing: "Marketing",
    Compras: "Compras",
    "Control de stock": "Stock / Inv.",
    Costeo: "Costeo",
    "Mantenimiento de registros": "Libros Reg.",
    Planificación: "Planificación",
  };
  return shorts[name] || name;
};

// Average Calculations per Area
const getAreaScoreAverage = (area) => {
  let total = 0;
  let count = 0;

  area.indicators.forEach((indicator) => {
    const val = props.scores[indicator.key];
    if (val !== undefined && val !== null) {
      total += Number(val);
      count++;
    }
  });

  return count > 0 ? Number((total / count).toFixed(1)) : null;
};

// Global Average score of all evaluated indicators
const globalAverage = computed(() => {
  let total = 0;
  let count = 0;

  Object.values(props.scores).forEach((val) => {
    if (val !== undefined && val !== null) {
      total += Number(val);
      count++;
    }
  });

  return count > 0 ? Number((total / count).toFixed(1)) : null;
});

// Bar Drawing logic
const getBarHeightPercent = (score) => {
  if (score === null || score === undefined) return "5px"; // faint stub if null
  const percent = (score / 3.0) * 100;
  return `${percent}%`;
};

// Maturity Level mapping and details helper
const getMaturityLevelDetails = (score) => {
  if (score === null || score === undefined) {
    return {
      level: "Sin evaluar",
      icon: Leaf,
      badgeColorClass: "bg-slate-50 border-slate-100 text-slate-400",
      description: "Esta área aún no cuenta con evaluaciones registradas."
    };
  }
  if (score <= 0.4) {
    return {
      level: "Aprendiz",
      icon: Leaf,
      badgeColorClass: "bg-rose-50 border-rose-100 text-rose-600",
      description: "Fase inicial: Prácticas comerciales e individuales altamente informales y reactivas."
    };
  } else if (score <= 1.4) {
    return {
      level: "Emprendedor",
      icon: Rocket,
      badgeColorClass: "bg-amber-50 border-amber-100 text-amber-700",
      description: "Fase de tracción: Estructuras comerciales básicas en desarrollo bajo esfuerzo individual."
    };
  } else if (score <= 2.4) {
    return {
      level: "Gerente",
      icon: Group,
      badgeColorClass: "bg-emerald-50 border-emerald-100 text-emerald-700",
      description: "Fase de control: Delegación funcional, registros estables y control operativo regular."
    };
  } else {
    return {
      level: "Empresario",
      icon: BrightCrown,
      badgeColorClass: "bg-indigo-50 border-indigo-100 text-indigo-700",
      description: "Fase estratégica: Toma de decisiones basada en datos integrados y visión de escalabilidad."
    };
  }
};

// Level Range Colors
const getBarColorClass = (score) => {
  if (score === null || score === undefined)
    return "bg-gray-150 border-gray-250 h-1";
  if (score <= 0.4) {
    return "bg-rose-500 border-rose-600 shadow-md shadow-rose-500/10";
  } else if (score <= 1.4) {
    return "bg-amber-500 border-amber-600 shadow-md shadow-amber-500/10";
  } else if (score <= 2.4) {
    return "bg-emerald-500 border-emerald-600 shadow-md shadow-emerald-500/10";
  } else {
    return "bg-indigo-500 border-indigo-600 shadow-md shadow-indigo-500/10";
  }
};

const getScoreBadgeColorClass = (score) => {
  if (score === null || score === undefined)
    return "bg-gray-50 border-gray-200 text-gray-400";
  if (score <= 0.4) {
    return "bg-rose-50 text-rose-600 border-rose-200/60";
  } else if (score <= 1.4) {
    return "bg-amber-50 text-amber-700 border-amber-250/60";
  } else if (score <= 2.4) {
    return "bg-emerald-50 text-emerald-700 border-emerald-250/60";
  } else {
    return "bg-indigo-50 text-indigo-700 border-indigo-250/60";
  }
};

const getTooltipBadgeColorClass = (score) => {
  if (score === null || score === undefined)
    return "bg-slate-50 border-slate-100 text-slate-400";
  if (score <= 0.4) {
    return "bg-rose-50 border-rose-100 text-rose-600";
  } else if (score <= 1.4) {
    return "bg-amber-50 border-amber-100 text-amber-700";
  } else if (score <= 2.4) {
    return "bg-emerald-50 border-emerald-100 text-emerald-700";
  } else {
    return "bg-indigo-50 border-indigo-100 text-indigo-700";
  }
};

// Comments Filtering & Helpers
const activeCommentsList = computed(() => {
  const list = [];
  AREAS_CONFIG.forEach((area) => {
    area.indicators.forEach((indicator) => {
      const text = props.comments[indicator.key];
      if (text && text.trim().length > 0) {
        list.push({
          indicatorKey: indicator.key,
          indicatorTitle: indicator.title,
          text: text.trim(),
        });
      }
    });
  });
  return list;
});

const hasComments = computed(() => activeCommentsList.value.length > 0);
</script>

<style scoped>
.font-display {
  font-family: "Outfit", "Inter", sans-serif;
}

/* Tooltip transition */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
</style>
