<template>
  <section
    class="hero-section min-h-screen bg-white flex items-center justify-center px-4 py-16"
  >
    <div class="max-w-6xl mx-auto">
      <!-- Contenedor principal con diseño tipo card coherente -->
      <div
        class="bg-white p-6 sm:p-8 md:p-12 transition-all duration-200 hover:border-gray-200"
      >
        <!-- Logo WALA prominente -->
        <div class="flex justify-center mb-8">
          <div class="text-center">
            <!-- Logo image -->
            <img
              src="@/assets/logoWala2.png"
              alt="WALA - Tu copiloto digital para negocios"
              class="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 mx-auto mb-4 animate-fadeInScale"
            />
            <!-- Badge debajo del logo -->
            <!-- <div
              class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-200 text-orange-700"
            >
              <span
                class="w-2 h-2 bg-orange-500 rounded-full animate-pulse"
              ></span>
              <span class="text-sm font-medium">Tu copiloto para crecer</span>
            </div> -->
          </div>
        </div>

        <!-- Título Principal (H1) -->
        <h1
          class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-gray-900 mb-6 text-center font-bold leading-tight tracking-tight"
        >
          Tu copiloto para manejar
          <span class="text-orange-600">tu negocio</span> con
          <span class="text-blue-600">claridad</span>
        </h1>

        <!-- Subtítulo (H2) -->
        <h2
          class="text-lg sm:text-xl md:text-2xl text-gray-600 mb-8 text-center font-normal leading-relaxed max-w-4xl mx-auto"
        >
          WALA te ayuda a organizar tus ventas, gastos y clientes sin
          complicaciones.
          <span class="font-medium text-gray-800"
            >Simple, confiable y pensado para ti.</span
          >
        </h2>

        <!-- Grid de beneficios (estilo ResumenDay) -->
        <div
          class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8 max-w-4xl mx-auto"
        >
          <!-- Beneficio 1 -->
          <div
            class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center"
          >
            <div class="flex justify-center mb-2">
              <div
                class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"
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
            </div>
            <p class="text-sm font-medium text-blue-800">Simple</p>
            <p class="text-xs text-blue-600 mt-1">Fácil de usar</p>
          </div>

          <!-- Beneficio 2 -->
          <div
            class="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center"
          >
            <div class="flex justify-center mb-2">
              <div
                class="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center"
              >
                <svg
                  class="w-5 h-5 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
            </div>
            <p class="text-sm font-medium text-emerald-800">Confiable</p>
            <p class="text-xs text-emerald-600 mt-1">Datos seguros</p>
          </div>

          <!-- Beneficio 3 -->
          <div
            class="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center"
          >
            <div class="flex justify-center mb-2">
              <div
                class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center"
              >
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
              </div>
            </div>
            <p class="text-sm font-medium text-purple-800">Para ti</p>
            <p class="text-xs text-purple-600 mt-1">Hecho a tu medida</p>
          </div>
        </div>

        <!-- CTAs Mobile-First -->
        <div
          class="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6"
        >
          <!-- CTA Primario -->
          <button
            class="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:from-orange-600 hover:to-orange-700"
            @click="$router.push({ name: 'Login' })"
          >
            🔸 Comienza gratis por 15 días
          </button>

          <!-- CTA Secundario -->
          <button
            class="w-full sm:w-auto bg-white text-gray-700 px-8 py-4 rounded-xl font-medium text-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-blue-300 hover:-translate-y-0.5 hover:bg-blue-50"
            @click="scrollToPainSection"
          >
            Ver cómo funciona
          </button>
        </div>

        <!-- Microcopy de confianza -->
        <div class="text-center">
          <p
            class="text-sm text-gray-500 flex items-center justify-center gap-2"
          >
            <svg
              class="w-4 h-4 text-emerald-500"
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
            Sin tarjeta. Sin compromiso.
          </p>
        </div>
      </div>

      <!-- Sección de imagen/mockup (placeholder) -->
      <!-- <div class="mt-8">
        <div
          class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 overflow-hidden transition-all duration-200 hover:shadow-md hover:border-gray-200"
        >
          <div
            class="aspect-video bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50 rounded-lg flex items-center justify-center"
          >
            <div class="text-center px-4">
              <svg
                class="w-16 h-16 text-gray-300 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p class="text-sm text-gray-400 font-medium">
                Mockup de dashboard con métricas simples
              </p>
              <p class="text-xs text-gray-400 mt-1">
                (App financiera WALA para emprendedores en Latinoamérica)
              </p>
            </div>
          </div>
        </div>
      </div> -->
    </div>

    <!-- Sombras sutiles de fondo (mantener minimalistas) -->
    <div
      class="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10"
    >
      <div
        class="absolute top-0 left-0 w-80 h-80 bg-orange-50 rounded-full filter blur-3xl opacity-30 -translate-x-24 -translate-y-24"
      ></div>
      <div
        class="absolute bottom-0 right-0 w-80 h-80 bg-blue-50 rounded-full filter blur-3xl opacity-20 translate-x-24 translate-y-24"
      ></div>
    </div>
  </section>
</template>

<script setup>
// Función para hacer scroll suave hacia la sección Pain
const scrollToPainSection = () => {
  const painElement = document.getElementById("pain-section");
  if (painElement) {
    painElement.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
};
</script>

<style scoped>
/* Estilos coherentes con HistorialRecords */
.hero-section {
  position: relative;
}

/* Animación sutil de entrada */
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

/* Animación especial para el logo */
@keyframes fadeInScale {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fadeInScale {
  animation: fadeInScale 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Aplicar animación al contenedor principal */
.bg-white.rounded-xl {
  animation: fadeInUp 0.6s ease-out;
}

/* Animación del badge superior */
.inline-flex.items-center.gap-2 {
  animation: fadeInUp 0.8s ease-out;
}

/* Hover effects consistentes con HistorialRecords */
button:active {
  transform: translateY(0);
}

/* Responsive adjustments coherentes */
@media (max-width: 640px) {
  h1 {
    line-height: 1.2;
  }

  h2 {
    line-height: 1.5;
  }
}

/* Transiciones suaves para todos los elementos interactivos */
button,
a,
.hover\:shadow-md {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Efecto pulse para el badge indicator */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
