<template>
  <div v-for="cycle in props.modelValue" :key="cycle.key" class="ciclo-section">
    <div class="ciclo-head-row">
      <div class="ciclo-tab" :class="cycle.className">
        {{ cycle.title }}
        <span class="ciclo-dates">{{ cycle.subtitle }}</span>
      </div>

      <button
        type="button"
        class="section-toggle-btn section-toggle-inline"
        :aria-expanded="Boolean(cycleExpanded[cycle.key])"
        :aria-controls="getCycleContentId(cycle.key)"
        @click="toggleCycle(cycle.key)"
      >
        {{
          cycleExpanded[cycle.key] ? "Ocultar contenido" : "Mostrar contenido"
        }}
      </button>
    </div>

    <div
      v-show="Boolean(cycleExpanded[cycle.key])"
      :id="getCycleContentId(cycle.key)"
      class="ciclo-body"
    >
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
            :readonly="props.readOnly"
            :disabled="props.readOnly"
            :tabindex="props.readOnly ? -1 : 0"
          />
        </div>

        <div class="sesion-content">
          <div class="field-block">
            <label>Resumen de explicación al emprendedor</label>
            <textarea
              v-model="cycle.educationSummary"
              placeholder="Describe cómo se explicó la relevancia de las áreas"
              :readonly="props.readOnly"
              :disabled="props.readOnly"
              :tabindex="props.readOnly ? -1 : 0"
            />
          </div>
          <div class="field-block">
            <label>Acuerdos clave</label>
            <textarea
              v-model="cycle.agreements"
              placeholder="Acuerdos principales de la sesión"
              :readonly="props.readOnly"
              :disabled="props.readOnly"
              :tabindex="props.readOnly ? -1 : 0"
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
              <select
                v-model="planArea.areaName"
                class="plan-area-input"
                :readonly="props.readOnly"
                :disabled="props.readOnly"
                :tabindex="props.readOnly ? -1 : 0"
              >
                <option value="">Seleccionar área</option>
                <option
                  v-for="area in getAreaOptions()"
                  :key="area.key"
                  :value="area.key"
                >
                  {{ area.title }}
                </option>
              </select>
              <input
                v-model="planArea.action1"
                class="plan-area-input"
                placeholder="Acción 1"
                :readonly="props.readOnly"
                :disabled="props.readOnly"
                :tabindex="props.readOnly ? -1 : 0"
              />
              <input
                v-model="planArea.action2"
                class="plan-area-input"
                placeholder="Acción 2"
                :readonly="props.readOnly"
                :disabled="props.readOnly"
                :tabindex="props.readOnly ? -1 : 0"
              />
              <input
                v-model="planArea.action3"
                class="plan-area-input"
                placeholder="Acción 3"
                :readonly="props.readOnly"
                :disabled="props.readOnly"
                :tabindex="props.readOnly ? -1 : 0"
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
            :readonly="props.readOnly"
            :disabled="props.readOnly"
            :tabindex="props.readOnly ? -1 : 0"
          />
        </div>

        <div class="revision-wrap">
          <div class="plan-title">Revisión de acciones comprometidas</div>
          <table
            class="revision-table revision-table-desktop"
            :class="{ 'is-read-only': props.readOnly }"
          >
            <thead>
              <tr>
                <th>Área</th>
                <th>Acción</th>
                <th>Frecuencia</th>
                <th>Estado</th>
                <th>Observación</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in cycle.reviewRows" :key="idx">
                <td>
                  <select
                    v-model="row.area"
                    class="status-select"
                    :readonly="true"
                    :disabled="true"
                    tabindex="-1"
                  >
                    <option value="">Seleccionar</option>
                    <option
                      v-for="area in getAreaOptions()"
                      :key="`row-area-${idx}-${area.key}`"
                      :value="area.key"
                    >
                      {{ area.title }}
                    </option>
                  </select>
                </td>
                <td>
                  <input
                    v-model="row.action"
                    class="rev-input"
                    placeholder="Acción"
                    :readonly="true"
                    :disabled="true"
                    tabindex="-1"
                  />
                </td>
                <td>
                  <select
                    v-model="row.frecuencia"
                    class="status-select"
                    :readonly="props.readOnly"
                    :disabled="props.readOnly"
                    :tabindex="props.readOnly ? -1 : 0"
                  >
                    <option value="">Seleccionar</option>
                    <option value="diaria">Diaria</option>
                    <option value="semanal">Semanal</option>
                    <option value="quincenal">Quincenal</option>
                    <option value="mensual">Mensual</option>
                  </select>
                </td>
                <td>
                  <select
                    v-model="row.status"
                    class="status-select"
                    :readonly="props.readOnly"
                    :disabled="props.readOnly"
                    :tabindex="props.readOnly ? -1 : 0"
                  >
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
                    :readonly="props.readOnly"
                    :disabled="props.readOnly"
                    :tabindex="props.readOnly ? -1 : 0"
                  />
                </td>
              </tr>
            </tbody>
          </table>

          <div v-if="props.readOnly" class="revision-cards-mobile">
            <article
              v-for="(row, idx) in getReviewRowsForCards(cycle.reviewRows)"
              :key="`review-card-${idx}`"
              class="review-card"
            >
              <h4 class="review-card-title">
                {{ row.action || "Sin acción" }}
              </h4>

              <div class="review-card-badges">
                <span class="review-badge badge-area">
                  {{ getAreaLabel(row.area) }}
                </span>
                <span class="review-badge badge-frequency">
                  {{ getFrequencyLabel(row.frecuencia) }}
                </span>
                <span
                  class="review-badge"
                  :class="getStatusBadgeClass(row.status)"
                >
                  {{ getStatusLabel(row.status) }}
                </span>
              </div>

              <p v-if="row.observation" class="review-card-observation">
                {{ row.observation }}
              </p>
            </article>
          </div>
        </div>

        <div class="sesion-content">
          <div class="field-block">
            <label>Conclusiones</label>
            <textarea
              v-model="cycle.conclusions"
              class="short"
              placeholder="Conclusiones de la sesión"
              :readonly="props.readOnly"
              :disabled="props.readOnly"
              :tabindex="props.readOnly ? -1 : 0"
            />
          </div>
          <div class="field-block">
            <label>Compromisos siguientes</label>
            <textarea
              v-model="cycle.nextCommitments"
              class="short"
              placeholder="Compromisos para la siguiente sesión"
              :readonly="props.readOnly"
              :disabled="props.readOnly"
              :tabindex="props.readOnly ? -1 : 0"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, watchEffect } from "vue";

