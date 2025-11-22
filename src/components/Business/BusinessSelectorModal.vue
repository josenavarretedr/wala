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
        class="inline-block align-bottom bg-white rounded-xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"
      >
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">
              Cambiar de negocio
            </h3>
            <p class="text-xs text-gray-500 mt-1">
              {{ userStore.userBusinesses.length }} negocio{{
                userStore.userBusinesses.length !== 1 ? "s" : ""
              }}
              disponible{{ userStore.userBusinesses.length !== 1 ? "s" : "" }}
            </p>
          </div>
          <button
            @click="$emit('close')"
            class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
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

        <!-- Lista de negocios -->
        <div class="space-y-2 mb-4">
          <div
            v-for="business in userStore.userBusinesses"
            :key="business.businessId"
            @click="selectBusiness(business)"
            :class="[
              'flex items-center p-3 sm:p-4 rounded-lg border cursor-pointer transition-all duration-200',
              business.businessId === currentBusiness?.businessId
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50',
            ]"
          >
            <!-- Icon del negocio -->
            <div
              :class="[
                'w-10 h-10 rounded-lg flex items-center justify-center mr-3 transition-colors',
                business.businessId === currentBusiness?.businessId
                  ? 'bg-blue-100'
                  : 'bg-gray-100',
              ]"
            >
              <span
                :class="[
                  'font-semibold text-base',
                  business.businessId === currentBusiness?.businessId
                    ? 'text-blue-600'
                    : 'text-gray-600',
                ]"
              >
                {{ business.businessName.charAt(0).toUpperCase() }}
              </span>
            </div>

            <!-- Información del negocio -->
            <div class="flex-1 min-w-0">
              <h4 class="text-sm font-medium text-gray-900 truncate">
                {{ business.businessName }}
              </h4>
              <p class="text-xs text-gray-500 truncate">
                {{ business.departamento || "Sin departamento" }}
              </p>
            </div>

            <!-- Indicador de selección -->
            <div
              v-if="business.businessId === currentBusiness?.businessId"
              class="ml-2"
            >
              <div
                class="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center"
              >
                <svg
                  class="w-3 h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="3"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <div v-else class="ml-2">
              <svg
                class="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </div>

        <!-- Divider -->
        <div class="border-t border-gray-200 my-4"></div>

        <!-- Opción para crear un nuevo negocio -->
        <div
          @click="createNewBusiness"
          class="flex items-center p-3 sm:p-4 rounded-lg border border-dashed border-gray-300 cursor-pointer transition-all duration-200 hover:border-blue-400 hover:bg-blue-50 group"
        >
          <div
            class="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-100 transition-colors"
          >
            <svg
              class="w-5 h-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
          <div class="flex-1">
            <h4 class="text-sm font-medium text-gray-900">
              Crear nuevo negocio
            </h4>
            <p class="text-xs text-gray-500">
              Configura un nuevo emprendimiento
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div class="mt-6">
          <button
            @click="$emit('close')"
            class="w-full py-2.5 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
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
import { useTransactionStore } from "@/stores/transaction/transactionStore";

const router = useRouter();
const userStore = useUserStore();
const businessStore = useBusinessStore();
const transactionStore = useTransactionStore();

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

      transactionStore.resetTransactionInStore();

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

const createNewBusiness = () => {
  try {
    // Cerrar el modal primero
    emit("close");

    // Redirigir a la página de creación de negocio con modo create
    router.push("/onboarding?mode=create");

    console.log("✅ Navegación exitosa a crear negocio");
  } catch (error) {
    console.error("❌ Error al navegar a crear negocio:", error);
  }
};
</script>
