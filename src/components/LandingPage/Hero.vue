<template>
  <section
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
          <h1
            class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-gray-900 font-extrabold leading-[1.1] tracking-tight"
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
              class="w-full sm:w-auto bg-[#E35336] text-white px-8 py-4 rounded-xl font-semibold text-base sm:text-lg shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
              @click="openWhatsApp"
            >
              <span class="inline-flex items-center gap-2">
                <Rocket class="w-5 h-5" />
                Quiero mi diagnóstico gratuito
              </span>
            </button>

            <button
              class="w-full sm:w-auto border-2 border-[#E35336] text-[#E35336] px-8 py-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-200 hover:bg-[#E35336]/10"
              @click="goToSignup"
            >
              <span class="inline-flex items-center gap-2">
                Empezar a usar WALA gratis
                <ArrowRight class="w-5 h-5" />
              </span>
            </button>
          </div>
        </div>

        <div class="hidden md:block scroll-fade-up">
          <div
            class="rounded-2xl shadow-premium shadow-premium-hover p-8"
          >
            <div class="space-y-5">
              <div class="flex items-start gap-3">
                <div
                  class="w-10 h-10 rounded-lg bg-[#E35336]/10 flex items-center justify-center"
                >
                  <GraphUp class="w-5 h-5 text-[#E35336]" />
                </div>
                <div>
                  <p class="text-sm text-gray-500">Resultado del día</p>
                  <p class="text-lg font-semibold text-gray-900">
                    Ganas claridad en minutos
                  </p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div
                  class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center"
                >
                  <Cash class="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p class="text-sm text-gray-500">Ingresos y gastos</p>
                  <p class="text-lg font-semibold text-gray-900">
                    Orden simple y real
                  </p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div
                  class="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center"
                >
                  <Check class="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p class="text-sm text-gray-500">Decisiones</p>
                  <p class="text-lg font-semibold text-gray-900">
                    Prioriza lo que importa
                  </p>
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
import { ArrowRight, Cash, Check, Rocket, GraphUp } from "@iconoir/vue";
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
