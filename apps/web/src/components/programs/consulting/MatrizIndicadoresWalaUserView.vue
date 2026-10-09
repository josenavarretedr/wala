<template>
  <div class="level-matrix-section">
    <div class="section-header">
      <div class="section-num">1</div>
      <div class="section-header-main">
        <div>
          <h2 class="section-title">Matriz de Niveles de Madurez</h2>
          <p class="section-desc">Evolución por período evaluativo</p>
        </div>
      </div>
    </div>

    <div class="matrix-layout">
      <div class="level-matrix-container">
        <div
          class="area-selector-xs"
          role="group"
          aria-label="Selector de áreas"
        >
          <div class="area-selector-head">
            <span class="area-selector-title">Áreas visibles</span>
            <button
              type="button"
              class="area-chip area-chip-all"
              :class="{ 'is-active': isAllAreasSelected() }"
              @click="toggleAllAreas"
            >
              {{ getAllButtonLabel() }}
            </button>
          </div>
          <div class="area-chip-list">
            <button
              v-for="area in props.areas"
              :key="area.key"
              type="button"
              class="area-chip"
              :class="{ 'is-active': selectedAreaKeys.includes(area.key) }"
              @click="toggleAreaSelection(area.key)"
            >
              {{ formatAreaLabel(area.title) }}
            </button>
          </div>
        </div>

        <div class="chart-wrapper">
          <canvas ref="chartCanvasLg" id="canvasLg" class="canvas-lg"></canvas>
          <canvas ref="chartCanvasXs" id="canvasXs" class="canvas-xs"></canvas>
          <div v-if="selectedAreaKeys.length === 0" class="chart-empty-xs">
            Selecciona una o más áreas para visualizar el gráfico.
          </div>
        </div>
      </div>

      <!-- Leyenda de niveles -->
      <div class="level-legend">
        <div class="legend-header">
          <div class="legend-title">📊 Guía de Niveles de Madurez</div>
          <p class="legend-subtitle">Color de barra = nivel alcanzado</p>
        </div>
        <div class="legend-items">
          <div class="legend-item">
            <span class="legend-color aprend"></span>
            <div class="legend-item-text">
              <div class="legend-level">🌱 Aprendiz</div>
              <div class="legend-range">0.0 – 0.4</div>
            </div>
          </div>
          <div class="legend-item">
            <span class="legend-color emprend"></span>
            <div class="legend-item-text">
              <div class="legend-level">🚀 Emprendedor</div>
              <div class="legend-range">0.5 – 1.4</div>
            </div>
          </div>
          <div class="legend-item">
            <span class="legend-color gerente"></span>
            <div class="legend-item-text">
              <div class="legend-level">📊 Gerente</div>
              <div class="legend-range">1.5 – 2.4</div>
            </div>
          </div>
          <div class="legend-item">
            <span class="legend-color empresario"></span>
            <div class="legend-item-text">
              <div class="legend-level">🏆 Empresario</div>
              <div class="legend-range">2.5 – 3.0</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import Chart from "chart.js/auto";
import { getDatasetsByPeriod } from "@/composables/useConsultingMetrics";

const props = defineProps({
  modelValue: {
    type: Object,
    required: true, // scores
  },
  areas: {
    type: Array,
    required: true,
  },
  periods: {
    type: Array,
    required: true,
  },
});

const chartCanvasLg = ref(null);
const chartCanvasXs = ref(null);
const selectedAreaKeys = ref([]);
let chartLgInstance = null;
let chartXsInstance = null;
let mediaQuery = null;

function getAllAreaKeys() {
  return props.areas.map((area) => area.key);
}

function syncSelectedAreasWithProps() {
  const availableKeys = new Set(getAllAreaKeys());
  const normalized = selectedAreaKeys.value.filter((key) =>
    availableKeys.has(key),
  );
  selectedAreaKeys.value = normalized;
}

function isAreaSelected(areaKey) {
  return selectedAreaKeys.value.includes(areaKey);
}

function selectAllAreas() {
  selectedAreaKeys.value = getAllAreaKeys();
}

function clearAllAreas() {
  selectedAreaKeys.value = [];
}

