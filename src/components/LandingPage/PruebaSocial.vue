<template>
  <section
    id="prueba-social-section"
    class="py-16 sm:py-20 px-4 relative overflow-hidden"
  >
    <div class="max-w-6xl mx-auto">
      <!-- Contenedor principal tipo card (estilo HistorialRecords) -->
      <div class="bg-white p-6 sm:p-8 md:p-12 transition-all duration-200 mb-8">
        <!-- Badge superior -->
        <div class="flex justify-center mb-6">
          <div
            class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700"
          >
            <span class="text-2xl">🌍</span>
            <span class="text-sm font-medium">Prueba Social</span>
          </div>
        </div>

        <!-- Título Principal -->
        <h2
          class="text-3xl sm:text-4xl md:text-5xl text-gray-900 mb-6 text-center font-bold leading-tight tracking-tight"
        >
          Confiado por quienes
          <span class="text-blue-600">impulsan</span> el
          <span class="text-emerald-600">emprendimiento</span>
        </h2>

        <!-- Subtítulo -->
        <p
          class="text-lg sm:text-xl md:text-2xl text-gray-600 mb-8 text-center font-normal leading-relaxed max-w-4xl mx-auto"
        >
          WALA está siendo
          <span class="font-medium text-gray-800">validado</span> por
          emprendedores y aliados que creen en la
          <span class="font-medium text-blue-700">inclusión digital</span>.
        </p>
      </div>

      <!-- Aliados institucionales -->
      <div class="mb-12">
        <h3
          class="text-xl sm:text-2xl font-semibold text-gray-800 mb-6 text-center"
        >
          Nuestros aliados
        </h3>
        <div
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto"
        >
          <!-- Aliado 1: Municipalidad JLO -->
          <div
            class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md hover:border-blue-200 flex flex-col items-center justify-center text-center"
          >
            <div
              class="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-3"
            >
              <Building class="w-8 h-8 text-blue-600" />
            </div>
            <p class="text-sm font-semibold text-gray-900">Municipalidad de</p>
            <p class="text-sm font-semibold text-gray-900">
              José Leonardo Ortiz
            </p>
          </div>

          <!-- Aliado 2: COPEME -->
          <div
            class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md hover:border-emerald-200 flex flex-col items-center justify-center text-center"
          >
            <div
              class="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-3"
            >
              <Community class="w-8 h-8 text-emerald-600" />
            </div>
            <p class="text-sm font-semibold text-gray-900">COPEME</p>
            <p class="text-xs text-gray-500 mt-1">
              Consorcio de Organizaciones Privadas
            </p>
          </div>

          <!-- Aliado 3: RESCAM -->
          <div
            class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md hover:border-purple-200 flex flex-col items-center justify-center text-center"
          >
            <div
              class="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-3"
            >
              <Network class="w-8 h-8 text-purple-600" />
            </div>
            <p class="text-sm font-semibold text-gray-900">RESCAM</p>
            <p class="text-xs text-gray-500 mt-1">
              Red de Servicios Cooperativos
            </p>
          </div>

          <!-- Aliado 4: Cooperación Internacional -->
          <div
            class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md hover:border-orange-200 flex flex-col items-center justify-center text-center"
          >
            <div
              class="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-3"
            >
              <Globe class="w-8 h-8 text-orange-600" />
            </div>
            <p class="text-sm font-semibold text-gray-900">Cooperación</p>
            <p class="text-sm font-semibold text-gray-900">Internacional</p>
          </div>
        </div>
      </div>

      <!-- Testimonios destacados (rotativos) -->
      <div class="mb-8">
        <h3
          class="text-xl sm:text-2xl font-semibold text-gray-800 mb-6 text-center"
        >
          Lo que dicen nuestros usuarios
        </h3>

        <!-- Carrusel de testimonios -->
        <div class="relative max-w-4xl mx-auto">
          <div class="overflow-hidden">
            <div
              class="flex transition-transform duration-500 ease-in-out"
              :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
            >
              <!-- Testimonio 1 -->
              <div class="w-full flex-shrink-0 px-2">
                <div
                  class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 transition-all duration-200 hover:shadow-md hover:border-blue-200"
                >
                  <div class="flex items-start gap-4 mb-4">
                    <div
                      class="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center shrink-0"
                    >
                      <User class="w-6 h-6 text-blue-600" />
                    </div>
                    <div class="flex-1">
                      <p
                        class="text-lg sm:text-xl text-gray-800 mb-4 italic leading-relaxed"
                      >
                        "Ahora sé cuánto gano al mes sin hacer cuentas."
                      </p>
                      <p class="text-sm font-medium text-gray-900">
                        María González
                      </p>
                      <p class="text-xs text-gray-500">
                        Bodega "El Ahorro", Lima
                      </p>
                    </div>
                  </div>
                  <div class="flex gap-1">
                    <span class="text-yellow-500">⭐</span>
                    <span class="text-yellow-500">⭐</span>
                    <span class="text-yellow-500">⭐</span>
                    <span class="text-yellow-500">⭐</span>
                    <span class="text-yellow-500">⭐</span>
                  </div>
                </div>
              </div>

              <!-- Testimonio 2 -->
              <div class="w-full flex-shrink-0 px-2">
                <div
                  class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 transition-all duration-200 hover:shadow-md hover:border-emerald-200"
                >
                  <div class="flex items-start gap-4 mb-4">
                    <div
                      class="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center shrink-0"
                    >
                      <User class="w-6 h-6 text-emerald-600" />
                    </div>
                    <div class="flex-1">
                      <p
                        class="text-lg sm:text-xl text-gray-800 mb-4 italic leading-relaxed"
                      >
                        "WALA me ayuda a registrar mis ventas rápido, todo desde
                        mi celular."
                      </p>
                      <p class="text-sm font-medium text-gray-900">
                        Carlos Mendoza
                      </p>
                      <p class="text-xs text-gray-500">
                        Ferretería "San Martín", Chiclayo
                      </p>
                    </div>
                  </div>
                  <div class="flex gap-1">
                    <span class="text-yellow-500">⭐</span>
                    <span class="text-yellow-500">⭐</span>
                    <span class="text-yellow-500">⭐</span>
                    <span class="text-yellow-500">⭐</span>
                    <span class="text-yellow-500">⭐</span>
                  </div>
                </div>
              </div>

              <!-- Testimonio 3 -->
              <div class="w-full flex-shrink-0 px-2">
                <div
                  class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 transition-all duration-200 hover:shadow-md hover:border-purple-200"
                >
                  <div class="flex items-start gap-4 mb-4">
                    <div
                      class="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center shrink-0"
                    >
                      <User class="w-6 h-6 text-purple-600" />
                    </div>
                    <div class="flex-1">
                      <p
                        class="text-lg sm:text-xl text-gray-800 mb-4 italic leading-relaxed"
                      >
                        "Me di cuenta de que sí puedo manejar mi negocio con
                        orden."
                      </p>
                      <p class="text-sm font-medium text-gray-900">
                        Rosa Paredes
                      </p>
                      <p class="text-xs text-gray-500">
                        Restaurante "Sabor Peruano", Trujillo
                      </p>
                    </div>
                  </div>
                  <div class="flex gap-1">
                    <span class="text-yellow-500">⭐</span>
                    <span class="text-yellow-500">⭐</span>
                    <span class="text-yellow-500">⭐</span>
                    <span class="text-yellow-500">⭐</span>
                    <span class="text-yellow-500">⭐</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Controles del carrusel -->
          <div class="flex justify-center gap-2 mt-6">
            <button
              v-for="index in 3"
              :key="index"
              @click="currentSlide = index - 1"
              :class="[
                'w-3 h-3 rounded-full transition-all duration-200',
                currentSlide === index - 1
                  ? 'bg-blue-600 w-8'
                  : 'bg-gray-300 hover:bg-gray-400',
              ]"
              :aria-label="`Ir al testimonio ${index}`"
            ></button>
          </div>

          <!-- Flechas de navegación -->
          <button
            @click="prevSlide"
            class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 sm:-translate-x-12 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-blue-300"
            aria-label="Testimonio anterior"
          >
            <NavArrowLeft class="w-6 h-6 text-gray-700" />
          </button>
          <button
            @click="nextSlide"
            class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 sm:translate-x-12 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-blue-300"
            aria-label="Siguiente testimonio"
          >
            <NavArrowRight class="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </div>

      <!-- Card destacada con estadística social -->
      <div
        class="bg-gradient-to-br from-blue-50 to-emerald-50 rounded-xl shadow-sm border border-blue-100 p-8 mb-8 transition-all duration-200 hover:shadow-md"
      >
        <div class="text-center">
          <p class="text-5xl sm:text-6xl font-bold text-blue-600 mb-2">
            {{ animatedUsers }}+
          </p>
          <p class="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
            Emprendedores confían en WALA
          </p>
          <p class="text-base text-gray-600">
            Y la comunidad sigue creciendo cada día
          </p>
        </div>
      </div>

      <!-- CTA contextual -->
      <div class="text-center">
        <button
          class="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-emerald-500 text-white px-10 py-4 rounded-xl font-bold text-lg shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-600 hover:to-emerald-600"
          @click="scrollToNextSection"
        >
          Únete a la comunidad WALA
        </button>
        <p class="text-sm text-gray-500 mt-4">
          Forma parte de la transformación digital del emprendimiento
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

