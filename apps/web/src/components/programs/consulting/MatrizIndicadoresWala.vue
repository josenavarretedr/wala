<template>
  <div class="section">
    <div class="section-header section-header-with-toggle">
      <div class="section-header-main">
        <div class="section-num">1</div>
        <div>
          <div class="section-title">Diagnóstico inicial</div>
          <div class="section-desc">
            Sesión 0 · Aplicación de la matriz de desempeño · Escala 0–3
          </div>
        </div>
      </div>

      <button
        type="button"
        class="section-toggle-btn section-toggle-inline"
        :aria-expanded="isExpanded"
        aria-controls="matriz-indicadores-content"
        @click="isExpanded = !isExpanded"
      >
        {{ isExpanded ? "Ocultar contenido" : "Mostrar contenido" }}
      </button>
    </div>

    <div
      v-show="isExpanded"
      id="matriz-indicadores-content"
      class="matriz-wrap"
    >
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
                  v-model.number="props.modelValue[indicator.code][period.key]"
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
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  periods: {
    type: Array,
    required: true,
  },
  areas: {
    type: Array,
    required: true,
  },
  modelValue: {
    type: Object,
    required: true,
  },
});

const isExpanded = ref(false);

function getTotal(periodKey) {
  return Object.values(props.modelValue).reduce((sum, scoreByPeriod) => {
    if (typeof scoreByPeriod[periodKey] === "number") {
      return sum + scoreByPeriod[periodKey];
    }
    return sum;
  }, 0);
}
</script>
