<template>
  <div class="dossier-page">
    <ConsultingTopbar
      :is-dirty="isDirty"
      :is-saving="isSaving"
      @back="goBack"
      @save="saveDraft"
    />

    <div class="cover">
      <div class="cover-inner">
        <ConsultingCover :model-value="general" />
      </div>
    </div>

    <MatrizIndicadoresWala
      :model-value="scores"
      :periods="periods"
      :areas="areas"
    />
    <MatrizIndicadoresWalaUserView
      :model-value="scores"
      :periods="periods"
      :areas="areas"
    />
    <AreasCriticas :model-value="criticalAreas" :areas="areas" />
    <ConsultingCycle
      :model-value="cycles"
      :areas="areas"
      :critical-areas="criticalAreas"
    />

    <section class="max-w-7xl mx-auto px-4 sm:px-6 py-2">
      <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
        <h3 class="text-sm font-semibold text-gray-900 mb-3">
          Estado de ciclos
        </h3>

        <div class="grid gap-2 md:grid-cols-3">
          <article
            v-for="cycle in cycles"
            :key="`cycle-control-${cycle.key}`"
            class="rounded-lg border border-gray-200 bg-gray-50 p-3"
          >
            <div class="flex items-center justify-between gap-2 mb-2">
              <p class="text-xs font-semibold text-gray-800">
                {{ cycle.title }}
              </p>
              <span
                class="inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold"
                :class="
                  cycle.completedByFacilitator
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                "
              >
                {{ cycle.completedByFacilitator ? "Completado" : "Activo" }}
              </span>
            </div>

            <p class="text-[11px] text-gray-500 mb-2">
              {{ getCycleActionSummary(cycle) }}
            </p>

            <button
              type="button"
              class="w-full rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200"
              :class="
                cycle.completedByFacilitator
                  ? 'bg-amber-600 text-white hover:bg-amber-700'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              "
              :disabled="
                Boolean(cycleActionLoadingByKey[cycle.key]) || isSaving
              "
              @click="handleCycleCompletionToggle(cycle)"
            >
              <span v-if="cycleActionLoadingByKey[cycle.key]">Procesando...</span>
              <span v-else>
                {{
                  cycle.completedByFacilitator
                    ? "Reabrir ciclo"
                    : "Marcar ciclo completado"
                }}
              </span>
            </button>
          </article>
        </div>
      </div>
    </section>

    <ConsultingResumen
      :areas="areas"
      :periods="periods"
      :final-by-area="finalByArea"
      :closing="closing"
    />
  </div>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAdminBusinessConsultingStoreV2 } from "@/stores/adminBusinessConsultingStoreV2";
import { useToast } from "@/composables/useToast";
import ConsultingTopbar from "@/components/programs/consulting/ConsultingTopbar.vue";
import ConsultingCover from "@/components/programs/consulting/ConsultingCover.vue";
import MatrizIndicadoresWala from "@/components/programs/consulting/MatrizIndicadoresWala.vue";
import MatrizIndicadoresWalaUserView from "@/components/programs/consulting/MatrizIndicadoresWalaUserView.vue";
import AreasCriticas from "@/components/programs/consulting/AreasCriticas.vue";
import ConsultingCycle from "@/components/programs/consulting/ConsultingCycle.vue";
import ConsultingResumen from "@/components/programs/consulting/ConsultingResumen.vue";

const route = useRoute();
const router = useRouter();
const toast = useToast();
const isSaving = ref(false);
const baselineSnapshot = ref("");
const cycleActionLoadingByKey = ref({
  c1: false,
  c2: false,
  c3: false,
});

// ─── Route param ─────────────────────────────────────────────────────────────
// La ruta es /admin/users/:businessId/consulting → route.params.businessId
const businessId = computed(() => route.params.businessId);

// ─── Store ────────────────────────────────────────────────────────────────────
const dossierStore = useAdminBusinessConsultingStoreV2();

// ─── Períodos y Áreas ─────────────────────────────────────────────────────────

const periods = [
  { key: "pre", label: "Pre (diagnóstico)" },
  { key: "postC1", label: "Post C1" },
  { key: "postC2", label: "Post C2" },
  { key: "postC3", label: "Post C3" },
];

