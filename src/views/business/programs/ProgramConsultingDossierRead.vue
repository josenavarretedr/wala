<template>
  <div class="dossier-page">
    <div class="topbar">
      <button class="back-btn" @click="goBack">Volver</button>
      <div class="text-right">
        <p class="text-xs text-gray-500 uppercase tracking-wide">Expediente</p>
        <p class="text-sm font-semibold text-gray-900">Solo lectura</p>
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-16">
      <SpinnerIcon size="xl" class="text-purple-600" />
    </div>

    <template v-else>
      <div class="cover read-only-scope">
        <div class="cover-inner">
          <ConsultingCover :model-value="general" :read-only="true" />
          <ConsultingCycles :steps="timelineSteps" />
        </div>
      </div>

      <div class="read-only-scope">
        <!-- <MatrizIndicadoresWala
          :model-value="scores"
          :periods="periods"
          :areas="areas"
        /> -->
        <AreasCriticas
          :model-value="criticalAreas"
          :areas="areas"
          :read-only="true"
        />
        <ConsultingCycle :model-value="cycles" :read-only="true" />
        <!-- <ConsultingResumen
          :areas="areas"
          :periods="periods"
          :final-by-area="finalByArea"
          :closing="closing"
        /> -->
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, reactive, ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useConsultingDossierStore } from "@/stores/consultingDossierStore";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/composables/useToast";
import ConsultingCover from "@/components/programs/consulting/ConsultingCover.vue";
import ConsultingCycles from "@/components/programs/consulting/ConsultingCycles.vue";
import MatrizIndicadoresWala from "@/components/programs/consulting/MatrizIndicadoresWala.vue";
import AreasCriticas from "@/components/programs/consulting/AreasCriticas.vue";
import ConsultingCycle from "@/components/programs/consulting/ConsultingCycle.vue";
import ConsultingResumen from "@/components/programs/consulting/ConsultingResumen.vue";
import SpinnerIcon from "@/components/ui/SpinnerIcon.vue";

const route = useRoute();
const router = useRouter();
const dossierStore = useConsultingDossierStore();
const authStore = useAuthStore();
const { error: showError } = useToast();

const loading = ref(false);

const periods = [
  { key: "pre", label: "Pre (diagnostico)" },
  { key: "postC1", label: "Post C1" },
  { key: "postC2", label: "Post C2" },
  { key: "postC3", label: "Post C3" },
];

const areas = [
  {
    key: "negocioFamilia",
    title: "1. Negocios y familia",
    subtitle: "separacion financiera y personal",
    indicators: [
      { code: "1.1", text: "Se paga un salario" },
      { code: "1.2", text: "Paga salario a familiares trabajadores" },
      { code: "1.3", text: "No retira dinero de la empresa sin control" },
    ],
  },
  {
    key: "marketing",
    title: "2. Marketing",
    subtitle: "cliente, promocion y precio estrategico",
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
        text: "Planifica el volumen de compras segun necesidades del negocio",
      },
    ],
  },
  {
    key: "controlStock",
    title: "4. Control de stock",
    subtitle: "inventario actualizado y renovacion",
    indicators: [
      { code: "4.1", text: "Mantiene registros de stock actualizados" },
      { code: "4.2", text: "Hace renovacion regular de stock" },
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
      { code: "6.3", text: "Calcula ganancias y perdidas regularmente" },
    ],
  },
  {
    key: "planificacion",
    title: "7. Planificacion",
    subtitle: "proyecciones, flujo de caja y seguimiento del plan",
    indicators: [
      { code: "7.1", text: "Proyecta ventas y costos" },
      { code: "7.2", text: "Planifica el flujo de caja" },
      { code: "7.3", text: "Sigue y ajusta el plan de negocio regularmente" },
    ],
  },
];

const timelineSteps = [
  { id: "s0", short: "S0", label: "Diagnostico<br>inicial", dotClass: "s0" },
  {
    id: "c1",
    short: "C1",
    label: "Ciclo 1<br>Educativa + Plan",
    dotClass: "s1",
  },
  { id: "s1", short: "S", label: "Seguimiento<br>ciclo 1", dotClass: "s1" },
  { id: "c2", short: "C2", label: "Ciclo 2<br>Nuevo plan", dotClass: "s2" },
  { id: "s2", short: "S", label: "Seguimiento<br>ciclo 2", dotClass: "s2" },
  { id: "c3", short: "C3", label: "Ciclo 3<br>Nuevo plan", dotClass: "s3" },
  { id: "s3", short: "S", label: "Seguimiento<br>ciclo 3", dotClass: "s3" },
  { id: "fin", short: "FIN", label: "Evaluacion<br>final", dotClass: "" },
];

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
    justification: "",
  },
  { areaKey: "marketing", score: "", weakIndicator: "", justification: "" },
  { areaKey: "compras", score: "", weakIndicator: "", justification: "" },
]);

