<template>
  <PremiumLockWrapper
    :is-premium="isPremium"
    :is-locked="isLocked"
    @locked-click="$emit('locked-click')"
  >
    <template #content="{ contentClasses }">
      <div
        class="w-full bg-white rounded-lg border border-gray-200 p-4 transition-all duration-200 hover:border-gray-300 hover:shadow-sm"
      >
        <!-- Header compacto (sin blur) -->
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

          <span
            v-if="maxExpense > 0"
            class="text-xs text-gray-500 tabular-nums"
          >
            Máx: {{ formatCurrency(maxExpense) }}
          </span>
        </div>

        <!-- Gráfico compacto (con blur cuando locked) -->
        <div class="relative h-32" :class="contentClasses">
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
            Sin datos en el periodo
          </div>
        </div>
      </div>
    </template>
  </PremiumLockWrapper>
</template>

<script setup>
import {
  defineProps,
  defineEmits,
  ref,
  onMounted,
  onBeforeUnmount,
  watch,
  computed,
  nextTick,
} from "vue";
import Chart from "chart.js/auto";
import { GraphUp } from "@iconoir/vue";
import SpinnerIcon from "@/components/ui/SpinnerIcon.vue";
import PremiumLockWrapper from "@/components/PremiumLockWrapper.vue";

const props = defineProps({
  transactions: {
    type: Array,
    required: true,
  },
  previousTransactions: {
    type: Array,
    default: () => [],
  },
  type: {
    type: String,
    default: "expense",
  },
  isPremium: {
    type: Boolean,
    default: true,
  },
  isLocked: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["locked-click"]);

const chartCanvas = ref(null);
let chartInstance = null;
const isLoading = ref(true);

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
const maxExpense = computed(() => {
  const { data } = buildSeries(props.transactions || []);
  return data.length ? Math.max(...data) : 0;
});

// ----- Chart -----
const renderChart = async () => {
  isLoading.value = true;
  await nextTick();
  const el = chartCanvas.value;
  if (!el) {
    isLoading.value = false;
    return;
  }

  const currentData = buildSeries(props.transactions || []);
  const previousData = buildSeries(props.previousTransactions || []);

  // destruir si existe
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  const ctx = el.getContext("2d");

  // Gradiente suave (rojo para gastos)
  const gradient = ctx.createLinearGradient(0, 0, 0, el.height);
  gradient.addColorStop(0, "rgba(239, 68, 68, 0.25)"); // red 500 con alpha
  gradient.addColorStop(1, "rgba(239, 68, 68, 0.02)");

  // Configurar datasets
  const datasets = [
    {
      label: "Período actual",
      data: currentData.data,
      borderColor: "rgba(239, 68, 68, 1)", // red 500
      backgroundColor: gradient,
      borderWidth: 2,
      tension: 0.35,
      pointRadius: 0,
      fill: true,
    },
  ];

  // Agregar línea comparativa si hay datos previos
  if (props.previousTransactions && props.previousTransactions.length > 0) {
    datasets.push({
      label: "Período anterior",
      data: previousData.data,
      borderColor: "rgba(156, 163, 175, 0.8)", // gray-400
      backgroundColor: "transparent",
      borderWidth: 1.5,
      borderDash: [5, 5],
      tension: 0.35,
      pointRadius: 0,
      fill: false,
    });
  }

  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: currentData.labels,
      datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display:
            props.previousTransactions && props.previousTransactions.length > 0,
          position: "top",
          align: "end",
          labels: {
            font: { size: 9 },
            usePointStyle: true,
            pointStyle: "line",
            boxWidth: 20,
            boxHeight: 2,
          },
        },
        tooltip: {
          mode: "index",
          intersect: false,
          callbacks: {
            label: (ctx) => {
              const label = ctx.dataset.label || "";
              return ` ${label}: ${formatCurrency(ctx.parsed.y)}`;
            },
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

  isLoading.value = false;
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
  () => [props.transactions, props.previousTransactions],
  () => {
    renderChart();
  },
  { deep: true }
);
</script>
