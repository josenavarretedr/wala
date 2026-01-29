<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-8">
    <div
      v-for="plan in plans"
      :key="plan.type"
      :class="[
        'bg-white rounded-xl border shadow-sm p-4 cursor-pointer transition-all duration-200',
        selectedPlan === plan.type
          ? 'border-orange-600 shadow-md border-2'
          : 'border-gray-100 hover:border-orange-300 hover:shadow-md',
      ]"
      @click="selectPlan(plan.type)"
    >
      <!-- Layout horizontal -->
      <div class="flex items-center gap-3 sm:gap-4">
        <!-- Radio/Checkmark -->
        <div class="flex-shrink-0">
          <div
            :class="[
              'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200',
              selectedPlan === plan.type
                ? 'border-orange-600 bg-orange-600'
                : 'border-gray-300 bg-white',
            ]"
          >
            <svg
              v-if="selectedPlan === plan.type"
              class="w-3 h-3 text-white"
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

        <!-- Icono + Nombre del plan -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <component
              :is="plan.icon"
              :class="[
                'w-5 h-5 flex-shrink-0 transition-colors duration-200',
                selectedPlan === plan.type
                  ? 'text-orange-600 '
                  : 'text-gray-400',
              ]"
            />
            <h3
              :class="[
                'text-base sm:text-lg font-bold transition-colors duration-200',
                selectedPlan === plan.type ? 'text-gray-900' : 'text-gray-700',
              ]"
            >
              {{ plan.name }}
            </h3>
          </div>
          <p class="text-xs sm:text-sm text-gray-500 line-clamp-1">
            {{ plan.description }}
          </p>
          <p
            v-if="plan.savings"
            class="text-xs text-emerald-600 font-semibold mt-1"
          >
            Ahorras S/ {{ plan.savings }}
          </p>
        </div>

        <!-- Precio -->
        <div class="text-right flex-shrink-0">
          <div class="text-xl sm:text-2xl font-extrabold text-gray-900">
            S/ {{ plan.price }}
          </div>
          <div class="text-xs sm:text-sm text-gray-500 whitespace-nowrap">
            {{ plan.period }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { Sparks, FireFlame, Infinite } from "@iconoir/vue";

const props = defineProps({
  modelValue: {
    type: String,
    default: "monthly",
  },
});

const emit = defineEmits(["update:modelValue"]);

const selectedPlan = ref(props.modelValue);

const plans = [
  // {
  //   type: "test",
  //   name: "Prueba",
  //   price: 5,
  //   period: "7 días",
  //   description: "Plan de prueba para testing en producción",
  //   badge: "🧪 TEST",
  //   savings: null,
  //   icon: Sparks,
  // },
  {
    type: "monthly",
    name: "Mensual",
    price: 27,
    period: "por mes",
    description: "Ideal para empezar y probar todas las funcionalidades",
    badge: null,
    savings: null,
    icon: Sparks,
  },
  {
    type: "annual",
    name: "Anual",
    price: 200,
    period: "por año",
    description: "¡Ahorra S/ 124 al año! Mejor relación precio-valor",
    badge: "🔥 MÁS POPULAR",
    savings: 124,
    icon: FireFlame,
  },
  {
    type: "lifetime",
    name: "De por Vida",
    price: 400,
    period: "pago único",
    description: "Acceso ilimitado para siempre. Inversión única",
    badge: "⭐ MEJOR OFERTA",
    savings: null,
    icon: Infinite,
  },
];

const selectPlan = (planType) => {
  selectedPlan.value = planType;
  emit("update:modelValue", planType);
};
</script>
