<template>
  <section
    id="pain-section"
    class="py-16 sm:py-20 px-4 relative overflow-hidden"
  >
    <!-- Sombras sutiles de fondo (coherente con Hero) -->
    <div
      class="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10"
    >
      <div
        class="absolute top-0 right-0 w-80 h-80 bg-red-50 rounded-full filter blur-3xl opacity-20"
      ></div>
      <div
        class="absolute bottom-0 left-0 w-80 h-80 bg-orange-50 rounded-full filter blur-3xl opacity-20"
      ></div>
    </div>

    <div class="max-w-6xl mx-auto">
      <!-- Contenedor principal tipo card (estilo HistorialRecords) -->
      <div
        class="bg-white rounded-xl p-6 sm:p-8 md:p-12 transition-all duration-200 mb-8"
      >
        <!-- Badge superior -->
        <div class="flex justify-center mb-6">
          <div
            class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-200 text-red-700"
          >
            <span class="text-2xl">💭</span>
            <span class="text-sm font-medium">El problema</span>
          </div>
        </div>

        <!-- Título Principal -->
        <h2
          class="text-3xl sm:text-4xl md:text-5xl text-gray-900 mb-6 text-center font-bold leading-tight tracking-tight"
        >
          ¿Te pasa que
          <span class="text-orange-600">trabajas mucho</span>, pero no sabes si
          <span class="text-red-600">ganas o pierdes</span>?
        </h2>

        <!-- Subtítulo -->
        <p
          class="text-lg sm:text-xl md:text-2xl text-gray-600 mb-8 text-center font-normal leading-relaxed max-w-4xl mx-auto"
        >
          Entre cuadernos, Excel y mensajes de WhatsApp, tu negocio se llena de
          <span class="font-medium text-gray-800">caos</span>. WALA nació para
          darte <span class="font-medium text-blue-600">claridad</span>.
        </p>

        <!-- Separador decorativo -->
        <div class="flex justify-center mb-8">
          <div
            class="w-32 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"
          ></div>
        </div>

        <!-- Copy complementario en card destacado -->
        <div
          class="bg-orange-50 border border-orange-200 rounded-lg p-6 max-w-3xl mx-auto"
        >
          <div class="flex items-start gap-4">
            <div
              class="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center shrink-0 mt-1"
            >
              <svg
                class="w-5 h-5 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p class="text-base sm:text-lg text-gray-700 leading-relaxed">
                <span class="font-medium text-orange-800"
                  >Sabemos lo que sientes.</span
                >
                Porque todos los días, miles de emprendedores como tú luchan por
                mantener su negocio a flote sin perder la calma.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Grid Mobile-First de Problemas Visuales (estilo HistorialRecords) -->
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8"
      >
        <!-- Problema 1: Cuadernos -->
        <div
          class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 transition-all duration-200 hover:shadow-md hover:border-orange-200"
        >
          <div class="text-center">
            <div class="flex justify-center mb-3">
              <BookStack class="w-12 h-12 text-orange-600" />
            </div>
            <div
              class="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200 mb-2"
            >
              <span>Cuadernos</span>
            </div>
            <p class="text-sm text-gray-600">Anotaciones desorganizadas</p>
          </div>
        </div>

        <!-- Problema 2: Excel -->
        <div
          class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 transition-all duration-200 hover:shadow-md hover:border-emerald-200"
        >
          <div class="text-center">
            <div class="flex justify-center mb-3">
              <Reports class="w-12 h-12 text-emerald-600" />
            </div>
            <div
              class="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2"
            >
              <span>Excel</span>
            </div>
            <p class="text-sm text-gray-600">Hojas complicadas</p>
          </div>
        </div>

        <!-- Problema 3: WhatsApp -->
        <div
          class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 transition-all duration-200 hover:shadow-md hover:border-green-200"
        >
          <div class="text-center">
            <div class="flex justify-center mb-3">
              <Facebook class="w-12 h-12 text-green-600" />
            </div>
            <div
              class="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200 mb-2"
            >
              <span>WhatsApp</span>
            </div>
            <p class="text-sm text-gray-600">Mensajes perdidos</p>
          </div>
        </div>

        <!-- Problema 4: Papeles -->
        <div
          class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 transition-all duration-200 hover:shadow-md hover:border-purple-200"
        >
          <div class="text-center">
            <div class="flex justify-center mb-3">
              <Page class="w-12 h-12 text-purple-600" />
            </div>
            <div
              class="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200 mb-2"
            >
              <span>Papeles</span>
            </div>
            <p class="text-sm text-gray-600">Boletas extraviadas</p>
          </div>
        </div>
      </div>

      <!-- Visual ilustrativo tipo "caos" -->
      <div
        class="bg-white rounded-xl shadow-sm p-8 mb-8 overflow-hidden transition-all duration-200"
      >
        <div
          ref="chaosContainer"
          class="aspect-video bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 rounded-lg flex items-center justify-center relative overflow-hidden"
        >
          <!-- Elementos flotantes generados dinámicamente -->
          <div class="absolute inset-0 overflow-hidden">
            <div
              v-for="(item, index) in chaosItems"
              :key="index"
              :class="[
                'absolute text-4xl chaos-item',
                item.size === 'large' ? 'text-5xl' : 'text-3xl',
              ]"
              :style="{
                top: item.top,
                left: item.left,
                right: item.right,
                bottom: item.bottom,
                transform: `rotate(${item.rotation}deg)`,
                opacity: item.opacity,
                animationDelay: `${item.delay}s`,
                animationDuration: `${item.duration}s`,
              }"
            >
              {{ item.emoji }}
            </div>
          </div>

          <!-- Mensaje central -->
          <div class="text-center z-10 px-4 relative">
            <div class="text-6xl mb-4 animate-shake">😵‍💫</div>
            <p class="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
              ¡CAOS TOTAL!
            </p>
            <p class="text-sm sm:text-base text-gray-600">
              Entre tantas herramientas, pierdes el control
            </p>
          </div>
        </div>
      </div>

      <!-- CTA contextual -->
      <div class="text-center">
        <button
          class="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-600 hover:to-blue-700"
          @click="scrollToSolution"
        >
          Descubre cómo WALA te ayuda
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { Reports, BookStack, Facebook, Page } from "@iconoir/vue";

