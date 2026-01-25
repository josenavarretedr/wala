<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="handleClose"
      >
        <div
          class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all"
        >
          <!-- Ícono de éxito animado -->
          <div class="flex justify-center mb-6">
            <div class="relative">
              <div
                class="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center animate-scale-in"
              >
                <svg
                  class="w-10 h-10 text-emerald-600 animate-check"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="3"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <!-- Confetti animation (opcional) -->
              <div class="absolute inset-0 animate-confetti">
                <div class="confetti"></div>
                <div class="confetti"></div>
                <div class="confetti"></div>
              </div>
            </div>
          </div>

          <!-- Título -->
          <h2 class="text-3xl font-bold text-gray-900 text-center mb-2">
            ¡Pago Exitoso!
          </h2>

          <!-- Subtítulo -->
          <p class="text-gray-600 text-center mb-6">
            Tu suscripción ha sido activada correctamente
          </p>

          <!-- Detalles del pago -->
          <div
            class="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl p-6 mb-6 space-y-3"
          >
            <div class="flex justify-between items-center">
              <span class="text-gray-600 font-medium">Plan:</span>
              <span class="text-gray-900 font-bold">{{ planName }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600 font-medium">Monto:</span>
              <span class="text-gray-900 font-bold">{{ formattedAmount }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600 font-medium"
                >Fecha de activación:</span
              >
              <span class="text-gray-900 font-bold">{{ activationDate }}</span>
            </div>
            <div
              v-if="expirationDate"
              class="flex justify-between items-center"
            >
              <span class="text-gray-600 font-medium">Válido hasta:</span>
              <span class="text-gray-900 font-bold">{{ expirationDate }}</span>
            </div>
          </div>

          <!-- Mensaje adicional -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p class="text-sm text-blue-800 text-center">
              🎉 Ahora tienes acceso a todas las funcionalidades Premium de WALA
            </p>
          </div>

          <!-- Botón de acción -->
          <button
            @click="goToDashboard"
            class="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 hover:from-orange-600 hover:to-orange-700"
          >
            Ir al Dashboard
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  paymentData: {
    type: Object,
    default: () => ({}),
  },
  businessId: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["close"]);

const router = useRouter();

const planName = computed(() => {
  const planTypes = {
    monthly: "Premium Mensual",
    yearly: "Premium Anual",
    lifetime: "Premium de por Vida",
  };
  return planTypes[props.paymentData.planType] || "Premium";
});

const formattedAmount = computed(() => {
  return `S/ ${props.paymentData.amount?.toFixed(2) || "0.00"}`;
});

const activationDate = computed(() => {
  return new Date().toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
});

const expirationDate = computed(() => {
  if (props.paymentData.planType === "lifetime") {
    return null;
  }

  const days = props.paymentData.planType === "monthly" ? 30 : 365;
  const expDate = new Date();
  expDate.setDate(expDate.getDate() + days);

  return expDate.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
});

const handleClose = () => {
  emit("close");
};

const goToDashboard = () => {
  emit("close");
  router.push(`/business/${props.businessId}/dashboard`);
};
</script>

<style scoped>
/* Animaciones */
@keyframes scale-in {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes check {
  0% {
    stroke-dasharray: 0 100;
  }
  100% {
    stroke-dasharray: 100 100;
  }
}

.animate-scale-in {
  animation: scale-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.animate-check {
  stroke-dasharray: 100;
  animation: check 0.6s 0.3s ease-out forwards;
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
  transform: scale(0.9);
}

/* Confetti (opcional - decorativo) */
@keyframes confetti {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100px) rotate(360deg);
    opacity: 0;
  }
}

.animate-confetti {
  pointer-events: none;
}

.confetti {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #f59e0b;
  border-radius: 50%;
  animation: confetti 1s ease-out forwards;
}

.confetti:nth-child(1) {
  left: 20%;
  animation-delay: 0.2s;
  background: #10b981;
}

.confetti:nth-child(2) {
  left: 50%;
  animation-delay: 0.3s;
  background: #3b82f6;
}

.confetti:nth-child(3) {
  left: 80%;
  animation-delay: 0.4s;
  background: #f59e0b;
}
</style>
