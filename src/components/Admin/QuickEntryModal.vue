<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
      <div class="modal-card">
        <!-- Header -->
        <div class="modal-header">
          <h2 class="modal-title">
            Registrar {{ eventLabels[currentStep].title }}
          </h2>
          <button @click="closeModal" class="modal-close">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Progress Bar -->
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: (currentStep / 4) * 100 + '%' }"></div>
        </div>

        <!-- Body -->
        <div class="modal-body">
          <!-- Step 1: Tipo de Evento -->
          <div v-if="currentStep === 1" class="step-content">
            <h3 class="step-title">¿Qué tipo de evento registras?</h3>
            <div class="event-grid">
              <button
                v-for="(label, type) in eventTypes"
                :key="type"
                @click="selectEventType(type)"
                :class="{ active: formData.eventType === type }"
                class="event-btn"
              >
                {{ label.icon }}
                <span>{{ label.name }}</span>
              </button>
            </div>
          </div>

          <!-- Step 2: Datos Base del Contacto (texto libre, sin referencias externas) -->
          <div v-else-if="currentStep === 2" class="step-content">
            <h3 class="step-title">Datos del Contacto</h3>

            <label class="field-label">Negocio *</label>
            <input
              v-model="formData.businessName"
              type="text"
              placeholder="Nombre del negocio"
              class="field-input"
            />

            <label class="field-label">Nombre del contacto *</label>
            <input
              v-model="formData.contactName"
              type="text"
              placeholder="José García"
              class="field-input"
            />

            <label class="field-label">Teléfono *</label>
            <input
              v-model="formData.contactPhone"
              type="tel"
              placeholder="Ej: +51 987 654 321"
              class="field-input"
            />
            <small class="field-hint" style="font-size:0.75rem; color:#6b7280;">Incluye el código de país si no es de Perú (ej: +52). Si es de Perú (9 dígitos) se añadirá +51 automáticamente.</small>

            <label class="field-label">Zona</label>
            <select v-model="formData.zona" class="field-select">
              <option value="">Seleccionar zona</option>
              <option v-for="zona in zonas" :key="zona" :value="zona">{{ zona }}</option>
            </select>

            <label class="field-label">Sector</label>
            <select v-model="formData.sector" class="field-select">
              <option value="">Seleccionar sector</option>
              <option v-for="sector in sectores" :key="sector" :value="sector">{{ sector }}</option>
            </select>

            <label class="field-label">Campaña</label>
            <select v-model="formData.campana" class="field-select">
              <option value="">Sin campaña</option>
              <option v-for="c in campanas" :key="c" :value="c">{{ c }}</option>
            </select>

            <label class="field-label">Cohorte</label>
            <select v-model="formData.cohorte" class="field-select">
              <option value="">Sin cohorte</option>
              <option v-for="c in cohortes" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>

          <!-- Step 3: Detalles por Tipo -->
          <div v-else-if="currentStep === 3" class="step-content">
            <!-- Visita -->
            <div v-if="formData.eventType === 'visita'">
              <h3 class="step-title">Detalles de la Visita</h3>
              <label class="field-label">Resultado</label>
              <div class="radio-group">
                <label class="radio-item">
                  <input v-model="formData.resultado" type="radio" value="agendado" />
                  <span>✅ Agendado (para diagnóstico)</span>
                </label>
                <label class="radio-item">
                  <input v-model="formData.resultado" type="radio" value="no_agendado" />
                  <span>❌ No agendado</span>
                </label>
              </div>
              <template v-if="formData.resultado === 'agendado'">
                <label class="field-label">Fecha agendada</label>
                <input v-model="formData.fechaAgendada" type="date" class="field-input" />
              </template>
              <label class="field-label">Notas</label>
              <textarea v-model="formData.notas" placeholder="Observaciones de la visita..." rows="2" class="field-input"></textarea>
            </div>

            <!-- Diagnóstico -->
            <div v-else-if="formData.eventType === 'diagnostico'">
              <h3 class="step-title">Resultado del Diagnóstico</h3>
              <label class="field-label">Resultado</label>
              <div class="radio-group">
                <label class="radio-item">
                  <input v-model="formData.resultado" type="radio" value="cierre_advisory" />
                  <span>💼 Cierre Advisory (S/.225)</span>
                </label>
                <label class="radio-item">
                  <input v-model="formData.resultado" type="radio" value="cierre_wala" />
                  <span>🎯 Cierre WALA (S/.49/mes)</span>
                </label>
                <label class="radio-item">
                  <input v-model="formData.resultado" type="radio" value="en_seguimiento" />
                  <span>📋 En seguimiento</span>
                </label>
              </div>
              <label class="field-label">Áreas críticas identificadas</label>
              <input
                v-model="formData.areasCriticasInput"
                type="text"
                placeholder="Ej: Flujo de Caja, Inventario"
                class="field-input"
              />
              <label class="field-label">Monto estimado de solución (S/.)</label>
              <input v-model.number="formData.monto" type="number" class="field-input" />
              <label class="field-label">Notas</label>
              <textarea v-model="formData.notas" placeholder="Observaciones del diagnóstico..." rows="2" class="field-input"></textarea>
            </div>

            <!-- Cierre -->
            <div v-else-if="formData.eventType === 'cierre'">
              <h3 class="step-title">Confirmación de Cierre</h3>
              <label class="field-label">Tipo de cierre</label>
              <div class="radio-group">
                <label class="radio-item">
                  <input v-model="formData.tipoCierre" type="radio" value="advisory" />
                  <span>💼 Advisory - S/.225</span>
                </label>
                <label class="radio-item">
                  <input v-model="formData.tipoCierre" type="radio" value="wala" />
                  <span>🎯 WALA - S/.49/mes</span>
                </label>
              </div>
              <label class="field-label">Fecha de inicio</label>
              <input v-model="formData.fechaAgendada" type="date" class="field-input" />
              <label class="field-label">Monto final acordado (S/.)</label>
              <input v-model.number="formData.monto" type="number" class="field-input" />
              <label class="field-label">Resultado</label>
              <input v-model="formData.resultado" type="text" placeholder="Ej: cierre_advisory" class="field-input" />
            </div>

            <!-- Seguimiento -->
            <div v-else-if="formData.eventType === 'seguimiento'">
              <h3 class="step-title">Registro de Seguimiento</h3>
              <label class="field-label">Tipo de seguimiento</label>
              <div class="radio-group">
                <label class="radio-item">
                  <input v-model="formData.tipoSeguimiento" type="radio" value="pre_diagnostico" />
                  <span>🔍 Pre-diagnóstico (48h después visita)</span>
                </label>
                <label class="radio-item">
                  <input v-model="formData.tipoSeguimiento" type="radio" value="post_diagnostico" />
                  <span>📊 Post-diagnóstico (respuesta a propuesta)</span>
                </label>
                <label class="radio-item">
                  <input v-model="formData.tipoSeguimiento" type="radio" value="post_cierre" />
                  <span>✅ Post-cierre (onboarding)</span>
                </label>
              </div>
              <label class="field-label">Resultado</label>
              <input v-model="formData.resultado" type="text" placeholder="¿Cuál fue el resultado?" class="field-input" />
              <label class="field-label">Notas</label>
              <textarea v-model="formData.notas" placeholder="Detalles del seguimiento..." rows="3" class="field-input"></textarea>
            </div>
          </div>

          <!-- Step 4: Resumen -->
          <div v-else-if="currentStep === 4" class="step-content">
            <h3 class="step-title">Resumen antes de guardar</h3>
            <div class="summary-box">
              <p><strong>Negocio:</strong> {{ formData.businessName }}</p>
              <p><strong>Contacto:</strong> {{ formData.contactName }} ({{ formData.contactPhone }})</p>
              <p><strong>Zona:</strong> {{ formData.zona }}</p>
              <p><strong>Sector:</strong> {{ formData.sector }}</p>
              <p v-if="formData.campana"><strong>Campaña:</strong> {{ formData.campana }}</p>
              <p v-if="formData.cohorte"><strong>Cohorte:</strong> {{ formData.cohorte }}</p>
              <p><strong>Evento:</strong> {{ eventTypes[formData.eventType]?.name }}</p>
              <p v-if="formData.resultado"><strong>Resultado:</strong> {{ formData.resultado }}</p>
              <p v-if="formData.monto"><strong>Monto:</strong> S/.{{ formData.monto }}</p>
              <p v-if="formData.notas"><strong>Notas:</strong> {{ formData.notas }}</p>
            </div>

            <!-- Copy Button for WhatsApp -->
            <div v-if="whatsappMsg" class="whatsapp-copy">
              <p class="copy-label">📱 Mensaje de WhatsApp:</p>
              <button @click="copyWhatsapp" class="btn-copy-whatsapp">🔗 Copiar mensaje</button>
              <p class="copy-preview">{{ whatsappMsg.substring(0, 120) }}...</p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button v-if="currentStep > 1" @click="previousStep" class="btn-secondary">← Atrás</button>
          <button v-if="currentStep < 4" @click="nextStep" :disabled="!canProceed" class="btn-primary">
            Siguiente →
          </button>
          <button v-else @click="submitForm" class="btn-success">✓ Guardar registro</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed } from "vue";
