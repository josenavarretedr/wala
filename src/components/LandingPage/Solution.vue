<template>
  <section
    id="solution-section"
    class="py-16 sm:py-20 px-4 bg-gray-50 relative overflow-hidden"
  >
    <!-- Sombras sutiles de fondo (coherente con Hero y Pain) -->
    <div
      class="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10"
    >
      <div
        class="absolute top-0 left-0 w-80 h-80 bg-blue-50 rounded-full filter blur-3xl opacity-20"
      ></div>
      <div
        class="absolute bottom-0 right-0 w-80 h-80 bg-orange-50 rounded-full filter blur-3xl opacity-20"
      ></div>
    </div>

    <div class="max-w-6xl mx-auto">
      <!-- Contenedor principal tipo card (estilo HistorialRecords) -->
      <div
        class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8 md:p-12 transition-all duration-200 hover:shadow-md hover:border-gray-200 mb-8"
      >
        <!-- Badge superior -->
        <div class="flex justify-center mb-6">
          <div
            class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700"
          >
            <span class="text-2xl">💡</span>
            <span class="text-sm font-medium">La solución</span>
          </div>
        </div>

        <!-- Título Principal -->
        <h2
          class="text-3xl sm:text-4xl md:text-5xl text-gray-900 mb-6 text-center font-bold leading-tight tracking-tight"
        >
          Con <span class="text-orange-600">WALA</span>, todo está en
          <span class="text-blue-600">un solo lugar</span>
        </h2>

        <!-- Subtítulo -->
        <p
          class="text-lg sm:text-xl md:text-2xl text-gray-600 mb-8 text-center font-normal leading-relaxed max-w-4xl mx-auto"
        >
          Registra tus ventas y gastos, controla tu inventario y recibe
          <span class="font-medium text-gray-800">recomendaciones simples</span>
          para mejorar tu negocio.
        </p>

        <!-- Separador decorativo -->
        <div class="flex justify-center mb-8">
          <div
            class="w-32 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"
          ></div>
        </div>

        <!-- Copy complementario en card destacado -->
        <div
          class="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-3xl mx-auto"
        >
          <div class="flex items-start gap-4">
            <div
              class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-1"
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
            </div>
            <div>
              <p class="text-base sm:text-lg text-gray-700 leading-relaxed">
                <span class="font-medium text-blue-800"
                  >No necesitas saber de finanzas:</span
                >
                WALA traduce tus números en claridad.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Grid de beneficios con íconos (estilo HistorialRecords) -->
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8"
      >
        <!-- Beneficio 1: Finanzas -->
        <div
          class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md hover:border-blue-200"
        >
          <div class="text-center">
            <div class="flex justify-center mb-4">
              <div
                class="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center"
              >
                <Cash class="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">
              Control financiero
            </h3>
            <p class="text-sm text-gray-600 leading-relaxed">
              Ventas, gastos y caja diaria automática en tiempo real
            </p>
          </div>
        </div>

        <!-- Beneficio 2: Inventario -->
        <div
          class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md hover:border-emerald-200"
        >
          <div class="text-center">
            <div class="flex justify-center mb-4">
              <div
                class="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center"
              >
                <Package class="w-8 h-8 text-emerald-600" />
              </div>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">
              Inventario inteligente
            </h3>
            <p class="text-sm text-gray-600 leading-relaxed">
              Alertas automáticas antes de quedarte sin stock
            </p>
          </div>
        </div>

        <!-- Beneficio 3: Recomendaciones -->
        <div
          class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md hover:border-purple-200"
        >
          <div class="text-center">
            <div class="flex justify-center mb-4">
              <div
                class="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center"
              >
                <BrainResearch class="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">
              Recomendaciones IA
            </h3>
            <p class="text-sm text-gray-600 leading-relaxed">
              Consejos personalizados para mejorar tu negocio
            </p>
          </div>
        </div>
      </div>

      <!-- Mockup/Visual del dashboard -->
      <div
        class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8 overflow-hidden transition-all duration-200 hover:shadow-md hover:border-gray-200"
      >
        <div
          class="aspect-video bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50 rounded-lg flex items-center justify-center relative overflow-hidden"
        >
          <!-- Iconos flotantes ilustrativos -->
          <div class="absolute inset-0 overflow-hidden">
            <!-- Icono flotante 1 - Finanzas -->
            <div
              class="absolute top-8 left-8 floating-icon"
              style="animation-delay: 0s"
            >
              <div
                class="w-12 h-12 bg-white rounded-lg shadow-md flex items-center justify-center"
              >
                <Cash class="w-6 h-6 text-blue-600" />
              </div>
            </div>

            <!-- Icono flotante 2 - Inventario -->
            <div
              class="absolute top-12 right-12 floating-icon"
              style="animation-delay: 0.5s"
            >
              <div
                class="w-12 h-12 bg-white rounded-lg shadow-md flex items-center justify-center"
              >
                <Package class="w-6 h-6 text-emerald-600" />
              </div>
            </div>

            <!-- Icono flotante 3 - Clientes -->
            <div
              class="absolute bottom-12 left-16 floating-icon"
              style="animation-delay: 1s"
            >
              <div
                class="w-12 h-12 bg-white rounded-lg shadow-md flex items-center justify-center"
              >
                <User class="w-6 h-6 text-purple-600" />
              </div>
            </div>

            <!-- Icono flotante 4 - Reportes -->
            <div
              class="absolute bottom-8 right-8 floating-icon"
              style="animation-delay: 1.5s"
            >
              <div
                class="w-12 h-12 bg-white rounded-lg shadow-md flex items-center justify-center"
              >
                <Reports class="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <!-- Mensaje central -->
          <div class="text-center z-10 px-4 relative">
            <div class="text-6xl mb-4">📱</div>
            <p class="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
              Dashboard limpio y simple
            </p>
            <p class="text-sm sm:text-base text-gray-600">
              Todo lo que necesitas, nada de lo que no
            </p>
          </div>
        </div>
      </div>

      <!-- CTA principal -->
      <div class="text-center">
        <button
          class="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-orange-600 text-white px-12 py-4 rounded-xl font-bold text-lg shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:from-orange-600 hover:to-orange-700"
          @click="$router.push({ name: 'Login' })"
        >
          🔸 Probar WALA gratis
        </button>
        <p class="text-sm text-gray-500 mt-4">
          Sin tarjeta. Sin compromiso. Empieza hoy mismo.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { Cash, Package, BrainResearch, User, Reports } from "@iconoir/vue";
</script>

<style scoped>
/* Estilos coherentes con Hero, Pain y HistorialRecords */

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

/* Animación flotante para los iconos del mockup */
@keyframes floatSolution {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.floating-icon {
  animation: floatSolution 3s ease-in-out infinite;
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
