<template>
  <div class="space-y-2">
    <label
      v-if="label"
      :for="id"
      class="block text-sm font-medium text-gray-700"
    >
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <input
      :id="id"
      type="date"
      :value="modelValue"
      :required="required"
      :disabled="disabled"
      :min="min"
      :max="max"
      @input="$emit('update:modelValue', $event.target.value)"
      class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
      :class="{ 'border-red-300 bg-red-50': error }"
    />

    <p v-if="hint" class="text-xs text-gray-500">{{ hint }}</p>
    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
  </div>
</template>

<script setup>
defineProps({
  id: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    default: "",
  },
  modelValue: {
    type: String,
    default: "",
  },
  required: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  min: {
    type: String,
    default: "",
  },
  max: {
    type: String,
    default: "",
  },
  hint: {
    type: String,
    default: "",
  },
  error: {
    type: String,
    default: "",
  },
});

defineEmits(["update:modelValue"]);
</script>
