<template>
  <section
    id="solution-section"
    class="pt-24 md:pt-40 pb-20 md:pb-32 px-4 relative overflow-hidden bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-orange-50/30"
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
      <!-- Bloque principal: Eyebrow + H2 + Subtexto -->
      <div
        class="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-12 md:p-16 mb-12 md:mb-20 text-center transition-all duration-200"
      >
        <!-- Eyebrow -->
        <div class="flex justify-center mb-8">
          <div
            class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            <span class="text-sm font-medium">La solución</span>
          </div>
        </div>

        <!-- Título Principal (H2) -->
        <h2
          class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-gray-900 font-extrabold leading-[1.1] tracking-tight mb-8"
        >
          Un copiloto
          <span class="text-blue-600">simple</span> para entender tu
          <span class="text-orange-500">negocio</span>
        </h2>

        <!-- Subtexto -->
        <p
          class="text-xl sm:text-2xl md:text-3xl text-gray-600 leading-relaxed md:leading-relaxed max-w-4xl mx-auto"
          style="line-height: 1.6"
        >
          WALA te acompaña día a día para que
          <span class="font-semibold text-gray-800"
            >registres tu información</span
          >,
          <span class="font-semibold text-gray-800">entiendas tus números</span>
          y
          <span class="font-semibold text-gray-800"
            >tomes decisiones con más control y tranquilidad</span
          >.
        </p>
      </div>

      <!-- Trinomio WALA: 3 pilares -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12">
        <!-- Pilar 1: Registro simple -->
        <div
          class="bg-white rounded-2xl shadow-md border border-emerald-100 p-8 transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
        >
          <div class="flex justify-center mb-8">
            <div
              class="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center"
            >
              <svg
                class="w-8 h-8 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
          </div>
          <h3
            class="text-2xl font-bold text-gray-900 mb-4 text-center leading-tight"
          >
            Registro simple
          </h3>
          <p class="text-base text-gray-600 leading-relaxed text-center">
            Registra ingresos y egresos sin complicaciones, desde tu celular y
            en minutos.
          </p>
        </div>

        <!-- Pilar 2: Entendimiento claro -->
        <div
          class="bg-white rounded-2xl shadow-md border border-blue-100 p-8 transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
        >
          <div class="flex justify-center mb-8">
            <div
              class="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center"
            >
              <svg
                class="w-8 h-8 text-blue-600"
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
          </div>
          <h3
            class="text-2xl font-bold text-gray-900 mb-4 text-center leading-tight"
          >
            Entendimiento claro
          </h3>
          <p class="text-base text-gray-600 leading-relaxed text-center">
            Visualiza si estás ganando o perdiendo y en qué se va tu dinero, sin
            tecnicismos.
          </p>
        </div>

        <!-- Pilar 3: Acompañamiento diario -->
        <div
          class="bg-white rounded-2xl shadow-md border border-purple-100 p-8 transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
        >
          <div class="flex justify-center mb-8">
            <div
              class="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center"
            >
              <svg
                class="w-8 h-8 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
          <h3
            class="text-2xl font-bold text-gray-900 mb-4 text-center leading-tight"
          >
            Acompañamiento diario
          </h3>
          <p class="text-base text-gray-600 leading-relaxed text-center">
            Crea el hábito, mantén tu progreso y entiende tu negocio con el
            tiempo.
          </p>
        </div>
      </div>

      <!-- Línea final -->
      <div class="text-center mt-4">
        <p class="text-base text-gray-400 font-normal">
          Esto es WALA hoy. Nada más. Nada menos.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
// No se necesitan imports adicionales si usamos SVG inline
</script>

<style scoped>
/* Estilos coherentes con Hero */

/* Transiciones suaves para cards */
.grid > div {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Responsive adjustments */
@media (max-width: 640px) {
  h2 {
    line-height: 1.1;
  }
}

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

.grid > div:nth-child(1) {
  animation: fadeInUp 0.6s ease-out 0.1s backwards;
}

.grid > div:nth-child(2) {
  animation: fadeInUp 0.6s ease-out 0.3s backwards;
}

.grid > div:nth-child(3) {
  animation: fadeInUp 0.6s ease-out 0.5s backwards;
}
</style>
