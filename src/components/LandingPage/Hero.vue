<template>
  <section
    class="hero-section min-h-screen bg-white flex items-center justify-center px-4 py-16 md:py-24"
  >
    <div class="max-w-7xl mx-auto w-full">
      <!-- Logo WALA pequeño arriba (mobile y desktop) -->
      <div class="flex justify-center mb-10 md:mb-14">
        <img
          src="@/assets/logoWala2.png"
          alt="WALA"
          class="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 animate-fadeInScale"
        />
      </div>

      <!-- Layout: Mobile = columna | Desktop = 2 columnas -->
      <div
        class="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center"
      >
        <!-- COLUMNA IZQUIERDA: Contenido de texto -->
        <div class="text-center md:text-left space-y-6 md:space-y-10">
          <!-- Título Principal (H1) -->
          <h1
            class="text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-gray-900 font-extrabold leading-[1.1] tracking-tight"
          >
            Entiende tu negocio
            <span class="text-orange-500">día a día</span>.
          </h1>

          <!-- Subtítulo (H2) -->
          <h2
            class="text-xl sm:text-2xl md:text-3xl text-gray-600 font-normal leading-relaxed max-w-2xl mx-auto md:mx-0"
          >
            Registra ingresos y egresos de forma simple para saber si estás
            <span class="font-semibold text-gray-800"
              >ganando o perdiendo dinero</span
            >.
          </h2>

          <!-- CTAs -->
          <div
            class="flex flex-col sm:flex-row gap-4 justify-center md:justify-start items-center pt-4"
          >
            <!-- CTA Primario -->
            <button
              class="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-orange-600 text-white px-10 py-5 rounded-xl font-bold text-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 hover:from-orange-600 hover:to-orange-700"
              @click="$router.push({ name: 'Login' })"
            >
              Empieza gratis por 15 días
            </button>

            <!-- CTA Secundario -->
            <button
              class="w-full sm:w-auto bg-transparent text-gray-600 px-6 py-3 rounded-xl font-medium text-base transition-all duration-200 hover:text-gray-900 underline decoration-gray-300 hover:decoration-gray-600 underline-offset-4"
              @click="scrollToPainSection"
            >
              Ver cómo funciona
            </button>
          </div>

          <!-- Microcopy de confianza -->
          <div class="text-center md:text-left pt-1">
            <p
              class="text-sm text-gray-500 flex items-center justify-center md:justify-start gap-3"
            >
              <span class="flex items-center gap-1.5">
                <svg
                  class="w-3.5 h-3.5 text-emerald-500"
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
                Sin tarjeta
              </span>
              <span class="text-gray-300">·</span>
              <span class="flex items-center gap-1.5">
                <svg
                  class="w-3.5 h-3.5 text-emerald-500"
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
                Sin compromiso
              </span>
            </p>
          </div>
        </div>

        <!-- COLUMNA DERECHA: Visual UI abstracto (solo ≥ md) -->
        <div class="hidden md:block relative">
          <div class="relative w-full max-w-lg mx-auto">
            <!-- Card Principal: Resumen del día -->
            <div
              class="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 mb-8 animate-floatSlow"
              style="animation-delay: 0s"
            >
              <div class="flex items-center justify-between mb-5">
                <h3 class="text-xl font-bold text-gray-800">Resumen del día</h3>
                <span class="text-xs text-gray-400 font-medium">Hoy</span>
              </div>

              <div class="space-y-3">
                <!-- Ingresos -->
                <div
                  class="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-100"
                >
                  <div class="flex items-center gap-3">
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
                          d="M7 11l5-5m0 0l5 5m-5-5v12"
                        />
                      </svg>
                    </div>
                    <span class="text-sm font-medium text-gray-600"
                      >Ingresos</span
                    >
                  </div>
                  <span class="text-xl font-bold text-emerald-700"
                    >S/ 1,250</span
                  >
                </div>

                <!-- Gastos -->
                <div
                  class="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100"
                >
                  <div class="flex items-center gap-3">
                    <div
                      class="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center"
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
                          d="M17 13l-5 5m0 0l-5-5m5 5V6"
                        />
                      </svg>
                    </div>
                    <span class="text-sm font-medium text-gray-600"
                      >Gastos</span
                    >
                  </div>
                  <span class="text-xl font-bold text-orange-700">S/ 680</span>
                </div>

                <!-- Resultado -->
                <div
                  class="flex items-center justify-between p-5 bg-blue-50 rounded-xl border-2 border-blue-200 mt-4"
                >
                  <div class="flex items-center gap-3">
                    <div
                      class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center"
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
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <span class="text-base font-bold text-blue-800"
                      >Ganas hoy</span
                    >
                  </div>
                  <span class="text-2xl font-bold text-blue-700">S/ 570</span>
                </div>
              </div>
            </div>

            <!-- Card Secundaria: Racha -->
            <div
              class="bg-white rounded-xl shadow-md border border-gray-100 p-4 ml-auto w-2/3 animate-floatSlow"
              style="animation-delay: 0.3s"
            >
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-xs text-gray-500 mb-1 font-medium">Tu racha</p>
                  <p class="text-xl font-bold text-purple-600">Día 12 / 30</p>
                </div>
                <div
                  class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center"
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
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
              </div>
              <!-- Barra de progreso -->
              <div class="mt-3 bg-purple-50 rounded-full h-1.5 overflow-hidden">
                <div
                  class="bg-gradient-to-r from-purple-400 to-purple-600 h-full rounded-full"
                  style="width: 40%"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sombras sutiles de fondo -->
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
/* Estilos coherentes con la identidad WALA */
.hero-section {
  position: relative;
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

/* Animación flotante suave para las cards del visual */
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

/* Transiciones suaves para todos los elementos interactivos */
button {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

button:active {
  transform: translateY(0);
}

/* Responsive adjustments */
@media (max-width: 640px) {
  h1 {
    line-height: 1.1;
  }

  h2 {
    line-height: 1.5;
  }
}

/* Hover effects para las cards del visual */
@media (min-width: 768px) {
  .hidden.md\:block > div > div {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .hidden.md\:block > div > div:hover {
    transform: translateY(-2px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
      0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }
}
</style>
