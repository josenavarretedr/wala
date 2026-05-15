<template>
  <section class="py-20 md:py-28 px-4 bg-white relative overflow-hidden">
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

      <div class="space-y-4">
        <div
          class="grid grid-cols-1 sm:grid-cols-[80px_1fr] gap-4 bg-white rounded-xl border border-gray-100 shadow-sm p-6"
        >
          <div
            class="w-12 h-12 rounded-full bg-[#E35336]/10 flex items-center justify-center"
          >
            <Calendar class="w-5 h-5 text-[#E35336]" />
          </div>
          <div>
            <p class="text-sm font-semibold text-gray-900">Paso 1</p>
            <p class="text-base sm:text-lg text-gray-700">
              Agendas — Me escribes por WhatsApp y coordinamos 20 minutos esta
              semana
            </p>
          </div>
        </div>

        <div
          class="grid grid-cols-1 sm:grid-cols-[80px_1fr] gap-4 bg-white rounded-xl border border-gray-100 shadow-sm p-6"
        >
          <div
            class="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center"
          >
            <GraphUp class="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p class="text-sm font-semibold text-gray-900">Paso 2</p>
            <p class="text-base sm:text-lg text-gray-700">
              Diagnóstico — Evaluamos las 7 áreas de tu negocio y encontramos
              los 3 frenos reales
            </p>
          </div>
        </div>

        <div
          class="grid grid-cols-1 sm:grid-cols-[80px_1fr] gap-4 bg-white rounded-xl border border-gray-100 shadow-sm p-6"
        >
          <div
            class="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center"
          >
            <BookStack class="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p class="text-sm font-semibold text-gray-900">Paso 3</p>
            <p class="text-base sm:text-lg text-gray-700">
              Plan claro — Te vas con un plan concreto — y con la decisión de si
              quieres seguir acompañado o usar WALA solo
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

