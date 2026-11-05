<script setup>
defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  id: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'text'
  },
  inputmode: {
    type: String,
    default: 'text'
  },
  placeholder: {
    type: String,
    default: ''
  },
  error: {
    type: String,
    default: ''
  },
  hint: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  autocomplete: {
    type: String,
    default: 'off'
  },
  maxlength: {
    type: [Number, String],
    default: null
  }
});

defineEmits(['update:modelValue', 'blur', 'focus']);
</script>

<template>
  <div class="w-full flex flex-col space-y-1.5 text-left">
    <label
      v-if="label"
      :for="id"
      class="text-sm font-semibold text-slate-700 select-none"
    >
      {{ label }}
    </label>

    <div class="relative rounded-xl shadow-sm">
      <input
        :id="id"
        :type="type"
        :inputmode="inputmode"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :autocomplete="autocomplete"
        :maxlength="maxlength"
        @input="$emit('update:modelValue', $event.target.value)"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
        :class="[
          'block w-full rounded-xl border px-4 py-3.5 text-base text-slate-900 placeholder:text-slate-400 min-h-[48px] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1',
          error
            ? 'border-red-400 bg-red-50/30 text-red-900 focus:border-red-500 focus:ring-red-400'
            : 'border-slate-300 bg-white hover:border-slate-400 focus:border-blue-600 focus:ring-blue-500',
          disabled ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''
        ]"
      />
    </div>

    <!-- Error message -->
    <p v-if="error" class="text-xs font-medium text-red-600 flex items-center gap-1 mt-1">
      <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
      </svg>
      {{ error }}
    </p>

    <!-- Hint helper -->
    <p v-else-if="hint" class="text-xs text-slate-500 mt-1">
      {{ hint }}
    </p>
  </div>
</template>
