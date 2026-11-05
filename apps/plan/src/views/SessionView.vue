<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { SESSIONS_DATA, getSessionTitle } from '@/data/sessionsData';
import { useAuthStore } from '@/stores/auth';
import { useSessionStore } from '@/stores/sessions';
import { useCostingStore } from '@/stores/costing';
import SyncStatusBadge from '@/components/common/SyncStatusBadge.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppInput from '@/components/common/AppInput.vue';
import MicrolearningCard from '@/components/sessions/MicrolearningCard.vue';
import QuizCard from '@/components/sessions/QuizCard.vue';
import GatekeeperLock from '@/components/sessions/GatekeeperLock.vue';
import SessionProgressBar from '@/components/sessions/SessionProgressBar.vue';

// Componentes interactivos de Costeo y Capital Semilla (Fase 3)
import ProductBatchCard from '@/components/costing/ProductBatchCard.vue';
import ProductSummaryMetrics from '@/components/costing/ProductSummaryMetrics.vue';
import IngredientRow from '@/components/costing/IngredientRow.vue';
import AddIngredientSheet from '@/components/costing/AddIngredientSheet.vue';
import SeedCapitalBar from '@/components/costing/SeedCapitalBar.vue';
import InvestmentItemRow from '@/components/costing/InvestmentItemRow.vue';
import WorkingCapitalSection from '@/components/costing/WorkingCapitalSection.vue';
import { useCostingCalculator } from '@/composables/useCostingCalculator';

// Componente interactivo de Lienzo Canvas Móvil (Sesión 5)
import CanvasAccordionView from '@/components/sessions/canvas/CanvasAccordionView.vue';
import DualTextField from '@/components/sessions/DualTextField.vue';
import { usePlanStore, SESSION_SECTION_KEYS } from '@/stores/plan';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const sessionStore = useSessionStore();
const costingStore = useCostingStore();
const planStore = usePlanStore();

const sessionId = computed(() => Number(route.params.id) || 1);
const sessionMeta = computed(() => SESSIONS_DATA.find((s) => s.id === sessionId.value));

const currentBusinessNature = computed(() => {
  return authStore.currentParticipant?.businessBasicInfo?.businessNature || formData.value?.businessNature || 'produccion';
});

const dynamicSessionTitle = computed(() => {
  return getSessionTitle(sessionMeta.value, currentBusinessNature.value);
});

const { formatMoney } = useCostingCalculator();

const currentStep = ref(1); // 1: Aprender, 2: Quiz, 3: Formulario
const formData = ref({});
const isSavingForm = ref(false);
const saveSuccessToast = ref(false);

// Estados auxiliares para costeo e inversión (Fase 3)
const showAddIngredientSheet = ref(false);
const editingIngredient = ref(null);
const showAddInvestmentModal = ref(false);
const isSyncingWorkingCapital = ref(false);
const newInvRubro = ref('rubro_a');

const newInv = ref({
  category: 'Maquinaria y Equipo',
  rubro: 'rubro_a',
  description: '',
  quantity: 1,
  unitPriceEstimated: 100.0,
  priority: 'alta',
  financedBySeedCapital: true
});

const activeProduct = computed(() => costingStore.activeProduct);
const investmentItems = computed(() => costingStore.seedCapitalInvestmentPlan?.investmentItems || []);

const progress = computed(() => sessionStore.getSessionProgressData(sessionId.value));
const isUnlocked = computed(() => sessionStore.isSessionUnlocked(sessionId.value));

// Inicializar y cargar datos
onMounted(async () => {
  if (authStore.currentParticipant?.dni) {
    const dni = authStore.currentParticipant.dni;
    await sessionStore.loadSessionsProgress(dni);

    // Activar listeners en tiempo real para reflejar aprobaciones y ajustes del facilitador
    planStore.startParticipantPlanListener(dni);
    sessionStore.startParticipantProgressListener(dni);
    costingStore.startParticipantCostingListener(dni);

    if ([2, 3, 4].includes(sessionId.value)) {
      const sectionKey = SESSION_SECTION_KEYS[sessionId.value] || sessionMeta.value?.sessionCode?.toLowerCase();
      if (sectionKey) {
        await planStore.loadQualitativeSection(dni, sessionId.value, sectionKey);
      }
    } else if (sessionId.value === 5) {
      await planStore.loadCanvas(dni);
    } else if (sessionId.value === 6 || sessionId.value === 7) {
      await costingStore.loadCostingData(dni);
      if (sessionId.value === 7) {
        await costingStore.syncWorkingCapitalToInvestmentPlan();
      }
    }
    hydrateFormAnswers();
    determineInitialStep();
  }
});

onUnmounted(() => {
  planStore.stopParticipantPlanListener();
  sessionStore.stopParticipantProgressListener();
  costingStore.stopParticipantCostingListener();
});

watch(sessionId, async () => {
  if (authStore.currentParticipant?.dni) {
    const dni = authStore.currentParticipant.dni;
    if ([2, 3, 4].includes(sessionId.value)) {
      const sectionKey = SESSION_SECTION_KEYS[sessionId.value] || sessionMeta.value?.sessionCode?.toLowerCase();
      if (sectionKey) {
        await planStore.loadQualitativeSection(dni, sessionId.value, sectionKey);
      }
    } else if (sessionId.value === 5) {
      await planStore.loadCanvas(dni);
    } else if (sessionId.value === 6 || sessionId.value === 7) {
      costingStore.startParticipantCostingListener(dni);
      await costingStore.loadCostingData(dni);
      if (sessionId.value === 7) {
        await costingStore.syncWorkingCapitalToInvestmentPlan();
      }
    }
  }
  hydrateFormAnswers();
  determineInitialStep();
});

