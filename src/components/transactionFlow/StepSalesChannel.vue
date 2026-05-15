<template>
  <div class="space-y-6">
    <!-- Título del paso -->
    <div class="text-center">
      <h2 class="text-2xl font-bold text-gray-800">Canal de Venta</h2>
      <p class="text-sm text-gray-500 mt-1">
        ¿Cómo se entrega esta venta?
      </p>
    </div>

    <!-- Selector de canal -->
    <div class="grid grid-cols-3 gap-3">
      <!-- En Local -->
      <button
        type="button"
        @click="selectChannel('LOCAL')"
        :class="[
          'relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200',
          salesChannel === 'LOCAL'
            ? 'border-blue-500 bg-blue-50 shadow-md scale-[1.02]'
            : 'border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/30',
        ]"
      >
        <Shop
          class="w-8 h-8"
          :class="salesChannel === 'LOCAL' ? 'text-blue-600' : 'text-gray-400'"
        />
        <span
          class="text-sm font-semibold"
          :class="salesChannel === 'LOCAL' ? 'text-blue-700' : 'text-gray-700'"
        >En Local</span>
        <div
          v-if="salesChannel === 'LOCAL'"
          class="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"
        >
          <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </button>

      <!-- Para Llevar -->
      <button
        type="button"
        @click="selectChannel('TAKEAWAY')"
        :class="[
          'relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200',
          salesChannel === 'TAKEAWAY'
            ? 'border-amber-500 bg-amber-50 shadow-md scale-[1.02]'
            : 'border-gray-200 bg-white hover:border-amber-200 hover:bg-amber-50/30',
        ]"
      >
        <ShoppingBag
          class="w-8 h-8"
          :class="salesChannel === 'TAKEAWAY' ? 'text-amber-600' : 'text-gray-400'"
        />
        <span
          class="text-sm font-semibold"
          :class="salesChannel === 'TAKEAWAY' ? 'text-amber-700' : 'text-gray-700'"
        >Para Llevar</span>
        <div
          v-if="salesChannel === 'TAKEAWAY'"
          class="absolute top-2 right-2 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center"
        >
          <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </button>

      <!-- Delivery -->
      <button
        type="button"
        @click="selectChannel('DELIVERY')"
        :class="[
          'relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200',
          salesChannel === 'DELIVERY'
            ? 'border-orange-500 bg-orange-50 shadow-md scale-[1.02]'
            : 'border-gray-200 bg-white hover:border-orange-200 hover:bg-orange-50/30',
        ]"
      >
        <Motorcycle
          class="w-8 h-8"
          :class="salesChannel === 'DELIVERY' ? 'text-orange-600' : 'text-gray-400'"
        />
        <span
          class="text-sm font-semibold"
          :class="salesChannel === 'DELIVERY' ? 'text-orange-700' : 'text-gray-700'"
        >Delivery</span>
        <div
          v-if="salesChannel === 'DELIVERY'"
          class="absolute top-2 right-2 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center"
        >
          <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </button>
    </div>

    <!-- Selector de plataforma (solo DELIVERY) -->
    <Transition name="slide-fade">
      <div
        v-if="salesChannel === 'DELIVERY'"
        class="bg-white rounded-2xl border-2 border-orange-200 p-5 space-y-4"
      >
        <h3 class="text-lg font-semibold text-gray-800">
          Plataforma de Delivery
        </h3>
        <p class="text-xs text-gray-500">
          Selecciona la plataforma por la que se gestionó este pedido
        </p>

        <!-- Plataformas disponibles -->
        <div class="flex flex-wrap gap-2">
          <button
            v-for="platform in enabledPlatforms"
            :key="platform.id"
            type="button"
            @click="selectPlatform(platform)"
            :class="[
              'px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all duration-200',
              selectedPlatform === platform.id
                ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm'
                : 'border-gray-200 bg-white text-gray-700 hover:border-orange-200 hover:bg-orange-50/30',
            ]"
          >
            {{ platform.name }}
          </button>

          <!-- Plataforma custom -->
          <button
            type="button"
            @click="selectPlatform({ id: 'custom', name: '', defaultCommission: 0 })"
            :class="[
              'px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all duration-200',
              selectedPlatform === 'custom'
                ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm'
                : 'border-gray-200 bg-white text-gray-700 hover:border-orange-200 hover:bg-orange-50/30',
            ]"
          >
            + Otra
          </button>
        </div>

        <!-- Input nombre custom -->
        <div v-if="selectedPlatform === 'custom'" class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Nombre de la plataforma</label>
          <input
            v-model="customPlatformName"
            type="text"
            placeholder="Ej: Mi app propia"
            class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            @input="updateCustomPlatform"
          />
        </div>

        <!-- Input comisión -->
        <div v-if="selectedPlatform" class="space-y-2">
          <label class="text-sm font-medium text-gray-700">
            Comisión de la plataforma (%)
          </label>
          <div class="relative">
            <input
              v-model.number="commissionPct"
              type="number"
              min="0"
              max="100"
              step="0.5"
              placeholder="0"
              class="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-lg font-semibold"
              @input="updateCommission"
            />
            <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">%</span>
          </div>
          <p class="text-xs text-gray-500">
            Se calcula sobre el total del pedido como referencia
          </p>
        </div>
      </div>
    </Transition>

    <!-- Envases necesarios (DELIVERY o TAKEAWAY) -->
    <Transition name="slide-fade">
      <div
        v-if="(salesChannel === 'DELIVERY' || salesChannel === 'TAKEAWAY') && packagingItems.length > 0"
        class="bg-white rounded-2xl border-2 border-amber-200 p-5 space-y-3"
      >
        <div class="flex items-center gap-2">
          <Package class="w-6 h-6 text-amber-600" />
          <h3 class="text-lg font-semibold text-gray-800">Envases Necesarios</h3>
        </div>

        <div class="space-y-2">
          <div
            v-for="pkg in packagingItems"
            :key="pkg.productId"
            class="flex items-center justify-between py-2 px-3 bg-amber-50 rounded-lg"
          >
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-gray-800">
                {{ pkg.quantity }}× {{ pkg.description }}
              </span>
              <span class="text-xs text-gray-500">({{ pkg.unit }})</span>
            </div>
            <span class="text-sm font-semibold text-amber-700">
              S/ {{ (pkg.subtotal || 0).toFixed(2) }}
            </span>
          </div>
        </div>

        <div class="flex justify-between items-center pt-2 border-t border-amber-200">
          <span class="text-sm font-medium text-gray-700">Total envases:</span>
          <span class="text-lg font-bold text-amber-700">
            S/ {{ packagingCostTotal.toFixed(2) }}
          </span>
        </div>
      </div>
    </Transition>

    <!-- Mensaje cuando no hay envases configurados -->
    <div
      v-if="(salesChannel === 'DELIVERY' || salesChannel === 'TAKEAWAY') && packagingItems.length === 0 && !loadingPackaging"
      class="bg-gray-50 rounded-2xl border border-gray-200 p-4 text-center"
    >
      <p class="text-sm text-gray-500 flex items-center justify-center gap-2">
        <Package class="w-5 h-5 text-gray-400 shrink-0" />
        Ningún producto de esta venta tiene envases de delivery configurados.
      </p>
      <p class="text-xs text-gray-400 mt-1">
        Puedes configurar envases desde la sección de costos de cada producto.
      </p>
    </div>

    <!-- Loading envases -->
    <div
      v-if="loadingPackaging"
      class="flex items-center justify-center py-6"
    >
      <div class="text-center">
        <div class="animate-spin w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-2"></div>
        <p class="text-gray-500 text-sm">Calculando envases...</p>
      </div>
    </div>

    <!-- Resumen de impacto financiero -->
    <Transition name="slide-fade">
      <div
        v-if="hasFinancialImpact"
        class="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border border-gray-200 p-5 space-y-3"
      >
        <h3 class="text-sm font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-2">
          <Reports class="w-5 h-5 text-gray-500" />
          Desglose de la venta
        </h3>

        <div class="space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Venta bruta:</span>
            <span class="font-semibold text-gray-800">S/ {{ saleTotal.toFixed(2) }}</span>
          </div>

          <div
            v-if="commissionAmount > 0"
            class="flex justify-between text-sm"
          >
            <span class="text-gray-600">
              Comisión {{ platformDisplayName }} ({{ commissionPct }}%):
            </span>
            <span class="font-semibold text-orange-600">- S/ {{ commissionAmount.toFixed(2) }}</span>
          </div>

          <div
            v-if="packagingCostTotal > 0"
            class="flex justify-between text-sm"
          >
            <span class="text-gray-600">Envases:</span>
            <span class="font-semibold text-amber-600">+ S/ {{ packagingCostTotal.toFixed(2) }}</span>
          </div>

          <div class="flex justify-between items-center pt-3 border-t border-gray-200">
            <span class="text-sm font-medium text-gray-700">Ingreso neto estimado:</span>
            <span class="text-xl font-bold text-emerald-600">
              S/ {{ netIncome.toFixed(2) }}
            </span>
          </div>
        </div>

        <p class="text-xs text-gray-400 mt-2">
          * El monto registrado será el total cobrado (venta bruta + envases). La comisión es un dato de referencia para análisis de rentabilidad.
        </p>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useTransactionStore } from '@/stores/transaction/transactionStore';
