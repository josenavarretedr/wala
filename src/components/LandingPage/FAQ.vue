<template>
  <section
    id="faq-section"
    class="py-16 sm:py-20 px-4 bg-white relative overflow-hidden"
  >
    <!-- Sombras sutiles de fondo (coherente con otras secciones) -->
    <div
      class="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10"
    >
      <div
        class="absolute top-0 right-0 w-80 h-80 bg-orange-50 rounded-full filter blur-3xl opacity-20"
      ></div>
      <div
        class="absolute bottom-0 left-0 w-80 h-80 bg-purple-50 rounded-full filter blur-3xl opacity-20"
      ></div>
    </div>

    <div class="max-w-4xl mx-auto">
      <!-- Contenedor principal tipo card (estilo HistorialRecords) -->
      <div
        class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8 md:p-12 transition-all duration-200 hover:shadow-md hover:border-gray-200 mb-8"
      >
        <!-- Badge superior -->
        <div class="flex justify-center mb-6">
          <div
            class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-200 text-orange-700"
          >
            <span class="text-2xl">❓</span>
            <span class="text-sm font-medium">Preguntas Frecuentes</span>
          </div>
        </div>

        <!-- Título Principal -->
        <h2
          class="text-3xl sm:text-4xl md:text-5xl text-gray-900 mb-6 text-center font-bold leading-tight tracking-tight"
        >
          ¿Tienes <span class="text-orange-600">dudas</span>? Aquí te las
          <span class="text-purple-600">aclaramos</span>
        </h2>

        <!-- Subtítulo -->
        <p
          class="text-lg sm:text-xl md:text-2xl text-gray-600 mb-8 text-center font-normal leading-relaxed max-w-3xl mx-auto"
        >
          Resolvemos las preguntas más comunes para que
          <span class="font-medium text-gray-800">empieces sin dudas</span>.
        </p>
      </div>

      <!-- Accordion de preguntas -->
      <div class="space-y-4 mb-8">
        <!-- Pregunta 1: ¿Necesito experiencia en finanzas? -->
        <div
          class="bg-white rounded-xl shadow-sm border border-gray-100 transition-all duration-200"
          :class="
            openQuestion === 1
              ? 'shadow-md border-orange-200'
              : 'hover:shadow-md hover:border-gray-200'
          "
        >
          <button
            @click="toggleQuestion(1)"
            class="w-full flex items-start justify-between gap-4 p-6 text-left"
          >
            <div class="flex items-start gap-4 flex-1">
              <div
                class="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center shrink-0 transition-all duration-200"
                :class="openQuestion === 1 ? 'bg-orange-100' : ''"
              >
                <Number1Square class="w-6 h-6 text-orange-600" />
              </div>
              <div class="flex-1">
                <h3 class="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
                  ¿Necesito tener experiencia en finanzas?
                </h3>
                <div
                  v-show="openQuestion === 1"
                  class="mt-3 text-base text-gray-600 leading-relaxed"
                >
                  <p>
                    <strong class="text-gray-900">No.</strong> WALA fue diseñado
                    para personas que
                    <span class="font-medium text-orange-700"
                      >nunca han usado una app financiera</span
                    >. Todo es simple, visual y fácil de entender.
                  </p>
                </div>
              </div>
            </div>
            <div class="shrink-0 mt-1">
              <NavArrowDown
                class="w-6 h-6 text-gray-400 transition-transform duration-200"
                :class="openQuestion === 1 ? 'rotate-180' : ''"
              />
            </div>
          </button>
        </div>

        <!-- Pregunta 2: ¿Funciona sin internet? -->
        <div
          class="bg-white rounded-xl shadow-sm border border-gray-100 transition-all duration-200"
          :class="
            openQuestion === 2
              ? 'shadow-md border-blue-200'
              : 'hover:shadow-md hover:border-gray-200'
          "
        >
          <button
            @click="toggleQuestion(2)"
            class="w-full flex items-start justify-between gap-4 p-6 text-left"
          >
            <div class="flex items-start gap-4 flex-1">
              <div
                class="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center shrink-0 transition-all duration-200"
                :class="openQuestion === 2 ? 'bg-blue-100' : ''"
              >
                <Number2Square class="w-6 h-6 text-blue-600" />
              </div>
              <div class="flex-1">
                <h3 class="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
                  ¿Funciona sin internet?
                </h3>
                <div
                  v-show="openQuestion === 2"
                  class="mt-3 text-base text-gray-600 leading-relaxed"
                >
                  <p>
                    <strong class="text-gray-900">Sí.</strong> Puedes registrar
                    tus ventas
                    <span class="font-medium text-blue-700">offline</span> y se
                    sincroniza automáticamente cuando tengas conexión.
                  </p>
                </div>
              </div>
            </div>
            <div class="shrink-0 mt-1">
              <NavArrowDown
                class="w-6 h-6 text-gray-400 transition-transform duration-200"
                :class="openQuestion === 2 ? 'rotate-180' : ''"
              />
            </div>
          </button>
        </div>

        <!-- Pregunta 3: ¿Qué pasa después de los 15 días gratis? -->
        <div
          class="bg-white rounded-xl shadow-sm border border-gray-100 transition-all duration-200"
          :class="
            openQuestion === 3
              ? 'shadow-md border-emerald-200'
              : 'hover:shadow-md hover:border-gray-200'
          "
        >
          <button
            @click="toggleQuestion(3)"
            class="w-full flex items-start justify-between gap-4 p-6 text-left"
          >
            <div class="flex items-start gap-4 flex-1">
              <div
                class="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center shrink-0 transition-all duration-200"
                :class="openQuestion === 3 ? 'bg-emerald-100' : ''"
              >
                <Number3Square class="w-6 h-6 text-emerald-600" />
              </div>
              <div class="flex-1">
                <h3 class="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
                  ¿Qué pasa después de los 15 días gratis?
                </h3>
                <div
                  v-show="openQuestion === 3"
                  class="mt-3 text-base text-gray-600 leading-relaxed"
                >
                  <p>
                    Puedes seguir con el
                    <span class="font-medium text-emerald-700"
                      >plan gratuito</span
                    >
                    o elegir uno con más funciones. Sin sorpresas, sin cargos
                    automáticos.
                  </p>
                </div>
              </div>
            </div>
            <div class="shrink-0 mt-1">
              <NavArrowDown
                class="w-6 h-6 text-gray-400 transition-transform duration-200"
                :class="openQuestion === 3 ? 'rotate-180' : ''"
              />
            </div>
          </button>
        </div>

        <!-- Pregunta 4: ¿Mis datos están seguros? -->
        <div
          class="bg-white rounded-xl shadow-sm border border-gray-100 transition-all duration-200"
          :class="
            openQuestion === 4
              ? 'shadow-md border-purple-200'
              : 'hover:shadow-md hover:border-gray-200'
          "
        >
          <button
            @click="toggleQuestion(4)"
            class="w-full flex items-start justify-between gap-4 p-6 text-left"
          >
            <div class="flex items-start gap-4 flex-1">
              <div
                class="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center shrink-0 transition-all duration-200"
                :class="openQuestion === 4 ? 'bg-purple-100' : ''"
              >
                <Number4Square class="w-6 h-6 text-purple-600" />
              </div>
              <div class="flex-1">
                <h3 class="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
                  ¿Mis datos están seguros?
                </h3>
                <div
                  v-show="openQuestion === 4"
                  class="mt-3 text-base text-gray-600 leading-relaxed"
                >
                  <p>
                    <strong class="text-gray-900">Totalmente.</strong> Usamos la
                    tecnología de seguridad de
                    <span class="font-medium text-purple-700"
                      >Firebase de Google</span
                    >. Tus datos están encriptados y protegidos.
                  </p>
                </div>
              </div>
            </div>
            <div class="shrink-0 mt-1">
              <NavArrowDown
                class="w-6 h-6 text-gray-400 transition-transform duration-200"
                :class="openQuestion === 4 ? 'rotate-180' : ''"
              />
            </div>
          </button>
        </div>
      </div>

      <!-- Card destacada con ayuda adicional -->
      <div
        class="bg-gradient-to-br from-orange-50 to-purple-50 rounded-xl shadow-sm border border-orange-100 p-8 mb-8 transition-all duration-200 hover:shadow-md"
      >
        <div class="text-center">
          <div class="flex justify-center mb-4">
            <div
              class="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm"
            >
              <MessageText class="w-8 h-8 text-orange-600" />
            </div>
          </div>
          <h3 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            ¿Todavía tienes preguntas?
          </h3>
          <p class="text-base sm:text-lg text-gray-700 mb-6">
            Nuestro equipo está listo para ayudarte personalmente.
          </p>

          <!-- CTA contextual: WhatsApp -->
          <a
            href="https://wa.me/51YOUR_PHONE_NUMBER?text=Hola,%20tengo%20algunas%20preguntas%20sobre%20WALA"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-3 bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:from-green-600 hover:to-green-700"
          >
            <Facebook class="w-6 h-6" />
            <span>Habla con nosotros por WhatsApp</span>
          </a>
          <p class="text-sm text-gray-500 mt-4">
            Respuesta rápida en horario de oficina
          </p>
        </div>
      </div>

      <!-- Sección de confianza adicional -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center transition-all duration-200 hover:shadow-md hover:border-orange-200"
        >
          <div
            class="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-3"
          >
            <Check class="w-6 h-6 text-orange-600" />
          </div>
          <p class="text-sm font-semibold text-gray-900">Sin contrato</p>
          <p class="text-xs text-gray-500 mt-1">Cancela cuando quieras</p>
        </div>

        <div
          class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center transition-all duration-200 hover:shadow-md hover:border-blue-200"
        >
          <div
            class="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3"
          >
            <Shield class="w-6 h-6 text-blue-600" />
          </div>
          <p class="text-sm font-semibold text-gray-900">Datos protegidos</p>
          <p class="text-xs text-gray-500 mt-1">Tecnología Google</p>
        </div>

        <div
          class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center transition-all duration-200 hover:shadow-md hover:border-emerald-200"
        >
          <div
            class="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3"
          >
            <Heart class="w-6 h-6 text-emerald-600" />
          </div>
          <p class="text-sm font-semibold text-gray-900">Plan gratuito</p>
          <p class="text-xs text-gray-500 mt-1">Siempre disponible</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";
