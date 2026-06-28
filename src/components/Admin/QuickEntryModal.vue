<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
      <div class="modal-card">
        <!-- Header -->
        <div class="modal-header">
          <h2 class="modal-title">
            Registrar Visita en Frío
          </h2>
          <button @click="closeModal" class="modal-close">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Progress Bar -->
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: (currentStep / 3) * 100 + '%' }"></div>
        </div>

        <!-- Body -->
        <div class="modal-body">
          <!-- Step 1: Datos Base del Contacto -->
          <div v-if="currentStep === 1" class="step-content">
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
            <div class="phone-input-group">
              <!-- Custom Country Dropdown -->
              <div class="custom-select-container">
                <div class="custom-select-trigger" @click="toggleDropdown">
                  <img :src="`https://flagcdn.com/w20/${selectedCountry.iso}.png`" :alt="selectedCountry.iso" class="flag-icon" />
                  <span>{{ selectedCountry.dial }}</span>
                  <svg class="h-4 w-4 arrow" :class="{ open: showDropdown }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                
                <div v-if="showDropdown" class="custom-select-menu">
                  <div 
                    v-for="country in countries" 
                    :key="country.iso" 
                    class="custom-select-option"
                    @click="selectCountry(country)"
                  >
                    <img :src="`https://flagcdn.com/w20/${country.iso}.png`" :alt="country.iso" class="flag-icon" />
                    <span class="country-name">{{ country.name }}</span>
                    <span class="country-dial">{{ country.dial }}</span>
                  </div>
                </div>
                <!-- Backdrop to close dropdown -->
                <div v-if="showDropdown" class="dropdown-backdrop" @click="showDropdown = false"></div>
              </div>

              <input
                v-model="formData.localPhone"
                type="tel"
                placeholder="987 654 321"
                class="field-input phone-number"
              />
            </div>

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
          </div>

          <!-- Step 2: Clasificación y Resultado (Plan Junio 2026) -->
          <div v-else-if="currentStep === 2" class="step-content">
            <h3 class="step-title">Clasificación de Negocio</h3>
            
            <label class="field-label">¿Cuánto tiempo lleva con el negocio?</label>
            <div class="radio-group">
              <label class="radio-item">
                <input v-model="formData.tiempoNegocio" type="radio" value="less_1_year" />
                <span>Menos de 1 año (Peldaño 1)</span>
              </label>
              <label class="radio-item">
                <input v-model="formData.tiempoNegocio" type="radio" value="more_1_year" />
                <span>1 año o más (Seguir analizando)</span>
              </label>
            </div>

            <label class="field-label">¿Cómo lleva el control de sus ventas y gastos?</label>
            <div class="radio-group">
              <label class="radio-item">
                <input v-model="formData.metodoControl" type="radio" value="head" />
                <span>En la cabeza / Desordenado (Dolor real)</span>
              </label>
              <label class="radio-item">
                <input v-model="formData.metodoControl" type="radio" value="notebook_excel" />
                <span>Cuaderno / Excel / Más o menos (Algo de control)</span>
              </label>
              <label class="radio-item">
                <input v-model="formData.metodoControl" type="radio" value="system" />
                <span>Sistema / Ordenado (Sin urgencia visible)</span>
              </label>
            </div>

            <!-- Peldaño sugerido dinámico -->
            <div v-if="peldanoSugerido" class="suggested-banner">
              <span class="banner-title">Peldaño sugerido por Plan:</span>
              <span class="banner-value">{{ peldanoSugerido }}</span>
            </div>

            <h3 class="step-title mt-4">Resultado de la Visita</h3>
            <div class="radio-group">
              <label class="radio-item">
                <input v-model="formData.resultadoVisita" type="radio" value="solo_tarjeta" />
                <span>Solo tarjeta entregada (Sin tiempo)</span>
              </label>
              <label class="radio-item">
                <input v-model="formData.resultadoVisita" type="radio" value="prueba_activada" />
                <span>Prueba 7d activada</span>
              </label>
              <label class="radio-item">
                <input v-model="formData.resultadoVisita" type="radio" value="diagnostico_hablado" />
                <span>Se habló de diagnóstico (Interesado)</span>
              </label>
              <label class="radio-item">
                <input v-model="formData.resultadoVisita" type="radio" value="diagnostico_agendado" />
                <span>Diagnóstico Agendado</span>
              </label>
            </div>

            <template v-if="formData.resultadoVisita === 'diagnostico_agendado'">
              <label class="field-label">Fecha agendada para el diagnóstico</label>
              <input v-model="formData.fechaAgendada" type="date" class="field-input" />
            </template>

            <label class="field-label">Notas / Observaciones</label>
            <textarea v-model="formData.notas" placeholder="Ej: Negocio de comida con local fijo, requiere costeo rápido..." rows="2" class="field-input"></textarea>
          </div>

          <!-- Step 3: Resumen -->
          <div v-else-if="currentStep === 3" class="step-content">
            <h3 class="step-title">Resumen antes de guardar</h3>
            <div class="summary-box">
              <p><strong>Negocio:</strong> {{ formData.businessName }}</p>
              <p><strong>Contacto:</strong> {{ formData.contactName }} ({{ fullPhone }})</p>
              <p><strong>Zona:</strong> {{ formData.zona }}</p>
              <p><strong>Sector:</strong> {{ formData.sector }}</p>
              <p><strong>Tiempo operación:</strong> {{ formData.tiempoNegocio === 'less_1_year' ? 'Menos de 1 año' : '1 año o más' }}</p>
              <p><strong>Control actual:</strong> {{ formatControlLabel(formData.metodoControl) }}</p>
              <p><strong>Peldaño Sugerido:</strong> {{ peldanoSugerido }}</p>
              <p><strong>Resultado visita:</strong> {{ formatOutcomeLabel(formData.resultadoVisita) }}</p>
              <p v-if="formData.resultadoVisita === 'diagnostico_agendado'"><strong>Fecha agendada:</strong> {{ formData.fechaAgendada }}</p>
              <p v-if="formData.notas"><strong>Notas:</strong> {{ formData.notas }}</p>
            </div>

            <!-- Copy Button for WhatsApp -->
            <div v-if="whatsappMsg" class="whatsapp-copy">
              <p class="copy-label">📱 Mensaje de WhatsApp:</p>
              <button @click="copyWhatsapp" class="btn-copy-whatsapp">
                {{ showToast ? '✓ Copiado' : '🔗 Copiar mensaje' }}
              </button>
              <p class="copy-preview">{{ whatsappMsg.substring(0, 120) }}...</p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button v-if="currentStep > 1" @click="previousStep" class="btn-secondary">← Atrás</button>
          <button v-if="currentStep < 3" @click="nextStep" :disabled="!canProceed" class="btn-primary">
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
  sectores: { type: Array, default: () => [] }
});

