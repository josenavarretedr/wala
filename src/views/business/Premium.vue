<template>
  <div class="min-h-screen py-12 px-4">
    <div class="max-w-5xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12">
        <div class="flex justify-center mb-6">
          <div
            class="inline-flex items-center gap-2 px-4 py-2 bg-white text-orange-600 text-xs font-semibold rounded-full border-orange-600 shadow-lg"
          >
            <BrightCrown class="w-4 h-4" />
            Pro
          </div>
        </div>

        <h1
          class="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 mb-6"
        >
          WALA <span class="text-orange-500">Pro</span>
        </h1>

        <p class="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto">
          Organiza tu negocio, entiende tus números y toma mejores decisiones
          con mi copiloto empresarial.
        </p>
      </div>

      <div class="mb-8" id="payment-container">
        <!-- Selector de planes -->
        <h2 class="text-2xl font-bold text-gray-900 text-center mb-6">
          Elige tu plan
        </h2>

        <PlanSelector v-model="selectedPlan" />

        <!-- CTA Global -->
        <button
          v-if="isPaidPlan"
          @click="openPaymentModal"
          :disabled="isProcessing"
          class="w-full sm:w-auto mx-auto block bg-gradient-to-r from-blue-500 to-blue-600 text-white px-10 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isProcessing ? "Procesando..." : "Continuar con el pago" }}
        </button>
        <p v-else class="text-center text-sm text-gray-500 font-medium">
          El plan Free no requiere pago.
        </p>

        <!-- Mensaje de seguridad Mercado Pago -->
        <div
          class="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-gray-200"
        >
          <span class="text-xs text-gray-600">Pago seguro procesado con</span
          ><img
            src="@/assets/mercadopago-seeklogo.png"
            alt="Mercado Pago"
            class="h-6 object-contain"
          />
        </div>
      </div>

      <div
        class="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 mb-8"
      >
        <p class="text-center text-gray-600">
          Selecciona el plan que mejor se adapta a tu negocio. Puedes pagar con
          tarjeta o Yape para planes Pro y Max.
        </p>
      </div>
    </div>

    <!-- Payment Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showPaymentModal"
          class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm overflow-y-auto"
          @click.self="closePaymentModal"
        >
          <div
            class="min-h-screen md:min-h-0 md:flex md:items-center md:justify-center md:p-4"
          >
            <div
              class="bg-white md:rounded-2xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 min-h-screen md:min-h-0 md:my-8 transform transition-all"
            >
              <!-- Header -->
              <div class="flex justify-between items-center mb-6">
                <h3 class="text-xl sm:text-2xl font-bold text-gray-900">
                  Completa tu pago
                </h3>
                <button
                  @click="closePaymentModal"
                  class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <!-- Resumen del plan -->
              <div
                class="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 mb-6 border border-blue-100"
              >
                <div class="flex justify-between items-center">
                  <span class="text-sm font-medium text-gray-600"
                    >Plan seleccionado</span
                  >
                  <span class="font-bold text-gray-900">{{
                    currentPlanName
                  }}</span>
                </div>
                <div class="flex justify-between items-center mt-2">
                  <span class="text-sm font-medium text-gray-600"
                    >Total a pagar</span
                  >
                  <span class="text-2xl font-bold text-blue-600">{{
                    formattedAmount
                  }}</span>
                </div>
              </div>

              <!-- Tabs de métodos de pago -->
              <div class="grid grid-cols-2 gap-3 mb-6">
                <button
                  @click="selectedPaymentMethod = 'yape'"
                  :class="[
                    'flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-all',
                    selectedPaymentMethod === 'yape'
                      ? 'bg-purple-600 text-white shadow-md ring-2 ring-purple-200'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200',
                  ]"
                >
                  <img
                    src="/yape-app-seeklogo.png"
                    alt="Yape"
                    class="w-5 h-5 object-contain"
                  />
                  <span>Yape</span>
                </button>
                <button
                  @click="selectedPaymentMethod = 'card'"
                  :class="[
                    'flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-all',
                    selectedPaymentMethod === 'card'
                      ? 'bg-blue-500 text-white shadow-md ring-2 ring-blue-200'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200',
                  ]"
                >
                  <CreditCard class="w-5 h-5" />
                  <span>Tarjeta</span>
                </button>
              </div>

              <!-- Contenedor del Payment Brick (Tarjetas) -->
              <div
                v-show="selectedPaymentMethod === 'card'"
                id="paymentBrick_container"
              ></div>

              <!-- Componente Yape -->
              <YapePayment
                v-if="selectedPaymentMethod === 'yape'"
                :amount="PLAN_CONFIGS[selectedPlan].amount"
                :business-id="businessId"
                :plan-type="selectedPlan"
                @success="handlePaymentSuccess"
                @error="handlePaymentError"
              />

              <!-- Mensaje de seguridad Mercado Pago -->
              <div
                class="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-gray-200"
              >
                <span class="text-xs text-gray-600"
                  >Pago seguro procesado con</span
                ><img
                  src="@/assets/mercadopago-seeklogo.png"
                  alt="Mercado Pago"
                  class="h-6 object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal de éxito -->
    <PaymentSuccessModal
      :show="showSuccessModal"
      :payment-data="paymentResult"
      :business-id="businessId"
      @close="showSuccessModal = false"
    />

    <!-- Mensaje sobre programas -->
    <div
      class="bg-white rounded-2xl border border-purple-100 p-6 sm:p-8 text-center"
    >
      <p class="text-gray-700 mb-4">
        ¿Sabías que puedes acceder a WALA Pro a través de un
        <span class="font-semibold text-purple-600"
          >programa de fortalecimiento empresarial</span
        >?
      </p>
      <button
        @click="goToPrograms"
        class="text-purple-600 hover:text-purple-700 font-medium underline underline-offset-2"
      >
        Consultar programas disponibles
      </button>
    </div>
  </div>

  <!-- Loading script de Mercado Pago -->
  <div
    v-if="!mpScriptLoaded"
    class="fixed inset-0 bg-white z-50 flex items-center justify-center"
  >
    <div class="text-center">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"
      ></div>
      <p class="text-gray-600">Cargando...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useBusinessStore } from "@/stores/businessStore";