const props = defineProps({
  modelValue: {
    type: Array,
    required: true,
  },
  areas: {
    type: Array,
    default: () => [],
  },
  criticalAreas: {
    type: Array,
    default: () => [],
  },
  readOnly: {
    type: Boolean,
    default: false,
  },
});

const cycleExpanded = reactive({});
const PLAN_ACTION_KEYS = ["action1", "action2", "action3"];
const FREQUENCY_LABELS = {
  diaria: "Diaria",
  semanal: "Semanal",
  quincenal: "Quincenal",
  mensual: "Mensual",
};
const STATUS_LABELS = {
  completed: "Completada",
  in_progress: "En proceso",
  not_done: "No realizada",
};
const VALID_STATUS_VALUES = new Set(Object.keys(STATUS_LABELS));

const areaByKey = computed(() => {
  return props.areas.reduce((acc, area) => {
    acc[area.key] = area;
    return acc;
  }, {});
});

watchEffect(() => {
  props.modelValue.forEach((cycle) => {
    if (!(cycle.key in cycleExpanded)) {
      cycleExpanded[cycle.key] = false;
    }

    normalizeCycle(cycle);
    syncReviewRowsFromPlan(cycle);
  });
});

function normalizeCycle(cycle) {
  if (!Array.isArray(cycle.planAreas)) {
    cycle.planAreas = [];
  }

  while (cycle.planAreas.length < 3) {
    cycle.planAreas.push(createEmptyPlanArea());
  }

  cycle.planAreas = cycle.planAreas.slice(0, 3);
  cycle.planAreas.forEach((planArea) => {
    planArea.areaName = normalizeAreaKey(planArea.areaName);
    PLAN_ACTION_KEYS.forEach((key) => {
      if (typeof planArea[key] !== "string") {
        planArea[key] = planArea[key] == null ? "" : String(planArea[key]);
      }
    });
  });

  if (!Array.isArray(cycle.reviewRows)) {
    cycle.reviewRows = [];
  }

  cycle.reviewRows.forEach((row) => {
    if (typeof row.slotKey !== "string") row.slotKey = "";
    if (typeof row.area !== "string") row.area = "";
    if (typeof row.action !== "string") row.action = "";
    if (typeof row.frecuencia !== "string") row.frecuencia = "";
    if (
      typeof row.status !== "string" ||
      !VALID_STATUS_VALUES.has(row.status)
    ) {
      row.status = "in_progress";
    }
    if (typeof row.observation !== "string") row.observation = "";
  });
}

