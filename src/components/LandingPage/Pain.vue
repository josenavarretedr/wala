<template>
  <section
    class="pain-section relative min-h-screen bg-slate-50 py-20 px-4 overflow-hidden"
  >
    <!-- Elementos flotantes decorativos -->
    <div class="floating-elements absolute inset-0 pointer-events-none">
      <!-- Calculadora rota -->
      <div
        class="absolute top-20 left-10 text-4xl text-red-300 animate-float-slow"
      >
        🧮
      </div>
      <!-- Reloj corriendo -->
      <div
        class="absolute top-32 right-20 text-5xl text-orange-300 animate-float-fast"
      >
        ⏰
      </div>
      <!-- Gráfico descendente -->
      <div
        class="absolute bottom-40 left-20 text-6xl text-red-200 animate-float-medium"
      >
        📉
      </div>
      <!-- Libreta desordenada -->
      <div
        class="absolute top-60 right-10 text-4xl text-slate-300 animate-float-slow"
      >
        📔
      </div>
      <!-- Signo de interrogación -->
      <div
        class="absolute bottom-20 right-40 text-7xl text-slate-400 animate-float-fast opacity-30"
      >
        ❓
      </div>
      <!-- Excel caótico -->
      <div
        class="absolute top-80 left-40 text-3xl text-green-300 animate-float-medium"
      >
        📊
      </div>
    </div>

    <div class="max-w-6xl mx-auto relative z-10">
      <!-- Título Principal con Gradiente Emocional -->
      <div class="text-center mb-20">
        <h2 class="text-5xl md:text-6xl lg:text-7xl font-extralight mb-8">
          <span class="block text-slate-800 mb-4">Ser emprendedor en</span>
          <span
            class="block bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent font-light"
          >
            Latinoamérica
          </span>
          <span
            class="block text-slate-600 font-thin text-4xl md:text-5xl lg:text-6xl mt-4"
          >
            no es fácil
          </span>
        </h2>
      </div>

      <!-- Grid de Dolores con Efectos Parallax -->
      <div class="grid md:grid-cols-2 gap-8 lg:gap-12">
        <!-- Dolor 1: Organización Caótica -->
        <div
          class="pain-card group cursor-pointer relative"
          data-parallax="0.1"
        >
          <!-- Icono flotante fuera del contenedor -->
          <div
            class="absolute -top-6 -right-6 text-7xl opacity-35 group-hover:opacity-60 transition-all duration-300 group-hover:scale-110 z-20"
          >
            📝
          </div>
          <div
            class="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-200 hover:border-orange-300 hover:-translate-y-2 relative"
          >
            <div class="relative z-10">
              <h3
                class="text-2xl md:text-3xl font-light text-slate-800 mb-4 leading-tight"
              >
                Pasas
                <span class="text-orange-600 font-normal"
                  >horas organizando</span
                >
                tu negocio en libretas o Excel
              </h3>
              <div
                class="w-16 h-1 bg-gradient-to-r from-orange-400 to-red-400 rounded-full group-hover:w-24 transition-all duration-300"
              ></div>
            </div>
          </div>
        </div>

        <!-- Dolor 2: Falta de Claridad Financiera -->
        <div
          class="pain-card group cursor-pointer relative"
          data-parallax="0.15"
        >
          <!-- Icono flotante fuera del contenedor -->
          <div
            class="absolute -top-6 -right-6 text-7xl opacity-35 group-hover:opacity-60 transition-all duration-300 group-hover:scale-110 z-20"
          >
            💸
          </div>
          <div
            class="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-200 hover:border-red-300 hover:-translate-y-2 relative"
          >
            <div class="relative z-10">
              <h3
                class="text-2xl md:text-3xl font-light text-slate-800 mb-4 leading-tight"
              >
                <span class="text-red-600 font-normal"
                  >No sabes con claridad</span
                >
                cuánto ganas o pierdes
              </h3>
              <div
                class="w-16 h-1 bg-gradient-to-r from-red-400 to-orange-400 rounded-full group-hover:w-24 transition-all duration-300"
              ></div>
            </div>
          </div>
        </div>

        <!-- Dolor 3: Falta de Tiempo para Clientes -->
        <div
          class="pain-card group cursor-pointer relative"
          data-parallax="0.2"
        >
          <!-- Icono flotante fuera del contenedor -->
          <div
            class="absolute -top-6 -right-6 text-7xl opacity-35 group-hover:opacity-60 transition-all duration-300 group-hover:scale-110 z-20"
          >
            🔥
          </div>
          <div
            class="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-200 hover:border-yellow-300 hover:-translate-y-2 relative"
          >
            <div class="relative z-10">
              <h3
                class="text-2xl md:text-3xl font-light text-slate-800 mb-4 leading-tight"
              >
                Te falta
                <span class="text-yellow-600 font-normal"
                  >tiempo para clientes</span
                >
                porque estás apagando incendios
              </h3>
              <div
                class="w-16 h-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full group-hover:w-24 transition-all duration-300"
              ></div>
            </div>
          </div>
        </div>

        <!-- Dolor 4: Falta de Socio Estratégico -->
        <div
          class="pain-card group cursor-pointer relative"
          data-parallax="0.25"
        >
          <!-- Icono flotante fuera del contenedor -->
          <div
            class="absolute -top-6 -right-6 text-7xl opacity-35 group-hover:opacity-60 transition-all duration-300 group-hover:scale-110 z-20"
          >
            🤝
          </div>
          <div
            class="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-200 hover:border-blue-300 hover:-translate-y-2 relative"
          >
            <div class="relative z-10">
              <h3
                class="text-2xl md:text-3xl font-light text-slate-800 mb-4 leading-tight"
              >
                <span class="text-blue-600 font-normal"
                  >No tienes un socio</span
                >
                que te ayude a decidir con estrategia
              </h3>
              <div
                class="w-16 h-1 bg-gradient-to-r from-blue-400 to-slate-400 rounded-full group-hover:w-24 transition-all duration-300"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Llamada a la Reflexión -->
      <div class="text-center mt-20">
        <p
          class="text-xl md:text-2xl font-light text-slate-600 max-w-3xl mx-auto leading-relaxed"
        >
          ¿Te sientes
          <span class="text-orange-600 font-normal">identificado</span>?
          <br class="hidden md:block" />
          Es hora de que tengas un
          <span class="text-blue-600 font-normal">copiloto empresarial</span>
          que te entienda.
        </p>
      </div>

      <!-- Elemento decorativo de transición -->
      <div class="flex justify-center mt-16">
        <div
          class="w-1 h-20 bg-gradient-to-b from-orange-400 via-red-400 to-transparent rounded-full"
        ></div>
      </div>
    </div>

    <!-- Gradiente de fondo sutil -->
    <div
      class="absolute inset-0 bg-gradient-to-br from-slate-50 via-orange-50/30 to-blue-50/20 pointer-events-none"
    ></div>
  </section>
