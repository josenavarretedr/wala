<template>
  <section
    class="hero-section min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16"
  >
    <div class="max-w-6xl mx-auto text-center">
      <!-- Título Principal -->
      <div class="mb-8">
        <h1
          class="text-6xl md:text-7xl lg:text-8xl font-extralight text-slate-800 mb-4 tracking-tight"
        >
          <span class="font-light text-orange-600">WALA:</span>
          <br />
          <span class="font-thin text-slate-600">Tu Copiloto</span>
          <br />
          <span class="font-extralight text-blue-600">Empresarial</span>
        </h1>
      </div>

      <!-- Subtítulo/Promesa de Valor -->
      <div class="mb-12 max-w-4xl mx-auto">
        <p
          class="text-xl md:text-2xl lg:text-3xl font-light text-slate-600 leading-relaxed tracking-wide"
        >
          Organiza tu negocio, toma mejores decisiones y haz crecer tus
          resultados
          <br class="hidden md:block" />
          con la primera plataforma
          <span class="text-orange-600 font-normal">AI-First</span>
          diseñada para
          <br class="hidden md:block" />
          <span class="text-blue-700 font-normal"
            >emprendedores latinoamericanos</span
          >.
        </p>
      </div>

      <!-- CTAs -->
      <div class="flex flex-col sm:flex-row gap-6 justify-center items-center">
        <!-- CTA Primario -->
        <button
          class="group bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-xl font-medium text-lg shadow-md hover:shadow-xl transition-all duration-300 border border-orange-400 hover:border-orange-500 hover:-translate-y-1 active:translate-y-0 active:shadow-md min-w-[180px] hover:from-orange-600 hover:to-orange-700"
        >
          <span class="transition-colors duration-200"> Probar gratis </span>
        </button>

        <!-- CTA Secundario -->
        <button
          class="group bg-slate-50 text-slate-700 px-8 py-4 rounded-xl font-light text-lg shadow-sm hover:shadow-md transition-all duration-300 border border-slate-200 hover:border-blue-300 hover:-translate-y-1 active:translate-y-0 active:shadow-sm min-w-[180px] hover:bg-blue-50"
        >
          <span
            class="group-hover:text-blue-700 transition-colors duration-200"
          >
            Ver cómo funciona
          </span>
        </button>
      </div>

      <!-- Elemento decorativo sutil -->
      <div class="mt-16 flex justify-center">
        <div
          class="w-32 h-px bg-gradient-to-r from-transparent via-orange-400 to-transparent"
        ></div>
      </div>
    </div>

    <!-- Sombras decorativas -->
    <div
      class="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden"
    >
      <!-- Sombra superior izquierda (cálida) -->
      <div
        class="absolute top-0 left-0 w-96 h-96 bg-orange-100 rounded-full filter blur-3xl opacity-30 -translate-x-32 -translate-y-32"
      ></div>

      <!-- Sombra inferior derecha (azul/confianza) -->
      <div
        class="absolute bottom-0 right-0 w-96 h-96 bg-blue-100 rounded-full filter blur-3xl opacity-20 translate-x-32 translate-y-32"
      ></div>

      <!-- Sombra central sutil (energía) -->
      <div
        class="absolute top-1/2 left-1/2 w-64 h-64 bg-orange-100 rounded-full filter blur-2xl opacity-35 -translate-x-32 -translate-y-32"
      ></div>
    </div>
  </section>
</template>

<script setup>
// Script vacío por ahora - se puede agregar lógica más adelante si es necesario
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
.hero-section {
  position: relative;
}

/* Animación sutil para el título */
h1 {
  animation: fadeInUp 1s ease-out;
}

/* Animación sutil para el subtítulo */
p {
  animation: fadeInUp 1.2s ease-out;
}

/* Animación sutil para los CTAs */
.flex.gap-6 {
  animation: fadeInUp 1.4s ease-out;
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

/* Mejoras de responsividad para móviles */
@media (max-width: 640px) {
  h1 {
    font-size: 3.5rem;
    line-height: 1.1;
  }

  p {
    font-size: 1.125rem;
    line-height: 1.5;
  }
}
</style>
