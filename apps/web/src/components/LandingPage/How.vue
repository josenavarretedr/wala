<template>
  <section
    id="how-section"
    class="py-20 md:py-28 px-4 bg-transparent relative overflow-hidden font-display"
  >
    <!-- Glowing background elements -->
    <div
      class="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10"
    >
      <div
        class="absolute top-1/3 left-1/3 w-96 h-96 bg-orange-50 rounded-full filter blur-3xl opacity-15"
      ></div>
      <div
        class="absolute bottom-1/3 right-1/3 w-96 h-96 bg-emerald-50 rounded-full filter blur-3xl opacity-15"
      ></div>
    </div>

    <div class="max-w-5xl mx-auto">
      <div class="text-center space-y-4 mb-16">
        <span
          class="inline-block px-4 py-1.5 bg-orange-50 border border-orange-100 text-[#E35336] text-xs font-bold uppercase tracking-wider rounded-full"
        >
          Diagnóstico Gratuito
        </span>
        <h2
          class="text-3xl sm:text-4xl md:text-5xl text-gray-900 font-extrabold leading-tight text-center max-w-3xl mx-auto"
        >
          ¿Qué pasa si decides empezar con el diagnóstico de
          <span class="text-[#E35336]">30 minutos</span>?
        </h2>
        <p
          class="text-base sm:text-lg text-gray-600 font-medium max-w-xl mx-auto"
        >
          Una sesión privada 1:1 para radiografiar tu negocio sin presiones comerciales.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        <!-- Paso 1 -->
        <div
          class="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
        >
          <div
            class="w-12 h-12 rounded-2xl bg-[#E35336]/10 text-[#E35336] flex items-center justify-center shadow-inner shrink-0"
          >
            <Calendar class="w-6 h-6 stroke-[2]" />
          </div>
          <div class="space-y-2">
            <p
              class="text-[11px] font-extrabold uppercase tracking-widest text-[#E35336]"
            >
              PASO 1 · REGISTRO BREVE
            </p>
            <h3 class="text-lg font-extrabold text-gray-900">
              Cuéntanos tu situación
            </h3>
            <p class="text-sm text-gray-600 font-medium leading-relaxed">
              Completas un filtro rápido de 1 minuto en
              <span class="text-[#E35336] font-semibold">wala.lat/diagnostico</span>
              y coordinas tu horario de videollamada por WhatsApp.
            </p>
          </div>
        </div>

        <!-- Paso 2 -->
        <div
          class="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
        >
          <div
            class="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center shadow-inner shrink-0"
          >
            <GraphUp class="w-6 h-6 stroke-[2]" />
          </div>
          <div class="space-y-2">
            <p
              class="text-[11px] font-extrabold uppercase tracking-widest text-[#E35336]"
            >
              PASO 2 · AUDITORÍA EN 30 MIN
            </p>
            <h3 class="text-lg font-extrabold text-gray-900">
              Evaluamos las 7 áreas
            </h3>
            <p class="text-sm text-gray-600 font-medium leading-relaxed">
              Revisamos tus números y operación sobre la matriz del Método WALA para detectar exactamente tus
              <span class="text-gray-900 font-semibold">3 frenos críticos</span>.
            </p>
          </div>
        </div>

        <!-- Paso 3 -->
        <div
          class="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
        >
          <div
            class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner shrink-0"
          >
            <BookStack class="w-6 h-6 stroke-[2]" />
          </div>
          <div class="space-y-2">
            <p
              class="text-[11px] font-extrabold uppercase tracking-widest text-emerald-600"
            >
              PASO 3 · DECISIÓN CLARA
            </p>
            <h3 class="text-lg font-extrabold text-gray-900">
              Te llevas tu ruta
            </h3>
            <p class="text-sm text-gray-600 font-medium leading-relaxed">
              Sales con un plan concreto y decides libremente entre dos salidas: ordenar por tu cuenta con
              <span class="text-gray-900 font-semibold">WALA Pro</span>
              o avanzar al
              <span class="text-[#E35336] font-semibold">Programa 1:1 de 2 meses</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { BookStack, Calendar, GraphUp } from "@iconoir/vue";
</script>

<style scoped>
.font-display {
  font-family: "Outfit", "Inter", sans-serif;
}
</style>