const router = useRouter();

// Función para redirigir a login
const scrollToSolution = () => {
  router.push("/auth/login");
};

// Referencia al contenedor del caos
const chaosContainer = ref(null);

// Emojis que representan el caos
const emojis = [
  // Documentos y papeles
  "📱",
  "📝",
  "📊",
  "💬",
  "📄",
  "📌",
  "📋",
  "🗂️",
  "📑",
  "📇",
  "📃",
  "📜",

  // Herramientas de escritura
  "🖊️",
  "✏️",
  "🖍️",
  "🖌️",
  "✒️",
  "🖋️",

  // Símbolos de confusión y caos
  "❓",
  "❔",
  "❗",
  "❕",
  "⁉️",
  "‼️",
  "🤯",
  "😵",
  "🤷",
  "🤷‍♂️",
  "🤷‍♀️",

  // Dinero y finanzas
  "💸",
  "💰",
  "💵",
  "💴",
  "💶",
  "💷",
  "💳",
  "🪙",
  "📉",
  "📈",

  // Tiempo y calendario
  "⏰",
  "⏱️",
  "⏲️",
  "⌚",
  "📅",
  "📆",
  "🗓️",

  // Tecnología
  "💻",
  "⌨️",
  "🖥️",
  "📲",
  "☎️",
  "📞",
  "💿",

  // Símbolos de advertencia/estrés
  "⚠️",
  "🚨",
  "🔔",
  "🔕",
  "📣",
];

// Array de items del caos (se genera dinámicamente)
const chaosItems = ref([]);

