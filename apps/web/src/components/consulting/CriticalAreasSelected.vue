<template>
  <div class="space-y-8 font-display">
    <!-- Header visual -->
    <div class="text-center space-y-2 max-w-lg mx-auto">
      <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider bg-[#E35336]/10 text-[#E35336] border border-[#E35336]/20 uppercase">
        Foco Estratégico
      </span>
      <h3 class="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
        Áreas Críticas Priorizadas
      </h3>
      <p class="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed">
        Estas son las 3 áreas de negocio con mayor urgencia de mejora identificadas por el equipo de asesoría técnica para enfocar el plan de acción inmediato.
      </p>
    </div>

    <!-- Grid de Tarjetas Premium -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div
        v-for="(area, index) in criticalAreas"
        :key="area.areaKey"
        class="bg-white border border-gray-150/70 rounded-2xl sm:rounded-[30px] p-4 sm:p-6 shadow-xl shadow-gray-100/30 flex flex-row sm:flex-col items-start sm:items-stretch justify-between hover:shadow-2xl hover:shadow-gray-200/40 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group gap-4"
      >
        <!-- Icono con fondo decorativo (Left on mobile, Top on desktop) -->
        <div class="p-2.5 sm:p-3 bg-[#E35336]/10 text-[#E35336] rounded-xl sm:rounded-2xl border border-[#E35336]/20 group-hover:bg-[#E35336] group-hover:text-white transition-all duration-300 shrink-0 sm:self-start">
          <component :is="getAreaIcon(getIconName(area.areaKey))" class="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
        </div>

        <!-- Contenido principal -->
        <div class="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <!-- Título del área -->
            <h4 class="text-sm sm:text-base font-extrabold text-gray-800 tracking-tight leading-snug group-hover:text-[#E35336] transition-colors duration-300 truncate sm:whitespace-normal">
              {{ area.resumenArea }}
            </h4>

            <!-- Badges de Puntaje y Madurez -->
            <div class="flex items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-3 mb-2.5 sm:mb-5 flex-wrap">
              <span class="text-[9px] sm:text-[10px] font-bold font-mono bg-gray-50 border border-gray-250/70 text-gray-550 px-1.5 sm:px-2 py-0.5 rounded sm:rounded-md">
                Score: {{ area.score !== undefined ? area.score.toFixed(1) : '0.0' }} <span class="hidden sm:inline">/ 3.0</span>
              </span>

              <span
                :class="[
                  'inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2.5 py-0.5 rounded sm:rounded-md text-[8px] sm:text-[9px] font-black uppercase tracking-wider border',
                  getMaturityDetails(area.score).badgeClass
                ]"
              >
                <component :is="getMaturityDetails(area.score).icon" class="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[2.5]" />
                {{ getMaturityDetails(area.score).level }}
              </span>
            </div>

            <!-- Divisor decorativo (solo visible en desktop) -->
            <div class="hidden sm:block h-px bg-gray-100 my-4"></div>

            <!-- Justificación del Asesor -->
            <div class="space-y-1 sm:space-y-2 mt-2 sm:mt-0">
              <span class="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-gray-400 block">
                Diagnóstico & Respaldo:
              </span>
              <p class="text-[11px] sm:text-[13px] text-gray-600 leading-relaxed font-medium italic relative pl-3 sm:pl-4 before:content-['“'] before:absolute before:left-0 before:top-0 before:text-lg sm:before:text-2xl before:leading-none before:text-[#E35336] before:font-serif">
                {{ area.justification }}
              </p>
            </div>
          </div>
        </div>

        <!-- Indicador numérico (Right on mobile, Top-Right absolute on desktop) -->
        <span class="text-2xl sm:text-3xl font-black font-mono text-gray-100 select-none group-hover:text-gray-150 transition-colors duration-300 shrink-0 sm:absolute sm:right-6 sm:top-5">
          0{{ index + 1 }}
        </span>
      </div>
    </div>

    <!-- Banner informativo inferior -->
    <div class="bg-gray-50 border border-gray-150 rounded-2xl p-4 flex items-center gap-3.5 max-w-2xl mx-auto">
      <div class="p-2 bg-[#E35336]/10 border border-[#E35336]/20 text-[#E35336] rounded-xl shrink-0">
        <BrightCrown class="w-5 h-5 stroke-[2.2]" />
      </div>
      <p class="text-xs sm:text-sm text-gray-500 font-semibold leading-relaxed">
        <strong>¿Qué sigue?</strong> Las ineficiencias de estas 3 áreas guiarán directamente el diseño de la sección del <strong>Plan de Acción</strong> para implementar soluciones concretas en el negocio.
      </p>
    </div>
  </div>
</template>

<script setup>
import {
  Home,
  Megaphone,
  Cart,
  Archive,
  Coins,
  Book,
  Calendar,
  Leaf,
  Rocket,
  Group,
  BrightCrown,
} from "@iconoir/vue";
import { AREAS_CONFIG } from "@/stores/performanceStore";

defineProps({
  criticalAreas: {
    type: Array,
    required: true,
    default: () => [],
  },
});

// Resolve icons based on area config
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

// Resolve maturity level details for colors & icons
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
      badgeClass: "bg-[#E35336]/10 border-[#E35336]/20 text-[#E35336]",
    };
  } else {
    return {
      level: "Aprendiz",
      icon: Leaf,
      badgeClass: "bg-rose-50 border-rose-100 text-rose-600",
    };
  }
};
</script>

<style scoped>
.font-display {
  font-family: "Outfit", "Inter", sans-serif;
}
</style>
