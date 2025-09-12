<template>
  <section
    class="solution-section relative min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 py-20 px-4 overflow-hidden"
  >
    <!-- Elementos flotantes de esperanza -->
    <div class="floating-elements absolute inset-0 pointer-events-none">
      <!-- Elementos positivos flotantes -->
      <div
        class="absolute top-20 right-20 text-4xl text-orange-200 animate-float-hope"
      >
        ✨
      </div>
      <div
        class="absolute top-60 left-10 text-5xl text-blue-200 animate-float-hope-delayed"
      >
        📱
      </div>
      <div
        class="absolute bottom-40 right-10 text-3xl text-green-200 animate-float-hope"
      >
        📈
      </div>
      <div
        class="absolute bottom-20 left-20 text-6xl text-orange-100 animate-float-hope-slow"
      >
        🚀
      </div>
      <div
        class="absolute top-40 left-1/2 text-4xl text-blue-100 animate-float-hope-medium"
      >
        💡
      </div>
    </div>

    <div class="max-w-7xl mx-auto relative z-10">
      <!-- Transición visual del problema a la solución -->
      <div class="text-center mb-20">
        <!-- Línea de transición -->
        <div class="flex justify-center mb-12">
          <div
            class="w-32 h-1 bg-gradient-to-r from-red-400 via-orange-400 to-blue-400 rounded-full transform-gpu"
          ></div>
        </div>

        <!-- Título principal masivo -->
        <div class="title-container mb-8">
          <h2
            class="text-4xl md:text-5xl lg:text-6xl font-light text-slate-600 mb-6 tracking-wide"
          >
            La Solución:
          </h2>
          <h1
            class="text-8xl md:text-9xl lg:text-[12rem] font-extralight leading-none mb-6"
          >
            <span
              class="block bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 bg-clip-text text-transparent font-light tracking-tight"
            >
              WALA
            </span>
          </h1>
          <!-- Subtítulo dinámico -->
          <div class="dynamic-subtitle">
            <p
              class="text-3xl md:text-4xl lg:text-5xl font-extralight text-slate-700 mb-4 typewriter"
            >
              Tu Copiloto Empresarial
            </p>
            <p
              class="text-xl md:text-2xl font-light text-blue-600 typewriter-delayed"
            >
              que trabaja contigo 24/7
            </p>
          </div>
        </div>
      </div>

      <!-- Grid de beneficios con storytelling -->
      <div class="benefits-grid grid lg:grid-cols-2 gap-12 lg:gap-16 mb-20">
        <!-- Beneficio 1: Tareas Importantes -->
        <div class="benefit-card group" data-aos="fade-up" data-aos-delay="100">
          <div
            class="relative bg-white/70 backdrop-blur-lg p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-700 border border-orange-100 hover:border-orange-200 hover:-translate-y-3 transform-gpu"
          >
            <!-- Número grande -->
            <div
              class="absolute -top-6 -left-6 w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300"
            >
              <span class="text-2xl font-bold text-white">1</span>
            </div>

            <!-- Icono flotante -->
            <div
              class="absolute -top-4 -right-4 text-6xl opacity-35 group-hover:opacity-60 transition-all duration-300 group-hover:scale-110"
            >
              🎯
            </div>

            <div class="pt-6">
              <h3
                class="text-2xl md:text-3xl font-light text-slate-800 mb-6 leading-tight"
              >
                Te ayuda en las
                <span class="text-orange-600 font-normal"
                  >tareas más importantes</span
                >
              </h3>
              <p class="text-lg text-slate-600 font-light leading-relaxed">
                Ventas, inventario y finanzas en un solo lugar. Sin papeles, sin
                Excel complicado.
              </p>
              <!-- Indicador visual -->
              <div
                class="mt-6 w-20 h-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full group-hover:w-32 transition-all duration-500"
              ></div>
            </div>
          </div>
        </div>

        <!-- Beneficio 2: Información Concreta -->
        <div class="benefit-card group" data-aos="fade-up" data-aos-delay="200">
          <div
            class="relative bg-white/70 backdrop-blur-lg p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-700 border border-blue-100 hover:border-blue-200 hover:-translate-y-3 transform-gpu"
          >
            <!-- Número grande -->
            <div
              class="absolute -top-6 -left-6 w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300"
            >
              <span class="text-2xl font-bold text-white">2</span>
            </div>

            <!-- Icono flotante -->
            <div
              class="absolute -top-4 -right-4 text-6xl opacity-35 group-hover:opacity-60 transition-all duration-300 group-hover:scale-110"
            >
              📊
            </div>

            <div class="pt-6">
              <h3
                class="text-2xl md:text-3xl font-light text-slate-800 mb-6 leading-tight"
              >
                <span class="text-blue-600 font-normal"
                  >Información concreta</span
                >
                para saber cómo va tu negocio
              </h3>
              <p class="text-lg text-slate-600 font-light leading-relaxed">
                Reportes claros y automáticos. Sabrás exactamente cuánto ganas y
                gastas.
              </p>
              <!-- Indicador visual -->
              <div
                class="mt-6 w-20 h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full group-hover:w-32 transition-all duration-500"
              ></div>
            </div>
          </div>
        </div>

        <!-- Beneficio 3: Movilidad -->
        <div class="benefit-card group" data-aos="fade-up" data-aos-delay="300">
          <div
            class="relative bg-white/70 backdrop-blur-lg p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-700 border border-green-100 hover:border-green-200 hover:-translate-y-3 transform-gpu"
          >
            <!-- Número grande -->
            <div
              class="absolute -top-6 -left-6 w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300"
            >
              <span class="text-2xl font-bold text-white">3</span>
            </div>

            <!-- Icono flotante -->
            <div
              class="absolute -top-4 -right-4 text-6xl opacity-35 group-hover:opacity-60 transition-all duration-300 group-hover:scale-110"
            >
              📱
            </div>

            <div class="pt-6">
              <h3
                class="text-2xl md:text-3xl font-light text-slate-800 mb-6 leading-tight"
              >
                Lleva tu negocio
                <span class="text-green-600 font-normal">desde el celular</span>
              </h3>
              <p class="text-lg text-slate-600 font-light leading-relaxed">
                Sin complicaciones, sin instalaciones. Todo funciona desde tu
                teléfono.
              </p>
              <!-- Indicador visual -->
              <div
                class="mt-6 w-20 h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-full group-hover:w-32 transition-all duration-500"
              ></div>
            </div>
          </div>
        </div>

        <!-- Beneficio 4: Guía Personalizada -->
        <div class="benefit-card group" data-aos="fade-up" data-aos-delay="400">
          <div
            class="relative bg-white/70 backdrop-blur-lg p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-700 border border-purple-100 hover:border-purple-200 hover:-translate-y-3 transform-gpu"
          >
            <!-- Número grande -->
            <div
              class="absolute -top-6 -left-6 w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300"
            >
              <span class="text-2xl font-bold text-white">4</span>
            </div>

            <!-- Icono flotante -->
            <div
              class="absolute -top-4 -right-4 text-6xl opacity-35 group-hover:opacity-60 transition-all duration-300 group-hover:scale-110"
            >
              🗺️
            </div>

            <div class="pt-6">
              <h3
                class="text-2xl md:text-3xl font-light text-slate-800 mb-6 leading-tight"
              >
                Te guía
                <span class="text-purple-600 font-normal">paso a paso</span>
                en tu localidad
              </h3>
              <p class="text-lg text-slate-600 font-light leading-relaxed">
                Ferias, capacitaciones y formalización. Conectado con
                oportunidades reales cerca de ti.
              </p>
              <!-- Indicador visual -->
              <div
                class="mt-6 w-20 h-1 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full group-hover:w-32 transition-all duration-500"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Call to Action Final -->
      <div class="text-center">
        <div
          class="inline-block bg-gradient-to-r from-orange-500 to-orange-600 p-1 rounded-2xl shadow-2xl"
        >
          <div class="bg-white rounded-xl px-12 py-8">
            <h3 class="text-3xl md:text-4xl font-light text-slate-800 mb-4">
              ¿Listo para tener tu
              <span class="text-orange-600 font-normal"
                >copiloto empresarial</span
              >?
            </h3>
            <button
              class="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-10 py-4 rounded-xl font-medium text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:from-orange-600 hover:to-orange-700"
            >
              Comenzar ahora
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Gradientes de fondo para la transición -->
    <div
      class="absolute inset-0 bg-gradient-to-t from-blue-50/40 via-transparent to-orange-50/20 pointer-events-none"
    ></div>
  </section>
