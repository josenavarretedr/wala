<template>
  <section class="py-20 md:py-28 px-4 bg-white relative overflow-hidden">
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
      <h2
        class="text-3xl sm:text-4xl md:text-5xl text-gray-900 font-extrabold leading-tight mb-10"
      >
        Lo que dicen los emprendedores que ya pasaron por esto
      </h2>

      <!-- Carrusel de Testimonios -->
      <div class="relative">
        <!-- Card Container -->
        <div class="relative min-h-[280px]">
          <transition name="fade" mode="out-in">
            <div
              :key="currentIndex"
              class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
            >
              <div
                class="w-12 h-12 bg-[#E35336]/10 rounded-xl flex items-center justify-center mx-auto mb-4"
              >
                <User class="w-6 h-6 text-[#E35336]" />
              </div>
              <p class="text-lg sm:text-xl text-gray-800 leading-relaxed mb-6">
                "{{ testimonials[currentIndex].quote }}"
              </p>
              <p class="text-sm font-semibold text-gray-900">
                — {{ testimonials[currentIndex].author }}
              </p>
            </div>
          </transition>
        </div>

        <!-- Botones Navegación -->
        <button
          v-if="testimonials.length > 1"
          class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-14 sm:-translate-x-16 w-10 h-10 rounded-full bg-[#E35336] text-white flex items-center justify-center hover:shadow-lg transition-all duration-200 hover:-translate-y-1/2"
          @click="prevTestimonial"
          aria-label="Testimonio anterior"
        >
          <NavArrowLeft class="w-5 h-5" />
        </button>

        <button
          v-if="testimonials.length > 1"
          class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-14 sm:translate-x-16 w-10 h-10 rounded-full bg-[#E35336] text-white flex items-center justify-center hover:shadow-lg transition-all duration-200 hover:-translate-y-1/2"
          @click="nextTestimonial"
          aria-label="Siguiente testimonio"
        >
          <NavArrowRight class="w-5 h-5" />
        </button>


        <!-- Dots Indicadores -->
        <div
          v-if="testimonials.length > 1"
          class="flex justify-center gap-2 mt-8"
        >
          <button
            v-for="(testimonial, index) in testimonials"
            :key="index"
            class="w-2 h-2 rounded-full transition-all duration-300"
            :class="
              currentIndex === index
                ? 'bg-[#E35336] w-8'
                : 'bg-gray-300 hover:bg-gray-400'
            "
            @click="currentIndex = index"
            :aria-label="`Ir a testimonio ${index + 1}`"
          ></button>
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
      "Pensé que mi problema era que vendía poco. En 20 minutos me mostró que el freno era el costeo — llevaba meses vendiendo sin cubrir mis costos reales.",
    author: "[Nombre], salón de belleza, Chiclayo",
  },
  // Agregar más testimonios aquí cuando estén disponibles
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
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
