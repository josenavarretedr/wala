<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (val) => ['primary', 'secondary', 'outline', 'danger'].includes(val)
  },
  type: {
    type: String,
    default: 'button'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  fullWidth: {
    type: Boolean,
    default: true
  }
});

defineEmits(['click']);
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
    :class="[
      'inline-flex items-center justify-center font-semibold rounded-xl text-base px-5 py-3.5 min-h-[48px] transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2',
      fullWidth ? 'w-full' : 'w-auto',
      disabled || loading ? 'opacity-50 cursor-not-allowed' : '',
      variant === 'primary' ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg focus:ring-blue-500' : '',
      variant === 'secondary' ? 'bg-slate-800 hover:bg-slate-900 text-white focus:ring-slate-700' : '',
      variant === 'outline' ? 'border-2 border-slate-300 hover:bg-slate-100 text-slate-700 focus:ring-slate-400' : '',
      variant === 'danger' ? 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500' : ''
    ]"
  >
    <!-- Spinner de carga -->
    <svg
      v-if="loading"
      class="animate-spin -ml-1 mr-3 h-5 w-5 text-current"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <slot />
  </button>
</template>
