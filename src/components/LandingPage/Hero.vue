<template>
  <section
    id="hero-section"
    class="min-h-screen bg-transparent flex items-center justify-center px-4 py-16 md:py-24 relative overflow-hidden"
  >
    <div class="max-w-7xl mx-auto w-full">
      <div class="flex justify-center mb-10 md:mb-14">
        <img
          :src="logoWalaOrigin"
          alt="WALA"
          class="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 animate-fadeInScale"
        />
      </div>

      <div
        class="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 lg:gap-16 items-center"
      >
        <div class="text-center md:text-left space-y-6 md:space-y-8">
          <!-- Premium Micro-badge -->
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E35336]/10 text-[#E35336] text-[10px] font-black tracking-widest uppercase animate-none mx-auto md:mx-0 font-display">
            <Rocket class="w-3.5 h-3.5 stroke-[2.5]" />
            Método WALA · Simplifica tu negocio
          </div>

          <h1
            class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-gray-900 font-extrabold leading-[1.1] tracking-tight font-display"
          >
            ¿Sabes realmente <span class="text-[#E35336]">cuánto gana</span> tu negocio?
          </h1>

          <p
            class="text-lg sm:text-xl md:text-2xl text-gray-600 leading-relaxed max-w-2xl mx-auto md:mx-0"
          >
            La mayoría de emprendedores trabajan duro pero no saben en qué área
            está el <span class="text-[#E35336] font-semibold">freno</span>. WALA te ayuda a descubrirlo — y a <span class="text-[#E35336] font-semibold">ordenar todo</span> desde hoy.
          </p>

          <div
            class="flex flex-col sm:flex-row gap-4 justify-center md:justify-start items-center pt-2"
          >
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

        <!-- Derecha: Visual Block de Dashboard WALA Simulador -->
        <div class="hidden md:block scroll-fade-up">
          <div class="bg-white rounded-3xl border border-gray-100 shadow-[0_15px_50px_-20px_rgba(0,0,0,0.06)] p-6 font-display animate-floatSlow relative overflow-hidden">
            <!-- Background glow effect inside card -->
            <div class="absolute -top-12 -right-12 w-48 h-48 bg-[#E35336]/5 rounded-full blur-3xl pointer-events-none"></div>

            <div class="relative z-10 space-y-6">
              <!-- Dashboard Header -->
              <div class="flex items-center justify-between border-b border-gray-100 pb-4">
                <div class="flex items-center gap-2.5">
                  <div class="p-2 bg-[#E35336]/10 text-[#E35336] rounded-xl shadow-inner">
                    <SoilAlt class="w-5 h-5" />
                  </div>
                  <div>
                    <h3 class="text-xs font-black text-gray-900 uppercase tracking-wider">Asesoría WALA</h3>
                    <p class="text-[9px] text-gray-400 font-bold">Estado de Asesoría</p>
                  </div>
                </div>
                <span class="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-black text-emerald-700 ring-1 ring-inset ring-emerald-600/10">Activo</span>
              </div>

              <!-- Maturity Progress bar -->
              <div class="space-y-2">
                <div class="flex justify-between items-center text-xs">
                  <span class="text-gray-500 font-bold">Madurez del Negocio</span>
                  <span class="text-[#E35336] font-black">68%</span>
                </div>
                <div class="flex items-center gap-3">
                  <div class="flex-1 bg-gray-150 h-2.5 rounded-full overflow-hidden border border-gray-50 shadow-inner">
                    <div class="bg-[#E35336] h-full rounded-full transition-all duration-500" style="width: 68%"></div>
                  </div>
                </div>
              </div>

              <!-- Critical Areas & Indicators -->
              <div class="space-y-3 pt-2">
                <h4 class="text-[9px] font-black text-gray-400 uppercase tracking-widest">Áreas Críticas Priorizadas</h4>
                
                <div class="space-y-2.5">
                  <!-- Area 1 -->
                  <div class="flex items-center justify-between p-2.5 bg-amber-50/50 border border-amber-100 rounded-2xl">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shadow-inner shrink-0">
                        <Coins class="w-4.5 h-4.5 stroke-[2.2]" />
                      </div>
                      <div class="text-left">
                        <h4 class="text-xs font-extrabold text-gray-900">Estructura de Costeos</h4>
                        <p class="text-[9px] text-gray-400 font-bold">Prioridad 1</p>
                      </div>
                    </div>
                    <span class="text-[9px] font-black uppercase text-amber-700 bg-amber-100/50 px-2 py-0.5 rounded-md">1er Freno</span>
                  </div>

                  <!-- Area 2 -->
                  <div class="flex items-center justify-between p-2.5 bg-blue-50/50 border border-blue-100 rounded-2xl">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner shrink-0">
                        <Archive class="w-4.5 h-4.5 stroke-[2.2]" />
                      </div>
                      <div class="text-left">
                        <h4 class="text-xs font-extrabold text-gray-900">Control de Inventarios</h4>
                        <p class="text-[9px] text-gray-400 font-bold">Prioridad 2</p>
                      </div>
                    </div>
                    <span class="text-[9px] font-black uppercase text-blue-700 bg-blue-100/50 px-2 py-0.5 rounded-md">2do Freno</span>
                  </div>

                  <!-- Area 3 -->
                  <div class="flex items-center justify-between p-2.5 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner shrink-0">
                        <GraphUp class="w-4.5 h-4.5 stroke-[2.2]" />
                      </div>
                      <div class="text-left">
                        <h4 class="text-xs font-extrabold text-gray-900">Flujo de Caja Real</h4>
                        <p class="text-[9px] text-gray-400 font-bold">Prioridad 3</p>
                      </div>
                    </div>
                    <span class="text-[9px] font-black uppercase text-emerald-700 bg-emerald-100/50 px-2 py-0.5 rounded-md">3er Freno</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      class="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10"
    >
      <div
        class="absolute top-0 left-0 w-80 h-80 bg-orange-50 rounded-full filter blur-3xl opacity-30 -translate-x-24 -translate-y-24"
      ></div>
      <div
        class="absolute bottom-0 right-0 w-80 h-80 bg-emerald-50 rounded-full filter blur-3xl opacity-20 translate-x-24 translate-y-24"
      ></div>
    </div>
  </section>
</template>

<script setup>
import { useRouter } from "vue-router";
import { ArrowRight, Cash, Check, Rocket, GraphUp, SoilAlt, Binocular, Coins, Archive } from "@iconoir/vue";
import logoWalaOrigin from "@/assets/Wala Origin.png";

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
/* Estilos coherentes con la identidad WALA */
.hero-section {
  position: relative;
}

.font-display {
  font-family: "Outfit", "Inter", sans-serif;
}

/* Animación especial para el logo */
@keyframes fadeInScale {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fadeInScale {
  animation: fadeInScale 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Animación flotante suave para las cards del visual */
@keyframes floatSlow {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-floatSlow {
  animation: floatSlow 4s ease-in-out infinite;
}

/* Transiciones suaves para todos los elementos interactivos */
button {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

button:active {
  transform: translateY(0);
}

/* Responsive adjustments */
@media (max-width: 640px) {
  h1 {
    line-height: 1.1;
  }

  h2 {
    line-height: 1.5;
  }
}
</style>
