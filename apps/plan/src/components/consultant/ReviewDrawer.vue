<script setup>
import { computed } from 'vue';
import { useFacilitatorStore } from '@/stores/facilitator';
import FacilitatorCostingReview from '@/components/consultant/FacilitatorCostingReview.vue';
import FacilitatorInvestmentReview from '@/components/consultant/FacilitatorInvestmentReview.vue';

const facilitatorStore = useFacilitatorStore();

const isCostingSession = computed(() => Number(facilitatorStore.selectedSessionId) === 6);
const isInvestmentSession = computed(() => Number(facilitatorStore.selectedSessionId) === 7);

const isCurrentApproved = computed(() => {
  return facilitatorStore.selectedSectionData?.isApproved;
});

const fieldsList = computed(() => {
  return facilitatorStore.selectedSectionData?.fields || [];
});

async function handleApproveAll() {
  await facilitatorStore.saveAndApproveSection(fieldsList.value);
}

async function handleSaveDraft() {
  await facilitatorStore.saveDraftSection(fieldsList.value);
}

function handleKeyDown(e) {
  if (e.key === 'Escape') {
    facilitatorStore.closeReviewDrawer();
  }
}
</script>

<template>
  <div
    v-if="facilitatorStore.isDrawerOpen"
    class="fixed inset-0 z-50 overflow-hidden"
    @keydown="handleKeyDown"
  >
    <!-- Fondo oscuro traslúcido -->
    <div
      class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
      @click="facilitatorStore.closeReviewDrawer"
    ></div>

    <!-- Panel lateral deslizante (Drawer) -->
    <div class="fixed inset-y-0 right-0 max-w-full flex pl-10">
      <aside
        class="w-screen bg-white shadow-2xl border-l border-slate-200 flex flex-col transform transition-transform duration-300 ease-in-out animate-slideLeft"
        :class="isCostingSession || isInvestmentSession ? 'max-w-6xl' : 'max-w-3xl'"
      >
        <!-- CABECERA DEL DRAWER -->
        <header class="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-sm"
            >
              {{ facilitatorStore.selectedParticipant?.personalInfo?.firstName?.charAt(0) || 'P' }}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-base font-bold text-slate-900 leading-tight">
                  {{ facilitatorStore.selectedParticipant?.personalInfo?.firstName }}
                  {{ facilitatorStore.selectedParticipant?.personalInfo?.lastName }}
                </h2>
                <span class="text-xs px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 font-mono font-semibold">
                  DNI: {{ facilitatorStore.selectedParticipant?.dni }}
                </span>
              </div>
              <p class="text-xs text-slate-500 font-medium">
                {{ facilitatorStore.selectedParticipant?.businessBasicInfo?.commercialName || 'Emprendimiento' }}
                &bull;
                <span class="capitalize text-slate-600 font-semibold">
                  {{ facilitatorStore.selectedParticipant?.businessBasicInfo?.businessNature || 'Producción' }}
                </span>
              </p>
            </div>
          </div>

          <!-- Controles de navegación y cierre -->
          <div class="flex items-center gap-2">
            <!-- Navegación entre participantes -->
            <div class="inline-flex items-center rounded-lg border border-slate-300 bg-white p-0.5 shadow-2xs">
              <button
                type="button"
                @click="facilitatorStore.navigateSiblingParticipant('prev')"
                title="Participante anterior"
                class="px-2 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
              >
                ◀
              </button>
              <span class="text-[11px] text-slate-400 px-1 border-x border-slate-200 font-mono">Auditar</span>
              <button
                type="button"
                @click="facilitatorStore.navigateSiblingParticipant('next')"
                title="Siguiente participante"
                class="px-2 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
              >
                ▶
              </button>
            </div>

            <!-- Botón Cerrar -->
            <button
              type="button"
              @click="facilitatorStore.closeReviewDrawer"
              class="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              title="Cerrar panel (Esc)"
            >
              ✕
            </button>
          </div>
        </header>

        <!-- SUB-BARRA: SESIÓN Y ESTADO DE REVISIÓN -->
        <div class="px-6 py-2.5 bg-blue-50/70 border-b border-blue-100 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-xs font-black px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-mono">
              Sesión {{ facilitatorStore.selectedSessionId }}
            </span>
            <span class="text-xs font-bold text-blue-950">
              {{ facilitatorStore.selectedSectionData?.sectionTitle }}
            </span>
          </div>

          <!-- Indicador de estado global de la sesión -->
          <div>
            <span
              v-if="isCurrentApproved"
              class="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300"
            >
              <span>✓</span>
              <span>Módulo Aprobado por Consultor</span>
            </span>
            <span
              v-else
              class="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 animate-pulse"
            >
              <span>⏳</span>
              <span>Pendiente de Revisión</span>
            </span>
          </div>
        </div>

        <!-- NOTIFICACIÓN DE ÉXITO O ERROR -->
        <div
          v-if="facilitatorStore.drawerNotification"
          class="mx-6 mt-4 p-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all"
          :class="[
            facilitatorStore.drawerNotification.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-rose-50 text-rose-900 border border-rose-200'
          ]"
        >
          <span>{{ facilitatorStore.drawerNotification.message }}</span>
          <button
            type="button"
            @click="facilitatorStore.drawerNotification = null"
            class="font-bold opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>

        <!-- CONTENIDO PRINCIPAL SCROLLABLE CON TARJETAS POR CADA CAMPO DE LA SESIÓN -->
        <div class="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          <!-- SPINNER SI ESTÁ CARGANDO -->
          <div
            v-if="facilitatorStore.isLoadingSectionData"
            class="h-64 flex flex-col items-center justify-center text-slate-400 gap-2"
          >
            <div class="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p class="text-xs font-semibold">Cargando todas las respuestas del módulo...</p>
          </div>

          <template v-else>
            <!-- CASO A: SESIÓN 6 - AUDITORÍA DE COSTEO POLIMÓRFICO -->
            <FacilitatorCostingReview v-if="isCostingSession" />

            <!-- CASO B: SESIÓN 7 - AUDITORÍA DE PRESUPUESTO CAPITAL SEMILLA (3 RUBROS) -->
            <FacilitatorInvestmentReview v-else-if="isInvestmentSession" />

            <!-- CASO C: OTRAS SESIONES (1, 2, 3, 4, 5, 8) - VISTA MULTICAMPO ESTÁNDAR -->
            <template v-else>
              <div v-if="fieldsList.length === 0" class="py-12 text-center text-slate-400 text-xs">
                No se encontraron campos configurados para esta sesión.
              </div>

              <!-- BUCLE POR CADA CAMPO DE LA SESIÓN (EJ: MISIÓN, VISIÓN, OBJETIVOS) -->
              <div
                v-for="(field, index) in fieldsList"
                :key="field.fieldId"
                class="border border-slate-200/90 rounded-2xl p-5 bg-white shadow-2xs space-y-4 hover:border-blue-200 transition-colors"
              >
                <!-- ENCABEZADO DE CADA CAMPO -->
                <div class="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div class="flex items-center gap-2">
                    <span class="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center font-mono">
                      {{ index + 1 }}
                    </span>
                    <h3 class="text-xs font-black text-slate-800 uppercase tracking-wide">
                      {{ field.label }}
                    </h3>
                  </div>

                  <span
                    v-if="field.status === 'aprobado'"
                    class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800"
                  >
                    ✓ Aprobado
                  </span>
                  <span
                    v-else
                    class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900"
                  >
                    ⏳ Pendiente
                  </span>
                </div>

                <!-- SECCIÓN 1: [Lo que escribió el participante] (rawInput en modo lectura, fondo gris sutil) -->
                <div class="space-y-1.5">
                  <div class="flex items-center justify-between">
                    <span class="text-[11px] font-bold text-slate-700 uppercase flex items-center gap-1.5">
                      <span>🗣️</span>
                      <span>1. Lo que escribió el participante:</span>
                    </span>
                    <span class="text-[10px] text-slate-400 font-medium">Solo lectura</span>
                  </div>
                  <div class="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-wrap shadow-2xs">
                    {{ field.rawInput || '(Sin respuesta aún)' }}
                  </div>
                </div>

                <!-- SECCIÓN 2: [Notas / Enfoque Técnico del Facilitador] -->
                <div class="space-y-1.5">
                  <div class="flex items-center justify-between">
                    <span class="text-[11px] font-bold text-blue-900 uppercase flex items-center gap-1.5">
                      <span>📝</span>
                      <span>2. Notas / Enfoque Técnico del Facilitador:</span>
                    </span>
                    <span class="text-[10px] text-blue-600 font-medium">Contexto técnico para IA</span>
                  </div>
                  <textarea
                    v-model="field.consultantNotes"
                    rows="2"
                    placeholder="Agrega contexto del negocio, términos del donante o sugerencias de corrección para guiar la síntesis..."
                    class="w-full rounded-xl border border-blue-200 bg-blue-50/20 p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all leading-relaxed shadow-xs"
                  ></textarea>
                </div>

                <!-- SECCIÓN 3: [Botón de Acción IA] -->
                <div class="pt-0.5">
                  <button
                    type="button"
                    :disabled="facilitatorStore.refiningFields[field.fieldId]"
                    @click="facilitatorStore.refineFieldWithAI(index)"
                    class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer border"
                    :class="[
                      facilitatorStore.refiningFields[field.fieldId]
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                        : 'bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white border-transparent hover:shadow-md active:scale-99'
                    ]"
                  >
                    <!-- Spinner de carga -->
                    <svg
                      v-if="facilitatorStore.refiningFields[field.fieldId]"
                      class="animate-spin h-4 w-4 text-violet-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span v-else class="text-sm">✨</span>

                    <span>
                      {{
                        facilitatorStore.refiningFields[field.fieldId]
                          ? 'Sintetizando con asistente...'
                          : '✨ Formalizar con Asistente (Grok)'
                      }}
                    </span>
                  </button>
                </div>

                <!-- SECCIÓN 4: [Propuesta Formal Consolidada] (aiRefinement / finalApprovedText) -->
                <div class="space-y-1.5 pt-0.5">
                  <div class="flex items-center justify-between">
                    <span class="text-[11px] font-bold text-violet-950 uppercase flex items-center gap-1.5">
                      <span>🏛️</span>
                      <span>4. Propuesta Formal Consolidada:</span>
                    </span>
                    <span class="text-[10px] font-bold text-violet-700 bg-violet-100 px-2 py-0.5 rounded-full">
                      Editable por Facilitador
                    </span>
                  </div>
                  <textarea
                    v-model="field.finalApprovedText"
                    rows="4"
                    placeholder="Redacción formal refinada para el plan de negocios final (resultado de IA o redacción del consultor)..."
                    class="w-full rounded-xl border border-violet-300 bg-violet-50/20 p-3.5 text-xs text-slate-900 focus:bg-white focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all leading-relaxed shadow-xs"
                  ></textarea>
                  <div v-if="field.aiRefinement" class="flex items-center justify-between text-[11px] text-slate-500 px-1">
                    <span class="text-violet-700 font-medium">✓ Propuesta IA incorporada</span>
                    <button
                      v-if="field.finalApprovedText !== field.aiRefinement"
                      type="button"
                      @click="field.finalApprovedText = field.aiRefinement"
                      class="text-violet-600 hover:text-violet-800 underline font-semibold"
                    >
                      Restaurar texto generado por IA
                    </button>
                  </div>
                </div>
              </div>
            </template>
          </template>
        </div>

        <!-- PIE DE ACCIONES DEL DRAWER (5. Botones de Cierre) -->
        <footer class="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2 flex-wrap">
          <button
            type="button"
            @click="facilitatorStore.closeReviewDrawer"
            class="px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors"
          >
            Cerrar
          </button>

          <div class="flex items-center gap-2">
            <!-- Botón: Guardar Borrador / Mantener Pendiente -->
            <button
              type="button"
              :disabled="facilitatorStore.isSavingDraft || facilitatorStore.isSavingApproval"
              @click="handleSaveDraft"
              class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 shadow-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                v-if="facilitatorStore.isSavingDraft"
                class="animate-spin h-3.5 w-3.5 text-amber-900"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span v-else>📁</span>
              <span>{{ facilitatorStore.isSavingDraft ? 'Guardando...' : 'Guardar Borrador / Mantener Pendiente' }}</span>
            </button>

            <!-- Botón: [💾 Guardar y Aprobar] -->
            <button
              type="button"
              :disabled="facilitatorStore.isSavingApproval || facilitatorStore.isSavingDraft"
              @click="handleApproveAll"
              class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
              :class="[
                facilitatorStore.isSavingApproval
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white'
              ]"
            >
              <svg
                v-if="facilitatorStore.isSavingApproval"
                class="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span v-else>💾</span>
              <span>
                {{ facilitatorStore.isSavingApproval ? 'Guardando...' : '💾 Guardar y Aprobar' }}
              </span>
            </button>
          </div>
        </footer>
      </aside>
    </div>
  </div>
</template>

<style scoped>
@keyframes slideLeft {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}
.animate-slideLeft {
  animation: slideLeft 0.25s ease-out forwards;
}
</style>
