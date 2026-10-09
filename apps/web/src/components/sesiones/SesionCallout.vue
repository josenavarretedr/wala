<template>
  <div class="rounded-2xl border p-4 md:p-5" :class="palette.wrapper">
    <div class="flex items-start gap-3">
      <div class="mt-0.5 rounded-lg p-2" :class="palette.iconWrap">
        <component
          :is="palette.icon"
          class="h-5 w-5"
          :class="palette.iconColor"
        />
      </div>

      <div class="flex-1">
        <p
          v-if="title"
          class="text-sm font-semibold md:text-base"
          :class="palette.title"
        >
          {{ title }}
        </p>
        <div
          class="mt-1 text-sm leading-relaxed md:text-base"
          :class="palette.body"
        >
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { Book, EditPencil, InfoCircle, WarningCircle } from "@iconoir/vue";

const props = defineProps({
  type: {
    type: String,
    default: "info",
  },
  title: {
    type: String,
    default: "",
  },
});

const paletteMap = {
  info: {
    wrapper: "border-blue-200 bg-blue-50",
    iconWrap: "bg-blue-100",
    iconColor: "text-blue-700",
    title: "text-blue-900",
    body: "text-blue-800",
    icon: Book,
  },
  exercise: {
    wrapper: "border-teal-200 bg-teal-50",
    iconWrap: "bg-teal-100",
    iconColor: "text-teal-700",
    title: "text-teal-900",
    body: "text-teal-800",
    icon: EditPencil,
  },
  tip: {
    wrapper: "border-amber-200 bg-amber-50",
    iconWrap: "bg-amber-100",
    iconColor: "text-amber-700",
    title: "text-amber-900",
    body: "text-amber-800",
    icon: InfoCircle,
  },
  warning: {
    wrapper: "border-orange-200 bg-orange-50",
    iconWrap: "bg-orange-100",
    iconColor: "text-orange-700",
    title: "text-orange-900",
    body: "text-orange-800",
    icon: WarningCircle,
  },
};

const palette = computed(() => paletteMap[props.type] || paletteMap.info);
</script>
