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
          <span class="text-xs text-gray-500">Top {{ limit }}</span>
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
                {{ row.quantity }}
                <span class="text-xs text-gray-500">uni</span>
              </div>
            </div>

            <!-- Spark bar -->
            <div class="w-full h-2 rounded-md bg-gray-100 overflow-hidden">
              <div
                class="h-full rounded-md bg-blue-500 transition-all duration-500"
                :style="{ width: row.pct + '%' }"
                role="progressbar"
                :aria-valuenow="row.quantity"
                aria-valuemin="0"
                :aria-valuemax="maxUnits"
              />
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
import { defineProps, defineEmits, computed, ref, watch, onMounted } from "vue";
import SpinnerIcon from "@/components/ui/SpinnerIcon.vue";
import PremiumLockWrapper from "@/components/PremiumLockWrapper.vue";
import { useInventoryStore } from "@/stores/inventoryStore";

// Acceso al inventario para nombres actualizados
const inventoryStore = useInventoryStore();
const { allItemsInInventory, getItemsInInventory } = inventoryStore;

console.log("🔵 [TopProductsByUnits] Componente inicializado");

const props = defineProps({
  transactions: { type: Array, required: true }, // cada tx puede tener items: [{ uuid, description, quantity, price? }]
  title: { type: String, default: "Top productos por unidades" },
  limit: { type: Number, default: 5 },
  isPremium: { type: Boolean, default: true },
  isLocked: { type: Boolean, default: false },

  // En caso uses otros nombres de campos dentro de items:
  itemKeys: {
    type: Object,
    default: () => ({
      uuid: "uuid",
      description: "description",
      quantity: "quantity",
    }),
  },
});

defineEmits(["select"]);

const isLoading = ref(true);

/**
 * Obtiene el nombre actualizado del producto desde el inventario
 * @param {string} productUuid - UUID del producto
 * @param {string} fallbackName - Nombre por defecto si no se encuentra
 * @returns {string} Nombre actualizado del producto
 */
const getUpdatedProductName = (
  productUuid,
  fallbackName = "Producto sin nombre",
) => {
  if (!productUuid) {
    console.log(
      "⚠️ [TopProductsByUnits] Sin UUID, usando fallback:",
      fallbackName,
    );
    return fallbackName;
  }

  const product = allItemsInInventory.value?.find(
    (p) => p.uuid === productUuid,
  );

  console.log("🔍 [TopProductsByUnits] Buscando producto:", {
    uuid: productUuid,
    encontrado: !!product,
    nombreOriginal: fallbackName,
    nombreActualizado: product?.description,
    totalEnInventario: allItemsInInventory.value?.length || 0,
  });

  return product?.description || fallbackName;
};

/** Construye agregados a partir de transaction.items */
const buildAggFromTransactions = (txs) => {
  console.log(
    "📊 [TopProductsByUnits] Construyendo agregados desde",
    txs?.length || 0,
    "transacciones",
  );

  const map = new Map();
  const { uuid: K_UUID, description: K_DESC, quantity: K_QTY } = props.itemKeys;

  for (const tx of txs || []) {
    if (!Array.isArray(tx?.items)) continue;

    for (const it of tx.items) {
      console.log("📦 [TopProductsByUnits] Item:", {
        uuid: it?.[K_UUID],
        description: it?.[K_DESC],
        quantity: it?.[K_QTY],
      });
      const key = (it?.[K_UUID] ?? it?.[K_DESC] ?? "").toString().trim();
      if (!key) continue;

      const qty = Number(it?.[K_QTY] ?? 0);
      if (!Number.isFinite(qty) || qty <= 0) continue;

      // 🔄 Obtener nombre actualizado del inventario
      const originalName =
        it?.[K_DESC]?.toString()?.trim() || "Producto sin nombre";
      const updatedName = it?.[K_UUID]
        ? getUpdatedProductName(it[K_UUID], originalName)
        : originalName;

      const label = updatedName + (it?.[K_UUID] ? "" : " *"); // marca si no tiene uuid

      console.log("✅ [TopProductsByUnits] Label final:", label);

      const agg = map.get(key) || { key, label, quantity: 0 };
      agg.quantity += qty;
      map.set(key, agg);
    }
  }

  const result = Array.from(map.values());
  console.log("📈 [TopProductsByUnits] Resultado agregado:", result);
  return result;
};

/** Top N con % relativo al máximo (para ancho de barra) */
const rowsRaw = computed(() => buildAggFromTransactions(props.transactions));
const maxUnits = computed(() => {
  if (!rowsRaw.value.length) return 0;
  return Math.max(...rowsRaw.value.map((r) => r.quantity));
});

const rows = computed(() => {
  const max = maxUnits.value || 1;
  return rowsRaw.value
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, props.limit)
    .map((r) => ({
      ...r,
      pct: Math.max(4, Math.min(100, (r.quantity / max) * 100)), // 4% mínimo visual
    }));
});

// Cargar inventario al montar el componente
onMounted(async () => {
  console.log("🚀 [TopProductsByUnits] onMounted ejecutado");
  console.log(
    "📦 [TopProductsByUnits] Inventario actual:",
    allItemsInInventory.value?.length || 0,
    "items",
  );

  if (!allItemsInInventory.value || allItemsInInventory.value.length === 0) {
    console.log("⏳ [TopProductsByUnits] Cargando inventario...");
    await getItemsInInventory();
    console.log(
      "✅ [TopProductsByUnits] Inventario cargado:",
      allItemsInInventory.value?.length || 0,
      "items",
    );

    // Mostrar primeros 3 productos para verificar
    if (allItemsInInventory.value?.length > 0) {
      console.log(
        "📋 [TopProductsByUnits] Primeros productos:",
        allItemsInInventory.value
          .slice(0, 3)
          .map((p) => ({ uuid: p.uuid, description: p.description })),
      );
    }
  } else {
    console.log("✓ [TopProductsByUnits] Inventario ya disponible");
  }
});

// Simular carga cuando cambien las transacciones o el inventario
watch(
  () => [props.transactions, allItemsInInventory.value],
  ([transactions, inventory]) => {
    console.log("👀 [TopProductsByUnits] Watch triggered:", {
      transactions: transactions?.length || 0,
      inventory: inventory?.length || 0,
    });

    isLoading.value = true;
    setTimeout(() => {
      isLoading.value = false;
    }, 300);
  },
  { immediate: true, deep: true },
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
