<template>
  <section class="bg-slate-50 py-14 sm:py-20 px-4">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center max-w-6xl mx-auto">
      <div class="lg:col-span-7 space-y-6">
        <div
          class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-medium tracking-wide"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-[#E35336]"></span>
          <span>Sesión Diagnóstica 1:1 · Cupos limitados por mes</span>
        </div>

        <h1 class="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-slate-900 leading-[1.15] tracking-tight">
          Encuentra en 30 minutos exactamente dónde está perdiendo
          <span class="text-[#E35336]">plata y control</span> tu negocio.
        </h1>

        <p class="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
          Una auditoría operativa 1:1 con José Navarrete sobre las 7 áreas críticas de gestión. Sales sabiendo dónde estás parado, cuáles son tus 3 frenos prioritarios y qué corregir primero.
        </p>

        <div class="space-y-3 pt-1">
          <a
            href="#agendar"
            class="inline-flex items-center justify-center gap-2 w-full sm:w-auto bg-[#E35336] hover:bg-[#c2412b] text-white font-semibold text-base px-6 py-3.5 rounded-xl transition-colors duration-200 shadow-sm"
          >
            <span>Solicitar mi diagnóstico gratuito (30 min)</span>
            <ArrowRight class="w-4 h-4 stroke-[2.2] shrink-0" />
          </a>

          <p class="text-xs sm:text-sm text-slate-500">
            Videollamada privada · Sin compromiso comercial · Metodología alineada a OIT.
          </p>
        </div>
      </div>

      <div class="lg:col-span-5">
        <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div class="flex items-center gap-4">
            <img
              v-if="LANDING_ASSETS.joseOperador && !imgError"
              :src="LANDING_ASSETS.joseOperador"
              alt="José Navarrete, Fundador de WALA"
              class="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
              @error="imgError = true"
            />
            <div
              v-else
              class="w-16 h-16 rounded-xl bg-slate-900 text-white font-display font-bold text-xl flex items-center justify-center shrink-0 tracking-tight"
              aria-hidden="true"
            >
              JN
            </div>

            <div class="min-w-0">
              <h2 class="font-display font-bold text-lg text-slate-900 leading-snug">
                José Navarrete
              </h2>
              <p class="text-sm text-slate-600">
                Fundador de WALA · Metodólogo Empresarial
              </p>
            </div>
          </div>

          <div class="border-t border-slate-100 pt-4 space-y-3">
            <div
              v-for="credential in credentials"
              :key="credential"
              class="flex items-start gap-2.5 text-sm text-slate-700 leading-relaxed"
            >
              <Check class="w-4 h-4 text-[#E35336] stroke-[2.5] shrink-0 mt-0.5" />
              <span>{{ credential }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import { ArrowRight, Check } from '@iconoir/vue';
import { LANDING_ASSETS } from '@/config/landingAssets';

// TODO: Subir apps/web/src/assets/landing/jose-operador.webp
const imgError = ref(false);

const credentials = [
  'Metodología alineada a SIYB / MESUN (OIT)',
  'Fundador de WALA, plataforma financiera y operativa para negocios en LATAM',
  'Jurado en programas de fortalecimiento empresarial (Crece Emprendedora · UE / Cooperación Alemana)',
];
</script>
