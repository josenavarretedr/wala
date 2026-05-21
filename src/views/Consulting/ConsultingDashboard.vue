<template>
  <div class="min-h-screen bg-gray-50/50 flex flex-col pb-24">
    <!-- Header principal -->
    <header class="bg-white border-b border-gray-100 px-4 py-5 sm:px-6 lg:px-8 shadow-sm">
      <div class="flex items-center justify-between max-w-7xl mx-auto">
        <div class="flex items-center gap-4">
          <div class="p-3 bg-teal-50 text-teal-600 rounded-2xl shadow-inner transition-transform duration-300 hover:scale-105">
            <SoilAlt class="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <div>
            <h1 class="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight font-display">
              Asesoría WALA
            </h1>
            <p class="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
              Optimiza y gestiona el crecimiento y madurez de tu negocio
            </p>
          </div>
        </div>
      </div>
    </header>

    <!-- Barra de Navegación por Pestañas (ItemsConsulting) -->
    <div class="max-w-7xl w-full mx-auto mt-4 px-4 sm:px-6 lg:px-8">
      <ItemsConsulting />
    </div>

    <!-- Contenido Principal -->
    <main class="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden p-6 sm:p-10 min-h-[300px] transition-all duration-300">
        <Transition name="fade-slide" mode="out-in">
          <!-- Sección: Resumen -->
          <div v-if="activeTab === 'resumen'" key="resumen" class="space-y-6">
            <div class="flex items-center gap-3 border-b border-gray-100 pb-4 mb-4">
              <div class="p-2 bg-gray-50 text-gray-700 rounded-xl">
                <Reports class="w-6 h-6" />
              </div>
              <h2 class="text-lg font-bold text-gray-800">Resumen de Asesoría</h2>
            </div>
            
            <div class="flex flex-col items-center justify-center py-12 text-center bg-gray-50/50 rounded-2xl border border-gray-200/50 p-6">
              <div class="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-4 shadow-inner">
                <Reports class="w-8 h-8" />
              </div>
              <h3 class="text-base font-bold text-gray-700 uppercase tracking-wider mb-2">
                Estado del Expediente
              </h3>
              <p class="text-lg font-semibold text-gray-500 max-w-md">
                NO TIENES REGISTROS ESPERADOS
              </p>
              <p class="text-xs text-gray-400 mt-4 max-w-xs">
                Cuando tu asesor o facilitador registre nuevos avances en tu expediente, podrás visualizarlos de forma estructurada en esta sección.
              </p>
            </div>
          </div>

          <!-- Sección: Niveles de Madurez -->
          <div v-else-if="activeTab === 'madurez'" key="madurez" class="space-y-6">
            <div class="flex items-center gap-3 border-b border-gray-100 pb-4 mb-4">
              <div class="p-2 bg-teal-50 text-teal-600 rounded-xl">
                <GraphUp class="w-6 h-6" />
              </div>
              <h2 class="text-lg font-bold text-gray-800">Niveles de Madurez del Negocio</h2>
            </div>

            <div class="bg-gradient-to-br from-teal-50/30 to-teal-50/10 rounded-2xl border border-teal-100/50 p-6 sm:p-8">
              <div class="flex items-start gap-4">
                <div class="p-3 bg-teal-50 text-teal-600 rounded-xl flex-shrink-0">
                  <GraphUp class="w-7 h-7" />
                </div>
                <div class="space-y-3">
                  <h3 class="text-base font-bold text-teal-950 uppercase tracking-wide">
                    Diagnóstico Inicial
                  </h3>
                  <p class="text-lg font-semibold text-teal-700 leading-relaxed">
                    Aquí tu diagnostico de tu negocio inicial
                  </p>
                  <p class="text-sm text-teal-600/80">
                    Wala analiza 7 áreas críticas de tu empresa para establecer un índice de madurez empresarial en base a tus buenas prácticas financieras, operacionales y comerciales.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Sección: Áreas Críticas -->
          <div v-else-if="activeTab === 'areas-criticas'" key="areas-criticas" class="space-y-6">
            <div class="flex items-center gap-3 border-b border-gray-100 pb-4 mb-4">
              <div class="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <WarningTriangle class="w-6 h-6" />
              </div>
              <h2 class="text-lg font-bold text-gray-800">Áreas Críticas Identificadas</h2>
            </div>

            <div class="bg-gradient-to-br from-amber-50/30 to-amber-50/10 rounded-2xl border border-amber-100/50 p-6 sm:p-8">
              <div class="flex items-start gap-4">
                <div class="p-3 bg-amber-50 text-amber-600 rounded-xl flex-shrink-0">
                  <WarningTriangle class="w-7 h-7" />
                </div>
                <div class="space-y-3">
                  <h3 class="text-base font-bold text-amber-950 uppercase tracking-wide">
                    Oportunidades de Mejora
                  </h3>
                  <p class="text-lg font-semibold text-amber-700 leading-relaxed">
                    Aquí tus tres áreas identificadas.
                  </p>
                  <p class="text-sm text-amber-600/80">
                    A través de nuestro diagnóstico, aislamos los puntos clave donde tu negocio experimenta fugas de capital o ineficiencias de procesos para enfocarnos en ellos.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Sección: Plan de Acción -->
          <div v-else-if="activeTab === 'plan-accion'" key="plan-accion" class="space-y-6">
            <div class="flex items-center gap-3 border-b border-gray-100 pb-4 mb-4">
              <div class="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <SoilAlt class="w-6 h-6" />
              </div>
              <h2 class="text-lg font-bold text-gray-800">Plan de Acción Wala</h2>
            </div>

            <div class="bg-gradient-to-br from-indigo-50/30 to-indigo-50/10 rounded-2xl border border-indigo-100/50 p-6 sm:p-8">
              <div class="flex items-start gap-4">
                <div class="p-3 bg-indigo-50 text-indigo-600 rounded-xl flex-shrink-0">
                  <SoilAlt class="w-7 h-7" />
                </div>
                <div class="space-y-3">
                  <h3 class="text-base font-bold text-indigo-950 uppercase tracking-wide">
                    Estrategia de Crecimiento
                  </h3>
                  <p class="text-lg font-semibold text-indigo-700 leading-relaxed">
                    Tu plan de acción Wala
                  </p>
                  <p class="text-sm text-indigo-600/80">
                    Tu ruta personalizada con metas concretas, compromisos y plazos establecidos junto a tu asesor técnico para transformar la gestión de tu negocio.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { SoilAlt, Reports, GraphUp, WarningTriangle } from "@iconoir/vue";
import ItemsConsulting from "@/components/consulting/ItemsConsulting.vue";

const route = useRoute();
const activeTab = computed(() => route.query.tab || "resumen");
</script>

<style scoped>
.font-display {
  font-family: "Outfit", "Inter", sans-serif;
}

/* Transiciones de pestañas */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
