<template>
  <div class="min-h-screen bg-gray-50/50 flex flex-col pb-24">
    <!-- Header principal -->
    <header
      class="bg-white border-b border-gray-100 px-4 py-5 sm:px-6 lg:px-8 shadow-sm"
    >
      <div class="flex items-center justify-between max-w-7xl mx-auto">
        <div class="flex items-center gap-4">
          <div
            class="p-3 bg-teal-50 text-teal-600 rounded-2xl shadow-inner transition-transform duration-300 hover:scale-105"
          >
            <SoilAlt class="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <div>
            <h1
              class="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight font-display"
            >
              Asesoría WALA
              <span
                v-if="isAdminMode"
                class="ml-2 inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-700/10"
                >Admin</span
              >
            </h1>
            <p class="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
              {{
                isAdminMode
                  ? "Panel de Control de Asesorías Empresariales"
                  : "Optimiza y gestiona el crecimiento y madurez de tu negocio"
              }}
            </p>
          </div>
        </div>
      </div>
    </header>

    <!-- Indicador de Administrador -->
    <div
      v-if="isAdminMode && !loadingData && !showWizard"
      class="max-w-4xl w-full mx-auto mt-6 px-4 sm:px-6 lg:px-8"
    >
      <div
        class="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-sm"
      >
        <div class="flex items-center gap-4">
          <div
            class="p-3 bg-indigo-100 text-indigo-700 rounded-2xl shadow-inner flex-shrink-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.5"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <p class="text-base font-extrabold text-indigo-950 font-display">
              Eres admin, aquí modificaremos los apartados de:
              <span class="text-indigo-600">{{
                businessName || "Negocio sin nombre"
              }}</span>
            </p>
            <p class="text-sm text-indigo-700/80 font-medium mt-0.5">
              Propiedad de:
              <span class="underline font-bold">{{
                ownerEmail || "Sin email registrado"
              }}</span>
            </p>
          </div>
        </div>
        <button
          @click="goBack"
          class="inline-flex items-center gap-2 rounded-2xl bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50/50 hover:border-indigo-300 px-5 py-3 text-sm font-bold shadow-sm transition-all duration-200 cursor-pointer w-full sm:w-auto justify-center"
        >
          Volver a Directorio
        </button>
      </div>
    </div>

    <!-- Loading skeleton -->
    <div
      v-if="loadingData"
      class="flex-1 flex items-center justify-center p-12"
    >
      <div class="flex flex-col items-center gap-3">
        <svg
          class="animate-spin h-10 w-10 text-teal-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span class="text-sm font-semibold text-gray-500"
          >Cargando información de asesoría...</span
        >
      </div>
    </div>

    <!-- Vista de Pestañas Normal -->
    <template v-else>
      <PerformanceMatrix
        v-if="showWizard"
        :businessId="businessId"
        @close="showWizard = false"
      />
      <CriticalAreasSelect
        v-else-if="showCriticalAreasWizard"
        :businessId="businessId"
        @close="showCriticalAreasWizard = false; loadConsultingData()"
      />
      <ActionPlanCreate
        v-else-if="showActionPlanWizard"
        :businessId="businessId"
        @close="showActionPlanWizard = false; loadConsultingData()"
      />
      <template v-else>
        <!-- Barra de Navegación por Pestañas (ItemsConsulting) -->
        <div class="max-w-7xl w-full mx-auto mt-4 px-4 sm:px-6 lg:px-8">
          <ItemsConsulting />
        </div>

        <!-- Contenido Principal -->
        <main class="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div
            class="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-visible p-6 sm:p-10 min-h-[300px] transition-all duration-300 font-display"
          >
            <Transition name="fade-slide" mode="out-in">
              <!-- Sección: Resumen -->
              <div
                v-if="activeTab === 'resumen'"
                key="resumen"
                class="space-y-6"
              >
                <div
                  class="flex items-center justify-between border-b border-gray-100 pb-4 mb-4"
                >
                  <div class="flex items-center gap-3">
                    <div class="p-2 bg-gray-50 text-gray-700 rounded-xl">
                      <Reports class="w-6 h-6" />
                    </div>
                    <h2 class="text-lg font-bold text-gray-800">
                      Resumen de Asesoría
                    </h2>
                  </div>

                  <!-- Botón de guardar si es admin -->
                  <button
                    v-if="isAdminMode"
                    @click="saveConsultingData"
                    :disabled="savingData"
                    class="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-teal-700 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <SoilAlt class="w-3.5 h-3.5" />
                    {{ savingData ? "Guardando..." : "Guardar Cambios" }}
                  </button>
                </div>

                <div
                  class="flex flex-col items-stretch py-8 px-6 bg-gray-50/50 rounded-2xl border border-gray-200/50"
                >
                  <div
                    class="mx-auto w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-4 shadow-inner"
                  >
                    <Reports class="w-8 h-8" />
                  </div>
                  <h3
                    class="text-center text-xs font-bold text-gray-700 uppercase tracking-wider mb-2"
                  >
                    Estado del Expediente
                  </h3>

                  <!-- Si es admin, textarea, si no, texto normal -->
                  <div v-if="isAdminMode" class="mt-2">
                    <textarea
                      v-model="resumenText"
                      rows="4"
                      class="w-full rounded-2xl border-gray-200 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm p-4 text-center font-semibold text-gray-700 bg-white"
                      placeholder="Escribe el estado del expediente..."
                    ></textarea>
                  </div>
                  <p
                    v-else
                    class="text-center text-lg font-semibold text-gray-500 max-w-md mx-auto leading-relaxed uppercase tracking-wider"
                  >
                    {{ resumenText }}
                  </p>

                  <p
                    class="text-center text-xs text-gray-400 mt-4 max-w-xs mx-auto"
                  >
                    Cuando tu asesor o facilitador registre nuevos avances en tu
                    expediente, podrás visualizarlos de forma estructurada en
                    esta sección.
                  </p>
                </div>
              </div>

              <!-- Sección: Niveles de Madurez -->
              <div
                v-else-if="activeTab === 'madurez'"
                key="madurez"
                class="space-y-8"
              >
                <!-- Header -->
                <div
                  class="flex items-center justify-between border-b border-gray-100 pb-4 mb-2"
                >
                  <div class="flex items-center gap-3">
                    <div class="p-2 bg-teal-50 text-teal-600 rounded-xl">
                      <GraphUp class="w-6 h-6" />
                    </div>
                    <h2 class="text-lg font-bold text-gray-800">
                      Niveles de Madurez del Negocio
                    </h2>
                  </div>

                  <!-- Botón de guardar si es admin -->
                  <button
                    v-if="isAdminMode"
                    @click="showWizard = true"
                    class="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-teal-700 transition-all cursor-pointer"
                  >
                    <GraphUp class="w-3.5 h-3.5" />
                    Agregar o Guardar Desempeño
                  </button>
                </div>

                <!-- Guía de Niveles de Madurez (Mockup Legend) -->
                <div
                  class="bg-white border border-gray-150 rounded-[32px] p-6 shadow-sm space-y-4"
                >
                  <div
                    class="flex items-center justify-between gap-4 border-b border-gray-100 pb-3"
                  >
                    <div class="flex items-center gap-2">
                      <GraphUp class="w-5 h-5 text-gray-500" />
                      <h4 class="text-sm font-extrabold text-gray-800">
                        Guía de Niveles de Madurez
                      </h4>
                    </div>
                    <span class="text-[11px] font-bold text-gray-400">
                      Color de barra = nivel alcanzado
                    </span>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <!-- Aprendiz -->
                    <div
                      class="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white border border-gray-150 shadow-sm transition-all duration-200 hover:shadow-md"
                    >
                      <div
                        class="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-100/50 shrink-0"
                      >
                        <Leaf class="w-5 h-5" />
                      </div>
                      <div class="flex-1">
                        <p class="text-xs font-black text-gray-800">
                          Aprendiz
                        </p>
                        <p
                          class="text-[10px] font-bold text-gray-400 font-mono mt-0.5"
                        >
                          0.0 – 0.4
                        </p>
                      </div>
                      <div class="w-1.5 h-8 rounded-full bg-rose-500 shrink-0"></div>
                    </div>

                    <!-- Emprendedor -->
                    <div
                      class="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white border border-gray-150 shadow-sm transition-all duration-200 hover:shadow-md"
                    >
                      <div
                        class="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100/50 shrink-0"
                      >
                        <Rocket class="w-5 h-5" />
                      </div>
                      <div class="flex-1">
                        <p class="text-xs font-black text-gray-800">
                          Emprendedor
                        </p>
                        <p
                          class="text-[10px] font-bold text-gray-400 font-mono mt-0.5"
                        >
                          0.5 – 1.4
                        </p>
                      </div>
                      <div class="w-1.5 h-8 rounded-full bg-amber-500 shrink-0"></div>
                    </div>

                    <!-- Gerente -->
                    <div
                      class="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white border border-gray-150 shadow-sm transition-all duration-200 hover:shadow-md"
                    >
                      <div
                        class="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100/50 shrink-0"
                      >
                        <Group class="w-5 h-5" />
                      </div>
                      <div class="flex-1">
                        <p class="text-xs font-black text-gray-800">
                          Gerente
                        </p>
                        <p
                          class="text-[10px] font-bold text-gray-400 font-mono mt-0.5"
                        >
                          1.5 – 2.4
                        </p>
                      </div>
                      <div class="w-1.5 h-8 rounded-full bg-emerald-500 shrink-0"></div>
                    </div>

                    <!-- Empresario -->
                    <div
                      class="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white border border-gray-150 shadow-sm transition-all duration-200 hover:shadow-md"
                    >
                      <div
                        class="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100/50 shrink-0"
                      >
                        <BrightCrown class="w-5 h-5" />
                      </div>
                      <div class="flex-1">
                        <p class="text-xs font-black text-gray-800">
                          Empresario
                        </p>
                        <p
                          class="text-[10px] font-bold text-gray-400 font-mono mt-0.5"
                        >
                          2.5 – 3.0
                        </p>
                      </div>
                      <div class="w-1.5 h-8 rounded-full bg-indigo-500 shrink-0"></div>
                    </div>
                  </div>
                </div>

                <!-- Cycle summaries list (dynamic components) -->
                <div v-if="registeredMoments.length > 0" class="space-y-8">
                  <ResumenPerformanceMatriz
                    v-for="momentId in registeredMoments"
                    :key="momentId"
                    :momentId="momentId"
                    :scores="performanceStore.evaluations[momentId].scores"
                    :comments="
                      performanceStore.evaluations[momentId].comments || {}
                    "
                  />
                </div>

                <!-- Empty state when no cycles exist -->
                <div
                  v-else
                  class="bg-gray-50/50 border border-dashed border-gray-200 rounded-[32px] p-8 text-center"
                >
                  <GraphUp class="w-10 h-10 text-gray-400 mx-auto" />
                  <h4 class="text-sm font-extrabold text-gray-700 mt-3">
                    Sin evaluaciones registradas
                  </h4>
                  <p
                    class="text-xs text-gray-400 mt-1 max-w-sm mx-auto leading-relaxed"
                  >
                    Aún no se han evaluado los niveles de madurez de este
                    negocio en ningún ciclo.
                  </p>
                  <button
                    v-if="isAdminMode"
                    @click="showWizard = true"
                    class="mt-4 inline-flex items-center gap-2 rounded-2xl bg-teal-600 px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-teal-700 transition-all cursor-pointer"
                  >
                    Comenzar Evaluación
                  </button>
                </div>
              </div>

              <!-- Sección: Áreas Críticas -->
              <div
                v-else-if="activeTab === 'areas-criticas'"
                key="areas-criticas"
                class="space-y-6"
              >
                <div
                  class="flex items-center justify-between border-b border-gray-100 pb-4 mb-4"
                >
                  <div class="flex items-center gap-3">
                    <div class="p-2 bg-amber-50 text-amber-600 rounded-xl">
                      <WarningTriangle class="w-6 h-6" />
                    </div>
                    <h2 class="text-lg font-bold text-gray-800">
                      Áreas Críticas Identificadas
                    </h2>
                  </div>

                  <!-- Botón "Definir Áreas Críticas" si es admin y hay evaluaciones -->
                  <button
                    v-if="isAdminMode && registeredMoments.length > 0"
                    @click="showCriticalAreasWizard = true"
                    class="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-teal-700 transition-all cursor-pointer"
                  >
                    <WarningTriangle class="w-3.5 h-3.5" />
                    Definir Áreas Críticas
                  </button>
                </div>

                <!-- 1. BLOQUEO: Si no hay ninguna evaluación completa registrada -->
                <div
                  v-if="registeredMoments.length === 0"
                  class="bg-amber-50/40 border border-amber-250/70 rounded-[24px] p-6 sm:p-8 text-center space-y-4 max-w-md mx-auto"
                >
                  <div class="mx-auto w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shadow-inner">
                    <WarningTriangle class="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div class="space-y-1.5">
                    <h4 class="text-sm font-black text-amber-950 uppercase tracking-wider">Requiere Evaluación Completa</h4>
                    <p class="text-xs text-amber-700 font-semibold leading-relaxed">
                      Debes completar el diagnóstico de madurez (los 21 indicadores) en la pestaña "Niveles de Madurez" antes de poder definir las áreas críticas prioritarias de este negocio.
                    </p>
                  </div>
                  <button
                    v-if="isAdminMode"
                    @click="showWizard = true"
                    class="inline-flex items-center gap-2 rounded-2xl bg-amber-600 hover:bg-amber-700 px-5 py-3 text-xs font-bold text-white shadow-md transition-all cursor-pointer"
                  >
                    <GraphUp class="w-4 h-4" />
                    Ir a Niveles de Madurez
                  </button>
                </div>

                <!-- 2. VISTA: Si hay evaluaciones y las áreas críticas ya están definidas -->
                <div v-else-if="dossierCriticalAreas && dossierCriticalAreas.length === 3">
                  <CriticalAreasSelected :criticalAreas="dossierCriticalAreas" />
                </div>

                <!-- 3. EMPTY STATE: Si hay evaluaciones pero aún no se han definido las áreas críticas -->
                <div
                  v-else
                  class="bg-gray-50/50 border border-dashed border-gray-200 rounded-[32px] p-8 text-center space-y-4"
                >
                  <div class="mx-auto w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center shadow-inner">
                    <WarningTriangle class="w-6 h-6" />
                  </div>
                  <div class="space-y-1">
                    <h4 class="text-sm font-black text-gray-700 uppercase tracking-wider">Sin Áreas Críticas Definidas</h4>
                    <p class="text-xs text-gray-400 font-semibold leading-relaxed max-w-sm mx-auto">
                      Aún no se han seleccionado ni documentado las 3 áreas críticas priorizadas para el negocio.
                    </p>
                  </div>
                  <button
                    v-if="isAdminMode"
                    @click="showCriticalAreasWizard = true"
                    class="inline-flex items-center gap-2 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white px-5 py-3 text-xs font-bold shadow-md cursor-pointer transition-all duration-200"
                  >
                    Definir Áreas Críticas
                  </button>
                </div>
              </div>

              <!-- Sección: Plan de Acción -->
              <div
                v-else-if="activeTab === 'plan-accion'"
                key="plan-accion"
                class="space-y-6"
              >
                <div
                  class="flex items-center justify-between border-b border-gray-100 pb-4 mb-4"
                >
                  <div class="flex items-center gap-3">
                    <div class="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                      <SoilAlt class="w-6 h-6" />
                    </div>
                    <h2 class="text-lg font-bold text-gray-800">
                      Plan de Acción Wala
                    </h2>
                  </div>

                  <!-- Botones de administración -->
                  <div class="flex gap-2">
                    <button
                      v-if="isAdminMode"
                      @click="showActionPlanWizard = true"
                      class="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-750 transition-all cursor-pointer"
                    >
                      <SoilAlt class="w-3.5 h-3.5" />
                      Crear Plan de Acción
                    </button>
                    
                    <button
                      v-if="isAdminMode"
                      @click="saveConsultingData"
                      :disabled="savingData"
                      class="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-teal-700 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <SoilAlt class="w-3.5 h-3.5" />
                      {{ savingData ? "Guardando..." : "Guardar Estrategia" }}
                    </button>
                  </div>
                </div>

                <!-- Estrategia de Crecimiento -->
                <div
                  class="bg-indigo-50/20 rounded-2xl border border-indigo-100/50 p-6"
                >
                  <div class="flex items-start gap-4">
                    <div
                      class="p-3 bg-indigo-50 text-indigo-600 rounded-xl flex-shrink-0"
                    >
                      <SoilAlt class="w-7 h-7" />
                    </div>
                    <div class="space-y-3 w-full">
                      <h3
                        class="text-base font-bold text-indigo-950 uppercase tracking-wide"
                      >
                        Estrategia de Crecimiento
                      </h3>

                      <!-- Textarea para admin, texto normal para cliente -->
                      <div v-if="isAdminMode" class="mt-2">
                        <textarea
                          v-model="planAccionText"
                          rows="3"
                          class="w-full rounded-2xl border-indigo-200 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm p-4 font-semibold text-indigo-700 bg-white"
                          placeholder="Escribe la estrategia de crecimiento..."
                        ></textarea>
                      </div>
                      <p
                        v-else
                        class="text-base font-semibold text-indigo-700 leading-relaxed"
                      >
                        {{ planAccionText }}
                      </p>

                      <p class="text-xs text-indigo-600/80">
                        Tu ruta personalizada con metas concretas, compromisos y
                        plazos establecidos junto a tu asesor técnico para
                        transformar la gestión de tu negocio.
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Lista de acciones del plan -->
                <div class="mt-6 pt-6 border-t border-gray-150">
                  <ActionPlanView
                    :businessId="businessId"
                    :isAdminMode="isAdminMode"
                    @create-plan="showActionPlanWizard = true"
                  />
                </div>
              </div>
            </Transition>
          </div>
        </main>
      </template>
    </template>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { SoilAlt, Reports, GraphUp, WarningTriangle, Leaf, Rocket, Group, BrightCrown } from "@iconoir/vue";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebaseInit";
