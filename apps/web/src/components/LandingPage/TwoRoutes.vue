<template>
  <section id="routes-section" class="py-20 md:py-28 px-4 bg-transparent font-display relative overflow-hidden">
    <!-- Glowing background blurs -->
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-50/20 rounded-full blur-3xl pointer-events-none -z-10"></div>

    <div class="max-w-6xl mx-auto">
      <div class="text-center space-y-4 mb-16">
        <span
          class="inline-block px-4 py-1.5 bg-orange-50 border border-orange-100 text-[#E35336] text-xs font-bold uppercase tracking-wider rounded-full"
        >
          Elige Tu Camino
        </span>
        <h2
          class="text-3xl sm:text-4xl md:text-5xl text-gray-900 font-extrabold leading-tight text-center max-w-2xl mx-auto"
        >
          ¿Por dónde quieres <span class="text-[#E35336]">empezar</span> hoy?
        </h2>
        <p class="text-base sm:text-lg text-gray-500 font-semibold max-w-md mx-auto">
          Toma el control del rumbo de tu negocio de la forma que mejor se adapte a ti.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Ruta 1: Diagnóstico -->
        <div class="relative bg-white rounded-3xl border border-[#E35336]/20 shadow-[0_15px_50px_-20px_rgba(227,83,54,0.08)] p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
          <!-- Recommended tag -->
          <div class="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-[#E35336] text-white text-[9px] font-black tracking-widest uppercase shadow-md shadow-[#E35336]/20">
            Recomendado
          </div>

          <div class="space-y-6">
            <div class="flex items-center gap-4">
              <div
                class="w-12 h-12 rounded-2xl bg-[#E35336]/10 flex items-center justify-center shrink-0 shadow-inner text-[#E35336]"
              >
                <Binocular class="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h3 class="text-xl font-extrabold text-gray-900">
                  Quiero saber qué falla
                </h3>
                <p class="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">Diagnóstico guiado por asesor</p>
              </div>
            </div>

            <p class="text-sm text-gray-500 font-semibold leading-relaxed">
              Reserva un <span class="text-[#E35336] font-bold">Diagnóstico gratuito de 20 minutos</span> por videollamada con José, metodólogo WALA.
            </p>

            <div class="space-y-3.5 pt-2">
              <div class="flex items-start gap-3">
                <div class="p-1 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                  <Check class="w-3.5 h-3.5 stroke-[3.5]" />
                </div>
                <div>
                  <h4 class="text-xs font-extrabold text-gray-900 uppercase tracking-wider">7 Áreas del Negocio Evaluadas</h4>
                  <p class="text-[11px] text-gray-400 font-medium">Finanzas, costeo, inventario, ventas y más.</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="p-1 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                  <Check class="w-3.5 h-3.5 stroke-[3.5]" />
                </div>
                <div>
                  <h4 class="text-xs font-extrabold text-gray-900 uppercase tracking-wider">3 Frenos Críticos Identificados</h4>
                  <p class="text-[11px] text-gray-400 font-medium">Descubre con exactitud dónde se pierde tu dinero.</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="p-1 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                  <Check class="w-3.5 h-3.5 stroke-[3.5]" />
                </div>
                <div>
                  <h4 class="text-xs font-extrabold text-gray-900 uppercase tracking-wider">Plan de Acción Inmediato</h4>
                  <p class="text-[11px] text-gray-400 font-medium">Llévate una lista de tareas concretas a realizar.</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="p-1 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                  <Check class="w-3.5 h-3.5 stroke-[3.5]" />
                </div>
                <div>
                  <h4 class="text-xs font-extrabold text-gray-900 uppercase tracking-wider">100% Gratis y Sin Compromiso</h4>
                  <p class="text-[11px] text-gray-400 font-medium">Claridad total, libre de presiones comerciales.</p>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-8 space-y-3">
            <button
              class="w-full bg-[#E35336] hover:bg-[#c2412b] text-white px-6 py-4 rounded-2xl font-extrabold text-base shadow-lg shadow-[#E35336]/20 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
              @click="openWhatsApp"
            >
              <span class="inline-flex items-center justify-center gap-2">
                Agendar por WhatsApp
                <ArrowRight class="w-4 h-4 stroke-[2.5]" />
              </span>
            </button>

            <p class="text-[10px] text-gray-400 font-semibold text-center leading-relaxed max-w-sm mx-auto">
              Si en 2 meses de acompañamiento no tienes más claridad sobre tu negocio, no te cobramos nada.
            </p>
          </div>
        </div>

        <!-- Ruta 2: WALA Gratis -->
        <div class="bg-white rounded-3xl border border-gray-100 shadow-[0_15px_50px_-20px_rgba(0,0,0,0.06)] p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <div class="space-y-6">
            <div class="flex items-center gap-4">
              <div
                class="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0 shadow-inner text-blue-600"
              >
                <Sort class="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h3 class="text-xl font-extrabold text-gray-900">
                  Quiero ordenar yo mismo
                </h3>
                <p class="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">Acceso autónomo freemium</p>
              </div>
            </div>

            <p class="text-sm text-gray-500 font-semibold leading-relaxed">
              Crea tu cuenta gratuita hoy en WALA y comienza a registrar la información de tu negocio por tu cuenta.
            </p>

            <div class="space-y-3.5 pt-2">
              <div class="flex items-start gap-3">
                <div class="p-1 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                  <Check class="w-3.5 h-3.5 stroke-[3.5]" />
                </div>
                <div>
                  <h4 class="text-xs font-extrabold text-gray-900 uppercase tracking-wider">Cuentas Claras en Minutos</h4>
                  <p class="text-[11px] text-gray-400 font-medium">Registra ingresos, gastos fijos y flujo de caja.</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="p-1 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                  <Check class="w-3.5 h-3.5 stroke-[3.5]" />
                </div>
                <div>
                  <h4 class="text-xs font-extrabold text-gray-900 uppercase tracking-wider">Control de Inventarios Simple</h4>
                  <p class="text-[11px] text-gray-400 font-medium">Evita pérdidas por robos hormiga y stock quebrado.</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="p-1 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                  <Check class="w-3.5 h-3.5 stroke-[3.5]" />
                </div>
                <div>
                  <h4 class="text-xs font-extrabold text-gray-900 uppercase tracking-wider">Sin Tarjeta de Crédito</h4>
                  <p class="text-[11px] text-gray-400 font-medium">Empieza totalmente gratis en menos de 2 minutos.</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="p-1 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                  <Check class="w-3.5 h-3.5 stroke-[3.5]" />
                </div>
                <div>
                  <h4 class="text-xs font-extrabold text-gray-900 uppercase tracking-wider">Funciona en tu Celular</h4>
                  <p class="text-[11px] text-gray-400 font-medium">Lleva tu administración a donde quiera que vayas.</p>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-8">
            <button
              class="w-full border-2 border-[#E35336] text-[#E35336] hover:bg-[#E35336]/10 px-6 py-4 rounded-2xl font-extrabold text-base transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
              @click="goToSignup"
            >
              <span class="inline-flex items-center justify-center gap-2">
                Crear mi cuenta gratis
                <ArrowRight class="w-4 h-4 stroke-[2.5]" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useRouter } from "vue-router";
import { ArrowRight, Binocular, Check, Sort } from "@iconoir/vue";

const router = useRouter();
const whatsappLink =
  "https://api.whatsapp.com/send?phone=51921492993&text=Hola%20Jos%C3%A9%2C%20vi%20la%20p%C3%A1gina%20de%20WALA%20y%20quiero%20agendar%20mi%20diagn%C3%B3stico%20gratuito%20de%2020%20minutos.%20%C2%BFAgendamos%20para%20esta%20semana%3F";

const openWhatsApp = () => {
  window.open(whatsappLink, "_blank", "noopener,noreferrer");
};

const goToSignup = () => {
  router.push("/auth/login");
};
</script>

<style scoped>
.font-display {
  font-family: "Outfit", "Inter", sans-serif;
}
</style>
