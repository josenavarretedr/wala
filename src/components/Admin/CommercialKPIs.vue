<template>
  <div class="commercial-kpis">
    <!-- Header -->
    <div class="kpis-header">
      <h2 class="kpis-title">KPIs Semanales</h2>
      <button @click="showEditMetas = true" class="btn-edit-metas">
        <svg
          class="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        Editar metas
      </button>
    </div>

    <!-- Alertas -->
    <div v-if="alertas.length > 0" class="alertas-container">
      <div v-for="(alerta, idx) in alertas" :key="idx" class="alerta-badge">
        {{ alerta }}
      </div>
    </div>

    <!-- Tarjetas de KPIs -->
    <div class="kpis-grid">
      <!-- Visitas -->
      <div class="kpi-card">
        <div class="kpi-icon visitas">👁️</div>
        <div class="kpi-content">
          <p class="kpi-label">Visitas</p>
          <p class="kpi-value">{{ kpis.visitasTotal }}</p>
          <p
            class="kpi-meta"
            :class="{
              'meta-ok': kpis.visitasTotal >= metas.visitasTarget,
              'meta-alerta': kpis.visitasTotal < metas.visitasTarget,
            }"
          >
            Meta: {{ metas.visitasTarget }}
          </p>
        </div>
      </div>

      <!-- Pruebas Activadas -->
      <div class="kpi-card">
        <div class="kpi-icon pruebas-icon">7d</div>
        <div class="kpi-content">
          <p class="kpi-label">Pruebas Activadas</p>
          <p class="kpi-value">{{ kpis.pruebasActivadas ?? 0 }}</p>
          <p
            class="kpi-meta"
            :class="{
              'meta-ok': (kpis.pruebasActivadas ?? 0) >= (metas.pruebasTarget ?? 5),
              'meta-alerta': (kpis.pruebasActivadas ?? 0) < (metas.pruebasTarget ?? 5),
            }"
          >
            Meta: {{ metas.pruebasTarget ?? 5 }}
          </p>
        </div>
      </div>

      <!-- Agendados -->
      <div class="kpi-card">
        <div class="kpi-icon agendados">📅</div>
        <div class="kpi-content">
          <p class="kpi-label">Agendados</p>
          <p class="kpi-value">{{ kpis.agendados }}</p>
          <p class="kpi-meta">
            Tasa:
            <span
              :class="{
                'tasa-ok': kpis.tasaAgendamiento >= metas.tasaAgendamientoMin,
                'tasa-alerta':
                  kpis.tasaAgendamiento < metas.tasaAgendamientoMin,
              }"
              >{{ kpis.tasaAgendamiento }}%</span> (mín {{ metas.tasaAgendamientoMin }}%)
          </p>
        </div>
      </div>

      <!-- Diagnósticos Ejecutados -->
      <div class="kpi-card">
        <div class="kpi-icon diagnosticos-icon">Dx</div>
        <div class="kpi-content">
          <p class="kpi-label">Diag. Ejecutados</p>
          <p class="kpi-value">{{ kpis.diagnosticosTotal }}</p>
          <p
            class="kpi-meta"
            :class="{
              'meta-ok': kpis.diagnosticosTotal >= (metas.diagnosticosEjecutadosTarget ?? 5),
              'meta-alerta': kpis.diagnosticosTotal < (metas.diagnosticosEjecutadosTarget ?? 5),
            }"
          >
            Meta: {{ metas.diagnosticosEjecutadosTarget ?? 5 }}
          </p>
        </div>
      </div>

      <!-- Cierres -->
      <div class="kpi-card">
        <div class="kpi-icon cierres">✅</div>
        <div class="kpi-content">
          <p class="kpi-label">Cierres Totales</p>
          <p class="kpi-value">{{ kpis.totalCierres ?? (kpis.cierresAdvisory + kpis.cierresWala) }}</p>
          <p class="kpi-meta">
            Tasa:
            <span
              :class="{
                'tasa-ok': kpis.tasaCierre >= metas.tasaCierreMin,
                'tasa-alerta': kpis.tasaCierre < metas.tasaCierreMin,
              }"
              >{{ kpis.tasaCierre }}%</span> (mín {{ metas.tasaCierreMin }}%)
          </p>
        </div>
      </div>

      <!-- Caja -->
      <div class="kpi-card">
        <div class="kpi-icon caja">💰</div>
        <div class="kpi-content">
          <p class="kpi-label">Caja Cobrada</p>
          <p class="kpi-value">S/.{{ kpis.cajaTotal }}</p>
          <p
            class="kpi-meta"
            :class="{
              'meta-ok': kpis.cajaTotal >= metas.cajaTarget,
              'meta-alerta': kpis.cajaTotal < metas.cajaTarget,
            }"
          >
            Meta: S/.{{ metas.cajaTarget }}
          </p>
        </div>
      </div>
    </div>

    <!-- Desglose de Cierres -->
    <div class="desglose-section">
      <h3 class="desglose-title">Desglose de Cierres</h3>
      <div class="desglose-grid">
        <div class="desglose-item">
          <span class="desglose-label">Advisory (S/.225)</span>
          <span class="desglose-value">{{ kpis.cierresAdvisory }}</span>
          <span class="desglose-monto">S/.{{ kpis.cajaAdvisory }}</span>
        </div>
        <div class="desglose-item">
          <span class="desglose-label">WALA (S/.49/mes)</span>
          <span class="desglose-value">{{ kpis.cierresWala }}</span>
          <span class="desglose-monto">S/.{{ kpis.cajaWala }}</span>
        </div>
      </div>
    </div>

    <!-- Modal: Editar Metas -->
    <Teleport to="body">
      <div
        v-if="showEditMetas"
        class="modal-overlay"
        @click.self="showEditMetas = false"
      >
        <div class="modal-card">
          <div class="modal-header">
            <h2 class="modal-title">Editar Metas Semanales</h2>
            <button @click="showEditMetas = false" class="modal-close">
              <svg
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <label class="field-label">Visitas Target</label>
            <input
              v-model.number="formMetas.visitasTarget"
              type="number"
              class="field-input"
            />

            <label class="field-label">Pruebas Activadas Target</label>
            <input
              v-model.number="formMetas.pruebasTarget"
              type="number"
              class="field-input"
            />

            <label class="field-label">Agendados Target</label>
            <input
              v-model.number="formMetas.agendadosTarget"
              type="number"
              class="field-input"
            />

            <label class="field-label">Tasa Agendamiento Mínima (%)</label>
            <input
              v-model.number="formMetas.tasaAgendamientoMin"
              type="number"
              class="field-input"
            />

            <label class="field-label">Diagnósticos Ejecutados Target</label>
            <input
              v-model.number="formMetas.diagnosticosEjecutadosTarget"
              type="number"
              class="field-input"
            />

            <label class="field-label">Cierres Advisory Target</label>
            <input
              v-model.number="formMetas.cierresTarget"
              type="number"
              class="field-input"
            />

            <label class="field-label">Cierres WALA Target</label>
            <input
              v-model.number="formMetas.cierresWalaTarget"
              type="number"
              class="field-input"
            />

            <label class="field-label">Tasa Cierre Mínima (%)</label>
            <input
              v-model.number="formMetas.tasaCierreMin"
              type="number"
              class="field-input"
            />

            <label class="field-label">Caja Target (S/.)</label>
            <input
              v-model.number="formMetas.cajaTarget"
              type="number"
              class="field-input"
            />
          </div>

          <div class="modal-footer">
            <button @click="showEditMetas = false" class="btn-secondary">
              Cancelar
            </button>
            <button @click="saveMetas" class="btn-primary">Guardar</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  kpis: {
    type: Object,
    default: () => ({
      visitasTotal: 0,
      agendados: 0,
      tasaAgendamiento: 0,
      cierresAdvisory: 0,
      cierresWala: 0,
      tasaCierre: 0,
      cajaAdvisory: 0,
      cajaWala: 0,
      cajaTotal: 0,
      alertas: [],
    }),
  },
  metas: {
    type: Object,
    default: () => ({
      visitasTarget: 40,
      agendadosTarget: 6,
      tasaAgendamientoMin: 12,
      cierresTarget: 1,
      tasaCierreMin: 15,
      cajaTarget: 450,
    }),
  },
});