</template>

<script setup>
import { onMounted, onUnmounted } from "vue";

// Efecto parallax sutil
const handleScroll = () => {
  const cards = document.querySelectorAll(".pain-card");
  const scrolled = window.pageYOffset;

  cards.forEach((card) => {
    const rate = scrolled * (card.dataset.parallax || 0.1);
    card.style.transform = `translateY(${rate}px)`;
  });
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<style scoped>
/* Animaciones para elementos flotantes */
@keyframes float-slow {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(2deg);
  }
}

@keyframes float-medium {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-15px) rotate(-1deg);
  }
}

@keyframes float-fast {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-10px) rotate(1deg);
  }
}

.animate-float-slow {
  animation: float-slow 6s ease-in-out infinite;
}

.animate-float-medium {
  animation: float-medium 4s ease-in-out infinite;
}

.animate-float-fast {
  animation: float-fast 3s ease-in-out infinite;
}

/* Efecto de aparición escalonada */
.pain-card {
  opacity: 0;
  animation: fadeInUp 0.8s ease-out forwards;
}

.pain-card:nth-child(1) {
  animation-delay: 0.1s;
}
.pain-card:nth-child(2) {
  animation-delay: 0.2s;
}
.pain-card:nth-child(3) {
  animation-delay: 0.3s;
}
.pain-card:nth-child(4) {
  animation-delay: 0.4s;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Mejoras para móviles */
@media (max-width: 768px) {
  .floating-elements {
    display: none; /* Ocultar elementos flotantes en móvil para mejor rendimiento */
  }
}
</style>
