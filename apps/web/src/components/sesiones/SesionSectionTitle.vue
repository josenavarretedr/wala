<template>
  <div class="mt-10 mb-4 flex items-center gap-3">
    <div
      class="flex h-10 w-10 items-center justify-center rounded-xl"
      :class="
        isExercise ? 'bg-teal-100 text-teal-700' : 'bg-blue-100 text-blue-700'
      "
    >
      <EditPencil v-if="isExercise" class="h-5 w-5" />
      <Book v-else class="h-5 w-5" />
    </div>

    <div>
      <h2 class="text-xl font-bold text-gray-900 md:text-2xl">{{ title }}</h2>
      <p v-if="subtitle" class="text-sm text-gray-600">{{ subtitle }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { Book, EditPencil } from "@iconoir/vue";

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: "",
  },
  mode: {
    type: String,
    default: "read",
  },
});

const isExercise = computed(() => props.mode === "exercise");
</script>
