<template>
  <section class="py-20 md:py-28 px-4 bg-transparent relative overflow-hidden">
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
        <h2
          class="text-3xl sm:text-4xl md:text-5xl text-gray-900 font-extrabold leading-tight"
        >
          Trabajas todos los días. Pero <span class="text-[#E35336]">algo no cuadra</span>.
        </h2>

        <div class="max-w-3xl mx-auto space-y-4">
          <div class="flex items-start gap-3 text-left">
            <Check class="w-5 h-5 text-[#E35336] mt-1" />
            <p class="text-base sm:text-lg text-gray-600">
              Vendes, pero al final del mes <span class="text-[#E35336] font-semibold">no sabes si ganaste</span> o solo sobreviviste
            </p>
          </div>
          <div class="flex items-start gap-3 text-left">
            <Check class="w-5 h-5 text-[#E35336] mt-1" />
            <p class="text-base sm:text-lg text-gray-600">
              <span class="text-[#E35336] font-semibold">Mezclas el dinero</span> del negocio con el de tu casa sin querer
            </p>
          </div>
          <div class="flex items-start gap-3 text-left">
            <Check class="w-5 h-5 text-[#E35336] mt-1" />
            <p class="text-base sm:text-lg text-gray-600">
              Fijas precios a ojo porque <span class="text-[#E35336] font-semibold">calcular costos</span> te parece complicado
            </p>
          </div>
        </div>

        <p class="text-lg sm:text-xl text-gray-700 font-medium">
          Eso no es falta de esfuerzo. Es <span class="text-[#E35336] font-semibold">falta de claridad</span>. Y tiene <span class="text-[#E35336] font-semibold">solución</span>.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { Check } from "@iconoir/vue";
</script>