function determineInitialStep() {
  const prog = progress.value;
  if (!prog) {
    currentStep.value = 1;
    return;
  }

  if (prog.formSubmission?.isCompleted) {
    currentStep.value = 3;
  } else if (prog.quizAssessment?.passed) {
    currentStep.value = 3;
  } else if (prog.gatekeeping?.microlearningCompleted) {
    currentStep.value = 2;
  } else {
    currentStep.value = 1;
  }
}

function hydrateFormAnswers() {
  const savedAnswers = sessionStore.getFormAnswers(sessionId.value);
  const initial = {};

  if (sessionMeta.value?.formFields) {
    for (const field of sessionMeta.value.formFields) {
      if (savedAnswers[field.id] !== undefined) {
        initial[field.id] = savedAnswers[field.id];
      } else if ([2, 3, 4].includes(sessionId.value)) {
        const dual = planStore.getDualField(sessionId.value, field.id);
        initial[field.id] = dual?.rawInput || '';
      } else if (sessionId.value === 1) {
        // Precargar datos del participante si existen
        const part = authStore.currentParticipant;
        if (field.id === 'firstName') initial.firstName = part?.personalInfo?.firstName || '';
        if (field.id === 'lastName') initial.lastName = part?.personalInfo?.lastName || '';
        if (field.id === 'commercialName') initial.commercialName = part?.businessBasicInfo?.commercialName || '';
        if (field.id === 'businessNature') initial.businessNature = savedAnswers.businessNature || part?.businessBasicInfo?.businessNature || 'produccion';
        if (field.id === 'sector') initial.sector = part?.businessBasicInfo?.sector || '';
        if (field.id === 'subSector') initial.subSector = part?.businessBasicInfo?.subSector || '';
        if (field.id === 'operatingStatus') initial.operatingStatus = part?.businessBasicInfo?.operatingStatus || 'En marcha (ya vendo y opero)';
        if (field.id === 'address') initial.address = part?.personalInfo?.location?.address || '';
      } else {
        initial[field.id] = '';
      }
    }
  }

  formData.value = initial;
}

function handleDualFieldUpdate(fieldId, dualData) {
  if (dualData?.rawInput !== undefined) {
    formData.value[fieldId] = dualData.rawInput;
  }
}

async function handleSelectBusinessNature(nature) {
  formData.value.businessNature = nature;
  if (authStore.currentParticipant?.businessBasicInfo) {
    authStore.currentParticipant.businessBasicInfo.businessNature = nature;
  }
  await costingStore.applyBusinessNatureFromS1(nature);
}

// Handlers de progreso
async function handleCompleteMicrolearning() {
  const dni = authStore.currentParticipant?.dni;
  if (!dni) return;

  await sessionStore.completeMicrolearning(dni, sessionId.value);
  currentStep.value = 2;
}

async function handleQuizAttempt(attemptResult) {
  const dni = authStore.currentParticipant?.dni;
  if (!dni) return;

  await sessionStore.recordQuizAttempt(dni, sessionId.value, attemptResult);
}

function handleContinueToForm() {
  currentStep.value = 3;
}

// Handlers Insumos (Sesión 6)
function handleOpenAddIngredient() {
  editingIngredient.value = null;
  showAddIngredientSheet.value = true;
}

function handleOpenEditIngredient(ingredient) {
  editingIngredient.value = ingredient;
  showAddIngredientSheet.value = true;
}

async function handleSaveIngredientSheet(data) {
  if (!activeProduct.value) return;
  if (data.ingredientId) {
    await costingStore.updateIngredient(activeProduct.value.productId, data.ingredientId, data);
  } else {
    await costingStore.addIngredient(activeProduct.value.productId, data);
  }
  showAddIngredientSheet.value = false;
  editingIngredient.value = null;
}

function handleUpdateIngredient(updatedIngredient) {
  if (!activeProduct.value) return;
  costingStore.updateIngredient(activeProduct.value.productId, updatedIngredient.ingredientId, {
    name: updatedIngredient.name,
    quantityUsed: updatedIngredient.recipeConsumption?.quantityUsed,
    unit: updatedIngredient.recipeConsumption?.unit,
    packageUnitName: updatedIngredient.marketPurchase?.packageUnitName,
    quantityInPackage: updatedIngredient.marketPurchase?.quantityInPackage,
    packageCost: updatedIngredient.marketPurchase?.packageCost
  });
}

function handleRemoveIngredient(ingredientId) {
  if (!activeProduct.value) return;
  costingStore.removeIngredient(activeProduct.value.productId, ingredientId);
}

// Handlers Inversión (Sesión 7)
function openAddInvestmentModal(targetRubro = 'rubro_a') {
  if (showAddInvestmentModal.value && newInvRubro.value === targetRubro) {
    showAddInvestmentModal.value = false;
    return;
  }
  newInvRubro.value = targetRubro;
  if (targetRubro === 'rubro_c') {
    newInv.value = {
      category: 'Acondicionamiento y Otros',
      rubro: 'rubro_c',
      description: '',
      quantity: 1,
      unitPriceEstimated: 150.0,
      priority: 'media',
      financedBySeedCapital: true
    };
  } else {
    newInv.value = {
      category: 'Maquinaria y Equipo',
      rubro: 'rubro_a',
      description: '',
      quantity: 1,
      unitPriceEstimated: 250.0,
      priority: 'alta',
      financedBySeedCapital: true
    };
  }
  showAddInvestmentModal.value = true;
}

