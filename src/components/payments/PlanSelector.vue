<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
    <div
      :class="[
        cardBase,
        selectedPlan === 'free'
          ? 'border-orange-600 shadow-md border-2'
          : 'border-gray-100 hover:border-orange-300 hover:shadow-md',
      ]"
      @click="selectPlan('free')"
    >
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <Sparks class="w-5 h-5 text-gray-500" />
          <h3 class="text-lg font-bold text-gray-900">Free</h3>
        </div>
        <div :class="radioClass(selectedPlan === 'free')">
          <svg
            v-if="selectedPlan === 'free'"
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

      <div class="mb-4">
        <div class="text-3xl font-extrabold text-gray-900">S/ 0</div>
        <p class="text-sm text-gray-500">sin costo</p>
      </div>

      <ul class="space-y-2 text-sm text-gray-700">
        <li class="flex items-start gap-2">
          <CheckCircle class="w-4 h-4 text-emerald-600 mt-0.5" />
          <span>Inventario ilimitado</span>
        </li>
        <li class="flex items-start gap-2">
          <CheckCircle class="w-4 h-4 text-emerald-600 mt-0.5" />
          <span>Compartir contenido (límite 20 al día)</span>
        </li>
      </ul>
    </div>

    <div
      :class="[
        cardBase,
        selectedPlan.startsWith('pro_')
          ? 'border-orange-600 shadow-lg border-2 ring-2 ring-orange-100'
          : 'border-gray-100 hover:border-orange-300 hover:shadow-md',
      ]"
      @click="selectPlan(currentProVariant)"
    >
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <FireFlame class="w-5 h-5 text-orange-500" />
          <h3 class="text-lg font-bold text-gray-900">Pro</h3>
        </div>
        <span
          class="text-[11px] px-2 py-1 rounded-full bg-orange-100 text-orange-700 font-semibold"
        >
          Recomendado
        </span>
      </div>

      <div class="inline-flex p-1 rounded-lg bg-gray-100 mb-4 w-full">
        <button
          type="button"
          class="flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors"
          :class="
            isProYearly ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
          "
          @click.stop="setProCycle('yearly')"
        >
          Anual
        </button>
        <button
          type="button"
          class="flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors"
          :class="
            !isProYearly ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
          "
          @click.stop="setProCycle('monthly')"
        >
          Mensual
        </button>
      </div>

      <div class="mb-2">
        <div class="text-3xl font-extrabold text-gray-900">
          {{ isProYearly ? "S/ 500" : "S/ 50" }}
        </div>
        <p class="text-sm text-gray-500">
          {{ isProYearly ? "por año" : "por mes" }}
        </p>
      </div>
      <p v-if="isProYearly" class="text-xs text-emerald-600 font-semibold mb-4">
        Ahorras S/ 100 al año
      </p>

      <ul class="space-y-2 text-sm text-gray-700">
        <li class="flex items-start gap-2">
          <CheckCircle class="w-4 h-4 text-emerald-600 mt-0.5" />
          <span>Inventario ilimitado</span>
        </li>
        <li class="flex items-start gap-2">
          <CheckCircle class="w-4 h-4 text-emerald-600 mt-0.5" />
          <span>Comparación de periodos</span>
        </li>
        <li class="flex items-start gap-2">
          <CheckCircle class="w-4 h-4 text-emerald-600 mt-0.5" />
          <span>Compartir ilimitado</span>
        </li>
        <li class="flex items-start gap-2">
          <CheckCircle class="w-4 h-4 text-emerald-600 mt-0.5" />
          <span>Compartir personalizado (añade tu logo)</span>
        </li>
      </ul>
    </div>

    <div
      :class="[
        cardBase,
        selectedPlan === 'max'
          ? 'border-orange-600 shadow-md border-2'
          : 'border-gray-100 hover:border-orange-300 hover:shadow-md',
      ]"
      @click="selectPlan('max')"
    >
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <Infinite class="w-5 h-5 text-purple-600" />
          <h3 class="text-lg font-bold text-gray-900">Max</h3>
        </div>
        <div :class="radioClass(selectedPlan === 'max')">
          <svg
            v-if="selectedPlan === 'max'"
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

      <div class="mb-4">
        <div class="text-3xl font-extrabold text-gray-900">S/ 360</div>
        <p class="text-sm text-gray-500">Pago mensual</p>
      </div>

      <ul class="space-y-2 text-sm text-gray-700">
        <li class="flex items-start gap-2">
          <CheckCircle class="w-4 h-4 text-emerald-600 mt-0.5" />
          <span>Todo lo de Free y Pro</span>
        </li>
        <li class="flex items-start gap-2">
          <CheckCircle class="w-4 h-4 text-emerald-600 mt-0.5" />
          <span>Sesiones personalizadas grupales (máx. 20)</span>
        </li>
        <li class="flex items-start gap-2">
          <CheckCircle class="w-4 h-4 text-emerald-600 mt-0.5" />
          <span>Acceso a ferias locales (según disponibilidad)</span>
        </li>
        <li class="flex items-start gap-2">
          <CheckCircle class="w-4 h-4 text-emerald-600 mt-0.5" />
          <span>Asistencia personalizada y prioritaria</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { Sparks, FireFlame, Infinite, CheckCircle } from "@iconoir/vue";

const props = defineProps({
  modelValue: {
    type: String,
    default: "pro_monthly",
  },
});

const emit = defineEmits(["update:modelValue"]);

const selectedPlan = ref(props.modelValue);
const proCycle = ref(props.modelValue === "pro_yearly" ? "yearly" : "monthly");

const cardBase =
  "bg-white rounded-xl border shadow-sm p-5 cursor-pointer transition-all duration-200";

const isProYearly = computed(() => proCycle.value === "yearly");
const currentProVariant = computed(() =>
  isProYearly.value ? "pro_yearly" : "pro_monthly",
);

const radioClass = (active) => [
  "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200",
  active ? "border-orange-600 bg-orange-600" : "border-gray-300 bg-white",
];

const selectPlan = (planType) => {
  selectedPlan.value = planType;
  emit("update:modelValue", planType);
};

const setProCycle = (cycle) => {
  proCycle.value = cycle;
  if (selectedPlan.value.startsWith("pro_")) {
    selectPlan(cycle === "yearly" ? "pro_yearly" : "pro_monthly");
  }
};

watch(
  () => props.modelValue,
  (newValue) => {
    selectedPlan.value = newValue;
    if (newValue === "pro_yearly") {
      proCycle.value = "yearly";
    }
    if (newValue === "pro_monthly") {
      proCycle.value = "monthly";
    }
  },
);
</script>
