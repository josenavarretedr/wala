<template>
  <div class="flex min-h-full flex-col bg-white">
    <!-- Header negocio -->
    <div
      class="px-4 py-4 bg-gradient-to-br from-gray-50 to-white border-b border-gray-200"
    >
      <!-- Info del negocio -->
      <div class="flex items-center gap-3 mb-3">
        <div
          class="relative w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md ring-2 ring-blue-100"
        >
          <span class="text-white font-bold text-lg">
            {{ businessInitial }}
          </span>
          <!-- Indicator activo -->
          <div
            class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"
          ></div>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-gray-900 truncate leading-tight">
            {{ businessDisplayName }}
          </p>
          <p class="text-xs text-gray-500 truncate mt-0.5">
            {{ businessDepartment }}
          </p>
        </div>
        <button
          class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white transition-all shadow-sm"
          @click="$emit('close')"
          title="Cerrar"
        >
          <svg
            class="w-5 h-5"
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

      <!-- Selector de negocio (si tiene múltiples) -->
      <button
        v-if="showBusinessSelector"
        @click="$emit('toggle-business-selector')"
        class="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-medium text-blue-700 bg-white rounded-lg hover:bg-blue-50 border border-gray-200 hover:border-blue-300 transition-all shadow-sm hover:shadow"
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
            d="M8 9l4-4 4 4m0 6l-4 4-4-4"
          />
        </svg>
        Cambiar de negocio
      </button>
    </div>

    <!-- Navegación -->
    <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
      <SidebarSection :items="mainItems" />

      <!-- Divider para admin items -->
      <div v-if="adminItems?.length" class="pt-4 pb-3">
        <div class="border-t border-gray-100"></div>
      </div>
      <SidebarSection v-if="adminItems?.length" :items="adminItems" />

      <!-- Divider para account items -->
      <div class="pt-4 pb-3">
        <div class="border-t border-gray-100"></div>
      </div>
      <SidebarSection :items="accountItems" />
    </nav>

    <!-- Footer -->
    <div class="border-t border-gray-100 p-4">
      <button
        @click="$emit('logout')"
        class="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all group"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
        Cerrar sesión
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useBusinessStore } from "@/stores/businessStore";
import { useUserStore } from "@/stores/useUserStore";
import SidebarSection from "@/components/layout/SidebarSection.vue";

const props = defineProps({
  currentBusiness: Object,
  mainItems: Array,
  adminItems: Array,
  accountItems: Array,
  showBusinessSelector: Boolean,
});
defineEmits(["close", "logout", "toggle-business-selector"]);

const businessStore = useBusinessStore();
const userStore = useUserStore();

// Computed properties reactivos que se actualizan automáticamente
const businessInitial = computed(() => {
  const business = businessStore.business;
  const userBusiness = userStore.currentBusiness;

  // Prioridad: 1. prop current-business, 2. businessStore, 3. userStore
  const name =
    props.currentBusiness?.businessName ||
    business?.businessName ||
    business?.businessName ||
    userBusiness?.businessName ||
    "WALA";
  return name.charAt(0).toUpperCase() || "W";
});

const businessDisplayName = computed(() => {
  const business = businessStore.business;
  const userBusiness = userStore.currentBusiness;

  return business?.businessName || "WALA";
});

const businessDepartment = computed(() => {
  const business = businessStore.business;
  const userBusiness = userStore.currentBusiness;

  return (
    props.currentBusiness?.departamento ||
    business?.departamento ||
    userBusiness?.departamento ||
    "Negocio activo"
  );
});
</script>
