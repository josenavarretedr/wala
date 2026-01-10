<template>
  <section
    id="prueba-social-section"
    class="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-orange-50/30"
  >
    <!-- Sombras sutiles de fondo -->
    <div
      class="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10"
    >
      <div
        class="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100 rounded-full filter blur-3xl opacity-20"
      ></div>
      <div
        class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-100 rounded-full filter blur-3xl opacity-20"
      ></div>
    </div>

    <div class="max-w-6xl mx-auto">
      <!-- BLOQUE PRINCIPAL: TERRITORIO Y ACOMPAÑAMIENTO -->
      <div
        class="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-12 md:p-16 mb-12 md:mb-20 text-center transition-all duration-200"
      >
        <h2
          class="text-4xl sm:text-5xl md:text-6xl text-gray-900 font-extrabold leading-[1.1] tracking-tight mb-8"
        >
          Cuando el territorio acompaña,<br />el emprendimiento
          <span class="text-purple-600">avanza</span>
        </h2>
        <p
          class="text-xl sm:text-2xl text-gray-600 leading-relaxed max-w-4xl mx-auto mb-8"
          style="line-height: 1.6"
        >
          Trabajamos junto a municipalidades, cámaras y organizaciones aliadas
          para ofrecer programas de fortalecimiento empresarial que llegan
          directamente a los emprendedores.
        </p>
        <p
          class="text-lg sm:text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto"
        >
          <span class="font-semibold text-gray-900"
            >¿Estás en un programa? Ingresa con tu código.</span
          ><br />
          ¿No estás en uno? Usa WALA y descubre si hay acompañamiento en tu
          distrito.
        </p>
      </div>

      <!-- BLOQUE RESPALDO INSTITUCIONAL -->
      <div class="mb-12 md:mb-20">
        <!-- Título -->
        <h2
          class="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 text-center leading-tight"
        >
          Respaldado por quienes fortalecen el emprendimiento
        </h2>

        <!-- Subtexto ajustado -->
        <p
          class="text-xl sm:text-2xl text-gray-600 mb-12 text-center max-w-4xl mx-auto leading-relaxed"
          style="line-height: 1.6"
        >
          WALA es una plataforma en uso real, validada por emprendedores y
          aliados institucionales que trabajan por el desarrollo económico local
          y la inclusión digital.
        </p>

        <!-- Grid de aliados (limpio, sin ruido) -->
        <div
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 max-w-5xl mx-auto"
        >
          <!-- Aliado 1: Municipalidad JLO -->
          <div
            class="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 flex flex-col items-center justify-center text-center transition-all duration-200 hover:shadow-xl hover:-translate-y-1"
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
            class="bg-white rounded-2xl shadow-lg border border-emerald-100 p-6 flex flex-col items-center justify-center text-center transition-all duration-200 hover:shadow-xl hover:-translate-y-1"
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
            class="bg-white rounded-2xl shadow-lg border border-purple-100 p-6 flex flex-col items-center justify-center text-center transition-all duration-200 hover:shadow-xl hover:-translate-y-1"
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
            class="bg-white rounded-2xl shadow-lg border border-orange-100 p-6 flex flex-col items-center justify-center text-center transition-all duration-200 hover:shadow-xl hover:-translate-y-1"
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
        <div
          class="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-100 p-6 sm:p-8 max-w-3xl mx-auto"
        >
          <p
            class="text-center text-lg sm:text-xl text-gray-800 font-semibold leading-relaxed"
          >
            Es una herramienta que se construye y valida en el territorio.
          </p>
        </div>
      </div>

      <!-- TESTIMONIOS -->
      <div class="mb-12 md:mb-20">
        <h3
          class="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-10 text-center"
        >
          Lo que dicen nuestros emprendedores
        </h3>
        <!-- Carrusel de testimonios (máximo 3, textos cortos) -->
        <div class="relative max-w-4xl mx-auto">
          <div class="overflow-hidden rounded-3xl">
            <div
              class="flex transition-transform duration-500 ease-in-out"
              :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
            >
              <!-- Testimonio 1 -->
              <div class="w-full flex-shrink-0 px-3">
                <div
                  class="bg-white rounded-2xl shadow-xl border border-blue-100 p-10 transition-all duration-200"
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
              <div class="w-full flex-shrink-0 px-3">
                <div
                  class="bg-white rounded-2xl shadow-xl border border-emerald-100 p-10 transition-all duration-200"
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
              <div class="w-full flex-shrink-0 px-3">
                <div
                  class="bg-white rounded-2xl shadow-xl border border-purple-100 p-10 transition-all duration-200"
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
          <div class="flex justify-center gap-2 mt-8">
            <button
              v-for="index in 3"
              :key="index"
              @click="currentSlide = index - 1"
              :class="[
                'w-2.5 h-2.5 rounded-full transition-all duration-200',
                currentSlide === index - 1
                  ? 'bg-purple-600 w-8'
                  : 'bg-gray-300 hover:bg-gray-400',
              ]"
              :aria-label="`Ir al testimonio ${index}`"
            ></button>
          </div>

          <!-- Flechas suaves -->
          <button
            @click="prevSlide"
            class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 sm:-translate-x-12 bg-white rounded-full p-3 shadow-lg border border-gray-200 transition-all duration-200 hover:shadow-xl hover:-translate-y-1/2 hover:scale-110"
            aria-label="Testimonio anterior"
          >
            <NavArrowLeft class="w-5 h-5 text-gray-700" />
          </button>
          <button
            @click="nextSlide"
            class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 sm:translate-x-12 bg-white rounded-full p-3 shadow-lg border border-gray-200 transition-all duration-200 hover:shadow-xl hover:-translate-y-1/2 hover:scale-110"
            aria-label="Siguiente testimonio"
          >
            <NavArrowRight class="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      <!-- BLOQUE TRACCIÓN -->
      <div
        class="bg-gradient-to-br from-orange-50 to-blue-50 rounded-3xl border border-orange-100 p-8 sm:p-10 md:p-12 mb-12 md:mb-16 text-center"
      >
        <h3
          class="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight"
        >
          Más de {{ animatedUsers }} emprendedores ya usan WALA
        </h3>
        <p
          class="text-xl sm:text-2xl text-gray-700 leading-relaxed max-w-3xl mx-auto"
        >
          Y cada día más personas están ordenando su negocio y tomando mejores
          decisiones.
        </p>
      </div>

      <!-- CTA FINAL -->
      <div
        class="bg-white rounded-3xl shadow-lg border border-gray-200 p-8 sm:p-10 md:p-12 text-center"
      >
        <h3
          class="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 leading-tight"
        >
          Empieza hoy. Tu negocio lo necesita.
        </h3>
        <p
          class="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto"
          style="line-height: 1.6"
        >
          No importa si recién comienzas o si ya llevas tiempo emprendiendo.<br />
          WALA te ayuda a ordenar, entender y avanzar.
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
/* Estilos coherentes con ProgramsPitch.vue */

/* Transiciones suaves para cards */
.grid > div {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

button {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

button:active {
  transform: translateY(0);
}

/* Responsive adjustments */
@media (max-width: 640px) {
  h2 {
    line-height: 1.1;
  }
}

/* Animación de entrada para las cards de aliados */
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

.grid > div:nth-child(1) {
  animation: fadeInUp 0.6s ease-out 0.1s backwards;
}

.grid > div:nth-child(2) {
  animation: fadeInUp 0.6s ease-out 0.3s backwards;
}

.grid > div:nth-child(3) {
  animation: fadeInUp 0.6s ease-out 0.5s backwards;
}

.grid > div:nth-child(4) {
  animation: fadeInUp 0.6s ease-out 0.7s backwards;
}
</style>
