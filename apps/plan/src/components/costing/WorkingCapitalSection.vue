<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCostingStore } from '@/stores/costing';
import { useCostingCalculator } from '@/composables/useCostingCalculator';

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  isSyncing: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['toggle-financing', 'sync']);

const router = useRouter();
const costingStore = useCostingStore();
const { formatMoney, computeMonthlyProductionAndSalesProjection } = useCostingCalculator();

const monthlyProjection = computed(() => {
  return computeMonthlyProductionAndSalesProjection(costingStore.products || []);
});

const totalRubroB = computed(() => {
  return props.items.reduce((sum, i) => sum + (Number(i.totalPrice) || 0), 0);
});

const totalFinanced = computed(() => {
  return props.items
    .filter((i) => i.financedBySeedCapital !== false)
    .reduce((sum, i) => sum + (Number(i.totalPrice) || 0), 0);
});

const totalOwn = computed(() => {
  return Math.max(0, totalRubroB.value - totalFinanced.value);
});

function handleToggleFinancing(itemId) {
  emit('toggle-financing', itemId);
}

function handleSync() {
  emit('sync');
}

function goToSession6() {
  router.push('/sesiones/6');
}
</script>

<template>
  <div class="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 space-y-3.5">
    <!-- Cabecera del Rubro B -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
      <div>
        <div class="flex items-center gap-2">
          <span class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center shrink-0">
            B
          </span>
          <h3 class="text-sm font-bold text-slate-900">
            Capital de Trabajo / Insumos de Arranque
          </h3>
        </div>
        <p class="text-[11px] text-slate-500 mt-0.5 ml-8">
          Calculado automáticamente desde tus recetas y compras de la Sesión 6 (1 mes de operación)
        </p>
      </div>

      <button
        type="button"
        @click="handleSync"
        :disabled="isSyncing"
        class="self-start sm:self-auto inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-xl border border-emerald-200 transition-colors min-h-[44px] shrink-0"
        title="Recalcular insumos con base en las recetas de la Sesión 6"
      >
        <span :class="{ 'animate-spin': isSyncing }">🔄</span>
        <span>{{ isSyncing ? 'Sincronizando...' : 'Sincronizar con S6' }}</span>
      </button>
    </div>

    <!-- Banner Pedagógico "La Casera vs. El Plato" -->
    <div class="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-3 text-xs text-emerald-950 leading-relaxed flex items-start gap-2.5">
      <span class="text-base leading-none shrink-0 mt-0.5">💡</span>
      <div>
        <strong class="font-bold block text-emerald-900">De la receta ("El Plato") a la compra comercial ("La Casera"):</strong>
        El sistema proyecta el consumo mensual de tus tandas y lo convierte en paquetes comerciales enteros para que no compres fracciones. Marca con el interruptor qué insumos solicitarás con el Capital Semilla y cuáles aportarás tú.
      </div>
    </div>

    <!-- Tarjeta de Capacidad Operativa y Ventas Mensuales Estimadas -->
    <div v-if="monthlyProjection.products.length > 0" class="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3 text-xs space-y-2">
      <div class="flex items-center justify-between">
        <span class="font-bold text-blue-950 flex items-center gap-1.5">
          <span>📊</span>
          <span>Capacidad Operativa y Ventas Estimadas al Mes</span>
        </span>
        <span class="text-[11px] font-black text-blue-800">
          Total: {{ formatMoney(monthlyProjection.totalMonthlySalesEstimate) }}/mes
        </span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
        <div
          v-for="p in monthlyProjection.products"
          :key="p.productId"
          class="bg-white rounded-lg p-2 border border-blue-100 flex items-center justify-between"
        >
          <div class="min-w-0 pr-2">
            <span class="font-bold text-slate-800 block truncate">{{ p.productName }}</span>
            <span class="text-[10px] text-slate-500 block truncate">{{ p.capacityDescription }}</span>
          </div>
          <div class="text-right shrink-0">
            <span class="font-bold text-blue-900 block">{{ p.monthlyVolume }} {{ p.volumeUnit }}</span>
            <span class="text-[10px] text-slate-600 block">{{ formatMoney(p.monthlySalesEstimate) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Tarjetas de Resumen Rápido Rubro B -->
    <div v-if="items.length > 0" class="grid grid-cols-3 gap-2 text-center text-xs">
      <div class="bg-slate-50 border border-slate-200 rounded-xl p-2">
        <span class="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">Total Insumos</span>
        <span class="text-xs sm:text-sm font-black text-slate-900 block mt-0.5 truncate">
          {{ formatMoney(totalRubroB) }}
        </span>
      </div>

      <div class="bg-emerald-50/80 border border-emerald-200 rounded-xl p-2">
        <span class="text-[10px] font-bold text-emerald-800 uppercase block tracking-wider">Al Subsidio</span>
        <span class="text-xs sm:text-sm font-black text-emerald-900 block mt-0.5 truncate">
          {{ formatMoney(totalFinanced) }}
        </span>
      </div>

      <div class="bg-amber-50/80 border border-amber-200 rounded-xl p-2">
        <span class="text-[10px] font-bold text-amber-800 uppercase block tracking-wider">Aporte Propio</span>
        <span class="text-xs sm:text-sm font-black text-amber-900 block mt-0.5 truncate">
          {{ formatMoney(totalOwn) }}
        </span>
      </div>
    </div>

    <!-- Lista de Insumos Derivados -->
    <div v-if="items.length > 0" class="space-y-2.5 pt-1">
      <div
        v-for="(item, idx) in items"
        :key="item.itemId || idx"
        class="rounded-xl border p-3 transition-all space-y-2.5"
        :class="[
          item.financedBySeedCapital !== false
            ? 'bg-white border-emerald-200/90 shadow-2xs hover:border-emerald-300'
            : 'bg-slate-50/90 border-slate-200 text-slate-600'
        ]"
      >
        <!-- Fila superior: Producto de origen y Categoría -->
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span
              v-if="item.productName"
              class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200"
            >
              🏷️ {{ item.productName }}
            </span>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
              📦 Compra Comercial
            </span>
          </div>

          <span
            v-if="item.financedBySeedCapital === false"
            class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 shrink-0"
          >
            🏠 Aporte Propio
          </span>
        </div>

        <!-- Descripción del insumo y paquete -->
        <div>
          <h4 class="text-xs font-bold" :class="item.financedBySeedCapital !== false ? 'text-slate-900' : 'text-slate-700'">
            {{ item.description }}
          </h4>
          <p v-if="item.monthlyQuantityConsumed" class="text-[10px] text-slate-500 mt-0.5">
            Consumo mensual proyectado en recetas: <span class="font-semibold text-slate-700">{{ item.monthlyQuantityConsumed }} {{ item.consumptionUnit }}</span>
          </p>
        </div>

        <!-- Detalle de Cantidad x Precio de Paquete = Total -->
        <div class="flex items-center justify-between bg-slate-50/80 rounded-lg p-2 text-xs border border-slate-100">
          <div class="text-slate-600">
            <span class="font-bold text-slate-800">{{ item.quantity }}</span> {{ item.unit || 'paquetes' }}
            &times; {{ formatMoney(item.unitPriceEstimated) }}
          </div>
          <div class="text-right">
            <span class="text-[10px] uppercase font-bold text-slate-500 block">Total Compra</span>
            <span class="font-black text-sm" :class="item.financedBySeedCapital !== false ? 'text-emerald-950' : 'text-slate-700'">
              {{ formatMoney(item.totalPrice) }}
            </span>
          </div>
        </div>

        <!-- Toggle Switch de Financiamiento (Área táctil mínima 48px) -->
        <button
          type="button"
          role="switch"
          :aria-checked="item.financedBySeedCapital !== false"
          @click="handleToggleFinancing(item.itemId)"
          class="w-full flex items-center justify-between p-2 rounded-xl transition-all min-h-[48px] cursor-pointer active:scale-[0.99] border"
          :class="[
            item.financedBySeedCapital !== false
              ? 'bg-emerald-50/90 border-emerald-300 hover:bg-emerald-100/70 text-emerald-950'
              : 'bg-slate-100/90 border-slate-300 hover:bg-slate-200/70 text-slate-700'
          ]"
        >
          <div class="flex items-center gap-2 text-left">
            <span class="text-base">{{ item.financedBySeedCapital !== false ? '🎁' : '🏠' }}</span>
            <div>
              <span class="text-xs font-bold block">
                {{ item.financedBySeedCapital !== false ? 'Solicitar con Capital Semilla' : 'Ya lo tengo / Aporte Propio' }}
              </span>
              <span class="text-[10px] block font-medium opacity-80">
                {{ item.financedBySeedCapital !== false ? 'Descuenta del subsidio de capital semilla' : 'No descuenta del subsidio asignado' }}
              </span>
            </div>
          </div>

          <!-- Indicador Gráfico Switch -->
          <div
            class="w-11 h-6 rounded-full transition-colors relative shrink-0 ml-2"
            :class="item.financedBySeedCapital !== false ? 'bg-emerald-500' : 'bg-slate-300'"
          >
            <div
              class="w-5 h-5 bg-white rounded-full shadow-sm transition-transform absolute top-0.5"
              :class="item.financedBySeedCapital !== false ? 'translate-x-5' : 'translate-x-0.5'"
            ></div>
          </div>
        </button>
      </div>
    </div>

    <!-- Estado Vacío: Cuando aún no se configuraron recetas en S6 -->
    <div
      v-else
      class="p-5 text-center bg-slate-50/80 rounded-xl border border-dashed border-slate-300 space-y-2.5"
    >
      <span class="text-2xl block">🛒</span>
      <h4 class="text-xs font-bold text-slate-800">
        Aún no hay insumos calculados desde la Sesión 6
      </h4>
      <p class="text-[11px] text-slate-500 max-w-sm mx-auto leading-relaxed">
        Ve a la Sesión 6 y registra las recetas, suministros o compras por mayor de tus productos. El sistema calculará automáticamente aquí los paquetes comerciales de arranque necesarios para 1 mes.
      </p>
      <button
        type="button"
        @click="goToSession6"
        class="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-xl border border-blue-200 transition-colors min-h-[44px]"
      >
        <span>← Ir a Sesión 6 (Costeo)</span>
      </button>
    </div>
  </div>
</template>
