<template>
  <PremiumLockWrapper
    :is-premium="isPremium"
    :is-locked="isLocked"
    @locked-click="$emit('locked-click')"
  >
    <template #content="{ contentClasses }">
      <div
        class="w-full h-full bg-white rounded-lg border border-gray-200 p-4 transition-all duration-200 hover:border-gray-300 hover:shadow-sm flex flex-col"
      >
        <!-- Header (sin blur) -->
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <span
              class="text-[10px] text-gray-500 uppercase tracking-wider font-medium"
            >
              {{ title }}
            </span>
          </div>
        </div>

        <!-- Gráfico (con blur cuando locked) -->
        <div class="relative flex-1 min-h-0" :class="contentClasses">
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
import SpinnerIcon from "@/components/ui/SpinnerIcon.vue";
import PremiumLockWrapper from "@/components/PremiumLockWrapper.vue";

// ---------- Props ----------
const props = defineProps({
  transactions: { type: Array, required: true },
  title: { type: String, default: "Mix por método de pago" },
  filterType: { type: String, default: "expense" },
  isPremium: { type: Boolean, default: true },
  isLocked: { type: Boolean, default: false },
});

defineEmits(["locked-click"]);

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
const getMethod = (tx) =>
  (tx?.account ?? tx?.paymentMethod ?? "Otros").toString().trim() || "Otros";

// Mapeo de nombres internos a nombres amigables
const getFriendlyName = (method) => {
  const methodLower = method.toLowerCase();
  if (methodLower === "cash") return "Efectivo";
  if (methodLower === "bank") return "Yape/Plin";
  return method;
};

// Mapeo de métodos a colores fijos
const getColorForMethod = (method) => {
  const methodLower = method.toLowerCase();
  if (methodLower === "cash") return "#22c55e"; // verde
  if (methodLower === "bank") return "#3b82f6"; // azul
  // Para otros métodos, usar colores de la paleta
  const palette = [
    "#f59e0b", // ámbar
    "#ef4444", // rojo
    "#a855f7", // violeta
    "#14b8a6", // teal
    "#f97316", // naranja
    "#06b6d4", // cyan
  ];
  // Generar un índice basado en el hash del nombre para consistencia
  let hash = 0;
  for (let i = 0; i < method.length; i++) {
    hash = method.charCodeAt(i) + ((hash << 5) - hash);
  }
  return palette[Math.abs(hash) % palette.length];
};

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
    labels: entries.map((e) => getFriendlyName(e[0])),
    data: entries.map((e) => e[1]),
    methods: entries.map((e) => e[0]),
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
  isLoading.value = true;
  await nextTick();
  const el = chartCanvas.value;
  if (!el) {
    isLoading.value = false;
    return;
  }

  const { labels, data, methods } = buildPie(props.transactions || []);

  // Limpiar instancia previa
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  const ctx = el.getContext("2d");

  // Asignar colores fijos basados en el método original
  const colors = methods.map((method) => getColorForMethod(method));

  chartInstance = new Chart(ctx, {
    type: "pie",
    data: {
      labels,
      datasets: [
        {
          label: "Gastos",
          data,
          backgroundColor: colors,
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
  () => [props.transactions, props.filterType],
  () => renderChart(),
  { deep: true }
);
</script>
