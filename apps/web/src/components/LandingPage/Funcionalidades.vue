<template>
  <section
    id="producto"
    class="py-16 sm:py-24 px-4 bg-white border-y border-slate-100 relative overflow-hidden font-display"
  >
    <div class="max-w-6xl mx-auto">
      <div class="text-center max-w-3xl mx-auto space-y-4 mb-12 sm:mb-16">
        <span
          class="inline-block px-4 py-1.5 bg-[#FFF5F2] border border-[#E35336]/20 text-[#E35336] text-xs font-bold uppercase tracking-wider rounded-full"
        >
          Tu Copiloto Diario
        </span>

        <h2
          class="text-3xl sm:text-4xl md:text-5xl text-gray-900 font-extrabold leading-tight tracking-tight"
        >
          Así se ve tu negocio
          <span class="text-[#E35336]">ordenado en minutos</span>
        </h2>

        <p class="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
          Sin Excel complicados ni lenguaje contable. Hecho para la operación
          real desde tu celular.
        </p>
      </div>

      <!-- 3 Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Card 1: Caja diaria -->
        <article
          class="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-[#E35336]/30 transition-all duration-200"
        >
          <div>
            <!-- Visual Frame -->
            <div
              class="mb-5 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden aspect-[16/10] flex items-center justify-center p-3"
            >
              <!-- // TODO: Subir apps/web/src/assets/landing/app-caja.webp -->
              <img
                v-if="LANDING_ASSETS.appCaja && !imgErrors.appCaja"
                :src="LANDING_ASSETS.appCaja"
                alt="Caja diaria en WALA"
                class="w-full h-full object-cover rounded-xl"
                @error="imgErrors.appCaja = true"
              />
              <div
                v-else
                class="w-full h-full bg-white rounded-xl border border-slate-200/80 p-3 flex flex-col justify-between"
              >
                <div class="flex items-center justify-between">
                  <span
                    class="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-700"
                  >
                    <Cash class="w-4 h-4 text-[#E35336]" />
                    Venta rápida
                  </span>
                  <span
                    class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700"
                  >
                    9 seg
                  </span>
                </div>
                <div class="grid grid-cols-2 gap-2 my-1">
                  <div class="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span class="block text-[9px] text-slate-400 font-bold uppercase"
                      >Efectivo</span
                    >
                    <span class="text-xs font-extrabold text-slate-900"
                      >S/ 310.00</span
                    >
                  </div>
                  <div class="p-2 rounded-lg bg-purple-50/70 border border-purple-100">
                    <span class="block text-[9px] text-purple-600 font-bold uppercase"
                      >Yape / Transf.</span
                    >
                    <span class="text-xs font-extrabold text-slate-900"
                      >S/ 245.00</span
                    >
                  </div>
                </div>
                <div
                  class="flex items-center justify-between text-[11px] font-bold text-emerald-700 bg-emerald-50/70 px-2.5 py-1.5 rounded-lg"
                >
                  <span>Total conciliado</span>
                  <span>S/ 555.00</span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2.5 mb-2">
              <div
                class="w-9 h-9 rounded-xl bg-[#FFF5F2] text-[#E35336] flex items-center justify-center shrink-0"
              >
                <Cash class="w-5 h-5 stroke-[2]" />
              </div>
              <h3 class="text-lg font-extrabold text-gray-900 leading-snug">
                Caja diaria sin confusiones
              </h3>
            </div>

            <p class="text-sm text-slate-600 leading-relaxed">
              Registra ventas y separa efectivo de Yape o transferencias en
              menos de 10 segundos.
            </p>
          </div>
        </article>

        <!-- Card 2: Costos y gastos -->
        <article
          class="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-[#E35336]/30 transition-all duration-200"
        >
          <div>
            <!-- Visual Frame -->
            <div
              class="mb-5 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden aspect-[16/10] flex items-center justify-center p-3"
            >
              <!-- // TODO: Subir apps/web/src/assets/landing/app-gastos.webp -->
              <img
                v-if="LANDING_ASSETS.appGastos && !imgErrors.appGastos"
                :src="LANDING_ASSETS.appGastos"
                alt="Costos y gastos bajo control en WALA"
                class="w-full h-full object-cover rounded-xl"
                @error="imgErrors.appGastos = true"
              />
              <div
                v-else
                class="w-full h-full bg-white rounded-xl border border-slate-200/80 p-3 flex flex-col justify-between"
              >
                <div class="flex items-center justify-between">
                  <span
                    class="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-700"
                  >
                    <Wallet class="w-4 h-4 text-[#E35336]" />
                    Gastos clasificados
                  </span>
                  <span
                    class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600"
                  >
                    Mes actual
                  </span>
                </div>
                <div class="space-y-1.5 my-1">
                  <div class="flex items-center justify-between text-[11px]">
                    <span class="text-slate-600 font-medium">Insumos y mercadería</span>
                    <span class="font-bold text-slate-900">S/ 1,450</span>
                  </div>
                  <div class="flex items-center justify-between text-[11px]">
                    <span class="text-slate-600 font-medium">Alquiler, luz y fijos</span>
                    <span class="font-bold text-slate-900">S/ 980</span>
                  </div>
                </div>
                <div
                  class="flex items-center justify-between text-[11px] font-bold text-[#E35336] bg-[#FFF5F2] px-2.5 py-1.5 rounded-lg"
                >
                  <span>Retiro personal separado</span>
                  <span>S/ 600</span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2.5 mb-2">
              <div
                class="w-9 h-9 rounded-xl bg-[#FFF5F2] text-[#E35336] flex items-center justify-center shrink-0"
              >
                <Wallet class="w-5 h-5 stroke-[2]" />
              </div>
              <h3 class="text-lg font-extrabold text-gray-900 leading-snug">
                Costos y gastos bajo control
              </h3>
            </div>

            <p class="text-sm text-slate-600 leading-relaxed">
              Separa retiros personales, alquiler, luz e insumos para saber
              cuánto necesitas cubrir antes de ganar.
            </p>
          </div>
        </article>

        <!-- Card 3: Inventario y reportes -->
        <article
          class="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-[#E35336]/30 transition-all duration-200"
        >
          <div>
            <!-- Visual Frame -->
            <div
              class="mb-5 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden aspect-[16/10] flex items-center justify-center p-3"
            >
              <!-- // TODO: Subir apps/web/src/assets/landing/app-reporte.webp -->
              <img
                v-if="LANDING_ASSETS.appReporte && !imgErrors.appReporte"
                :src="LANDING_ASSETS.appReporte"
                alt="Inventario y reportes claros en WALA"
                class="w-full h-full object-cover rounded-xl"
                @error="imgErrors.appReporte = true"
              />
              <div
                v-else
                class="w-full h-full bg-white rounded-xl border border-slate-200/80 p-3 flex flex-col justify-between"
              >
                <div class="flex items-center justify-between">
                  <span
                    class="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-700"
                  >
                    <Reports class="w-4 h-4 text-[#E35336]" />
                    Stock y cierre semanal
                  </span>
                  <span
                    class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700"
                  >
                    En positivo
                  </span>
                </div>
                <div class="space-y-1.5 my-1">
                  <div class="flex items-center justify-between text-[11px]">
                    <span class="text-slate-600 font-medium">Stock en unidad real</span>
                    <span class="font-bold text-slate-900">12.5 kg disp.</span>
                  </div>
                  <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div class="bg-[#E35336] h-full rounded-full w-3/4"></div>
                  </div>
                </div>
                <div
                  class="flex items-center justify-between text-[11px] font-bold text-emerald-700 bg-emerald-50/70 px-2.5 py-1.5 rounded-lg"
                >
                  <span>Resultado de la semana</span>
                  <span>+S/ 1,420</span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2.5 mb-2">
              <div
                class="w-9 h-9 rounded-xl bg-[#FFF5F2] text-[#E35336] flex items-center justify-center shrink-0"
              >
                <Package class="w-5 h-5 stroke-[2]" />
              </div>
              <h3 class="text-lg font-extrabold text-gray-900 leading-snug">
                Inventario y reportes claros
              </h3>
            </div>

            <p class="text-sm text-slate-600 leading-relaxed">
              Controla stock por unidad real de venta (incluso fraccionada) y
              revisa si tu semana cerró en positivo.
            </p>
          </div>
        </article>
      </div>

      <!-- Micro-CTA -->
      <div class="text-center mt-10 sm:mt-12">
        <router-link
          :to="REGISTER_PATH"
          class="inline-flex items-center justify-center gap-2 text-sm sm:text-base font-bold text-[#E35336] hover:text-[#c2412b] transition-colors"
        >
          <span>Explorar la app gratis hoy →</span>
        </router-link>
      </div>
    </div>
  </section>
</template>

<script setup>
import { reactive } from "vue";
import { Cash, Package, Reports, Wallet } from "@iconoir/vue";
import { REGISTER_PATH } from "@/config/ctaLinks";
import { LANDING_ASSETS } from "@/config/landingAssets";

const imgErrors = reactive({
  appCaja: false,
  appGastos: false,
  appReporte: false,
});
</script>

<style scoped>
.font-display {
  font-family: "Outfit", "Inter", sans-serif;
}
</style>
