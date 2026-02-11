<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
      <div class="max-w-4xl mx-auto px-4 py-4">
        <div class="flex items-center gap-3">
          <BackBtn
            :route-name="'InventoryProductCosting'"
            :route-params="{
              businessId: route.params.businessId,
              productId: route.params.productId,
            }"
            tooltip-text="Volver al costeo"
          />
          <div class="flex-1">
            <h1 class="text-2xl font-bold text-gray-900">Calcular Costo MOD</h1>
            <p class="text-sm text-gray-600 mt-1">{{ productName }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <!-- Selector de Período (compartido) -->
      <PeriodSelector v-model="selectedPeriod" :allow-custom-range="true" />

      <!-- Step 1: MOD Total -->
      <Step1Card
        :period="selectedPeriod"
        :expanded="steps.step1.expanded"
        :completed="steps.step1.completed"
        :initial-value="steps.step1.data.totalMOD"
        @toggle="toggleStep('step1')"
        @confirm="handleStep1Confirm"
      />

      <!-- Step 2: Cantidad Vendida -->
      <Step2Card
        :product-id="productId"
        :product-name="productName"
        :product-unit="productUnit"
        :period="selectedPeriod"
        :expanded="steps.step2.expanded"
        :completed="steps.step2.completed"
        :initial-value="steps.step2.data.totalQuantity"
        @toggle="toggleStep('step2')"
        @confirm="handleStep2Confirm"
      />

      <!-- Step 3: MOD por Unidad -->
      <Step3Card
        :total-m-o-d="steps.step1.data.totalMOD || 0"
        :total-quantity="steps.step2.data.totalQuantity || 0"
        :product-unit="productUnit"
        :period-summary="periodSummaryText"
        :expanded="steps.step3.expanded"
        :completed="steps.step3.completed"
        @toggle="toggleStep('step3')"
        @save="handleSave"
      />
    </div>

    <!-- Success Message -->
    <transition name="slide-up">
      <div
        v-if="showSuccess"
        class="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-4 rounded-lg shadow-2xl z-50 flex items-center gap-3"
      >
        <svg
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
        <span class="font-semibold">¡Costo MOD guardado exitosamente!</span>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useProductCostingStore } from "@/stores/productCostingStore";
import { useInventory } from "@/composables/useInventory";
import BackBtn from "@/components/ui/BackBtn.vue";
import PeriodSelector from "@/components/ProductCosting/PeriodSelector.vue";
import Step1Card from "@/components/ProductCosting/Step1Card.vue";
import Step2Card from "@/components/ProductCosting/Step2Card.vue";
import Step3Card from "@/components/ProductCosting/Step3Card.vue";

// Router
const route = useRoute();
const router = useRouter();

// Stores & Composables
const costingStore = useProductCostingStore();
const { getProductById } = useInventory();

// State
const productId = ref(route.params.productId);
const productName = ref("Cargando...");
const productUnit = ref("uni");
const showSuccess = ref(false);

const selectedPeriod = ref({
  period: "current_month",
  startDate: null,
  endDate: null,
});

const steps = ref({
  step1: {
    expanded: true,
    completed: false,
    data: { totalMOD: null, hasHistoricalData: false },
  },
  step2: {
    expanded: false,
    completed: false,
    data: { totalQuantity: null, hasHistoricalData: false },
  },
  step3: {
    expanded: false,
    completed: false,
    data: { modPerUnit: null },
  },
});

// Computed
const periodSummaryText = computed(() => {
  if (!selectedPeriod.value.startDate || !selectedPeriod.value.endDate) {
    return "";
  }

  const start = selectedPeriod.value.startDate.toDate();
  const end = selectedPeriod.value.endDate.toDate();

  const formatDate = (date) => {
    return new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  return `${formatDate(start)} - ${formatDate(end)}`;
});

// Methods
const toggleStep = (stepKey) => {
  // Permitir expandir/colapsar cualquier step
  steps.value[stepKey].expanded = !steps.value[stepKey].expanded;
};

const handleStep1Confirm = (data) => {
  // Guardar datos del step 1
  steps.value.step1.data = data;
  steps.value.step1.completed = true;

  // Colapsar step 1 y expandir step 2
  steps.value.step1.expanded = false;
  steps.value.step2.expanded = true;

  console.log("✅ Step 1 completado:", data);
};

const handleStep2Confirm = (data) => {
  // Guardar datos del step 2
  steps.value.step2.data = data;
  steps.value.step2.completed = true;

  // Colapsar step 2 y expandir step 3
  steps.value.step2.expanded = false;
  steps.value.step3.expanded = true;

  console.log("✅ Step 2 completado:", data);
};

const handleSave = async (data) => {
  try {
    const modPerUnit = data.modPerUnit;

    console.log("💾 Guardando costo MOD:", {
      productId: productId.value,
      modPerUnit,
      period: selectedPeriod.value,
      totalMOD: steps.value.step1.data.totalMOD,
      totalQuantity: steps.value.step2.data.totalQuantity,
    });

    // Guardar en el store
    costingStore.updateMODCost(modPerUnit);

    // Marcar step 3 como completado
    steps.value.step3.completed = true;
    steps.value.step3.data.modPerUnit = modPerUnit;

    // Mostrar mensaje de éxito
    showSuccess.value = true;

    // Redireccionar después de 2 segundos
    setTimeout(() => {
      showSuccess.value = false;
      goBack();
    }, 2000);
  } catch (error) {
    console.error("Error guardando costo MOD:", error);
    alert("Error al guardar el costo MOD. Por favor, intenta nuevamente.");
  }
};

const goBack = () => {
  // Volver a la vista de costeo del producto
  router.push({
    name: "InventoryProductCosting",
    params: {
      businessId: route.params.businessId,
      productId: route.params.productId,
    },
  });
};

const loadProductData = async () => {
  try {
    const product = await getProductById(productId.value);

    if (product) {
      productName.value = product.description || "Producto";
      productUnit.value = product.unit || "uni";

      console.log("✅ Producto cargado:", {
        id: productId.value,
        name: productName.value,
        unit: productUnit.value,
      });
    }
  } catch (error) {
    console.error("Error cargando datos del producto:", error);
    productName.value = "Error cargando producto";
  }
};

// Lifecycle
onMounted(() => {
  // Inicializar el store si es necesario
  if (route.params.productId) {
    costingStore.initializeProduct(route.params.productId);
  }

  loadProductData();
});
</script>

<style scoped>
/* Animación para el mensaje de éxito */
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translate(-50%, 20px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

.slide-up-enter-active {
  animation: slide-up 0.3s ease-out;
}

.slide-up-leave-active {
  animation: slide-up 0.3s ease-out reverse;
}
</style>
