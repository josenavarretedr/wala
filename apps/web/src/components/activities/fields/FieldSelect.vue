<template>
  <div class="space-y-1.5">
    <label class="block text-sm font-medium text-gray-700">
      {{ field.title }}
      <span v-if="field.required" class="text-red-500 ml-0.5">*</span>
    </label>
    <p v-if="field.description" class="text-xs text-gray-500">
      {{ field.description }}
    </p>
    <select
      v-if="!readonly"
      :value="modelValue"
      @change="$emit('update:modelValue', $event.target.value)"
      class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
    >
      <option value="" disabled>Selecciona una opción...</option>
      <option v-for="option in field.options" :key="option" :value="option">
        {{ option }}
      </option>
    </select>
    <div
      v-else
      class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800"
    >
      {{ modelValue || "—" }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  field: { type: Object, required: true },
  modelValue: { type: String, default: "" },
  readonly: { type: Boolean, default: false },
});
defineEmits(["update:modelValue"]);
</script>
