<template>
  <section
    id="prueba-social-section"
    class="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50"
  >
    <div class="max-w-6xl mx-auto">
      <!-- BLOQUE A: RESPALDO INSTITUCIONAL (PRIMERO) -->
      <div class="mb-16 lg:mb-20">
        <!-- Título -->
        <h2
          class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 text-center"
        >
          Respaldado por quienes impulsan el emprendimiento
        </h2>

        <!-- Subtexto ajustado -->
        <p
          class="text-lg lg:text-xl text-gray-600 mb-12 text-center max-w-3xl mx-auto leading-relaxed"
        >
          WALA viene siendo validado por emprendedores y aliados que trabajan
          por la inclusión digital y el fortalecimiento de pequeños negocios.
        </p>

        <!-- Grid de aliados (limpio, sin ruido) -->
        <div
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 max-w-5xl mx-auto"
        >
          <!-- Aliado 1: Municipalidad JLO -->
          <div
            class="bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center justify-center text-center transition-all duration-200 hover:border-blue-300"
          >
            <div
              class="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-3"
            >
              <Building class="w-7 h-7 text-blue-600" />
            </div>
            <p class="text-sm font-semibold text-gray-900 leading-tight">
              Municipalidad de<br />José Leonardo Ortiz
            </p>
          </div>

          <!-- Aliado 2: COPEME -->
          <div
            class="bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center justify-center text-center transition-all duration-200 hover:border-emerald-300"
          >
            <div
              class="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center mb-3"
            >
              <Community class="w-7 h-7 text-emerald-600" />
            </div>
            <p class="text-sm font-semibold text-gray-900">COPEME</p>
          </div>

          <!-- Aliado 3: RESCAM -->
          <div
            class="bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center justify-center text-center transition-all duration-200 hover:border-purple-300"
          >
            <div
              class="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center mb-3"
            >
              <Network class="w-7 h-7 text-purple-600" />
            </div>
            <p class="text-sm font-semibold text-gray-900">
              RESCAM<br />
              <span class="text-xs text-gray-500 font-normal"
                >Responsables del Cambio</span
              >
            </p>
          </div>

          <!-- Aliado 4: Cooperación Internacional -->
          <div
            class="bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center justify-center text-center transition-all duration-200 hover:border-orange-300"
          >
            <div
              class="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center mb-3"
            >
              <Globe class="w-7 h-7 text-orange-600" />
            </div>
            <p class="text-sm font-semibold text-gray-900 leading-tight">
              Cooperación<br />Internacional
            </p>
          </div>
        </div>

        <!-- Frase de honestidad (CLAVE) -->
        <p class="text-center text-base text-gray-600 italic">
          No es una moda. Es una herramienta en construcción y validación real.
        </p>
      </div>

      <!-- Testimonios destacados (rotativos) -->
      <!-- BLOQUE B: TESTIMONIOS (REDUCIDOS Y CREÍBLES) -->
      <div class="mb-16 lg:mb-20">
        <!-- Carrusel de testimonios (máximo 3, textos cortos) -->
        <div class="relative max-w-3xl mx-auto">
          <div class="overflow-hidden">
            <div
              class="flex transition-transform duration-500 ease-in-out"
              :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
            >
              <!-- Testimonio 1 -->
              <div class="w-full flex-shrink-0 px-2">
                <div
                  class="bg-white rounded-xl border border-gray-200 p-8 transition-all duration-200"
                >
                  <div class="flex items-start gap-4 mb-4">
                    <div
                      class="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0"
                    >
                      <User class="w-6 h-6 text-blue-600" />
                    </div>
                    <div class="flex-1">
                      <p class="text-lg text-gray-800 mb-3 leading-relaxed">
                        "Ahora sé cuánto gano al mes sin hacer cuentas."
                      </p>
                      <p class="text-sm font-semibold text-gray-900">
                        María González
                      </p>
                      <p class="text-xs text-gray-500">
                        Bodega "El Ahorro", Lima
                      </p>
                    </div>
                  </div>
                  <div class="flex gap-1">
                    <span class="text-sm text-yellow-500">⭐⭐⭐⭐⭐</span>
                  </div>
                </div>
              </div>

              <!-- Testimonio 2 -->
              <div class="w-full flex-shrink-0 px-2">
                <div
                  class="bg-white rounded-xl border border-gray-200 p-8 transition-all duration-200"
                >
                  <div class="flex items-start gap-4 mb-4">
                    <div
                      class="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0"
                    >
                      <User class="w-6 h-6 text-emerald-600" />
                    </div>
                    <div class="flex-1">
                      <p class="text-lg text-gray-800 mb-3 leading-relaxed">
                        "Registro mis ventas rápido, todo desde mi celular."
                      </p>
                      <p class="text-sm font-semibold text-gray-900">
                        Carlos Mendoza
                      </p>
                      <p class="text-xs text-gray-500">
                        Ferretería "San Martín", Chiclayo
                      </p>
                    </div>
                  </div>
                  <div class="flex gap-1">
                    <span class="text-sm text-yellow-500">⭐⭐⭐⭐⭐</span>
                  </div>
                </div>
              </div>

              <!-- Testimonio 3 -->
              <div class="w-full flex-shrink-0 px-2">
                <div
                  class="bg-white rounded-xl border border-gray-200 p-8 transition-all duration-200"
                >
                  <div class="flex items-start gap-4 mb-4">
                    <div
                      class="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center shrink-0"
                    >
                      <User class="w-6 h-6 text-purple-600" />
                    </div>
                    <div class="flex-1">
                      <p class="text-lg text-gray-800 mb-3 leading-relaxed">
                        "Me di cuenta de que sí puedo manejar mi negocio con
                        orden."
                      </p>
                      <p class="text-sm font-semibold text-gray-900">
                        Rosa Paredes
                      </p>
                      <p class="text-xs text-gray-500">
                        Restaurante "Sabor Peruano", Trujillo
                      </p>
                    </div>
                  </div>
                  <div class="flex gap-1">
                    <span class="text-sm text-yellow-500">⭐⭐⭐⭐⭐</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Controles del carrusel (discretos) -->
          <div class="flex justify-center gap-2 mt-6">
            <button
              v-for="index in 3"
              :key="index"
              @click="currentSlide = index - 1"
              :class="[
                'w-2 h-2 rounded-full transition-all duration-200',
                currentSlide === index - 1
                  ? 'bg-blue-600 w-6'
                  : 'bg-gray-300 hover:bg-gray-400',
              ]"
              :aria-label="`Ir al testimonio ${index}`"
            ></button>
          </div>

          <!-- Flechas suaves -->
          <button
            @click="prevSlide"
            class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 sm:-translate-x-12 bg-white rounded-full p-2 border border-gray-200 transition-all duration-200 hover:border-gray-300"
            aria-label="Testimonio anterior"
          >
            <NavArrowLeft class="w-5 h-5 text-gray-600" />
          </button>
          <button
            @click="nextSlide"
            class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 sm:translate-x-12 bg-white rounded-full p-2 border border-gray-200 transition-all duration-200 hover:border-gray-300"
            aria-label="Siguiente testimonio"
          >
            <NavArrowRight class="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <!-- BLOQUE C: PRUEBA DE TRACCIÓN (SUAVE, NO AGRESIVA) -->
      <div class="text-center">
        <p class="text-lg lg:text-xl text-gray-700 leading-relaxed">
          <span class="font-semibold text-gray-900"
            >{{ animatedUsers }}+ emprendedores</span
          >
          ya usan WALA<br />y la comunidad sigue creciendo cada día.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import {
  Building,
  Community,
  Network,
  Globe,
  User,
  NavArrowLeft,
  NavArrowRight,
} from "@iconoir/vue";

