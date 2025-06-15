<template>
  <div
    class="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 py-12"
  >
    <!-- Título principal -->
    <h1
      class="text-4xl md:text-5xl font-bold text-center text-gray-800 mb-6 leading-tight"
    >
      🧭 Ordena tus finanzas. Toma el control. Haz crecer tu negocio.
    </h1>

    <p class="text-lg md:text-xl text-center text-gray-600 max-w-2xl mb-10">
      Cada sol que entra y sale de tu negocio importa. Te ayudamos a transformar
      tus números en decisiones inteligentes y seguras.
    </p>

    <!-- Sección de beneficios / mensajes -->
    <div class="grid gap-8 md:grid-cols-3 w-full max-w-6xl">
      <!-- Registro ágil -->
      <div class="bg-white p-6 rounded-2xl shadow-xl text-center space-y-4">
        <!-- <Wallet class="w-12 h-12 mx-auto text-blue-500" /> -->
        <h2 class="text-xl font-semibold text-gray-800">
          💼 Registra sin complicaciones
        </h2>
        <p class="text-gray-600 text-lg">
          Ingresos, gastos, movimientos: todo en segundos para que nada se te
          escape.
        </p>
      </div>

      <!-- Visualización -->
      <div class="bg-white p-6 rounded-2xl shadow-xl text-center space-y-4">
        <!-- <EyeAlt class="w-12 h-12 mx-auto text-green-500" /> -->
        <h2 class="text-xl font-semibold text-gray-800">
          🔍 Mira lo que otros no ven
        </h2>
        <p class="text-gray-600 text-lg">
          Descubre en un vistazo en qué se va tu dinero y cómo hacer que rinda
          más.
        </p>
      </div>

      <!-- Crecimiento -->
      <div class="bg-white p-6 rounded-2xl shadow-xl text-center space-y-4">
        <!-- <BarChart class="w-12 h-12 mx-auto text-purple-500" /> -->
        <h2 class="text-xl font-semibold text-gray-800">
          🚀 Crece paso a paso
        </h2>
        <p class="text-gray-600 text-lg">
          Identifica lo que más vende, planifica el futuro y haz que tu negocio
          prospere.
        </p>
      </div>
    </div>

    <!-- Mensaje motivador -->
    <div class="mt-12 max-w-3xl text-center">
      <p class="text-xl text-gray-700 font-semibold">
        Porque los grandes negocios no nacen del azar, nacen del orden y la
        visión. Este es tu primer paso. 📈
      </p>
    </div>

    <!-- CTA -->
    <div class="mt-8">
      <RouterLink
        to="/auth/register"
        class="bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold px-8 py-4 rounded-full shadow-md transition-all"
      >
        Empieza a ordenar tu negocio ahora
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
// import { Wallet, EyeAlt, BarChart } from "@iconoir/vue";
</script>
