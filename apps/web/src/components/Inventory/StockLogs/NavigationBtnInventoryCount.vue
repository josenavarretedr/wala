<template>
  <div
    class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40"
  >
    <div class="max-w-4xl mx-auto px-4 py-4">
      <div class="flex items-center justify-between gap-4">
        <!-- Botón Guardar Conteo -->
        <button
          @click="handleSaveCount"
          :disabled="!canSave"
          :class="[
            'flex-1 px-6 py-3 font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2',
            canSave
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed',
          ]"
        >
          <svg
            v-if="!isLoading"
            class="w-5 h-5"
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
          <SpinnerIcon v-else size="md" />
          {{ isLoading ? "Guardando..." : buttonText }}
        </button>
      </div>

      <!-- Indicador de estado -->
      <Transition name="fade">
        <div
          v-if="canSave && !isLoading"
          class="mt-3 text-center text-sm font-medium rounded-lg py-2 px-4"
          :class="statusIndicatorClass"
        >
          {{ statusMessage }}
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useInventoryCountFlowStore } from "@/stores/Inventory/InventoryCountFlow";
import { useInventoryStore } from "@/stores/inventoryStore";
import SpinnerIcon from "@/components/ui/SpinnerIcon.vue";

const router = useRouter();
const route = useRoute();
const flow = useInventoryCountFlowStore();
const inventoryStore = useInventoryStore();
const isLoading = ref(false);

// Computed
const canSave = computed(() => {
  // Permitir guardar si el usuario ha ingresado o modificado algo
  // Ya no es necesario que haya discrepancia - puede confirmar que todo está correcto
  return flow.countData.hasUserInput;
});

const buttonText = computed(() => {
  if (flow.countData.hasDiscrepancy) {
    return "Guardar Ajuste";
  }
  return "Verificar Conteo";
});

const statusIndicatorClass = computed(() => {
  if (!flow.countData.hasDiscrepancy) {
    return "text-emerald-700 bg-emerald-50 border border-emerald-200";
  }
  if (flow.countData.difference > 0) {
    return "text-green-700 bg-green-50 border border-green-200";
  }
  return "text-red-700 bg-red-50 border border-red-200";
});

const statusMessage = computed(() => {
  if (!flow.countData.hasDiscrepancy) {
    return "✅ Stock físico coincide con el digital";
  }
  const prefix = flow.countData.difference > 0 ? "⬆️ +" : "⬇️ ";
  const unit = flow.countData.productData?.unit || "uni";
  return `${prefix}${Math.abs(flow.countData.difference).toFixed(
    2
  )} ${unit} de diferencia`;
});

// Manejadores
const handleBack = () => {
  const businessId = route.params.businessId;
  const productId = route.params.productId;

  // Resetear el flujo
  flow.resetFlow();

  // Volver a los detalles del producto
  router.push({
    name: "InventoryProductDetails",
    params: { businessId, productId },
  });
};

const handleSaveCount = async () => {
  if (!canSave.value || isLoading.value) return;

  try {
    isLoading.value = true;

    // Debug detallado antes de guardar
    console.log("💾 Guardando conteo de inventario - Datos completos:", {
      productId: flow.countData.productId,
      productData: flow.countData.productData,
      digitalStock: flow.countData.digitalStock,
      physicalStock: flow.countData.physicalStock,
      difference: flow.countData.difference,
      hasUserInput: flow.countData.hasUserInput,
      hasDiscrepancy: flow.countData.hasDiscrepancy,
      countDataComplete: flow.countData,
    });

    // Validar que los datos críticos existan
    if (!flow.countData.physicalStock && flow.countData.physicalStock !== 0) {
      throw new Error("physicalStock no está definido en countData");
    }

    if (!flow.countData.digitalStock && flow.countData.digitalStock !== 0) {
      throw new Error("digitalStock no está definido en countData");
    }

    // Guardar el conteo usando el inventoryStore
    const result = await inventoryStore.saveInventoryCount(flow.countData);

    if (result && result.success) {
      console.log("✅ Conteo guardado exitosamente:", result);

      // Mensaje de éxito más descriptivo
      let message;

      if (flow.countData.difference === 0) {
        // Sin diferencias - Verificación exitosa
        message =
          `✅ Conteo verificado correctamente\n\n` +
          `El stock físico coincide con el stock digital.\n\n` +
          `Stock verificado: ${formatNumber(flow.countData.physicalStock)} ${
            flow.countData.productData?.unit || "uni"
          }`;
      } else {
        // Con diferencias - Ajuste
        const adjustmentType =
          flow.countData.difference > 0 ? "excedente" : "faltante";
        message =
          `✅ Conteo guardado correctamente\n\n` +
          `Ajuste de ${adjustmentType}:\n` +
          `${flow.countData.difference > 0 ? "+" : ""}${formatNumber(
            flow.countData.difference
          )} ${flow.countData.productData?.unit || "uni"}\n\n` +
          `Stock anterior: ${formatNumber(flow.countData.digitalStock)} ${
            flow.countData.productData?.unit || "uni"
          }\n` +
          `Stock nuevo: ${formatNumber(flow.countData.physicalStock)} ${
            flow.countData.productData?.unit || "uni"
          }`;
      }

      alert(message);

      // Volver a los detalles del producto
      handleBack();
    } else {
      throw new Error("No se pudo guardar el conteo");
    }
  } catch (error) {
    console.error("❌ Error guardando conteo:", error);

    // Mensaje de error más específico
    const errorMessage = error.message || "Error desconocido";
    alert(
      `❌ Error al guardar el conteo\n\n${errorMessage}\n\nIntenta nuevamente.`
    );
  } finally {
    isLoading.value = false;
  }
};

const formatNumber = (value) => {
  if (value === null || value === undefined) return "0.00";
  return Number(value).toFixed(2);
};
</script>

<style scoped>
/* Animación fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}

/* Responsive */
@media (max-width: 640px) {
  button {
    font-size: 0.875rem;
    padding: 0.75rem 1rem;
  }
}
</style>