import { Timestamp } from "firebase/firestore";

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  zonas: { type: Array, default: () => [] },
  sectores: { type: Array, default: () => [] },
  campanas: { type: Array, default: () => [] },
  cohortes: { type: Array, default: () => [] },
});

const emit = defineEmits(["close", "submit"]);

const currentStep = ref(1);
const showToast = ref(false);

const defaultForm = () => ({
  eventType: null,
  statusPipeline: "nuevo",
  businessName: "",
  contactName: "",
  contactPhone: "",
  zona: "",
  sector: "",
  campana: "",
  cohorte: "",
  resultado: "agendado",
  monto: 0,
  notas: "",
  fechaAgendada: "",
  tipoCierre: "advisory",
  tipoSeguimiento: "pre_diagnostico",
  areasCriticasInput: "",  // texto libre → se convierte a array al submit
});

const formData = ref(defaultForm());

const eventTypes = {
  visita: { icon: "👁️", name: "Visita en frío" },
  diagnostico: { icon: "🔍", name: "Diagnóstico" },
  cierre: { icon: "✅", name: "Cierre" },
  seguimiento: { icon: "📋", name: "Seguimiento" },
};

const eventLabels = {
  1: { title: "Evento" },
  2: { title: "Contacto" },
  3: { title: "Detalles" },
  4: { title: "Revisión" },
};

