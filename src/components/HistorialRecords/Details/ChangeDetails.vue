<template>
  <div class="space-y-4">
    <h3 class="text-lg font-semibold text-blue-600 mb-4">
      🔄 Detalles de Cambio
    </h3>
    <div class="bg-gray-50 rounded-lg p-4 border">
      <pre class="text-sm text-gray-700 whitespace-pre-wrap">{{
        JSON.stringify(transactionData, null, 2)
      }}</pre>
    </div>
  </div>
</template>

<script setup>
defineProps({
  transactionData: {
    type: Object,
    required: true,
  },
});
</script>