const router = useRouter();

// Estado del carrusel de testimonios
const currentSlide = ref(0);
let carouselInterval = null;

// Navegación del carrusel
const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % 3;
};

const prevSlide = () => {
  currentSlide.value = currentSlide.value === 0 ? 2 : currentSlide.value - 1;
};

// Auto-rotación del carrusel (más lento, menos agresivo)
const startCarousel = () => {
  carouselInterval = setInterval(() => {
    nextSlide();
  }, 7000); // Cambiar cada 7 segundos
};

const stopCarousel = () => {
  if (carouselInterval) {
    clearInterval(carouselInterval);
    carouselInterval = null;
  }
};

// Animación del contador de usuarios
const animatedUsers = ref(0);
const targetUsers = 100;

const animateCounter = () => {
  const duration = 2000; // 2 segundos
  const steps = 60;
  const increment = targetUsers / steps;
  const stepDuration = duration / steps;

  let current = 0;
  const timer = setInterval(() => {
    current += increment;
    if (current >= targetUsers) {
      animatedUsers.value = targetUsers;
      clearInterval(timer);
    } else {
      animatedUsers.value = Math.floor(current);
    }
  }, stepDuration);
};

// Lifecycle hooks
onMounted(() => {
  startCarousel();
  animateCounter();
});

onBeforeUnmount(() => {
  stopCarousel();
});
</script>

<style scoped>
/* Estilos coherentes con Solution.vue y Benefits.vue */

/* Transiciones suaves */
button {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

button:active {
  transform: translateY(0);
}
</style>