import {
  MessageText,
  Facebook,
  Check,
  Shield,
  Heart,
  NavArrowDown,
  Number1Square,
  Number2Square,
  Number3Square,
  Number4Square,
} from "@iconoir/vue";

// Estado del accordion
const openQuestion = ref(null);

// Toggle de preguntas
const toggleQuestion = (questionNumber) => {
  if (openQuestion.value === questionNumber) {
    openQuestion.value = null;
  } else {
    openQuestion.value = questionNumber;
  }
};
</script>

<style scoped>
/* Estilos coherentes con Hero, Pain, Solution, Funcionalidades, PruebaSocial y HistorialRecords */

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

/* Aplicar animación escalonada a las preguntas */
.space-y-4 > div:nth-child(1) {
  animation: fadeInUp 0.5s ease-out 0.1s backwards;
}

.space-y-4 > div:nth-child(2) {
  animation: fadeInUp 0.5s ease-out 0.2s backwards;
}

.space-y-4 > div:nth-child(3) {
  animation: fadeInUp 0.5s ease-out 0.3s backwards;
}

.space-y-4 > div:nth-child(4) {
  animation: fadeInUp 0.5s ease-out 0.4s backwards;
}

/* Transiciones suaves */
button,
a,
.hover\:shadow-md {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

button:active,
a:active {
  transform: translateY(0);
}

/* Efecto smooth en el accordion */
.space-y-4 > div > button > div > div > div {
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive adjustments */
@media (max-width: 640px) {
  h2 {
    line-height: 1.2;
  }
}
</style>