async function handleSyncWorkingCapital() {
  isSyncingWorkingCapital.value = true;
  try {
    await costingStore.syncWorkingCapitalToInvestmentPlan();
  } finally {
    isSyncingWorkingCapital.value = false;
  }
}

async function handleCreateInvestmentItem() {
  if (!newInv.value.description.trim()) return;
  await costingStore.addInvestmentItem({
    ...newInv.value,
    rubro: newInvRubro.value
  });
  newInv.value = {
    category: 'Maquinaria y Equipo',
    rubro: 'rubro_a',
    description: '',
    quantity: 1,
    unitPriceEstimated: 100.0,
    priority: 'alta',
    financedBySeedCapital: true
  };
  showAddInvestmentModal.value = false;
}

function handleUpdateInvestmentItem(updatedItem) {
  costingStore.updateInvestmentItem(updatedItem.itemId, updatedItem);
}

function handleRemoveInvestmentItem(itemId) {
  costingStore.removeInvestmentItem(itemId);
}

async function handleSaveForm() {
  const dni = authStore.currentParticipant?.dni;
  if (!dni) return;

  // Validación presupuestal estricta para Sesión 7
  if (sessionId.value === 7 && !costingStore.isBudgetCompliant) {
    return;
  }

  isSavingForm.value = true;
  saveSuccessToast.value = false;

  const result = await sessionStore.submitFormSection(dni, sessionId.value, formData.value);
  isSavingForm.value = false;

  if (result.success) {
    saveSuccessToast.value = true;
    setTimeout(() => {
      saveSuccessToast.value = false;
    }, 4000);
  }
}