</template>

<script setup>
import { onMounted, onUnmounted } from "vue";

// Efecto typewriter para el texto
const typewriterEffect = () => {
  const elements = document.querySelectorAll(
    ".typewriter, .typewriter-delayed"
  );

  elements.forEach((element, index) => {
    const text = element.textContent;
    element.textContent = "";
    element.style.borderRight = "2px solid #f97316";

    let i = 0;
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        element.textContent += text.charAt(i);
        i++;
        if (i >= text.length) {
          clearInterval(interval);
          setTimeout(() => {
            element.style.borderRight = "none";
          }, 500);
        }
      }, 50);
    }, index * 1000);
  });
};

// Animación de scroll parallax sutil
const handleScroll = () => {
  const cards = document.querySelectorAll(".benefit-card");
  const scrolled = window.pageYOffset;

  cards.forEach((card, index) => {
    const rate = scrolled * (0.05 + index * 0.01);
    card.style.transform = `translateY(${rate}px)`;
  });
};

onMounted(() => {
  setTimeout(typewriterEffect, 500);
  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<style scoped>
/* Animaciones para elementos flotantes de esperanza */
@keyframes float-hope {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-15px) rotate(2deg);
    opacity: 0.6;
  }
}

@keyframes float-hope-delayed {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.4;
  }
  50% {
    transform: translateY(-20px) rotate(-1deg);
    opacity: 0.7;
  }
}

