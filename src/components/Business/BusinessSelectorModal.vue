<template>
  <!-- Modal overlay -->
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <div
      class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
    >
      <!-- Fondo oscuro -->
      <div
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        @click="$emit('close')"
      ></div>

      <!-- Modal -->
      <div
        class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"
      >
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-medium text-gray-900">Seleccionar Negocio</h3>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              class="w-6 h-6"
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

        <!-- Lista de negocios -->
        <div class="space-y-3">
          <div
            v-for="business in userStore.userBusinesses"
            :key="business.businessId"
            @click="selectBusiness(business)"
            :class="[
              'flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all',
              business.businessId === currentBusiness?.businessId
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50',
            ]"
          >
            <!-- Icon del negocio -->
            <div
              class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4"
            >
              <span class="text-blue-600 font-bold text-lg">
                {{ business.businessName.charAt(0) }}
              </span>
            </div>

            <!-- Información del negocio -->
            <div class="flex-1">
              <h4 class="text-sm font-medium text-gray-900">
                {{ business.businessName }}
              </h4>
              <p class="text-xs text-gray-500">
                {{ business.rol === "gerente" ? "👑 Gerente" : "👤 Empleado" }}
              </p>
              <p class="text-xs text-gray-400">
                {{ business.businessType || "Negocio" }}
              </p>
            </div>

            <!-- Indicador de selección -->
            <div
              v-if="business.businessId === currentBusiness?.businessId"
              class="text-blue-500"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="mt-6 pt-4 border-t border-gray-200">
          <button
            @click="$emit('close')"
            class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/useUserStore";
import { useBusinessStore } from "@/stores/businessStore";

const router = useRouter();
const userStore = useUserStore();
const businessStore = useBusinessStore();

// Emits
const emit = defineEmits(["close"]);

// Computed
const currentBusiness = computed(() => userStore.currentBusiness);

// Métodos
const selectBusiness = async (business) => {
  try {
    console.log("🔄 Cambiando a negocio:", business.businessName);

    // Cambiar negocio en el store
    const switched = userStore.switchBusiness(business.businessId);

    if (switched) {
      // Cargar datos del negocio
      await businessStore.loadBusiness(business.businessId);

      // Redirigir al dashboard del nuevo negocio
      router.push(`/business/${business.businessId}/dashboard`);

      // Cerrar modal
      emit("close");

      console.log("✅ Negocio cambiado exitosamente");
    } else {
      console.error("❌ No se pudo cambiar el negocio");
    }
  } catch (error) {
    console.error("❌ Error al cambiar negocio:", error);
  }
};
</script>