// Auto-rotación del carrusel
const startCarousel = () => {
  carouselInterval = setInterval(() => {
    nextSlide();
  }, 5000); // Cambiar cada 5 segundos
};

const stopCarousel = () => {
  if (carouselInterval) {
    clearInterval(carouselInterval);
    carouselInterval = null;
  }
};

// Animación del contador de usuarios
const animatedUsers = ref(0);
const targetUsers = 1500;

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

// Función para redirigir a login
const scrollToNextSection = () => {
  router.push("/auth/login");
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
/* Estilos coherentes con Hero, Pain, Solution, Funcionalidades y HistorialRecords */

/* Animación de entrada para las cards */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Aplicar animación a elementos */
.grid > div {
  animation: fadeInUp 0.5s ease-out backwards;
}

.grid > div:nth-child(1) {
  animation-delay: 0.1s;
}

.grid > div:nth-child(2) {
  animation-delay: 0.2s;
}

.grid > div:nth-child(3) {
  animation-delay: 0.3s;
}

.grid > div:nth-child(4) {
  animation-delay: 0.4s;
}

/* Transiciones suaves */
button,
.hover\:shadow-md {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

button:active {
  transform: translateY(0);
}

/* Responsive adjustments */
@media (max-width: 640px) {
  h2 {
    line-height: 1.2;
  }
}
</style>
