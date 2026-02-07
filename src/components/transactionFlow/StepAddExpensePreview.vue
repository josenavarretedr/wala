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
      <!-- Total destacado -->
      <div
        v-if="hasValidData"
        class="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 text-center"
      >
        <div class="text-3xl font-bold mb-1">
          S/ {{ getTotalAmount().toFixed(2) }}
        </div>
      </div>

      <!-- Información de tipo y cuenta -->
      <div v-if="hasValidData" class="p-4 border-b border-gray-100">
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-red-50 rounded-xl p-4 text-center">
            <div
              class="w-8 h-8 bg-red-500 rounded-full mx-auto mb-2 flex items-center justify-center"
            >
              <component :is="getExpenseTypeIcon" class="w-4 h-4 text-white" />
            </div>
            <div class="text-sm font-medium text-red-700">
              {{
                getCategoryLabel(
                  transactionStore.transactionToAdd.value.category,
                )
              }}
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
            Materiales Comprados
          </h3>

          <div class="space-y-3">
            <!-- Lista de materiales -->
            <div
              v-for="material in transactionStore.transactionToAdd.value
                .materialItems"
              :key="material.uuid"
              class="bg-gray-50 rounded-xl p-4"
            >
              <div class="flex justify-between items-start">
                <div class="flex-1 min-w-0 pr-3">
                  <div class="font-semibold text-gray-900 truncate mb-1">
                    {{ material.description.trim().toUpperCase() }}
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
                {{
                  transactionStore.transactionToAdd.value.materialItems.length
                }}
                material{{
                  transactionStore.transactionToAdd.value.materialItems
                    .length !== 1
                    ? "es"
                    : ""
                }}
              </div>
              <div class="text-xl font-bold text-red-600">
                S/ {{ getTotalAmount().toFixed(2) }}
              </div>
            </div>
          </div>

          <!-- Notas para materials -->
          <div
            v-if="transactionStore.transactionToAdd.value.notes"
            class="mt-4 pt-4 border-t border-gray-200"
          >
            <div class="text-sm font-medium text-gray-700 mb-1">Notas</div>
            <div class="text-sm text-gray-600 italic bg-gray-50 p-3 rounded-lg">
              {{ transactionStore.transactionToAdd.value.notes }}
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
                  {{ transactionStore.transactionToAdd.value.description }}
                </div>
              </div>

              <!-- Categoría -->
              <div v-if="transactionStore.transactionToAdd.value.category">
                <div class="text-sm font-medium text-red-700 mb-1">
                  Categoría
                </div>
                <div class="flex items-center gap-2">
                  <component
                    :is="getCategoryIcon"
                    class="w-4 h-4 text-red-600"
                  />
                  <span class="font-medium text-red-800">
                    {{
                      getCategoryLabel(
                        transactionStore.transactionToAdd.value.category,
                      )
                    }}
                  </span>
                </div>
              </div>

              <!-- Clasificación Automática de Overhead -->
              <PremiumLockWrapper
                v-if="isOverheadExpense"
                :isPremium="isPremium"
                :isLocked="!isPremium"
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
              <div v-if="transactionStore.transactionToAdd.value.notes">
                <div class="text-sm font-medium text-red-700 mb-1">Notas</div>
                <div class="text-sm text-red-800 italic">
                  {{ transactionStore.transactionToAdd.value.notes }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Estado sin datos -->
      <div v-else class="p-8 text-center text-gray-500">
        <DatabaseExport class="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p class="text-lg font-medium mb-1">No hay información del gasto</p>
        <p class="text-sm">
          Completa los detalles en el paso anterior para ver el resumen
        </p>
      </div>
    </div>

    <!-- Botones de acción o información adicional -->
    <div
      v-if="hasValidData"
      class="bg-blue-50 rounded-xl p-4 border border-blue-200"
    >
      <div class="flex items-start gap-3">
        <div
          class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
        >
          <ShieldQuestion class="w-4 h-4 text-white" />
        </div>
        <div class="flex-1">
          <div class="font-semibold text-blue-800 mb-1">
            ¿Todo luce correcto?
          </div>
          <div class="text-sm text-blue-700">
            Revisa la información antes de continuar. Una vez registrado, el
            gasto se guardará en tu historial y afectará tus reportes
            financieros.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useTransactionStore } from "@/stores/transaction/transactionStore";
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
  Brain,
  CheckCircle,
} from "@iconoir/vue";

