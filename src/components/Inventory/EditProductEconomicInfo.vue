<template>
  <div class="space-y-6 pb-24">
    <div class="text-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800">Información Económica</h2>
      <p class="text-sm text-gray-500 mt-2">
        Define el
        {{ localFormData.type === "RAW_MATERIAL" ? "costo" : "precio" }} del
        producto
      </p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div v-if="localFormData.type !== 'RAW_MATERIAL'">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          <div class="flex items-center gap-2">
            <svg
              class="w-5 h-5 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            Precio de Venta (S/)
            <button
              type="button"
              @click="showMarginInfoModal = true"
              class="inline-flex items-center justify-center text-blue-600 hover:text-blue-700 transition-colors"
              aria-label="Ver fórmula de rentabilidad sobre el costo"
            >
              <InfoCircle class="w-4 h-4" />
            </button>
            <span class="text-xs text-gray-500">(Opcional)</span>
          </div>
        </label>
        <input
          v-model.number="localFormData.price"
          @input="handlePriceInput"
          @blur="handlePriceBlur"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
        />
        <p class="text-xs text-gray-500 mt-1">
          {{
            hasCostData
              ? "Si cambias el precio, la rentabilidad se recalcula automáticamente"
              : "Precio al que vendes este producto"
          }}
        </p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          <div class="flex items-center gap-2">
            <svg
              class="w-5 h-5 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"
              ></path>
            </svg>
            Costo
            {{
              localFormData.type === "RAW_MATERIAL" ? "de Compra (S/)" : "(S/)"
            }}
            <span
              v-if="localFormData.type !== 'RAW_MATERIAL'"
              class="text-xs text-gray-500"
            >
              (Opcional)
            </span>
          </div>
        </label>
        <input
          v-model.number="localFormData.cost"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
        />
        <p class="text-xs text-gray-500 mt-1">
          {{
            localFormData.type === "RAW_MATERIAL"
              ? "Costo de adquisición del insumo"
              : "Costo de adquisición (opcional)"
          }}
        </p>
      </div>
    </div>

    <div
      v-if="hasCostData && localFormData.type !== 'RAW_MATERIAL'"
      class="bg-gradient-to-br from-purple-50 to-cyan-50 rounded-lg p-3 border border-purple-100"
    >
      <p
        class="text-xs font-semibold text-purple-400 uppercase tracking-wide mb-2"
      >
        Crecimiento de tu inversión
      </p>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <svg
            class="w-4 h-4 text-purple-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <span class="text-xs font-medium text-purple-700">{{
            saleMarginStatus.label
          }}</span>
        </div>
        <div class="text-right">
          <p class="text-lg font-bold text-purple-800 tabular-nums">
            {{ saleMarginPercentage }}%
          </p>
        </div>
      </div>
      <p class="text-xs text-purple-500 mt-1.5">
        ¡Hiciste crecer tu inversión! <br />
        De cada compra realizada, ganas S/ {{ marginAmount }} (sobre S/
        {{ formatPrice(localFormData.cost) }} invertidos)
      </p>

      <div class="mt-3 pt-3 border-t border-purple-100">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-medium text-purple-700"
            >Ajustar rentabilidad sobre el costo</span
          >
          <span class="text-xs font-semibold text-purple-800 tabular-nums"
            >{{ saleMarginPercentage }}%</span
          >
        </div>
        <input
          :value="sliderMarginPercentage"
          @input="handleSaleMarginSliderInput"
          type="range"
          min="0"
          :max="MAX_MARGIN_PERCENT"
          step="0.5"
          class="w-full h-2 rounded-lg appearance-none cursor-pointer accent-purple-600"
        />
        <p
          v-if="Number(saleMarginPercentage) > MAX_MARGIN_PERCENT"
          class="text-[11px] text-amber-600 mt-1"
        >
          La rentabilidad actual supera {{ MAX_MARGIN_PERCENT }}%; el deslizador
          se mantiene en su tope.
        </p>
      </div>
    </div>

    <div
      class="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 rounded-xl border border-purple-100 p-4"
    >
      <button
        @click="navigateToCosting"
        type="button"
        class="w-full flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 transition-all shadow-sm hover:shadow-md transform hover:scale-[1.01] group"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0"
          >
            <svg
              class="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              ></path>
            </svg>
          </div>

          <div class="text-left">
            <div class="font-semibold text-base">Costeo Asistido</div>
            <p class="text-xs text-purple-100">
              Calcula el costo real automáticamente
            </p>
          </div>
        </div>

        <span
          class="flex items-center gap-1.5 px-3 py-1.5 bg-white text-orange-600 text-xs font-semibold rounded-full border border-white shadow-lg"
        >
          <BrightCrown class="w-4 h-4" />
          Pro
        </span>
      </button>

      <div class="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div class="flex items-center gap-2 text-purple-700">
          <svg
            class="w-3.5 h-3.5 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
          <span class="font-medium">Materiales</span>
        </div>
        <div class="flex items-center gap-2 text-purple-700">
          <svg
            class="w-3.5 h-3.5 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
          <span class="font-medium">Mano de Obra</span>
        </div>
        <div class="flex items-center gap-2 text-purple-700">
          <svg
            class="w-3.5 h-3.5 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
          <span class="font-medium">Costos Indirectos</span>
        </div>
        <div class="flex items-center gap-2 text-purple-700">
          <svg
            class="w-3.5 h-3.5 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
          <span class="font-medium">Gastos Generales</span>
        </div>
      </div>
    </div>

    <div
      v-if="localFormData.type === 'RAW_MATERIAL' && !localFormData.cost"
      class="p-4 bg-amber-50 border border-amber-200 rounded-lg"
    >
      <p class="text-sm text-amber-800">
        ℹ️ Las materias primas requieren especificar el
        <strong>costo de compra</strong>.
      </p>
    </div>

    <div
      v-else-if="
        localFormData.type !== 'RAW_MATERIAL' &&
        !localFormData.price &&
        !localFormData.cost
      "
      class="p-4 bg-blue-50 border border-blue-200 rounded-lg"
    >
      <p class="text-sm text-blue-800">
        ℹ️ Puedes especificar el <strong>precio de venta</strong>, el
        <strong>costo</strong>, o ambos.
      </p>
    </div>

    <div
      v-if="showMarginInfoModal"
      class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      @click.self="showMarginInfoModal = false"
    >
      <div
        class="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
      >
        <div
          class="flex items-center justify-between px-4 py-3 border-b border-gray-200"
        >
          <h3 class="text-xl font-extrabold text-slate-800 tracking-tight">
            ¿Cómo se calcula la rentabilidad?
          </h3>
          <img
            :src="walaLogoIcon"
            alt="Wala"
            class="w-12 h-12 object-contain"
          />
        </div>

        <div class="px-4 py-4 space-y-5">
          <div
            class="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
          >
            <span class="text-sm font-medium text-gray-700"
              >Usar mis valores</span
            >
            <button
              type="button"
              @click="showFormulaWithValues = !showFormulaWithValues"
              :aria-pressed="showFormulaWithValues"
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
              :class="showFormulaWithValues ? 'bg-purple-600' : 'bg-gray-300'"
            >
              <span
                class="inline-block h-5 w-5 transform rounded-full bg-white transition-transform"
                :class="
                  showFormulaWithValues ? 'translate-x-5' : 'translate-x-1'
                "
              />
            </button>
          </div>

          <p class="text-base text-gray-700">
            Fórmula de rentabilidad sobre el costo:
          </p>
          <div
            class="bg-purple-50 border border-purple-200 rounded-xl p-4 text-purple-900"
          >
            <div
              class="flex items-center justify-center gap-4 flex-wrap formula-text text-center"
            >
              <span>Rentabilidad % =</span>
              <span class="fraction">
                <span class="fraction-top">
                  {{
                    showFormulaWithValues
                      ? `( S/ ${formatPrice(localFormData.price)} - S/ ${formatPrice(
                          localFormData.cost,
                        )} )`
                      : "( Precio - Costo )"
                  }}
                </span>
                <span class="fraction-bottom">
                  {{
                    showFormulaWithValues
                      ? `S/ ${formatPrice(localFormData.cost)}`
                      : "Costo"
                  }}
                </span>
              </span>
              <span>× 100</span>
            </div>
          </div>

          <p class="text-base text-gray-700">
            Fórmula usada por el deslizador:
          </p>
          <div
            class="bg-cyan-50 border border-cyan-200 rounded-xl p-4 text-cyan-900"
          >
            <div
              class="flex items-center justify-center gap-4 flex-wrap formula-text text-center"
            >
              <span>Precio =</span>
              <span class="fraction">
                <span class="fraction-top">
                  {{
                    showFormulaWithValues
                      ? `S/ ${formatPrice(localFormData.cost)}`
                      : "Costo"
                  }}
                </span>
                <span class="fraction-bottom">
                  {{
                    showFormulaWithValues
                      ? `1 + (${saleMarginPercentage}% / 100)`
                      : "1 + (Rentabilidad% / 100)"
                  }}
                </span>
              </span>
            </div>
          </div>

          <div
            v-if="showFormulaWithValues"
            class="grid grid-cols-3 gap-2 text-center text-xs"
          >
            <div class="bg-orange-50 border border-orange-200 rounded-lg py-2">
              <p class="text-orange-500 font-medium">Costo</p>
              <p class="text-orange-700 font-semibold">
                S/ {{ formatPrice(localFormData.cost) }}
              </p>
            </div>
            <div class="bg-purple-50 border border-purple-200 rounded-lg py-2">
              <p class="text-purple-500 font-medium">Rentabilidad</p>
              <p class="text-purple-700 font-semibold">
                {{ saleMarginPercentage }}%
              </p>
            </div>
            <div class="bg-cyan-50 border border-cyan-200 rounded-lg py-2">
              <p class="text-cyan-600 font-medium">Precio</p>
              <p class="text-cyan-800 font-semibold">
                S/ {{ formatPrice(localFormData.price) }}
              </p>
            </div>
          </div>

          <div
            class="flex items-center justify-center gap-2 text-orange-600 pt-1"
          >
            <img
              :src="walaLogoIcon"
              alt="Wala"
              class="w-5 h-5 object-contain"
            />
            <span class="text-xl font-semibold tracking-tight">wala.lat</span>
          </div>
        </div>
      </div>
    </div>

    <NavigationBtnEditProduct
      :localData="localFormData"
      :originalData="originalData"
      :saving="saving"
      section="economic"
      @save="handleSave"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from "vue";
