<template>
  <section
    id="escalera"
    class="py-20 md:py-28 px-4 bg-transparent relative overflow-hidden font-display"
  >
    <div
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-50/30 rounded-full blur-3xl pointer-events-none -z-10"
    ></div>

    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="text-center space-y-4 mb-14 md:mb-16">
        <span
          class="inline-block px-4 py-1.5 bg-orange-50 border border-orange-100 text-[#E35336] text-xs font-bold uppercase tracking-wider rounded-full"
        >
          Crece a Tu Ritmo
        </span>
        <h2
          class="text-3xl sm:text-4xl md:text-5xl text-gray-900 font-extrabold leading-tight max-w-3xl mx-auto"
        >
          Un solo sistema, <span class="text-[#E35336]">tres niveles</span> de claridad
        </h2>
        <p
          class="text-base sm:text-lg text-gray-600 font-medium max-w-2xl mx-auto leading-relaxed"
        >
          Empieza ordenando tu día a día gratis, activa reportes avanzados cuando necesites precisión o trabaja 1:1 para destrabar tu negocio en 2 meses.
        </p>
      </div>

      <!-- Grid de 3 niveles -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <!-- Tarjeta 1 — Nivel 1 · WALA Freemium -->
        <div
          class="bg-white rounded-3xl border border-slate-200 shadow-sm p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
        >
          <div class="space-y-6">
            <div class="space-y-2">
              <span
                class="inline-block text-[11px] font-bold uppercase tracking-widest text-slate-500"
              >
                Nivel 1
              </span>
              <h3 class="text-2xl font-extrabold text-gray-900">
                WALA Freemium
              </h3>
              <p class="text-lg font-extrabold text-[#E35336]">
                Gratis para siempre
              </p>
              <p class="text-sm text-gray-600 font-medium leading-relaxed pt-1">
                Quieres salir del cuaderno y registrar tu operación hoy.
              </p>
            </div>

            <ul class="space-y-3 pt-2 border-t border-slate-100">
              <li
                v-for="item in freemiumBullets"
                :key="item"
                class="flex items-start gap-3 text-sm text-gray-700 font-medium"
              >
                <span
                  class="p-1 bg-emerald-50 text-emerald-600 rounded-lg shrink-0 mt-0.5"
                >
                  <Check class="w-3.5 h-3.5 stroke-[3]" />
                </span>
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>

          <div class="mt-8 space-y-3">
            <p class="text-xs text-gray-500 font-medium text-center">
              Sin tarjeta de crédito.
            </p>
            <router-link
              :to="REGISTER_PATH"
              class="w-full inline-flex items-center justify-center gap-2 border-2 border-[#E35336] text-[#E35336] hover:bg-[#E35336]/10 px-6 py-3.5 rounded-2xl font-bold text-sm sm:text-base transition-all duration-200"
            >
              <span>Crear cuenta gratis</span>
              <ArrowRight class="w-4 h-4 stroke-[2.5]" />
            </router-link>
          </div>
        </div>

        <!-- Tarjeta 2 — Nivel 2 · WALA Pro -->
        <div
          class="bg-white rounded-3xl border border-slate-200 shadow-sm p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
        >
          <div class="space-y-6">
            <div class="space-y-2">
              <span
                class="inline-block text-[11px] font-bold uppercase tracking-widest text-slate-500"
              >
                Nivel 2
              </span>
              <h3 class="text-2xl font-extrabold text-gray-900">
                WALA Pro
              </h3>
              <p class="text-lg font-extrabold text-gray-900">
                Prueba 7 días gratis
              </p>
              <p class="text-sm text-gray-600 font-medium leading-relaxed pt-1">
                Ya registras datos y necesitas reportes, alertas y visibilidad real.
              </p>
            </div>

            <ul class="space-y-3 pt-2 border-t border-slate-100">
              <li
                v-for="item in proBullets"
                :key="item"
                class="flex items-start gap-3 text-sm text-gray-700 font-medium"
              >
                <span
                  class="p-1 bg-emerald-50 text-emerald-600 rounded-lg shrink-0 mt-0.5"
                >
                  <Check class="w-3.5 h-3.5 stroke-[3]" />
                </span>
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>

          <div class="mt-8 space-y-3">
            <p class="text-xs text-gray-500 font-medium text-center">
              Cancela cuando quieras.
            </p>
            <router-link
              :to="`${REGISTER_PATH}?plan=pro`"
              class="w-full inline-flex items-center justify-center gap-2 border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-6 py-3.5 rounded-2xl font-bold text-sm sm:text-base transition-all duration-200"
            >
              <span>Probar 7 días gratis</span>
              <ArrowRight class="w-4 h-4 stroke-[2.5]" />
            </router-link>
          </div>
        </div>

        <!-- Tarjeta 3 — Nivel 3 · Acompañamiento 1:1 (Destacada) -->
        <div
          class="relative bg-white rounded-3xl border-2 border-[#E35336] shadow-[0_20px_50px_-15px_rgba(227,83,54,0.2)] p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_25px_60px_-15px_rgba(227,83,54,0.28)] hover:-translate-y-1"
        >
          <!-- Badge superior -->
          <div
            class="absolute -top-3.5 right-6 px-3.5 py-1 rounded-full bg-[#E35336] text-white text-[10px] font-extrabold tracking-widest uppercase shadow-md shadow-[#E35336]/25"
          >
            Método WALA
          </div>

          <div class="space-y-6">
            <div class="space-y-2">
              <span
                class="inline-block text-[11px] font-bold uppercase tracking-widest text-[#E35336]"
              >
                Nivel 3
              </span>
              <h3 class="text-2xl font-extrabold text-gray-900">
                Acompañamiento 1:1
              </h3>
              <div>
                <p class="text-lg font-extrabold text-gray-900">
                  Programa de 2 meses
                </p>
                <p class="text-xs font-semibold text-[#E35336]">
                  Postulación vía diagnóstico gratuito
                </p>
              </div>
              <p class="text-sm text-gray-600 font-medium leading-relaxed pt-1">
                Ya facturas, sientes fugas o desorden y quieres criterio directivo 1:1.
              </p>
            </div>

            <ul class="space-y-3 pt-2 border-t border-slate-100">
              <li
                v-for="item in acompBullets"
                :key="item"
                class="flex items-start gap-3 text-sm text-gray-700 font-medium"
              >
                <span
                  class="p-1 bg-emerald-50 text-emerald-600 rounded-lg shrink-0 mt-0.5"
                >
                  <Check class="w-3.5 h-3.5 stroke-[3]" />
                </span>
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>

          <div class="mt-8 space-y-4">
            <div
              class="bg-[#FFF5F2] border border-[#E35336]/20 rounded-xl p-3 text-xs text-gray-700 leading-relaxed font-medium"
            >
              <strong class="text-gray-900 font-bold">Garantía de claridad:</strong>
              si en 2 meses de acompañamiento no tienes más claridad sobre tu negocio que hoy, no te cobramos.
            </div>

            <router-link
              :to="DIAGNOSTICO_PATH"
              class="w-full inline-flex items-center justify-center gap-2 bg-[#E35336] hover:bg-[#c2412b] text-white px-6 py-3.5 rounded-2xl font-bold text-sm sm:text-base shadow-lg shadow-[#E35336]/25 transition-all duration-200"
            >
              <span>Agendar diagnóstico (30 min)</span>
              <ArrowRight class="w-4 h-4 stroke-[2.5]" />
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ArrowRight, Check } from "@iconoir/vue";
import { DIAGNOSTICO_PATH, REGISTER_PATH } from "@/config/ctaLinks";

const freemiumBullets = [
  "Registro diario de ventas y gastos",
  "Separación de cuentas y retiros personales",
  "Control básico de stock y clientes",
  "100% web móvil, sin instalar nada",
];

const proBullets = [
  "Todo lo de Freemium, más:",
  "Reportes semanales y mensuales claros",
  "Alertas de stock bajo y flujo proyectado",
  "Comparativa de resultados mes a mes",
  "Visibilidad real de márgenes por producto",
];

const acompBullets = [
  "Diagnóstico inicial en 7 áreas y 21 indicadores",
  "3 ciclos / 7 sesiones 1:1 con José Navarrete",
  "Plan de acción focalizado en tus 3 frenos críticos",
  "WALA Pro incluido durante todo el programa",
];
</script>

<style scoped>
.font-display {
  font-family: "Outfit", "Inter", sans-serif;
}
</style>
