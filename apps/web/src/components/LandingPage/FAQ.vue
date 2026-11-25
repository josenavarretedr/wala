<template>
  <section
    id="faq-section"
    class="py-20 md:py-28 px-4 bg-transparent relative overflow-hidden font-display"
  >
    <div class="max-w-4xl mx-auto">
      <div class="text-center space-y-4 mb-14">
        <span
          class="inline-block px-4 py-1.5 bg-orange-50 border border-orange-100 text-[#E35336] text-xs font-bold uppercase tracking-wider rounded-full"
        >
          Preguntas Frecuentes
        </span>
        <h2
          class="text-3xl sm:text-4xl md:text-5xl text-gray-900 font-extrabold leading-tight max-w-2xl mx-auto"
        >
          Resolvemos tus <span class="text-[#E35336]">dudas</span> antes de empezar
        </h2>
        <p class="text-base sm:text-lg text-gray-600 font-medium max-w-xl mx-auto">
          Todo lo que necesitas saber sobre la aplicación y el acompañamiento del Método WALA.
        </p>
      </div>

      <!-- Accordion accesible -->
      <div class="space-y-4 mb-10">
        <div
          v-for="(item, index) in faqs"
          :key="item.question"
          class="bg-white rounded-2xl border transition-all duration-200"
          :class="
            openQuestion === index
              ? 'border-[#E35336]/40 shadow-md'
              : 'border-slate-200 shadow-sm hover:border-slate-300'
          "
        >
          <button
            type="button"
            class="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E35336]/40 rounded-2xl"
            :aria-expanded="openQuestion === index"
            :aria-controls="`faq-panel-${index}`"
            @click="toggleQuestion(index)"
          >
            <span class="text-base sm:text-lg font-bold text-gray-900 leading-snug">
              {{ item.question }}
            </span>
            <span
              class="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 text-gray-500 transition-colors"
              :class="openQuestion === index ? 'bg-[#FFF5F2] border-[#E35336]/20 text-[#E35336]' : ''"
            >
              <NavArrowDown
                class="w-4 h-4 stroke-[2.2] transition-transform duration-200"
                :class="openQuestion === index ? 'rotate-180' : ''"
              />
            </span>
          </button>

          <div
            v-show="openQuestion === index"
            :id="`faq-panel-${index}`"
            class="px-5 sm:px-6 pb-5 sm:pb-6 pt-0 text-sm sm:text-base text-gray-600 font-medium leading-relaxed border-t border-slate-100"
          >
            <p class="pt-4">{{ item.answer }}</p>
          </div>
        </div>
      </div>

      <!-- Card de ayuda adicional por WhatsApp -->
      <div
        class="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6"
      >
        <div class="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
          <div
            class="w-12 h-12 rounded-2xl bg-[#FFF5F2] border border-[#E35336]/20 text-[#E35336] flex items-center justify-center shrink-0"
          >
            <MessageText class="w-6 h-6 stroke-[2]" />
          </div>
          <div class="space-y-1">
            <h3 class="text-lg font-extrabold text-gray-900">
              ¿Tienes otra pregunta sobre tu negocio?
            </h3>
            <p class="text-sm text-gray-600 font-medium">
              El equipo WALA responde tus consultas por WhatsApp.
            </p>
          </div>
        </div>

        <a
          :href="soporteWhatsAppUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="w-full sm:w-auto inline-flex items-center justify-center gap-2 border-2 border-[#E35336] text-[#E35336] hover:bg-[#E35336] hover:text-white px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 shrink-0"
        >
          <span>Escribir por WhatsApp</span>
          <ArrowRight class="w-4 h-4 stroke-[2.5]" />
        </a>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";
import { ArrowRight, MessageText, NavArrowDown } from "@iconoir/vue";
import { buildWhatsAppUrl, DEFAULT_SOPORTE_MESSAGE } from "@/config/ctaLinks";

const openQuestion = ref(null);
const soporteWhatsAppUrl = buildWhatsAppUrl(DEFAULT_SOPORTE_MESSAGE);

const faqs = [
  {
    question: "¿Necesito saber contabilidad o Excel para usar WALA?",
    answer:
      "No. WALA traduce tus movimientos diarios en mensajes claros para que sepas cuánto vendes, cuánto gastas y cuánto te queda sin tecnicismos.",
  },
  {
    question:
      "¿Cuál es la diferencia entre WALA Gratis, WALA Pro y el Acompañamiento 1:1?",
    answer:
      "Freemium te permite salir del cuaderno; WALA Pro te da reportes y alertas automáticas para ver tu negocio claro; el Acompañamiento 1:1 suma el criterio de un asesor durante 2 meses (3 ciclos / 7 sesiones) sobre tus 3 áreas críticas con WALA Pro incluido.",
  },
  {
    question: "¿El diagnóstico de 30 minutos tiene algún costo o compromiso?",
    answer:
      "Ninguno. Es 100% gratuito. Al terminar conoces tu estado actual en las 7 áreas y decides si te basta con la app o si te conviene entrar al programa 1:1.",
  },
  {
    question: "¿Tengo que descargar una aplicación pesada en mi celular?",
    answer:
      "No. Funciona directo desde el navegador de tu celular o computadora, sin ocupar memoria.",
  },
];

const toggleQuestion = (index) => {
  openQuestion.value = openQuestion.value === index ? null : index;
};
</script>

<style scoped>
.font-display {
  font-family: "Outfit", "Inter", sans-serif;
}
</style>
