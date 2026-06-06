<template>
  <div class="min-h-screen py-12 px-4 relative">
    <div class="max-w-5xl mx-auto space-y-8">
      <!-- VISTA SUSCRIPCIÓN ACTIVA (Pro, Max o Trial) -->
      <div v-if="isPremium" class="space-y-8 animate-fade-in">
        <div
          :class="[
            'relative overflow-hidden rounded-3xl p-8 sm:p-10 shadow-2xl text-white transition-all duration-300 transform hover:scale-[1.01]',
            headerBgClass,
          ]"
        >
          <!-- Gráfico decorativo de fondo -->
          <div
            class="absolute -right-6 -bottom-6 opacity-10 pointer-events-none"
          >
            <svg class="w-64 h-64" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3 6h6l-5 4 2 6-6-4-6 4 2-6-5-4h6z" />
            </svg>
          </div>

          <div
            class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div class="space-y-4">
              <div
                class="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider"
              >
                <Gift v-if="planInfo.status === 'trial'" class="w-4 h-4" />
                <BrightCrown v-else class="w-4 h-4" />
                <span>{{
                  planInfo.status === "trial"
                    ? "Prueba Gratuita Pro"
                    : "Suscripción Activa"
                }}</span>
              </div>

              <h1
                class="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-none"
              >
                Plan WALA
                <span class="underline decoration-wavy decoration-white/50">{{
                  planInfo.name
                }}</span>
              </h1>

              <p
                class="text-white/95 text-sm sm:text-base max-w-xl font-medium leading-relaxed"
              >
                ¡Tu copiloto empresarial está activo! Disfrutas de todas las
                herramientas avanzadas para optimizar la rentabilidad y el
                control de tu negocio.
              </p>
            </div>

            <!-- Indicador de Tiempo Transcurrido -->
            <div
              class="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 text-center min-w-[160px] self-start md:self-auto"
            >
              <span
                class="text-xs font-bold text-white/70 block uppercase tracking-wider"
                >Duración Activa</span
              >
              <span class="text-3xl font-black mt-1 block">
                {{ timeElapsed }}
              </span>
              <span
                class="text-[10px] text-white/60 block mt-1 uppercase tracking-wider"
                >transcurrido</span
              >
            </div>
          </div>
        </div>

        <!-- Detalles de la Suscripción y Soporte -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Ficha de Datos Técnicos -->
          <div
            class="md:col-span-2 bg-white/90 backdrop-blur-md border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6"
          >
            <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">
              <svg
                class="w-5 h-5 text-indigo-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>Detalles del Plan</span>
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <!-- Item 1 -->
              <div class="space-y-1">
                <span
                  class="text-xs font-semibold text-gray-400 block uppercase tracking-wider"
                  >Fecha de Inicio</span
                >
                <span class="text-sm font-bold text-gray-800">{{
                  formattedStartDate
                }}</span>
              </div>

              <!-- Item 2 -->
              <div class="space-y-1">
                <span
                  class="text-xs font-semibold text-gray-400 block uppercase tracking-wider"
                >
                  {{
                    planInfo.status === "trial"
                      ? "Fin de la Prueba"
                      : "Próxima Renovación"
                  }}
                </span>
                <span
                  class="text-sm font-bold text-gray-800 flex items-center gap-1.5"
                >
                  <span>{{ formattedEndDate }}</span>
                  <span
                    v-if="subscription.autoRenew"
                    class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[9px] uppercase"
                    >Auto</span
                  >
                </span>
              </div>

              <!-- Item 3 -->
              <div class="space-y-1">
                <span
                  class="text-xs font-semibold text-gray-400 block uppercase tracking-wider"
                  >Método de Pago</span
                >
                <span
                  class="text-sm font-bold text-gray-800 flex items-center gap-2"
                >
                  <span
                    v-if="paymentMethodName === 'Yape'"
                    class="inline-flex items-center gap-1.5 text-purple-700 bg-purple-50 px-2.5 py-1 rounded-xl border border-purple-200"
                  >
                    <span class="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                    Yape
                  </span>
                  <span
                    v-else-if="paymentMethodName === 'Tarjeta'"
                    class="inline-flex items-center gap-1.5 text-blue-750 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-200"
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
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                    Tarjeta {{ cardLastFour ? `•••• ${cardLastFour}` : "" }}
                  </span>
                  <span v-else class="text-gray-750 font-bold">
                    {{ paymentMethodName }}
                  </span>
                </span>
              </div>

              <!-- Item 4 -->
              <div class="space-y-1">
                <span
                  class="text-xs font-semibold text-gray-400 block uppercase tracking-wider"
                  >Importe de Facturación</span
                >
                <span class="text-sm font-extrabold text-gray-850">{{
                  formattedPlanPrice
                }}</span>
              </div>
            </div>

            <!-- Botón de Reset para pruebas del usuario -->
            <div
              class="pt-6 border-t border-gray-150 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <span class="text-xs font-bold text-gray-400 block"
                  >Zona de Pruebas de Desarrollo</span
                >
                <span class="text-[11px] text-gray-450 block"
                  >Puedes degradar tu cuenta a Free para probar el flujo de
                  checkout nuevamente.</span
                >
              </div>
              <button
                @click="handleResetToFree"
                :disabled="isProcessing"
                class="px-4 py-2 border border-[#E35336] text-[#E35336] hover:bg-[#E35336]/5 disabled:opacity-50 text-xs font-bold rounded-xl transition-all"
              >
                {{
                  isProcessing
                    ? "Degradando..."
                    : "Volver a Plan Free (Pruebas)"
                }}
              </button>
            </div>
          </div>

          <!-- Tarjeta de Contacto / Soporte -->
          <div
            class="bg-white/90 backdrop-blur-md border border-gray-100 rounded-3xl p-6 sm:p-8 text-gray-800 flex flex-col justify-between shadow-xl min-h-[280px]"
          >
            <div class="space-y-4">
              <h4
                class="text-base font-bold text-gray-900 flex items-center gap-2"
              >
                <svg
                  class="w-5 h-5 text-indigo-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>¿Necesitas asistencia?</span>
              </h4>
              <p class="text-xs text-gray-500 leading-relaxed font-medium">
                Si requieres cambiar tu medio de pago, gestionar tu suscripción
                comercial o reportar dudas, nuestro canal personalizado está
                siempre a tu disposición.
              </p>
            </div>

            <div class="space-y-3 pt-6">
              <a
                href="https://wa.me/51921492993?text=Hola,%20necesito%20ayuda%20con%20mi%20suscripci%C3%B3n"
                target="_blank"
                class="flex items-center justify-center gap-2 w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-[0.98]"
              >
                <svg class="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path
                    d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.588 2.01 14.12 1.01 11.5 1.01 6.062 1.01 1.635 5.382 1.63 10.814c-.001 1.761.469 3.479 1.362 5.011L2.012 21.48l5.808-1.52c1.47.8 3.11 1.22 4.827 1.22zm11.31-7.18c-.302-.15-1.787-.88-2.067-.98-.28-.1-.483-.15-.687.15-.203.3-.787.98-.965 1.18-.177.2-.355.225-.657.075-1.04-.52-1.805-1.025-2.52-2.26-.19-.32-.19-.607-.09-.767.09-.15.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.687-1.656-.942-2.27-.247-.597-.5-.515-.687-.525-.177-.01-.38-.01-.583-.01-.203 0-.533.075-.812.38-.28.305-1.066 1.042-1.066 2.54 0 1.498 1.09 2.946 1.242 3.146.152.2 2.146 3.278 5.197 4.594.725.313 1.29.5 1.73.64.728.23 1.39.198 1.914.12.583-.087 1.787-.73 2.04-1.433.253-.703.253-1.305.177-1.43-.076-.127-.28-.2-.58-.35z"
                  />
                </svg>
                <!-- <Whatsapp></Whatsapp> -->
                <span>Contacto por WhatsApp</span>
              </a>
              <button
                @click="goBack"
                class="w-full text-center text-xs text-gray-500 hover:text-gray-700 font-bold py-2 transition-colors"
              >
                Volver al Dashboard
              </button>
            </div>
          </div>
        </div>

        <!-- Lista de Beneficios Desbloqueados -->
        <div
          class="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl space-y-6"
        >
          <h3 class="text-lg font-bold text-gray-900">
            Beneficios Desbloqueados en tu Cuenta
          </h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div
              v-for="(feat, idx) in activeFeaturesList"
              :key="idx"
              class="flex items-start gap-2.5 p-3 rounded-2xl bg-gray-50 border border-gray-100"
            >
              <span
                class="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs shrink-0 mt-0.5"
                >✓</span
              >
              <div>
                <span class="text-xs font-bold text-gray-800 block">{{
                  feat.title
                }}</span>
                <span
                  class="text-2xs text-gray-400 block mt-0.5 leading-normal"
                  >{{ feat.desc }}</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- VISTA COMPRA DE PLANES (isPremium === false) -->
      <div v-else class="space-y-8 animate-fade-in">
        <!-- Header -->
        <div class="text-center mb-12">
          <div class="flex justify-center mb-6">
            <div
              class="inline-flex items-center gap-2 px-4 py-2 bg-white text-orange-600 text-xs font-semibold rounded-full border border-orange-100 shadow-lg"
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

          <p
            class="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto font-medium"
          >
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

          <button
            v-if="isPaidPlan"
            @click="openPaymentModal"
            :disabled="isProcessing"
            class="w-full sm:w-auto mx-auto block bg-[#E35336] hover:bg-[#c94227] text-white px-10 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <span class="text-xs text-gray-600">Pago seguro procesado con</span>
            <img
              src="@/assets/mercadopago-seeklogo.png"
              alt="Mercado Pago"
              class="h-6 object-contain"
            />
          </div>
        </div>

        <div
          class="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 mb-8"
        >
          <p class="text-center text-gray-600 font-medium">
            Selecciona el plan que mejor se adapta a tu negocio. Puedes pagar
            con tarjeta o Yape para planes Pro y Max.
          </p>
        </div>
      </div>

      <!-- Mensaje informativo común sobre programas -->
      <div
        class="bg-white rounded-2xl border border-purple-100 p-6 sm:p-8 text-center"
      >
        <p class="text-gray-700 mb-4 text-sm font-medium">
          ¿Sabías que puedes acceder a WALA Pro a través de un
          <span class="font-semibold text-purple-600"
            >programa de fortalecimiento empresarial</span
          >?
        </p>
        <button
          @click="goToPrograms"
          class="text-purple-600 hover:text-purple-700 font-bold text-sm underline underline-offset-2"
        >
          Consultar programas disponibles
        </button>
      </div>
    </div>

    <!-- Payment Modal (Mercado Pago / Yape) -->
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
                class="bg-blue-50/70 rounded-xl p-4 mb-6 border border-blue-100"
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

    <!-- Loading script de Mercado Pago -->
    <div
      v-if="!mpScriptLoaded"
      class="fixed inset-0 bg-white z-50 flex items-center justify-center"
    >
      <div class="text-center">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"
        ></div>
        <p class="text-gray-600 font-medium">Cargando pasarela...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useBusinessStore } from "@/stores/businessStore";