import ItemsConsulting from "@/components/consulting/ItemsConsulting.vue";
import PerformanceMatrix from "@/components/consulting/PerformanceMatrix.vue";
import ResumenPerformanceMatriz from "@/components/consulting/ResumenPerformanceMatriz.vue";
import CriticalAreasSelect from "@/components/consulting/CriticalAreasSelect.vue";
import CriticalAreasSelected from "@/components/consulting/CriticalAreasSelected.vue";
import ActionPlanCreate from "@/components/consulting/ActionPlanCreate.vue";
import ActionPlanView from "@/components/consulting/ActionPlanView.vue";
import { useAuthStore } from "@/stores/authStore";
import { useBusinessStore } from "@/stores/businessStore";
import { usePerformanceStore, AREAS_CONFIG } from "@/stores/performanceStore";
import { useToast } from "@/composables/useToast";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const businessStore = useBusinessStore();
const performanceStore = usePerformanceStore();
const toast = useToast();

const showWizard = ref(false);
const showCriticalAreasWizard = ref(false);
const showActionPlanWizard = ref(false);
const dossierCriticalAreas = ref([]);

const activeTab = computed(() => route.query.tab || "resumen");

const ADMIN_EMAILS = ["josenavarretedr@gmail.com", "admin@wala.lat"];