const transactionStore = useTransactionStore();
const route = useRoute();
const { isPremium } = useSubscription();
const { premium } = useToast();

// ========================================
// METHODS
// ========================================

const handlePremiumClick = () => {
  premium(
    "La clasificación automática con IA está disponible en Wala Premium.",
    {
      actionLink: {
        text: "Actualiza a Wala Premium",
        route: `/business/${route.params.businessId}/premium`,
      },
    },
  );
};

// ========================================
// COMPUTED PROPERTIES
// ========================================

/**
 * Verifica si es un expense de tipo materials
 */
const isMaterialsExpense = computed(() => {
  return transactionStore.transactionToAdd.value.category === "materials";
});

/**
 * Verifica si es un expense de tipo overhead
 */
const isOverheadExpense = computed(() => {
  return transactionStore.transactionToAdd.value.category === "overhead";
});

/**
 * Obtiene la clasificación automática de overhead
 */
const overheadClassification = computed(() => {
  if (!isOverheadExpense.value) return null;

  const description = transactionStore.transactionToAdd.value.description;
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
      transactionStore.transactionToAdd.value.materialItems &&
      transactionStore.transactionToAdd.value.materialItems.length > 0
    );
  }

  // Para labor/overhead: validar description y amount
  return (
    transactionStore.transactionToAdd.value.description &&
    transactionStore.transactionToAdd.value.amount
  );
});

/**
 * Calcula el total del gasto
 */
const getTotalAmount = () => {
  // Para materials: sumar todos los items
  if (isMaterialsExpense.value) {
    const items = transactionStore.transactionToAdd.value.materialItems || [];
    return items.reduce((sum, material) => {
      return sum + (material.cost || 0) * (material.quantity || 0);
    }, 0);
  }

  // Para labor/overhead: usar el amount directo
  return transactionStore.transactionToAdd.value.amount || 0;
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

// Función para formatear fecha
const formatDate = (date) => {
  return new Intl.DateTimeFormat("es-PE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};

// Computed para obtener la etiqueta del tipo de transacción
const getTypeLabel = computed(() => {
  const type = transactionStore.transactionToAdd.value.type;
  const labels = {
    income: "Ingreso",
    expense: "Gasto",
    change: "Transferencia",
  };
  return labels[type] || "Transacción";
});

// Computed para obtener la etiqueta de la cuenta
const getAccountLabel = computed(() => {
  const account = transactionStore.transactionToAdd.value.account;
  const labels = {
    cash: "Efectivo",
    bank: "Banco",
  };
  return labels[account] || "No especificado";
});

// Computed para obtener el ícono de la cuenta
const getAccountIcon = computed(() => {
  const account = transactionStore.transactionToAdd.value.account;
  return account === "cash" ? Coins : CreditCard;
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

// Computed para obtener el ícono de la categoría
const getCategoryIcon = computed(() => {
  const category = transactionStore.transactionToAdd.value.category;
  const icons = {
    materials: Package,
    labor: User,
    overhead: Settings,
  };
  return icons[category] || Package;
});

// Computed para obtener el ícono del tipo de gasto
const getExpenseTypeIcon = computed(() => {
  const category = transactionStore.transactionToAdd.value.category;
  const icons = {
    materials: Package,
    labor: User,
    overhead: Settings,
  };
  return icons[category] || DatabaseExport;
});
</script>
