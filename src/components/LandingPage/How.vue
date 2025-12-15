<template>
  <section
    id="how-section"
    class="py-20 md:py-32 px-4 relative overflow-hidden bg-white"
  >
    <!-- Sombras sutiles de fondo -->
    <div
      class="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10"
    >
      <div
        class="absolute top-1/3 left-1/3 w-96 h-96 bg-blue-50 rounded-full filter blur-3xl opacity-10"
      ></div>
      <div
        class="absolute bottom-1/3 right-1/3 w-96 h-96 bg-purple-50 rounded-full filter blur-3xl opacity-10"
      ></div>
    </div>

    <div class="max-w-6xl mx-auto">
      <!-- Título -->
      <h2
        class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-gray-900 font-extrabold leading-tight tracking-tight text-center mb-20 md:mb-28"
      >
        ¿Cómo funciona <span class="text-blue-600">WALA</span>?
      </h2>

      <!-- 3 Pasos -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-10 mb-20">
        <!-- Paso 1: Registra -->
        <div class="text-center space-y-8">
          <!-- Número -->
          <div class="flex justify-center">
            <div
              class="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center border-2 border-emerald-200"
            >
              <span class="text-xl font-bold text-emerald-700">1</span>
            </div>
          </div>

          <!-- Visual conceptual: Check / Registro -->
          <div
            class="bg-gradient-to-br from-emerald-50/80 to-emerald-50/40 rounded-xl p-6 mx-auto max-w-xs border border-emerald-100"
          >
            <div class="flex items-center justify-between mb-4">
              <div class="text-left">
                <p class="text-xs text-emerald-600 font-medium mb-1">Hoy</p>
                <p class="text-sm font-semibold text-gray-700">Ingreso</p>
              </div>
              <p class="text-xl font-bold text-emerald-700">S/ 450</p>
            </div>
            <div class="flex items-center justify-between">
              <div class="text-left">
                <p class="text-xs text-orange-600 font-medium mb-1">Hoy</p>
                <p class="text-sm font-semibold text-gray-700">Gasto</p>
              </div>
              <p class="text-xl font-bold text-orange-700">S/ 120</p>
            </div>
            <div class="mt-4 flex justify-center">
              <svg
                class="w-8 h-8 text-emerald-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          <!-- Texto del paso -->
          <div class="space-y-2">
            <h3
              class="text-xl md:text-2xl font-bold text-gray-900 leading-snug"
            >
              Registra tus ingresos y gastos cada día
            </h3>
          </div>
        </div>

        <!-- Paso 2: Visualiza -->
        <div class="text-center space-y-8">
          <!-- Número -->
          <div class="flex justify-center">
            <div
              class="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center border-2 border-blue-200"
            >
              <span class="text-xl font-bold text-blue-700">2</span>
            </div>
          </div>

          <!-- Visual conceptual: Mini gráfico abstracto -->
          <div
            class="bg-gradient-to-br from-blue-50/80 to-blue-50/40 rounded-xl p-6 mx-auto max-w-xs border border-blue-100"
          >
            <div class="text-center mb-4">
              <p class="text-xs text-blue-600 font-medium mb-2">Resultado</p>
              <div
                class="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-lg"
              >
                <svg
                  class="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span class="text-lg font-bold text-blue-700">Ganas</span>
              </div>
            </div>
            <!-- Mini barra simple -->
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <div class="flex-1 bg-blue-200 rounded-full h-2">
                  <div
                    class="bg-emerald-500 h-2 rounded-full"
                    style="width: 70%"
                  ></div>
                </div>
                <span class="text-xs text-gray-600">Ingresos</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="flex-1 bg-blue-200 rounded-full h-2">
                  <div
                    class="bg-orange-500 h-2 rounded-full"
                    style="width: 40%"
                  ></div>
                </div>
                <span class="text-xs text-gray-600">Gastos</span>
              </div>
            </div>
          </div>

          <!-- Texto del paso -->
          <div class="space-y-2">
            <h3
              class="text-xl md:text-2xl font-bold text-gray-900 leading-snug"
            >
              Visualiza si estás ganando o perdiendo
            </h3>
          </div>
        </div>

        <!-- Paso 3: Mantén el hábito -->
        <div class="text-center space-y-8">
          <!-- Número -->
          <div class="flex justify-center">
            <div
              class="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center border-2 border-purple-200"
            >
              <span class="text-xl font-bold text-purple-700">3</span>
            </div>
          </div>

          <!-- Visual conceptual: Racha / Progreso -->
          <div
            class="bg-gradient-to-br from-purple-50/80 to-purple-50/40 rounded-xl p-6 mx-auto max-w-xs border border-purple-100"
          >
            <div class="text-center mb-4">
              <p class="text-xs text-purple-600 font-medium mb-2">Tu racha</p>
              <div class="flex items-center justify-center gap-2">
                <svg
                  class="w-5 h-5 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <p class="text-2xl font-bold text-purple-700">Día 12</p>
              </div>
            </div>
            <!-- Barra de progreso -->
            <div class="mt-4">
              <div class="bg-purple-200/50 rounded-full h-2 overflow-hidden">
                <div
                  class="bg-gradient-to-r from-purple-400 to-purple-600 h-full rounded-full transition-all duration-500"
                  style="width: 40%"
                ></div>
              </div>
              <p class="text-xs text-purple-600 mt-2 font-medium">
                12 / 30 días
              </p>
            </div>
          </div>

          <!-- Texto del paso -->
          <div class="space-y-2">
            <h3
              class="text-xl md:text-2xl font-bold text-gray-900 leading-snug"
            >
              Mantén el hábito y entiende tu negocio con el tiempo
            </h3>
          </div>
        </div>
      </div>

      <!-- Frase de cierre -->
      <div class="text-center pt-4">
        <div
          class="inline-flex items-center gap-3 px-5 py-3 bg-blue-50/60 rounded-xl border border-blue-100/50"
        >
          <svg
            class="w-4 h-4 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <p class="text-base md:text-lg font-medium text-gray-700">
            Pequeños registros diarios generan claridad real.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
// No se necesitan imports adicionales si usamos SVG inline
</script>

<style scoped>
/* Estilos coherentes con Hero y Solution */

/* Animación de entrada para los pasos */
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

/* Responsive adjustments */
@media (max-width: 640px) {
  h2 {
    line-height: 1.1;
  }
}
</style>
