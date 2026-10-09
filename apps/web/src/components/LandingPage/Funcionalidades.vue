<template>
  <section
    id="funcionalidades-section"
    class="py-16 sm:py-20 px-4 bg-white relative overflow-hidden"
  >
    <!-- Sombras sutiles de fondo (coherente con Hero, Pain y Solution) -->
    <div
      class="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10"
    >
      <div
        class="absolute top-0 right-0 w-80 h-80 bg-purple-50 rounded-full filter blur-3xl opacity-20"
      ></div>
      <div
        class="absolute bottom-0 left-0 w-80 h-80 bg-blue-50 rounded-full filter blur-3xl opacity-20"
      ></div>
    </div>

    <div class="max-w-6xl mx-auto">
      <!-- Contenedor principal tipo card (estilo HistorialRecords) -->
      <div
        class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8 md:p-12 transition-all duration-200 hover:shadow-md hover:border-gray-200 mb-8"
      >
        <!-- Badge superior -->
        <!-- <div class="flex justify-center mb-6">
          <div
            class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-200 text-purple-700"
          >
            <span class="text-2xl">⚙️</span>
            <span class="text-sm font-medium">Funcionalidades</span>
          </div>
        </div> -->
        <!-- Badge superior -->
        <div class="flex justify-center mb-6">
          <div
            class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700"
          >
            <span class="text-2xl">💡</span>
            <span class="text-sm font-medium">La solución</span>
          </div>
        </div>
        <!-- Título Principal -->
        <h2
          class="text-3xl sm:text-4xl md:text-5xl text-gray-900 mb-6 text-center font-bold leading-tight tracking-tight"
        >
          <span class="text-purple-600">Herramientas simples</span> que hacen tu
          día <span class="text-blue-600">más fácil</span>
        </h2>

        <!-- Subtítulo -->
        <p
          class="text-lg sm:text-xl md:text-2xl text-gray-600 mb-8 text-center font-normal leading-relaxed max-w-4xl mx-auto"
        >
          Diseñadas para el emprendedor latinoamericano que necesita
          <span class="font-medium text-gray-800">orden</span>, no
          <span class="font-medium text-red-600">complicaciones</span>.
        </p>
      </div>

      <!-- Grid de funcionalidades (5 cards) -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <!-- Card 1: Finanzas claras -->
        <div
          class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md hover:border-blue-200 hover:-translate-y-1"
        >
          <div class="flex items-start gap-4 mb-4">
            <div
              class="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center shrink-0"
            >
              <Cash class="w-6 h-6 text-blue-600" />
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-semibold text-gray-900 mb-2">
                Finanzas claras
              </h3>
            </div>
          </div>
          <p class="text-sm sm:text-base text-gray-600 leading-relaxed">
            Registra ingresos y gastos y entiende tus resultados al instante.
          </p>
        </div>

        <!-- Card 2: Inventario inteligente -->
        <div
          class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md hover:border-emerald-200 hover:-translate-y-1"
        >
          <div class="flex items-start gap-4 mb-4">
            <div
              class="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center shrink-0"
            >
              <Package class="w-6 h-6 text-emerald-600" />
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-semibold text-gray-900 mb-2">
                Inventario inteligente
              </h3>
            </div>
          </div>
          <p class="text-sm sm:text-base text-gray-600 leading-relaxed">
            Controla tus productos y recibe alertas cuando algo se acaba.
          </p>
        </div>

        <!-- Card 3: Reportes simples -->
        <div
          class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md hover:border-purple-200 hover:-translate-y-1"
        >
          <div class="flex items-start gap-4 mb-4">
            <div
              class="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center shrink-0"
            >
              <Reports class="w-6 h-6 text-purple-600" />
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-semibold text-gray-900 mb-2">
                Reportes simples
              </h3>
            </div>
          </div>
          <p class="text-sm sm:text-base text-gray-600 leading-relaxed">
            Visualiza tu flujo diario con gráficos fáciles de entender.
          </p>
        </div>

        <!-- Card 4: Clientes y proveedores -->
        <div
          class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md hover:border-orange-200 hover:-translate-y-1"
        >
          <div class="flex items-start gap-4 mb-4">
            <div
              class="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center shrink-0"
            >
              <Group class="w-6 h-6 text-orange-600" />
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-semibold text-gray-900 mb-2">
                Clientes y proveedores
              </h3>
            </div>
          </div>
          <p class="text-sm sm:text-base text-gray-600 leading-relaxed">
            Lleva el control de pagos y contactos sin perder detalle.
          </p>
        </div>

        <!-- Card 5: Aprendizaje práctico -->
        <div
          class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md hover:border-yellow-200 hover:-translate-y-1 md:col-span-2 lg:col-span-1"
        >
          <div class="flex items-start gap-4 mb-4">
            <div
              class="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center shrink-0"
            >
              <BookStack class="w-6 h-6 text-yellow-600" />
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-semibold text-gray-900 mb-2">
                Aprendizaje práctico
              </h3>
            </div>
          </div>
          <p class="text-sm sm:text-base text-gray-600 leading-relaxed">
            Consejos y guías breves para mejorar tu negocio paso a paso.
          </p>
        </div>
      </div>

      <!-- Card destacada con ejemplo visual -->
      <div
        class="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-sm border border-purple-100 p-8 mb-8 transition-all duration-200 hover:shadow-md"
      >
        <div class="text-center mb-6">
          <h3 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Todo integrado, todo simple
          </h3>
          <p class="text-base sm:text-lg text-gray-700">
            No necesitas cambiar entre apps. WALA lo tiene todo en un solo
            lugar.
          </p>
        </div>

        <!-- Grid de iconos ilustrativos -->
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-4 max-w-3xl mx-auto">
          <div class="flex flex-col items-center gap-2">
            <div
              class="w-14 h-14 bg-white rounded-lg shadow-sm flex items-center justify-center"
            >
              <Cash class="w-7 h-7 text-blue-600" />
            </div>
            <span class="text-xs font-medium text-gray-700">Finanzas</span>
          </div>

          <div class="flex flex-col items-center gap-2">
            <div
              class="w-14 h-14 bg-white rounded-lg shadow-sm flex items-center justify-center"
            >
              <Package class="w-7 h-7 text-emerald-600" />
            </div>
            <span class="text-xs font-medium text-gray-700">Inventario</span>
          </div>

          <div class="flex flex-col items-center gap-2">
            <div
              class="w-14 h-14 bg-white rounded-lg shadow-sm flex items-center justify-center"
            >
              <Reports class="w-7 h-7 text-purple-600" />
            </div>
            <span class="text-xs font-medium text-gray-700">Reportes</span>
          </div>

          <div class="flex flex-col items-center gap-2">
            <div
              class="w-14 h-14 bg-white rounded-lg shadow-sm flex items-center justify-center"
            >
              <Group class="w-7 h-7 text-orange-600" />
            </div>
            <span class="text-xs font-medium text-gray-700">Clientes</span>
          </div>

          <div class="flex flex-col items-center gap-2">
            <div
              class="w-14 h-14 bg-white rounded-lg shadow-sm flex items-center justify-center"
            >
              <BookStack class="w-7 h-7 text-yellow-600" />
            </div>
            <span class="text-xs font-medium text-gray-700">Aprende</span>
          </div>
        </div>
      </div>

      <!-- CTA contextual -->
      <div class="text-center">
        <button
          class="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-purple-600 text-white px-10 py-4 rounded-xl font-bold text-lg shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:from-purple-600 hover:to-purple-700"
          @click="scrollToNextSection"
        >
          Ver todas las funciones
        </button>
        <p class="text-sm text-gray-500 mt-4">
          Descubre todo lo que WALA puede hacer por tu negocio
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useRouter } from "vue-router";
import { Cash, Package, Reports, Group, BookStack } from "@iconoir/vue";

const router = useRouter();

// Función para redirigir a login
const scrollToNextSection = () => {
  router.push("/auth/login");
};
</script>

<style scoped>
/* Estilos coherentes con Hero, Pain, Solution y HistorialRecords */

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

/* Aplicar animación escalonada a las cards del grid */
.grid > div:nth-child(1) {
  animation: fadeInUp 0.5s ease-out 0.1s backwards;
}

.grid > div:nth-child(2) {
  animation: fadeInUp 0.5s ease-out 0.2s backwards;
}

.grid > div:nth-child(3) {
  animation: fadeInUp 0.5s ease-out 0.3s backwards;
}

.grid > div:nth-child(4) {
  animation: fadeInUp 0.5s ease-out 0.4s backwards;
}

.grid > div:nth-child(5) {
  animation: fadeInUp 0.5s ease-out 0.5s backwards;
}

/* Hover effects consistentes */
button:active {
  transform: translateY(0);
}

/* Transiciones suaves */
button,
.hover\:shadow-md {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Responsive adjustments */
@media (max-width: 640px) {
  h2 {
    line-height: 1.2;
  }
}
</style>
