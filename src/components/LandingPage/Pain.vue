<template>
  <section
    id="pain-section"
    class="py-20 md:py-32 pb-32 md:pb-40 px-4 relative overflow-hidden bg-white"
  >
    <!-- Sombras sutiles de fondo (coherente con Hero) -->
    <div
      class="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10"
    >
      <div
        class="absolute top-0 right-0 w-96 h-96 bg-red-50 rounded-full filter blur-3xl opacity-20"
      ></div>
      <div
        class="absolute bottom-0 left-0 w-96 h-96 bg-orange-50 rounded-full filter blur-3xl opacity-20"
      ></div>
    </div>

    <div class="max-w-7xl mx-auto">
      <!-- Layout: Mobile = columna centrada | Desktop = 2 columnas -->
      <div
        class="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 lg:gap-20 items-center"
      >
        <!-- COLUMNA IZQUIERDA: Contenido de texto -->
        <div class="text-center md:text-left space-y-8 md:space-y-10">
          <!-- Badge superior -->
          <div class="flex justify-center md:justify-start mb-2">
            <div
              class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-700"
            >
              <WarningCircle class="w-3.5 h-3.5" />
              <span class="text-xs font-medium">El problema</span>
            </div>
          </div>

          <!-- Título Principal (H2) -->
          <h2
            class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-gray-900 font-extrabold leading-[1.1] tracking-tight"
          >
            Trabajas todos los días, pero…
            <span class="text-orange-500">¿tienes claridad?</span>
          </h2>

          <!-- Texto principal -->
          <div
            class="space-y-6 text-lg sm:text-xl md:text-2xl text-gray-600 leading-relaxed max-w-2xl mx-auto md:mx-0"
          >
            <p>
              Muchos emprendedores venden a diario, pero
              <span class="font-semibold text-gray-800"
                >no saben con certeza</span
              >
              cuánto ganan, en qué se va su dinero o si su negocio realmente
              está creciendo.
            </p>
            <p
              class="text-xl sm:text-2xl md:text-3xl font-semibold text-orange-600"
            >
              Sin claridad, tomar decisiones se vuelve difícil.
            </p>
          </div>
        </div>

        <!-- COLUMNA DERECHA: Visual UI abstracto (solo ≥ md) -->
        <div class="hidden md:block relative">
          <div class="relative w-full max-w-lg mx-auto">
            <!-- Card: Caos financiero -->
            <div
              class="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 animate-floatSlow"
              style="animation-delay: 0s"
            >
              <!-- Iconos flotantes representando el caos -->
              <div
                class="relative h-80 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 rounded-xl overflow-hidden"
              >
                <!-- Elementos de caos posicionados -->
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="text-center z-10">
                    <div class="text-7xl mb-4 animate-shake">😵‍💫</div>
                    <p class="text-2xl font-bold text-gray-800">
                      ¿Dónde está todo?
                    </p>
                  </div>
                </div>

                <!-- Elementos flotantes alrededor -->
                <div
                  class="absolute top-4 left-4 text-3xl opacity-40 animate-floatItem"
                  style="animation-delay: 0s"
                >
                  📝
                </div>
                <div
                  class="absolute top-8 right-8 text-4xl opacity-30 animate-floatItem"
                  style="animation-delay: 0.5s"
                >
                  💸
                </div>
                <div
                  class="absolute bottom-6 left-12 text-3xl opacity-35 animate-floatItem"
                  style="animation-delay: 1s"
                >
                  📊
                </div>
                <div
                  class="absolute bottom-12 right-6 text-3xl opacity-40 animate-floatItem"
                  style="animation-delay: 1.5s"
                >
                  💬
                </div>
                <div
                  class="absolute top-1/3 left-8 text-2xl opacity-30 animate-floatItem"
                  style="animation-delay: 0.8s"
                >
                  📄
                </div>
                <div
                  class="absolute top-1/2 right-4 text-2xl opacity-35 animate-floatItem"
                  style="animation-delay: 1.2s"
                >
                  ❓
                </div>
                <div
                  class="absolute bottom-1/4 left-1/4 text-3xl opacity-25 animate-floatItem"
                  style="animation-delay: 0.3s"
                >
                  💰
                </div>
                <div
                  class="absolute top-1/4 right-1/4 text-2xl opacity-30 animate-floatItem"
                  style="animation-delay: 1.8s"
                >
                  ⏰
                </div>
              </div>

              <!-- Badges de problemas -->
              <div class="mt-6 flex flex-wrap gap-2 justify-center">
                <span
                  class="px-3 py-1.5 bg-orange-50 text-orange-700 text-sm font-medium rounded-lg border border-orange-200"
                >
                  Cuadernos
                </span>
                <span
                  class="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-lg border border-emerald-200"
                >
                  Excel
                </span>
                <span
                  class="px-3 py-1.5 bg-green-50 text-green-700 text-sm font-medium rounded-lg border border-green-200"
                >
                  WhatsApp
                </span>
                <span
                  class="px-3 py-1.5 bg-purple-50 text-purple-700 text-sm font-medium rounded-lg border border-purple-200"
                >
                  Papeles
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useRouter } from "vue-router";
import {
  Reports,
  BookStack,
  Facebook,
  Page,
  WarningCircle,
} from "@iconoir/vue";

const router = useRouter();
</script>

<style scoped>
/* Estilos coherentes con Hero */

/* Animación flotante suave para la card principal */
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

/* Animación para items flotantes */
@keyframes floatItem {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-15px) rotate(5deg);
  }
}

.animate-floatItem {
  animation: floatItem 3s ease-in-out infinite;
}

/* Transiciones suaves */
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
</style>
