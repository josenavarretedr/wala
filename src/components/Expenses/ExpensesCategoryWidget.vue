<template>
  <div
    class="w-full h-full bg-white rounded-lg border border-gray-200 p-4 transition-all duration-200 hover:border-gray-300 hover:shadow-sm flex flex-col"
  >
    <!-- Header -->
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <span
          class="text-[10px] text-gray-500 uppercase tracking-wider font-medium"
        >
          Gastos por categoría
        </span>
      </div>
    </div>

    <!-- Gráfico -->
    <div class="relative flex-1 min-h-0">
      <canvas ref="chartCanvas"></canvas>

      <!-- Loading State -->
      <div
        v-if="isLoading"
        class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90"
      >
        <SpinnerIcon size="md" class="text-red-500" />
      </div>

      <!-- Estado vacío -->
      <div
        v-else-if="!hasData"
        class="absolute inset-0 flex items-center justify-center text-xs text-gray-400"
      >
        Sin categorías registradas
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  defineProps,
  ref,
  onMounted,
  onBeforeUnmount,
  watch,
  computed,
  nextTick,
} from "vue";
import Chart from "chart.js/auto";
import SpinnerIcon from "@/components/ui/SpinnerIcon.vue";

// ---------- Props ----------
const props = defineProps({
  transactions: { type: Array, required: true },
});

// ---------- Refs / estado ----------
const chartCanvas = ref(null);
let chartInstance = null;
const isLoading = ref(true);

// ---------- Utils ----------
const formatCurrency = (value) =>
  new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const getAmount = (tx) => Number(tx?.amount ?? 0);
const getCategory = (tx) => tx?.category?.toString().trim() || "otros";

// Mapeo de categorías internas a nombres amigables
const getFriendlyName = (category) => {
  const categoryMap = {
    materials: "Costos de materiales",
    labor: "Costos de personal",
    overhead: "Gastos indirectos",
    otros: "Otros",
  };
  return categoryMap[category] || category;
};

// Colores para cada categoría
const getCategoryColor = (category) => {
  const colorMap = {
    materials: "#f97316", // naranja
    labor: "#22c55e", // verde
    overhead: "#3b82f6", // azul
    otros: "#6b7280", // gris
  };
  return colorMap[category] || "#6b7280";
};

// Agrupar montos por categoría
const buildDonutData = (txs) => {
  // Filtrar solo expenses (ya viene filtrado pero por si acaso)
  const rows = txs.filter((t) => t?.type === "expense");

  // Reducir a mapa categoría -> monto
  const map = new Map();
  for (const tx of rows) {
    const category = getCategory(tx);
    const amount = getAmount(tx);
    if (!amount) continue;
    map.set(category, (map.get(category) || 0) + amount);
  }

  // Ordenar desc por monto
  const entries = Array.from(map.entries()).sort((a, b) => b[1] - a[1]);

  return {
    labels: entries.map((e) => getFriendlyName(e[0])),
    data: entries.map((e) => e[1]),
    categories: entries.map((e) => e[0]),
  };
};

// ---------- Derivados ----------
const hasData = computed(
  () => Array.isArray(props.transactions) && props.transactions.length > 0
);

// ---------- Chart render ----------
const renderChart = async () => {
  isLoading.value = true;
  await nextTick();
  const el = chartCanvas.value;
  if (!el) {
    isLoading.value = false;
    return;
  }

  const { labels, data, categories } = buildDonutData(props.transactions || []);

  // Limpiar instancia previa
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  const ctx = el.getContext("2d");

  // Asignar colores basados en la categoría
  const colors = categories.map((cat) => getCategoryColor(cat));

  chartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          label: "Gastos",
          data,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: "#ffffff",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            padding: 10,
            font: {
              size: 11,
            },
          },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const label = ctx.label || "";
              const value = ctx.parsed || 0;
              // porcentaje
              const total =
                ctx.chart._metasets[0].total ?? data.reduce((a, b) => a + b, 0);
              const pct = total ? ((value / total) * 100).toFixed(1) : 0;
              return ` ${label}: ${formatCurrency(value)} (${pct}%)`;
            },
          },
        },
      },
      cutout: "65%", // Hace el donut más delgado
    },
  });

  isLoading.value = false;
};

onMounted(renderChart);

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
});

// Redibujar al cambiar props
watch(
  () => props.transactions,
  () => renderChart(),
  { deep: true }
);
</script>