const isAdminMode = computed(() => {
  return (
    route.meta.adminMode === true &&
    ADMIN_EMAILS.includes(authStore.user?.email)
  );
});

// Cycles fully completed with all 21 indicators
const registeredMoments = computed(() => {
  const moments = ["inicial", "ciclo1", "ciclo2", "final"];
  
  // Extract all 21 indicator keys from AREAS_CONFIG
  const allIndicatorKeys = AREAS_CONFIG.flatMap((area) =>
    area.indicators.map((ind) => ind.key)
  );

  return moments.filter((m) => {
    const scores = performanceStore.evaluations[m]?.scores;
    if (!scores) return false;
    return allIndicatorKeys.every(
      (key) => scores[key] !== undefined && scores[key] !== null && scores[key] !== ""
    );
  });
});

// ID del negocio activo (ruta para admin, Pinia para cliente)
const businessId = computed(() => {
  return (
    route.params.businessId ||
    authStore.user?.businessId ||
    businessStore.business?.id
  );
});

// Campos reactivos para nombre de negocio, dueño, textos y loading
const businessName = ref("");
const ownerEmail = ref("");
const resumenText = ref("NO TIENES REGISTROS ESPERADOS");
const madurezText = ref("Aquí tu diagnostico de tu negocio inicial");
const areasCriticasText = ref("Aquí tus tres áreas identificadas.");
const planAccionText = ref("Tu plan de acción Wala");
const loadingData = ref(false);
const savingData = ref(false);

