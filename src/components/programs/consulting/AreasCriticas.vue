<template>
  <div class="section">
    <div class="section-header">
      <div class="section-num">2</div>
      <div>
        <div class="section-title">Áreas críticas identificadas</div>
        <div class="section-desc">
          Las 3 áreas prioritarias definidas por puntaje y por lo que el emprendedor
          manifiesta
        </div>
      </div>
    </div>

    <div class="criticas-grid">
      <div v-for="(critical, idx) in props.modelValue" :key="idx" class="critica-card">
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
</template>

<script setup>
const props = defineProps({
  areas: {
    type: Array,
    required: true,
  },
  modelValue: {
    type: Array,
    required: true,
  },
});

</script>
