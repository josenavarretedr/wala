<template>
  <section id="testimonials-section" class="py-20 md:py-28 px-4 bg-transparent relative overflow-hidden font-display">
    <div
      class="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10"
    >
      <div
        class="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-50 rounded-full filter blur-3xl opacity-15"
      ></div>
      <div
        class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-50 rounded-full filter blur-3xl opacity-15"
      ></div>
    </div>

    <div class="max-w-4xl mx-auto text-center">
      <div class="space-y-4 mb-16">
        <span
          class="inline-block px-4 py-1.5 bg-orange-50 border border-orange-100 text-[#E35336] text-xs font-bold uppercase tracking-wider rounded-full animate-none"
        >
          Prueba Social
        </span>
        <h2
          class="text-3xl sm:text-4xl md:text-5xl text-gray-900 font-extrabold leading-tight max-w-2xl mx-auto"
        >
          Lo que dicen los emprendedores que <span class="text-[#E35336]">ya pasaron por esto</span>
        </h2>
        <p class="text-base sm:text-lg text-gray-500 font-semibold max-w-md mx-auto">
          Casos reales de claridad y transformación que empezaron con una sesión de 20 minutos.
        </p>
      </div>

      <!-- Carrusel de Testimonios -->
      <div class="relative max-w-2xl mx-auto">
        <!-- Card Container -->
        <div class="relative min-h-[220px]">
          <transition name="fade-slide" mode="out-in">
            <div
              :key="currentIndex"
              class="bg-gray-50/50 rounded-3xl border border-gray-150/50 p-6 sm:p-10 text-left space-y-4 relative overflow-hidden"
            >
              <div
                class="w-12 h-12 bg-[#E35336]/10 text-[#E35336] rounded-2xl flex items-center justify-center shadow-inner"
              >
                <User class="w-6 h-6 stroke-[2.2]" />
              </div>
              <p class="text-base sm:text-lg text-gray-700 italic font-medium leading-relaxed" v-html="`“${testimonials[currentIndex].quote}”`"></p>
              <p class="text-xs sm:text-sm font-black text-gray-900 pt-2">
                — {{ testimonials[currentIndex].author }}
              </p>
            </div>
          </transition>
        </div>

        <!-- Controles de Navegación del Carrusel -->
        <div class="flex justify-between items-center mt-6">
          <!-- Dots Indicadores -->
          <div class="flex gap-2">
            <button
              v-for="(testimonial, index) in testimonials"
              :key="index"
              @click="currentIndex = index"
              class="w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer focus:outline-none"
              :class="
                currentIndex === index
                  ? 'bg-[#E35336] w-6'
                  : 'bg-gray-300 hover:bg-gray-400'
              "
              :aria-label="`Ir a testimonio ${index + 1}`"
            ></button>
          </div>

          <!-- Botones Prev/Next -->
          <div class="flex gap-2">
            <button
              class="w-8 h-8 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-650 shadow-sm active:scale-95 transition-all cursor-pointer"
              @click="prevTestimonial"
              aria-label="Testimonio anterior"
            >
              <NavArrowLeft class="w-4 h-4 stroke-[2.2]" />
            </button>
            <button
              class="w-8 h-8 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-650 shadow-sm active:scale-95 transition-all cursor-pointer"
              @click="nextTestimonial"
              aria-label="Siguiente testimonio"
            >
              <NavArrowRight class="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";
import { User, NavArrowLeft, NavArrowRight } from "@iconoir/vue";

const currentIndex = ref(0);

const testimonials = ref([
  {
    quote:
      "Pensé que mi problema era que vendía poco. En <span class='text-[#E35336] font-semibold'>20 minutos</span> José me mostró que el freno era el costeo — llevaba meses vendiendo <span class='text-[#E35336] font-semibold'>sin cubrir mi costo real</span>.",
    author: "Estela R., Salón de Belleza, Chiclayo",
  },
  {
    quote:
      "El diagnóstico de 20 minutos con José me abrió los ojos. Descubrí que la falta de control de inventario estaba devorando mi flujo de caja.",
    author: "Carlos M., Minimarket, Trujillo",
  },
  {
    quote:
      "WALA y José me ayudaron a entender que mi negocio sí era rentable, pero mezclaba todo con mi caja personal. El plan de acción fue súper práctico.",
    author: "Sofía G., Marca de Ropa, Lima",
  }
]);

const nextTestimonial = () => {
  currentIndex.value = (currentIndex.value + 1) % testimonials.value.length;
};

const prevTestimonial = () => {
  currentIndex.value =
    (currentIndex.value - 1 + testimonials.value.length) %
    testimonials.value.length;
};
</script>

<style scoped>
.font-display {
  font-family: "Outfit", "Inter", sans-serif;
}

/* Transición suave para el carrusel */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