const goBack = () => {
  router.push("/admin/users");
};

// Cargar datos del dossier y del negocio
const loadConsultingData = async () => {
  if (!businessId.value) return;
  loadingData.value = true;
  try {
    // 1. Cargar el dossier de asesoría
    const docRef = doc(
      db,
      "businesses",
      businessId.value,
      "consulting",
      "dossier",
    );
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      resumenText.value = data.resumenText || "NO TIENES REGISTROS ESPERADOS";
      madurezText.value =
        data.madurezText || "Aquí tu diagnostico de tu negocio inicial";
      areasCriticasText.value =
        data.areasCriticasText || "Aquí tus tres áreas identificadas.";
      planAccionText.value = data.planAccionText || "Tu plan de acción Wala";
      dossierCriticalAreas.value = data.criticalAreas || [];
    } else {
      dossierCriticalAreas.value = [];
    }

    // 2. Cargar datos del negocio principal (nombre y gerente)
    const bizRef = doc(db, "businesses", businessId.value);
    const bizSnap = await getDoc(bizRef);
    if (bizSnap.exists()) {
      const data = bizSnap.data();
      businessName.value = data.nombre || data.businessName || data.name || "";
      if (data.email) {
        ownerEmail.value = data.email;
      }

      // Si tiene gerente asignado, cargamos el correo del gerente desde users
      if (data.gerenteId) {
        const userRef = doc(db, "users", data.gerenteId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          ownerEmail.value = userSnap.data().email || ownerEmail.value;
        }
      }
    }
  } catch (error) {
    console.error("Error al cargar la información de asesoría:", error);
    toast.error("No se pudo cargar la información");
  } finally {
    loadingData.value = false;
  }
};

