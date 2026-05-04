<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
      <div class="modal-card">
        <div class="modal-header">
          <h2 class="modal-title">Editar Lead</h2>
          <button @click="closeModal" class="modal-close">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="field-group">
            <label class="field-label">Nombre del negocio</label>
            <input v-model="formData.businessName" type="text" class="field-input" />
          </div>

          <div class="field-group">
            <label class="field-label">Nombre del contacto</label>
            <input v-model="formData.contactName" type="text" class="field-input" />
          </div>

          <div class="field-group">
            <label class="field-label">Teléfono (WhatsApp)</label>
            <input v-model="formData.contactPhone" type="tel" class="field-input" placeholder="Ej: +51 987 654 321" />
            <small class="field-hint">Incluye el código de país si no es de Perú (ej: +52, +57). Si es de Perú (9 dígitos) se añadirá +51 automáticamente.</small>
          </div>

          <div class="field-group">
            <label class="field-label">Zona</label>
            <select v-model="formData.zona" class="field-select">
              <option value="">Seleccionar zona</option>
              <option v-for="zona in zonas" :key="zona" :value="zona">{{ zona }}</option>
            </select>
          </div>

          <div class="field-group">
            <label class="field-label">Sector</label>
            <select v-model="formData.sector" class="field-select">
              <option value="">Seleccionar sector</option>
              <option v-for="sector in sectores" :key="sector" :value="sector">{{ sector }}</option>
            </select>
          </div>
          
          <div class="field-group">
            <label class="field-label">Áreas críticas (separadas por coma)</label>
            <input v-model="formData.areasCriticasText" type="text" class="field-input" placeholder="Ej: Costeo, Inventario" />
          </div>

        </div>

        <div class="modal-footer">
          <button @click="closeModal" class="btn-secondary">Cancelar</button>
          <button @click="submitForm" class="btn-primary">Guardar Cambios</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  leadData: { type: Object, default: () => ({}) },
  zonas: { type: Array, default: () => [] },
  sectores: { type: Array, default: () => [] },
});

const emit = defineEmits(["close", "submit"]);

const formData = ref({});

watch(() => props.isOpen, (newVal) => {
  if (newVal && props.leadData) {
    // Inicializar datos al abrir
    let phone = props.leadData.contactPhone || "";
    // Limpiar el 51 si ya lo tiene para que no se duplique visualmente con el prefijo
    if (phone.startsWith("51") && phone.length === 11) {
      phone = phone.substring(2);
    } else if (phone.startsWith("+51")) {
      phone = phone.substring(3).trim();
    }
    
    formData.value = {
      ...props.leadData,
      contactPhone: phone,
      areasCriticasText: (props.leadData.areasCriticas || []).join(', ')
    };
  }
});

const closeModal = () => {
  emit("close");
};

const submitForm = () => {
  // Asegurarnos que el teléfono quede guardado limpio o con 51
  let cleanPhone = formData.value.contactPhone.replace(/\D/g, "");
  if (cleanPhone.length === 9) {
    cleanPhone = "51" + cleanPhone; // Guardar internamente con 51
  }

  const areas = formData.value.areasCriticasText
    ? formData.value.areasCriticasText.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  emit("submit", {
    recordId: props.leadData.id,
    businessName: formData.value.businessName,
    contactName: formData.value.contactName,
    contactPhone: cleanPhone, // Guardamos el número ya formateado con 51
    zona: formData.value.zona,
    sector: formData.value.sector,
    areasCriticas: areas
  });
  closeModal();
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
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
  max-width: 28rem;
  box-shadow: 0 25px 50px rgb(0 0 0 / 0.25);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
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

.modal-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-height: 70vh;
  overflow-y: auto;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.field-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #374151;
}

.field-input, .field-select {
  width: 100%;
  padding: 0.6rem 0.75rem;
  border: 1.5px solid #e5e7eb;
  border-radius: 0.65rem;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.15s;
  box-sizing: border-box;
  background: #fff;
}
.field-input:focus, .field-select:focus {
  border-color: #6366f1;
}


.field-hint {
  font-size: 0.75rem;
  color: #6b7280;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  border-top: 1px solid #f3f4f6;
}

.btn-secondary {
  padding: 0.6rem 1rem;
  border-radius: 0.65rem;
  border: 1.5px solid #e5e7eb;
  background: #fff;
  color: #374151;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-secondary:hover { background: #f9fafb; }

.btn-primary {
  padding: 0.6rem 1.25rem;
  border-radius: 0.65rem;
  background: #4f46e5;
  border: none;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-primary:hover { background: #4338ca; }
</style>
