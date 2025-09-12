<template>
  <section
    class="cta-section relative min-h-screen bg-slate-50 flex items-center justify-center px-4 py-20"
  >
    <!-- Sombras decorativas sutiles -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <!-- Sombra superior derecha (energía) -->
      <div
        class="absolute top-0 right-0 w-96 h-96 bg-orange-100 rounded-full filter blur-3xl opacity-30 translate-x-32 -translate-y-32"
      ></div>

      <!-- Sombra inferior izquierda (confianza) -->
      <div
        class="absolute bottom-0 left-0 w-80 h-80 bg-blue-100 rounded-full filter blur-3xl opacity-25 -translate-x-32 translate-y-32"
      ></div>

      <!-- Sombra central sutil -->
      <div
        class="absolute top-1/2 left-1/2 w-64 h-64 bg-orange-50 rounded-full filter blur-2xl opacity-40 -translate-x-32 -translate-y-32"
      ></div>
    </div>

    <div class="max-w-5xl mx-auto text-center relative z-10">
      <!-- Emoji destacado -->
      <div class="mb-8">
        <span class="text-6xl md:text-7xl lg:text-8xl">👉</span>
      </div>

      <!-- Mensaje principal -->
      <div class="mb-12">
        <h2
          class="text-4xl md:text-5xl lg:text-6xl font-extralight text-slate-800 mb-8 leading-tight tracking-tight"
        >
          <span class="block mb-4">Empieza gratis hoy y descubre</span>
          <span class="block mb-4"
            >cómo
            <span class="text-orange-600 font-light">WALA</span>
            puede ser tu
          </span>
          <span class="block text-blue-600 font-light"
            >copiloto empresarial</span
          >
        </h2>
      </div>

      <!-- CTA Principal -->
      <div class="mb-16">
        <button
          class="group bg-gradient-to-r from-orange-500 to-orange-600 text-white px-12 py-6 rounded-2xl font-medium text-xl shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 hover:-translate-y-2 hover:from-orange-600 hover:to-orange-700 relative overflow-hidden min-w-[280px]"
        >
          <span class="relative z-10">Probar gratis ahora</span>

          <!-- Efecto de brillo en hover -->
          <div
            class="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          ></div>
        </button>
      </div>

      <!-- Información adicional sutil -->
      <div class="text-center">
        <p
          class="text-lg md:text-xl font-light text-slate-600 mb-6 max-w-2xl mx-auto leading-relaxed"
        >
          Sin tarjeta de crédito • Sin compromisos • Sin instalaciones complejas
        </p>

        <!-- Indicadores de beneficios -->
        <div
          class="flex flex-wrap justify-center gap-8 text-sm md:text-base text-slate-500 font-light"
        >
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 bg-green-400 rounded-full"></span>
            <span>Setup en 2 minutos</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 bg-blue-400 rounded-full"></span>
            <span>Soporte 24/7</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 bg-orange-400 rounded-full"></span>
            <span>Cancela cuando quieras</span>
          </div>
        </div>
      </div>

      <!-- Elemento decorativo de cierre -->
      <div class="flex justify-center mt-20">
        <div class="flex items-center gap-4">
          <div
            class="w-20 h-px bg-gradient-to-r from-transparent via-orange-400 to-transparent"
          ></div>
          <div class="w-3 h-3 bg-orange-400 rounded-full opacity-60"></div>
          <div
            class="w-20 h-px bg-gradient-to-r from-transparent via-orange-400 to-transparent"
          ></div>
        </div>
      </div>
    </div>

    <!-- Gradiente de fondo sutil -->
    <div
      class="absolute inset-0 bg-gradient-to-t from-orange-50/20 via-transparent to-blue-50/10 pointer-events-none"
    ></div>
  </section>
</template>

<script setup>
// Script limpio sin lógica compleja
</script>

<style scoped>
/* Animación de entrada */
.cta-section {
  animation: fadeInUp 1s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Animación del emoji */
span:first-child {
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

/* Efecto hover del botón */
button:hover {
  transform: translateY(-8px) scale(1.02);
}

/* Responsive mejorado */
@media (max-width: 768px) {
  h2 {
    font-size: 2.5rem !important;
    line-height: 1.2;
  }

  button {
    min-width: 250px;
    padding: 1rem 2rem;
    font-size: 1.125rem;
  }
}

/* Animación de los indicadores */
.flex.items-center.gap-2 {
  animation: fadeInUp 1.2s ease-out;
}

.flex.items-center.gap-2:nth-child(1) {
  animation-delay: 0.2s;
}
.flex.items-center.gap-2:nth-child(2) {
  animation-delay: 0.4s;
}
.flex.items-center.gap-2:nth-child(3) {
  animation-delay: 0.6s;
}
</style>
