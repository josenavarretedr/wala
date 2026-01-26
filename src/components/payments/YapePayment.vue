<template>
  <div class="yape-payment-container">
    <!-- Formulario compacto -->
    <form @submit.prevent="handleSubmit" class="yape-form">
      <!-- Campo: Número de celular -->
      <div class="form-group">
        <label for="yape-phone" class="form-label">
          <div
            class="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center"
          >
            <Phone class="w-4 h-4 text-purple-600" />
          </div>
          <span>Número de celular</span>
        </label>
        <input
          id="yape-phone"
          v-model="phoneNumber"
          type="tel"
          placeholder="987654321"
          maxlength="9"
          pattern="[0-9]{9}"
          required
          :disabled="isProcessing"
          class="form-input phone-input"
          @input="validatePhone"
        />
        <span v-if="phoneError" class="error-message">{{ phoneError }}</span>
      </div>

      <!-- Campo: Código OTP -->
      <div class="form-group">
        <label for="yape-otp" class="form-label">
          <div
            class="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center"
          >
            <Lock class="w-4 h-4 text-purple-600" />
          </div>
          <span>Código Yape (6 dígitos)</span>
        </label>
        <input
          id="yape-otp"
          v-model="otp"
          type="text"
          placeholder="123456"
          maxlength="6"
          pattern="[0-9]{6}"
          required
          :disabled="isProcessing"
          class="form-input otp-input"
          @input="validateOTP"
        />
        <span v-if="otpError" class="error-message">{{ otpError }}</span>
      </div>

      <!-- Instrucciones colapsables -->
      <div class="instructions-accordion">
        <button
          type="button"
          @click="showInstructions = !showInstructions"
          class="accordion-trigger"
        >
          <div class="flex items-center gap-2">
            <HelpCircle class="w-4 h-4 text-purple-600" />
            <span class="text-sm font-medium text-gray-700">
              ¿Cómo obtener el código?
            </span>
          </div>
          <NavArrowDown
            :class="[
              'w-4 h-4 text-gray-400 transition-transform',
              showInstructions ? 'rotate-180' : '',
            ]"
          />
        </button>

        <Transition name="accordion">
          <div v-if="showInstructions" class="accordion-content">
            <ol class="instructions-list">
              <li>Abre la app Yape en tu celular.</li>
              <li>Toca "Aprobar compras".</li>
              <li>Copiar código de aprobación.</li>
              <li>Ingresa el código de 6 dígitos aquí.</li>
            </ol>
          </div>
        </Transition>
      </div>

      <!-- Error general -->
      <div v-if="error" class="error-banner">
        <WarningCircle class="w-5 h-5 text-red-600" />
        <p>{{ error }}</p>
      </div>

      <!-- Botón de pago -->
      <button
        type="submit"
        class="yape-btn"
        :disabled="isProcessing || !isFormValid"
      >
        <div v-if="isProcessing" class="spinner"></div>
        <Lock v-else class="w-5 h-5" />
        {{ isProcessing ? "Procesando..." : `Pagar S/ ${amount.toFixed(2)}` }}
      </button>

      <!-- Resumen del pago (abajo) -->
      <div class="payment-summary">
        <div class="summary-row">
          <span class="summary-label">Plan seleccionado</span>
          <span class="summary-value">{{ planName }}</span>
        </div>
        <div class="summary-row total">
          <span class="summary-label">Total</span>
          <span class="summary-value">S/ {{ amount.toFixed(2) }}</span>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useYape } from "@/composables/useYape";
import {
  Phone,
  HelpCircle,
  NavArrowDown,
  WarningCircle,
  Lock,
} from "@iconoir/vue";

// Props
const props = defineProps({
  amount: {
    type: Number,
    required: true,
  },
  businessId: {
    type: String,
    required: true,
  },
  planType: {
    type: String,
    required: true,
    validator: (value) =>
      ["test", "monthly", "annual", "lifetime"].includes(value),
  },
});

// Emits
const emit = defineEmits(["success", "error"]);

// Composables
const {
  isLoading: isProcessing,
  error: yapeError,
  generateYapeToken,
  processYapePayment,
} = useYape();

// State
const phoneNumber = ref("");
const otp = ref("");
const phoneError = ref("");
const otpError = ref("");
const error = ref("");
const showInstructions = ref(false);

// Computed
const planName = computed(() => {
  const plans = {
    test: "Premium Prueba",
    monthly: "Premium Mensual",
    annual: "Premium Anual",
    lifetime: "Premium de por Vida",
  };
  return plans[props.planType] || "Premium";
});

const isFormValid = computed(() => {
  return (
    phoneNumber.value.length === 9 &&
    otp.value.length === 6 &&
    !phoneError.value &&
    !otpError.value
  );
});