import { useBusinessStore } from '@/stores/businessStore';
import { useBusinessSettings } from '@/composables/useBusinessSettings';
import { useInventory } from '@/composables/useInventory';
import { round2 } from '@/utils/mathUtils';
import { Shop, ShoppingBag, Motorcycle, Package, Reports } from '@iconoir/vue';

const transactionStore = useTransactionStore();
const businessStore = useBusinessStore();
const { getDeliveryPlatforms } = useBusinessSettings();
const { getProductById } = useInventory();

// State
const salesChannel = ref(transactionStore.transactionToAdd.value.salesChannel || 'LOCAL');
const selectedPlatform = ref(transactionStore.transactionToAdd.value.deliveryPlatform || null);
const customPlatformName = ref(transactionStore.transactionToAdd.value.deliveryPlatformName || '');
const commissionPct = ref(transactionStore.transactionToAdd.value.platformCommissionPct || null);
const platforms = ref([]);
const packagingItems = ref([...( transactionStore.transactionToAdd.value.packagingItems || [])]);
const loadingPackaging = ref(false);

// Computed
const enabledPlatforms = computed(() => platforms.value.filter(p => p.enabled));

const packagingCostTotal = computed(() =>
  round2(packagingItems.value.reduce((sum, p) => sum + (p.subtotal || 0), 0))
);

