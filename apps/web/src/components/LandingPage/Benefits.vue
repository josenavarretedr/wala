<template>
  <section
    id="benefits-section"
    class="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 pb-16 relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-blue-50/30"
  >
    <!-- Sombras sutiles de fondo -->
    <div
      class="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10"
    >
      <div
        class="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-50 rounded-full filter blur-3xl opacity-10"
      ></div>
      <div
        class="absolute bottom-1/4 left-1/4 w-96 h-96 bg-orange-50 rounded-full filter blur-3xl opacity-10"
      ></div>
    </div>

    <div class="max-w-6xl mx-auto">
      <!-- Título y subtexto -->
      <div class="text-center mb-16 md:mb-20">
        <h2
          class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-gray-900 font-extrabold leading-tight mb-6"
        >
          Todo integrado. Todo
          <span class="text-purple-600">bajo control</span>.
        </h2>
        <p
          class="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed max-w-[680px] mx-auto"
        >
          WALA centraliza lo esencial de tu negocio para que trabajes con
          <span class="font-semibold text-gray-800">orden</span>,
          <span class="font-semibold text-gray-800">claridad</span> y
          <span class="font-semibold text-gray-800">tranquilidad</span>.
        </p>
      </div>

      <!-- Grid de 5 beneficios -->
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-10 lg:mb-12"
      >
        <!-- Beneficio 1: Menos desorden mental -->
        <div
          class="bg-white rounded-xl border border-emerald-100 p-6 lg:p-7 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
        >
          <div class="flex items-start gap-4">
            <div
              class="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0"
            >
              <svg
                class="w-6 h-6 text-emerald-600"
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
              <h3 class="text-base lg:text-lg font-semibold text-gray-900 mb-2">
                Menos desorden mental
              </h3>
              <p class="text-sm text-gray-600 leading-relaxed">
                No más cuadernos, Excel y mensajes sueltos.
              </p>
            </div>
          </div>
        </div>

        <!-- Beneficio 2: Decisiones con información real -->
        <div
          class="bg-white rounded-xl border border-blue-100 p-6 lg:p-7 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
        >
          <div class="flex items-start gap-4">
            <div
              class="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0"
            >
              <svg
                class="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <div>
              <h3 class="text-base lg:text-lg font-semibold text-gray-900 mb-2">
                Decisiones con información real
              </h3>
              <p class="text-sm text-gray-600 leading-relaxed">
                Sabes si ganas o pierdes antes de que sea tarde.
              </p>
            </div>
          </div>
        </div>

        <!-- Beneficio 3: Ahorro de tiempo diario -->
        <div
          class="bg-white rounded-xl border border-purple-100 p-6 lg:p-7 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
        >
          <div class="flex items-start gap-4">
            <div
              class="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center shrink-0"
            >
              <svg
                class="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 class="text-base lg:text-lg font-semibold text-gray-900 mb-2">
                Ahorro de tiempo diario
              </h3>
              <p class="text-sm text-gray-600 leading-relaxed">
                Registros rápidos, sin procesos complicados.
              </p>
            </div>
          </div>
        </div>

        <!-- Beneficio 4: Visión completa del negocio -->
        <div
          class="bg-white rounded-xl border border-orange-100 p-6 lg:p-7 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
        >
          <div class="flex items-start gap-4">
            <div
              class="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center shrink-0"
            >
              <svg
                class="w-6 h-6 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z"
                />
              </svg>
            </div>
            <div>
              <h3 class="text-base lg:text-lg font-semibold text-gray-900 mb-2">
                Visión completa del negocio
              </h3>
              <p class="text-sm text-gray-600 leading-relaxed">
                Todo en un solo lugar, sin cambiar de app.
              </p>
            </div>
          </div>
        </div>

        <!-- Beneficio 5: Aprendes mientras usas WALA -->
        <div
          class="bg-gradient-to-br from-yellow-50 to-yellow-50/50 rounded-xl border border-yellow-200 p-6 lg:p-8 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
        >
          <div class="flex items-start gap-4">
            <div
              class="w-12 h-12 lg:w-14 lg:h-14 bg-yellow-100 rounded-xl flex items-center justify-center shrink-0"
            >
              <svg
                class="w-6 h-6 lg:w-7 lg:h-7 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <div>
              <h3 class="text-base lg:text-lg font-semibold text-gray-900 mb-2">
                Aprendes mientras usas WALA
              </h3>
              <p class="text-sm text-gray-600 leading-relaxed">
                Entiendes tu negocio mientras lo gestionas.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- CTA suave exploratorio -->
      <div class="text-center mt-8 lg:mt-10">
        <button
          class="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 hover:-translate-y-0.5 shadow-sm hover:shadow-md mb-3"
          @click="scrollToFeatures"
        >
          Ver todas las funciones
        </button>
        <p class="text-sm text-gray-500 mt-2">
          Descubre todo lo que WALA puede hacer por tu negocio
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
// Función para hacer scroll a Features
const scrollToFeatures = () => {
  const featuresElement = document.getElementById("features-section");
  if (featuresElement) {
    featuresElement.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
};
</script>

<style scoped>
/* Estilos coherentes con Hero, Solution y How */

/* Animación de entrada para los beneficios */
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

.grid > div:nth-child(5) {
  animation: fadeInUp 0.5s ease-out 0.5s backwards;
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
