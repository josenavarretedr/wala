<template>
  <section class="bg-white border-y border-slate-200 py-16 sm:py-20 px-4">
    <div class="max-w-5xl mx-auto">
      <h2 class="font-display text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-10">
        ¿Este diagnóstico es para tu negocio hoy?
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-slate-50/70 border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle class="w-5 h-5 stroke-[2]" />
            </div>
            <h3 class="font-display font-bold text-lg text-slate-900">
              Sí es para ti si:
            </h3>
          </div>

          <ul class="space-y-3.5 text-sm sm:text-base text-slate-700 leading-relaxed">
            <li
              v-for="item in fitItems"
              :key="item"
              class="flex items-start gap-2.5"
            >
              <Check class="w-4 h-4 text-emerald-700 stroke-[2.5] shrink-0 mt-1" />
              <span>{{ item }}</span>
            </li>
          </ul>
        </div>

        <div class="bg-slate-50/70 border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center shrink-0">
              <XmarkCircle class="w-5 h-5 stroke-[2]" />
            </div>
            <h3 class="font-display font-bold text-lg text-slate-900">
              Aún no es el momento si:
            </h3>
          </div>

          <ul class="space-y-4 text-sm sm:text-base text-slate-600 leading-relaxed">
            <li class="flex items-start gap-2.5">
              <Minus class="w-4 h-4 text-slate-500 stroke-[2.5] shrink-0 mt-1" />
              <div>
                <p>Todavía estás en fase de idea o aún no tienes ventas constantes.</p>
                <router-link
                  :to="REGISTER_PATH"
                  class="inline-block mt-1.5 text-sm font-semibold text-[#E35336] hover:text-[#c2412b] underline underline-offset-4"
                >
                  Empieza gratis ordenando tus primeras ventas en WALA →
                </router-link>
              </div>
            </li>
            <li class="flex items-start gap-2.5">
              <Minus class="w-4 h-4 text-slate-500 stroke-[2.5] shrink-0 mt-1" />
              <span>Buscas motivación genérica o fórmulas rápidas sin cambiar cómo registras y decides.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { Check, CheckCircle, Minus, XmarkCircle } from '@iconoir/vue';
import { REGISTER_PATH } from '@/config/ctaLinks';

const fitItems = [
  'Tu negocio ya factura de forma recurrente (local, operación digital, equipo o inventario).',
  'Sientes que vendes, pero la utilidad no se refleja en caja o dependes de tu fuerza bruta para que todo camine.',
  'Estás dispuesto a mirar tus números reales con honestidad para tomar decisiones concretas.',
];
</script>