const saleTotal = computed(() => {
  const items = transactionStore.transactionToAdd.value.items || [];
  return items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
});

const commissionAmount = computed(() => {
  if (!commissionPct.value || commissionPct.value <= 0) return 0;
  return round2(saleTotal.value * commissionPct.value / 100);
});

const platformDisplayName = computed(() => {
  if (selectedPlatform.value === 'custom') return customPlatformName.value || 'Plataforma';
  const platform = platforms.value.find(p => p.id === selectedPlatform.value);
  return platform?.name || '';
});

const netIncome = computed(() => {
  return round2(saleTotal.value - commissionAmount.value + packagingCostTotal.value);
});

const hasFinancialImpact = computed(() => {
  return commissionAmount.value > 0 || packagingCostTotal.value > 0;
});

// Methods
const selectChannel = (channel) => {
  salesChannel.value = channel;
};

const selectPlatform = (platform) => {
  selectedPlatform.value = platform.id;
  if (platform.id !== 'custom') {
    customPlatformName.value = platform.name;
    commissionPct.value = platform.defaultCommission;
  } else {
    customPlatformName.value = '';
    commissionPct.value = 0;
  }
  syncToStore();
};

const updateCustomPlatform = () => {
  syncToStore();
};

const updateCommission = () => {
  syncToStore();
};

