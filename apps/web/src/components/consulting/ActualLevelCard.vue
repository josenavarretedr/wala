<template>
  <div
    class="bg-white border rounded-[32px] p-6 sm:p-8 shadow-sm transition-all duration-300 font-display"
    :class="
      activeLevel ? 'border-gray-150' : 'border-gray-200/60 bg-gray-50/30'
    "
  >
    <!-- State 1: Active Maturity Level Calculated -->
    <div v-if="activeLevel" class="space-y-6">
      <!-- Header with Icon & Dynamic Colors -->
      <div
        class="flex flex-col sm:flex-row gap-5 items-center sm:items-start justify-between pb-6 border-b border-gray-100"
      >
        <div
          class="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left"
        >
          <!-- Big Animating Icon Container -->
          <div
            class="p-4 rounded-3xl border shadow-inner transition-transform duration-500 hover:scale-105 shrink-0"
            :class="activeLevel.colorClass"
          >
            <component :is="activeLevel.icon" class="w-10 h-10 stroke-[2]" />
          </div>
          <div class="space-y-1">
            <span
              class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold tracking-wider uppercase border"
              :class="activeLevel.colorClass"
            >
              Nivel {{ activeLevel.name }}
            </span>
            <h4
              class="text-xl sm:text-2xl font-black text-gray-900 leading-tight"
            >
              {{ businessName }} está siendo gestionado a un nivel
              <span
                :class="
                  activeLevel.name === 'APRENDIZ'
                    ? 'text-rose-600'
                    : activeLevel.name === 'EMPRENDEDOR'
                      ? 'text-amber-600'
                      : activeLevel.name === 'GERENTE'
                        ? 'text-emerald-600'
                        : 'text-indigo-600'
                "
                >{{ activeLevel.name }}</span
              >
            </h4>
            <p class="text-xs text-gray-400 font-bold uppercase tracking-wider">
              Basado en el promedio global del
              {{ getMomentLabel(lastMomentId) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Maturity Slider Scale (Proportional & Pinpoint Precise) -->
      <div class="space-y-4 py-2">
        <div
          class="flex justify-between items-center text-xs font-extrabold text-gray-400 uppercase tracking-wider"
        >
          <span>Escala de Madurez</span>
          <span class="font-mono text-gray-700 font-black"
            >Promedio: {{ averageScore.toFixed(2) }} / 3.0</span
          >
        </div>

        <!-- Segmented Slider Track with Floating Pointer Pin -->
        <div class="relative w-full pt-10 pb-2">
          <!-- Floating Pinpointer -->
          <div
            class="absolute top-0 transform -translate-x-1/2 flex flex-col items-center transition-all duration-700 ease-out"
            :style="{ left: `${(averageScore / 3.0) * 100}%` }"
          >
            <!-- Label Box -->
            <div
              class="px-2.5 py-1 rounded-xl text-[10px] font-black font-mono shadow-md text-white border transition-colors duration-500 shrink-0"
              :class="activeLevel.badgeClass"
            >
              {{ averageScore.toFixed(2) }}
            </div>
            <!-- Arrow -->
            <div
              class="w-2 h-2 transform rotate-45 -mt-1 shadow-sm transition-colors duration-500 shrink-0"
              :class="activeLevel.badgeClass"
            ></div>
          </div>

          <!-- The Multi-Segmented Track -->
          <div
            class="w-full h-3 bg-gray-100 rounded-full flex overflow-hidden border border-gray-200/40 shadow-inner"
          >
            <!-- Segment 1: Aprendiz (0.0 - 0.49 => 16.67% of scale) -->
            <div
              class="h-full bg-rose-500/80 w-[16.67%]"
              title="Aprendiz (0.0 - 0.49)"
            ></div>
            <!-- Segment 2: Emprendedor (0.5 - 1.49 => 33.33% of scale) -->
            <div
              class="h-full bg-amber-500/80 w-[33.33%]"
              title="Emprendedor (0.5 - 1.49)"
            ></div>
            <!-- Segment 3: Gerente (1.5 - 2.49 => 33.33% of scale) -->
            <div
              class="h-full bg-emerald-500/80 w-[33.33%]"
              title="Gerente (1.5 - 2.49)"
            ></div>
            <!-- Segment 4: Empresario (2.5 - 3.0 => 16.67% of scale) -->
            <div
              class="h-full bg-indigo-500/80 w-[16.67%]"
              title="Empresario (2.5 - 3.0)"
            ></div>
          </div>

          <!-- Scale Labels -->
          <div
            class="grid grid-cols-4 text-center text-[9px] font-black text-gray-400 mt-2 uppercase tracking-widest"
          >
            <span class="text-left text-rose-600/80">Aprendiz</span>
            <span class="text-center text-amber-600/80">Emprendedor</span>
            <span class="text-center text-emerald-600/80">Gerente</span>
            <span class="text-right text-indigo-600/80">Empresario</span>
          </div>
        </div>
      </div>

      <!-- Dynamic Implication Text Box -->
      <!-- <div
        class="p-5 sm:p-6 rounded-3xl border bg-gradient-to-br transition-colors duration-500"
        :class="activeLevel.gradientClass"
      >
        <div class="flex items-start gap-3.5">
          <div class="p-2.5 rounded-2xl bg-white border border-gray-150 shrink-0 shadow-sm text-gray-500">
            <InfoCircle class="w-5 h-5 stroke-[2]" />
          </div>
          <div class="space-y-2">
            <h5 class="text-sm font-extrabold text-gray-900 uppercase tracking-wider">
              Implicaciones del Nivel {{ activeLevel.name }}
            </h5>
            <p class="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed">
              {{ activeLevel.implication }}
            </p>
          </div>
        </div>
      </div> -->
    </div>

    <!-- State 2: No Evaluations Completed Yet -->
    <div v-else class="text-center py-6 sm:py-8 space-y-4">
      <div
        class="mx-auto w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center shadow-inner"
      >
        <GraphUp class="w-8 h-8" />
      </div>
      <div class="space-y-1.5 max-w-sm mx-auto">
        <h4
          class="text-sm font-extrabold text-gray-800 uppercase tracking-wider"
        >
          Nivel de Madurez no disponible
        </h4>
        <p class="text-xs text-gray-400 font-medium leading-relaxed">
          Para ver el nivel en el que se encuentra gestionado
          <strong>{{ businessName }}</strong
          >, tu facilitador o asesor debe registrar y completar al menos un
          ciclo completo de evaluación (Diagnóstico Inicial, Ciclo 1, etc.) con
          sus 21 indicadores puntuados.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import {
  Leaf,
  Rocket,
  Group,
  BrightCrown,
  InfoCircle,
  GraphUp,
} from "@iconoir/vue";
import { AREAS_CONFIG } from "@/stores/performanceStore";

const props = defineProps({
  businessName: {
    type: String,
    required: true,
  },
  registeredMoments: {
    type: Array,
    required: true,
  },
  evaluations: {
    type: Object,
    required: true,
  },
});

// Configure themes, icons, and coaching copy for the 4 levels
const levelsConfig = {
  aprendiz: {
    name: "APRENDIZ",
    slogan: "Gestión Inicial y Reactiva",
    implication:
      "El negocio está dando sus primeros pasos organizativos. La toma de decisiones suele ser reactiva frente a los problemas del día a día y existe una fuerte mezcla entre las finanzas personales y las de la empresa. El enfoque prioritario de este nivel es establecer controles financieros básicos, separar de inmediato las cajas o cuentas personales de las del negocio, y estructurar los procesos fundamentales de venta.",
    colorClass: "text-rose-600 bg-rose-50 border-rose-100",
    gradientClass: "from-rose-500/5 to-transparent border-rose-100/70",
    badgeClass: "bg-rose-500 text-white border-rose-450",
    icon: Leaf,
  },
  emprendedor: {
    name: "EMPRENDEDOR",
    slogan: "Operación en Consolidación",
    implication:
      "El negocio cuenta con un modelo de ventas validado y tracción activa en el mercado. Sin embargo, la operación aún depende críticamente de la presencia física y el esfuerzo del fundador. Se ha iniciado el registro de información financiera básica y la planificación, pero aún falta estandarizar los procesos de manera formal y delegar responsabilidades clave para no saturar al líder.",
    colorClass: "text-amber-600 bg-amber-50 border-amber-100",
    gradientClass: "from-amber-500/5 to-transparent border-amber-100/70",
    badgeClass: "bg-amber-500 text-white border-amber-450",
    icon: Rocket,
  },
  gerente: {
    name: "GERENTE",
    slogan: "Organización Estandarizada",
    implication:
      "El negocio opera bajo procesos definidos y estructurados. Cuenta con controles financieros robustos, planificación de mediano plazo y un equipo de trabajo con responsabilidades y metas claras. El fundador asume un rol directivo en lugar de netamente operativo, apoyándose en la información histórica y el análisis para tomar decisiones comerciales estratégicas.",
    colorClass: "text-emerald-600 bg-emerald-50 border-emerald-100",
    gradientClass: "from-emerald-500/5 to-transparent border-emerald-100/70",
    badgeClass: "bg-emerald-500 text-white border-emerald-450",
    icon: Group,
  },
  empresario: {
    name: "EMPRESARIO",
    slogan: "Visión Estratégica y Delegación Completa",
    implication:
      "El negocio funciona de manera sistemática y autónoma, permitiendo al fundador enfocarse en la visión de largo plazo, nuevas alianzas comerciales y la escalabilidad del modelo. La cultura organizacional está consolidada, se gestionan indicadores de rendimiento (KPIs) en tiempo real y existe una total separación entre el patrimonio familiar y corporativo.",
    colorClass: "text-indigo-600 bg-indigo-50 border-indigo-100",
    gradientClass: "from-indigo-500/5 to-transparent border-indigo-100/70",
    badgeClass: "bg-indigo-500 text-white border-indigo-450",
    icon: BrightCrown,
  },
};

// Retrieve the last registered/fully completed moment ID
const lastMomentId = computed(() => {
  if (!props.registeredMoments || props.registeredMoments.length === 0)
    return null;
  return props.registeredMoments[props.registeredMoments.length - 1];
});

// Calculate average score dynamically based on all 21 indicators configuration
const averageScore = computed(() => {
  if (!lastMomentId.value) return 0;

  const momentScores = props.evaluations[lastMomentId.value]?.scores || {};

  // Extract all indicators keys from Areas Config
  const allIndicatorKeys = AREAS_CONFIG.flatMap((area) =>
    area.indicators.map((ind) => ind.key),
  );

  if (allIndicatorKeys.length === 0) return 0;

  const totalScore = allIndicatorKeys.reduce((sum, key) => {
    const val = momentScores[key];
    return (
      sum + (val !== undefined && val !== null && val !== "" ? Number(val) : 0)
    );
  }, 0);

  return totalScore / allIndicatorKeys.length;
});

// Map computed average score to corresponding level config
const activeLevel = computed(() => {
  if (!lastMomentId.value) return null;

  const score = averageScore.value;
  if (score < 0.5) return levelsConfig.aprendiz;
  if (score < 1.5) return levelsConfig.emprendedor;
  if (score < 2.5) return levelsConfig.gerente;
  return levelsConfig.empresario;
});

const getMomentLabel = (momentId) => {
  const labels = {
    inicial: "Diagnóstico Inicial",
    ciclo1: "Ciclo 1",
    ciclo2: "Ciclo 2",
    final: "Ciclo Final",
  };
  return labels[momentId] || momentId;
};
</script>

<style scoped>
.font-display {
  font-family: "Outfit", "Inter", sans-serif;
}
</style>
