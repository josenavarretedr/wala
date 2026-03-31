<template>
  <div class="dossier-page">
    <div class="topbar">
      <button @click="goBack" class="back-btn">← Volver a Consulting</button>
      <button class="save-btn">Guardar borrador</button>
    </div>

    <div class="cover">
      <div class="cover-inner">
        <div class="cover-top">
          <div class="brand">WALA</div>
          <div class="doc-type">
            Expediente de seguimiento<br />
            Programa de asesorías individuales
          </div>
        </div>

        <div class="cover-title">Plan de<br />Seguimiento</div>
        <div class="cover-sub">
          Registro de diagnóstico, planes de acción y evolución por ciclo
        </div>

        <div class="datos-grid">
          <div class="dato-cell wide">
            <div class="dato-label">Nombre del negocio</div>
            <input
              v-model="general.businessName"
              class="dato-input"
              type="text"
            />
          </div>
          <div class="dato-cell">
            <div class="dato-label">Rubro / sector</div>
            <input v-model="general.sector" class="dato-input" type="text" />
          </div>
          <div class="dato-cell wide">
            <div class="dato-label">Nombre del emprendedor/a</div>
            <input
              v-model="general.entrepreneurName"
              class="dato-input"
              type="text"
            />
          </div>
          <div class="dato-cell">
            <div class="dato-label">Contacto</div>
            <input v-model="general.contact" class="dato-input" type="text" />
          </div>
          <div class="dato-cell">
            <div class="dato-label">Asesor/a responsable</div>
            <input
              v-model="general.facilitatorName"
              class="dato-input"
              type="text"
            />
          </div>
          <div class="dato-cell">
            <div class="dato-label">Programa</div>
            <input
              v-model="general.programName"
              class="dato-input"
              type="text"
            />
          </div>
          <div class="dato-cell">
            <div class="dato-label">Fecha de inicio</div>
            <input v-model="general.startDate" class="dato-input" type="date" />
          </div>
        </div>

        <div class="ciclos-timeline">
          <div v-for="step in timelineSteps" :key="step.id" class="tl-step">
            <div class="tl-dot" :class="step.dotClass">{{ step.short }}</div>
            <div class="tl-label" v-html="step.label" />
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-header">
        <div class="section-num">1</div>
        <div>
          <div class="section-title">Diagnóstico inicial</div>
          <div class="section-desc">
            Sesión 0 · Aplicación de la matriz de desempeño · Escala 0–3
          </div>
        </div>
      </div>

      <div class="matriz-wrap">
        <table class="matriz-table">
          <thead>
            <tr>
              <th style="width: 52%; text-align: left">Indicador</th>
              <th>Pre</th>
              <th>Post C1</th>
              <th>Post C2</th>
              <th>Post C3</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="area in areas" :key="area.key">
              <tr class="area-header-row">
                <td colspan="5">
                  {{ area.title }} <span>{{ area.subtitle }}</span>
                </td>
              </tr>
              <tr
                v-for="indicator in area.indicators"
                :key="indicator.code"
                class="indicator-row"
              >
                <td>
                  <span class="ind-code">{{ indicator.code }}</span
                  >{{ indicator.text }}
                </td>
                <td
                  class="score-cell"
                  v-for="period in periods"
                  :key="`${indicator.code}-${period.key}`"
                >
                  <select
                    v-model.number="scores[indicator.code][period.key]"
                    class="score-select"
                  >
                    <option :value="null">–</option>
                    <option :value="0">0</option>
                    <option :value="1">1</option>
                    <option :value="2">2</option>
                    <option :value="3">3</option>
                  </select>
                </td>
              </tr>
            </template>

            <tr class="total-row">
              <td>Total</td>
              <td
                v-for="period in periods"
                :key="`tot-${period.key}`"
                class="total-score"
              >
                {{ getTotal(period.key) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="section">
      <div class="section-header">
        <div class="section-num">2</div>
        <div>
          <div class="section-title">Áreas críticas identificadas</div>
          <div class="section-desc">
            Las 3 áreas prioritarias definidas por puntaje y por lo que el
            emprendedor manifiesta
          </div>
        </div>
      </div>

      <div class="criticas-grid">
        <div
          v-for="(critical, idx) in criticalAreas"
          :key="idx"
          class="critica-card"
        >
          <div class="critica-card-top">
            <div class="critica-num">Área crítica #{{ idx + 1 }}</div>
            <select v-model="critical.areaKey" class="critica-area-select">
              <option v-for="area in areas" :key="area.key" :value="area.key">
                {{ area.title }}
              </option>
            </select>
            <div class="critica-puntaje">
              <label>Puntaje</label>
              <input v-model="critical.score" type="text" />
            </div>
          </div>
          <div class="critica-card-body">
            <div class="critica-field">
              <label>Indicador más débil</label>
              <textarea
                v-model="critical.weakIndicator"
                placeholder="¿Qué indicador fue el más bajo?"
              />
            </div>
            <div class="critica-field">
              <label>Justificación</label>
              <textarea
                v-model="critical.justification"
                placeholder="Motivo de priorización"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-for="cycle in cycles" :key="cycle.key" class="ciclo-section">
      <div class="ciclo-tab" :class="cycle.className">
        {{ cycle.title }}
        <span class="ciclo-dates">{{ cycle.subtitle }}</span>
      </div>

      <div class="ciclo-body">
        <div class="sesion-block">
          <div class="sesion-header">
            <div class="sesion-title">
              <span class="sesion-tag tag-educativa">Sesión educativa</span>
              <span class="sesion-name">{{ cycle.planSessionName }}</span>
            </div>
            <input
              v-model="cycle.planDate"
              class="sesion-date-input"
              type="date"
            />
          </div>

          <div class="sesion-content">
            <div class="field-block">
              <label>Resumen de explicación al emprendedor</label>
              <textarea
                v-model="cycle.educationSummary"
                placeholder="Describe cómo se explicó la relevancia de las áreas"
              />
            </div>
            <div class="field-block">
              <label>Acuerdos clave</label>
              <textarea
                v-model="cycle.agreements"
                placeholder="Acuerdos principales de la sesión"
              />
            </div>
          </div>

          <div class="plan-wrap">
            <div class="plan-title">Plan de acción — {{ cycle.title }}</div>
            <div class="plan-areas">
              <div
                v-for="(planArea, pIndex) in cycle.planAreas"
                :key="pIndex"
                class="plan-area"
              >
                <div class="plan-area-head" :class="cycle.className">
                  Área {{ pIndex + 1 }}
                </div>
                <input
                  v-model="planArea.areaName"
                  class="plan-area-input"
                  placeholder="Nombre del área"
                />
                <input
                  v-model="planArea.action1"
                  class="plan-area-input"
                  placeholder="Acción 1"
                />
                <input
                  v-model="planArea.action2"
                  class="plan-area-input"
                  placeholder="Acción 2"
                />
                <input
                  v-model="planArea.action3"
                  class="plan-area-input"
                  placeholder="Acción 3"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="sesion-block">
          <div class="sesion-header">
            <div class="sesion-title">
              <span class="sesion-tag tag-seguimiento">Sesión seguimiento</span>
              <span class="sesion-name">{{ cycle.followSessionName }}</span>
            </div>
            <input
              v-model="cycle.followDate"
              class="sesion-date-input"
              type="date"
            />
          </div>

          <div class="revision-wrap">
            <div class="plan-title">Revisión de acciones comprometidas</div>
            <table class="revision-table">
              <thead>
                <tr>
                  <th>Acción</th>
                  <th>Estado</th>
                  <th>Observación</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, idx) in cycle.reviewRows" :key="idx">
                  <td>
                    <input
                      v-model="row.action"
                      class="rev-input"
                      placeholder="Acción"
                    />
                  </td>
                  <td>
                    <select v-model="row.status" class="status-select">
                      <option value="">Seleccionar</option>
                      <option value="completed">Completada</option>
                      <option value="in_progress">En proceso</option>
                      <option value="not_done">No realizada</option>
                    </select>
                  </td>
                  <td>
                    <input
                      v-model="row.observation"
                      class="rev-input"
                      placeholder="Observación"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="sesion-content">
            <div class="field-block">
              <label>Conclusiones</label>
              <textarea
                v-model="cycle.conclusions"
                class="short"
                placeholder="Conclusiones de la sesión"
              />
            </div>
            <div class="field-block">
              <label>Compromisos siguientes</label>
              <textarea
                v-model="cycle.nextCommitments"
                class="short"
                placeholder="Compromisos para la siguiente sesión"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="evolucion-section">
      <div class="section-header">
        <div class="section-num">3</div>
        <div>
          <div class="section-title">Evaluación final del programa</div>
          <div class="section-desc">
            Comparativa de puntajes por área y conclusiones del proceso completo
          </div>
        </div>
      </div>

      <div class="evolucion-grid">
        <div class="evol-col">
          <div class="evol-col-head">Área</div>
          <div
            class="evol-area"
            v-for="area in areas"
            :key="`name-${area.key}`"
          >
            <span class="evol-area-name">{{ area.title }}</span>
          </div>
        </div>

        <div
          v-for="period in periods"
          :key="`eval-${period.key}`"
          class="evol-col"
        >
          <div class="evol-col-head">{{ period.label }}</div>
          <div
            class="evol-area"
            v-for="area in areas"
            :key="`${period.key}-${area.key}`"
          >
            <input
              v-model="finalByArea[period.key][area.key]"
              class="evol-score-input"
              type="text"
              placeholder="–"
            />
          </div>
        </div>
      </div>

      <div class="cierre-notes">
        <div class="cierre-block">
          <label>Principales logros del emprendedor durante el programa</label>
          <textarea
            v-model="closing.achievements"
            placeholder="¿Qué cambió concretamente en su negocio?"
          />
        </div>
        <div class="cierre-block">
          <label>Áreas que quedan como tarea pendiente</label>
          <textarea
            v-model="closing.pending"
            placeholder="¿Qué necesita continuar trabajando?"
          />
        </div>
        <div class="cierre-block">
          <label>Recomendación del asesor para continuar</label>
          <textarea
            v-model="closing.recommendation"
            placeholder="Siguientes pasos recomendados"
          />
        </div>
        <div class="cierre-block">
          <label>Testimonio / palabras del emprendedor al cierre</label>
          <textarea
            v-model="closing.testimony"
            placeholder="Percepción del emprendedor"
          />
        </div>
      </div>
    </div>

    <div class="footer">
      <div class="clave-items">
        <span class="scale-label">Escala:</span>
        <div class="clave-item">
          <div class="clave-dot k0">0</div>
          Sin conocimiento
        </div>
        <div class="clave-item">
          <div class="clave-dot k1">1</div>
          Conocimiento mínimo
        </div>
        <div class="clave-item">
          <div class="clave-dot k2">2</div>
          Mucho conocimiento, poca aplicación
        </div>
        <div class="clave-item">
          <div class="clave-dot k3">3</div>
          Aplica el conocimiento
        </div>
      </div>
      <div class="footer-brand">WALA</div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useConsultingDossierStore } from "@/stores/consultingDossierStore";