const areas = [
  {
    key: "negocioFamilia",
    title: "1. Negocios y familia",
    subtitle: "separación financiera y personal",
    indicators: [
      { code: "1.1", text: "Se paga un salario" },
      { code: "1.2", text: "Paga salario a familiares trabajadores" },
      { code: "1.3", text: "No retira dinero de la empresa sin control" },
    ],
  },
  {
    key: "marketing",
    title: "2. Marketing",
    subtitle: "cliente, promoción y precio estratégico",
    indicators: [
      {
        code: "2.1",
        text: "Conoce a sus clientes, necesidades y oportunidades de mercado",
      },
      { code: "2.2", text: "Promueve el negocio y sus productos" },
      {
        code: "2.3",
        text: "Comercializa productos de forma competitiva (costeo y margen)",
      },
    ],
  },
  {
    key: "compras",
    title: "3. Compras",
    subtitle: "proveedores, volumen y registro",
    indicators: [
      {
        code: "3.1",
        text: "Recolecta cotizaciones de varios proveedores",
      },
      {
        code: "3.2",
        text: "Verifica bienes en la entrega y maneja devoluciones correctamente",
      },
      {
        code: "3.3",
        text: "Planifica el volumen de compras según necesidades del negocio",
      },
    ],
  },
  {
    key: "controlStock",
    title: "4. Control de stock",
    subtitle: "inventario actualizado y renovación",
    indicators: [
      { code: "4.1", text: "Mantiene registros de stock actualizados" },
      { code: "4.2", text: "Hace renovación regular de stock" },
      {
        code: "4.3",
        text: "Evita sobre/sub-stock y no conserva productos defectuosos",
      },
    ],
  },
  {
    key: "costeo",
    title: "5. Costeo",
    subtitle: "materiales, mano de obra y costos indirectos",
    indicators: [
      { code: "5.1", text: "Calcula costos de materiales directos" },
      { code: "5.2", text: "Calcula costos de mano de obra directa" },
      { code: "5.3", text: "Calcula costos indirectos" },
    ],
  },
  {
    key: "registros",
    title: "6. Mantenimiento de registros",
    subtitle: "libros, clientes y ganancias",
    indicators: [
      { code: "6.1", text: "Mantiene libros de registro actualizados" },
      { code: "6.2", text: "Mantiene registro de cuentas de clientes" },
      { code: "6.3", text: "Calcula ganancias y pérdidas regularmente" },
    ],
  },
  {
    key: "planificacion",
    title: "7. Planificación",
    subtitle: "proyecciones, flujo de caja y seguimiento del plan",
    indicators: [
      { code: "7.1", text: "Proyecta ventas y costos" },
      { code: "7.2", text: "Planifica el flujo de caja" },
      { code: "7.3", text: "Sigue y ajusta el plan de negocio regularmente" },
    ],
  },
];

// ─── Modelos reactivos ────────────────────────────────────────────────────────

const general = reactive({
  businessName: "",
  sector: "",
  entrepreneurName: "",
  contact: "",
  facilitatorName: "",
  programName: "",
  startDate: "",
});

const scores = reactive({});
areas.forEach((area) => {
  area.indicators.forEach((ind) => {
    scores[ind.code] = {
      pre: null,
      postC1: null,
      postC2: null,
      postC3: null,
    };
  });
});

const criticalAreas = ref([
  {
    areaKey: "negocioFamilia",
    score: "",
    weakIndicator: "",
    resumenArea: "",
    justification: "",
  },
  {
    areaKey: "marketing",
    score: "",
    weakIndicator: "",
    resumenArea: "",
    justification: "",
  },
  {
    areaKey: "compras",
    score: "",
    weakIndicator: "",
    resumenArea: "",
    justification: "",
  },
]);

