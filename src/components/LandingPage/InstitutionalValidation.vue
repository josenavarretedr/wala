<template>
  <section class="py-20 md:py-28 px-4 bg-white relative overflow-hidden">
    <!-- Elementos de fondo sutiles para diseño premium -->
    <div
      class="absolute top-0 right-0 w-[500px] h-[500px] bg-[#E35336]/5 rounded-full filter blur-3xl opacity-60 -z-10 translate-x-1/2 -translate-y-1/4"
    ></div>
    <div
      class="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-50 rounded-full filter blur-3xl opacity-40 -z-10 -translate-x-1/2 translate-y-1/4"
    ></div>

    <div class="max-w-6xl mx-auto">
      <div class="text-center mb-16">
        <span
          class="inline-block px-4 py-1.5 mb-4 bg-[#E35336]/10 text-[#E35336] text-xs font-bold uppercase tracking-wider rounded-full"
        >
          Aval Institucional
        </span>
        <h2
          class="text-3xl sm:text-4xl md:text-5xl text-gray-900 font-extrabold leading-tight mb-5 max-w-3xl mx-auto"
        >
          Una metodología que ya funciona en programas reales
        </h2>
        <p class="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          El Método WALA no es teoría. Es el mismo sistema utilizado en
          programas de emprendimiento con respaldo de cooperación internacional.
        </p>
      </div>

      <!-- Carrusel Premium -->
      <div class="relative max-w-3xl mx-auto px-4 sm:px-8">
        <!-- Contenedor de Tarjeta Interactiva con Glassmorphism sutil -->
        <div class="relative min-h-[280px] flex items-center justify-center">
          <transition name="card-fade" mode="out-in">
            <div
              :key="currentIndex"
              class="w-full bg-white rounded-2xl border border-gray-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] p-8 md:p-10 flex flex-col items-start hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.08)] transition-shadow duration-300"
            >
              <div
                class="w-14 h-14 rounded-2xl mb-6 flex items-center justify-center shadow-sm"
                :class="getCardStyles(currentIndex).iconBg"
              >
                <component
                  :is="getCardStyles(currentIndex).icon"
                  class="w-7 h-7"
                  :class="getCardStyles(currentIndex).iconColor"
                />
              </div>

              <h3 class="text-xl sm:text-2xl font-extrabold text-gray-900 mb-3 leading-snug">
                {{ cards[currentIndex].title }}
              </h3>

              <p v-if="cards[currentIndex].subtitle" class="text-emerald-700 font-semibold text-sm sm:text-base mb-3 flex items-center gap-2">
                <span class="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                {{ cards[currentIndex].subtitle }}
              </p>

              <p class="text-gray-600 text-base sm:text-lg leading-relaxed">
                {{ cards[currentIndex].description }}
              </p>
            </div>
          </transition>
        </div>

        <!-- Controles Flotantes Ultra Finos -->
        <div class="absolute inset-y-0 -left-4 -right-4 sm:-left-8 sm:-right-8 flex items-center justify-between pointer-events-none">
          <button
            class="pointer-events-auto w-12 h-12 rounded-full bg-white border border-gray-100 shadow-md text-gray-700 flex items-center justify-center hover:bg-[#E35336] hover:text-white hover:shadow-lg active:scale-95 transition-all duration-200"
            @click="prevCard"
            aria-label="Tarjeta anterior"
          >
            <NavArrowLeft class="w-6 h-6" />
          </button>

          <button
            class="pointer-events-auto w-12 h-12 rounded-full bg-white border border-gray-100 shadow-md text-gray-700 flex items-center justify-center hover:bg-[#E35336] hover:text-white hover:shadow-lg active:scale-95 transition-all duration-200"
            @click="nextCard"
            aria-label="Siguiente tarjeta"
          >
            <NavArrowRight class="w-6 h-6" />
          </button>
        </div>

        <!-- Dots Indicadores Estilizados -->
        <div class="flex justify-center items-center gap-2.5 mt-10">
          <button
            v-for="(card, index) in cards"
            :key="index"
            class="h-2 rounded-full transition-all duration-300 focus:outline-none"
            :class="
              currentIndex === index
                ? 'bg-[#E35336] w-10'
                : 'bg-gray-200 hover:bg-gray-300 w-2.5'
            "
            @click="currentIndex = index"
            :aria-label="`Ir a tarjeta ${index + 1}`"
          ></button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { Building, Globe, Network, NavArrowLeft, NavArrowRight } from "@iconoir/vue";

const currentIndex = ref(0);
let autoplayInterval = null;

const cards = ref([
  {
    title: "Fortalecemos el ecosistema emprendedor",
    description: "Construimos bases sólidas conectando a dueños de negocios con herramientas digitales que facilitan una gestión profesional y sostenible.",
  },
  {
    title: "Metodología alineada con MESUN · OIT",
    subtitle: "Mejore su negocio — Organización Internacional del Trabajo",
    description: "Aplicamos el mismo estándar técnico internacional utilizado en los programas de fortalecimiento empresarial de mayor impacto en América Latina.",
  },
  {
    title: "Programas municipales de fortalecimiento empresarial",
    description: "Trabajamos de la mano con gobiernos locales para impulsar el desarrollo económico local. Trabajamos en comunidad para los negocios de todos.",
  },
]);

const getCardStyles = (index) => {
  const styles = [
    {
      icon: Network,
      iconBg: "bg-orange-50",
      iconColor: "text-[#E35336]",
    },
    {
      icon: Globe,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      icon: Building,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
  ];
  return styles[index];
};

const nextCard = () => {
  currentIndex.value = (currentIndex.value + 1) % cards.value.length;
  resetAutoplay();
};

const prevCard = () => {
  currentIndex.value =
    (currentIndex.value - 1 + cards.value.length) % cards.value.length;
  resetAutoplay();
};

// Autoplay sutil para dinamismo
const startAutoplay = () => {
  autoplayInterval = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % cards.value.length;
  }, 6000);
};

const resetAutoplay = () => {
  clearInterval(autoplayInterval);
  startAutoplay();
};

onMounted(() => {
  startAutoplay();
});

onUnmounted(() => {
  clearInterval(autoplayInterval);
});
</script>

<style scoped>
/* Transición premium y fluida para las tarjetas */
.card-fade-enter-active,
.card-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-fade-enter-from {
  opacity: 0;
  transform: scale(0.97) translateY(4px);
}

.card-fade-leave-to {
  opacity: 0;
  transform: scale(0.97) translateY(-4px);
}
</style>
