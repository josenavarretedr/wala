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

      <!-- Step 1: Costo por Hora -->
      <Step1Card
        :period="selectedPeriod"
        :product-id="productId"
        :product-name="productName"
        :expanded="steps.step1.expanded"
        :completed="steps.step1.completed"
        :initial-data="steps.step1.data"
        @toggle="toggleStep('step1')"
        @confirm="handleStep1Confirm"
      />

      <!-- Step 2: Tiempo Necesario -->
      <Step2Card
        :product-id="productId"
        :product-name="productName"
        :product-unit="productUnit"
        :expanded="steps.step2.expanded"
        :completed="steps.step2.completed"
        :initial-data="steps.step2.data"
        @toggle="toggleStep('step2')"
        @confirm="handleStep2Confirm"
      />

      <!-- Step 3: MOD por Unidad -->
      <Step3Card
        :cost-per-hour="steps.step1.data.costPerHour || 0"
        :total-time-required="steps.step2.data.totalTimeRequired || 0"
        :step1-data="steps.step1.data"
        :step2-data="steps.step2.data"
        :product-id="productId"
        :product-unit="productUnit"
        :period-summary="periodSummaryText"
        :period="selectedPeriod"
        :expanded="steps.step3.expanded"
        :completed="steps.step3.completed"
        @toggle="toggleStep('step3')"
        @save="handleSave"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useProductCostingStore } from "@/stores/productCostingStore";
import { useInventory } from "@/composables/useInventory";
import { useToast } from "@/composables/useToast";
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
const toast = useToast();

// State
const productId = ref(route.params.productId);
const productName = ref("Cargando...");
const productUnit = ref("uni");

const selectedPeriod = ref({
  period: "current_month",
  startDate: null,
  endDate: null,
});

const steps = ref({
  step1: {
    expanded: true,
    completed: false,
    data: {
      costPerHour: null,
      totalMOD: null,
      workingDays: null,
      productiveHoursPerDay: null,
      selectedExpenseIds: [],
      selectedExpensesDetails: [],
    },
  },
  step2: {
    expanded: false,
    completed: false,
    data: {
      baseTimeRequired: null,
      managementTimeAdded: false,
      totalTimeRequired: null,
    },
  },
  step3: {
    expanded: false,
    completed: false,
    data: {
      modPerUnit: null,
    },
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

  toast.success("Costo por hora calculado correctamente", { duration: 2000 });
  console.log("✅ Step 1 completado:", data);
};

const handleStep2Confirm = (data) => {
  // Guardar datos del step 2
  steps.value.step2.data = data;
  steps.value.step2.completed = true;

  // Colapsar step 2 y expandir step 3
  steps.value.step2.expanded = false;
  steps.value.step3.expanded = true;

  toast.success("Tiempo necesario configurado", { duration: 2000 });
  console.log("✅ Step 2 completado:", data);
};

const handleSave = async (data) => {
  try {
    const modPerUnit = data.modPerUnit;

    console.log("💾 Guardando costo MOD:", {
      productId: productId.value,
      modPerUnit,
      period: selectedPeriod.value,
      step1: steps.value.step1.data,
      step2: steps.value.step2.data,
    });

    // Guardar en el store
    costingStore.updateMODCost(modPerUnit, data.modData?.calculation);

    // Marcar step 3 como completado
    steps.value.step3.completed = true;
    steps.value.step3.data.modPerUnit = modPerUnit;

    // Mostrar mensaje de éxito con toast
    toast.success(
      `¡Costo MOD guardado! S/ ${modPerUnit.toFixed(2)} por ${productUnit.value}`,
      { duration: 3000 },
    );

    // Redireccionar después de 2 segundos
    setTimeout(() => {
      goBack();
    }, 2000);
  } catch (error) {
    console.error("Error guardando costo MOD:", error);
    toast.error("Error al guardar el costo MOD. Intenta nuevamente.", {
      duration: 4000,
    });
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
/* Estilos específicos si son necesarios */
</style>