// Generar posiciones aleatorias para los elementos del caos
const generateChaosItems = () => {
  const items = [];
  const numItems = 100; // Número de elementos para más caos

  for (let i = 0; i < numItems; i++) {
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];

    // Generar posiciones aleatorias cubriendo toda el área
    let top, left, right, bottom;
    let positionStyles = {};

    // Decidir si usar coordenadas top/bottom y left/right
    const useTop = Math.random() > 0.5;
    const useLeft = Math.random() > 0.5;

    if (useTop) {
      // Posición desde arriba (0-100%)
      top = Math.random() * 100;
      positionStyles.top = `${top}%`;
    } else {
      // Posición desde abajo (0-100%)
      bottom = Math.random() * 100;
      positionStyles.bottom = `${bottom}%`;
    }

    if (useLeft) {
      // Posición desde la izquierda (0-100%)
      left = Math.random() * 100;
      positionStyles.left = `${left}%`;
    } else {
      // Posición desde la derecha (0-100%)
      right = Math.random() * 100;
      positionStyles.right = `${right}%`;
    }

    // Evitar el área central (donde está el mensaje)
    // Si está muy cerca del centro (40-60% horizontal y 40-60% vertical), reposicionar
    const horizontalPos = useLeft ? left : 100 - right;
    const verticalPos = useTop ? top : 100 - bottom;

    // Si está en el centro, mover hacia los bordes
    if (
      horizontalPos > 35 &&
      horizontalPos < 65 &&
      verticalPos > 35 &&
      verticalPos < 65
    ) {
      // Empujar hacia el borde más cercano
      if (horizontalPos < 50) {
        positionStyles.left = `${Math.random() * 30}%`;
        delete positionStyles.right;
      } else {
        positionStyles.right = `${Math.random() * 30}%`;
        delete positionStyles.left;
      }

      if (verticalPos < 50) {
        positionStyles.top = `${Math.random() * 30}%`;
        delete positionStyles.bottom;
      } else {
        positionStyles.bottom = `${Math.random() * 30}%`;
        delete positionStyles.top;
      }
    }

    items.push({
      emoji,
      ...positionStyles,
      rotation: Math.random() * 60 - 30, // Entre -30 y 30 grados
      opacity: 0.2 + Math.random() * 0.3, // Entre 0.2 y 0.5
      size: Math.random() > 0.7 ? "large" : "normal",
      delay: Math.random() * 3, // Delay aleatorio hasta 3s
      duration: 2 + Math.random() * 2, // Duración entre 2 y 4s
    });
  }

  chaosItems.value = items;
};

// Generar items al montar el componente
onMounted(() => {
  generateChaosItems();
});
</script>

<style scoped>
/* Estilos coherentes con Hero y HistorialRecords */

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

/* Aplicar animación escalonada a las cards del grid */
.grid > div:nth-child(1) {
  animation: fadeInUp 0.5s ease-out 0.1s backwards;
}

.grid > div:nth-child(2) {
  animation: fadeInUp 0.5s ease-out 0.2s backwards;
}

.grid > div:nth-child(3) {
  animation: fadeInUp 0.5s ease-out 0.3s backwards;
}

.grid > div:nth-child(4) {
  animation: fadeInUp 0.5s ease-out 0.4s backwards;
}

/* Animación flotante sutil para elementos del caos */
@keyframes float {
  0%,
  100% {
    transform: translateY(0) rotate(var(--rotation));
  }
  50% {
    transform: translateY(-15px) rotate(calc(var(--rotation) + 10deg));
  }
}

.chaos-item {
  animation: float ease-in-out infinite;
  will-change: transform;
  filter: blur(0.5px);
  transition: all 0.3s ease;
}

.chaos-item:hover {
  filter: blur(0);
  opacity: 0.8 !important;
  transform: scale(1.2) rotate(0deg) !important;
}

/* Animación de temblor para el emoji central */
@keyframes shake {
  0%,
  100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(5deg);
  }
  75% {
    transform: rotate(-5deg);
  }
}

.animate-shake {
  animation: shake 2s ease-in-out infinite;
}

/* Hover effects consistentes */
button:active {
  transform: translateY(0);
}

/* Transiciones suaves */
button,
.hover\:shadow-md {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Responsive adjustments */
@media (max-width: 640px) {
  h2 {
    line-height: 1.2;
  }
}
</style>