const emit = defineEmits(["close", "submit"]);

const currentStep = ref(1);
const showToast = ref(false);
const showDropdown = ref(false);

const countries = [
  { iso: 'pe', dial: '+51', name: 'Perú' },
  { iso: 'mx', dial: '+52', name: 'México' },
  { iso: 'ar', dial: '+54', name: 'Argentina' },
  { iso: 'cl', dial: '+56', name: 'Chile' },
  { iso: 'co', dial: '+57', name: 'Colombia' },
  { iso: 'bo', dial: '+591', name: 'Bolivia' },
  { iso: 'ec', dial: '+593', name: 'Ecuador' },
  { iso: 'es', dial: '+34', name: 'España' },
  { iso: 'us', dial: '+1', name: 'Estados Unidos' },
];

const selectedCountry = ref(countries[0]); // Default Perú

const defaultForm = () => ({
  businessName: "",
  contactName: "",
  localPhone: "",
  zona: "",
  sector: "",
  notas: "",
  fechaAgendada: "",
  tiempoNegocio: "",
  metodoControl: "",
  resultadoVisita: "",
});

const formData = ref(defaultForm());

const fullPhone = computed(() => {
  return `${selectedCountry.value.dial} ${formData.value.localPhone}`.trim();
});

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

const selectCountry = (country) => {
  selectedCountry.value = country;
  showDropdown.value = false;
};

const peldanoSugerido = computed(() => {
  if (!formData.value.tiempoNegocio) return "";
  if (formData.value.tiempoNegocio === "less_1_year") {
    return "Peldaño 1: Entrada gratuita (Prueba 7d)";
  }
  if (formData.value.tiempoNegocio === "more_1_year") {
    if (formData.value.metodoControl === "system") {
      return "Peldaño 2: WALA Premium (S/49/mes)";
    }
    return "Peldaño 3: Programa Premium (S/450)";
  }
  return "";
});

const canProceed = computed(() => {
  if (currentStep.value === 1) {
    return (
      formData.value.businessName.trim() !== "" &&
      formData.value.contactName.trim() !== "" &&
      formData.value.localPhone.trim() !== ""
    );
  }
  if (currentStep.value === 2) {
    return (
      formData.value.tiempoNegocio !== "" &&
      formData.value.metodoControl !== "" &&
      formData.value.resultadoVisita !== "" &&
      (formData.value.resultadoVisita !== "diagnostico_agendado" || formData.value.fechaAgendada !== "")
    );
  }
  return true;
});

const whatsappMsg = computed(() => {
  const name = formData.value.contactName || "[Nombre]";
  if (formData.value.resultadoVisita === "prueba_activada") {
    return `Hola ${name}. Soy José, el de WALA. Te comparto lo que te comenté: nuestro copiloto te ayuda a ordenar tu negocio, entender tus números y tomar mejores decisiones. Te paso el acceso para probarlo gratis 7 días. ¿Me confirmas si pudiste ingresar?`;
  }
  if (formData.value.resultadoVisita === "diagnostico_hablado") {
    return `Hola ${name}. Soy José, el de WALA. Me dio gusto conversar contigo. Como te comentaba, te propongo hacer un diagnóstico gratuito de 20 minutos de tu negocio. Avísame qué día te queda mejor esta semana.`;
  }
  if (formData.value.resultadoVisita === "diagnostico_agendado") {
    return `Hola ${name}, te escribo para confirmarte que tenemos agendado tu diagnóstico gratuito de WALA para el ${formData.value.fechaAgendada || 'día programado'}. ¡Nos vemos!`;
  }
  // Default / solo_tarjeta
  return `Hola ${name}. Soy José, el de WALA. Te comparto lo que te comenté: nuestro copiloto te ayuda a ordenar tu negocio, entender tus números y tomar mejores decisiones. Si quieres, te paso el acceso para probarlo gratis 7 días o agendamos el diagnóstico para ver qué te conviene más. ¿Qué te queda mejor esta semana?`;
});