// Determina el statusPipeline inicial según eventType
const inferStatusPipeline = (eventType) => {
  const map = {
    visita: "nuevo",
    diagnostico: "diagnosticado",
    cierre: "cerrado",
    seguimiento: "en_seguimiento",
  };
  return map[eventType] ?? "nuevo";
};

const canProceed = computed(() => {
  if (currentStep.value === 1) return formData.value.eventType !== null;
  if (currentStep.value === 2) {
    return (
      formData.value.businessName.trim() !== "" &&
      formData.value.contactName.trim() !== "" &&
      formData.value.contactPhone.trim() !== ""
    );
  }
  if (currentStep.value === 3) {
    if (formData.value.eventType === "visita") return formData.value.resultado !== null;
    if (formData.value.eventType === "diagnostico") return formData.value.resultado !== null;
    if (formData.value.eventType === "cierre") {
      return formData.value.tipoCierre !== null && formData.value.monto > 0;
    }
    if (formData.value.eventType === "seguimiento") return formData.value.tipoSeguimiento !== null;
  }
  return true;
});

const whatsappMsg = computed(() => {
  const name = formData.value.contactName || "[Nombre]";
  if (formData.value.eventType === "visita") {
    return `Buenos días ${name}, soy José. Te contacto de WALA — hacemos diagnósticos empresariales gratuitos. ¿Tienes 30 minutos esta semana?`;
  }
  if (formData.value.eventType === "diagnostico") {
    return `${name}, aquí está el resumen del diagnóstico. Te propongo un plan de acción. ¿Cuándo nos vemos?`;
  }
  if (formData.value.eventType === "cierre") {
    return `¡Excelente ${name}! Bienvenido a WALA. Empezamos este ${formData.value.fechaAgendada || "[fecha]"}. Próximos pasos...`;
  }
  if (formData.value.eventType === "seguimiento") {
    return `${name}, quería confirmarte que todo está en orden. ¿Alguna duda?`;
  }
  return "";
});

const selectEventType = (type) => {
  formData.value.eventType = type;
  formData.value.statusPipeline = inferStatusPipeline(type);
};

const nextStep = () => { if (canProceed.value) currentStep.value++; };
const previousStep = () => { if (currentStep.value > 1) currentStep.value--; };

const closeModal = () => {
  resetForm();
  emit("close");
};

const resetForm = () => {
  currentStep.value = 1;
  formData.value = defaultForm();
};

const copyWhatsapp = async () => {
  try {
    await navigator.clipboard.writeText(whatsappMsg.value);
    showToast.value = true;
    setTimeout(() => { showToast.value = false; }, 2000);
  } catch (err) {
    console.error("Error copying:", err);
  }
};

