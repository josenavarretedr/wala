<template>
  <section
    class="wow-section relative min-h-screen bg-slate-50 py-20 px-4 overflow-hidden"
  >
    <!-- Sombras sutiles de fondo -->
    <div class="absolute inset-0 pointer-events-none">
      <div
        class="absolute top-40 left-20 w-64 h-64 bg-orange-100 rounded-full filter blur-3xl opacity-30"
      ></div>
      <div
        class="absolute bottom-20 right-20 w-96 h-96 bg-blue-100 rounded-full filter blur-3xl opacity-20"
      ></div>
    </div>

    <div class="max-w-7xl mx-auto relative z-10">
      <!-- Título Principal Minimalista -->
      <div class="text-center mb-32">
        <h2
          class="text-4xl md:text-5xl lg:text-6xl font-light text-slate-600 mb-8 tracking-wide"
        >
          ¿Por qué elegir
          <span class="text-orange-600 font-normal">WALA</span>?
        </h2>
      </div>

      <!-- Grid de Propuestas con Tipografía Protagonista -->
      <div class="space-y-24">
        <!-- Propuesta 1: Simple -->
        <div class="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          <div class="lg:w-1/2 text-center lg:text-left">
            <div class="mb-8">
              <span
                class="text-8xl md:text-9xl lg:text-[10rem] font-extralight text-slate-200 block leading-none"
              >
                01
              </span>
            </div>
          </div>
          <div class="lg:w-1/2">
            <h3
              class="text-4xl md:text-5xl lg:text-6xl font-light text-slate-800 mb-6 leading-tight"
            >
              <span class="text-green-600 font-normal">Simple</span>
            </h3>
            <p
              class="text-xl md:text-2xl font-light text-slate-600 leading-relaxed max-w-lg"
            >
              Pensado para quienes no son expertos en tecnología. Interfaz
              intuitiva que cualquiera puede usar.
            </p>
            <div class="mt-8 w-24 h-px bg-green-400 rounded-full"></div>
          </div>
        </div>

        <!-- Propuesta 2: Accesible -->
        <div
          class="flex flex-col lg:flex-row-reverse items-center gap-16 lg:gap-24"
        >
          <div class="lg:w-1/2 text-center lg:text-right">
            <div class="mb-8">
              <span
                class="text-8xl md:text-9xl lg:text-[10rem] font-extralight text-slate-200 block leading-none"
              >
                02
              </span>
            </div>
          </div>
          <div class="lg:w-1/2 text-center lg:text-right">
            <h3
              class="text-4xl md:text-5xl lg:text-6xl font-light text-slate-800 mb-6 leading-tight"
            >
              <span class="text-blue-600 font-normal">Accesible</span>
            </h3>
            <p
              class="text-xl md:text-2xl font-light text-slate-600 leading-relaxed max-w-lg lg:ml-auto"
            >
              Modelo freemium - empieza gratis. Sin barreras de entrada, sin
              compromisos iniciales.
            </p>
            <div
              class="mt-8 w-24 h-px bg-blue-400 rounded-full lg:ml-auto"
            ></div>
          </div>
        </div>

        <!-- Propuesta 3: Local -->
        <div class="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          <div class="lg:w-1/2 text-center lg:text-left">
            <div class="mb-8">
              <span
                class="text-8xl md:text-9xl lg:text-[10rem] font-extralight text-slate-200 block leading-none"
              >
                03
              </span>
            </div>
          </div>
          <div class="lg:w-1/2">
            <h3
              class="text-4xl md:text-5xl lg:text-6xl font-light text-slate-800 mb-6 leading-tight"
            >
              <span class="text-orange-600 font-normal">Local</span>
            </h3>
            <p
              class="text-xl md:text-2xl font-light text-slate-600 leading-relaxed max-w-lg"
            >
              Adaptado a la realidad de emprendedores latinoamericanos.
              Conocemos tus desafíos únicos.
            </p>
            <div class="mt-8 w-24 h-px bg-orange-400 rounded-full"></div>
          </div>
        </div>

        <!-- Propuesta 4: Escalable -->
        <div
          class="flex flex-col lg:flex-row-reverse items-center gap-16 lg:gap-24"
        >
          <div class="lg:w-1/2 text-center lg:text-right">
            <div class="mb-8">
              <span
                class="text-8xl md:text-9xl lg:text-[10rem] font-extralight text-slate-200 block leading-none"
              >
                04
              </span>
            </div>
          </div>
          <div class="lg:w-1/2 text-center lg:text-right">
            <h3
              class="text-4xl md:text-5xl lg:text-6xl font-light text-slate-800 mb-6 leading-tight"
            >
              <span class="text-purple-600 font-normal">Escalable</span>
            </h3>
            <p
              class="text-xl md:text-2xl font-light text-slate-600 leading-relaxed max-w-lg lg:ml-auto"
            >
              Crece contigo, desde una feria hasta tu primera tienda online. Sin
              límites en tu crecimiento.
            </p>
            <div
              class="mt-8 w-24 h-px bg-purple-400 rounded-full lg:ml-auto"
            ></div>
          </div>
        </div>
      </div>

      <!-- Conclusión Minimalista -->
      <div class="text-center mt-32">
        <div class="max-w-4xl mx-auto">
          <p
            class="text-3xl md:text-4xl lg:text-5xl font-extralight text-slate-700 leading-tight mb-8"
          >
            Estas son nuestras
            <span class="text-orange-600 font-light">cuatro promesas</span>.
          </p>
          <p class="text-xl md:text-2xl font-light text-slate-600 mb-12">
            Simple, accesible, local y escalable. Todo lo que necesitas.
          </p>

          <!-- CTA Minimalista -->
          <button
            class="bg-white text-slate-800 border-2 border-orange-600 px-12 py-4 rounded-xl font-medium text-lg hover:bg-orange-600 hover:text-white transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-xl"
          >
            Comenzar gratis
          </button>
        </div>

        <!-- Elemento decorativo final -->
        <div class="flex justify-center mt-16">
          <div
            class="w-32 h-px bg-gradient-to-r from-transparent via-orange-400 to-transparent"
          ></div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
// Script minimalista - sin animaciones complejas
</script>

<style scoped>
/* Animaciones sutiles */
.wow-section {
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

/* Efectos hover sutiles para los números */
span:hover {
  transition: all 0.3s ease;
}

/* Responsive mejorado */
@media (max-width: 768px) {
  span {
    font-size: 4rem !important;
  }
}
</style>
