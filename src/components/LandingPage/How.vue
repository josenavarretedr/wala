<template>
  <section id="how-section" class="py-20 md:py-28 px-4 bg-transparent relative overflow-hidden font-display">
    <!-- Glowing background elements -->
    <div
      class="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10"
    >
      <div
        class="absolute top-1/3 left-1/3 w-96 h-96 bg-orange-50 rounded-full filter blur-3xl opacity-10"
      ></div>
      <div
        class="absolute bottom-1/3 right-1/3 w-96 h-96 bg-emerald-50 rounded-full filter blur-3xl opacity-10"
      ></div>
    </div>

    <div class="max-w-5xl mx-auto">
      <div class="text-center space-y-4 mb-16">
        <span
          class="inline-block px-4 py-1.5 bg-orange-50 border border-orange-100 text-[#E35336] text-xs font-bold uppercase tracking-wider rounded-full"
        >
          Metodología Wala
        </span>
        <h2
          class="text-3xl sm:text-4xl md:text-5xl text-gray-900 font-extrabold leading-tight text-center max-w-2xl mx-auto"
        >
          Así es el diagnóstico gratuito
        </h2>
        <p class="text-base sm:text-lg text-gray-500 font-semibold max-w-md mx-auto">
          Un proceso sencillo, transparente y diseñado al 100% para aportarte valor inmediato.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Paso 1 -->
        <div class="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 space-y-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <div class="w-12 h-12 rounded-2xl bg-[#E35336]/10 text-[#E35336] flex items-center justify-center shadow-inner shrink-0">
            <Calendar class="w-6 h-6 stroke-[2]" />
          </div>
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-black uppercase tracking-widest text-[#E35336]">Paso 1</span>
              <span class="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
              <span class="text-xs text-gray-400 font-bold uppercase tracking-wide">Agendar</span>
            </div>
            <h3 class="text-lg font-extrabold text-gray-900">Coordinas la Sesión</h3>
            <p class="text-sm text-gray-500 font-medium leading-relaxed">
              Me escribes por <span class="text-[#E35336] font-semibold">WhatsApp</span> y coordinamos una reunión privada de <span class="text-gray-900 font-semibold">20 minutos</span> por videollamada esta semana.
            </p>
          </div>
        </div>

        <!-- Paso 2 -->
        <div class="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 space-y-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner shrink-0">
            <GraphUp class="w-6 h-6 stroke-[2]" />
          </div>
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-black uppercase tracking-widest text-blue-600">Paso 2</span>
              <span class="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
              <span class="text-xs text-gray-400 font-bold uppercase tracking-wide">Diagnóstico</span>
            </div>
            <h3 class="text-lg font-extrabold text-gray-900">Encontramos los Frenos</h3>
            <p class="text-sm text-gray-500 font-medium leading-relaxed">
              Evaluamos tu negocio en las <span class="text-blue-600 font-semibold">7 áreas clave</span> y encontramos con exactitud tus <span class="text-gray-900 font-semibold">3 frenos principales</span>.
            </p>
          </div>
        </div>

        <!-- Paso 3 -->
        <div class="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 space-y-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner shrink-0">
            <BookStack class="w-6 h-6 stroke-[2]" />
          </div>
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-black uppercase tracking-widest text-emerald-600">Paso 3</span>
              <span class="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
              <span class="text-xs text-gray-400 font-bold uppercase tracking-wide">Plan Claro</span>
            </div>
            <h3 class="text-lg font-extrabold text-gray-900">Te llevas tu Plan</h3>
            <p class="text-sm text-gray-500 font-medium leading-relaxed">
              Te vas con un <span class="text-emerald-600 font-semibold">plan de acción de inmediato</span> — y tú decides si sigues acompañado o usas <span class="text-[#E35336] font-semibold">WALA solo</span>.
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
