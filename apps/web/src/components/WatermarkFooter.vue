<template>
  <div class="watermark-footer border-t border-gray-200 pt-4 mt-6">
    <div class="flex items-left justify-center gap-4">
      <img src="/WalaLogoOF.png" alt="Wala" class="w-9 h-9" />
      <span class="text-sm font-semibold text-gray-600">
        <span class="text-orange-600">wala.lat</span>, mi copiloto empresarial
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
