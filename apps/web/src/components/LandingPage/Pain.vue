<template>
  <section
    id="pain-section"
    class="py-16 sm:py-24 px-4 bg-transparent relative overflow-hidden font-display"
  >
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
      <div class="text-center space-y-5">
        <!-- Badge -->
        <span
          class="inline-block px-4 py-1.5 bg-red-50 border border-red-200 text-[#E35336] text-xs font-bold uppercase tracking-wider rounded-full"
        >
          Síntomas de Caos
        </span>

        <h2
          class="text-3xl sm:text-4xl md:text-5xl text-gray-900 font-extrabold leading-tight max-w-3xl mx-auto"
        >
          Trabajas todos los días. Pero
          <span class="text-[#E35336]">algo no cuadra</span>.
        </h2>

        <p
          class="text-base sm:text-lg text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed"
        >
          Vendes y mueves dinero, pero a fin de mes no sabes con certeza cuánto
          quedó en tu bolsillo ni dónde está la fuga.
        </p>

        <!-- Grid de 3 Tarjetas -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 text-left">
          <!-- Card 1 -->
          <div
            class="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 space-y-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          >
            <div
              class="w-12 h-12 rounded-xl bg-red-50 text-[#E35336] flex items-center justify-center shadow-inner"
            >
              <Coins class="w-6 h-6 stroke-[2]" />
            </div>
            <div class="space-y-2">
              <h3 class="text-lg font-extrabold text-gray-900">
                El dinero se esfuma
              </h3>
              <p class="text-sm text-gray-600 font-medium leading-relaxed">
                Vendes todos los días, pero al cerrar el mes no sabes si
                realmente ganaste o solo sobreviviste moviendo efectivo y Yape.
              </p>
            </div>
          </div>

          <!-- Card 2 -->
          <div
            class="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 space-y-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          >
            <div
              class="w-12 h-12 rounded-xl bg-red-50 text-[#E35336] flex items-center justify-center shadow-inner"
            >
              <Group class="w-6 h-6 stroke-[2]" />
            </div>
            <div class="space-y-2">
              <h3 class="text-lg font-extrabold text-gray-900">
                Cuentas mezcladas
              </h3>
              <p class="text-sm text-gray-600 font-medium leading-relaxed">
                Sacas plata del negocio para gastos personales sin un sueldo
                definido y sin registrar el costo real de tu tiempo.
              </p>
            </div>
          </div>

          <!-- Card 3 -->
          <div
            class="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 space-y-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          >
            <div
              class="w-12 h-12 rounded-xl bg-red-50 text-[#E35336] flex items-center justify-center shadow-inner"
            >
              <WarningTriangle class="w-6 h-6 stroke-[2]" />
            </div>
            <div class="space-y-2">
              <h3 class="text-lg font-extrabold text-gray-900">
                Decisiones a ojo
              </h3>
              <p class="text-sm text-gray-600 font-medium leading-relaxed">
                Fijas precios por intuición, compras mercadería sin medir
                rotación o ya anotas datos sueltos pero no sabes qué decisión
                tomar.
              </p>
            </div>
          </div>
        </div>

        <p
          class="text-lg sm:text-xl text-gray-700 font-semibold pt-6 max-w-2xl mx-auto"
        >
          No es falta de esfuerzo. Es
          <span class="text-[#E35336] font-bold"
            >falta de visibilidad y método</span
          >.
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
