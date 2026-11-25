<template>
  <section
    class="px-4 relative overflow-hidden font-display"
    :class="
      variant === 'diagnostico'
        ? 'py-16 sm:py-20 bg-white border-y border-slate-200'
        : 'py-16 sm:py-24 bg-transparent'
    "
  >
    <!-- Elementos de fondo sutiles solo en home -->
    <template v-if="variant === 'home'">
      <div
        class="absolute top-0 right-0 w-[500px] h-[500px] bg-[#E35336]/5 rounded-full filter blur-3xl opacity-60 -z-10 translate-x-1/2 -translate-y-1/4 pointer-events-none"
      ></div>
      <div
        class="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-50 rounded-full filter blur-3xl opacity-40 -z-10 -translate-x-1/2 translate-y-1/4 pointer-events-none"
      ></div>
    </template>

    <div class="max-w-6xl mx-auto">
      <div class="text-center mb-12 sm:mb-16 space-y-4">
        <span
          class="inline-block px-4 py-1.5 bg-orange-50 border border-orange-100 text-[#E35336] text-xs font-bold uppercase tracking-wider rounded-full"
        >
          Respaldo Metodológico
        </span>
        <h2
          class="text-3xl sm:text-4xl md:text-5xl text-gray-900 font-extrabold leading-tight max-w-3xl mx-auto"
        >
          Una metodología <span class="text-[#E35336]">probada en campo</span>,
          no teoría de escritorio
        </h2>
        <p
          class="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed font-semibold"
        >
          El Método WALA adapta estándares internacionales a la realidad diaria
          de emprendedores y negocios en crecimiento, validado en programas
          municipales y de cooperación.
        </p>
      </div>

      <!-- Carrusel -->
      <div class="relative max-w-3xl mx-auto px-2 sm:px-10">
        <div class="relative min-h-[260px] flex items-center justify-center">
          <transition name="card-fade" mode="out-in">
            <div
              :key="currentIndex"
              class="w-full bg-white rounded-3xl p-6 sm:p-8 md:p-10 flex flex-col items-start transition-shadow duration-300"
              :class="
                variant === 'diagnostico'
                  ? 'border border-slate-200 shadow-sm'
                  : 'border border-gray-200 shadow-[0_15px_50px_-20px_rgba(0,0,0,0.06)] hover:shadow-xl'
              "
            >
              <div
                class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl mb-5 flex items-center justify-center shadow-inner"
                :class="getCardStyles(currentIndex).iconBg"
              >
                <component
                  :is="getCardStyles(currentIndex).icon"
                  class="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]"
                  :class="getCardStyles(currentIndex).iconColor"
                />
              </div>

              <h3
                class="text-xl sm:text-2xl font-extrabold text-gray-900 mb-3 leading-snug"
              >
                {{ cards[currentIndex].titlePrefix }}
                <span :class="cards[currentIndex].highlightClass">{{
                  cards[currentIndex].titleHighlight
                }}</span>
              </h3>

              <p
                v-if="cards[currentIndex].subtitle"
                class="text-emerald-700 font-extrabold text-xs sm:text-sm mb-3 flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-lg"
              >
                <span
                  class="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"
                ></span>
                <span>{{ cards[currentIndex].subtitle }}</span>
              </p>

              <p
                class="text-gray-600 text-sm sm:text-base md:text-lg leading-relaxed font-medium"
              >
                {{ cards[currentIndex].description }}
              </p>
            </div>
          </transition>
        </div>

        <!-- Controles -->
        <div
          class="flex sm:block items-center justify-center gap-4 mt-6 sm:mt-0"
        >
          <button
            type="button"
            class="sm:absolute sm:top-1/2 sm:-translate-y-1/2 sm:left-0 w-10 h-10 rounded-xl bg-white border border-gray-200 shadow-sm text-gray-700 flex items-center justify-center hover:bg-[#E35336] hover:text-white hover:border-[#E35336] active:scale-95 transition-all duration-200 cursor-pointer"
            @click="prevCard"
            aria-label="Tarjeta anterior"
          >
            <NavArrowLeft class="w-5 h-5 stroke-[2.2]" />
          </button>

          <button
            type="button"
            class="sm:absolute sm:top-1/2 sm:-translate-y-1/2 sm:right-0 w-10 h-10 rounded-xl bg-white border border-gray-200 shadow-sm text-gray-700 flex items-center justify-center hover:bg-[#E35336] hover:text-white hover:border-[#E35336] active:scale-95 transition-all duration-200 cursor-pointer"
            @click="nextCard"
            aria-label="Siguiente tarjeta"
          >
            <NavArrowRight class="w-5 h-5 stroke-[2.2]" />
          </button>
        </div>

        <!-- Dots Indicadores -->
        <div class="flex justify-center items-center gap-2.5 mt-6 sm:mt-8">
          <button
            v-for="(card, index) in cards"
            :key="index"
            type="button"
            class="h-2.5 rounded-full transition-all duration-300 focus:outline-none cursor-pointer"
            :class="
              currentIndex === index
                ? 'bg-[#E35336] w-8'
                : 'bg-gray-200 hover:bg-gray-300 w-2.5'
            "
            @click="selectCard(index)"
            :aria-label="`Ir a tarjeta ${index + 1}`"
          ></button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import {
  Building,
  Globe,
  Network,
  NavArrowLeft,
  NavArrowRight,
} from "@iconoir/vue";