function toggleAllAreas() {
  if (isAllAreasSelected()) {
    clearAllAreas();
    return;
  }

  selectAllAreas();
}

function toggleAreaSelection(areaKey) {
  if (isAreaSelected(areaKey)) {
    selectedAreaKeys.value = selectedAreaKeys.value.filter(
      (key) => key !== areaKey,
    );
    return;
  }

  selectedAreaKeys.value = [...selectedAreaKeys.value, areaKey];
}

function formatAreaLabel(title) {
  return String(title || "").replace(/^\d+\.\s*/, "");
}

function formatChartLabelXs(title) {
  const clean = formatAreaLabel(title);

  if (clean.length <= 16) return clean;

  const words = clean.split(" ");
  const firstLine = [];
  const secondLine = [];

  words.forEach((word) => {
    const target = firstLine.join(" ").length < 14 ? firstLine : secondLine;
    target.push(word);
  });

  return [firstLine.join(" "), secondLine.join(" ")].filter(Boolean);
}

function isAllAreasSelected() {
  return selectedAreaKeys.value.length === props.areas.length;
}

function getAllButtonLabel() {
  return isAllAreasSelected() ? "Ninguno" : "Todos";
}

function getFilteredChartDataForXs(baseData) {
  const selectedSet = new Set(selectedAreaKeys.value);
  const selectedIndexes = props.areas
    .map((area, index) => (selectedSet.has(area.key) ? index : -1))
    .filter((index) => index !== -1);

  if (selectedIndexes.length === baseData.labels.length) {
    return baseData;
  }

  return {
    labels: selectedIndexes.map((index) =>
      formatChartLabelXs(baseData.labels[index]),
    ),
    datasets: baseData.datasets.map((dataset) => ({
      ...dataset,
      data: selectedIndexes.map((index) => dataset.data[index]),
      backgroundColor: Array.isArray(dataset.backgroundColor)
        ? selectedIndexes.map((index) => dataset.backgroundColor[index])
        : dataset.backgroundColor,
      borderColor: Array.isArray(dataset.borderColor)
        ? selectedIndexes.map((index) => dataset.borderColor[index])
        : dataset.borderColor,
    })),
  };
}

function buildLevelBandsPlugin(indexAxis) {
  return {
    id: `levelBands-${indexAxis}`,
    afterDatasetsDraw(chart) {
      const xScale = chart.scales.x;
      const yScale = chart.scales.y;
      const ctx = chart.ctx;

      const bands = [
        { min: 0, max: 0.4, color: "rgba(255, 68, 68, 0.05)" },
        { min: 0.4, max: 1.5, color: "rgba(255, 165, 0, 0.05)" },
        { min: 1.5, max: 2.5, color: "rgba(0, 204, 0, 0.05)" },
        { min: 2.5, max: 3, color: "rgba(0, 204, 204, 0.05)" },
      ];

      bands.forEach((band) => {
        ctx.fillStyle = band.color;

        if (indexAxis === "y") {
          const x0 = xScale.getPixelForValue(band.min);
          const x1 = xScale.getPixelForValue(band.max);
          ctx.fillRect(x0, yScale.top, x1 - x0, yScale.bottom - yScale.top);
          return;
        }

        const y0 = yScale.getPixelForValue(band.min);
        const y1 = yScale.getPixelForValue(band.max);
        ctx.fillRect(xScale.left, y1, xScale.right - xScale.left, y0 - y1);
      });
    },
  };
}

