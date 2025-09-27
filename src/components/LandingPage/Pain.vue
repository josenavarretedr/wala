<template>
  <section
    id="pain-section"
    class="py-20 px-4 bg-gradient-to-br from-slate-50 via-gray-50 to-orange-50/30 relative overflow-hidden"
  >
    <!-- Elementos decorativos de fondo -->
    <div class="absolute inset-0 opacity-5">
      <div class="absolute top-20 left-10 text-9xl">📝</div>
      <div class="absolute top-40 right-16 text-7xl">💸</div>
      <div class="absolute bottom-32 left-20 text-8xl">📦</div>
      <div class="absolute bottom-20 right-10 text-6xl">❓</div>
    </div>

    <div class="max-w-7xl mx-auto relative z-10">
      <!-- Título Visual -->
      <div class="text-center mb-24">
        <div class="mb-8">
          <span class="text-6xl">🤔</span>
        </div>
        <h2
          class="text-5xl md:text-6xl lg:text-7xl font-extralight text-slate-900 mb-8 tracking-tight"
        >
          Tu día a día como emprendedor
        </h2>
        <div
          class="w-24 h-1 bg-gradient-to-r from-orange-500 to-red-500 mx-auto rounded-full"
        ></div>
      </div>

      <!-- Grid Mobile-First de Problemas -->
      <div
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
      >
        <!-- Problema 1 -->
        <div class="pain-card group">
          <div
            class="bg-white/80 backdrop-blur-sm rounded-3xl p-6 md:p-7 lg:p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/50 hover:border-orange-200 relative overflow-hidden h-full flex flex-col justify-center min-h-[280px] md:min-h-[300px] lg:min-h-[320px] xl:min-h-[340px]"
          >
            <!-- Icono grande -->
            <div class="text-center mb-4 md:mb-6">
              <div
                class="text-6xl md:text-7xl lg:text-8xl mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300"
              >
                <!-- <Book
                class="w-16 h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 xl:w-24 xl:h-24 mx-auto text-orange-500 group-hover:scale-110 transition-transform duration-300"
              /> -->
                📝
              </div>
              <div
                class="w-16 md:w-18 lg:w-20 h-1 bg-gradient-to-r from-orange-400 to-orange-600 mx-auto rounded-full"
              ></div>
            </div>
            <!-- Texto mobile-first optimizado -->
            <div class="text-center">
              <p
                class="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-light text-slate-800 leading-relaxed"
              >
                Anotás en<br />
                <span
                  class="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold text-slate-900"
                  >cuaderno</span
                ><br />
                <span
                  class="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light"
                  >+</span
                ><br />
                <span
                  class="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold text-green-600"
                  >WhatsApp</span
                >
              </p>
            </div>
          </div>
        </div>

        <!-- Problema 2 -->
        <div class="pain-card group">
          <div
            class="bg-white/80 backdrop-blur-sm rounded-3xl p-6 md:p-7 lg:p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/50 hover:border-red-200 relative overflow-hidden h-full flex flex-col justify-center min-h-[280px] md:min-h-[300px] lg:min-h-[320px] xl:min-h-[340px]"
          >
            <!-- Icono grande -->
            <div class="text-center mb-4 md:mb-6">
              <div
                class="text-6xl md:text-7xl lg:text-8xl mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300"
              >
                💸
              </div>
              <div
                class="w-16 md:w-18 lg:w-20 h-1 bg-gradient-to-r from-red-400 to-red-600 mx-auto rounded-full"
              ></div>
            </div>
            <!-- Texto mobile-first optimizado -->
            <div class="text-center">
              <p
                class="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-light text-slate-800 leading-relaxed"
              >
                <span
                  class="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold text-red-600"
                  >¿Ganaste?</span
                ><br />
                <span
                  class="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold text-red-600"
                  >¿Perdiste?</span
                ><br />
                <span
                  class="text-lg md:text-xl lg:text-2xl xl:text-3xl text-slate-600"
                  >🤷‍♂️ Ni idea</span
                >
              </p>
            </div>
          </div>
        </div>

        <!-- Problema 3 -->
        <div class="pain-card group">
          <div
            class="bg-white/80 backdrop-blur-sm rounded-3xl p-6 md:p-7 lg:p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/50 hover:border-blue-200 relative overflow-hidden h-full flex flex-col justify-center min-h-[280px] md:min-h-[300px] lg:min-h-[320px] xl:min-h-[340px]"
          >
            <!-- Icono grande -->
            <div class="text-center mb-4 md:mb-6">
              <div
                class="text-6xl md:text-7xl lg:text-8xl mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300"
              >
                📦
              </div>
              <div
                class="w-16 md:w-18 lg:w-20 h-1 bg-gradient-to-r from-blue-400 to-blue-600 mx-auto rounded-full"
              ></div>
            </div>
            <!-- Texto mobile-first optimizado -->
            <div class="text-center">
              <p
                class="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-light text-slate-800 leading-relaxed"
              >
                Stock:
                <span
                  class="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-red-600"
                  >CERO</span
                ><br />
                Clientes:
                <span
                  class="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-green-600"
                  >MUCHOS</span
                ><br />
                <span
                  class="text-lg md:text-xl lg:text-2xl xl:text-3xl text-slate-600"
                  >😩 Típico</span
                >
              </p>
            </div>
          </div>
        </div>

        <!-- Problema 4 -->
        <div class="pain-card group">
          <div
            class="bg-white/80 backdrop-blur-sm rounded-3xl p-6 md:p-7 lg:p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/50 hover:border-purple-200 relative overflow-hidden h-full flex flex-col justify-center min-h-[280px] md:min-h-[300px] lg:min-h-[320px] xl:min-h-[340px]"
          >
            <!-- Icono grande -->
            <div class="text-center mb-4 md:mb-6">
              <div
                class="text-6xl md:text-7xl lg:text-8xl mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300"
              >
                🎯
              </div>
              <div
                class="w-16 md:w-18 lg:w-20 h-1 bg-gradient-to-r from-purple-400 to-purple-600 mx-auto rounded-full"
              ></div>
            </div>
            <!-- Texto mobile-first optimizado -->
            <div class="text-center">
              <p
                class="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-light text-slate-800 leading-relaxed"
              >
                Decidís
                <span
                  class="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold text-slate-900"
                  >a ciegas</span
                ><br />
                <span
                  class="text-lg md:text-xl lg:text-2xl xl:text-3xl text-slate-600"
                  >🙏 Rezando que funcione</span
                >
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Transición y Propuesta de Valor -->
      <div class="mt-32">
        <!-- Separador elegante -->
        <div class="flex items-center justify-center mb-16">
          <div
            class="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"
          ></div>
          <div class="px-6 text-4xl">💡</div>
          <div
            class="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"
          ></div>
        </div>

        <!-- Mensaje principal mejorado -->
        <div class="text-center max-w-4xl mx-auto">
          <h3
            class="text-4xl md:text-5xl lg:text-6xl font-light text-slate-900 mb-8 leading-tight"
          >
            Si te reconociste en
            <span class="font-medium text-orange-600">alguna</span>,
            <br class="hidden md:block" />
            no estás <span class="font-medium text-slate-900">solo</span>
          </h3>

          <div
            class="bg-gradient-to-r from-orange-50 to-red-50 rounded-3xl p-12 mb-12 border border-orange-100"
          >
            <p
              class="text-2xl md:text-3xl font-light text-slate-800 leading-relaxed mb-8"
            >
              Cada emprendedor pasa por esto.<br />
              La diferencia está en
              <span class="font-medium text-orange-600">cómo salis</span> de
              ahí.
            </p>

            <!-- Stats visuales -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div class="text-center">
                <div class="text-4xl font-bold text-red-600 mb-2">85%</div>
                <p class="text-sm text-slate-600">
                  De emprendedores no saben sus números reales
                </p>
              </div>
              <div class="text-center">
                <div class="text-4xl font-bold text-orange-600 mb-2">70%</div>
                <p class="text-sm text-slate-600">
                  Pierden ventas por falta de stock
                </p>
              </div>
              <div class="text-center">
                <div class="text-4xl font-bold text-blue-600 mb-2">90%</div>
                <p class="text-sm text-slate-600">Toman decisiones sin datos</p>
              </div>
            </div>
          </div>

          <!-- Call to action sutil -->
          <div class="text-center">
            <p class="text-xl md:text-2xl font-light text-slate-700 mb-6">
              ¿Qué pasaría si tuvieras un
              <span class="font-medium text-orange-600">copiloto</span> que te
              ayude?
            </p>
            <div class="text-6xl mb-4">🚀</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