defineProps({
  variant: {
    type: String,
    default: "home",
    validator: (value) => ["home", "diagnostico"].includes(value),
  },
});

const currentIndex = ref(0);
let autoplayInterval = null;

const cards = [
  {
    titlePrefix: "Metodología alineada con",
    titleHighlight: "MESUN · OIT",
    highlightClass: "text-emerald-600",
    subtitle: "Mejore su Negocio — Organización Internacional del Trabajo",
    description:
      "Aplicamos el mismo estándar técnico internacional utilizado en los programas de fortalecimiento empresarial de mayor impacto en América Latina, traducido a indicadores accionables.",
  },
  {
    titlePrefix: "Programas municipales y de",
    titleHighlight: "cooperación para emprendedores",
    highlightClass: "text-blue-600",
    subtitle: "Implementación real en campo",
    description:
      "Trabajamos junto a gobiernos locales y programas de cooperación internacional para impulsar el desarrollo económico local con herramientas digitales y seguimiento práctico.",
  },
  {
    titlePrefix: "Fortalecemos el",
    titleHighlight: "ecosistema emprendedor",
    highlightClass: "text-[#E35336]",
    subtitle: "De la intuición al control diario",
    description:
      "Construimos bases sólidas conectando a dueños de negocios con software simple y criterio metodológico para una gestión profesional y sostenible.",
  },
];

const getCardStyles = (index) => {
  const styles = [
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
    {
      icon: Network,
      iconBg: "bg-orange-50",
      iconColor: "text-[#E35336]",
    },
  ];
  return styles[index];
};

const nextCard = () => {
  currentIndex.value = (currentIndex.value + 1) % cards.length;
  resetAutoplay();
};

const prevCard = () => {
  currentIndex.value = (currentIndex.value - 1 + cards.length) % cards.length;
  resetAutoplay();
};

const selectCard = (index) => {
  currentIndex.value = index;
  resetAutoplay();
};

const startAutoplay = () => {
  autoplayInterval = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % cards.length;
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
.font-display {
  font-family: "Outfit", "Inter", sans-serif;
}

.card-fade-enter-active,
.card-fade-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-fade-enter-from {
  opacity: 0;
  transform: scale(0.98) translateY(4px);
}

.card-fade-leave-to {
  opacity: 0;
  transform: scale(0.98) translateY(-4px);
}
</style>