import { useRouter, useRoute } from "vue-router";
import { BrightCrown, InfoCircle } from "@iconoir/vue";
import { useSubscription } from "@/composables/useSubscription";
import { useToast } from "@/composables/useToast";
import { useProductMetricsStore } from "@/stores/Inventory/productMetricsStore";
import NavigationBtnEditProduct from "./NavigationBtnEditProduct.vue";
import walaLogoIcon from "@/assets/WalaLogoOF.png";

// Router
const router = useRouter();
const route = useRoute();

// Subscription & Toast
const { isPremium } = useSubscription();
const { premium } = useToast();
const metricsStore = useProductMetricsStore();

// Props
const props = defineProps({
  initialData: {
    type: Object,
    required: true,
  },
  saving: {
    type: Boolean,
    default: false,
  },
});

// Emits
const emit = defineEmits(["save"]);

// Estado local
const localFormData = ref({ ...props.initialData });
const originalData = ref({ ...props.initialData });
const saleMarginPercentage = ref("0.00");
const hasMarginBeenAdjusted = ref(false);
const syncingPriceFromMargin = ref(false);
const showMarginInfoModal = ref(false);
const showFormulaWithValues = ref(false);
const MAX_MARGIN_PERCENT = 120;

const sliderMarginPercentage = computed(() => {
  const margin = Number(saleMarginPercentage.value || "0");
  return clampMargin(margin).toFixed(2);
});

