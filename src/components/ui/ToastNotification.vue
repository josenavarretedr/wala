<template>
  <transition
    enter-active-class="transform transition ease-out duration-300"
    enter-from-class="opacity-0 translate-y-4 scale-95"
    enter-to-class="opacity-100 translate-y-0 scale-100"
    leave-active-class="transform transition ease-in duration-200"
    leave-from-class="opacity-100 translate-y-0 scale-100"
    leave-to-class="opacity-0 translate-y-4 scale-95"
  >
    <div
      v-if="show"
      class="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 max-w-md w-full mx-auto px-4"
    >
      <div
        :class="[
          'rounded-xl shadow-lg border-2 p-4 flex items-center gap-3',
          typeClasses[type],
        ]"
      >
        <!-- Icon -->
        <div class="flex-shrink-0">
          <component
            :is="icons[type]"
            :class="['w-6 h-6', iconColorClasses[type]]"
          />
        </div>

        <!-- Message -->
        <p :class="['flex-1 text-sm font-medium', textColorClasses[type]]">
          {{ message }}
        </p>

        <!-- Close Button -->
        <button
          v-if="closable"
          @click="close"
          :class="[
            'flex-shrink-0 p-1 rounded-lg transition-colors',
            closeButtonClasses[type],
          ]"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch } from "vue";
import {
  InfoCircle,
  CheckCircle,
  WarningCircle,
  XmarkCircle,
} from "@iconoir/vue";

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  message: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    default: "info", // 'info' | 'success' | 'warning' | 'error'
    validator: (value) =>
      ["info", "success", "warning", "error"].includes(value),
  },
  duration: {
    type: Number,
    default: 3000,
  },
  closable: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["update:show", "close"]);

const icons = {
  info: InfoCircle,
  success: CheckCircle,
  warning: WarningCircle,
  error: XmarkCircle,
};

const typeClasses = {
  info: "bg-blue-50 border-blue-200",
  success: "bg-green-50 border-green-200",
  warning: "bg-amber-50 border-amber-200",
  error: "bg-red-50 border-red-200",
};

const iconColorClasses = {
  info: "text-blue-600",
  success: "text-green-600",
  warning: "text-amber-600",
  error: "text-red-600",
};

const textColorClasses = {
  info: "text-blue-900",
  success: "text-green-900",
  warning: "text-amber-900",
  error: "text-red-900",
};

const closeButtonClasses = {
  info: "text-blue-600 hover:bg-blue-100",
  success: "text-green-600 hover:bg-green-100",
  warning: "text-amber-600 hover:bg-amber-100",
  error: "text-red-600 hover:bg-red-100",
};

let timeout = null;

watch(
  () => props.show,
  (newVal) => {
    if (newVal && props.duration > 0) {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        close();
      }, props.duration);
    }
  },
  { immediate: true }
);

function close() {
  emit("update:show", false);
  emit("close");
}
</script>