// Componente minimalista sin efectos

import { Book } from "@iconoir/vue";
</script>

<style scoped>
/* Estilos visuales modernos */

.pain-card {
  opacity: 0;
  transform: translateY(30px) scale(0.95);
  animation: cardAppear 0.8s ease-out forwards;
}

.pain-card:nth-child(1) {
  animation-delay: 0.1s;
}
.pain-card:nth-child(2) {
  animation-delay: 0.2s;
}
.pain-card:nth-child(3) {
  animation-delay: 0.3s;
}
.pain-card:nth-child(4) {
  animation-delay: 0.4s;
}

@keyframes cardAppear {
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Efectos hover avanzados */
.pain-card:hover {
  transform: translateY(-8px) scale(1.02);
}

.pain-card:hover .bg-white\/80 {
  background: rgba(255, 255, 255, 0.95);
}

/* Glassmorphism effect */
.backdrop-blur-sm {
  backdrop-filter: blur(12px);
}

/* Mejora de iconos */
.pain-card .text-7xl {
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

/* Estilos Mobile-First optimizados */

/* Base mobile - perfecto para móviles */
.pain-card > div {
  padding: 1.5rem;
  min-height: 280px;
}

/* Tablet y superior */
@media (min-width: 768px) {
  .pain-card > div {
    padding: 1.75rem;
    min-height: 300px;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .pain-card > div {
    padding: 2rem;
    min-height: 320px;
  }
}

/* Desktop grande */
@media (min-width: 1280px) {
  .pain-card > div {
    min-height: 340px;
  }
} /* Animación del gradiente de fondo */
@keyframes gradientShift {
  0%,
  100% {
    transform: translateX(0) translateY(0);
  }
  25% {
    transform: translateX(5px) translateY(-5px);
  }
  50% {
    transform: translateX(-5px) translateY(5px);
  }
  75% {
    transform: translateX(-3px) translateY(-3px);
  }
}

.absolute.opacity-5 {
  animation: gradientShift 10s ease-in-out infinite;
}
</style>