// Watch para sincronizar con props.initialData cuando cambie externamente
watch(
  () => props.initialData,
  (newData) => {
    localFormData.value = { ...newData };
    originalData.value = { ...newData };
  },
  { deep: true },
);

// Computed: Validación de datos
const hasCostData = computed(() => {
  return (
    localFormData.value.cost !== null &&
    localFormData.value.cost !== undefined &&
    localFormData.value.cost > 0
  );
});

// Computed: Cálculos de margen
const marginAmount = computed(() => {
  if (!localFormData.value.price || !localFormData.value.cost) return "0.00";
  const margin = localFormData.value.price - localFormData.value.cost;
  return margin.toFixed(2);
});

const saleMarginStatus = computed(() => {
  if (!hasCostData.value) {
    return metricsStore.getSaleMarginStatus(null);
  }
  return metricsStore.getSaleMarginStatus(
    parseFloat(saleMarginPercentage.value || "0"),
  );
});

const formatPrice = (price) => {
  if (!price && price !== 0) return "0.00";
  return Number(price).toFixed(2);
};

const clampMargin = (margin) => {
  const safeMargin = Number.isFinite(margin) ? margin : 0;
  return Math.min(MAX_MARGIN_PERCENT, Math.max(0, safeMargin));
};

const calculateSaleMarginFromPrice = (price, cost) => {
  if (!price || !cost || cost <= 0) return 0;
  return ((price - cost) / cost) * 100;
};

