<template>
  <div class="evolucion-section">
    <div class="section-header section-header-with-toggle">
      <div class="section-header-main">
        <div class="section-num">3</div>
        <div>
          <div class="section-title">Evaluación final del programa</div>
          <div class="section-desc">
            Comparativa de puntajes por área y conclusiones del proceso completo
          </div>
        </div>
      </div>

      <button
        type="button"
        class="section-toggle-btn section-toggle-inline"
        :aria-expanded="isExpanded"
        aria-controls="consulting-resumen-content"
        @click="isExpanded = !isExpanded"
      >
        {{ isExpanded ? "Ocultar contenido" : "Mostrar contenido" }}
      </button>
    </div>

    <div v-show="isExpanded" id="consulting-resumen-content">
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
              v-model="props.finalByArea[period.key][area.key]"
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
            v-model="props.closing.achievements"
            placeholder="¿Qué cambió concretamente en su negocio?"
          />
        </div>
        <div class="cierre-block">
          <label>Áreas que quedan como tarea pendiente</label>
          <textarea
            v-model="props.closing.pending"
            placeholder="¿Qué necesita continuar trabajando?"
          />
        </div>
        <div class="cierre-block">
          <label>Recomendación del asesor para continuar</label>
          <textarea
            v-model="props.closing.recommendation"
            placeholder="Siguientes pasos recomendados"
          />
        </div>
        <div class="cierre-block">
          <label>Testimonio / palabras del emprendedor al cierre</label>
          <textarea
            v-model="props.closing.testimony"
            placeholder="Percepción del emprendedor"
          />
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
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  areas: {
    type: Array,
    required: true,
  },
  periods: {
    type: Array,
    required: true,
  },
  finalByArea: {
    type: Object,
    required: true,
  },
  closing: {
    type: Object,
    required: true,
  },
});

const isExpanded = ref(false);
</script>
