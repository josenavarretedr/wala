<template>
  <PremiumLockWrapper
    :is-premium="isPremium"
    :is-locked="isLocked"
    @locked-click="$emit('locked-click')"
  >
    <template #content="{ contentClasses }">
      <div
        class="w-full h-full bg-white rounded-2xl border border-gray-200 p-4 transition-all duration-200 hover:border-gray-300 hover:shadow-sm flex flex-col"
      >
        <!-- Header (sin blur) -->
        <div class="flex items-center justify-between mb-3 border-b border-gray-50 pb-2 shrink-0">
          <div class="flex flex-col gap-0.5">
            <span
              class="text-[10px] text-gray-400 uppercase tracking-wider font-bold"
            >
              Flujo de Egresos
            </span>
            <h2 class="text-sm font-bold text-gray-800">{{ title }}</h2>
          </div>
          <div v-if="hasData && !isLoading" class="bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
            <span class="text-[9px] text-gray-400 uppercase tracking-wider font-bold mr-1">Total Analizado</span>
            <span class="text-xs font-extrabold text-gray-900 block sm:inline-block tabular-nums">{{ formatCurrency(totalAmount) }}</span>
          </div>
        </div>

        <!-- Contenido principal (con blur cuando locked) -->
        <div class="relative flex-1 min-h-0" :class="contentClasses">
          <!-- Loading State -->
          <div
            v-if="isLoading"
            class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-20"
          >
            <SpinnerIcon size="md" class="text-red-500" />
          </div>

          <!-- Estado vacío -->
          <div
            v-else-if="!hasData"
            class="absolute inset-0 flex items-center justify-center text-xs text-gray-400 z-10"
          >
            Sin egresos en el periodo
          </div>

          <!-- Cards View -->
          <div v-else class="w-full max-h-[320px] overflow-y-auto pr-1 space-y-2.5">
            <div
              v-for="item in paymentMethodsData"
              :key="item.method"
              class="p-3 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-xs transition-all duration-200 flex flex-col gap-2"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <div
                    class="p-2 rounded-full flex items-center justify-center"
                    :style="{ backgroundColor: item.color + '15' }"
                  >
                    <component
                      :is="getPaymentMethodIcon(item.method)"
                      class="w-4 h-4"
                      :style="{ color: item.color }"
                    />
                  </div>
                  <div>
                    <span class="text-xs font-bold text-gray-800 block leading-tight">
                      {{ item.name }}
                    </span>
                    <span class="text-[10px] text-gray-400 font-semibold">
                      {{ item.percentage.toFixed(1) }}% del total
                    </span>
                  </div>
                </div>
                <div class="text-right">
                  <span class="text-sm font-extrabold text-gray-900 block leading-tight tabular-nums">
                    {{ formatCurrency(item.amount) }}
                  </span>
                </div>
              </div>

              <!-- Progress Bar -->
              <div class="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :style="{ width: `${item.percentage}%`, backgroundColor: item.color }"
                ></div>
              </div>
            </div>
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
  watch,
  computed,
} from "vue";
import SpinnerIcon from "@/components/ui/SpinnerIcon.vue";
import PremiumLockWrapper from "@/components/PremiumLockWrapper.vue";
import { Coins, SmartphoneDevice, CreditCard, HelpCircle } from "@iconoir/vue";

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

const paymentMethodsData = computed(() => {
  const { labels, data, methods } = buildPie(props.transactions || []);
  const total = totalAmount.value || 1;
  return methods.map((method, index) => {
    const name = labels[index];
    const amount = data[index];
    const percentage = total ? (amount / total) * 100 : 0;
    const color = getColorForMethod(method);
    return {
      method,
      name,
      amount,
      percentage,
      color,
    };
  });
});

const getPaymentMethodIcon = (method) => {
  const methodLower = method.toLowerCase();
  if (methodLower === "cash") return Coins;
  if (methodLower === "bank") return SmartphoneDevice;
  if (methodLower === "card" || methodLower.includes("tarjeta")) return CreditCard;
  return HelpCircle;
};

// ---------- Ciclo de vida y watch ----------
onMounted(() => {
  isLoading.value = false;
});

watch(
  () => [props.transactions, props.filterType],
  () => {
    isLoading.value = false;
  },
  { deep: true }
);
</script>

<style scoped>
/* Scrollbar personalizado para la lista */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f9fafb;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #d1d5db;
}

/* Números tabulares para mejor alineación numérica */
.tabular-nums {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
}
</style>

