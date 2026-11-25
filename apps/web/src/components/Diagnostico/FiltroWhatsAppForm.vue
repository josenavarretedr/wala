<template>
  <section id="agendar" class="bg-slate-50 py-16 sm:py-24 px-4">
    <div class="max-w-2xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-sm">
      <div class="space-y-2">
        <h2 class="font-display text-2xl sm:text-3xl font-bold text-slate-900">
          Solicita tu diagnóstico gratuito de 30 minutos
        </h2>
        <p class="text-sm sm:text-base text-slate-600 leading-relaxed">
          Responde estos 4 datos breves para confirmar si el diagnóstico 1:1 es la mejor opción para tu etapa actual.
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="space-y-1.5">
          <label for="diag-nombre" class="block text-sm font-medium text-slate-800">
            Tu nombre
          </label>
          <input
            id="diag-nombre"
            v-model="form.nombre"
            type="text"
            required
            data-preserve-case="true"
            placeholder="Ej. María Mendoza"
            class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#E35336] focus:outline-none focus:ring-2 focus:ring-[#E35336]/20"
          />
        </div>

        <div class="space-y-1.5">
          <label for="diag-negocio" class="block text-sm font-medium text-slate-800">
            Rubro de tu negocio y ciudad
          </label>
          <input
            id="diag-negocio"
            v-model="form.negocio"
            type="text"
            required
            data-preserve-case="true"
            placeholder="Ej. Distribuidora de insumos, Chiclayo"
            class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#E35336] focus:outline-none focus:ring-2 focus:ring-[#E35336]/20"
          />
        </div>

        <fieldset class="space-y-2.5">
          <legend class="block text-sm font-medium text-slate-800">
            Situación actual de tu negocio
          </legend>
          <div class="space-y-2.5">
            <label
              v-for="option in etapas"
              :key="option.value"
              class="flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors duration-150"
              :class="
                form.etapa === option.value
                  ? 'border-[#E35336] bg-[#FFF5F2]/60'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              "
            >
              <input
                v-model="form.etapa"
                type="radio"
                name="etapa"
                :value="option.value"
                required
                class="mt-1 accent-[#E35336] shrink-0"
              />
              <span class="text-sm text-slate-800 leading-snug">
                {{ option.label }}
              </span>
            </label>
          </div>
        </fieldset>

        <div class="space-y-1.5">
          <label for="diag-freno" class="block text-sm font-medium text-slate-800">
            Principal freno hoy
          </label>
          <select
            id="diag-freno"
            v-model="form.freno"
            required
            class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-[#E35336] focus:outline-none focus:ring-2 focus:ring-[#E35336]/20"
          >
            <option value="" disabled>Selecciona una opción</option>
            <option v-for="option in frenos" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
        </div>

        <div
          v-if="form.etapa === 'etapa_0'"
          class="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-4"
        >
          <p class="text-sm text-slate-800 leading-relaxed">
            Por la etapa actual de tu negocio, lo más rentable para ti hoy no es una consultoría 1:1, sino empezar a registrar tus primeras ventas y gastos sin complicarte. Te recomendamos crear tu cuenta gratis en WALA y cuando tengas movimiento constante, agendamos tu diagnóstico.
          </p>

          <router-link
            :to="REGISTER_PATH"
            class="inline-flex items-center justify-center w-full bg-[#E35336] hover:bg-[#c2412b] text-white font-semibold text-sm sm:text-base px-6 py-3.5 rounded-xl transition-colors duration-200"
          >
            Crear mi cuenta gratis en WALA →
          </router-link>

          <div class="text-center">
            <a
              :href="buildWhatsAppUrl(DEFAULT_ETAPA0_CONSULTA_MESSAGE)"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-block text-xs sm:text-sm text-slate-600 hover:text-slate-900 underline underline-offset-4"
            >
              Igual tengo una consulta rápida por WhatsApp
            </a>
          </div>
        </div>

        <button
          v-else
          type="submit"
          :disabled="!isFormValid"
          class="w-full bg-[#E35336] hover:bg-[#c2412b] text-white font-semibold text-sm sm:text-base px-6 py-3.5 rounded-xl transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Agendar mi diagnóstico de 30 min por WhatsApp →
        </button>
      </form>
    </div>
  </section>
</template>

<script setup>
import { computed, reactive } from 'vue';
import {
  DEFAULT_ETAPA0_CONSULTA_MESSAGE,
  REGISTER_PATH,
  buildWhatsAppUrl,
} from '@/config/ctaLinks';

const etapas = [
  {
    value: 'etapa_0',
    label: 'Aún estoy por empezar o todavía no tengo ventas constantes',
  },
  {
    value: 'etapa_1',
    label: 'Ya facturo todos los meses (operación personal o equipo pequeño) y siento desorden',
  },
  {
    value: 'etapa_2',
    label: 'Ya facturo con equipo o inventario y necesito ordenar utilidad, costos y control',
  },
];

const frenos = [
  'Vendo pero no sé cuánto gano realmente / cuentas mezcladas',
  'Precios y costeo a ojo (no sé si cubro todos mis gastos)',
  'Inventario, compras o cuentas por cobrar sin control',
  'Falta de planificación / vivo apagando incendios cada semana',
];

const form = reactive({
  nombre: '',
  negocio: '',
  etapa: '',
  freno: '',
});

const isFormValid = computed(() => {
  return Boolean(
    form.nombre.trim() &&
      form.negocio.trim() &&
      (form.etapa === 'etapa_1' || form.etapa === 'etapa_2') &&
      form.freno
  );
});

function handleSubmit() {
  if (!isFormValid.value) return;

  const selectedEtapa = etapas.find((item) => item.value === form.etapa);
  const etapaLabel = selectedEtapa ? selectedEtapa.label : '';

  const message = [
    'Hola José, solicito mi diagnóstico gratuito de 30 minutos desde wala.lat/diagnostico.',
    `• Nombre: ${form.nombre.trim()}`,
    `• Negocio/Ciudad: ${form.negocio.trim()}`,
    `• Situación actual: ${etapaLabel}`,
    `• Principal freno hoy: ${form.freno}`,
    '¿Qué horarios tienes disponibles esta semana?',
  ].join('\n');

  window.open(buildWhatsAppUrl(message), '_blank', 'noopener,noreferrer');
}
</script>