const syncToStore = () => {
  const tx = transactionStore.transactionToAdd.value;
  tx.salesChannel = salesChannel.value;
  tx.deliveryPlatform = selectedPlatform.value;
  tx.deliveryPlatformName = platformDisplayName.value;
  tx.platformCommissionPct = commissionPct.value;
  tx.platformCommissionAmount = commissionAmount.value;
  tx.packagingItems = [...packagingItems.value];
  tx.packagingCost = packagingCostTotal.value;
};

const calculatePackaging = async () => {
  const items = transactionStore.transactionToAdd.value.items || [];
  if (items.length === 0) {
    packagingItems.value = [];
    syncToStore();
    return;
  }

  loadingPackaging.value = true;
  const allPackaging = [];

  try {
    for (const item of items) {
      // Only check existing products (not new ones)
      if (item.oldOrNewProduct === 'new') continue;

      const productId = item.uuid || item.selectedProductUuid;
      if (!productId) continue;

      const product = await getProductById(productId);
      if (!product?.deliveryConfig?.packaging) continue;

      for (const pkg of product.deliveryConfig.packaging) {
        const totalQty = round2(pkg.quantity * item.quantity);

        // Merge if same packaging product already added
        const existing = allPackaging.find(p => p.productId === pkg.productId);
        if (existing) {
          existing.quantity = round2(existing.quantity + totalQty);
          existing.subtotal = round2(existing.quantity * existing.costPerUnit);
        } else {
          allPackaging.push({
            productId: pkg.productId,
            description: pkg.description,
            quantity: totalQty,
            unit: pkg.unit || 'uni',
            costPerUnit: pkg.costPerUnit || 0,
            subtotal: round2(totalQty * (pkg.costPerUnit || 0))
          });
        }
      }
    }

    packagingItems.value = allPackaging;
    syncToStore();
  } catch (error) {
    console.error('❌ Error calculando envases:', error);
  } finally {
    loadingPackaging.value = false;
  }
};

// Watchers
watch(salesChannel, async (newChannel) => {
  if (newChannel === 'LOCAL') {
    // Clear everything
    selectedPlatform.value = null;
    customPlatformName.value = '';
    commissionPct.value = null;
    packagingItems.value = [];
    syncToStore();
  }

  if (newChannel === 'TAKEAWAY' || newChannel === 'DELIVERY') {
    await calculatePackaging();
  }

  if (newChannel !== 'DELIVERY') {
    selectedPlatform.value = null;
    customPlatformName.value = '';
    commissionPct.value = null;
  }

  syncToStore();
});

// Lifecycle
onMounted(async () => {
  // Load delivery platforms from business settings
  const businessId = businessStore.getBusinessId;
  if (businessId) {
    try {
      platforms.value = await getDeliveryPlatforms(businessId);
      if (!platforms.value || platforms.value.length === 0) {
        throw new Error('No delivery platforms configured');
      }
    } catch (error) {
      console.warn('⚠️ No se pudieron cargar plataformas de delivery, usando defaults');
      platforms.value = [
        { id: 'rappi', name: 'Rappi', defaultCommission: 30, enabled: true },
        { id: 'pedidosya', name: 'PedidosYa', defaultCommission: 25, enabled: true },
        { id: 'ubereats', name: 'Uber Eats', defaultCommission: 30, enabled: true },
        { id: 'glovo', name: 'Glovo', defaultCommission: 28, enabled: true },
        { id: 'whatsapp', name: 'WhatsApp Directo', defaultCommission: 0, enabled: true },
      ];
    }
  }

  // If returning to this step, restore state from store
  const tx = transactionStore.transactionToAdd.value;
  if (tx.salesChannel && tx.salesChannel !== 'LOCAL') {
    salesChannel.value = tx.salesChannel;
    selectedPlatform.value = tx.deliveryPlatform;
    customPlatformName.value = tx.deliveryPlatformName || '';
    commissionPct.value = tx.platformCommissionPct;
    packagingItems.value = [...(tx.packagingItems || [])];
  }

  // Recalculate packaging if channel is set (in case items changed)
  if (salesChannel.value === 'DELIVERY' || salesChannel.value === 'TAKEAWAY') {
    await calculatePackaging();
  }
});
</script>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