// Guardar los datos en el dossier de asesoría
const saveConsultingData = async () => {
  if (!businessId.value) return;
  savingData.value = true;
  try {
    const docRef = doc(
      db,
      "businesses",
      businessId.value,
      "consulting",
      "dossier",
    );
    await setDoc(
      docRef,
      {
        resumenText: resumenText.value,
        madurezText: madurezText.value,
        areasCriticasText: areasCriticasText.value,
        planAccionText: planAccionText.value,
        updatedAt: new Date(),
        updatedBy: authStore.user?.uid || "admin",
      },
      { merge: true },
    );

    // Actualizar el negocio con hasConsulting: true para indexación en filtros del directorio
    const bizRef = doc(db, "businesses", businessId.value);
    await setDoc(
      bizRef,
      {
        hasConsulting: true,
        updatedAt: new Date(),
      },
      { merge: true },
    );

    toast.success("Asesoría guardada con éxito");
  } catch (error) {
    console.error("Error al guardar la asesoría:", error);
    toast.error("Error al guardar la asesoría");
  } finally {
    savingData.value = false;
  }
};

onMounted(() => {
  loadConsultingData();
  if (businessId.value) {
    performanceStore.loadScores(businessId.value);
  }
});
</script>

<script>
// Mantener el nombre del componente para transiciones o debugging
export default {
  name: "ConsultingDashboard",
};
</script>

<style scoped>
.font-display {
  font-family: "Outfit", "Inter", sans-serif;
}

/* Transiciones de pestañas */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

textarea {
  resize: vertical;
}
</style>