@keyframes float-hope-slow {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.2;
  }
  50% {
    transform: translateY(-10px) rotate(1deg);
    opacity: 0.5;
  }
}

@keyframes float-hope-medium {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-12px) rotate(-2deg);
    opacity: 0.6;
  }
}

.animate-float-hope {
  animation: float-hope 4s ease-in-out infinite;
}
.animate-float-hope-delayed {
  animation: float-hope-delayed 5s ease-in-out infinite 0.5s;
}
.animate-float-hope-slow {
  animation: float-hope-slow 6s ease-in-out infinite 1s;
}
.animate-float-hope-medium {
  animation: float-hope-medium 4.5s ease-in-out infinite 1.5s;
}

/* Animación del título principal */
.title-container {
  animation: fadeInScale 1.2s ease-out;
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(30px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Efecto typewriter */
.typewriter,
.typewriter-delayed {
  overflow: hidden;
  white-space: nowrap;
}

/* Animaciones de las cards */
.benefit-card {
  opacity: 0;
  animation: slideInUp 0.8s ease-out forwards;
}

.benefit-card:nth-child(1) {
  animation-delay: 0.2s;
}
.benefit-card:nth-child(2) {
  animation-delay: 0.4s;
}
.benefit-card:nth-child(3) {
  animation-delay: 0.6s;
}
.benefit-card:nth-child(4) {
  animation-delay: 0.8s;
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

/* Mejoras para móviles */
@media (max-width: 768px) {
  .floating-elements {
    display: none;
  }

  h1 {
    font-size: 4rem !important;
  }

  .dynamic-subtitle p:first-child {
    font-size: 2rem !important;
  }
}

/* Efectos de glassmorphism */
.benefit-card div {
  backdrop-filter: blur(10px);
}
</style>
