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
        <!-- Header (sin blur) -->
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <div
              class="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center"
            >
              <svg
                class="w-4 h-4 text-gray-600"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M4 6h16M4 12h16M4 18h10"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </div>
            <span
              class="text-[10px] text-gray-500 uppercase tracking-wider font-medium"
            >
              {{ title }}
            </span>
          </div>
          <span v-if="rows.length" class="text-xs text-gray-500">
            Top {{ limit }}
          </span>
        </div>

        <!-- Lista -->
        <div v-if="isLoading" class="flex items-center justify-center py-8">
          <SpinnerIcon size="lg" class="text-blue-500" />
        </div>

        <div v-else-if="rows.length" class="space-y-3" :class="contentClasses">
          <button
            v-for="(row, idx) in rows"
            :key="row.key"
            class="w-full text-left"
            @click="$emit('select', row)"
          >
            <div class="flex items-center justify-between mb-1">
              <div class="flex items-center gap-2 min-w-0">
                <span class="text-xs text-gray-400 w-5 tabular-nums"
                  >{{ idx + 1 }}.</span
                >
                <span class="text-sm text-gray-800 truncate" :title="row.label">
                  {{ row.label }}
                </span>
              </div>
              <div class="text-sm font-medium tabular-nums text-gray-700">
                {{ formatCurrency(row.revenue) }}
              </div>
            </div>

            <!-- Spark bar -->
            <div class="w-full h-2 rounded-md bg-gray-100 overflow-hidden">
              <div
                class="h-full rounded-md bg-blue-500 transition-all duration-500"
                :style="{ width: row.pct + '%' }"
                role="progressbar"
                :aria-valuenow="row.revenue"
                aria-valuemin="0"
                :aria-valuemax="maxRevenue"
              />
            </div>

            <!-- Línea secundaria opcional (unidades) -->
            <div class="mt-1 text-[11px] text-gray-500">
              {{ row.units }} <span class="text-[10px]">unid.</span>
              <span class="mx-1 text-gray-300">•</span>
              {{ row.txCount }} <span class="text-[10px]">ventas</span>
            </div>
          </button>
        </div>

        <!-- Empty state -->
        <div v-else class="text-xs text-gray-400 text-center py-4">
          Aún no hay ventas con detalle de productos en este periodo.
        </div>
      </div>
    </template>
  </PremiumLockWrapper>
</template>

<script setup>
import { defineProps, defineEmits, computed, ref, watch } from "vue";
import SpinnerIcon from "@/components/ui/SpinnerIcon.vue";
import PremiumLockWrapper from "@/components/PremiumLockWrapper.vue";

const props = defineProps({
  /** Transacciones (ej. type: 'income') que incluyen items: [{ uuid, description, quantity, price }] */
  transactions: { type: Array, required: true },

  /** Logs de stock 'sell' (opcional). Si se provee y tiene datos, se prioriza sobre transactions.
   *  Estructura esperada: [{ productUuid?, description?, quantity, price, type: 'sell', createdAt?... }]
   */
  sellLogs: { type: Array, default: () => [] },

  title: { type: String, default: "Top productos por ingreso" },
  limit: { type: Number, default: 5 },
  isPremium: { type: Boolean, default: true },
  isLocked: { type: Boolean, default: false },

  /** Mapeo de claves para items dentro de las transacciones */
  itemKeys: {
    type: Object,
    default: () => ({
      uuid: "uuid",
      description: "description",
      quantity: "quantity",
      price: "price",
    }),
  },

  /** Mapeo de claves para logs (si usas sellLogs) */
  logKeys: {
    type: Object,
    default: () => ({
      uuid: "productUuid", // o 'uuid' si así lo guardas
      description: "description",
      quantity: "quantity",
      price: "price",
      type: "type",
    }),
  },
});

defineEmits(["select", "locked-click"]);

const isLoading = ref(true);

const formatCurrency = (value) =>
  new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

/** ---- Agregación desde transacciones.items ---- */
const buildAggFromTransactions = (txs) => {
  const map = new Map();
  const {
    uuid: K_UUID,
    description: K_DESC,
    quantity: K_QTY,
    price: K_PRICE,
  } = props.itemKeys;

  for (const tx of txs || []) {
    const items = Array.isArray(tx?.items) ? tx.items : [];
    for (const it of items) {
      const key = (it?.[K_UUID] ?? it?.[K_DESC] ?? "").toString().trim();
      if (!key) continue;

      const qty = Number(it?.[K_QTY] ?? 0);
      const price = Number(it?.[K_PRICE] ?? 0);
      if (!Number.isFinite(qty) || qty <= 0) continue;
      const revenue = price * qty;

      const label =
        (it?.[K_DESC]?.toString()?.trim() || "Producto sin nombre") +
        (it?.[K_UUID] ? "" : " *");

      const agg = map.get(key) || {
        key,
        label,
        revenue: 0,
        units: 0,
        txCount: 0,
      };
      agg.revenue += revenue;
      agg.units += qty;
      agg.txCount += 1;
      map.set(key, agg);
    }
  }
  return Array.from(map.values());
};

/** ---- Agregación desde sellLogs (si se proveen) ---- */
const buildAggFromLogs = (logs) => {
  const map = new Map();
  const {
    uuid: K_UUID,
    description: K_DESC,
    quantity: K_QTY,
    price: K_PRICE,
    type: K_TYPE,
  } = props.logKeys;

  for (const log of logs || []) {
    if (log?.[K_TYPE] !== "sell") continue;
    const key = (log?.[K_UUID] ?? log?.[K_DESC] ?? "").toString().trim();
    if (!key) continue;

    const qty = Number(log?.[K_QTY] ?? 0);
    const price = Number(log?.[K_PRICE] ?? 0);
    if (!Number.isFinite(qty) || qty <= 0) continue;
    const revenue = price * qty;

    const label =
      (log?.[K_DESC]?.toString()?.trim() || "Producto sin nombre") +
      (log?.[K_UUID] ? "" : " *");

    const agg = map.get(key) || {
      key,
      label,
      revenue: 0,
      units: 0,
      txCount: 0,
    };
    agg.revenue += revenue;
    agg.units += qty;
    agg.txCount += 1;
    map.set(key, agg);
  }
  return Array.from(map.values());
};

/** Preferimos logs si existen; si no, transacciones */
const rowsRaw = computed(() => {
  if (Array.isArray(props.sellLogs) && props.sellLogs.length > 0) {
    return buildAggFromLogs(props.sellLogs);
  }
  return buildAggFromTransactions(props.transactions);
});

const maxRevenue = computed(() => {
  if (!rowsRaw.value.length) return 0;
  return Math.max(...rowsRaw.value.map((r) => r.revenue));
});

const rows = computed(() => {
  const max = maxRevenue.value || 1;
  return rowsRaw.value
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, props.limit)
    .map((r) => ({
      ...r,
      pct: Math.max(4, Math.min(100, (r.revenue / max) * 100)), // 4% mínimo para que se vea algo
    }));
});

// Simular carga cuando cambien las transacciones o logs
watch(
  () => [props.transactions, props.sellLogs],
  () => {
    isLoading.value = true;
    setTimeout(() => {
      isLoading.value = false;
    }, 300);
  },
  { immediate: true, deep: true }
);
</script>

<style scoped>
button {
  outline: none;
}
button:focus-visible .bg-emerald-500 {
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.4);
}
</style>
