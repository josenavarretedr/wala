<template>
  <section
    v-if="SHOW_CASES_SECTION && activeCases.length > 0"
    id="testimonials-section"
    class="py-20 md:py-28 px-4 bg-transparent relative overflow-hidden font-display"
  >
    <div
      class="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10"
    >
      <div
        class="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-50 rounded-full filter blur-3xl opacity-15"
      ></div>
      <div
        class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-slate-100 rounded-full filter blur-3xl opacity-25"
      ></div>
    </div>

    <div class="max-w-4xl mx-auto text-center">
      <div class="space-y-4 mb-14">
        <span
          class="inline-block px-4 py-1.5 bg-orange-50 border border-orange-100 text-[#E35336] text-xs font-bold uppercase tracking-wider rounded-full"
        >
          Prueba Social
        </span>
        <h2
          class="text-3xl sm:text-4xl md:text-5xl text-gray-900 font-extrabold leading-tight max-w-2xl mx-auto"
        >
          Lo que dicen los emprendedores que
          <span class="text-[#E35336]">ya pasaron por esto</span>
        </h2>
        <p class="text-base sm:text-lg text-gray-600 font-medium max-w-md mx-auto">
          Casos reales de claridad y transformación que empezaron con una sesión de 30 minutos.
        </p>
      </div>

      <!-- Carrusel de Casos -->
      <div class="relative max-w-2xl mx-auto">
        <div class="relative min-h-[280px]">
          <transition name="fade-slide" mode="out-in">
            <div
              :key="currentCase.id || currentIndex"
              class="bg-white rounded-3xl border border-gray-200/60 shadow-sm p-6 sm:p-10 text-left space-y-5 relative overflow-hidden"
            >
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                  <div
                    class="w-11 h-11 bg-[#E35336]/10 text-[#E35336] rounded-2xl flex items-center justify-center shrink-0"
                  >
                    <User class="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <p class="text-sm font-extrabold text-gray-900">
                      {{ currentCase.rubro }}
                    </p>
                    <p class="text-xs font-semibold text-gray-600">
                      {{ currentCase.ciudad }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div class="bg-slate-50 border border-slate-200/70 rounded-xl p-3 space-y-1">
                  <p class="font-bold uppercase tracking-wider text-gray-500 text-[10px]">
                    Síntoma
                  </p>
                  <p class="text-gray-700 font-medium leading-snug">
                    {{ currentCase.sintoma }}
                  </p>
                </div>
                <div class="bg-[#FFF5F2] border border-[#E35336]/20 rounded-xl p-3 space-y-1">
                  <p class="font-bold uppercase tracking-wider text-[#E35336] text-[10px]">
                    Hallazgo
                  </p>
                  <p class="text-gray-800 font-medium leading-snug">
                    {{ currentCase.hallazgo }}
                  </p>
                </div>
                <div class="bg-emerald-50/70 border border-emerald-200/70 rounded-xl p-3 space-y-1">
                  <p class="font-bold uppercase tracking-wider text-emerald-700 text-[10px]">
                    Cambio
                  </p>
                  <p class="text-gray-800 font-medium leading-snug">
                    {{ currentCase.cambio }}
                  </p>
                </div>
              </div>

              <p class="text-base sm:text-lg text-gray-700 italic font-medium leading-relaxed">
                “{{ currentCase.cita }}”
              </p>

              <p class="text-xs sm:text-sm font-extrabold text-gray-900 pt-1">
                — {{ currentCase.autor }}
              </p>
            </div>
          </transition>
        </div>

        <!-- Controles de Navegación del Carrusel -->
        <div class="flex justify-between items-center mt-6">
          <div class="flex gap-2">
            <button
              v-for="(item, index) in activeCases"
              :key="item.id || index"
              type="button"
              @click="currentIndex = index"
              class="h-2.5 rounded-full transition-all duration-300 cursor-pointer focus:outline-none"
              :class="
                currentIndex === index
                  ? 'bg-[#E35336] w-6'
                  : 'bg-gray-300 hover:bg-gray-400 w-2.5'
              "
              :aria-label="`Ir a caso ${index + 1}`"
            ></button>
          </div>

          <div class="flex gap-2">
            <button
              type="button"
              class="w-9 h-9 rounded-xl border border-gray-200/60 bg-white hover:bg-slate-50 flex items-center justify-center text-gray-600 shadow-sm active:scale-95 transition-all cursor-pointer"
              @click="prevCase"
              aria-label="Caso anterior"
            >
              <NavArrowLeft class="w-4 h-4 stroke-[2.2]" />
            </button>
            <button
              type="button"
              class="w-9 h-9 rounded-xl border border-gray-200/60 bg-white hover:bg-slate-50 flex items-center justify-center text-gray-600 shadow-sm active:scale-95 transition-all cursor-pointer"
              @click="nextCase"
              aria-label="Siguiente caso"
            >
              <NavArrowRight class="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from "vue";
import { NavArrowLeft, NavArrowRight, User } from "@iconoir/vue";
import { LANDING_CASES, SHOW_CASES_SECTION } from "@/config/landingCases";

const currentIndex = ref(0);
const activeCases = computed(() => (Array.isArray(LANDING_CASES) ? LANDING_CASES : []));

const currentCase = computed(() => activeCases.value[currentIndex.value] || {});

const nextCase = () => {
  if (!activeCases.value.length) return;
  currentIndex.value = (currentIndex.value + 1) % activeCases.value.length;
};

const prevCase = () => {
  if (!activeCases.value.length) return;
  currentIndex.value =
    (currentIndex.value - 1 + activeCases.value.length) % activeCases.value.length;
};
</script>

<style scoped>
.font-display {
  font-family: "Outfit", "Inter", sans-serif;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
