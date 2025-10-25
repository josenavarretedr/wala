<template>
  <div
    class="w-full bg-white rounded-lg border border-gray-200 p-4 transition-all duration-200 hover:border-gray-300 hover:shadow-sm"
  >
    <!-- Header compacto -->
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <div
          class="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center"
        >
          <GraphUp class="w-4 h-4 text-gray-600" />
        </div>
        <span
          class="text-[10px] text-gray-500 uppercase tracking-wider font-medium"
        >
          Tendencia
        </span>
      </div>

      <span v-if="maxSale > 0" class="text-xs text-gray-500 tabular-nums">
        Máx: {{ formatCurrency(maxSale) }}
      </span>
    </div>

    <!-- Gráfico compacto -->
    <div class="relative h-32">
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
import { GraphUp } from "@iconoir/vue";

const props = defineProps({
  transactions: {
    type: Array,
    required: true,
  },
});

const chartCanvas = ref(null);
let chartInstance = null;

// ----- Utils -----
const formatCurrency = (value) => {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
};

// Firestore Timestamp | Date | string -> ms
const toMs = (v) => {
  try {
    if (!v) return null;
    // Firestore Timestamp
    if (typeof v?.toDate === "function") return v.toDate().getTime();
    // JS Date
    if (v instanceof Date) return v.getTime();
    // number (ms)
    if (typeof v === "number") return v;
    // string
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d.getTime();
  } catch {
    return null;
  }
};

const getAmount = (tx) => Number(tx.amount ?? 0);

// ¿todas en el mismo día?
const isSameDayRange = (msList) => {
  if (msList.length === 0) return true;
  const d0 = new Date(msList[0]);
  return msList.every((ms) => {
    const d = new Date(ms);
    return (
      d.getFullYear() === d0.getFullYear() &&
      d.getMonth() === d0.getMonth() &&
      d.getDate() === d0.getDate()
    );
  });
};

// Agrupar: si es mismo día -> por hora; si no -> por día (YYYY-MM-DD)
const buildSeries = (txs) => {
  const normalized = txs
    .map((t) => ({ ms: toMs(t.createdAt), amount: getAmount(t) }))
    .filter((t) => t.ms !== null)
    .sort((a, b) => a.ms - b.ms);

  if (normalized.length === 0) {
    return { labels: [], data: [] };
  }

  const sameDay = isSameDayRange(normalized.map((t) => t.ms));
  const bucketMap = new Map();

  for (const { ms, amount } of normalized) {
    const d = new Date(ms);
    const key = sameDay
      ? `${d.getHours().toString().padStart(2, "0")}:00` // HH:00
      : `${d.getFullYear()}-${(d.getMonth() + 1)
          .toString()
          .padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`; // YYYY-MM-DD

    bucketMap.set(key, (bucketMap.get(key) || 0) + amount);
  }

  const labels = Array.from(bucketMap.keys());
  const data = Array.from(bucketMap.values());

  return { labels, data };
};

// ----- Estado derivado -----
const hasData = computed(
  () => Array.isArray(props.transactions) && props.transactions.length > 0
);
const maxSale = computed(() => {
  const { data } = buildSeries(props.transactions || []);
  return data.length ? Math.max(...data) : 0;
});

// ----- Chart -----
const renderChart = async () => {
  await nextTick();
  const el = chartCanvas.value;
  if (!el) return;

  const { labels, data } = buildSeries(props.transactions || []);

  // destruir si existe
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  const ctx = el.getContext("2d");

  // Gradiente suave
  const gradient = ctx.createLinearGradient(0, 0, 0, el.height);
  gradient.addColorStop(0, "rgba(59, 130, 246, 0.25)"); // blue 500 con alpha
  gradient.addColorStop(1, "rgba(16, 185, 129, 0.02)");

  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Ventas",
          data,
          borderColor: "rgba(59, 130, 246, 1)",
          backgroundColor: gradient,
          borderWidth: 2,
          tension: 0.35,
          pointRadius: 0,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          mode: "index",
          intersect: false,
          callbacks: {
            label: (ctx) => ` ${formatCurrency(ctx.parsed.y)}`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            maxTicksLimit: 6,
            color: "#6b7280", // gris-500
            font: { size: 10 },
          },
        },
        y: {
          beginAtZero: true,
          grid: { color: "rgba(107,114,128,0.1)" }, // gris-500 con alpha
          ticks: {
            maxTicksLimit: 4,
            color: "#6b7280",
            font: { size: 10 },
            callback: (v) => {
              // etiquetas compactas
              const n = Number(v);
              if (n >= 1000) return `S/ ${(n / 1000).toFixed(1)}k`;
              return `S/ ${n}`;
            },
          },
        },
      },
      interaction: { mode: "nearest", intersect: false },
    },
  });
};

onMounted(() => {
  renderChart();
});

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
});

// Redibujar cuando cambien las transacciones
watch(
  () => props.transactions,
  () => {
    renderChart();
  },
  { deep: true }
);
</script>
