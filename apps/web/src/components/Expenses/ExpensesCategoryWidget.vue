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
        <div class="flex items-center justify-between mb-3 border-b border-gray-50 pb-2">
          <div class="flex flex-col gap-0.5">
            <span
              class="text-[10px] text-gray-400 uppercase tracking-wider font-bold"
            >
              Análisis Financiero de Egresos
            </span>
            <h2 class="text-sm font-bold text-gray-800">Distribución de Gastos</h2>
          </div>
        </div>

        <!-- Selector de Pestañas Interactivas -->
        <div class="flex border-b border-gray-100 mb-4 pb-2 shrink-0">
          <button 
            v-for="tab in tabs" 
            :key="tab.value"
            @click="activeTab = tab.value"
            :class="[
              'px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 mr-2 flex items-center gap-1.5 border',
              activeTab === tab.value 
                ? 'bg-red-50 text-red-600 border-red-100 shadow-xs' 
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50 border-transparent'
            ]"
          >
            {{ tab.label }}
          </button>
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
            Sin egresos registrados en este período
          </div>

          <!-- Vistas de Pestañas -->
          <div v-show="hasData" class="w-full h-full">
            <!-- PESTAÑA: Categorías Principales (Gráfico + Lista) -->
            <div v-show="activeTab === 'categories'" class="w-full">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <!-- Doughnut Chart Container -->
                <div class="relative h-[180px] w-full flex items-center justify-center">
                  <canvas ref="chartCanvas"></canvas>
                </div>
                <!-- Categorías List -->
                <div class="space-y-2.5">
                  <div 
                    v-for="cat in categoriesData" 
                    :key="cat.type" 
                    class="p-2.5 rounded-xl border border-gray-100 hover:border-gray-200 transition-all duration-150 flex items-center justify-between"
                  >
                    <div class="flex items-center gap-2.5">
                      <div class="p-2 rounded-full flex items-center justify-center" :style="{ backgroundColor: cat.color + '12' }">
                        <component :is="getCategoryIcon(cat.type)" class="w-4 h-4" :style="{ color: cat.color }" />
                      </div>
                      <div>
                        <span class="text-xs font-bold text-gray-800 block leading-tight">{{ cat.name }}</span>
                        <span class="text-[10px] text-gray-400 font-semibold">{{ cat.percentage.toFixed(1) }}% del total</span>
                      </div>
                    </div>
                    <div class="text-right">
                      <span class="text-sm font-extrabold text-gray-900 block leading-tight">{{ formatCurrency(cat.amount) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- PESTAÑA: Subcategorías Detalladas -->
            <div v-show="activeTab === 'subcategories'" class="w-full max-h-[320px] overflow-y-auto pr-1">
              <div class="space-y-2.5">
                <div v-for="sub in visibleSubcategories" :key="sub.name" class="p-3 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-xs transition-all duration-200 flex flex-col gap-2">
                  <div class="flex items-center justify-between">
                    <div>
                      <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider mb-1" :style="{ backgroundColor: sub.color + '15', color: sub.color }">
                        {{ sub.parent }}
                      </span>
                      <h4 class="text-xs font-bold text-gray-800 leading-tight">{{ sub.name }}</h4>
                    </div>
                    <div class="text-right">
                      <span class="text-sm font-extrabold text-gray-900 block leading-tight">{{ formatCurrency(sub.amount) }}</span>
                      <span class="text-[10px] text-gray-400 font-semibold">{{ sub.percentage.toFixed(1) }}%</span>
                    </div>
                  </div>
                  
                  <!-- Progress Bar -->
                  <div class="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-500" :style="{ width: `${sub.percentage}%`, backgroundColor: sub.color }"></div>
                  </div>
                </div>
                
                <!-- Toggle Button -->
                <div v-if="subcategoriesData.length > 5" class="text-center pt-2">
                  <button @click="showAllSubcategories = !showAllSubcategories" class="px-4 py-1.5 text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-full transition-colors duration-150">
                    {{ showAllSubcategories ? "Ver menos subcategorías" : `Ver ${subcategoriesData.length - 5} más...` }}
                  </button>
                </div>
              </div>
            </div>

            <!-- PESTAÑA: Impacto en el Negocio -->
            <div v-show="activeTab === 'impact'" class="w-full max-h-[320px] overflow-y-auto pr-1">
              <div class="grid grid-cols-1 gap-3.5">
                <div v-for="imp in impactData" :key="imp.id" :class="['p-4 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row gap-3 items-start', imp.bgClass, imp.borderClass]">
                  <!-- Icon Container -->
                  <div :class="['p-3 rounded-full shrink-0 bg-white shadow-xs flex items-center justify-center']">
                    <!-- Producción -->
                    <svg v-if="imp.icon === 'produce'" class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                    </svg>
                    <!-- Gestión -->
                    <svg v-else-if="imp.icon === 'admin'" class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                    </svg>
                    <!-- Logística -->
                    <svg v-else-if="imp.icon === 'logistics'" class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10M13 16h6l4-5v-1a1 1 0 00-1-1h-3M13 16H9m4-10H8m4 4H8"/>
                    </svg>
                  </div>
                  
                  <div class="flex-1 min-w-0 space-y-1">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h4 class="text-sm font-bold text-gray-800">{{ imp.name }}</h4>
                      <div class="text-left sm:text-right shrink-0">
                        <span class="text-sm sm:text-base font-extrabold text-gray-900 block sm:inline">{{ formatCurrency(imp.amount) }}</span>
                        <span class="text-xs text-gray-500 font-semibold ml-0.5 sm:ml-1">({{ imp.percentage.toFixed(1) }}%)</span>
                      </div>
                    </div>
                    <p class="text-[11px] text-gray-400 font-semibold leading-relaxed mb-2">{{ imp.description }}</p>
                    
                    <!-- Premium Progress Bar -->
                    <div class="w-full h-2 bg-white/60 rounded-full overflow-hidden border border-gray-100">
                      <div :class="['h-full rounded-full transition-all duration-700', imp.colorClass]" :style="{ width: `${imp.percentage}%` }"></div>
                    </div>
                  </div>
                </div>
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
  onBeforeUnmount,
  watch,
  computed,
  nextTick,
} from "vue";
import Chart from "chart.js/auto";
import SpinnerIcon from "@/components/ui/SpinnerIcon.vue";
import PremiumLockWrapper from "@/components/PremiumLockWrapper.vue";
import { Package, Settings, User, HelpCircle } from "@iconoir/vue";

// ---------- Props ----------
const props = defineProps({
  transactions: { type: Array, required: true },
  isPremium: { type: Boolean, default: true },
  isLocked: { type: Boolean, default: false },
});

defineEmits(["locked-click"]);

// ---------- Refs / estado ----------
const chartCanvas = ref(null);
let chartInstance = null;
const isLoading = ref(true);
const activeTab = ref("categories");
const showAllSubcategories = ref(false);

const tabs = [
  { value: "categories", label: "Categorías" },
  { value: "subcategories", label: "Subcategorías" },
  { value: "impact", label: "Impacto en Negocio" },
];

// ---------- Utils ----------
const formatCurrency = (value) =>
  new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const getCategoryIcon = (type) => {
  if (type === "materials") return Package;
  if (type === "labor") return User;
  if (type === "overhead") return Settings;
  return HelpCircle;
};

// ---------- Computeds de Datos ----------

const hasData = computed(
  () => Array.isArray(props.transactions) && props.transactions.length > 0
);

const totalExpensesAmount = computed(() => {
  return props.transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
});

// Pestaña 1: Categorías Principales
const categoriesData = computed(() => {
  const txs = props.transactions.filter((t) => t.type === "expense");
  const total = totalExpensesAmount.value || 1;
  const groups = {
    materials: { name: "Materiales e Insumos", amount: 0, color: "#f97316", type: "materials" },
    labor: { name: "Costos de Personal", amount: 0, color: "#a855f7", type: "labor" },
    overhead: { name: "Gastos Generales (Overhead)", amount: 0, color: "#3b82f6", type: "overhead" },
    otros: { name: "Otros", amount: 0, color: "#6b7280", type: "otros" },
  };

  for (const tx of txs) {
    let cat = tx.category || "otros";
    if (!groups[cat]) cat = "otros";
    groups[cat].amount += Number(tx.amount || 0);
  }

  return Object.values(groups)
    .filter((g) => g.amount > 0)
    .map((g) => ({
      ...g,
      percentage: (g.amount / total) * 100,
    }))
    .sort((a, b) => b.amount - a.amount);
});

// Pestaña 2: Subcategorías Detalladas
const subcategoriesData = computed(() => {
  const txs = props.transactions.filter((t) => t.type === "expense");
  const total = totalExpensesAmount.value || 1;
  const map = new Map();

  const getSubcategoryNameAndParent = (tx) => {
    const category = tx.category || "otros";
    
    if (category === "materials") {
      return { name: "Insumos y Materiales", parent: "Materiales", color: "#f97316" };
    }
    
    if (category === "labor") {
      const paylabor = tx.paylabor;
      if (paylabor === "DIRECT_SERVICE") {
        return { name: "Atención y Servicio Directo", parent: "Personal", color: "#a855f7" };
      }
      if (paylabor === "PRODUCTION_SUPPORT") {
        return { name: "Apoyo a la Producción", parent: "Personal", color: "#c084fc" };
      }
      if (paylabor === "ADMIN_SUPPORT") {
        return { name: "Personal Administrativo", parent: "Personal", color: "#e9d5ff" };
      }
      return { name: "Costos de Personal (Otros)", parent: "Personal", color: "#a855f7" };
    }
    
    if (category === "overhead") {
      const subcat = tx.subsubcategory || tx.subcategory;
      if (subcat === "platform_commission") {
        return { name: "Comisiones de Plataforma", parent: "Gastos Generales", color: "#6366f1" };
      }
      if (subcat === "delivery_cost") {
        return { name: "Logística y Delivery", parent: "Gastos Generales", color: "#06b6d4" };
      }
      
      const namesMap = {
        "Administración": "Administración y Gestión",
        "Alquileres": "Alquileres y Espacios",
        "Servicios Públicos": "Servicios Públicos (Luz/Agua)",
        "Comunicaciones": "Comunicaciones (Internet/Celular)",
        "Insumos de Limpieza": "Insumos de Limpieza",
        "Servicios de Limpieza": "Servicios de Limpieza",
        "Digital": "Marketing Digital y Ads",
        "Físico": "Publicidad y Merchandising",
        "Finanzas y Legal": "Servicios Contables/Legales",
        "Consultoría y Soporte": "Consultorías y Soporte TI",
        "Software y Licencias": "Software y Licencias",
        "Banca y Cuentas": "Comisiones y Gastos Bancarios",
        "Municipal y Local": "Tasas e Impuestos Municipales",
        "Seguros": "Seguros y Alarmas",
        "Útiles y Materiales": "Papelería y Útiles de Oficina",
        "Infraestructura": "Mantenimiento y Reparación local",
        "Movilidad y Gestión": "Movilidad Administrativa/Refrigerios"
      };
      return { 
        name: namesMap[subcat] || subcat || "Gastos Operativos", 
        parent: "Gastos Generales", 
        color: "#3b82f6" 
      };
    }

    return { name: "Otros", parent: "Otros", color: "#6b7280" };
  };

  for (const tx of txs) {
    const amount = Number(tx.amount || 0);
    if (!amount) continue;

    const { name, parent, color } = getSubcategoryNameAndParent(tx);
    const key = `${parent}:${name}`;

    if (!map.has(key)) {
      map.set(key, { name, parent, color, amount: 0 });
    }
    map.get(key).amount += amount;
  }

  return Array.from(map.values())
    .map((s) => ({
      ...s,
      percentage: (s.amount / total) * 100,
    }))
    .sort((a, b) => b.amount - a.amount);
});

const visibleSubcategories = computed(() => {
  if (showAllSubcategories.value) {
    return subcategoriesData.value;
  }
  return subcategoriesData.value.slice(0, 5);
});

// Pestaña 3: Impacto en el Negocio (Destino del Gasto)
const impactData = computed(() => {
  const txs = props.transactions.filter((t) => t.type === "expense");
  const total = totalExpensesAmount.value || 1;

  let produceAmount = 0;
  let adminAmount = 0;
  let logisticsAmount = 0;

  for (const tx of txs) {
    const amount = Number(tx.amount || 0);
    if (!amount) continue;

    if (tx.category === "materials") {
      produceAmount += amount;
    } else if (tx.category === "labor") {
      if (tx.paylabor === "DIRECT_SERVICE" || tx.paylabor === "PRODUCTION_SUPPORT") {
        produceAmount += amount;
      } else if (tx.paylabor === "ADMIN_SUPPORT") {
        adminAmount += amount;
      } else {
        if (tx.bucket === "DIRECT_LABOR" || tx.bucket === "MANUFACTURING_OH") {
          produceAmount += amount;
        } else {
          adminAmount += amount;
        }
      }
    } else if (tx.category === "overhead") {
      if (tx.overheadUsage === "PRODUCE") {
        produceAmount += amount;
      } else if (tx.overheadUsage === "ADMIN") {
        adminAmount += amount;
      } else if (tx.overheadUsage === "LOGISTICS") {
        logisticsAmount += amount;
      } else if (tx.overheadUsage === "MIXED") {
        if (Array.isArray(tx.splits) && tx.splits.length > 0) {
          for (const split of tx.splits) {
            if (split.bucket === "MANUFACTURING_OH") {
              produceAmount += Number(split.amount || 0);
            } else if (split.bucket === "OVERHEAD") {
              adminAmount += Number(split.amount || 0);
            }
          }
        } else {
          produceAmount += amount * 0.5;
          adminAmount += amount * 0.5;
        }
      } else {
        if (tx.subcategory === "platform_commission" || tx.subcategory === "delivery_cost") {
          logisticsAmount += amount;
        } else if (tx.bucket === "MANUFACTURING_OH") {
          produceAmount += amount;
        } else {
          adminAmount += amount;
        }
      }
    } else {
      adminAmount += amount;
    }
  }

  const items = [
    {
      id: "produce",
      name: "Producción e Insumos",
      description: "Materias primas, personal productivo, CIF y servicios directos.",
      amount: produceAmount,
      colorClass: "bg-orange-600",
      bgClass: "bg-orange-50/50",
      borderClass: "border-orange-100",
      icon: "produce"
    },
    {
      id: "admin",
      name: "Gestión y Operaciones",
      description: "Alquileres, servicios base, administración, ventas y marketing.",
      amount: adminAmount,
      colorClass: "bg-blue-600",
      bgClass: "bg-blue-50/50",
      borderClass: "border-blue-100",
      icon: "admin"
    },
    {
      id: "logistics",
      name: "Logística y Delivery",
      description: "Costos de despacho y comisiones de pasarelas/plataformas.",
      amount: logisticsAmount,
      colorClass: "bg-indigo-600",
      bgClass: "bg-indigo-50/50",
      borderClass: "border-indigo-100",
      icon: "logistics"
    }
  ];

  return items
    .filter((i) => i.amount > 0)
    .map((i) => ({
      ...i,
      percentage: (i.amount / total) * 100,
    }))
    .sort((a, b) => b.amount - a.amount);
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

  const dataForChart = categoriesData.value;

  // Limpiar instancia previa
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  const ctx = el.getContext("2d");

  chartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: dataForChart.map((c) => c.name),
      datasets: [
        {
          label: "Gastos",
          data: dataForChart.map((c) => c.amount),
          backgroundColor: dataForChart.map((c) => c.color),
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
          display: false, // Ocultar leyenda nativa para usar nuestra leyenda personalizada con iconos
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const label = ctx.label || "";
              const value = ctx.parsed || 0;
              const total = dataForChart.reduce((a, b) => a + b.amount, 0);
              const pct = total ? ((value / total) * 100).toFixed(1) : 0;
              return ` ${label}: ${formatCurrency(value)} (${pct}%)`;
            },
          },
        },
      },
      cutout: "70%",
    },
  });

  isLoading.value = false;
};

// ---------- Ciclo de vida y Watchers ----------

onMounted(() => {
  if (hasData.value) {
    renderChart();
  } else {
    isLoading.value = false;
  }
});

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
});

// Redibujar al cambiar props o pestañas
watch(
  () => props.transactions,
  () => {
    if (hasData.value && activeTab.value === "categories") {
      renderChart();
    } else if (!hasData.value) {
      isLoading.value = false;
    }
  },
  { deep: true }
);

watch(activeTab, (newTab) => {
  if (newTab === "categories" && hasData.value) {
    renderChart();
  }
});
</script>

<style scoped>
/* Scrollbar personalizado para lista de subcategorías */
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
</style>
