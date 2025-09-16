<template>
  <section class="planes-section relative min-h-screen bg-slate-50 py-20 px-4">
    <!-- Sombras decorativas sutiles -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <!-- Sombra superior izquierda -->
      <div
        class="absolute top-0 left-0 w-96 h-96 bg-blue-100 rounded-full filter blur-3xl opacity-25 -translate-x-32 -translate-y-32"
      ></div>

      <!-- Sombra inferior derecha -->
      <div
        class="absolute bottom-0 right-0 w-80 h-80 bg-orange-100 rounded-full filter blur-3xl opacity-30 translate-x-32 translate-y-32"
      ></div>
    </div>

    <div class="max-w-6xl mx-auto relative z-10">
      <!-- Título Principal -->
      <div class="text-center mb-20">
        <h2
          class="text-5xl md:text-6xl lg:text-7xl font-extralight text-slate-800 mb-8 tracking-wide leading-tight"
        >
          Planes de
          <span class="text-orange-600 font-light">WALA</span>
        </h2>
        <p
          class="text-xl md:text-2xl font-light text-slate-600 max-w-3xl mx-auto"
        >
          Empieza gratis y escala cuando tu negocio crezca
        </p>
      </div>

      <!-- Grid de Planes -->
      <div class="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto mb-16">
        <!-- Plan Emprendedor (Gratuito) -->
        <div class="plan-card group">
          <div
            class="bg-white/80 backdrop-blur-sm p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-slate-200 hover:border-blue-300 hover:-translate-y-2 relative overflow-hidden"
          >
            <!-- Etiqueta sutil -->
            <div class="absolute top-6 right-6">
              <span
                class="bg-slate-100 text-slate-600 px-4 py-2 rounded-full text-sm font-medium"
              >
                Para empezar
              </span>
            </div>

            <div class="pt-8">
              <!-- Título del plan -->
              <div class="text-center mb-8">
                <h3 class="text-3xl md:text-4xl font-light text-slate-800 mb-4">
                  Plan
                  <span class="text-blue-600 font-normal">Emprendedor</span>
                </h3>
                <div
                  class="text-6xl md:text-7xl font-extralight text-slate-800 mb-2"
                >
                  Gratis
                </div>
                <p class="text-lg font-light text-slate-500">Para siempre</p>
              </div>

              <!-- Features -->
              <ul class="space-y-4 mb-10">
                <li class="flex items-start gap-4">
                  <div
                    class="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                  >
                    <span class="text-green-600 text-sm">✓</span>
                  </div>
                  <span class="text-lg text-slate-700 font-light"
                    >Registro de ingresos y gastos</span
                  >
                </li>
                <li class="flex items-start gap-4">
                  <div
                    class="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                  >
                    <span class="text-green-600 text-sm">✓</span>
                  </div>
                  <span class="text-lg text-slate-700 font-light"
                    >Reporte mensual básico</span
                  >
                </li>
                <li class="flex items-start gap-4">
                  <div
                    class="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                  >
                    <span class="text-green-600 text-sm">✓</span>
                  </div>
                  <span class="text-lg text-slate-700 font-light"
                    >Soporte por comunidad</span
                  >
                </li>
              </ul>

              <!-- CTA -->
              <button
                class="w-full bg-slate-100 text-slate-700 py-4 rounded-xl font-medium text-lg hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-all duration-300 border border-slate-200"
              >
                Empezar gratis
              </button>
            </div>
          </div>
        </div>

        <!-- Plan Empresario (Premium) -->
        <div class="plan-card group">
          <div
            class="bg-gradient-to-br from-blue-600 to-blue-700 p-10 rounded-3xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden text-white"
          >
            <!-- Etiqueta destacada -->
            <div class="absolute top-6 right-6">
              <span
                class="bg-orange-400 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg"
              >
                Recomendado
              </span>
            </div>

            <div class="pt-8">
              <!-- Título del plan -->
              <div class="text-center mb-8">
                <h3 class="text-3xl md:text-4xl font-light mb-4">
                  Plan <span class="text-blue-200 font-normal">Empresario</span>
                </h3>
                <div class="text-6xl md:text-7xl font-extralight mb-2">
                  S/40
                </div>
                <p class="text-lg font-light text-blue-200">por mes</p>
              </div>

              <!-- Features -->
              <ul class="space-y-4 mb-10">
                <li class="flex items-start gap-4">
                  <div
                    class="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                  >
                    <span class="text-white text-sm">✓</span>
                  </div>
                  <span class="text-lg font-light"
                    >Todo del plan Emprendedor</span
                  >
                </li>
                <li class="flex items-start gap-4">
                  <div
                    class="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                  >
                    <span class="text-white text-sm">✓</span>
                  </div>
                  <span class="text-lg font-light"
                    >Reportes detallados y analytics</span
                  >
                </li>
                <li class="flex items-start gap-4">
                  <div
                    class="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                  >
                    <span class="text-white text-sm">✓</span>
                  </div>
                  <span class="text-lg font-light">Exportación de datos</span>
                </li>
                <li class="flex items-start gap-4">
                  <div
                    class="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                  >
                    <span class="text-white text-sm">✓</span>
                  </div>
                  <span class="text-lg font-light"
                    >Soporte prioritario 24/7</span
                  >
                </li>
              </ul>

              <!-- CTA -->
              <button
                class="w-full bg-white text-blue-700 py-4 rounded-xl font-medium text-lg hover:bg-blue-50 hover:scale-105 transition-all duration-300 shadow-lg"
              >
                Comenzar prueba gratuita
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- CTA Global -->
      <div class="text-center">
        <div class="max-w-3xl mx-auto mb-12">
          <p
            class="text-2xl md:text-3xl font-light text-slate-700 mb-8 leading-relaxed"
          >
            ¿No estás seguro? Empieza gratis y
            <span class="text-orange-600 font-normal"
              >actualiza cuando lo necesites</span
            >
          </p>

          <button
            class="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-12 py-5 rounded-2xl font-medium text-xl shadow-xl hover:shadow-orange-500/25 transition-all duration-300 hover:-translate-y-2 hover:from-orange-600 hover:to-orange-700 relative overflow-hidden group"
          >
            <span class="relative z-10">Crear mi cuenta gratis</span>
            <div
              class="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            ></div>
          </button>
        </div>

        <!-- Garantías -->
        <div
          class="flex flex-wrap justify-center gap-8 text-slate-500 font-light"
        >
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 bg-green-400 rounded-full"></span>
            <span>30 días de prueba</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 bg-blue-400 rounded-full"></span>
            <span>Cancela cuando quieras</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 bg-orange-400 rounded-full"></span>
            <span>Migración gratuita</span>
          </div>
        </div>
      </div>

      <!-- Elemento decorativo -->
      <div class="flex justify-center mt-20">
        <div
          class="w-32 h-px bg-gradient-to-r from-transparent via-orange-400 to-transparent"
        ></div>
      </div>
    </div>
  </section>
</template>

<script setup>
// Script minimalista
</script>

<style scoped>
/* Animación de entrada */
.planes-section {
  animation: fadeIn 1s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Animación de las cards */
.plan-card {
  opacity: 0;
  animation: slideInUp 0.8s ease-out forwards;
}

.plan-card:nth-child(1) {
  animation-delay: 0.2s;
}
.plan-card:nth-child(2) {
  animation-delay: 0.4s;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(60px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Efecto hover mejorado */
.plan-card:hover {
  transform: translateY(-8px) scale(1.02);
}

/* Responsive */
@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  h2 {
    font-size: 3rem !important;
  }

  .text-6xl,
  .text-7xl {
    font-size: 3.5rem !important;
  }
}

/* Glassmorphism sutil */
.bg-white\/80 {
  backdrop-filter: blur(10px);
}
</style>