const calculatePriceFromSaleMargin = (margin, cost) => {
  if (!cost || cost <= 0) return 0;
  const clampedMargin = clampMargin(margin);
  return cost * (1 + clampedMargin / 100);
};

const applyPriceValidation = () => {
  if (localFormData.value.type === "RAW_MATERIAL") return;
  if (!hasCostData.value) return;
  if (!localFormData.value.price) return;

  if (localFormData.value.price < localFormData.value.cost) {
    localFormData.value.price = Number(localFormData.value.cost.toFixed(2));
  }
};

const handlePriceBlur = () => {
  applyPriceValidation();
  syncMarginFromCurrentPrice();
};

const syncMarginFromCurrentPrice = () => {
  if (!hasCostData.value || !localFormData.value.price) {
    saleMarginPercentage.value = "0.00";
    return;
  }

  const newMargin = calculateSaleMarginFromPrice(
    Number(localFormData.value.price),
    Number(localFormData.value.cost),
  );
  saleMarginPercentage.value = newMargin.toFixed(2);
};

const syncPriceFromCurrentMargin = () => {
  if (!hasCostData.value) return;

  syncingPriceFromMargin.value = true;
  const newPrice = calculatePriceFromSaleMargin(
    Number(saleMarginPercentage.value),
    Number(localFormData.value.cost),
  );
  localFormData.value.price = Number(newPrice.toFixed(2));
  syncingPriceFromMargin.value = false;
};

const handleSaleMarginSliderInput = (event) => {
  hasMarginBeenAdjusted.value = true;
  saleMarginPercentage.value = Number(event.target.value).toFixed(2);
  syncPriceFromCurrentMargin();
};

const handlePriceInput = () => {
  if (syncingPriceFromMargin.value) return;
  hasMarginBeenAdjusted.value = false;
};

watch(
  () => [localFormData.value.cost, localFormData.value.type],
  () => {
    if (localFormData.value.type === "RAW_MATERIAL") return;

    if (!hasCostData.value) {
      hasMarginBeenAdjusted.value = false;
      saleMarginPercentage.value = "0.00";
      return;
    }

    if (hasMarginBeenAdjusted.value) {
      syncPriceFromCurrentMargin();
      return;
    }

    if (!localFormData.value.price) {
      localFormData.value.price = Number(localFormData.value.cost.toFixed(2));
      saleMarginPercentage.value = "0.00";
      return;
    }

    syncMarginFromCurrentPrice();
  },
  { immediate: true },
);

watch(
  () => localFormData.value.price,
  () => {
    if (localFormData.value.type === "RAW_MATERIAL") return;
    if (syncingPriceFromMargin.value) return;

    syncMarginFromCurrentPrice();
  },
);

// Método para navegar al costeo asistido
const navigateToCosting = () => {
  // Validar si el usuario es premium
  if (!isPremium.value) {
    // Mostrar toast informativo
    nextTick(() => {
      premium("Costea cada producto adecuadamente", {
        actionLink: {
          text: "Actualiza a Wala Pro",
          route: `/business/${route.params.businessId}/premium`,
        },
      });

      console.log("🔔 Toast de Costeo Asistido Premium mostrado");
    });
    return;
  }

  // Si es premium, navegar al costeo asistido
  router.push({
    name: "InventoryProductCosting",
    params: {
      businessId: route.params.businessId,
      productId: route.params.productId,
    },
  });
};

// Método para manejar el guardado
const handleSave = (payload) => {
  applyPriceValidation();
  syncMarginFromCurrentPrice();
  emit("save", payload);
};
</script>

<style scoped>
/* Animaciones suaves */
input,
button {
  transition: all 0.2s ease;
}

/* Mejoras de accesibilidad */
button:focus,
input:focus {
  outline: none;
}

/* Estados hover mejorados */
button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

button:active:not(:disabled) {
  transform: translateY(0);
}

/* Animación de pulso para badge premium */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Efecto de brillo en el botón premium */
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.formula-text {
  font-size: 1.1rem;
  font-weight: 700;
  line-height: 1.2;
}

.fraction {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  min-width: 180px;
}

.fraction-top {
  width: 100%;
  text-align: center;
  border-bottom: 3px solid currentColor;
  padding: 0 0.25rem 0.2rem;
}

.fraction-bottom {
  width: 100%;
  text-align: center;
  padding-top: 0.2rem;
}

@media (max-width: 768px) {
  .formula-text {
    font-size: 1rem;
  }

  .fraction {
    min-width: 160px;
  }
}
</style>