// Methods
const validatePhone = () => {
  phoneError.value = "";
  const cleaned = phoneNumber.value.replace(/\D/g, "");
  phoneNumber.value = cleaned;

  if (cleaned.length > 0 && cleaned.length < 9) {
    phoneError.value = "El número debe tener 9 dígitos";
  }
};

const validateOTP = () => {
  otpError.value = "";
  const cleaned = otp.value.replace(/\D/g, "");
  otp.value = cleaned;

  if (cleaned.length > 0 && cleaned.length < 6) {
    otpError.value = "El código debe tener 6 dígitos";
  }
};

const handleSubmit = async () => {
  try {
    error.value = "";
    phoneError.value = "";
    otpError.value = "";

    // Validaciones finales
    if (phoneNumber.value.length !== 9) {
      phoneError.value = "Ingresa un número de celular válido";
      return;
    }

    if (otp.value.length !== 6) {
      otpError.value = "Ingresa un código OTP válido";
      return;
    }

    console.log("📱 Iniciando pago con Yape...", {
      phoneNumber: phoneNumber.value,
      planType: props.planType,
      amount: props.amount,
    });

    // Paso 1: Generar token
    const token = await generateYapeToken(phoneNumber.value, otp.value);

    // Paso 2: Procesar pago
    const result = await processYapePayment({
      token,
      businessId: props.businessId,
      planType: props.planType,
      phoneNumber: phoneNumber.value,
    });

    // Éxito
    console.log("✅ Pago Yape completado:", result);
    emit("success", result);
  } catch (err) {
    console.error("❌ Error en pago Yape:", err);
    error.value =
      err.message || "Error al procesar el pago. Intenta nuevamente.";
    emit("error", err);
  }
};
</script>

<style scoped>
.yape-payment-container {
  width: 100%;
}

.yape-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.form-input {
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  font-size: 0.95rem;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  background: white;
}

.form-input:focus {
  outline: none;
  border-color: #9333ea;
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1);
}

.form-input:disabled {
  background-color: #f9fafb;
  cursor: not-allowed;
  opacity: 0.6;
}

.otp-input {
  font-size: 1.25rem;
  letter-spacing: 0.5rem;
  text-align: center;
  font-weight: 600;
}

.phone-input {
  font-size: 1.25rem;
  letter-spacing: 0.25rem;
  text-align: center;
  font-weight: 600;
}

.error-message {
  color: #dc2626;
  font-size: 0.8rem;
  margin-top: -0.25rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* Accordion de instrucciones */
.instructions-accordion {
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  overflow: hidden;
  background: #f9fafb;
}

.accordion-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.accordion-trigger:hover {
  background: #f3f4f6;
}

.accordion-content {
  padding: 0 1rem 0.75rem 1rem;
}

.instructions-list {
  margin: 0;
  padding-left: 1.25rem;
  font-size: 0.8rem;
  color: #6b7280;
  line-height: 1.6;
}

.instructions-list li {
  margin-bottom: 0.25rem;
}

.accordion-enter-active,
.accordion-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.accordion-enter-from,
.accordion-leave-to {
  opacity: 0;
  max-height: 0;
}

.accordion-enter-to,
.accordion-leave-from {
  opacity: 1;
  max-height: 200px;
}

/* Error banner */
.error-banner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.75rem;
}

.error-banner p {
  margin: 0;
  color: #dc2626;
  font-size: 0.875rem;
  flex: 1;
}

/* Botón Yape */
.yape-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #9333ea 0%, #a855f7 100%);
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(147, 51, 234, 0.2);
}

.yape-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.3);
  background: linear-gradient(135deg, #7e22ce 0%, #9333ea 100%);
}

.yape-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2.5px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Resumen del pago */
.payment-summary {
  background: linear-gradient(to bottom right, #f3f4f6, #e5e7eb);
  padding: 1rem;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.summary-row:last-child {
  margin-bottom: 0;
}

.summary-row.total {
  padding-top: 0.75rem;
  border-top: 1px solid #d1d5db;
  margin-top: 0.25rem;
}

.summary-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.summary-value {
  font-weight: 600;
  color: #111827;
}

.summary-row.total .summary-value {
  font-size: 1.25rem;
  color: #9333ea;
}

/* Responsive */
@media (max-width: 640px) {
  .form-input {
    font-size: 16px; /* Evita zoom en iOS */
  }

  .otp-input {
    font-size: 1.125rem;
    letter-spacing: 0.375rem;
  }
  .phone-input {
    font-size: 1.125rem;
    letter-spacing: 0.2rem;
  }
}
</style>