const formatControlLabel = (val) => {
  const map = {
    head: "En la cabeza / Desordenado",
    notebook_excel: "Cuaderno / Excel / Más o menos",
    system: "Sistema / Ordenado"
  };
  return map[val] || val;
};

const formatOutcomeLabel = (val) => {
  const map = {
    solo_tarjeta: "Solo tarjeta entregada",
    prueba_activada: "Prueba 7d activada",
    diagnostico_hablado: "Se habló de diagnóstico",
    diagnostico_agendado: "Diagnóstico Agendado"
  };
  return map[val] || val;
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
  selectedCountry.value = countries[0];
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
  const fechaEvento = Timestamp.now();
  let statusPipeline = "tarjeta_entregada";
  let eventType = "visita";
  let resultado = "no_agendado";

  if (formData.value.resultadoVisita === "diagnostico_agendado") {
    statusPipeline = "agendado";
    eventType = "visita";
    resultado = "agendado";
  } else if (formData.value.resultadoVisita === "prueba_activada") {
    statusPipeline = "prueba_activa";
    eventType = "visita";
    resultado = "no_agendado";
  }

  let pSugeridoKey = "";
  if (formData.value.tiempoNegocio === "less_1_year") {
    pSugeridoKey = "peldano_1";
  } else if (formData.value.tiempoNegocio === "more_1_year") {
    if (formData.value.metodoControl === "system") {
      pSugeridoKey = "peldano_2";
    } else {
      pSugeridoKey = "peldano_3";
    }
  }

  const payload = {
    docType: "record",
    eventType,
    statusPipeline,
    businessName: formData.value.businessName,
    contactName: formData.value.contactName,
    contactPhone: fullPhone.value.replace(/\s+/g, ''), // Sin espacios
    zona: formData.value.zona,
    sector: formData.value.sector,
    resultado,
    monto: 0,
    notas: formData.value.notas,
    fechaEvento,
    fechaAgendada: formData.value.resultadoVisita === "diagnostico_agendado" && formData.value.fechaAgendada
      ? Timestamp.fromDate(new Date(formData.value.fechaAgendada))
      : null,
    tipoCierre: null,
    tipoSeguimiento: null,
    areasCriticas: [],
    mensajeWhatsapp: whatsappMsg.value,
    // Nuevos campos de clasificación Plan Junio 2026
    tiempoNegocio: formData.value.tiempoNegocio,
    metodoControl: formData.value.metodoControl,
    resultadoVisita: formData.value.resultadoVisita,
    peldanoSugerido: pSugeridoKey
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

/* Phone input styles */
.phone-input-group {
  display: flex;
  gap: 0.5rem;
}

/* Custom Select Styles */
.custom-select-container {
  position: relative;
  flex: 0 0 auto;
  width: 120px;
}

.custom-select-trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.75rem;
  border: 1.5px solid #e5e7eb;
  border-radius: 0.65rem;
  background: #fff;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  height: 100%;
  box-sizing: border-box;
  transition: border-color 0.15s;
}

.custom-select-trigger:hover {
  border-color: #6366f1;
}

.flag-icon {
  width: 20px;
  height: 14px;
  object-fit: cover;
  border-radius: 2px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.arrow {
  margin-left: auto;
  transition: transform 0.2s;
  color: #9ca3af;
}

.arrow.open {
  transform: rotate(180deg);
}

.custom-select-menu {
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  width: 240px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  z-index: 100;
  max-height: 300px;
  overflow-y: auto;
  padding: 0.5rem;
}

.custom-select-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background 0.15s;
}

.custom-select-option:hover {
  background: #f3f4f6;
}

.country-name {
  flex: 1;
  font-size: 0.875rem;
  color: #374151;
}

.country-dial {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.dropdown-backdrop {
  position: fixed;
  inset: 0;
  z-index: 90;
}

.phone-number {
  flex: 1;
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

.suggested-banner {
  background: #e0e7ff;
  border: 1px solid #c7d2fe;
  border-radius: 0.75rem;
  padding: 0.85rem;
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
}
.banner-title {
  font-size: 0.75rem;
  font-weight: 700;
  color: #4338ca;
  text-transform: uppercase;
}
.banner-value {
  font-size: 0.9rem;
  font-weight: 800;
  color: #312e81;
  margin-top: 0.15rem;
}

.mt-4 {
  margin-top: 1rem;
}

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