function createCycle(
  key,
  title,
  subtitle,
  className,
  planSessionName,
  followSessionName,
) {
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
    reviewRows: [
      { action: "", status: "", observation: "" },
      { action: "", status: "", observation: "" },
      { action: "", status: "", observation: "" },
      { action: "", status: "", observation: "" },
    ],
    conclusions: "",
    nextCommitments: "",
  });
}

const cycles = ref([
  createCycle(
    "c1",
    "Ciclo 1",
    "Sesion educativa + plan de accion + seguimiento",
    "c1",
    "Sesion 1A",
    "Sesion 1B",
  ),
  createCycle(
    "c2",
    "Ciclo 2",
    "Nuevo plan de accion + seguimiento",
    "c2",
    "Sesion 3",
    "Sesion 4",
  ),
  createCycle(
    "c3",
    "Ciclo 3",
    "Plan final + seguimiento + cierre del programa",
    "c3",
    "Sesion 5",
    "Sesion 6",
  ),
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

const businessId = computed(() => route.params.businessId);
const programId = computed(() => route.params.programId);
const dossierId = computed(() => route.params.dossierId);
const currentUserId = computed(() => authStore.user?.uid);

function clone(data) {
  return JSON.parse(JSON.stringify(data));
}

function hydrateDraft(dossier) {
  const draft = dossier?.stageData?.programConsultingDossier;

  general.businessName = dossier?.businessName || "";
  general.sector = dossier?.sector || "";
  general.entrepreneurName = dossier?.participantName || "";
  general.contact = dossier?.contact || "";
  general.facilitatorName = dossier?.facilitatorName || "";
  general.programName = dossier?.programName || "";
  general.startDate = dossier?.startDate || "";

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

async function hydrateReadOnlyData() {
  loading.value = true;

  try {
    const dossier = await dossierStore.loadDossier(
      programId.value,
      dossierId.value,
    );

    const validParticipant = dossier?.participantId === currentUserId.value;
    const validBusiness = dossier?.businessId === businessId.value;

    if (!validParticipant || !validBusiness) {
      showError("No tienes permiso para ver este expediente");
      router.replace(
        `/business/${businessId.value}/programs/${programId.value}`,
      );
      return;
    }

    hydrateDraft(dossier);
  } catch (error) {
    console.error("No se pudo cargar el expediente en modo lectura:", error);
    showError("No se pudo cargar el expediente");
    router.replace(`/business/${businessId.value}/programs/${programId.value}`);
  } finally {
    loading.value = false;
  }
}

function goBack() {
  router.push(`/business/${businessId.value}/programs/${programId.value}`);
}

onMounted(() => {
  hydrateReadOnlyData();
});
</script>

<style>
.dossier-page {
  @apply min-h-screen bg-gray-50 text-gray-900 text-[13px] leading-relaxed pb-10;
}

.topbar {
  @apply sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-3;
}

.back-btn {
  @apply border border-gray-200 bg-white rounded-xl px-4 py-2 text-[13px] font-semibold transition-all duration-200;
}

.back-btn:hover {
  @apply bg-gray-50 border-gray-300;
}

.cover {
  @apply px-4 sm:px-6 pt-5 pb-2;
}

.cover-inner {
  @apply max-w-7xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-sm p-5 sm:p-8;
}

.cover-top {
  @apply flex justify-between items-start gap-4 mb-5;
}

.brand {
  @apply text-blue-600 tracking-[0.2em] uppercase font-bold text-sm;
}

.doc-type {
  @apply text-gray-500 text-[10px] uppercase text-right leading-relaxed;
}

.cover-title {
  @apply text-3xl sm:text-4xl text-gray-900 leading-tight font-bold;
}

.cover-sub {
  @apply text-gray-600 mt-2 mb-6;
}

.datos-grid {
  @apply grid grid-cols-1 md:grid-cols-3 gap-3 mb-6;
}

.dato-cell {
  @apply bg-gray-50 border border-gray-200 rounded-xl p-3;
}

.dato-cell.wide {
  @apply md:col-span-2;
}

.dato-label {
  @apply text-[10px] text-gray-500 uppercase mb-1.5 font-semibold tracking-wide;
}

.dato-input {
  @apply w-full bg-white border border-gray-200 rounded-lg text-gray-900 px-3 py-2;
}

.dato-input:focus {
  @apply outline-none border-blue-500 ring-2 ring-blue-100;
}

.ciclos-timeline {
  @apply flex items-center gap-2 overflow-x-auto pb-1;
}

.tl-step {
  @apply flex-1 text-center relative min-w-[88px];
}

.tl-step::after {
  content: "";
  @apply absolute;
  top: 14px;
  left: 50%;
  width: calc(100% + 8px);
  height: 1px;
  @apply bg-gray-200;
}

.tl-step:last-child::after {
  display: none;
}

.tl-dot {
  @apply w-7 h-7 rounded-full border-2 border-gray-300 inline-flex items-center justify-center text-gray-500 bg-white;
  z-index: 1;
  @apply relative;
  font-size: 10px;
}

.tl-dot.s0 {
  @apply border-amber-500 text-amber-600;
}

.tl-dot.s1 {
  @apply border-orange-500 text-orange-600;
}

.tl-dot.s2 {
  @apply border-blue-500 text-blue-600;
}

.tl-dot.s3 {
  @apply border-emerald-500 text-emerald-600;
}

.tl-label {
  @apply text-[10px] text-gray-500 mt-1.5 leading-tight;
}

.section,
.ciclo-section,
.evolucion-section {
  @apply max-w-7xl mx-auto px-4 sm:px-6 py-5;
}

.section {
  border-bottom: none;
}

.section-header {
  @apply flex gap-3 mb-4 items-start;
}

.section-num {
  @apply w-7 h-7 rounded-lg bg-gray-900 text-white flex items-center justify-center text-[11px] font-bold;
}

.section-title {
  @apply text-lg font-semibold text-gray-900;
}

.section-desc {
  @apply text-gray-600 text-xs;
}

.matriz-wrap,
.critica-card,
.ciclo-body,
.cierre-block,
.evol-col {
  @apply bg-white border border-gray-200 rounded-xl shadow-sm;
}

.matriz-table,
.revision-table {
  @apply w-full;
  border-collapse: collapse;
}

.matriz-table th {
  @apply bg-gray-900 text-white text-[10px] px-3 py-2.5 uppercase tracking-wide;
}

.area-header-row td {
  @apply bg-gray-50 text-xs font-semibold px-3 py-2;
}

.area-header-row span {
  @apply text-[9px] text-gray-400 ml-2 uppercase;
}

.indicator-row td {
  @apply border-b border-gray-200 px-3 py-2 text-xs;
}

.ind-code {
  @apply text-gray-400 mr-2 text-[10px];
}

.score-cell {
  @apply text-center;
}

.score-select {
  @apply w-14 border border-gray-200 rounded-lg bg-white text-center py-1;
}

.total-row td {
  @apply bg-gray-900 text-white px-3 py-2.5 uppercase;
}

.total-score {
  @apply text-center text-amber-300 font-semibold;
}

.criticas-grid {
  @apply grid grid-cols-1 lg:grid-cols-3 gap-4;
}

.critica-card-top {
  @apply p-3.5 border-b border-gray-200 bg-gray-50 rounded-t-xl;
}

.critica-num,
.plan-title,
.field-block label,
.cierre-block label,
.evol-col-head,
.scale-label {
  @apply text-[10px] text-gray-500 uppercase tracking-wide font-semibold;
}

.critica-area-select,
.sesion-date-input,
.status-select,
.evol-score-input {
  @apply w-full border border-gray-200 rounded-lg bg-white px-2.5 py-2;
}

.critica-puntaje {
  @apply flex items-center gap-2 mt-2;
}

.critica-puntaje input {
  @apply w-16 border border-gray-200 rounded-lg bg-white px-2 py-1.5;
}

.critica-card-body,
.plan-wrap,
.revision-wrap,
.sesion-content,
.cierre-block {
  @apply p-3.5;
}

.critica-field textarea,
.field-block textarea,
.cierre-block textarea {
  @apply w-full border border-gray-200 rounded-lg bg-white p-2.5;
  min-height: 58px;
  resize: none;
}

.critica-field textarea:focus,
.field-block textarea:focus,
.cierre-block textarea:focus,
.critica-area-select:focus,
.sesion-date-input:focus,
.status-select:focus,
.evol-score-input:focus,
.score-select:focus,
.plan-area-input:focus,
.rev-input:focus {
  @apply outline-none border-blue-500 ring-2 ring-blue-100;
}

.ciclo-tab {
  @apply inline-flex gap-2.5 items-center text-white rounded-t-xl px-4 py-2.5 font-semibold shadow-sm;
}

.ciclo-tab.c1 {
  @apply bg-orange-500;
}

.ciclo-tab.c2 {
  @apply bg-blue-500;
}

.ciclo-tab.c3 {
  @apply bg-emerald-500;
}

.ciclo-dates {
  @apply text-[10px] opacity-90;
}

.ciclo-body {
  border-radius: 0 0.75rem 0.75rem 0.75rem;
  overflow: hidden;
}

.sesion-block {
  @apply border-b border-gray-200;
}

.sesion-block:last-child {
  border-bottom: none;
}

.sesion-header {
  @apply flex items-center justify-between gap-3 bg-gray-50 border-b border-gray-200 p-3.5;
}

.sesion-title {
  @apply flex items-center gap-2.5;
}

.sesion-tag {
  @apply rounded-full px-2.5 py-1 text-[10px] uppercase font-semibold;
}

.tag-educativa {
  @apply bg-orange-50 text-orange-600;
}

.tag-seguimiento {
  @apply bg-blue-50 text-blue-600;
}

.sesion-name {
  @apply text-[13px] font-semibold text-gray-800;
}

.sesion-content {
  @apply grid grid-cols-1 md:grid-cols-2 gap-3;
}

.plan-areas {
  @apply grid grid-cols-1 lg:grid-cols-3 gap-3;
}

.plan-area {
  @apply border border-gray-200 rounded-lg;
  overflow: hidden;
  @apply bg-white;
}

.plan-area-head {
  @apply px-2.5 py-2 text-[9px] uppercase font-semibold tracking-wide;
}

.plan-area-head.c1 {
  @apply bg-orange-50 text-orange-600;
}

.plan-area-head.c2 {
  @apply bg-blue-50 text-blue-600;
}

.plan-area-head.c3 {
  @apply bg-emerald-50 text-emerald-600;
}

.plan-area-input,
.rev-input {
  @apply w-full border border-gray-200 rounded-lg px-2.5 py-2 bg-white;
  margin: 6px;
  width: calc(100% - 12px);
}

.plan-area-input:last-child {
  margin-bottom: 8px;
}

.revision-table th,
.revision-table td {
  @apply border border-gray-200 px-3 py-2 text-xs;
}

.revision-table th {
  @apply bg-gray-50 text-gray-700 font-semibold;
}

.evolucion-grid {
  @apply grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 1px;
  @apply bg-gray-200 border border-gray-200 rounded-xl;
  overflow: hidden;
  @apply mb-4;
}

.evol-col {
  border: none;
  border-radius: 0;
}

.evol-area {
  @apply flex justify-between items-center border-b border-gray-200 px-3 py-2 bg-white;
}

.evol-area:last-child {
  border-bottom: none;
}

.evol-area-name {
  @apply text-[11px] text-gray-600;
}

.evol-score-input {
  @apply w-14 text-center;
}

.cierre-notes {
  @apply grid grid-cols-1 lg:grid-cols-2 gap-3;
}

.footer {
  @apply max-w-7xl mx-auto mt-3 bg-white text-gray-900 border border-gray-200 rounded-xl shadow-sm px-4 sm:px-6 py-4 flex justify-between flex-wrap gap-3;
}

.clave-items {
  @apply flex gap-3.5 items-center flex-wrap;
}

.clave-item {
  @apply flex items-center gap-1.5 text-gray-500 text-[11px];
}

.clave-dot {
  @apply w-[22px] h-[22px] rounded inline-flex items-center justify-center text-[11px] font-semibold;
}

.k0 {
  @apply bg-gray-100 text-gray-500;
}

.k1 {
  @apply bg-orange-50 text-orange-600;
}

.k2 {
  @apply bg-amber-50 text-amber-600;
}

.k3 {
  @apply bg-emerald-50 text-emerald-600;
}

.footer-brand {
  @apply text-blue-600 tracking-[0.14em] uppercase font-bold;
}

.read-only-scope :deep(input)[disabled],
.read-only-scope :deep(textarea)[disabled],
.read-only-scope :deep(select)[disabled] {
  pointer-events: none;
  background-color: #f3f4f6 !important;
  color: #6b7280 !important;
  opacity: 0.8;
  cursor: not-allowed;
  border-color: #d1d5db !important;
}

.read-only-scope :deep(input),
.read-only-scope :deep(textarea),
.read-only-scope :deep(select) {
  pointer-events: none;
  background-color: #f9fafb;
  color: #374151;
}

.read-only-scope :deep(button) {
  pointer-events: none;
}

@media (max-width: 1024px) {
  .evolucion-grid {
    grid-template-columns: 1fr;
  }

  .sesion-header {
    @apply flex-col items-start;
  }

  .ciclo-tab {
    @apply flex-wrap;
  }

  .topbar {
    @apply items-start;
  }
}
</style>
