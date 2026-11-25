<template>
  <div class="min-h-screen relative overflow-x-hidden font-display">
    <!-- Capa de fondo fija de alta resolución -->
    <div class="diagnostico-bg" :style="{ backgroundImage: `url(${bgWall})` }"></div>

    <!-- Top bar minimalista -->
    <header class="w-full px-4 sm:px-6 lg:px-8 pt-6">
      <div class="max-w-6xl mx-auto flex items-center justify-between">
        <router-link
          to="/"
          class="inline-flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-[#E35336] transition-colors duration-200 bg-white/80 backdrop-blur-sm border border-gray-100 px-4 py-2 rounded-xl shadow-sm"
        >
          <span>← Volver a WALA</span>
        </router-link>

        <router-link to="/" class="flex items-center gap-2.5">
          <img :src="logoWalaOrigin" alt="WALA" class="w-10 h-10 object-contain" />
          <span class="text-lg font-extrabold text-gray-900 tracking-tight">WALA</span>
        </router-link>
      </div>
    </header>

    <main>
      <!-- Hero Diagnóstico -->
      <section class="pt-12 pb-16 md:pt-20 md:pb-24 px-4 relative">
        <div class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div class="lg:col-span-7 text-center lg:text-left space-y-6">
            <div
              class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E35336]/10 text-[#E35336] text-[11px] font-black tracking-widest uppercase"
            >
              <Binocular class="w-3.5 h-3.5 stroke-[2.5]" />
              Sesión 1 a 1 · 100% Gratuita
            </div>

            <h1
              class="text-4xl sm:text-5xl md:text-6xl text-gray-900 font-extrabold leading-[1.1] tracking-tight"
            >
              Diagnóstico Gratuito de <span class="text-[#E35336]">30 minutos</span> con José Navarrete
            </h1>

            <p class="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Conversa directamente con <span class="text-gray-900 font-bold">José Navarrete, Metodólogo WALA</span>, revisa los números y la operación real de tu negocio y llévate claridad sobre dónde se está frenando tu rentabilidad.
            </p>

            <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center pt-2">
              <button
                class="w-full sm:w-auto bg-[#E35336] hover:bg-[#c2412b] text-white px-8 py-4 rounded-xl font-semibold text-base sm:text-lg shadow-lg shadow-[#E35336]/20 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
                @click="openWhatsApp"
              >
                <span class="inline-flex items-center justify-center gap-2">
                  <Rocket class="w-5 h-5" />
                  Agendar por WhatsApp
                  <ArrowRight class="w-4 h-4 stroke-[2.5]" />
                </span>
              </button>
            </div>

            <p class="text-xs text-gray-500 font-semibold">
              Sin compromiso comercial · Cupos semanales limitados por videollamada
            </p>
          </div>

          <!-- Tarjeta resumen de valor -->
          <div class="lg:col-span-5">
            <div
              class="bg-white rounded-3xl border border-[#E35336]/15 shadow-[0_15px_50px_-20px_rgba(227,83,54,0.12)] p-6 sm:p-8 space-y-6 relative overflow-hidden"
            >
              <div class="absolute -top-12 -right-12 w-40 h-40 bg-[#E35336]/5 rounded-full blur-3xl pointer-events-none"></div>

              <div class="flex items-center justify-between border-b border-gray-100 pb-4">
                <div class="flex items-center gap-3">
                  <div class="p-2.5 bg-[#E35336]/10 text-[#E35336] rounded-xl">
                    <SoilAlt class="w-5 h-5" />
                  </div>
                  <div>
                    <h2 class="text-sm font-black text-gray-900 uppercase tracking-wider">
                      Método WALA
                    </h2>
                    <p class="text-xs text-gray-500 font-semibold">
                      José Navarrete · Metodólogo WALA
                    </p>
                  </div>
                </div>
                <span class="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700 ring-1 ring-inset ring-emerald-600/10">
                  30 min
                </span>
              </div>

              <div class="space-y-4">
                <div class="flex items-start gap-3">
                  <div class="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0 mt-0.5">
                    <Check class="w-3.5 h-3.5 stroke-[3.5]" />
                  </div>
                  <div>
                    <h3 class="text-sm font-extrabold text-gray-900">Evaluación integral de 7 áreas</h3>
                    <p class="text-xs text-gray-500 font-medium leading-relaxed">
                      Revisamos finanzas, costeo, precios, inventarios, ventas, flujo de caja y gestión operativa.
                    </p>
                  </div>
                </div>

                <div class="flex items-start gap-3">
                  <div class="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0 mt-0.5">
                    <Check class="w-3.5 h-3.5 stroke-[3.5]" />
                  </div>
                  <div>
                    <h3 class="text-sm font-extrabold text-gray-900">Tus 3 frenos críticos al descubierto</h3>
                    <p class="text-xs text-gray-500 font-medium leading-relaxed">
                      Identificamos exactamente qué está absorbiendo tu tiempo o fugando tu margen mes a mes.
                    </p>
                  </div>
                </div>

                <div class="flex items-start gap-3">
                  <div class="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0 mt-0.5">
                    <Check class="w-3.5 h-3.5 stroke-[3.5]" />
                  </div>
                  <div>
                    <h3 class="text-sm font-extrabold text-gray-900">Plan de acción inmediato</h3>
                    <p class="text-xs text-gray-500 font-medium leading-relaxed">
                      Sales de la llamada con prioridades concretas que puedes aplicar desde el mismo día.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Qué evaluamos -->
      <section class="py-16 md:py-20 px-4">
        <div class="max-w-6xl mx-auto">
          <div class="text-center space-y-4 mb-12">
            <span
              class="inline-block px-4 py-1.5 bg-orange-50 border border-orange-100 text-[#E35336] text-xs font-bold uppercase tracking-wider rounded-full"
            >
              Qué se evalúa
            </span>
            <h2 class="text-3xl sm:text-4xl text-gray-900 font-extrabold leading-tight max-w-2xl mx-auto">
              Una radiografía clara de <span class="text-[#E35336]">tu negocio</span> en 3 pilares
            </h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 space-y-4 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div class="w-12 h-12 rounded-2xl bg-[#E35336]/10 text-[#E35336] flex items-center justify-center">
                <Coins class="w-6 h-6 stroke-[2]" />
              </div>
              <h3 class="text-lg font-extrabold text-gray-900">7 áreas del negocio</h3>
              <p class="text-sm text-gray-500 font-medium leading-relaxed">
                Analizamos cómo vendes, cómo fijas tus precios, cuánto cuesta operar, cómo controlas tu stock y cómo manejas tu caja.
              </p>
            </div>

            <div class="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 space-y-4 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Archive class="w-6 h-6 stroke-[2]" />
              </div>
              <h3 class="text-lg font-extrabold text-gray-900">Los 3 frenos críticos</h3>
              <p class="text-sm text-gray-500 font-medium leading-relaxed">
                No todo es urgente al mismo tiempo. Priorizamos los tres cuellos de botella que hoy te impiden ganar más dinero y tranquilidad.
              </p>
            </div>

            <div class="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 space-y-4 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <GraphUp class="w-6 h-6 stroke-[2]" />
              </div>
              <h3 class="text-lg font-extrabold text-gray-900">Plan de acción inmediato</h3>
              <p class="text-sm text-gray-500 font-medium leading-relaxed">
                Te llevas una hoja de ruta accionable para ordenar tus números de inmediato, con o sin acompañamiento posterior.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Desglose en 3 pasos de la sesión de 30 min -->
      <section class="py-16 md:py-20 px-4">
        <div class="max-w-5xl mx-auto">
          <div class="text-center space-y-4 mb-12">
            <span
              class="inline-block px-4 py-1.5 bg-orange-50 border border-orange-100 text-[#E35336] text-xs font-bold uppercase tracking-wider rounded-full"
            >
              Así funciona la sesión
            </span>
            <h2 class="text-3xl sm:text-4xl text-gray-900 font-extrabold leading-tight max-w-2xl mx-auto">
              ¿Qué pasa en los 30 minutos?
            </h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 space-y-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div class="w-12 h-12 rounded-2xl bg-[#E35336]/10 text-[#E35336] flex items-center justify-center shadow-inner">
                <Calendar class="w-6 h-6 stroke-[2]" />
              </div>
              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <span class="text-[10px] font-black uppercase tracking-widest text-[#E35336]">Paso 1</span>
                  <span class="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                  <span class="text-xs text-gray-400 font-bold uppercase tracking-wide">Min 0 – 10</span>
                </div>
                <h3 class="text-lg font-extrabold text-gray-900">Contexto y números reales</h3>
                <p class="text-sm text-gray-500 font-medium leading-relaxed">
                  Entendemos tu modelo de negocio, tus ventas actuales y dónde sientes mayor desorden o presión de caja.
                </p>
              </div>
            </div>

            <div class="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 space-y-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
                <GraphUp class="w-6 h-6 stroke-[2]" />
              </div>
              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <span class="text-[10px] font-black uppercase tracking-widest text-blue-600">Paso 2</span>
                  <span class="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                  <span class="text-xs text-gray-400 font-bold uppercase tracking-wide">Min 10 – 20</span>
                </div>
                <h3 class="text-lg font-extrabold text-gray-900">Evaluación de 7 áreas</h3>
                <p class="text-sm text-gray-500 font-medium leading-relaxed">
                  Detectamos juntos los <span class="text-gray-900 font-semibold">3 frenos críticos</span> que hoy limitan tu margen y crecimiento.
                </p>
              </div>
            </div>

            <div class="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 space-y-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
                <BookStack class="w-6 h-6 stroke-[2]" />
              </div>
              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <span class="text-[10px] font-black uppercase tracking-widest text-emerald-600">Paso 3</span>
                  <span class="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                  <span class="text-xs text-gray-400 font-bold uppercase tracking-wide">Min 20 – 30</span>
                </div>
                <h3 class="text-lg font-extrabold text-gray-900">Plan de acción inmediato</h3>
                <p class="text-sm text-gray-500 font-medium leading-relaxed">
                  Definimos tus primeros pasos concretos de la semana y resolvemos tus dudas sin presión comercial.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA final + enlace sutil a registro autónomo -->
      <section class="py-16 md:py-24 px-4">
        <div class="max-w-3xl mx-auto bg-white rounded-3xl border border-gray-100 shadow-[0_15px_50px_-20px_rgba(0,0,0,0.06)] p-8 sm:p-12 text-center space-y-6">
          <h2 class="text-2xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
            Da el primer paso hacia la <span class="text-[#E35336]">claridad financiera</span>
          </h2>
          <p class="text-base text-gray-500 font-semibold max-w-xl mx-auto">
            Agenda tu diagnóstico gratuito de 30 minutos directamente con José Navarrete por WhatsApp.
          </p>

          <div class="pt-2">
            <button
              class="w-full sm:w-auto bg-[#E35336] hover:bg-[#c2412b] text-white px-8 py-4 rounded-xl font-semibold text-base sm:text-lg shadow-lg shadow-[#E35336]/20 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
              @click="openWhatsApp"
            >
              <span class="inline-flex items-center justify-center gap-2">
                <Rocket class="w-5 h-5" />
                Agendar mi diagnóstico gratuito
                <ArrowRight class="w-4 h-4 stroke-[2.5]" />
              </span>
            </button>
          </div>

          <div class="pt-2">
            <p class="text-sm text-gray-500 font-medium">
              ¿Prefieres empezar ordenando tus cuentas por tu cuenta?
              <router-link
                :to="REGISTER_PATH"
                class="text-[#E35336] hover:text-[#c2412b] font-bold underline underline-offset-4 ml-1 transition-colors"
              >
                Crea tu cuenta gratuita en WALA
              </router-link>
            </p>
          </div>
        </div>
      </section>
    </main>

    <FooterLandingPage />
  </div>
</template>

<script setup>
import {
  Archive,
  ArrowRight,
  Binocular,
  BookStack,
  Calendar,
  Check,
  Coins,
  GraphUp,
  Rocket,
  SoilAlt,
} from "@iconoir/vue";
import FooterLandingPage from "@/components/LandingPage/FooterLandingPage.vue";
import bgWall from "@/assets/bg_wall.png";
import logoWalaOrigin from "@/assets/Wala Origin.png";
import { buildWhatsAppUrl, REGISTER_PATH } from "@/config/ctaLinks";

const openWhatsApp = () => {
  window.open(buildWhatsAppUrl(), "_blank", "noopener,noreferrer");
};
</script>

<style scoped>
.font-display {
  font-family: "Outfit", "Inter", sans-serif;
}

.diagnostico-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  z-index: -10;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  pointer-events: none;
  transform: translate3d(0, 0, 0);
  will-change: transform;
}
</style>
