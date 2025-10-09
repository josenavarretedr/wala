<template>
  <div class="flex min-h-full flex-col">
    <!-- Header negocio -->
    <div class="px-4 py-3 md:px-6 md:py-4 border-b border-gray-200 bg-blue-50">
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"
        >
          <span class="text-blue-600 font-bold">
            {{ currentBusiness?.businessName?.charAt(0) || "N" }}
          </span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 truncate">
            {{ currentBusiness?.businessName || "Sin negocio" }}
          </p>
        </div>
        <button
          class="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-200 rounded lg:hidden"
          @click="$emit('close')"
          title="Cerrar"
        >
          ✕
        </button>
      </div>

      <!-- Selector de negocio (si tiene múltiples) -->
      <button
        v-if="showBusinessSelector"
        @click="$emit('toggle-business-selector')"
        class="mt-3 w-full text-left px-3 py-2 text-xs text-blue-600 bg-white rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
      >
        🔄 Cambiar negocio
      </button>
    </div>

    <!-- Navegación -->
    <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
      <SidebarSection title="🏠 Principal" :items="mainItems" />
      <SidebarSection
        v-if="adminItems?.length"
        title="⚙️ Administración"
        :items="adminItems"
      />
      <SidebarSection title="👤 Mi Cuenta" :items="accountItems" />
    </nav>

    <!-- Footer -->
    <div class="border-t border-gray-200 p-4">
      <button
        @click="$emit('logout')"
        class="w-full flex items-center justify-center gap-2 px-4 py-3 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
      >
        <span class="text-sm font-medium">Cerrar sesión</span>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  currentBusiness: Object,
  mainItems: Array,
  adminItems: Array,
  accountItems: Array,
  showBusinessSelector: Boolean,
});
defineEmits(["close", "logout", "toggle-business-selector"]);
import SidebarSection from "@/components/layout/SidebarSection.vue";
</script>
