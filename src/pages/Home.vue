<template>
  <div
    class="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 py-12"
  >
    <!-- Título principal -->
    <h1
      class="text-4xl md:text-5xl font-bold text-center text-gray-800 mb-8 leading-tight"
    >
      Lleva el control de tu negocio con claridad y confianza
    </h1>

    <!-- Sección de beneficios -->
    <div class="grid gap-6 md:grid-cols-3 w-full max-w-5xl">
      <!-- Registro -->
      <div class="bg-white p-6 rounded-xl shadow-lg text-center space-y-4">
        <Wallet class="w-12 h-12 mx-auto text-blue-500" />
        <h2 class="text-xl font-semibold text-gray-800">
          Registro simple y rápido
        </h2>
        <p class="text-gray-600 text-lg">
          Registra tus ingresos y salidas de dinero en segundos.
        </p>
      </div>

      <!-- Tranquilidad -->
      <div class="bg-white p-6 rounded-xl shadow-lg text-center space-y-4">
        <ShieldCheck class="w-12 h-12 mx-auto text-green-500" />
        <h2 class="text-xl font-semibold text-gray-800">Mayor tranquilidad</h2>
        <p class="text-gray-600 text-lg">
          Visualiza con claridad cómo se mueven los gastos del negocio.
        </p>
      </div>

      <!-- Productos más vendidos -->
      <div class="bg-white p-6 rounded-xl shadow-lg text-center space-y-4">
        <Spiral class="w-12 h-12 mx-auto text-purple-500" />
        <h2 class="text-xl font-semibold text-gray-800">
          Productos más movidos
        </h2>
        <p class="text-gray-600 text-lg">
          Descubre qué productos generan más ingresos.
        </p>
      </div>
    </div>

    <!-- CTA (Call to Action) -->
    <div class="mt-12">
      <RouterLink
        to="/auth/register"
        class="bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold px-8 py-4 rounded-full shadow-md transition-all"
      >
        ¡Empieza ahora gratis!
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { Wallet, ShieldCheck, Spiral } from "@iconoir/vue";
</script>
