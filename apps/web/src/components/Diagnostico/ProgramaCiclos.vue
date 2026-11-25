<template>
  <section class="bg-white border-y border-slate-200 py-16 sm:py-20 px-4">
    <div class="max-w-6xl mx-auto">
      <div class="max-w-3xl mx-auto text-center space-y-3 mb-12">
        <span class="inline-block px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium tracking-wide">
          Si decides continuar acompañado
        </span>
        <h2 class="font-display text-2xl sm:text-3xl font-bold text-slate-900">
          Así funciona el acompañamiento 1:1 del Método WALA
        </h2>
        <p class="text-sm sm:text-base text-slate-600 leading-relaxed">
          Dos meses de trabajo focalizado en tus 3 áreas críticas para pasar de apagar incendios a operar con números claros.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          v-for="cycle in cycles"
          :key="cycle.title"
          class="bg-slate-50/70 border border-slate-200 rounded-2xl p-6 space-y-3"
        >
          <div class="w-9 h-9 rounded-lg bg-white border border-slate-200 text-[#E35336] flex items-center justify-center">
            <component :is="cycle.icon" class="w-4 h-4 stroke-[2]" />
          </div>
          <h3 class="font-display font-bold text-lg text-slate-900">
            {{ cycle.title }}
          </h3>
          <p class="text-sm sm:text-base text-slate-600 leading-relaxed">
            {{ cycle.description }}
          </p>
        </div>
      </div>

      <div class="mt-8 bg-[#FFF5F2] border border-[#E35336]/25 rounded-2xl p-6 space-y-2 text-sm sm:text-base text-slate-800 leading-relaxed">
        <p class="font-medium">
          Incluye: 7 sesiones privadas en 2 meses + acceso completo a WALA Pro + Expediente de Seguimiento con trazabilidad.
        </p>
        <p class="text-slate-700">
          <span class="font-semibold text-slate-900">Garantía de Claridad Total:</span> Si tras 2 meses de acompañamiento no tienes más claridad sobre tu negocio que hoy, no te cobramos.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ClipboardCheck, GraphUp, ShieldCheck } from '@iconoir/vue';

const cycles = [
  {
    title: 'Ciclo 1 · Comprensión y arranque',
    description:
      'Bajamos a tierra tus 3 frenos críticos y co-diseñamos tu primer plan de acción sobre tu operación real.',
    icon: ClipboardCheck,
  },
  {
    title: 'Ciclo 2 · Ajuste y consolidación',
    description:
      'Medimos cumplimiento sesión a sesión, corregimos desvíos en caja, costos o stock y fortalecemos el hábito.',
    icon: GraphUp,
  },
  {
    title: 'Ciclo 3 · Autonomía y cierre',
    description:
      'Reevaluamos tus 21 indicadores (comparativa Pre vs. Post) para dejarte operando de forma autónoma con tu Expediente WALA.',
    icon: ShieldCheck,
  },
];
</script>