import { useMercadoPago } from "@/composables/useMercadoPago";
import { useToast } from "@/composables/useToast";
import { BrightCrown, CreditCard } from "@iconoir/vue";
import PlanSelector from "@/components/payments/PlanSelector.vue";
import PaymentSuccessModal from "@/components/payments/PaymentSuccessModal.vue";
import YapePayment from "@/components/payments/YapePayment.vue";

const router = useRouter();
const route = useRoute();
const businessStore = useBusinessStore();
const { renderPaymentBrick, unmountBrick } = useMercadoPago();
const { showToast } = useToast();

const businessId = computed(
  () => businessStore.currentBusinessId || route.params.businessId,
);
const selectedPlan = ref("pro_monthly");
const selectedPaymentMethod = ref("card"); // 'card' o 'yape'
const showPaymentModal = ref(false);
const showSuccessModal = ref(false);
const isProcessing = ref(false);
const paymentResult = ref({});
const mpScriptLoaded = ref(false);

const PLAN_CONFIGS = {
  free: { name: "Free", amount: 0.0 },
  pro_monthly: { name: "Pro Mensual", amount: 50.0 },
  pro_yearly: { name: "Pro Anual", amount: 500.0 },
  max: { name: "Max", amount: 360.0 },
};

const isPaidPlan = computed(() => selectedPlan.value !== "free");

const currentPlanName = computed(() => PLAN_CONFIGS[selectedPlan.value].name);
const formattedAmount = computed(
  () => `S/ ${PLAN_CONFIGS[selectedPlan.value].amount.toFixed(2)}`,
);

const loadMercadoPagoScript = () => {
  return new Promise((resolve, reject) => {
    if (window.MercadoPago) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://sdk.mercadopago.com/js/v2";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Error cargando Mercado Pago SDK"));
    document.head.appendChild(script);
  });
};

const openPaymentModal = async () => {
  try {
    if (!isPaidPlan.value) {
      showToast({
        type: "info",
        message: "El plan Free no requiere pago.",
      });
      return;
    }

    if (!businessId.value) {
      showToast({
        type: "error",
        message: "No se pudo identificar el negocio. Recarga la página.",
      });
      return;
    }

    showPaymentModal.value = true;
    isProcessing.value = true;
  } catch (error) {
    console.error("Error abriendo modal de pago:", error);
    showToast({
      type: "error",
      message: "Error al cargar el formulario de pago. Intenta nuevamente.",
    });
    showPaymentModal.value = false;
  } finally {
    isProcessing.value = false;
  }
};

const closePaymentModal = () => {
  unmountBrick();
  showPaymentModal.value = false;
  selectedPaymentMethod.value = "card";
};

const handlePaymentSuccess = (data) => {
  console.log("🎉 Pago exitoso recibido en UI:", data);

  paymentResult.value = data;
  closePaymentModal();
  showSuccessModal.value = true;

  // Refrescar datos del negocio
  if (businessId.value) {
    businessStore.loadBusiness(businessId.value);
  }
};

const handlePaymentError = (error) => {
  console.error("❌ Error en pago:", error);

  showToast({
    type: "error",
    message: error.message || "Error procesando el pago. Intenta nuevamente.",
  });
};

const goToPrograms = () => {
  if (businessId.value) {
    router.push(`/business/${businessId.value}/programs`);
  }
};

onMounted(async () => {
  try {
    await loadMercadoPagoScript();
    mpScriptLoaded.value = true;
  } catch (error) {
    console.error("Error cargando Mercado Pago:", error);
    showToast({
      type: "error",
      message: "Error cargando el sistema de pagos. Recarga la página.",
    });
  }
});

watch([selectedPaymentMethod, showPaymentModal], async ([method, isOpen]) => {
  if (!isOpen) {
    await unmountBrick();
    return;
  }

  if (method !== "card" || !isPaidPlan.value) {
    await unmountBrick();
    return;
  }

  await nextTick();
  const planConfig = PLAN_CONFIGS[selectedPlan.value];
  if (!planConfig) return;

  try {
    console.log("🔍 Datos para renderizar Brick:", {
      businessId: businessId.value,
      planType: selectedPlan.value,
      amount: planConfig.amount,
    });

    await renderPaymentBrick(
      "paymentBrick_container",
      planConfig.amount,
      businessId.value,
      selectedPlan.value,
      handlePaymentSuccess,
      handlePaymentError,
    );
  } catch (error) {
    console.error("Error renderizando Brick al cambiar método:", error);
  }
});

watch(selectedPlan, async () => {
  if (!showPaymentModal.value || selectedPaymentMethod.value !== "card") {
    return;
  }

  await nextTick();
  const planConfig = PLAN_CONFIGS[selectedPlan.value];
  if (!planConfig) return;

  try {
    await renderPaymentBrick(
      "paymentBrick_container",
      planConfig.amount,
      businessId.value,
      selectedPlan.value,
      handlePaymentSuccess,
      handlePaymentError,
    );
  } catch (error) {
    console.error("Error renderizando Brick al cambiar plan:", error);
  }
});

onUnmounted(() => {
  unmountBrick();
});
</script>

<style scoped>
/* Modal transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.3s ease;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.95) translateY(20px);
}

/* Animaciones sutiles */
button {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
