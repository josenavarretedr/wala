<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <div
      v-for="plan in plans"
      :key="plan.type"
      :class="[
        'relative bg-white rounded-2xl border-2 p-6 cursor-pointer transition-all duration-200',
        selectedPlan === plan.type
          ? 'border-orange-500 shadow-lg scale-105'
          : 'border-gray-200 hover:border-orange-300 hover:shadow-md',
      ]"
      @click="selectPlan(plan.type)"
    >
      <!-- Badge de popular/ahorro -->
      <div
        v-if="plan.badge"
        class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold rounded-full"
      >
        {{ plan.badge }}
      </div>

      <!-- Nombre del plan -->
      <h3 class="text-xl font-bold text-gray-900 mb-2 text-center">
        {{ plan.name }}
      </h3>

      <!-- Precio -->
      <div class="text-center mb-4">
        <div class="text-4xl font-extrabold text-gray-900">
          S/ {{ plan.price }}
        </div>
        <div class="text-sm text-gray-600">
          {{ plan.period }}
        </div>
        <div
          v-if="plan.savings"
          class="text-xs text-emerald-600 font-semibold mt-1"
        >
          Ahorras S/ {{ plan.savings }}
        </div>
      </div>

      <!-- Descripción -->
      <p class="text-sm text-gray-600 text-center mb-4">
        {{ plan.description }}
      </p>

      <!-- Checkmark de selección -->
      <div
        v-if="selectedPlan === plan.type"
        class="absolute top-4 right-4 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center"
      >
        <svg
          class="w-4 h-4 text-white"
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
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  modelValue: {
    type: String,
    default: "monthly",
  },
});

const emit = defineEmits(["update:modelValue"]);

const selectedPlan = ref(props.modelValue);

const plans = [
  {
    type: "test",
    name: "Prueba",
    price: 5,
    period: "7 días",
    description: "Plan de prueba para testing en producción",
    badge: "🧪 TEST",
    savings: null,
  },
  {
    type: "monthly",
    name: "Mensual",
    price: 27,
    period: "por mes",
    description: "Ideal para empezar y probar todas las funcionalidades",
    badge: null,
    savings: null,
  },
  {
    type: "yearly",
    name: "Anual",
    price: 200,
    period: "por año",
    description: "¡Ahorra S/ 124 al año! Mejor relación precio-valor",
    badge: "🔥 MÁS POPULAR",
    savings: 124,
  },
  {
    type: "lifetime",
    name: "De por Vida",
    price: 400,
    period: "pago único",
    description: "Acceso ilimitado para siempre. Inversión única",
    badge: "⭐ MEJOR OFERTA",
    savings: null,
  },
];

const selectPlan = (planType) => {
  selectedPlan.value = planType;
  emit("update:modelValue", planType);
};
</script>
