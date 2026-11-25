<template>
  <section
    id="hero-section"
    class="bg-transparent flex items-center justify-center px-4 py-12 sm:py-16 md:py-24 relative overflow-hidden"
  >
    <div class="max-w-7xl mx-auto w-full">
      <div
        class="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center"
      >
        <!-- Columna izquierda: Copy & CTAs -->
        <div class="text-center md:text-left space-y-5 sm:space-y-6 min-w-0">
          <!-- Micro-badge -->
          <div
            class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E35336]/10 text-[#E35336] text-[10px] sm:text-xs font-bold tracking-wider uppercase mx-auto md:mx-0 font-display"
          >
            <Rocket class="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
            <span>Software + Metodología alineada a MESUN · OIT</span>
          </div>

          <h1
            class="text-3xl sm:text-5xl lg:text-6xl text-gray-900 font-extrabold leading-[1.1] tracking-tight font-display"
          >
            ¿Sabes realmente
            <span class="text-[#E35336]">cuánto gana</span> tu negocio?
          </h1>

          <p
            class="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto md:mx-0"
          >
            Deja de decidir a ciegas. Ordena tu caja, tus costos y tu inventario
            desde el celular con WALA — por tu cuenta o acompañado paso a paso
            con el Método WALA.
          </p>

          <!-- CTAs -->
          <div
            class="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start items-stretch sm:items-start pt-2"
          >
            <div class="flex flex-col items-center md:items-start w-full sm:w-auto">
              <router-link
                :to="REGISTER_PATH"
                class="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#E35336] hover:bg-[#c2412b] text-white px-6 sm:px-7 py-3.5 sm:py-4 rounded-xl font-semibold text-base shadow-lg shadow-[#E35336]/20 transition-all duration-200 hover:-translate-y-0.5"
              >
                <span>Crear cuenta gratis</span>
                <ArrowRight class="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              </router-link>
              <span class="mt-2 text-xs text-gray-500 font-medium">
                Sin tarjeta de crédito · Empieza en 2 minutos
              </span>
            </div>

            <router-link
              :to="DIAGNOSTICO_PATH"
              class="w-full sm:w-auto inline-flex items-center justify-center gap-2 border-2 border-[#E35336] text-[#E35336] hover:bg-[#E35336]/10 px-6 sm:px-7 py-3.5 sm:py-4 rounded-xl font-semibold text-base transition-all duration-200 hover:-translate-y-0.5"
            >
              <span>Agendar diagnóstico (30 min)</span>
            </router-link>
          </div>
        </div>

        <!-- Columna derecha / inferior en mobile: Visual interactivo con 2 tabs -->
        <div class="w-full min-w-0">
          <div
            class="bg-white rounded-3xl border border-gray-100 shadow-[0_15px_50px_-20px_rgba(0,0,0,0.08)] p-4 sm:p-6 font-display relative overflow-hidden"
          >
            <div
              class="absolute -top-12 -right-12 w-48 h-48 bg-[#E35336]/5 rounded-full blur-3xl pointer-events-none"
            ></div>

            <div class="relative z-10 space-y-4 sm:space-y-5">
              <!-- Tabs selector -->
              <div
                class="grid grid-cols-2 gap-1 p-1 bg-gray-100 rounded-2xl"
                role="tablist"
                aria-label="Vistas de WALA"
              >
                <button
                  type="button"
                  role="tab"
                  :aria-selected="activeTab === 'app'"
                  @click="activeTab = 'app'"
                  class="px-2.5 sm:px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer truncate"
                  :class="
                    activeTab === 'app'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-800'
                  "
                >
                  Tu día en WALA
                </button>
                <button
                  type="button"
                  role="tab"
                  :aria-selected="activeTab === 'diagnostico'"
                  @click="activeTab = 'diagnostico'"
                  class="px-2.5 sm:px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer truncate"
                  :class="
                    activeTab === 'diagnostico'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-800'
                  "
                >
                  Diagnóstico 7 Áreas
                </button>
              </div>

              <!-- Tab 1: Tu día en WALA -->
              <div v-if="activeTab === 'app'" class="space-y-3 sm:space-y-4">
                <!-- // TODO: Subir apps/web/src/assets/landing/app-caja.webp -->
                <img
                  v-if="LANDING_ASSETS.appCaja && !appImgError"
                  :src="LANDING_ASSETS.appCaja"
                  alt="Vista diaria de caja en WALA"
                  class="w-full h-auto rounded-2xl object-cover border border-gray-100"
                  @error="appImgError = true"
                />

                <div v-else class="space-y-3">
                  <!-- Header -->
                  <div
                    class="flex items-center justify-between border-b border-gray-100 pb-3"
                  >
                    <div class="flex items-center gap-2.5 min-w-0">
                      <div
                        class="p-2 bg-[#E35336]/10 text-[#E35336] rounded-xl shrink-0"
                      >
                        <Wallet class="w-5 h-5" />
                      </div>
                      <div class="min-w-0">
                        <h3
                          class="text-xs font-black text-gray-900 uppercase tracking-wider truncate"
                        >
                          Caja Diaria · WALA
                        </h3>
                        <p class="text-[11px] text-gray-400 font-semibold truncate">
                          Control desde el celular
                        </p>
                      </div>
                    </div>
                    <span
                      class="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/10 shrink-0"
                    >
                      Hoy · Al día
                    </span>
                  </div>

                  <!-- Apertura de caja (Efectivo + Yape) -->
                  <div class="grid grid-cols-2 gap-2.5">
                    <div
                      class="p-3 rounded-2xl bg-slate-50 border border-slate-100 min-w-0"
                    >
                      <span
                        class="block text-[10px] font-bold uppercase tracking-wider text-gray-400"
                      >
                        Efectivo en caja
                      </span>
                      <span
                        class="block text-base sm:text-lg font-extrabold text-gray-900 mt-0.5 truncate"
                      >
                        S/ 480.00
                      </span>
                    </div>
                    <div
                      class="p-3 rounded-2xl bg-purple-50/70 border border-purple-100 min-w-0"
                    >
                      <span
                        class="block text-[10px] font-bold uppercase tracking-wider text-purple-600"
                      >
                        Yape / Plin
                      </span>
                      <span
                        class="block text-base sm:text-lg font-extrabold text-gray-900 mt-0.5 truncate"
                      >
                        S/ 340.00
                      </span>
                    </div>
                  </div>

                  <!-- Gastos fijos registrados -->
                  <div
                    class="flex items-center justify-between gap-2 p-3 rounded-2xl bg-amber-50/60 border border-amber-100"
                  >
                    <div class="flex items-center gap-2.5 min-w-0">
                      <div
                        class="w-8 h-8 rounded-lg bg-amber-100/80 text-amber-700 flex items-center justify-center shrink-0"
                      >
                        <Coins class="w-4 h-4 stroke-[2.2]" />
                      </div>
                      <div class="min-w-0">
                        <p class="text-xs font-extrabold text-gray-900 truncate">
                          Gastos fijos e insumos
                        </p>
                        <p class="text-[11px] text-gray-500 font-medium truncate">
                          Separados de tu caja personal
                        </p>
                      </div>
                    </div>
                    <span
                      class="text-xs sm:text-sm font-extrabold text-amber-700 shrink-0"
                    >
                      -S/ 215.00
                    </span>
                  </div>

                  <!-- Resultado claro del día -->
                  <div
                    class="flex items-center justify-between gap-2 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200"
                  >
                    <div class="flex items-center gap-2.5 min-w-0">
                      <div
                        class="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0"
                      >
                        <Check class="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <div class="min-w-0">
                        <p class="text-xs font-extrabold text-emerald-950 truncate">
                          Resultado claro del día
                        </p>
                        <p class="text-[11px] text-emerald-700 font-medium truncate">
                          Sabes cuánto quedó hoy
                        </p>
                      </div>
                    </div>
                    <span
                      class="text-sm sm:text-base font-black text-emerald-700 shrink-0"
                    >
                      +S/ 605.00
                    </span>
                  </div>
                </div>
              </div>

              <!-- Tab 2: Diagnóstico 7 Áreas -->
              <div v-else class="space-y-4">
                <div
                  class="flex items-center justify-between border-b border-gray-100 pb-3"
                >
                  <div class="flex items-center gap-2.5 min-w-0">
                    <div
                      class="p-2 bg-[#E35336]/10 text-[#E35336] rounded-xl shadow-inner shrink-0"
                    >
                      <SoilAlt class="w-5 h-5" />
                    </div>
                    <div class="min-w-0">
                      <h3
                        class="text-xs font-black text-gray-900 uppercase tracking-wider truncate"
                      >
                        Asesoría WALA
                      </h3>
                      <p class="text-[10px] text-gray-400 font-bold truncate">
                        Radiografía en 7 áreas
                      </p>
                    </div>
                  </div>
                  <span
                    class="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-black text-emerald-700 ring-1 ring-inset ring-emerald-600/10 shrink-0"
                  >
                    Activo
                  </span>
                </div>

                <!-- Maturity Progress bar -->
                <div class="space-y-2">
                  <div class="flex justify-between items-center text-xs">
                    <span class="text-gray-500 font-bold"
                      >Madurez del Negocio</span
                    >
                    <span class="text-[#E35336] font-black">68%</span>
                  </div>
                  <div
                    class="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden border border-gray-100 shadow-inner"
                  >
                    <div
                      class="bg-[#E35336] h-full rounded-full transition-all duration-500"
                      style="width: 68%"
                    ></div>
                  </div>
                </div>

                <!-- Critical Areas & Indicators -->
                <div class="space-y-2.5">
                  <h4
                    class="text-[10px] font-black text-gray-400 uppercase tracking-widest"
                  >
                    3 Frenos Priorizados
                  </h4>

                  <div class="space-y-2">
                    <div
                      class="flex items-center justify-between gap-2 p-2.5 bg-amber-50/50 border border-amber-100 rounded-2xl"
                    >
                      <div class="flex items-center gap-2.5 min-w-0">
                        <div
                          class="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shadow-inner shrink-0"
                        >
                          <Coins class="w-4 h-4 stroke-[2.2]" />
                        </div>
                        <div class="text-left min-w-0">
                          <h5 class="text-xs font-extrabold text-gray-900 truncate">
                            Estructura de Costeos
                          </h5>
                          <p class="text-[10px] text-gray-400 font-bold">
                            Prioridad 1
                          </p>
                        </div>
                      </div>
                      <span
                        class="text-[10px] font-black uppercase text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded-md shrink-0"
                      >
                        1er Freno
                      </span>
                    </div>

                    <div
                      class="flex items-center justify-between gap-2 p-2.5 bg-blue-50/50 border border-blue-100 rounded-2xl"
                    >
                      <div class="flex items-center gap-2.5 min-w-0">
                        <div
                          class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner shrink-0"
                        >
                          <Archive class="w-4 h-4 stroke-[2.2]" />
                        </div>
                        <div class="text-left min-w-0">
                          <h5 class="text-xs font-extrabold text-gray-900 truncate">
                            Control de Inventarios
                          </h5>
                          <p class="text-[10px] text-gray-400 font-bold">
                            Prioridad 2
                          </p>
                        </div>
                      </div>
                      <span
                        class="text-[10px] font-black uppercase text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded-md shrink-0"
                      >
                        2do Freno
                      </span>
                    </div>

                    <div
                      class="flex items-center justify-between gap-2 p-2.5 bg-emerald-50/50 border border-emerald-100 rounded-2xl"
                    >
                      <div class="flex items-center gap-2.5 min-w-0">
                        <div
                          class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner shrink-0"
                        >
                          <GraphUp class="w-4 h-4 stroke-[2.2]" />
                        </div>
                        <div class="text-left min-w-0">
                          <h5 class="text-xs font-extrabold text-gray-900 truncate">
                            Flujo de Caja Real
                          </h5>
                          <p class="text-[10px] text-gray-400 font-bold">
                            Prioridad 3
                          </p>
                        </div>
                      </div>
                      <span
                        class="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-md shrink-0"
                      >
                        3er Freno
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      class="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10"
    >
      <div
        class="absolute top-0 left-0 w-80 h-80 bg-orange-50 rounded-full filter blur-3xl opacity-30 -translate-x-24 -translate-y-24"
      ></div>
      <div
        class="absolute bottom-0 right-0 w-80 h-80 bg-emerald-50 rounded-full filter blur-3xl opacity-20 translate-x-24 translate-y-24"
      ></div>
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";
import {
  ArrowRight,
  Check,
  Rocket,
  GraphUp,
  SoilAlt,
  Coins,
  Archive,
  Wallet,
} from "@iconoir/vue";
import { REGISTER_PATH, DIAGNOSTICO_PATH } from "@/config/ctaLinks";
import { LANDING_ASSETS } from "@/config/landingAssets";

const activeTab = ref("app");
const appImgError = ref(false);
</script>

<style scoped>
.font-display {
  font-family: "Outfit", "Inter", sans-serif;
}
</style>
