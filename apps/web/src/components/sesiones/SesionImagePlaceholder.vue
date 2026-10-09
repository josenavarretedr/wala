<template>
  <div class="my-5">
    <button
      v-if="hasImage"
      type="button"
      :class="imageButtonClass"
      @click="openModal = true"
    >
      <img
        :src="src"
        :alt="alt"
        class="h-auto w-full object-contain"
        loading="lazy"
        @error="handleImageError"
      />
    </button>

    <div
      v-else
      class="rounded-2xl border border-dashed border-gray-300 bg-gradient-to-r from-gray-50 to-slate-100 p-5"
    >
      <div class="flex items-start gap-3">
        <div class="rounded-lg bg-white p-2 text-gray-600 shadow-sm">
          <Page class="h-5 w-5" />
        </div>
        <div>
          <p
            class="text-xs font-semibold uppercase tracking-wide text-gray-500"
          >
            Ilustracion referencial
          </p>
          <p class="mt-1 text-sm text-gray-700">{{ alt }}</p>
        </div>
      </div>
    </div>

    <div
      v-if="openModal && hasImage"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      role="dialog"
      aria-modal="true"
      @click.self="openModal = false"
    >
      <button
        type="button"
        class="absolute right-4 top-4 rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-700"
        @click="openModal = false"
      >
        Cerrar
      </button>
      <img
        :src="src"
        :alt="alt"
        class="max-h-[90vh] w-auto max-w-full rounded-xl object-contain"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { Page } from "@iconoir/vue";

const props = defineProps({
  alt: {
    type: String,
    required: true,
  },
  src: {
    type: String,
    default: "",
  },
  orientation: {
    type: String,
    default: "horizontal",
    validator: (value) => ["horizontal", "vertical"].includes(value),
  },
});

const openModal = ref(false);
const imageFailed = ref(false);

const hasImage = computed(() => Boolean(props.src) && !imageFailed.value);

const imageButtonClass = computed(() => {
  if (props.orientation === "vertical") {
    return "mx-auto block w-full max-w-[20rem] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md md:max-w-[24rem]";
  }

  return "block w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md";
});

const handleImageError = () => {
  imageFailed.value = true;
  openModal.value = false;
};

watch(
  () => props.src,
  () => {
    imageFailed.value = false;
    openModal.value = false;
  },
);
</script>
