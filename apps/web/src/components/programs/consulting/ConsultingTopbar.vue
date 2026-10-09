<template>
  <div class="topbar">
    <button @click="$emit('back')" class="back-btn">
      ← Volver a Consulting
    </button>
    <button
      class="save-btn"
      :disabled="!isDirty || isSaving"
      @click="$emit('save')"
    >
      {{ isSaving ? "Guardando..." : "Guardar borrador" }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  isDirty: {
    type: Boolean,
    default: false,
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["back", "save"]);
</script>