function buildChartOptions(indexAxis) {
  const isHorizontal = indexAxis === "y";

  return {
    indexAxis,
    responsive: true,
    maintainAspectRatio: isHorizontal,
    layout: {
      padding: {
        left: isHorizontal ? 10 : 8,
        right: isHorizontal ? 20 : 8,
        top: isHorizontal ? 10 : 6,
        bottom: isHorizontal ? 10 : 6,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        padding: 14,
        cornerRadius: 8,
        titleFont: {
          size: 13,
          weight: "bold",
        },
        bodyFont: {
          size: 12,
        },
        callbacks: {
          title: function (context) {
            return context[0].label;
          },
          label: function (context) {
            const value = isHorizontal ? context.parsed.x : context.parsed.y;
            const levelLabel = mapValueToLevel(value);
            return `${context.dataset.label}: ${value.toFixed(2)} • ${levelLabel}`;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: isHorizontal ? 3 : undefined,
        ticks: {
          font: {
            size: 11,
          },
          color: "#6B7280",
          stepSize: isHorizontal ? 0.5 : undefined,
          maxRotation: 0,
          minRotation: 0,
          autoSkip: true,
        },
        grid: {
          color: "#E5E7EB",
          lineWidth: 1,
        },
        title: {
          display: isHorizontal,
          text: "Promedio por Área (0-3)",
          font: {
            size: 12,
            weight: "500",
          },
          color: "#1F2937",
        },
      },
      y: {
        beginAtZero: !isHorizontal,
        max: !isHorizontal ? 3 : undefined,
        ticks: {
          font: {
            size: 11,
            weight: "500",
          },
          color: "#374151",
          padding: 8,
          stepSize: !isHorizontal ? 0.5 : undefined,
        },
        grid: {
          display: isHorizontal ? false : true,
          color: !isHorizontal ? "#E5E7EB" : undefined,
          lineWidth: !isHorizontal ? 1 : undefined,
        },
        title: {
          display: false,
          text: "Promedio por Área (0-3)",
          font: {
            size: 12,
            weight: "500",
          },
          color: "#1F2937",
        },
      },
    },
    elements: {
      bar: {
        borderWidth: 2,
        borderRadius: 4,
      },
    },
  };
}

function destroyCharts() {
  if (chartLgInstance) {
    chartLgInstance.destroy();
    chartLgInstance = null;
  }

  if (chartXsInstance) {
    chartXsInstance.destroy();
    chartXsInstance = null;
  }
}

function initChartsByViewport() {
  if (!chartCanvasLg.value || !chartCanvasXs.value) return;

  const chartData = getDatasetsByPeriod(
    props.modelValue,
    props.areas,
    props.periods,
  );

  const isLgUp = window.matchMedia("(min-width: 1024px)").matches;
  destroyCharts();

  if (isLgUp) {
    const ctxLg = chartCanvasLg.value.getContext("2d");
    chartLgInstance = new Chart(ctxLg, {
      type: "bar",
      data: chartData,
      options: buildChartOptions("y"),
      plugins: [buildLevelBandsPlugin("y")],
    });
    return;
  }

  const ctxXs = chartCanvasXs.value.getContext("2d");
  const chartDataXs = getFilteredChartDataForXs(chartData);

  if (!chartDataXs.labels.length) {
    return;
  }

  chartXsInstance = new Chart(ctxXs, {
    type: "bar",
    data: chartDataXs,
    options: buildChartOptions("x"),
    plugins: [buildLevelBandsPlugin("x")],
  });
}

/**
 * Mapea un valor promedio a su nivel textual
 */
function mapValueToLevel(value) {
  if (value >= 2.5) return "🏆 Empresario";
  if (value >= 1.5) return "📊 Gerente";
  if (value >= 0.5) return "🚀 Emprendedor";
  return "🌱 Aprendiz";
}

// Inicializar gráfico cuando el componente monta
onMounted(() => {
  mediaQuery = window.matchMedia("(min-width: 1024px)");
  selectAllAreas();
  initChartsByViewport();

  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener("change", initChartsByViewport);
  } else {
    mediaQuery.addListener(initChartsByViewport);
  }
});

// Reinicializar si cambian las props. modelValue requiere deep watch
// porque en algunas vistas se hidrata mutando keys internas.
watch(
  () => props.modelValue,
  () => {
    syncSelectedAreasWithProps();
    initChartsByViewport();
  },
  { deep: true },
);

watch([() => props.areas, () => props.periods], () => {
  syncSelectedAreasWithProps();
  initChartsByViewport();
});

watch(selectedAreaKeys, () => {
  initChartsByViewport();
});

onUnmounted(() => {
  destroyCharts();

  if (!mediaQuery) return;

  if (mediaQuery.removeEventListener) {
    mediaQuery.removeEventListener("change", initChartsByViewport);
  } else {
    mediaQuery.removeListener(initChartsByViewport);
  }
});
</script>

<style scoped>
.level-matrix-section {
  @apply max-w-7xl mx-auto px-4 sm:px-6 py-5;
}

.section-header {
  @apply flex gap-3 mb-4 items-start;
}

.section-num {
  @apply w-7 h-7 rounded-lg bg-gray-900 text-white flex items-center justify-center text-[11px] font-bold;
}

.section-header-main {
  @apply flex gap-3 items-start;
}

.section-title {
  @apply text-lg font-semibold text-gray-900;
}

.section-desc {
  @apply text-gray-600 text-xs;
}

.matrix-layout {
  @apply grid gap-4;
}

.level-matrix-container {
  @apply bg-white border border-gray-200 rounded-xl shadow-sm p-5 sm:p-6;
}

.area-selector-xs {
  @apply mb-3 rounded-xl border border-gray-200 bg-gray-50/80 p-2.5;
}

.area-selector-head {
  @apply mb-2 flex items-center justify-between gap-2;
}

.area-selector-title {
  @apply text-[11px] font-semibold uppercase tracking-wide text-gray-700;
}

.area-chip-list {
  @apply flex flex-wrap gap-1.5;
}

.area-chip {
  @apply rounded-full border border-gray-300 bg-white px-2.5 py-1 text-[11px] font-medium text-gray-700 transition-colors duration-150;
}

.area-chip:hover {
  @apply border-gray-400 bg-gray-100;
}

.area-chip.is-active {
  @apply border-blue-600 bg-blue-600 text-white;
}

.area-chip-all {
  @apply shrink-0;
}

.chart-wrapper {
  @apply w-full;
  height: 400px;
  position: relative;
}

.canvas-lg,
.canvas-xs {
  width: 100% !important;
  height: 100% !important;
}

.canvas-xs {
  display: none;
}

.chart-empty-xs {
  display: none;
}

.level-legend {
  @apply mt-4 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-3 sm:p-4;
}

.legend-header {
  @apply mb-2 flex items-center justify-between gap-2;
}

.legend-title {
  @apply text-xs sm:text-sm font-semibold text-gray-900;
}

.legend-subtitle {
  @apply text-[11px] text-gray-600;
}

.legend-items {
  @apply grid grid-cols-2 lg:grid-cols-4 gap-2;
}

.legend-item {
  @apply flex items-center gap-2 p-2 sm:p-2.5 bg-white border border-gray-100 rounded-lg;
}

.legend-color {
  @apply w-3 h-8 sm:h-9 rounded flex-shrink-0 shadow-sm;
}

.legend-item-text {
  @apply min-w-0;
}

.legend-level {
  @apply text-[11px] sm:text-xs font-bold text-gray-900 leading-tight;
}

.legend-range {
  @apply text-[10px] sm:text-[11px] text-gray-600 leading-tight;
}

.legend-color.aprend {
  @apply bg-[#FF4444];
}

.legend-color.emprend {
  @apply bg-[#FFA500];
}

.legend-color.gerente {
  @apply bg-[#00CC00];
}

.legend-color.empresario {
  @apply bg-[#00CCCC];
}

.legend-text {
  @apply text-xs text-gray-700 font-medium;
}

@media (max-width: 768px) {
  .chart-wrapper {
    height: 340px;
  }

  .legend-header {
    @apply flex-col items-start;
  }
}

@media (max-width: 1023px) {
  .canvas-lg {
    display: none;
  }

  .canvas-xs {
    display: block;
  }

  .chart-empty-xs {
    @apply absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-gray-500;
  }
}

@media (min-width: 1024px) {
  .area-selector-xs {
    display: none;
  }

  .canvas-lg {
    display: block;
  }

  .canvas-xs {
    display: none;
  }

  .matrix-layout {
    grid-template-columns: minmax(0, 1.9fr) minmax(280px, 1fr);
    align-items: start;
  }

  .level-legend {
    @apply mt-0;
  }

  .legend-header {
    @apply flex-col items-start;
  }

  .legend-items {
    @apply grid-cols-1;
  }
}
</style>