const emit = defineEmits(["update-metas"]);

const showEditMetas = ref(false);
const formMetas = ref({ ...props.metas });
const alertas = ref([]);

watch(
  () => props.metas,
  (newMetas) => {
    formMetas.value = { ...newMetas };
  },
);

watch(
  () => props.kpis,
  (newKpis) => {
    alertas.value = newKpis.alertas || [];
  },
);

const saveMetas = () => {
  emit("update-metas", formMetas.value);
  showEditMetas.value = false;
};
</script>

<style scoped>
.commercial-kpis {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.kpis-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.kpis-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.btn-edit-metas {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  border-radius: 0.75rem;
  background: #f3f4f6;
  border: 1.5px solid #e5e7eb;
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-edit-metas:hover {
  background: #e5e7ff;
  border-color: #6366f1;
  color: #4f46e5;
}

/* Alertas */
.alertas-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.alerta-badge {
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  background: #fef3c7;
  border: 1px solid #fcd34d;
  color: #92400e;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Grid de KPIs */
.kpis-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.kpi-card {
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  border-radius: 1rem;
  background: #fff;
  border: 1.5px solid #e5e7eb;
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.07);
  transition: all 0.15s;
}

.kpi-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.1);
}

.kpi-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  min-width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
}

.kpi-icon.visitas {
  background: #dbeafe;
}

