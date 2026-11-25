<template>
  <section
    class="py-20 md:py-28 px-4 bg-transparent relative overflow-hidden font-display"
  >
    <!-- Ambient blurs -->
    <div
      class="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10"
    >
      <div
        class="absolute top-0 left-0 w-96 h-96 bg-orange-50 rounded-full filter blur-3xl opacity-20"
      ></div>
      <div
        class="absolute bottom-0 right-0 w-96 h-96 bg-emerald-50 rounded-full filter blur-3xl opacity-15"
      ></div>
    </div>

    <!-- Main Container -->
    <div class="max-w-4xl mx-auto text-center space-y-10">
      <!-- Badge -->
      <span
        class="inline-block px-4 py-1.5 bg-orange-50 border border-orange-100 text-[#E35336] text-xs font-bold uppercase tracking-wider rounded-full"
      >
        Empieza Hoy
      </span>

      <h2
        class="text-3xl sm:text-4xl md:text-5xl text-gray-900 font-extrabold leading-tight max-w-2xl mx-auto"
      >
        Tu negocio ya exige suficiente trabajo.
        <span class="text-[#E35336]">WALA pone la claridad</span>.
      </h2>

      <p
        class="text-base sm:text-lg text-gray-600 font-medium max-w-lg mx-auto leading-relaxed"
      >
        Empieza hoy gratis con la herramienta o reserva tu diagnóstico de 30 minutos.
      </p>

      <!-- CTA Buttons -->
      <div
        class="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2"
      >
        <router-link
          :to="REGISTER_PATH"
          class="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#E35336] hover:bg-[#c2412b] text-white px-8 py-4 rounded-xl font-semibold text-base sm:text-lg shadow-lg shadow-[#E35336]/20 transition-all duration-300 hover:-translate-y-0.5"
        >
          <Rocket class="w-5 h-5" />
          <span>Crear cuenta gratis</span>
        </router-link>

        <router-link
          :to="DIAGNOSTICO_PATH"
          class="w-full sm:w-auto inline-flex items-center justify-center gap-2 border-2 border-[#E35336] text-[#E35336] px-8 py-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 hover:bg-[#E35336]/10 hover:-translate-y-0.5"
        >
          <span>Ver diagnóstico 1:1</span>
          <ArrowRight class="w-5 h-5" />
        </router-link>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ArrowRight, Rocket } from "@iconoir/vue";
import { DIAGNOSTICO_PATH, REGISTER_PATH } from "@/config/ctaLinks";
</script>

<style scoped>
.font-display {
  font-family: "Outfit", "Inter", sans-serif;
}
</style>
