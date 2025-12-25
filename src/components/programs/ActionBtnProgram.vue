<template>
  <div
    class="fixed bottom-0 left-0 right-0 z-50 p-3 bg-white/95 backdrop-blur-sm rounded-t-2xl shadow-xl border-t border-gray-100"
  >
    <button
      @click="$emit('create-activity')"
      class="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all duration-200 shadow-sm flex items-center justify-center gap-2 border-2 border-green-600 hover:border-green-700"
    >
      <Plus class="w-5 h-5" stroke-width="2.5" />
      <span>Nueva Actividad</span>
    </button>
  </div>
</template>

<script setup>
import { Plus } from "@iconoir/vue";

defineEmits(["create-activity"]);
</script>
