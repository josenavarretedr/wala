<template>
  <section id="pain-section" class="py-20 md:py-28 px-4 bg-transparent relative overflow-hidden font-display">
    <div
      class="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10"
    >
      <div
        class="absolute top-0 right-0 w-96 h-96 bg-orange-50 rounded-full filter blur-3xl opacity-20"
      ></div>
      <div
        class="absolute bottom-0 left-0 w-96 h-96 bg-emerald-50 rounded-full filter blur-3xl opacity-10"
      ></div>
    </div>

    <div class="max-w-6xl mx-auto">
      <div class="text-center space-y-6">
        <!-- Badge -->
        <span
          class="inline-block px-4 py-1.5 bg-red-50 border border-red-150 text-[#E35336] text-xs font-bold uppercase tracking-wider rounded-full"
        >
          Síntomas de Caos
        </span>

        <h2
          class="text-3xl sm:text-4xl md:text-5xl text-gray-900 font-extrabold leading-tight max-w-3xl mx-auto"
        >
          Trabajas todos los días. Pero <span class="text-[#E35336]">algo no cuadra</span>.
        </h2>
        
        <p class="text-base sm:text-lg text-gray-500 font-medium max-w-xl mx-auto leading-relaxed">
          Muchos emprendedores viven con la sensación constante de que el esfuerzo no se refleja en la cuenta bancaria.
        </p>

        <!-- Grid de 3 Tarjetas de Dolor Premium -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 text-left">
          <!-- Card 1: Dinero se esfuma -->
          <div class="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 space-y-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div class="w-12 h-12 rounded-xl bg-red-50 text-[#E35336] flex items-center justify-center shadow-inner">
              <Coins class="w-6 h-6 stroke-[2]" />
            </div>
            <div class="space-y-2">
              <h4 class="text-lg font-extrabold text-gray-900">El dinero se esfuma</h4>
              <p class="text-sm text-gray-500 font-semibold leading-relaxed">
                Vendes, pero al final del mes <span class="text-[#E35336] font-extrabold">no sabes si ganaste</span> o solo sobreviviste moviendo efectivo.
              </p>
            </div>
          </div>

          <!-- Card 2: Mezcla de caja -->
          <div class="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 space-y-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div class="w-12 h-12 rounded-xl bg-red-50 text-[#E35336] flex items-center justify-center shadow-inner">
              <Group class="w-6 h-6 stroke-[2]" />
            </div>
            <div class="space-y-2">
              <h4 class="text-lg font-extrabold text-gray-900">Cuentas Mezcladas</h4>
              <p class="text-sm text-gray-500 font-semibold leading-relaxed">
                <span class="text-[#E35336] font-extrabold">Mezclas el dinero</span> del negocio con el de tu hogar de forma descontrolada y sin un sueldo fijo.
              </p>
            </div>
          </div>

          <!-- Card 3: Precios a ciegas -->
          <div class="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 space-y-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div class="w-12 h-12 rounded-xl bg-red-50 text-[#E35336] flex items-center justify-center shadow-inner">
              <WarningTriangle class="w-6 h-6 stroke-[2]" />
            </div>
            <div class="space-y-2">
              <h4 class="text-lg font-extrabold text-gray-900">Precios a Ciegas</h4>
              <p class="text-sm text-gray-500 font-semibold leading-relaxed">
                Fijas precios por copia o intuición porque <span class="text-[#E35336] font-extrabold">calcular tus costos reales</span> te parece un dolor de cabeza.
              </p>
            </div>
          </div>
        </div>

        <p class="text-lg sm:text-xl text-gray-700 font-medium pt-8 max-w-2xl mx-auto">
          Eso no es falta de esfuerzo. Es <span class="text-[#E35336] font-bold">falta de claridad</span>. Y tiene una <span class="text-[#E35336] font-bold">solución muy simple</span>.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { Coins, Group, WarningTriangle } from "@iconoir/vue";
</script>

<style scoped>
.font-display {
  font-family: "Outfit", "Inter", sans-serif;
}
</style>