function normalizeAreaKey(value) {
  if (!value) return "";

  if (areaByKey.value[value]) {
    return value;
  }

  const normalizedValue = String(value).trim().toLowerCase();

  const matchByTitle = props.areas.find((area) => {
    const title = String(area.title || "")
      .replace(/^\d+\.\s*/, "")
      .trim()
      .toLowerCase();
    return title === normalizedValue;
  });

  return matchByTitle?.key || "";
}

function syncReviewRowsFromPlan(cycle) {
  const existingRowsBySlot = new Map(
    (cycle.reviewRows || [])
      .filter((row) => typeof row?.slotKey === "string" && row.slotKey)
      .map((row) => [row.slotKey, row]),
  );

  const committedRows = cycle.planAreas.flatMap((planArea, planAreaIndex) => {
    const area = normalizeAreaKey(planArea.areaName);
    return PLAN_ACTION_KEYS.map((actionKey) => {
      const action = (planArea[actionKey] || "").trim();
      return {
        slotKey: `${planAreaIndex}-${actionKey}`,
        area,
        action,
      };
    }).filter((row) => row.action.length > 0);
  });

  cycle.reviewRows = committedRows.map((source) => {
    const target =
      existingRowsBySlot.get(source.slotKey) || createEmptyReviewRow();
    target.slotKey = source.slotKey;
    target.area = source.area;
    target.action = source.action;
    return target;
  });
}

function createEmptyPlanArea() {
  return {
    areaName: "",
    action1: "",
    action2: "",
    action3: "",
  };
}

function createEmptyReviewRow() {
  return {
    slotKey: "",
    area: "",
    action: "",
    frecuencia: "",
    status: "in_progress",
    observation: "",
  };
}

function getAreaOptions() {
  if (!props.areas.length) {
    return [];
  }

  const criticalSet = new Set(
    props.criticalAreas
      .map((critical) => critical?.areaKey)
      .filter((key) => typeof key === "string" && key.length > 0),
  );

  const criticalFirst = props.areas.filter((area) => criticalSet.has(area.key));
  const remaining = props.areas.filter((area) => !criticalSet.has(area.key));
  return [...criticalFirst, ...remaining];
}

function getAreaLabel(areaKey) {
  if (!areaKey) return "Sin área";
  return areaByKey.value[areaKey]?.title || "Sin área";
}

function getFrequencyLabel(value) {
  if (!value) return "Sin frecuencia";
  return FREQUENCY_LABELS[value] || "Sin frecuencia";
}

function getStatusLabel(value) {
  if (!value) return "Sin estado";
  return STATUS_LABELS[value] || "Sin estado";
}

function getStatusBadgeClass(value) {
  if (value === "completed") return "badge-status-completed";
  if (value === "in_progress") return "badge-status-progress";
  if (value === "not_done") return "badge-status-not-done";
  return "badge-status-empty";
}

function getReviewRowsForCards(reviewRows) {
  if (!Array.isArray(reviewRows)) return [];
  return reviewRows.filter((row) => {
    return Boolean(
      row?.action ||
      row?.area ||
      row?.frecuencia ||
      row?.status ||
      row?.observation,
    );
  });
}

function toggleCycle(cycleKey) {
  cycleExpanded[cycleKey] = !cycleExpanded[cycleKey];
}

function getCycleContentId(cycleKey) {
  const safeKey = String(cycleKey).replace(/[^a-zA-Z0-9_-]/g, "-");
  return `consulting-cycle-${safeKey}-content`;
}
</script>

<style scoped>
.revision-cards-mobile {
  display: none;
}

@media (max-width: 1023px) {
  .revision-table-desktop.is-read-only {
    display: none;
  }

  .revision-cards-mobile {
    display: grid;
    gap: 0.75rem;
  }
}

.review-card {
  border: 1px solid #d9e1ef;
  border-radius: 12px;
  padding: 0.85rem;
  background: #f8fbff;
}

.review-card-title {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.35;
  font-weight: 700;
  color: #1a2d4d;
}

.review-card-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-top: 0.6rem;
}

.review-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.2rem 0.6rem;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  background: #e7eefb;
  color: #1e3a68;
}

.badge-area {
  background: #dff3ec;
  color: #0d5f45;
}

.badge-frequency {
  background: #f0e8ff;
  color: #4d2e86;
}

.badge-status-completed {
  background: #d9f7e8;
  color: #0f6b44;
}

.badge-status-progress {
  background: #fff2d9;
  color: #8b4e00;
}

.badge-status-not-done {
  background: #fde5e5;
  color: #8d1f1f;
}

.badge-status-empty {
  background: #edf1f6;
  color: #516076;
}

.review-card-observation {
  margin: 0.55rem 0 0;
  font-size: 0.82rem;
  line-height: 1.35;
  color: #52617a;
}
</style>
