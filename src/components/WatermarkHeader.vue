<template>
  <div class="watermark-footer border-b border-gray-200 pb-4 mb-6">
    <div class="flex items-center justify-start gap-4">
      <img src="/WalaLogoOF.png" alt="Wala" class="w-9 h-9" />
      <span class="text-sm font-semibold text-gray-600">
        <span class="text-orange-600">wala.lat</span>, tu copiloto empresarial
      </span>
    </div>
  </div>
</template>

<script setup>
// Componente simple para marca de agua
// Se inyecta dinámicamente durante la captura
</script>

<style scoped>
.watermark-footer {
  /* Asegurar que siempre tenga fondo blanco en la captura */
  background-color: white;
}
</style>