.kpi-icon.pruebas-icon {
  background: #eff6ff;
  color: #1d4ed8;
  font-weight: 800;
}

.kpi-icon.agendados {
  background: #dcfce7;
}

.kpi-icon.diagnosticos-icon {
  background: #f5f3ff;
  color: #6d28d9;
  font-weight: 800;
}

.kpi-icon.cierres {
  background: #fce7f3;
}

.kpi-icon.caja {
  background: #fed7aa;
}

.kpi-content {
  flex: 1;
}

.kpi-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
  margin: 0 0 0.4rem 0;
}

.kpi-value {
  font-size: 1.75rem;
  font-weight: 800;
  color: #111827;
  margin: 0;
}

.kpi-meta {
  font-size: 0.8rem;
  color: #9ca3af;
  margin: 0.3rem 0 0 0;
}

.meta-ok {
  color: #059669;
  font-weight: 600;
}

.meta-alerta {
  color: #d97706;
  font-weight: 600;
}

.tasa-ok {
  color: #059669;
  font-weight: 700;
}

.tasa-alerta {
  color: #dc2626;
  font-weight: 700;
}

/* Desglose */
.desglose-section {
  background: #f9fafb;
  border-radius: 1rem;
  padding: 1.25rem;
  border: 1px solid #e5e7eb;
}

.desglose-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #374151;
  margin: 0 0 0.75rem 0;
}

.desglose-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.desglose-item {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 0.75rem;
  background: #fff;
  border-radius: 0.65rem;
  border: 1px solid #e5e7eb;
}

.desglose-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #6b7280;
}

.desglose-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: #111827;
}

.desglose-monto {
  font-size: 0.85rem;
  color: #059669;
  font-weight: 600;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-card {
  background: #fff;
  border-radius: 1.25rem;
  width: 100%;
  max-width: 24rem;
  box-shadow: 0 20px 60px rgb(0 0 0 / 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
  border-bottom: 1px solid #f3f4f6;
}

.modal-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: #111827;
  margin: 0;
}

.modal-close {
  padding: 0.35rem;
  border-radius: 0.5rem;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
}

.modal-close:hover {
  background: #f3f4f6;
}

.modal-body {
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.field-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #374151;
}

.field-input {
  width: 100%;
  padding: 0.55rem 0.75rem;
  border: 1.5px solid #e5e7eb;
  border-radius: 0.65rem;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.15s;
}

.field-input:focus {
  border-color: #6366f1;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem 1.5rem;
  border-top: 1px solid #f3f4f6;
}

.btn-secondary {
  padding: 0.6rem 1.2rem;
  border-radius: 0.75rem;
  background: #f9fafb;
  border: 1.5px solid #e5e7eb;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-secondary:hover {
  background: #f3f4f6;
}

.btn-primary {
  padding: 0.6rem 1.4rem;
  border-radius: 0.75rem;
  background: #4f46e5;
  border: none;
  color: #fff;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-primary:hover {
  background: #4338ca;
}

@media (max-width: 768px) {
  .kpis-grid {
    grid-template-columns: 1fr;
  }

  .desglose-grid {
    grid-template-columns: 1fr;
  }

  .kpi-card {
    padding: 1rem;
  }
}
</style>