const route = useRoute();
const router = useRouter();
const dossierStore = useConsultingDossierStore();

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

const timelineSteps = [
  { id: "s0", short: "S0", label: "Diagnóstico<br>inicial", dotClass: "s0" },
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
  { id: "fin", short: "FIN", label: "Evaluación<br>final", dotClass: "" },
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
    "Sesión educativa + plan de acción + seguimiento",
    "c1",
    "Sesión 1A",
    "Sesión 1B",
  ),
  createCycle(
    "c2",
    "Ciclo 2",
    "Nuevo plan de acción + seguimiento",
    "c2",
    "Sesión 3",
    "Sesión 4",
  ),
  createCycle(
    "c3",
    "Ciclo 3",
    "Plan final + seguimiento + cierre del programa",
    "c3",
    "Sesión 5",
    "Sesión 6",
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

const programId = computed(() => route.params.programId);
const dossierId = computed(() => route.params.dossierId);

function getTotal(periodKey) {
  return Object.values(scores).reduce((sum, scoreByPeriod) => {
    if (typeof scoreByPeriod[periodKey] === "number") {
      return sum + scoreByPeriod[periodKey];
    }
    return sum;
  }, 0);
}

function goBack() {
  router.push(`/programs/${programId.value}/consultings`);
}

async function hydrateHeaderData() {
  try {
    const dossier = await dossierStore.loadDossier(
      programId.value,
      dossierId.value,
    );
    general.businessName = dossier?.businessName || "";
    general.entrepreneurName = dossier?.participantName || "";
    general.facilitatorName = dossier?.facilitatorName || "";
  } catch (error) {
    console.error("No se pudo hidratar el encabezado del expediente:", error);
  }
}

hydrateHeaderData();
</script>

<style scoped>
.dossier-page {
  @apply min-h-screen bg-gray-50 text-gray-900 text-[13px] leading-relaxed pb-10;
}

.topbar {
  @apply sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-3;
}

.back-btn,
.save-btn {
  @apply border border-gray-200 bg-white rounded-xl px-4 py-2 text-[13px] font-semibold transition-all duration-200;
}

.back-btn:hover {
  @apply bg-gray-50 border-gray-300;
}

.save-btn {
  @apply bg-blue-600 text-white border-blue-600 shadow-sm;
}

.save-btn:hover {
  @apply bg-blue-700 border-blue-700;
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
}
</style>
