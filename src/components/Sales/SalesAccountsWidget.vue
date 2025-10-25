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
          {{ title }}
        </span>
      </div>
    </div>

    <!-- Gráfico -->
    <div class="relative flex-1 min-h-0">
      <canvas ref="chartCanvas"></canvas>

      <!-- Estado vacío -->
      <div
        v-if="!hasData"
        class="absolute inset-0 flex items-center justify-center text-xs text-gray-400"
      >
        Sin datos en el periodo
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

// ---------- Props ----------
const props = defineProps({
  transactions: { type: Array, required: true }, // Array de tx (ideal: solo incomes)
  title: { type: String, default: "Mix por método de pago" },
  // Si quieres filtrar aquí por tipo:
  filterType: { type: String, default: "income" }, // null para no filtrar
});

// ---------- Refs / estado ----------
const chartCanvas = ref(null);
let chartInstance = null;

// ---------- Utils ----------
const formatCurrency = (value) =>
  new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const getAmount = (tx) => Number(tx?.amount ?? 0);
const getMethod = (tx) =>
  (tx?.account ?? tx?.paymentMethod ?? "Otros").toString().trim() || "Otros";

// Agrupar montos por método
const buildPie = (txs) => {
  // Filtrar por tipo si aplica
  const rows = props.filterType
    ? txs.filter((t) => t?.type === props.filterType)
    : txs;

  // Reducir a mapa método -> monto
  const map = new Map();
  for (const tx of rows) {
    const method = getMethod(tx);
    const amount = getAmount(tx);
    if (!amount) continue;
    map.set(method, (map.get(method) || 0) + amount);
  }

  // Ordenar desc por monto
  const entries = Array.from(map.entries()).sort((a, b) => b[1] - a[1]);

  return {
    labels: entries.map((e) => e[0]),
    data: entries.map((e) => e[1]),
  };
};

// ---------- Derivados ----------
const hasData = computed(
  () => Array.isArray(props.transactions) && props.transactions.length > 0
);
const totalAmount = computed(() => {
  const { data } = buildPie(props.transactions || []);
  return data.reduce((acc, n) => acc + n, 0);
});

// ---------- Chart render ----------
const renderChart = async () => {
  await nextTick();
  const el = chartCanvas.value;
  if (!el) return;

  const { labels, data } = buildPie(props.transactions || []);

  // Limpiar instancia previa
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  const ctx = el.getContext("2d");

  // Paleta (opcional): si prefieres, puedes dejar que Chart.js asigne colores por defecto
  const palette = [
    "#22c55e", // verde
    "#3b82f6", // azul
    "#f59e0b", // ámbar
    "#ef4444", // rojo
    "#a855f7", // violeta
    "#14b8a6", // teal
    "#f97316", // naranja
    "#06b6d4", // cyan
  ];

  chartInstance = new Chart(ctx, {
    type: "pie",
    data: {
      labels,
      datasets: [
        {
          label: "Ventas",
          data,
          backgroundColor: labels.map((_, i) => palette[i % palette.length]),
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {},
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
    },
  });
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
  () => [props.transactions, props.filterType],
  () => renderChart(),
  { deep: true }
);
</script>