const submitForm = () => {
  const fechaEvento = formData.value.fechaAgendada
    ? Timestamp.fromDate(new Date(formData.value.fechaAgendada))
    : Timestamp.now();

  const areasCriticas = formData.value.areasCriticasInput
    ? formData.value.areasCriticasInput.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const payload = {
    docType: "record",
    eventType: formData.value.eventType,
    statusPipeline: formData.value.statusPipeline,
    businessName: formData.value.businessName,
    contactName: formData.value.contactName,
    contactPhone: formData.value.contactPhone,
    zona: formData.value.zona,
    sector: formData.value.sector,
    resultado: formData.value.resultado,
    monto: formData.value.monto ?? 0,
    notas: formData.value.notas,
    fechaEvento,
    fechaAgendada: formData.value.fechaAgendada
      ? Timestamp.fromDate(new Date(formData.value.fechaAgendada))
      : null,
    tipoCierre: formData.value.tipoCierre ?? null,
    tipoSeguimiento: formData.value.tipoSeguimiento ?? null,
    areasCriticas,
    mensajeWhatsapp: whatsappMsg.value,
    campana: formData.value.campana || null,
    cohorte: formData.value.cohorte || null,
  };

  emit("submit", payload);
  closeModal();
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-card {
  background: #fff;
  border-radius: 1.25rem;
  width: 100%;
  max-width: 32rem;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px rgb(0 0 0 / 0.25);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  transition: background 0.15s;
}
.modal-close:hover { background: #f3f4f6; }

.progress-bar { height: 3px; background: #e5e7eb; overflow: hidden; }
.progress-fill { height: 100%; background: #4f46e5; transition: width 0.3s; }

.modal-body { flex: 1; overflow-y: auto; padding: 1.5rem; }

.step-content { display: flex; flex-direction: column; gap: 1rem; }
.step-title { font-size: 1rem; font-weight: 700; color: #111827; margin: 0; }

.event-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.event-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 0.75rem;
  border: 2px solid #e5e7eb;
  background: #fff;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.event-btn:hover { border-color: #6366f1; background: #f0f4ff; }
.event-btn.active { border-color: #4f46e5; background: #eef2ff; color: #4f46e5; }

.field-label { font-size: 0.8rem; font-weight: 600; color: #374151; }
.field-input {
  width: 100%;
  padding: 0.6rem 0.75rem;
  border: 1.5px solid #e5e7eb;
  border-radius: 0.65rem;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.15s;
  box-sizing: border-box;
}
.field-input:focus { border-color: #6366f1; }

.field-select {
  width: 100%;
  padding: 0.6rem 0.75rem;
  border: 1.5px solid #e5e7eb;
  border-radius: 0.65rem;
  font-size: 0.875rem;
  background: #fff;
  cursor: pointer;
  outline: none;
}

.radio-group { display: flex; flex-direction: column; gap: 0.5rem; }
.radio-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: background 0.15s;
}
.radio-item:hover { background: #f9fafb; }
.radio-item input { cursor: pointer; }

.summary-box {
  background: #f9fafb;
  border-radius: 0.75rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
}
.summary-box p { font-size: 0.875rem; margin: 0.4rem 0; color: #374151; }

.whatsapp-copy {
  background: #ecfdf5;
  border: 1px solid #6ee7b7;
  border-radius: 0.75rem;
  padding: 1rem;
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.copy-label { font-size: 0.875rem; font-weight: 600; color: #065f46; margin: 0; }
.btn-copy-whatsapp {
  padding: 0.6rem;
  border-radius: 0.65rem;
  border: 1.5px solid #6ee7b7;
  background: #fff;
  color: #059669;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-copy-whatsapp:hover { background: #ecfdf5; }
.copy-preview { font-size: 0.75rem; color: #6b7280; margin: 0; font-style: italic; }

.modal-footer {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1rem 1.5rem 1.5rem;
  border-top: 1px solid #f3f4f6;
}

.btn-secondary {
  flex: 1;
  padding: 0.6rem 1rem;
  border-radius: 0.75rem;
  border: 1.5px solid #e5e7eb;
  background: #f9fafb;
  color: #374151;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-secondary:hover { background: #f3f4f6; }

.btn-primary {
  flex: 1;
  padding: 0.6rem 1rem;
  border-radius: 0.75rem;
  background: #4f46e5;
  border: none;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-primary:hover { background: #4338ca; }
.btn-primary:disabled { background: #c7d2fe; cursor: not-allowed; }

.btn-success {
  flex: 1;
  padding: 0.6rem 1rem;
  border-radius: 0.75rem;
  background: #059669;
  border: none;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-success:hover { background: #047857; }
</style>