import { useMercadoPago } from "@/composables/useMercadoPago";
import { useToast } from "@/composables/useToast";
import { useSubscription } from "@/composables/useSubscription";
import { BrightCrown, CreditCard, Gift } from "@iconoir/vue";
import PlanSelector from "@/components/payments/PlanSelector.vue";
import PaymentSuccessModal from "@/components/payments/PaymentSuccessModal.vue";
import YapePayment from "@/components/payments/YapePayment.vue";

const router = useRouter();
const route = useRoute();
const businessStore = useBusinessStore();
const { renderPaymentBrick, unmountBrick } = useMercadoPago();
const { showToast } = useToast();

const { isPremium, isPro, isMax, subscription, daysRemaining, planInfo } =
  useSubscription();

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

// ==========================================
// 🔐 LÓGICA DE DETALLES DE PLAN ACTIVO (PREMIUM)
// ==========================================

const headerBgClass = computed(() => {
  return "bg-wala-brand";
});

const formatDate = (timestamp) => {
  if (!timestamp) return "No disponible";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formattedStartDate = computed(() => {
  const sub = subscription.value;
  return formatDate(sub?.startDate);
});

const formattedEndDate = computed(() => {
  const sub = subscription.value;
  if (sub?.status === "trial") return formatDate(sub.endDate);
  if (!sub?.endDate) return "No expira (Plan Permanente)";
  return formatDate(sub.endDate);
});

const paymentMethodName = computed(() => {
  const sub = subscription.value;
  if (sub?.status === "trial") return "No aplica (Prueba Gratis)";
  const method = sub?.paymentMethod;
  if (!method) return "No especificado";
  if (method === "card") return "Tarjeta";
  if (method === "yape") return "Yape";
  return method;
});

const cardLastFour = computed(() => {
  return subscription.value?.metadata?.cardLastFourDigits || null;
});

const formattedPlanPrice = computed(() => {
  const sub = subscription.value;
  if (sub?.status === "trial") return "Gratis (S/ 0.00)";
  if (sub?.amount) {
    const cycle = sub.planType === "pro_yearly" ? "al año" : "al mes";
    return `S/ ${sub.amount.toFixed(2)} ${cycle}`;
  }
  return "No especificado";
});

const timeElapsed = computed(() => {
  const sub = subscription.value;
  if (!sub?.startDate) return "0 días";

  let start;
  if (sub.startDate && typeof sub.startDate.toDate === "function") {
    start = sub.startDate.toDate();
  } else {
    start = new Date(sub.startDate);
  }

  const diffMs = Math.abs(new Date() - start);
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor(diffMs / (1000 * 65)); // 60s

  if (diffMins < 60) return `${diffMins || 1} min`;
  if (diffHours < 24) return `${diffHours} hora${diffHours !== 1 ? "s" : ""}`;
  if (diffDays <= 30) return `${diffDays} día${diffDays !== 1 ? "s" : ""}`;

  const months = Math.floor(diffDays / 30);
  const remainingDays = diffDays % 30;
  if (remainingDays === 0) return `${months} mes${months !== 1 ? "es" : ""}`;
  return `${months} mes${months !== 1 ? "es" : ""}, ${remainingDays} d`;
});

const activeFeaturesList = computed(() => {
  const list = [
    {
      title: "Inventario ilimitado",
      desc: "Sube todos tus insumos y productos sin restricciones de cantidad.",
    },
    {
      title: "Comparación de periodos",
      desc: "Monitorea la evolución de tus ventas y gastos por meses o semanas.",
    },
    {
      title: "Compartir ilimitado",
      desc: "Envía comprobantes de ingresos y egresos por WhatsApp tantas veces como quieras.",
    },
    {
      title: "Marca personalizada",
      desc: "Personaliza tus comprobantes agregando el logo y datos de tu negocio.",
    },
    {
      title: "Exportación de datos",
      desc: "Descarga todos tus registros a archivos Excel o documentos PDF en un click.",
    },
  ];

  if (isMax.value) {
    list.push(
      {
        title: "Sesiones personalizadas",
        desc: "Participa de tutorías y dinámicas comerciales empresariales.",
      },
      {
        title: "Soporte prioritario",
        desc: "Atención priorizada ante incidentes o configuraciones.",
      },
      {
        title: "Acceso a API",
        desc: "Conecta tu inventario de WALA con tus aplicaciones de terceros.",
      },
    );
  }

  return list;
});

const handleResetToFree = async () => {
  const confirmed = confirm(
    "¿Deseas restablecer este negocio al plan Free para realizar pruebas de pago?",
  );
  if (!confirmed) return;

  try {
    isProcessing.value = true;
    const bId = businessId.value;
    const uId = businessStore.business?.gerenteId;

    await businessStore.updateSubscriptionPlan(bId, "free", uId);

    showToast({
      type: "success",
      message: "Negocio restablecido al plan Free correctamente.",
    });

    await businessStore.loadBusiness(bId);
  } catch (error) {
    console.error("❌ Error al restablecer plan:", error);
    showToast({
      type: "error",
      message: "Error al restablecer el plan.",
    });
  } finally {
    isProcessing.value = false;
  }
};

// ==========================================
// 💳 LÓGICA DE MERCADO PAGO E INTEGRACIÓN
// ==========================================

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

const goBack = () => {
  router.back();
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
/* Solid Brand Color for active plan headers */
.bg-wala-brand {
  background-color: #e35336;
  box-shadow: 0 10px 25px -5px rgba(227, 83, 54, 0.2);
}

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

.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
