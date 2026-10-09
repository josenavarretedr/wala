<template>
  <section class="py-20 md:py-28 px-4 bg-transparent relative overflow-hidden font-display">
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
        Toma Acción
      </span>

      <h2
        class="text-3xl sm:text-4xl md:text-5xl text-gray-900 font-extrabold leading-tight max-w-2xl mx-auto"
      >
        Tu negocio ya tiene suficiente trabajo. <span class="text-[#E35336]">WALA pone la claridad</span>.
      </h2>

      <p class="text-base sm:text-lg text-gray-500 font-semibold max-w-lg mx-auto leading-relaxed">
        El primer paso hacia la tranquilidad financiera no te cuesta nada. Comienza tu diagnóstico gratuito hoy mismo.
      </p>

      <!-- CTA Buttons -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
        <button
          class="w-full sm:w-auto bg-[#E35336] hover:bg-[#c2412b] text-white px-8 py-4 rounded-xl font-semibold text-base sm:text-lg shadow-lg shadow-[#E35336]/20 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
          @click="openWhatsApp"
        >
          <span class="inline-flex items-center gap-2">
            <Rocket class="w-5 h-5" />
            Quiero mi diagnóstico gratuito
          </span>
        </button>

        <button
          class="w-full sm:w-auto border-2 border-[#E35336] text-[#E35336] px-8 py-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 hover:bg-[#E35336]/10 hover:-translate-y-0.5 cursor-pointer"
          @click="goToSignup"
        >
          <span class="inline-flex items-center gap-2">
            Empezar a usar WALA gratis
            <ArrowRight class="w-5 h-5" />
          </span>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useRouter } from "vue-router";
import { ArrowRight, Rocket } from "@iconoir/vue";

const router = useRouter();
const whatsappLink =
  "https://api.whatsapp.com/send?phone=51921492993&text=Hola%20Jos%C3%A9%2C%20vi%20la%20p%C3%A1gina%20de%20WALA%20y%20quiero%20agendar%20mi%20diagn%C3%B3stico%20gratuito%20de%2020%20minutos.%20%C2%BFAgendamos%20para%20esta%20semana%3F";

const openWhatsApp = () => {
  window.open(whatsappLink, "_blank", "noopener,noreferrer");
};

const goToSignup = () => {
  router.push("/auth/login");
};
</script>

<style scoped>
.font-display {
  font-family: "Outfit", "Inter", sans-serif;
}
</style>