function createCycle(key, title, subtitle, className, planSessionName, followSessionName) {
  return reactive({
    key,
    title,
    subtitle,
    className,
    planSessionName,
    followSessionName,
    planDate: "",
    followDate: "",
    educationSummary: "",
    agreements: "",
    planAreas: [
      { areaName: "", action1: "", action2: "", action3: "" },
      { areaName: "", action1: "", action2: "", action3: "" },
      { areaName: "", action1: "", action2: "", action3: "" },
    ],
    reviewRows: Array.from({ length: 9 }, () => ({
      area: "",
      action: "",
      frecuencia: "",
      status: "",
      observation: "",
    })),
    conclusions: "",
    nextCommitments: "",
    completedByFacilitator: false,
    completedAt: null,
    completedBy: null,
  });
}

const cycles = ref([
  createCycle("c1", "Ciclo 1", "Sesión educativa + plan de acción + seguimiento", "c1", "Sesión 1A", "Sesión 1B"),
  createCycle("c2", "Ciclo 2", "Nuevo plan de acción + seguimiento", "c2", "Sesión 3", "Sesión 4"),
  createCycle("c3", "Ciclo 3", "Plan final + seguimiento + cierre del programa", "c3", "Sesión 5", "Sesión 6"),
]);

const finalByArea = reactive({
  pre: {},
  postC1: {},
  postC2: {},
  postC3: {},
});
areas.forEach((area) => {
  finalByArea.pre[area.key] = "";
  finalByArea.postC1[area.key] = "";
  finalByArea.postC2[area.key] = "";
  finalByArea.postC3[area.key] = "";
});

const closing = reactive({
  achievements: "",
  pending: "",
  recommendation: "",
  testimony: "",
});

// ─── Dirty tracking ───────────────────────────────────────────────────────────

function clone(data) {
  return JSON.parse(JSON.stringify(data));
}

function toSerializableDraft() {
  return {
    general: clone(general),
    diagnosticScores: clone(scores),
    criticalAreas: clone(criticalAreas.value),
    consultingCycles: clone(cycles.value),
    finalEvaluationByArea: clone(finalByArea),
    closingSummary: clone(closing),
  };
}

function resetBaseline() {
  baselineSnapshot.value = JSON.stringify(toSerializableDraft());
}

const isDirty = computed(() => {
  return JSON.stringify(toSerializableDraft()) !== baselineSnapshot.value;
});

// ─── Hidratación ─────────────────────────────────────────────────────────────

function hydrateDraft(dossier) {
  // Datos del header del dossier (nivel raíz del documento Firestore)
  general.businessName = dossier?.businessName || "";
  general.sector = dossier?.sector || "";
  general.entrepreneurName = dossier?.participantName || "";
  general.contact = dossier?.contact || "";
  general.facilitatorName = dossier?.facilitatorName || "";
  general.programName = dossier?.programName || "";
  general.startDate = dossier?.startDate || "";

  // Datos de la consultoría (stageData.programConsultingDossier)
  const draft = dossier?.stageData?.programConsultingDossier;

  if (draft?.diagnosticScores) {
    Object.keys(scores).forEach((indicatorCode) => {
      const source = draft.diagnosticScores[indicatorCode];
      if (!source) return;
      periods.forEach((period) => {
        scores[indicatorCode][period.key] = source[period.key] ?? null;
      });
    });
  }

  if (Array.isArray(draft?.criticalAreas) && draft.criticalAreas.length) {
    criticalAreas.value = clone(draft.criticalAreas);
  }

  if (Array.isArray(draft?.consultingCycles) && draft.consultingCycles.length) {
    cycles.value = clone(draft.consultingCycles);
  }

  if (draft?.finalEvaluationByArea) {
    periods.forEach((period) => {
      areas.forEach((area) => {
        finalByArea[period.key][area.key] =
          draft.finalEvaluationByArea?.[period.key]?.[area.key] ?? "";
      });
    });
  }

  if (draft?.closingSummary) {
    closing.achievements = draft.closingSummary.achievements || "";
    closing.pending = draft.closingSummary.pending || "";
    closing.recommendation = draft.closingSummary.recommendation || "";
    closing.testimony = draft.closingSummary.testimony || "";
  }
}

// ─── Navegación ───────────────────────────────────────────────────────────────

function goBack() {
  router.push("/admin/users");
}

// ─── Helpers de ciclos ────────────────────────────────────────────────────────

