<template>
  <div class="yape-payment-container">
    <!-- Header con logo Yape -->
    <div class="yape-header">
      <div class="yape-logo">
        <span class="yape-icon">📱</span>
        <h3>Pagar con Yape</h3>
      </div>
      <p class="yape-description">
        Ingresa el código de 6 dígitos que aparece en tu app Yape
      </p>
    </div>

    <!-- Formulario -->
    <form @submit.prevent="handleSubmit" class="yape-form">
      <!-- Campo: Número de celular -->
      <div class="form-group">
        <label for="yape-phone">
          <span class="label-icon">📞</span>
          Número de celular
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
          class="form-input"
          @input="validatePhone"
        />
        <span v-if="phoneError" class="error-message">{{ phoneError }}</span>
      </div>

      <!-- Campo: Código OTP -->
      <div class="form-group">
        <label for="yape-otp">
          <span class="label-icon">🔐</span>
          Código Yape (OTP)
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
        <p class="help-text">Abre tu app Yape y genera un código de pago</p>
      </div>

      <!-- Resumen del pago -->
      <div class="payment-summary">
        <div class="summary-row">
          <span class="summary-label">Plan seleccionado:</span>
          <span class="summary-value">{{ planName }}</span>
        </div>
        <div class="summary-row total">
          <span class="summary-label">Total a pagar:</span>
          <span class="summary-value">S/ {{ amount.toFixed(2) }}</span>
        </div>
      </div>

      <!-- Error general -->
      <div v-if="error" class="error-banner">
        <span class="error-icon">⚠️</span>
        <p>{{ error }}</p>
      </div>

      <!-- Botón de pago -->
      <button
        type="submit"
        class="yape-btn"
        :disabled="isProcessing || !isFormValid"
      >
        <span v-if="isProcessing" class="spinner"></span>
        <span v-else class="btn-icon">✓</span>
        {{ isProcessing ? "Procesando..." : `Pagar S/ ${amount.toFixed(2)}` }}
      </button>

      <!-- Instrucciones -->
      <div class="yape-instructions">
        <h4>¿Cómo obtener el código Yape?</h4>
        <ol>
          <li>Abre la app Yape en tu celular</li>
          <li>Toca "Pagar con código QR"</li>
          <li>Selecciona "Generar código de pago"</li>
          <li>Ingresa el código de 6 dígitos aquí</li>
        </ol>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useYape } from "@/composables/useYape";

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
  max-width: 500px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.yape-header {
  text-align: center;
  margin-bottom: 2rem;
}

.yape-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.yape-icon {
  font-size: 2rem;
}

.yape-header h3 {
  margin: 0;
  font-size: 1.5rem;
  color: #6e1c74;
}

.yape-description {
  color: #666;
  font-size: 0.9rem;
}

.yape-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: #333;
}

.label-icon {
  font-size: 1.2rem;
}

.form-input {
  padding: 0.75rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #6e1c74;
}

.form-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.otp-input {
  font-size: 1.5rem;
  letter-spacing: 0.5rem;
  text-align: center;
  font-weight: 600;
}

.error-message {
  color: #e53935;
  font-size: 0.85rem;
  margin-top: -0.25rem;
}

.help-text {
  color: #666;
  font-size: 0.85rem;
  margin: 0;
}

.payment-summary {
  background: #f9f9f9;
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-row.total {
  padding-top: 0.5rem;
  border-top: 2px solid #e0e0e0;
  font-weight: 600;
  font-size: 1.1rem;
}

.summary-value {
  color: #6e1c74;
}

.error-banner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #ffebee;
  border-left: 4px solid #e53935;
  border-radius: 4px;
}

.error-icon {
  font-size: 1.5rem;
}

.error-banner p {
  margin: 0;
  color: #c62828;
  font-size: 0.9rem;
}

.yape-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #6e1c74 0%, #8e24aa 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.yape-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(110, 28, 116, 0.3);
}

.yape-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

.btn-icon {
  font-size: 1.3rem;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.yape-instructions {
  background: #f0f0f0;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
}

.yape-instructions h4 {
  margin: 0 0 0.75rem 0;
  font-size: 0.95rem;
  color: #333;
}

.yape-instructions ol {
  margin: 0;
  padding-left: 1.5rem;
}

.yape-instructions li {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.25rem;
}
</style>
