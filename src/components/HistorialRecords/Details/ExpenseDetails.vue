<template>
  <div class="space-y-6">
    <!-- Título mejorado -->
    <div class="text-center space-y-2">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">
        Resumen del Gasto
      </h1>
      <p class="text-sm text-gray-500">
        {{ formatDate(new Date()) }}
      </p>
    </div>

    <!-- Preview de la transacción -->
    <div
      class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <!-- Total destacado con estado de pago -->
      <div
        v-if="hasValidData"
        :class="[
          'text-white p-6 text-center',
          getPaymentStatus() === 'completed'
            ? 'bg-gradient-to-r from-red-500 to-red-600'
            : 'bg-gradient-to-r from-orange-500 to-orange-600',
        ]"
      >
        <div class="text-3xl font-bold mb-1">
          S/ {{ getTotalAmount().toFixed(2) }}
        </div>
        <div
          :class="[
            'text-sm',
            getPaymentStatus() === 'completed'
              ? 'text-red-100'
              : 'text-orange-100',
          ]"
        >
          Total de la compra / gasto
        </div>
        <!-- Badge de estado de pago -->
        <div v-if="getPaymentStatus() !== 'completed'" class="mt-3">
          <span
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm"
          >
            <svg
              class="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Pago Parcial / Crédito
          </span>
        </div>
      </div>

      <!-- Información de pago parcial o historial -->
      <div
        v-if="
          hasValidData &&
          props.transactionData.payments &&
          props.transactionData.payments.length > 0
        "
        :class="[
          'border-b p-4',
          getPaymentStatus() !== 'completed'
            ? 'bg-orange-50 border-orange-100'
            : 'bg-gray-50 border-gray-100',
        ]"
      >
        <!-- Resumen de pagos (solo si no está completado) -->
        <div
          v-if="getPaymentStatus() !== 'completed'"
          class="space-y-2 text-sm mb-4 pb-4 border-b border-orange-200"
        >
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Abono inicial:</span>
            <span class="font-semibold text-orange-600">
              S/ {{ getInitialPayment().toFixed(2) }}
            </span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Saldo pendiente:</span>
            <span class="font-semibold text-red-600">
              S/ {{ getBalance().toFixed(2) }}
            </span>
          </div>
        </div>

        <!-- Resumen de pagos -->
        <div>
          <h4 class="text-xs font-semibold text-gray-700 mb-2">
            {{
              getPaymentStatus() === "completed"
                ? "Resumen de pagos"
                : "Pagos registrados"
            }}
          </h4>
          <div class="space-y-2">
            <div
              v-for="(payment, index) in props.transactionData.payments"
              :key="index"
              class="flex justify-between items-center text-xs bg-white rounded-lg p-2 border border-gray-100"
            >
              <div class="flex items-center gap-2">
                <span class="text-gray-500"
                  >Pago {{ index + 1 }}
                  {{ index === 0 ? "(Inicial)" : "" }}</span
                >
                <span
                  :class="[
                    'px-2 py-0.5 rounded text-[10px] font-semibold',
                    payment.account === 'cash'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-purple-100 text-purple-700',
                  ]"
                >
                  {{ payment.account === "cash" ? "Efectivo" : "Digital" }}
                </span>
              </div>
              <span class="font-semibold text-gray-800">
                S/ {{ payment.amount.toFixed(2) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Información de tipo, cuenta y proveedor -->
      <div v-if="hasValidData" class="p-4 border-b border-gray-100">
        <div
          :class="[
            'grid gap-3',
            props.transactionData.supplierId
              ? 'grid-cols-3'
              : 'grid-cols-2',
          ]"
        >
          <div class="bg-red-50 rounded-xl p-4 text-center">
            <div
              class="w-8 h-8 bg-red-500 rounded-full mx-auto mb-2 flex items-center justify-center"
            >
              <component :is="getExpenseTypeIcon" class="w-4 h-4 text-white" />
            </div>
            <div class="text-sm font-medium text-red-700">
              {{ getCategoryLabel(props.transactionData.category) }}
            </div>
          </div>

          <div class="bg-green-50 rounded-xl p-4 text-center">
            <div
              class="w-8 h-8 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center"
            >
              <component :is="getAccountIcon" class="w-4 h-4 text-white" />
            </div>
            <div class="text-sm font-medium text-green-700">
              {{ getAccountLabel }}
            </div>
          </div>

          <!-- Proveedor -->
          <div
            v-if="props.transactionData.supplierId"
            class="bg-purple-50 rounded-xl p-4 text-center"
          >
            <div
              class="w-8 h-8 bg-purple-500 rounded-full mx-auto mb-2 flex items-center justify-center"
            >
              <svg
                class="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5"
                />
              </svg>
            </div>
            <div class="text-sm font-medium text-purple-700 truncate px-1" :title="props.transactionData.supplierName">
              {{ props.transactionData.supplierName }}
            </div>
          </div>
        </div>
      </div>

      <!-- Detalles del gasto -->
      <div v-if="hasValidData" class="p-4">
        <!-- ========================================== -->
        <!-- VISTA PARA MATERIALS (Compra de Materiales) -->
        <!-- ========================================== -->
        <div v-if="isMaterialsExpense">
          <h3
            class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"
          >
            <Package class="w-5 h-5 text-gray-600" />
            Materiales
          </h3>

          <div class="space-y-3">
            <!-- Lista de materiales -->
            <div
              v-for="material in props.transactionData.materialItems"
              :key="material.uuid"
              class="bg-gray-50 rounded-xl p-4"
            >
              <div class="flex justify-between items-start">
                <div class="flex-1 min-w-0 pr-3">
                  <div class="font-semibold text-gray-900 truncate mb-1">
                    {{ material.description.trim().toUpperCase() }}
                  </div>
                  <div v-if="material.variantLabel" class="mb-1">
                    <span
                      class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-violet-50 text-violet-700 border border-violet-200"
                    >
                      {{ material.variantLabel }}
                    </span>
                  </div>
                  <div class="text-sm text-gray-600">
                    {{ material.quantity }} {{ material.unit || "uni" }} × S/
                    {{ material.cost.toFixed(2) }}
                  </div>
                </div>
                <div class="text-right">
                  <div class="font-bold text-gray-900">
                    S/ {{ (material.quantity * material.cost).toFixed(2) }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Resumen final de materials -->
          <div class="mt-4 pt-4 border-t border-gray-200">
            <div class="flex justify-between items-center">
              <div class="text-gray-600">
                {{ props.transactionData.materialItems.length }}
                material{{
                  props.transactionData.materialItems.length !== 1 ? "es" : ""
                }}
              </div>
              <div class="text-xl font-bold text-red-600">
                S/ {{ getTotalAmount().toFixed(2) }}
              </div>
            </div>
          </div>

          <!-- Notas para materials -->
          <div
            v-if="props.transactionData.notes"
            class="mt-4 pt-4 border-t border-gray-200"
          >
            <div class="text-sm font-medium text-gray-700 mb-1">Notas</div>
            <div class="text-sm text-gray-600 italic bg-gray-50 p-3 rounded-lg">
              {{ props.transactionData.notes }}
            </div>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- VISTA PARA LABOR/OVERHEAD (Gastos Simples) -->
        <!-- ========================================== -->
        <div v-else>
          <h3
            class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"
          >
            <DatabaseExport class="w-5 h-5 text-gray-600" />
            Detalles del Gasto
          </h3>

          <!-- Información principal del gasto -->
          <div class="bg-red-50 rounded-xl p-4 mb-4">
            <div class="space-y-3">
              <!-- Descripción -->
              <div>
                <div class="text-sm font-medium text-red-700 mb-1">
                  Descripción
                </div>
                <div class="font-semibold text-red-900">
                  {{ props.transactionData.description }}
                </div>
              </div>

              <!-- Categoría -->
              <div v-if="props.transactionData.category">
                <div class="text-sm font-medium text-red-700 mb-1">
                  Categoría
                </div>
                <div class="flex items-center gap-2">
                  <component
                    :is="getCategoryIcon"
                    class="w-4 h-4 text-red-600"
                  />
                  <span class="font-medium text-red-800">
                    {{ getCategoryLabel(props.transactionData.category) }}
                  </span>
                </div>
              </div>

              <!-- Bucket contable -->
              <div v-if="props.transactionData.bucket">
                <div class="text-sm font-medium text-red-700 mb-1">
                  Clasificación contable
                </div>
                <span
                  class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200"
                >
                  {{ getBucketLabel(props.transactionData.bucket) }}
                </span>
              </div>

              <!-- PayLabor role -->
              <div v-if="props.transactionData.paylabor">
                <div class="text-sm font-medium text-red-700 mb-1">
                  Rol del trabajador
                </div>
                <span class="text-sm font-medium text-red-800">
                  {{ getPayLaborLabel(props.transactionData.paylabor) }}
                </span>
              </div>

              <!-- Overhead Usage -->
              <div v-if="props.transactionData.overheadUsage">
                <div class="text-sm font-medium text-red-700 mb-1">
                  Impacto del gasto
                </div>
                <span class="text-sm font-medium text-red-800">
                  {{
                    getOverheadUsageLabel(props.transactionData.overheadUsage)
                  }}
                </span>
              </div>

              <!-- Splits (prorrateo) -->
              <div
                v-if="
                  props.transactionData.splits &&
                  props.transactionData.splits.length > 0
                "
              >
                <div class="text-sm font-medium text-red-700 mb-2">
                  Prorrateo del gasto
                </div>
                <div
                  class="bg-white rounded-lg p-3 space-y-2 border border-red-100"
                >
                  <div
                    v-for="(split, idx) in props.transactionData.splits"
                    :key="idx"
                    class="flex items-center justify-between text-sm"
                  >
                    <span class="text-gray-700">{{
                      getBucketLabel(split.bucket)
                    }}</span>
                    <div class="flex items-center gap-2">
                      <span class="font-semibold text-gray-900">
                        S/ {{ (split.amount || 0).toFixed(2) }}
                      </span>
                      <span class="text-xs text-gray-500">
                        ({{ Math.round((split.percentage || 0) * 100) }}%)
                      </span>
                    </div>
                  </div>
                  <!-- Barra visual -->
                  <div class="flex h-2 rounded-full overflow-hidden mt-1">
                    <div
                      v-for="(split, idx) in props.transactionData.splits"
                      :key="'bar-' + idx"
                      :class="idx === 0 ? 'bg-orange-400' : 'bg-blue-400'"
                      :style="{
                        width: `${Math.round((split.percentage || 0) * 100)}%`,
                      }"
                    ></div>
                  </div>
                </div>
              </div>

              <!-- Clasificación Automática de Overhead -->
              <PremiumLockWrapper
                v-if="isOverheadExpense"
                :isPremium="isPremium"
                :isLocked="!hasAccess('aiClassification')"
                badgeText="Asesoría"
                @locked-click="handlePremiumClick"
              >
                <template #content="{ contentClasses }">
                  <div
                    v-if="overheadClassification"
                    :class="['border-t border-red-200 pt-3', contentClasses]"
                  >
                    <div class="flex items-center justify-between mb-2">
                      <div class="text-sm font-medium text-gray-700">
                        Clasificación automática
                      </div>
                      <span
                        class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700"
                      >
                        {{
                          (overheadClassification.confidence * 100).toFixed(0)
                        }}%
                      </span>
                    </div>
                    <div class="bg-gray-50 rounded-lg p-3 space-y-2">
                      <!-- Categoría -->
                      <div>
                        <div class="text-xs text-gray-500 mb-0.5">
                          Categoría
                        </div>
                        <div class="text-sm font-semibold text-gray-900">
                          {{ overheadClassification.subcategory }}
                        </div>
                      </div>
                      <!-- Subcategoría -->
                      <div v-if="overheadClassification.subsubcategory">
                        <div class="text-xs text-gray-500 mb-0.5">
                          Subcategoría
                        </div>
                        <div class="text-sm font-medium text-gray-900">
                          {{ overheadClassification.subsubcategory }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Estado: Clasificación Pendiente -->
                  <div
                    v-if="!overheadClassification"
                    :class="['border-t border-red-200 pt-3', contentClasses]"
                  >
                    <div class="flex items-center gap-2 mb-3">
                      <div
                        class="w-6 h-6 bg-yellow-100 rounded-lg flex items-center justify-center"
                      >
                        <Brain class="w-4 h-4 text-yellow-600" />
                      </div>
                      <div class="text-sm font-medium text-gray-700">
                        Clasificación pendiente
                      </div>
                      <div class="ml-auto">
                        <span
                          class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                        >
                          IA procesará
                        </span>
                      </div>
                    </div>
                    <div class="bg-yellow-50 rounded-lg p-3">
                      <p class="text-xs text-yellow-800">
                        Este gasto será clasificado automáticamente por IA
                        después de guardarlo.
                      </p>
                    </div>
                  </div>
                </template>
              </PremiumLockWrapper>

              <!-- Notas -->
              <div v-if="props.transactionData.notes">
                <div class="text-sm font-medium text-red-700 mb-1">Notas</div>
                <div class="text-sm text-red-800 italic">
                  {{ props.transactionData.notes }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Estado vacío -->
      <div v-else class="p-8 text-center">
        <div
          class="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4"
        >
          <Package class="w-6 h-6 text-gray-400" />
        </div>
        <h3 class="font-semibold text-gray-600 mb-1">
          No hay información del gasto
        </h3>
        <p class="text-sm text-gray-500">
          Los detalles del gasto no están disponibles
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { classifyOverhead } from "@/utils/overheadClassifier";
import PremiumLockWrapper from "@/components/PremiumLockWrapper.vue";
import { useSubscription } from "@/composables/useSubscription";
import { useToast } from "@/composables/useToast";
import { useRoute } from "vue-router";
import {
  DatabaseExport,
  ShieldQuestion,
  Coins,
  CreditCard,
  Package,
  User,
  Settings,
  SmartphoneDevice,
  Brain,
  CheckCircle,
} from "@iconoir/vue";

const props = defineProps({
  transactionData: {
    type: Object,
    required: true,
  },
});

const route = useRoute();
const { isPremium, hasAccess } = useSubscription();
const { premium } = useToast();

// ========================================
// METHODS
// ========================================

const handlePremiumClick = () => {
  premium("La clasificación automática con IA está disponible en WALA Asesoría.", {
    actionLink: {
      text: "Ver WALA Asesoría",
      route: `/business/${route.params.businessId}/pro`,
    },
  });
};

// ========================================
// COMPUTED PROPERTIES
// ========================================

/**
 * Verifica si es un expense de tipo materials
 */
const isMaterialsExpense = computed(() => {
  return props.transactionData.category === "materials";
});

/**
 * Verifica si es un expense de tipo overhead
 */
const isOverheadExpense = computed(() => {
  return props.transactionData.category === "overhead";
});

/**
 * Obtiene la clasificación automática de overhead
 */
const overheadClassification = computed(() => {
  if (!isOverheadExpense.value) return null;

  const description = props.transactionData.description;
  if (!description) return null;

  return classifyOverhead(description);
});

/**
 * Verifica si hay datos válidos para mostrar
 */
const hasValidData = computed(() => {
  // Para materials: validar que haya materialItems
  if (isMaterialsExpense.value) {
    return (
      props.transactionData.materialItems &&
      Array.isArray(props.transactionData.materialItems) &&
      props.transactionData.materialItems.length > 0
    );
  }

  // Para labor/overhead: validar description y amount
  return props.transactionData.description && props.transactionData.amount;
});

/**
 * Calcula el total del gasto
 */
const getTotalAmount = () => {
  // Para materials: sumar todos los items
  if (isMaterialsExpense.value && props.transactionData.materialItems) {
    return props.transactionData.materialItems.reduce((sum, material) => {
      return sum + (material.cost || 0) * (material.quantity || 0);
    }, 0);
  }

  // Para labor/overhead: usar el amount directo
  return props.transactionData.amount || 0;
};

const getPaymentStatus = () => {
  return props.transactionData.paymentStatus || "completed";
};

const getInitialPayment = () => {
  const payments = props.transactionData.payments;
  if (payments && payments.length > 0) {
    return payments[0].amount || 0;
  }
  return 0;
};

const getBalance = () => {
  return props.transactionData.balance || 0;
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

// Función para formatear fecha
const formatDate = (date) => {
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

// Computed para obtener la etiqueta del tipo de transacción
const getTypeLabel = computed(() => {
  const type = props.transactionData.type;
  const labels = {
    income: "Ingreso",
    expense: "Gasto",
    change: "Transferencia",
  };
  return labels[type] || "Transacción";
});

// Computed para obtener la etiqueta de la cuenta
const getAccountLabel = computed(() => {
  const account = props.transactionData.account;
  const labels = {
    cash: "Efectivo",
    bank: "Yape/Plin",
  };
  return labels[account] || "No especificado";
});

// Computed para obtener el ícono de la cuenta
const getAccountIcon = computed(() => {
  const account = props.transactionData.account;
  return account === "cash" ? Coins : SmartphoneDevice;
});

// Función para obtener la etiqueta de la categoría
const getCategoryLabel = (category) => {
  const labels = {
    materials: "Costos de materiales",
    labor: "Costos de personal",
    overhead: "Gastos indirectos",
  };
  return labels[category] || category;
};

// Función para obtener la etiqueta del bucket contable
const getBucketLabel = (bucket) => {
  const labels = {
    DIRECT_MATERIAL: "Material directo",
    COGS_RESALE: "Mercadería para reventa",
    DIRECT_LABOR: "Mano de obra directa",
    MANUFACTURING_OH: "Costos indirectos de producción",
    OVERHEAD: "Gastos generales",
  };
  return labels[bucket] || bucket;
};

// Función para obtener la etiqueta del rol paylabor
const getPayLaborLabel = (role) => {
  const labels = {
    DIRECT_SERVICE: "Atención directa / servicio profesional",
    PRODUCTION_SUPPORT: "Producción general (cocina, taller, fábrica)",
    ADMIN_SUPPORT: "Administración / apoyo",
  };
  return labels[role] || role;
};

// Función para obtener la etiqueta del uso overhead
const getOverheadUsageLabel = (usage) => {
  const labels = {
    PRODUCE: "Producción o prestación de servicio",
    ADMIN: "Atención o gestión",
    MIXED: "Uso general (ambas áreas)",
  };
  return labels[usage] || usage;
};

// Computed para obtener el ícono de la categoría
const getCategoryIcon = computed(() => {
  const category = props.transactionData.category;
  const icons = {
    materials: Package,
    labor: User,
    overhead: Settings,
  };
  return icons[category] || Package;
});

// Computed para obtener el ícono del tipo de gasto
const getExpenseTypeIcon = computed(() => {
  const category = props.transactionData.category;
  const icons = {
    materials: Package,
    labor: User,
    overhead: Settings,
  };
  return icons[category] || DatabaseExport;
});
</script>
