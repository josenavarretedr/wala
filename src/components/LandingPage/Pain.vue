<template>
  <section class="py-20 md:py-28 px-4 bg-white relative overflow-hidden">
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
          Trabajas todos los días. Pero algo no cuadra.
        </h2>

        <div class="max-w-3xl mx-auto space-y-4">
          <div class="flex items-start gap-3 text-left">
            <Check class="w-5 h-5 text-[#E35336] mt-1" />
            <p class="text-base sm:text-lg text-gray-600">
              Vendes, pero al final del mes no sabes si ganaste o solo
              sobreviviste
            </p>
          </div>
          <div class="flex items-start gap-3 text-left">
            <Check class="w-5 h-5 text-[#E35336] mt-1" />
            <p class="text-base sm:text-lg text-gray-600">
              Mezclas el dinero del negocio con el de tu casa sin querer
            </p>
          </div>
          <div class="flex items-start gap-3 text-left">
            <Check class="w-5 h-5 text-[#E35336] mt-1" />
            <p class="text-base sm:text-lg text-gray-600">
              Fijas precios a ojo porque calcular costos te parece complicado
            </p>
          </div>
        </div>

        <p class="text-lg sm:text-xl text-gray-700 font-medium">
          Eso no es falta de esfuerzo. Es falta de claridad. Y tiene solución.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { Check } from "@iconoir/vue";
</script>
