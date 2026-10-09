<template>
  <div
    v-if="risk.message"
    :class="[
      'rounded-lg p-4 mb-4 transition-all duration-300',
      colorClasses[risk.color],
    ]"
  >
    <div class="flex items-center gap-3">
      <span class="text-2xl">{{ risk.icon }}</span>
      <div class="flex-1">
        <p :class="['font-medium', textColorClasses[risk.color]]">
          {{ risk.message }}
        </p>
        <p v-if="showDetails && streakData" class="text-sm mt-1 opacity-75">
          Última actividad: {{ formatLastActive }}
        </p>
      </div>
      <button
        v-if="
          showActionButton &&
          (risk.riskLevel === 'high' || risk.riskLevel === 'critical')
        "
        @click="$emit('take-action')"
        :class="[
          'px-4 py-2 rounded-lg font-medium text-sm hover:shadow-md transition-shadow',
          buttonColorClasses[risk.color],
        ]"
      >
        Registrar venta
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { DateTime } from "luxon";

const props = defineProps({
  risk: {
    type: Object,
    required: true,
    validator: (value) => {
      return ["riskLevel", "message", "color", "icon"].every(
        (key) => key in value
      );
    },
  },
  streakData: {
    type: Object,
    default: null,
  },
  showDetails: {
    type: Boolean,
    default: true,
  },
  showActionButton: {
    type: Boolean,
    default: true,
  },
});

defineEmits(["take-action"]);

const colorClasses = {
  red: "bg-red-50 border border-red-200",
  orange: "bg-orange-50 border border-orange-200",
  yellow: "bg-yellow-50 border border-yellow-200",
  green: "bg-green-50 border border-green-200",
};

const textColorClasses = {
  red: "text-red-800",
  orange: "text-orange-800",
  yellow: "text-yellow-800",
  green: "text-green-800",
};

const buttonColorClasses = {
  red: "bg-red-500 text-white hover:bg-red-600",
  orange: "bg-orange-500 text-white hover:bg-orange-600",
  yellow: "bg-yellow-500 text-white hover:bg-yellow-600",
  green: "bg-green-500 text-white hover:bg-green-600",
};

const formatLastActive = computed(() => {
  if (!props.streakData?.lastActiveDay) return "N/A";

  let lastActiveDay = props.streakData.lastActiveDay;

  // Convertir Timestamp a string si es necesario
  if (typeof lastActiveDay !== "string" && lastActiveDay.toDate) {
    const date = lastActiveDay.toDate();
    lastActiveDay = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  const date = DateTime.fromFormat(lastActiveDay, "yyyy-LL-dd", {
    zone: "America/Lima",
  });
  return date.toFormat("dd/MM/yyyy");
});
</script>

<style scoped>
/* Animación sutil de entrada */
@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

div[class*="bg-"] {
  animation: slideInDown 0.3s ease-out;
}
</style>
