<template>
  <div>
    <div class="cover-title">Plan de<br />Seguimiento</div>
    <div class="cover-sub">
      Registro de diagnóstico, planes de acción y evolución por ciclo
    </div>

    <div class="datos-grid">
      <div class="dato-cell wide" v-if="!props.readOnly">
        <div class="dato-label">Nombre del negocio</div>
        <input
          v-model="props.modelValue.businessName"
          class="dato-input"
          type="text"
          :readonly="props.readOnly"
          :disabled="props.readOnly"
          :tabindex="props.readOnly ? -1 : 0"
        />
      </div>

      <div class="dato-cell wide">
        <div class="dato-label">Asesor/a responsable</div>
        <input
          v-model="props.modelValue.facilitatorName"
          class="dato-input"
          type="text"
          :readonly="props.readOnly"
          :disabled="props.readOnly"
          :tabindex="props.readOnly ? -1 : 0"
        />
      </div>
      <!-- <div class="dato-cell">
        <div class="dato-label">Rubro / sector</div>
        <input
          v-model="props.modelValue.sector"
          class="dato-input"
          type="text"
          :readonly="props.readOnly"
          :disabled="props.readOnly"
          :tabindex="props.readOnly ? -1 : 0"
        />
      </div> -->
      <div class="dato-cell wide" v-if="!props.readOnly">
        <div class="dato-label">Nombre del emprendedor/a</div>
        <input
          v-model="props.modelValue.entrepreneurName"
          class="dato-input"
          type="text"
          :readonly="props.readOnly"
          :disabled="props.readOnly"
          :tabindex="props.readOnly ? -1 : 0"
        />
      </div>

      <div class="dato-cell">
        <div class="dato-label">Fecha de inicio</div>
        <input
          v-model="props.modelValue.startDate"
          class="dato-input"
          type="date"
          :readonly="props.readOnly"
          :disabled="props.readOnly"
          :tabindex="props.readOnly ? -1 : 0"
        />
      </div>
      <!-- <div class="dato-cell">
        <div class="dato-label">Contacto</div>
        <input
          v-model="props.modelValue.contact"
          class="dato-input"
          type="text"
          :readonly="props.readOnly"
          :disabled="props.readOnly"
          :tabindex="props.readOnly ? -1 : 0"
        />
      </div> -->

      <!-- <div class="dato-cell">
        <div class="dato-label">Programa</div>
        <input
          v-model="props.modelValue.programName"
          class="dato-input"
          type="text"
          :readonly="props.readOnly"
          :disabled="props.readOnly"
          :tabindex="props.readOnly ? -1 : 0"
        />
      </div> -->
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  readOnly: {
    type: Boolean,
    default: false,
  },
});
</script>
