<template>
  <!-- Contenedor de múltiples toasts apilados -->
  <div
    class="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 max-w-md w-full mx-auto px-4"
  >
    <transition-group
      name="toast"
      tag="div"
      class="flex flex-col-reverse gap-3"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'rounded-xl shadow-lg border-2 p-4 flex items-center gap-3 toast-item',
          typeClasses[toast.type],
        ]"
      >
        <!-- Icon -->
        <div class="flex-shrink-0">
          <component
            :is="icons[toast.type]"
            :class="['w-6 h-6', iconColorClasses[toast.type]]"
          />
        </div>

        <!-- Message -->
        <div
          :class="['flex-1 text-sm font-medium', textColorClasses[toast.type]]"
        >
          <template v-if="toast.actionLink">
            {{ toast.message.split(toast.actionLink.text)[0] }} <br />
            <router-link
              :to="toast.actionLink.route"
              :class="[
                'underline font-semibold hover:opacity-80',
                textColorClasses[toast.type],
              ]"
              @click="removeToast(toast.id)"
            >
              {{ toast.actionLink.text }}
            </router-link>
            {{ toast.message.split(toast.actionLink.text)[1] || "" }}
          </template>
          <template v-else>
            {{ toast.message }}
          </template>
        </div>

        <!-- Close Button -->
        <button
          v-if="toast.closable"
          @click="removeToast(toast.id)"
          :class="[
            'flex-shrink-0 p-1 rounded-lg transition-colors',
            closeButtonClasses[toast.type],
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
    </transition-group>
  </div>
</template>

<script setup>
import {
  InfoCircle,
  CheckCircle,
  WarningCircle,
  XmarkCircle,
  BrightCrown,
} from "@iconoir/vue";
import { useToast } from "@/composables/useToast";

const { toasts, removeToast } = useToast();

const icons = {
  info: InfoCircle,
  success: CheckCircle,
  warning: WarningCircle,
  error: XmarkCircle,
  premium: BrightCrown,
};

const typeClasses = {
  info: "bg-blue-50 border-blue-200",
  success: "bg-green-50 border-green-200",
  warning: "bg-amber-50 border-amber-200",
  error: "bg-red-50 border-red-200",
  premium: "bg-orange-50 border-orange-200",
};

const iconColorClasses = {
  info: "text-blue-600",
  success: "text-green-600",
  warning: "text-amber-600",
  error: "text-red-600",
  premium: "text-orange-600",
};

const textColorClasses = {
  info: "text-blue-900",
  success: "text-green-900",
  warning: "text-amber-900",
  error: "text-red-900",
  premium: "text-orange-900",
};

const closeButtonClasses = {
  info: "text-blue-600 hover:bg-blue-100",
  success: "text-green-600 hover:bg-green-100",
  warning: "text-amber-600 hover:bg-amber-100",
  error: "text-red-600 hover:bg-red-100",
  premium: "text-orange-600 hover:bg-orange-100",
};
</script>

<style scoped>
/* Animaciones de entrada y salida con fade out de 1 segundo */
.toast-enter-active {
  transition: all 0.3s ease-out;
}

.toast-leave-active {
  transition: all 1s ease-in;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(1rem) scale(0.95);
}

.toast-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.toast-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(1rem) scale(0.95);
}

/* Animación de movimiento cuando otros toasts se eliminan */
.toast-move {
  transition: transform 0.3s ease;
}
</style>
