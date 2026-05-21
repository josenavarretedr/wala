<template>
  <section class="py-20 md:py-28 px-4 bg-transparent relative overflow-hidden">
    <div
      class="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10"
    >
      <div
        class="absolute top-1/3 left-1/3 w-96 h-96 bg-orange-50 rounded-full filter blur-3xl opacity-10"
      ></div>
      <div
        class="absolute bottom-1/3 right-1/3 w-96 h-96 bg-emerald-50 rounded-full filter blur-3xl opacity-10"
      ></div>
    </div>

    <div class="max-w-5xl mx-auto">
      <h2
        class="text-3xl sm:text-4xl md:text-5xl text-gray-900 font-extrabold leading-tight text-center mb-12"
      >
        Así es el diagnóstico gratuito
      </h2>

      <div class="space-y-6">
        <div
          class="grid grid-cols-1 sm:grid-cols-[80px_1fr] gap-4 bg-white/95 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm p-6 transition-all duration-300 hover:shadow-premium hover:-translate-y-1 scroll-fade-up"
        >
          <div
            class="w-12 h-12 rounded-full bg-[#E35336]/10 flex items-center justify-center"
          >
            <Calendar class="w-5 h-5 text-[#E35336]" />
          </div>
          <div class="flex flex-col justify-center">
            <span
              class="text-xs font-bold uppercase tracking-widest text-[#E35336] mb-1"
            >
              Paso 1
            </span>
            <h3 class="text-xl font-extrabold text-gray-900 mb-1">Agendas</h3>
            <p class="text-base text-gray-600 leading-relaxed">
              Me escribes por
              <span class="text-[#E35336] font-semibold">WhatsApp</span> y
              coordinamos una reunión de
              <span class="text-gray-900 font-semibold">20 minutos</span> esta
              semana
            </p>
          </div>
        </div>

        <div
          class="grid grid-cols-1 sm:grid-cols-[80px_1fr] gap-4 bg-white/95 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm p-6 transition-all duration-300 hover:shadow-premium hover:-translate-y-1 scroll-fade-up delay-100"
        >
          <div
            class="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center"
          >
            <GraphUp class="w-5 h-5 text-blue-600" />
          </div>
          <div class="flex flex-col justify-center">
            <span
              class="text-xs font-bold uppercase tracking-widest text-blue-600 mb-1"
            >
              Paso 2
            </span>
            <h3 class="text-xl font-extrabold text-gray-900 mb-1">
              Diagnóstico
            </h3>
            <p class="text-base text-gray-600 leading-relaxed">
              Evaluamos las
              <span class="text-blue-600 font-semibold"
                >7 áreas de tu negocio</span
              >
              y encontramos los
              <span class="text-gray-900 font-semibold">3 frenos reales</span>
            </p>
          </div>
        </div>

        <div
          class="grid grid-cols-1 sm:grid-cols-[80px_1fr] gap-4 bg-white/95 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm p-6 transition-all duration-300 hover:shadow-premium hover:-translate-y-1 scroll-fade-up delay-200"
        >
          <div
            class="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center"
          >
            <BookStack class="w-5 h-5 text-emerald-600" />
          </div>
          <div class="flex flex-col justify-center">
            <span
              class="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-1"
            >
              Paso 3
            </span>
            <h3 class="text-xl font-extrabold text-gray-900 mb-1">
              Plan claro
            </h3>
            <p class="text-base text-gray-600 leading-relaxed">
              Te vas con un
              <span class="text-emerald-600 font-semibold">plan concreto</span>
              — y con la decisión de si quieres seguir acompañado o usar
              <span class="text-[#E35336] font-semibold">WALA solo</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { BookStack, Calendar, GraphUp } from "@iconoir/vue";
</script>
