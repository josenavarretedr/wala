<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <h3 class="text-lg font-bold text-gray-900 mb-4">Resumen por Categorías</h3>
    <div class="relative" style="height: 400px">
      <canvas ref="chartCanvas"></canvas>
    </div>

    <!-- Leyenda personalizada con scores -->
    <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <div
        v-for="(category, index) in categories"
        :key="category.key"
        class="flex items-center justify-between gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div class="flex items-center gap-2 flex-1 min-w-0">
          <div
            :style="{ backgroundColor: category.color }"
            class="w-3 h-3 rounded-full flex-shrink-0"
          ></div>
          <span class="text-xs font-medium text-gray-700 truncate">{{
            category.label
          }}</span>
        </div>
        <div class="flex items-center gap-1">
          <span class="text-sm font-bold text-purple-600">{{
            categoryScores[category.key] || 0
          }}</span>
          <span class="text-xs text-gray-500">/9</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from "vue";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const props = defineProps({
  categoryScores: {
    type: Object,
    required: true,
  },
});

const chartCanvas = ref(null);
let chartInstance = null;

// Categorías con colores personalizados
const categories = [
  {
    key: "negocioFamilia",
    label: "Negocio",
    color: "rgba(59, 130, 246, 0.6)", // blue
  },
  {
    key: "marketing",
    label: "Marketing",
    color: "rgba(168, 85, 247, 0.6)", // purple
  },
  {
    key: "controlStock",
    label: "Control Stock",
    color: "rgba(34, 197, 94, 0.6)", // green
  },
  {
    key: "compras",
    label: "Compras",
    color: "rgba(249, 115, 22, 0.6)", // orange
  },
  {
    key: "costeo",
    label: "Costeo",
    color: "rgba(236, 72, 153, 0.6)", // pink
  },
  {
    key: "mantenimientoRegistros",
    label: "Registros",
    color: "rgba(234, 179, 8, 0.6)", // yellow
  },
  {
    key: "planificacion",
    label: "Planificación",
    color: "rgba(14, 165, 233, 0.6)", // cyan
  },
];

function createChart() {
  if (!chartCanvas.value || !props.categoryScores) return;

  // Destruir gráfico anterior si existe
  if (chartInstance) {
    chartInstance.destroy();
  }

  const ctx = chartCanvas.value.getContext("2d");

  // Preparar datos
  const labels = categories.map((cat) => cat.label);
  const data = categories.map((cat) => props.categoryScores[cat.key] || 0);
  const maxScore = 9; // 3 preguntas × 3 puntos máximo cada una

  chartInstance = new Chart(ctx, {
    type: "radar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Puntaje Obtenido",
          data: data,
          borderColor: "rgba(147, 51, 234, 1)", // purple-600
          backgroundColor: "rgba(147, 51, 234, 0.2)",
          borderWidth: 2,
          pointBackgroundColor: "rgba(147, 51, 234, 1)",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgba(147, 51, 234, 1)",
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${context.parsed.r} / ${maxScore} puntos`;
            },
          },
        },
      },
      scales: {
        r: {
          min: 0,
          max: maxScore,
          ticks: {
            stepSize: 3,
            font: {
              size: 11,
            },
          },
          pointLabels: {
            font: {
              size: 12,
              weight: "600",
            },
            color: "#374151", // gray-700
          },
          grid: {
            color: "rgba(156, 163, 175, 0.2)", // gray-400 transparent
          },
          angleLines: {
            color: "rgba(156, 163, 175, 0.2)",
          },
        },
      },
    },
  });
}

onMounted(() => {
  createChart();
});

watch(
  () => props.categoryScores,
  () => {
    createChart();
  },
  { deep: true }
);

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy();
  }
});
</script>
