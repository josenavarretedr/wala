<template>
  <div
    :class="`bg-white shadow-md rounded-xl p-5 border-l-4 border-${color}-500 relative`"
  >
    <div :class="`flex items-center gap-2 text-${color}-600 mb-4`">
      <component :is="iconComponent" class="w-7 h-7" />
      <h2 class="text-2xl font-bold">{{ title }}</h2>
    </div>

    <input
      type="number"
      inputmode="decimal"
      pattern="[0-9]*"
      :placeholder="`Monto inicial en ${title}`"
      :value="internalValue"
      @input="updateValue($event.target.value)"
      class="w-full px-4 py-4 text-2xl text-center border-2 rounded-lg shadow focus:outline-none focus:ring-4"
      :class="`border-${color}-500 focus:ring-${color}-300`"
    />
  </div>
</template>

<script setup>
import { computed, defineProps, defineEmits, shallowRef, onMounted } from "vue";

const props = defineProps({
  title: String,
  icon: String,
  color: String,
  modelValue: [Number, String],
});
const emit = defineEmits(["update:modelValue"]);

// Manejamos el valor local con get/set
const internalValue = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", Number(val)),
});

const updateValue = (val) => {
  internalValue.value = val;
};

// Cargar ícono de forma dinámica
const iconComponent = shallowRef(null);
onMounted(async () => {
  const icons = {
    Coins: (await import("@iconoir/vue")).Coins,
    SmartphoneDevice: (await import("@iconoir/vue")).SmartphoneDevice,
  };
  iconComponent.value = icons[props.icon];
});
</script>
