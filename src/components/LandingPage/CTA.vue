<template>
  <section
    id="cta-section"
    class="py-16 sm:py-20 px-4 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden"
  >
    <div class="max-w-5xl mx-auto">
      <!-- Contenedor principal tipo card con diseño emocional -->
      <div
        class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 sm:p-12 md:p-16 transition-all duration-200 hover:shadow-md hover:border-gray-200 mb-8"
      >
        <!-- Título Principal con emoticón de corazón -->
        <div class="text-center mb-6">
          <h2
            class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-gray-900 mb-6 text-center font-bold leading-tight tracking-tight"
          >
            No estás <span class="text-blue-600">solo</span>.
            <span class="block mt-2"
              >WALA te <span class="text-yellow-600">acompaña</span> en cada
              paso</span
            >
            <span class="block mt-2">de tu negocio</span>
          </h2>
        </div>

        <!-- Subtítulo -->
        <p
          class="text-xl sm:text-2xl md:text-3xl text-gray-600 mb-12 text-center font-normal leading-relaxed max-w-4xl mx-auto"
        >
          <span class="font-medium text-gray-800">Organiza</span>,
          <span class="font-medium text-blue-700">aprende</span> y
          <span class="font-medium text-yellow-700">crece</span> con
          tranquilidad.
        </p>

        <!-- Separador decorativo -->
        <div class="flex justify-center mb-12">
          <div class="flex items-center gap-3">
            <div
              class="w-16 h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent"
            ></div>
            <div class="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <div
              class="w-16 h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent"
            ></div>
          </div>
        </div>

        <!-- CTA final (grande y centrado) -->
        <div class="flex flex-col items-center gap-6 mb-8">
          <button
            @click="createAccount"
            class="group bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-16 py-6 rounded-2xl font-bold text-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:from-yellow-600 hover:to-orange-600 relative overflow-hidden"
          >
            <span class="relative z-10 flex items-center gap-3">
              <Rocket class="w-7 h-7" />
              Crear cuenta gratuita
            </span>

            <!-- Efecto de brillo en hover -->
            <div
              class="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            ></div>
          </button>

          <!-- Info adicional debajo del botón -->
          <div class="text-center">
            <p class="text-base text-gray-500 mb-2">
              Sin tarjeta de crédito · 15 días de prueba gratis · Cancela cuando
              quieras
            </p>
          </div>
        </div>

        <!-- Microcopy inferior con corazón -->
        <div class="text-center pt-8 border-t border-gray-200">
          <p
            class="text-lg sm:text-xl text-gray-600 font-medium flex items-center justify-center gap-2 flex-wrap"
          >
            Hecho con
            <span class="text-2xl animate-pulse">💛</span>
            en Latinoamérica
          </p>
        </div>
      </div>

      <!-- Cards de valores adicionales -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <!-- Valor 1: Acompañamiento -->
        <div
          class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center transition-all duration-200 hover:shadow-md hover:border-yellow-200 hover:-translate-y-1"
        >
          <div
            class="w-14 h-14 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Group class="w-7 h-7 text-yellow-600" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">
            Acompañamiento constante
          </h3>
          <p class="text-sm text-gray-600">
            Nunca estarás solo. Soporte y guías siempre disponibles.
          </p>
        </div>

        <!-- Valor 2: Aprendizaje -->
        <div
          class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center transition-all duration-200 hover:shadow-md hover:border-blue-200 hover:-translate-y-1"
        >
          <div
            class="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <BookStack class="w-7 h-7 text-blue-600" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">
            Aprende a tu ritmo
          </h3>
          <p class="text-sm text-gray-600">
            Contenido educativo diseñado para emprendedores.
          </p>
        </div>

        <!-- Valor 3: Crecimiento -->
        <div
          class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center transition-all duration-200 hover:shadow-md hover:border-orange-200 hover:-translate-y-1"
        >
          <div
            class="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <GraphUp class="w-7 h-7 text-orange-600" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">
            Crece con confianza
          </h3>
          <p class="text-sm text-gray-600">
            Herramientas que crecen junto con tu negocio.
          </p>
        </div>
      </div>

      <!-- Mensaje final motivacional -->
      <div
        class="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-sm border border-yellow-100 p-8 text-center"
      >
        <div class="max-w-3xl mx-auto">
          <p
            class="text-xl sm:text-2xl text-gray-800 font-medium leading-relaxed mb-4"
          >
            Tu negocio merece claridad.
            <span class="text-yellow-700">Tú mereces tranquilidad</span>.
          </p>
          <p class="text-base sm:text-lg text-gray-600">
            Empieza hoy tu camino hacia un negocio más organizado y rentable.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useRouter } from "vue-router";
import { Heart, Rocket, Group, BookStack, GraphUp } from "@iconoir/vue";

const router = useRouter();

// Función para crear cuenta - redirige a login
const createAccount = () => {
  router.push("/auth/login");
};
</script>

<style scoped>
/* Estilos coherentes con Hero, Pain, Solution, Funcionalidades, PruebaSocial, FAQ, Planes y HistorialRecords */

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

/* Aplicar animación escalonada a las cards de valores */
.grid > div:nth-child(1) {
  animation: fadeInUp 0.5s ease-out 0.1s backwards;
}

.grid > div:nth-child(2) {
  animation: fadeInUp 0.5s ease-out 0.2s backwards;
}

.grid > div:nth-child(3) {
  animation: fadeInUp 0.5s ease-out 0.3s backwards;
}

/* Animación del corazón */
@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.animate-pulse {
  animation: pulse 2s ease-in-out infinite;
}

/* Transiciones suaves */
button,
.hover\:shadow-md,
.hover\:shadow-xl,
.hover\:shadow-2xl {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

button:active {
  transform: translateY(-4px) scale(0.98);
}

/* Efecto especial para el botón principal */
button:hover {
  box-shadow: 0 20px 25px -5px rgba(251, 191, 36, 0.3),
    0 10px 10px -5px rgba(251, 191, 36, 0.2);
}

/* Responsive adjustments */
@media (max-width: 640px) {
  h2 {
    line-height: 1.2;
  }

  button {
    padding: 1.25rem 2.5rem;
    font-size: 1.25rem;
  }
}

/* Animación suave del icono Rocket */
@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

button:hover svg {
  animation: float 1s ease-in-out infinite;
}
</style>