function countMissingStatuses(cycle) {
  if (!Array.isArray(cycle?.reviewRows)) return 0;
  return cycle.reviewRows.filter((row) => {
    const hasAction = typeof row?.action === "string" && row.action.trim().length > 0;
    if (!hasAction) return false;
    return !(typeof row?.status === "string" && row.status.trim().length > 0);
  }).length;
}

function countActions(cycle) {
  if (!Array.isArray(cycle?.reviewRows)) return 0;
  return cycle.reviewRows.filter((row) => {
    return typeof row?.action === "string" && row.action.trim().length > 0;
  }).length;
}

function getCycleActionSummary(cycle) {
  const totalActions = countActions(cycle);
  const missingStatuses = countMissingStatuses(cycle);
  if (totalActions === 0) return "Sin acciones cargadas";
  if (!missingStatuses) return `${totalActions} acciones con estado`;
  return `${totalActions} acciones, ${missingStatuses} sin estado`;
}

function getCycleCascadeMessage(cycleKey) {
  if (cycleKey === "c1") return "Reabrir C1 también desmarcará C2 y C3. ¿Deseas continuar?";
  if (cycleKey === "c2") return "Reabrir C2 también desmarcará C3. ¿Deseas continuar?";
  return "¿Deseas reabrir este ciclo?";
}

// ─── Acciones de ciclo ────────────────────────────────────────────────────────

async function refreshAfterCycleAction() {
  const dossier = await dossierStore.loadDossier(businessId.value);
  hydrateDraft(dossier);
  resetBaseline();
}

async function handleCycleCompletionToggle(cycle) {
  if (!cycle?.key) return;

  if (isDirty.value) {
    await saveDraft();
    if (isDirty.value) {
      toast.error("Guarda el borrador antes de cambiar el estado del ciclo");
      return;
    }
  }

  const cycleKey = cycle.key;
  cycleActionLoadingByKey.value[cycleKey] = true;

  try {
    if (cycle.completedByFacilitator) {
      const shouldContinue = window.confirm(getCycleCascadeMessage(cycleKey));
      if (!shouldContinue) return;

      const result = await dossierStore.reopenCycleWithCascade(businessId.value, cycleKey);
      await refreshAfterCycleAction();
      const impacted = (result?.reopenedCycleKeys || []).join(", ").toUpperCase();
      toast.success(`Ciclo reabierto correctamente${impacted ? ` (${impacted})` : ""}`);
      return;
    }

    const result = await dossierStore.markCycleCompleted(businessId.value, cycleKey);
    await refreshAfterCycleAction();

    if (result?.missingStatuses > 0) {
      toast.info(`Ciclo completado con advertencia: ${result.missingStatuses} acciones sin estado.`);
    } else {
      toast.success("Ciclo marcado como completado");
    }
  } catch (error) {
    console.error("No se pudo actualizar el estado del ciclo:", error);
    toast.error("No se pudo actualizar el estado del ciclo");
  } finally {
    cycleActionLoadingByKey.value[cycleKey] = false;
  }
}

// ─── Guardar borrador ─────────────────────────────────────────────────────────

async function saveDraft() {
  if (!isDirty.value || isSaving.value) return;

  isSaving.value = true;

  try {
    const payload = toSerializableDraft();
    await dossierStore.saveProgramConsultingDossier(businessId.value, payload);
    resetBaseline();
    toast.success("Borrador guardado correctamente");
  } catch (error) {
    console.error("No se pudo guardar el borrador del expediente:", error);
    toast.error("No se pudo guardar el borrador. Intenta nuevamente.");
  } finally {
    isSaving.value = false;
  }
}

// ─── Carga inicial ────────────────────────────────────────────────────────────

async function hydrateHeaderData() {
  try {
    const dossier = await dossierStore.loadDossier(businessId.value);
    hydrateDraft(dossier);
    resetBaseline();
  } catch (error) {
    console.error("No se pudo hidratar el expediente:", error);
    toast.error("No se pudieron cargar los datos del expediente");
  }
}

hydrateHeaderData();
</script>

<style>
.dossier-page {
  @apply min-h-screen bg-gray-50 text-gray-900 text-[13px] leading-relaxed pb-10;
}
</style>