function goToNextModule() {
  const nextId = sessionId.value + 1;
  if (nextId <= 8) {
    router.push(`/sesiones/${nextId}`);
  } else {
    router.push('/');
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex flex-col justify-between max-w-md mx-auto w-full border-x border-slate-200/50">
    <!-- Header Superior -->
    <header class="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-4 py-3 pt-safe">
      <div class="flex items-center justify-between">
        <button
          type="button"
          @click="router.push('/')"
          class="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors py-1.5 px-2 rounded-lg -ml-2"
        >
          <span>←</span>
          <span>Volver</span>
        </button>

        <div class="text-center">
          <span class="text-[11px] font-bold text-blue-700 uppercase tracking-widest block">
            {{ sessionMeta?.code }} &bull; Sesión {{ sessionId }}
          </span>
          <h1 class="text-sm font-black text-slate-900 truncate max-w-[190px]">
            {{ dynamicSessionTitle }}
          </h1>
        </div>

        <SyncStatusBadge />
      </div>
    </header>

    <!-- Contenido -->
    <main class="flex-1 px-4 py-4 space-y-4">
      <!-- Si la sesión está bloqueada, mostrar GatekeeperLock -->
      <GatekeeperLock
        v-if="!isUnlocked"
        :session-id="sessionId"
        :session-title="dynamicSessionTitle"
      />

      <!-- Si la sesión está desbloqueada -->
      <template v-else>
        <!-- Stepper de 3 etapas -->
        <SessionProgressBar
          :current-step="currentStep"
          :microlearning-completed="!!progress?.gatekeeping?.microlearningCompleted"
          :quiz-passed="!!progress?.quizAssessment?.passed"
          :form-completed="!!progress?.formSubmission?.isCompleted"
          @select-step="(step) => currentStep = step"
        />

        <!-- Toast no invasivo de guardado exitoso -->
        <div
          v-if="saveSuccessToast"
          class="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-xl flex items-center justify-between shadow-sm animate-fadeIn"
        >
          <div class="flex items-center gap-2">
            <span class="text-lg">💾</span>
            <span class="text-xs font-bold">¡Respuestas guardadas y módulo completado!</span>
          </div>
          <button
            type="button"
            @click="saveSuccessToast = false"
            class="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
          >
            ✕
          </button>
        </div>

        <!-- ETAPA 1: APRENDER (Microaprendizaje) -->
        <section v-if="currentStep === 1">
          <MicrolearningCard
            :microlearning="sessionMeta?.microlearning || []"
            :already-completed="!!progress?.gatekeeping?.microlearningCompleted"
            @complete="handleCompleteMicrolearning"
          />
        </section>

        <!-- ETAPA 2: QUIZ DE EVALUACIÓN V/F -->
        <section v-else-if="currentStep === 2">
          <QuizCard
            :questions="sessionMeta?.quiz || []"
            :assessment="progress?.quizAssessment"
            @attempt="handleQuizAttempt"
            @continue-to-form="handleContinueToForm"
          />
        </section>

        <!-- ETAPA 3: FORMULARIO DEL PLAN DE NEGOCIOS O ASISTENTE REACTIVO -->
        <section v-else-if="currentStep === 3" class="space-y-4">
          <!-- CASO A: SESIÓN 5 - LIENZO CANVAS DE MODELO DE NEGOCIO MÓVIL -->
          <CanvasAccordionView v-if="sessionId === 5" />

          <!-- CASO B: SESIÓN 6 - ASISTENTE DE COSTEO DIRECTO MULTIMODAL -->
          <div v-else-if="sessionId === 6" class="space-y-4">
            <div
              class="text-white rounded-2xl p-4 shadow-sm transition-all"
              :class="activeProduct?.businessNature === 'servicio'
                ? 'bg-gradient-to-r from-purple-900 to-indigo-900'
                : (activeProduct?.businessNature === 'comercio'
                  ? 'bg-gradient-to-r from-emerald-900 to-teal-900'
                  : 'bg-gradient-to-r from-amber-900 to-orange-950')"
            >
              <span
                class="text-[10px] uppercase font-bold tracking-widest block mb-0.5"
                :class="activeProduct?.businessNature === 'servicio'
                  ? 'text-purple-200'
                  : (activeProduct?.businessNature === 'comercio' ? 'text-emerald-200' : 'text-amber-200')"
              >
                {{ activeProduct?.businessNature === 'servicio'
                  ? 'Metodología "El Minutero"'
                  : (activeProduct?.businessNature === 'comercio'
                    ? 'Metodología "El Mayorista"'
                    : 'Metodología "La Casera vs. El Plato"') }}
              </span>
              <h2 class="text-base font-black">
                {{ activeProduct?.businessNature === 'servicio'
                  ? 'Costeo de Servicios y Estilismo'
                  : (activeProduct?.businessNature === 'comercio'
                    ? 'Costeo de Comercio y Reventa'
                    : 'Costeo Unitario por Tanda') }}
              </h2>
              <p class="text-xs mt-1 leading-relaxed opacity-90">
                <template v-if="activeProduct?.businessNature === 'servicio'">
                  Calcula el valor de tu tiempo dedicado a cada cliente ({{ costingStore.serviceLaborSettings?.costPerMinute ? `S/ ${costingStore.serviceLaborSettings.costPerMinute.toFixed(2)}/min` : 'según tu jornada' }}) más los descartables de uso único y la porción que rinden tus frascos o cremas.
                </template>
                <template v-else-if="activeProduct?.businessNature === 'comercio'">
                  Calcula el costo de comprar mercadería al por mayor en paquetes cerrados, prorrateando el flete del viaje y la bolsa de empaque para asegurar tu ganancia comercial.
                </template>
                <template v-else>
                  Calcula tus costos unitarios directos separando lo que compras al por mayor (La Casera) de lo que usas en tu receta (El Plato). Los sobrantes quedan inventariados como stock.
                </template>
              </p>
            </div>

            <!-- Configuración del Producto Activo (Selector de Modalidad + Formulario Específico) -->
            <ProductBatchCard />

            <!-- Métricas Financieras Clave Homogéneas -->
            <ProductSummaryMetrics v-if="activeProduct" :product="activeProduct" />

            <!-- Sección de Insumos de Receta (Solo para Producción) -->
            <div v-if="activeProduct?.businessNature === 'produccion'" class="space-y-3">
              <div class="flex items-center justify-between">
                <h3 class="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <span>🥣 Insumos de la Receta</span>
                  <span class="text-xs font-semibold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-full">
                    {{ activeProduct?.ingredients?.length || 0 }}
                  </span>
                </h3>

                <button
                  type="button"
                  @click="handleOpenAddIngredient"
                  class="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-xl border border-blue-200 transition-colors min-h-[44px]"
                >
                  <span class="text-sm">➕</span>
                  <span>Agregar Insumo</span>
                </button>
              </div>

              <!-- Lista de Insumos -->
              <div v-if="activeProduct?.ingredients?.length" class="space-y-3">
                <IngredientRow
                  v-for="(ing, idx) in activeProduct.ingredients"
                  :key="ing.ingredientId"
                  :ingredient="ing"
                  :index="idx + 1"
                  :batch-size="activeProduct.batchConfig?.batchSize || 1"
                  :batch-unit="activeProduct.batchConfig?.batchUnit || 'unidades'"
                  @edit="handleOpenEditIngredient"
                  @update="handleUpdateIngredient"
                  @remove="handleRemoveIngredient"
                />
              </div>

              <div
                v-else
                class="p-6 text-center bg-white rounded-2xl border border-dashed border-slate-300 space-y-2"
              >
                <span class="text-3xl">🥣</span>
                <p class="text-xs font-bold text-slate-700">Aún no has agregado insumos a este producto</p>
                <p class="text-[11px] text-slate-500">
                  Pulsa en "+ Agregar Insumo" para registrar tus ingredientes.
                </p>
              </div>

              <!-- Bottom Sheet Modal para Agregar / Editar Insumo -->
              <AddIngredientSheet
                :is-open="showAddIngredientSheet"
                :batch-size="activeProduct?.batchConfig?.batchSize || 1"
                :batch-unit="activeProduct?.batchConfig?.batchUnit || 'unidades'"
                :ingredient-to-edit="editingIngredient"
                @save="handleSaveIngredientSheet"
                @close="showAddIngredientSheet = false"
              />
            </div>

            <!-- Notas de Costeo -->
            <div class="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm space-y-2">
              <label class="text-xs font-bold text-slate-800 block">
                Observaciones y Proveedores Clave (Opcional)
              </label>
              <textarea
                v-model="formData.costingNotes"
                placeholder="Anotaciones sobre dónde compras más barato, acuerdos con proveedores o fechas de abastecimiento..."
                rows="2"
                class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
              ></textarea>
            </div>

            <!-- Botón de Envío Sesión 6 -->
            <div class="space-y-2 pt-2">
              <AppButton
                type="button"
                variant="primary"
                :loading="isSavingForm"
                @click="handleSaveForm"
              >
                {{ progress?.formSubmission?.isCompleted ? 'Actualizar Costeo del Negocio' : 'Guardar Costeo y Completar Sesión 6' }}
              </AppButton>

              <AppButton
                v-if="progress?.formSubmission?.isCompleted"
                type="button"
                variant="outline"
                @click="goToNextModule"
              >
                Continuar a la Sesión 7 (Capital Semilla) →
              </AppButton>
            </div>
          </div>

          <!-- CASO B: SESIÓN 7 - CALCULADORA DE INVERSIÓN Y CAPITAL SEMILLA -->
          <div v-else-if="sessionId === 7" class="space-y-4">
            <div class="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-2xl p-4 shadow-sm">
              <span class="text-[10px] uppercase font-bold tracking-widest text-emerald-200 block mb-0.5">
                Financiamiento y Equipamiento
              </span>
              <h2 class="text-base font-black">
                Plan de Inversión y Capital Semilla
              </h2>
              <p class="text-xs text-emerald-100 mt-1 leading-relaxed">
                Prioriza compras en maquinaria, herramientas e insumos productivos sin exceder el presupuesto máximo aprobado por el programa.
              </p>
            </div>

            <!-- Banner Reactivo: Actualización en Tiempo Real por el Facilitador -->
            <div
              v-if="costingStore.facilitatorUpdateNotice"
              class="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs flex items-center justify-between shadow-xs animate-fadeIn"
            >
              <div class="flex items-center gap-2.5">
                <span class="text-xl">🌱</span>
                <div>
                  <span class="font-black text-xs block text-emerald-950">
                    {{ costingStore.facilitatorUpdateNotice.message }}
                  </span>
                  <span class="text-[11px] text-emerald-700 font-medium">
                    Actualizado por: <strong>{{ costingStore.facilitatorUpdateNotice.author }}</strong>
                  </span>
                </div>
              </div>
              <button
                type="button"
                @click="costingStore.facilitatorUpdateNotice = null"
                class="text-emerald-700 hover:text-emerald-950 font-bold px-2 py-1 text-sm cursor-pointer"
                title="Descartar aviso"
              >
                ✕
              </button>
            </div>

            <!-- Barra de Presupuesto Dinámica -->
            <SeedCapitalBar
              :allocated-total="costingStore.allocatedTotal"
              :allocated-seed-capital="costingStore.allocatedSeedCapital"
              :total-business-investment="costingStore.totalBusinessInvestment"
              :seed-capital-ceiling="costingStore.seedCapitalCeiling"
              :remaining-budget="costingStore.remainingBudget"
              :is-budget-compliant="costingStore.isBudgetCompliant"
              :rubros="costingStore.rubrosBreakdown"
            />

            <!-- RUBRO A: MAQUINARIA, HERRAMIENTAS Y EQUIPOS -->
            <div class="bg-white rounded-2xl border border-slate-200/90 p-4 space-y-3 shadow-xs">
              <div class="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="w-6 h-6 rounded-full bg-purple-100 text-purple-800 font-black text-xs flex items-center justify-center shrink-0">
                      A
                    </span>
                    <h3 class="text-sm font-bold text-slate-900">
                      Maquinaria, Herramientas y Equipos
                    </h3>
                  </div>
                  <p class="text-[11px] text-slate-500 mt-0.5 ml-8">
                    Activos fijos duraderos para la elaboración o prestación del servicio
                  </p>
                </div>

                <button
                  type="button"
                  @click="openAddInvestmentModal('rubro_a')"
                  class="inline-flex items-center gap-1 text-xs font-bold text-purple-700 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-3 py-2 rounded-xl border border-purple-200 transition-colors min-h-[44px] shrink-0 cursor-pointer"
                >
                  <span>+</span>
                  <span>Agregar Equipo</span>
                </button>
              </div>

              <!-- Formulario Desplegable Nuevo Ítem (Rubro A) -->
              <div
                v-if="showAddInvestmentModal && newInvRubro === 'rubro_a'"
                class="bg-purple-50/90 border border-purple-200 rounded-2xl p-4 space-y-3 animate-fadeIn shadow-xs"
              >
                <div class="flex items-center justify-between">
                  <h4 class="text-xs font-bold text-purple-950">Nuevo Equipo o Herramienta (Rubro A)</h4>
                  <button
                    type="button"
                    @click="showAddInvestmentModal = false"
                    class="text-xs text-purple-700 hover:text-purple-900 font-bold px-1"
                  >
                    ✕ Cancelar
                  </button>
                </div>

                <div>
                  <label class="text-[11px] font-semibold text-slate-600 block mb-1">Categoría</label>
                  <select
                    v-model="newInv.category"
                    class="w-full rounded-xl border border-purple-300 bg-white px-3 py-2 text-xs text-slate-900 min-h-[44px]"
                  >
                    <option value="Maquinaria y Equipo">Maquinaria y Equipo</option>
                    <option value="Herramientas">Herramientas</option>
                  </select>
                </div>

                <div>
                  <label class="text-[11px] font-semibold text-slate-600 block mb-1">Descripción del Bien</label>
                  <input
                    v-model="newInv.description"
                    type="text"
                    placeholder="Ej. Plancha freidora a gas, Batidora industrial, Tijera profesional..."
                    class="w-full rounded-xl border border-purple-300 bg-white px-3 py-2.5 text-sm text-slate-900 min-h-[44px]"
                  />
                </div>

                <div class="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label class="font-semibold text-slate-600 block mb-1">Cantidad</label>
                    <input
                      v-model.number="newInv.quantity"
                      type="number"
                      min="1"
                      step="1"
                      class="w-full rounded-lg border border-purple-300 bg-white px-2.5 py-2 text-sm font-bold text-slate-900 min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label class="font-semibold text-slate-600 block mb-1">Precio Unit. Est. S/</label>
                    <input
                      v-model.number="newInv.unitPriceEstimated"
                      type="number"
                      min="0"
                      step="any"
                      class="w-full rounded-lg border border-purple-300 bg-white px-2.5 py-2 text-sm font-bold text-purple-900 min-h-[44px]"
                    />
                  </div>
                </div>

                <!-- Toggle o Selección de Financiamiento -->
                <div class="flex items-center justify-between p-2.5 rounded-xl border border-purple-200 bg-white min-h-[44px]">
                  <div>
                    <span class="text-xs font-bold text-slate-800 block">¿Solicitar con Capital Semilla?</span>
                    <span class="text-[10px] text-slate-500 block">Desactiva si ya lo tienes o es aporte propio</span>
                  </div>
                  <input
                    v-model="newInv.financedBySeedCapital"
                    type="checkbox"
                    class="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                  />
                </div>

                <button
                  type="button"
                  @click="handleCreateInvestmentItem"
                  class="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-3 rounded-xl shadow-sm transition-colors min-h-[44px]"
                >
                  Agregar al Presupuesto
                </button>
              </div>

              <!-- Lista de Ítems Rubro A -->
              <div v-if="costingStore.rubroAItems.length > 0" class="space-y-2.5">
                <InvestmentItemRow
                  v-for="(item, idx) in costingStore.rubroAItems"
                  :key="item.itemId"
                  :item="item"
                  :index="idx + 1"
                  @update="handleUpdateInvestmentItem"
                  @remove="handleRemoveInvestmentItem"
                />
              </div>

              <div
                v-else
                class="p-4 text-center bg-slate-50/70 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500"
              >
                No has agregado maquinaria o herramientas aún. Haz clic en <strong>+ Agregar Equipo</strong> para incluir licuadoras, hornos, tijeras, exhibidores, etc.
              </div>
            </div>

            <!-- RUBRO B: CAPITAL DE TRABAJO E INSUMOS DE ARRANQUE (AUTOMATIZADO DESDE S6) -->
            <WorkingCapitalSection
              :items="costingStore.rubroBItems"
              :is-syncing="isSyncingWorkingCapital"
              @sync="handleSyncWorkingCapital"
              @toggle-financing="(id) => costingStore.toggleItemFinancing(id)"
            />

            <!-- RUBRO C: ACONDICIONAMIENTO Y MANO DE OBRA PROPIA -->
            <div class="bg-white rounded-2xl border border-slate-200/90 p-4 space-y-3 shadow-xs">
              <div class="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="w-6 h-6 rounded-full bg-indigo-100 text-indigo-800 font-black text-xs flex items-center justify-center shrink-0">
                      C
                    </span>
                    <h3 class="text-sm font-bold text-slate-900">
                      Acondicionamiento y Mano de Obra Propia
                    </h3>
                  </div>
                  <p class="text-[11px] text-slate-500 mt-0.5 ml-8">
                    Adecuación del local/taller y valorización del tiempo de trabajo del emprendedor
                  </p>
                </div>

                <button
                  type="button"
                  @click="openAddInvestmentModal('rubro_c')"
                  class="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-xl border border-indigo-200 transition-colors min-h-[44px] shrink-0 cursor-pointer"
                >
                  <span>+</span>
                  <span>Acondicionamiento</span>
                </button>
              </div>

              <!-- Formulario Desplegable Nuevo Ítem (Rubro C) -->
              <div
                v-if="showAddInvestmentModal && newInvRubro === 'rubro_c'"
                class="bg-indigo-50/90 border border-indigo-200 rounded-2xl p-4 space-y-3 animate-fadeIn shadow-xs"
              >
                <div class="flex items-center justify-between">
                  <h4 class="text-xs font-bold text-indigo-950">Nuevo Acondicionamiento (Rubro C)</h4>
                  <button
                    type="button"
                    @click="showAddInvestmentModal = false"
                    class="text-xs text-indigo-700 hover:text-indigo-900 font-bold px-1"
                  >
                    ✕ Cancelar
                  </button>
                </div>

                <div>
                  <label class="text-[11px] font-semibold text-slate-600 block mb-1">Categoría</label>
                  <select
                    v-model="newInv.category"
                    class="w-full rounded-xl border border-indigo-300 bg-white px-3 py-2 text-xs text-slate-900 min-h-[44px]"
                  >
                    <option value="Acondicionamiento y Otros">Acondicionamiento y Otros (Pintura, Cartel, Licencia)</option>
                  </select>
                </div>

                <div>
                  <label class="text-[11px] font-semibold text-slate-600 block mb-1">Descripción del Bien</label>
                  <input
                    v-model="newInv.description"
                    type="text"
                    placeholder="Ej. Instalación de repisas, letrero publicitario, pintado de local..."
                    class="w-full rounded-xl border border-indigo-300 bg-white px-3 py-2.5 text-sm text-slate-900 min-h-[44px]"
                  />
                </div>

                <div class="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label class="font-semibold text-slate-600 block mb-1">Cantidad</label>
                    <input
                      v-model.number="newInv.quantity"
                      type="number"
                      min="1"
                      step="1"
                      class="w-full rounded-lg border border-indigo-300 bg-white px-2.5 py-2 text-sm font-bold text-slate-900 min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label class="font-semibold text-slate-600 block mb-1">Precio Unit. Est. S/</label>
                    <input
                      v-model.number="newInv.unitPriceEstimated"
                      type="number"
                      min="0"
                      step="any"
                      class="w-full rounded-lg border border-indigo-300 bg-white px-2.5 py-2 text-sm font-bold text-indigo-900 min-h-[44px]"
                    />
                  </div>
                </div>

                <!-- Toggle o Selección de Financiamiento -->
                <div class="flex items-center justify-between p-2.5 rounded-xl border border-indigo-200 bg-white min-h-[44px]">
                  <div>
                    <span class="text-xs font-bold text-slate-800 block">¿Solicitar con Capital Semilla?</span>
                    <span class="text-[10px] text-slate-500 block">Desactiva si ya lo tienes o es aporte propio</span>
                  </div>
                  <input
                    v-model="newInv.financedBySeedCapital"
                    type="checkbox"
                    class="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                  />
                </div>

                <button
                  type="button"
                  @click="handleCreateInvestmentItem"
                  class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 rounded-xl shadow-sm transition-colors min-h-[44px]"
                >
                  Agregar al Presupuesto
                </button>
              </div>

              <!-- Lista de Ítems Rubro C (incluye Mano de Obra protegida) -->
              <div v-if="costingStore.rubroCItems.length > 0" class="space-y-2.5">
                <InvestmentItemRow
                  v-for="(item, idx) in costingStore.rubroCItems"
                  :key="item.itemId"
                  :item="item"
                  :index="idx + 1"
                  @update="handleUpdateInvestmentItem"
                  @remove="handleRemoveInvestmentItem"
                />
              </div>

              <div
                v-else
                class="p-4 text-center bg-slate-50/70 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500"
              >
                No hay ítems registrados en acondicionamiento.
              </div>
            </div>

            <!-- Justificación Obligatoria del Presupuesto -->
            <div class="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm space-y-2">
              <label class="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Justificación del Presupuesto Solicitado</span>
                <span class="text-red-500 font-normal text-xs">* Obligatorio</span>
              </label>
              <textarea
                v-model="formData.investmentRationale"
                placeholder="Explica cómo los equipos e insumos solicitados impulsarán el crecimiento de tus ventas y productividad..."
                rows="3"
                class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
              ></textarea>
            </div>

            <!-- Advertencia si sobrepasa presupuesto -->
            <div
              v-if="!costingStore.isBudgetCompliant"
              class="p-3 bg-rose-100 border border-rose-300 rounded-xl text-rose-900 text-xs font-bold flex items-center gap-2"
            >
              <span>⛔</span>
              <span>Debes ajustar los montos para que no superen el presupuesto asignado de {{ formatMoney(costingStore.seedCapitalCeiling) }}.</span>
            </div>

            <!-- Botón de Envío Sesión 7 -->
            <div class="space-y-2 pt-2">
              <AppButton
                type="button"
                variant="primary"
                :disabled="!costingStore.isBudgetCompliant"
                :loading="isSavingForm"
                @click="handleSaveForm"
              >
                {{ progress?.formSubmission?.isCompleted ? 'Actualizar Presupuesto de Inversión' : 'Guardar Presupuesto y Completar Sesión 7' }}
              </AppButton>

              <AppButton
                v-if="progress?.formSubmission?.isCompleted"
                type="button"
                variant="outline"
                @click="goToNextModule"
              >
                Continuar a la Sesión 8 (Consolidación y Cierre) →
              </AppButton>
            </div>
          </div>

          <!-- CASO D: OTRAS SESIONES (1, 2, 3, 4, 8) - FORMULARIO GUIADO ESTÁNDAR -->
          <form
            v-else
            @submit.prevent="handleSaveForm"
            class="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-4"
          >
            <div class="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-900 leading-relaxed mb-2">
              <strong class="font-bold block mb-1">Insumos para tu Plan de Negocios:</strong>
              Escribe tus respuestas con tus propias palabras cotidianas. La plataforma guardará tu borrador original y lo asistirá formalmente.
            </div>

            <div
              v-for="field in sessionMeta?.formFields"
              :key="field.id"
              class="space-y-1.5 text-left"
            >
              <!-- CASO CUALITATIVO (Sesiones 2, 3 y 4 con textarea): DualTextField con Asistente IA -->
              <DualTextField
                v-if="[2, 3, 4].includes(sessionId) && field.type === 'textarea'"
                v-model="formData[field.id]"
                :field-key="field.id"
                :label="field.label"
                :helper-text="field.placeholder"
                :required="field.required"
                :session-id="sessionId"
                :business-name="authStore.currentParticipant?.businessBasicInfo?.commercialName || ''"
                :sector="authStore.currentParticipant?.businessBasicInfo?.sector || ''"
                @update:dual-data="(dual) => handleDualFieldUpdate(field.id, dual)"
              />

              <!-- CASO REGULAR: Selects, Textareas de otras sesiones, Inputs estándar -->
              <template v-else>
                <label :for="field.id" class="text-xs sm:text-sm font-bold text-slate-800 flex items-center justify-between">
                  <span>{{ field.label }}</span>
                  <span v-if="field.required" class="text-red-500 font-normal text-xs">* Obligatorio</span>
                </label>

                <!-- CASO NATURALEZA DEL NEGOCIO (SESIÓN 1) -->
                <div v-if="field.id === 'businessNature' || field.type === 'business_nature'" class="space-y-2">
                  <div class="grid grid-cols-1 gap-2.5">
                    <!-- Opción 1: Producción -->
                    <button
                      type="button"
                      @click="handleSelectBusinessNature('produccion')"
                      :class="[
                        'p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 min-h-[56px]',
                        formData.businessNature === 'produccion'
                          ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-500/20 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      ]"
                    >
                      <span class="text-2xl mt-0.5">🍲</span>
                      <div class="flex-1">
                        <div class="flex items-center justify-between">
                          <span class="text-sm font-black text-slate-900">Producción / Gastronomía</span>
                          <span
                            class="w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold"
                            :class="formData.businessNature === 'produccion' ? 'border-amber-600 bg-amber-600 text-white' : 'border-slate-300'"
                          >
                            <span v-if="formData.businessNature === 'produccion'">✓</span>
                          </span>
                        </div>
                        <p class="text-xs text-slate-600 mt-0.5 leading-relaxed">
                          Preparas recetas, transformas materias primas o fabricas en lotes/tandas (ej. comida rápida, repostería, confección).
                        </p>
                      </div>
                    </button>

                    <!-- Opción 2: Servicios -->
                    <button
                      type="button"
                      @click="handleSelectBusinessNature('servicio')"
                      :class="[
                        'p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 min-h-[56px]',
                        formData.businessNature === 'servicio'
                          ? 'border-purple-500 bg-purple-50/80 ring-2 ring-purple-500/20 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      ]"
                    >
                      <span class="text-2xl mt-0.5">✂️</span>
                      <div class="flex-1">
                        <div class="flex items-center justify-between">
                          <span class="text-sm font-black text-slate-900">Servicios / Estilismo</span>
                          <span
                            class="w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold"
                            :class="formData.businessNature === 'servicio' ? 'border-purple-600 bg-purple-600 text-white' : 'border-slate-300'"
                          >
                            <span v-if="formData.businessNature === 'servicio'">✓</span>
                          </span>
                        </div>
                        <p class="text-xs text-slate-600 mt-0.5 leading-relaxed">
                          Atiendes clientes por tiempo y utilizas insumos de frasco o descartables (ej. corte de cabello, manicure, reparaciones).
                        </p>
                      </div>
                    </button>

                    <!-- Opción 3: Comercio -->
                    <button
                      type="button"
                      @click="handleSelectBusinessNature('comercio')"
                      :class="[
                        'p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 min-h-[56px]',
                        formData.businessNature === 'comercio'
                          ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      ]"
                    >
                      <span class="text-2xl mt-0.5">🏷️</span>
                      <div class="flex-1">
                        <div class="flex items-center justify-between">
                          <span class="text-sm font-black text-slate-900">Comercio / Reventa</span>
                          <span
                            class="w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold"
                            :class="formData.businessNature === 'comercio' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'"
                          >
                            <span v-if="formData.businessNature === 'comercio'">✓</span>
                          </span>
                        </div>
                        <p class="text-xs text-slate-600 mt-0.5 leading-relaxed">
                          Compras mercadería por mayor (cajas, fardos, docenas) y la revendes por unidad con flete y empaque (ej. bodega, ropa, calzado).
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                <!-- Select -->
                <div v-else-if="field.type === 'select'" class="relative">
                  <select
                    :id="field.id"
                    v-model="formData[field.id]"
                    class="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-base text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[48px]"
                  >
                    <option value="" disabled>Selecciona una opción...</option>
                    <option v-for="opt in field.options" :key="opt" :value="opt">
                      {{ opt }}
                    </option>
                  </select>
                </div>

                <!-- Textarea -->
                <div v-else-if="field.type === 'textarea'" class="relative">
                  <textarea
                    :id="field.id"
                    v-model="formData[field.id]"
                    :placeholder="field.placeholder"
                    rows="3"
                    class="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  ></textarea>
                </div>

                <!-- Standard text input -->
                <div v-else>
                  <AppInput
                    :id="field.id"
                    v-model="formData[field.id]"
                    :placeholder="field.placeholder"
                  />
                </div>
              </template>
            </div>

            <div class="pt-3 space-y-2">
              <AppButton
                type="submit"
                variant="primary"
                :loading="isSavingForm"
              >
                {{ progress?.formSubmission?.isCompleted ? 'Actualizar Respuestas del Módulo' : 'Guardar y Completar Sesión' }}
              </AppButton>

              <!-- Botón para avanzar a la siguiente sesión si ya está completada -->
              <AppButton
                v-if="progress?.formSubmission?.isCompleted && sessionId < 8"
                type="button"
                variant="outline"
                @click="goToNextModule"
              >
                Continuar a la Sesión {{ sessionId + 1 }} →
              </AppButton>
            </div>
          </form>
        </section>
      </template>
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-slate-200 px-4 py-3 text-center text-xs text-slate-500 pb-safe">
      <p>EmprendeApp &bull; Sesión {{ sessionId }} de 8</p>
    </footer>
  </div>
</template>
