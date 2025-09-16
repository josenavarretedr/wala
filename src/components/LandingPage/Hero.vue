<template>
  <section
    class="hero-section min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16"
  >
    <div class="max-w-6xl mx-auto text-center">
      <!-- Título Principal Mobile-First -->
      <div class="mb-12">
        <h1
          class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-slate-800 mb-8 tracking-tight leading-[0.9]"
        >
          <span class="font-black text-orange-600 text-shadow-sm">WALA:</span>
          <br />
          <span class="font-extralight text-slate-700 tracking-wider"
            >Copiloto</span
          >
          <br />
          <span class="font-bold text-blue-600 tracking-normal"
            >Empresarial</span
          >
        </h1>

        <!-- Subtítulo del hero -->
        <!-- <div class="mt-6">
          <p
            class="text-lg md:text-xl lg:text-2xl font-medium text-slate-600 tracking-wide"
          >
            La inteligencia artificial que impulsa tu negocio
          </p>
        </div> -->
      </div>

      <!-- Promesa de Valor Mobile-First -->
      <div class="mb-16 max-w-4xl mx-auto">
        <div class="space-y-6">
          <!-- Línea principal - optimizada para móvil -->
          <p
            class="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold text-slate-800 leading-tight tracking-tight"
          >
            Organiza tu negocio, toma mejores decisiones
          </p>

          <!-- Línea complementaria -->
          <p
            class="text-lg sm:text-xl md:text-2xl lg:text-3xl font-light text-slate-700 leading-relaxed tracking-wide"
          >
            y haz crecer tus resultados con la primera plataforma
          </p>

          <!-- Línea destacada con colores -->
          <p class="text-lg sm:text-xl md:text-2xl lg:text-3xl leading-relaxed">
            <span class="text-orange-600 font-bold tracking-wide"
              >AI-First</span
            >
            <span class="text-slate-700 font-light"> diseñada para </span>
            <span class="text-blue-700 font-semibold tracking-wide"
              >emprendedores latinoamericanos</span
            >
          </p>
        </div>
      </div>

      <!-- CTAs Mobile-First -->
      <div
        class="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center"
      >
        <!-- CTA Primario -->
        <button
          class="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-xl font-bold text-lg sm:text-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 min-w-[180px] sm:min-w-[200px] hover:from-orange-600 hover:to-orange-700"
        >
          <span class="font-semibold tracking-wide">Probar gratis</span>
        </button>

        <!-- CTA Secundario -->
        <button
          class="bg-slate-50 text-slate-700 px-8 sm:px-10 py-4 sm:py-5 rounded-xl font-medium text-lg sm:text-xl shadow-sm hover:shadow-md transition-all duration-300 border border-slate-200 hover:border-blue-300 hover:-translate-y-1 min-w-[180px] sm:min-w-[200px] hover:bg-blue-50"
        >
          <span
            class="group-hover:text-blue-700 transition-colors duration-200 font-semibold"
            >Ver cómo funciona</span
          >
        </button>
      </div>

      <!-- Elemento decorativo sutil -->
      <div class="mt-16 flex justify-center">
        <div
          class="w-32 h-px bg-gradient-to-r from-transparent via-orange-400 to-transparent"
        ></div>
      </div>
    </div>

    <!-- Sombras sutiles minimalistas -->
    <div
      class="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden"
    >
      <!-- Sombra superior sutil -->
      <div
        class="absolute top-0 left-0 w-80 h-80 bg-orange-50 rounded-full filter blur-3xl opacity-40 -translate-x-24 -translate-y-24"
      ></div>

      <!-- Sombra inferior sutil -->
      <div
        class="absolute bottom-0 right-0 w-80 h-80 bg-blue-50 rounded-full filter blur-3xl opacity-30 translate-x-24 translate-y-24"
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

/* Estilos Mobile-First elegantes */

/* Base mobile - perfecto desde 320px */
.text-shadow-sm {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

h1 {
  letter-spacing: -0.01em;
}

/* Tablet y superior - 640px+ */
@media (min-width: 640px) {
  h1 {
    letter-spacing: -0.015em;
  }
}

/* Desktop - 1024px+ */
@media (min-width: 1024px) {
  h1 {
    letter-spacing: -0.02em;
  }
}

/* Desktop grande - 1280px+ */
@media (min-width: 1280px) {
  h1 {
    letter-spacing: -0.025em;
  }
}
</style>
