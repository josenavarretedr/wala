<template>
  <!-- Navegación -->
  <div
    class="flex flex-row justify-center items-stretch gap-3 sm:gap-4 lg:gap-6 max-w-4xl mx-auto bg-white p-2"
  >
    <!-- Botón Atrás -->
    <div class="relative group flex-1 max-w-xs sm:max-w-sm">
      <button
        @click="handlePrevious"
        :disabled="flowStore.isFirstStep"
        :class="[
          'w-full py-3 px-4 sm:py-4 sm:px-6 text-base sm:text-lg font-semibold rounded-xl shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 sm:gap-3 backdrop-blur-sm',
          flowStore.isFirstStep
            ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-500 shadow-gray-400/15 cursor-not-allowed'
            : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-gray-500/25 hover:from-gray-600 hover:to-gray-700 hover:shadow-gray-500/35',
        ]"
      >
        <svg
          class="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        <span class="font-bold tracking-wide text-sm sm:text-base">Atrás</span>
      </button>
    </div>

    <!-- Botón Siguiente/Crear Empresa -->
    <div class="relative group flex-1 max-w-xs sm:max-w-sm" id="btn-next">
      <!-- Botón Crear Empresa (último paso) -->
      <button
        v-if="flowStore.isLastStep"
        @click="handleCreateBusiness"
        :disabled="!flowStore.canGoNext || isCreating"
        :class="[
          'w-full py-3 px-4 sm:py-4 sm:px-6 text-base sm:text-lg font-semibold rounded-xl shadow-lg transition-all duration-200 transform flex items-center justify-center gap-2 sm:gap-3 backdrop-blur-sm',
          !flowStore.canGoNext || isCreating
            ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-500 shadow-gray-400/15 cursor-not-allowed opacity-70'
            : 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-green-500/25 hover:from-green-700 hover:to-green-800 hover:shadow-green-500/35 hover:scale-[1.02] active:scale-[0.98] opacity-100 cursor-pointer',
        ]"
      >
        <div
          v-if="isCreating"
          class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"
        ></div>
        <svg
          v-else
          class="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
        <span class="font-bold tracking-wide text-sm sm:text-base">
          {{ isCreating ? "Creando..." : "Crear Empresa" }}
        </span>
      </button>

      <!-- Botón Siguiente -->
      <button
        v-else
        @click="handleNext"
        :disabled="!flowStore.canGoNext"
        :class="[
          'w-full py-3 px-4 sm:py-4 sm:px-6 text-base sm:text-lg font-semibold rounded-xl shadow-lg transition-all duration-200 transform flex items-center justify-center gap-2 sm:gap-3 backdrop-blur-sm',
          flowStore.canGoNext
            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-blue-500/25 hover:from-blue-700 hover:to-blue-800 hover:shadow-blue-500/35 hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
            : 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-500 shadow-gray-400/15 cursor-not-allowed',
        ]"
      >
        <span class="font-bold tracking-wide text-sm sm:text-base"
          >Siguiente</span
        >
        <svg
          class="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0"
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
      </button>

      <!-- Tooltip de ayuda cuando el botón está deshabilitado -->
      <div
        v-if="!flowStore.canGoNext"
        class="absolute z-20 w-56 px-3 py-2 text-xs text-white bg-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 -bottom-16 left-1/2 transform -translate-x-1/2 pointer-events-none"
      >
        <div class="text-center">
          <strong>{{ flowStore.getValidationError() }}</strong>
        </div>
        <!-- Flecha del tooltip -->
        <div
          class="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-red-600"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useBusinessOnboardingFlowStore } from "@/stores/businessOnboardingFlowStore";
import { useBusinessStore } from "@/stores/businessStore";
import { useAuthStore } from "@/stores/authStore";
import { useUserStore } from "@/stores/useUserStore";
import { useToast } from "@/composables/useToast";

const router = useRouter();
const flowStore = useBusinessOnboardingFlowStore();
const businessStore = useBusinessStore();
const authStore = useAuthStore();
const userStore = useUserStore();
const { success, error: showError, warning } = useToast();

const isCreating = ref(false);

// Permisos por rol
const BUSINESS_PERMISSIONS = {
  MANAGER: {
    verIngresos: true,
    verEgresos: true,
    crearMovimientos: true,
    verRecords: true,
    editarMovimientos: true,
    verReportes: true,
    gestionarEmpleados: true,
    configurarNegocio: true,
  },
  EMPLOYEE: {
    verIngresos: true,
    verEgresos: false,
    crearMovimientos: true,
    editarMovimientos: false,
    verReportes: false,
    gestionarEmpleados: false,
    configurarNegocio: false,
  },
};

/**
 * Manejar retroceso
 */
const handlePrevious = () => {
  flowStore.previousStep();
};

/**
 * Manejar avance al siguiente paso
 */
const handleNext = () => {
  if (!flowStore.canGoNext) {
    warning(flowStore.getValidationError());
    return;
  }

  flowStore.nextStep();
};

/**
 * Crear el negocio en Firestore
 */
const handleCreateBusiness = async () => {
  if (!flowStore.canGoNext || isCreating.value) {
    return;
  }

  isCreating.value = true;

  try {
    const formData = flowStore.businessOnboardingData;

    console.log("🏗️ Creando negocio:", formData.nombre);

    // Crear el negocio en Firestore
    const businessData = {
      businessName: formData.nombre.trim(),
      industry: formData.industry,
      businessType: formData.businessType,
      descripcion: formData.descripcion.trim(),
      gerenteId: authStore.user.uid,
      fechaCreacion: new Date(),
      activo: true,
      configuracion: {
        moneda: "PEN",
        timezone: "America/Lima",
        permisos: {
          empleados: BUSINESS_PERMISSIONS.EMPLOYEE,
        },
      },
    };

    const business = await businessStore.createBusiness(businessData);
    const businessId = business.uuid || business.id;

    console.log("✅ Negocio creado con ID:", businessId);

    // Agregar relación usuario-negocio
    await userStore.addBusinessToUser(authStore.user.uid, {
      businessId: businessId,
      businessName: formData.nombre.trim(),
      rol: "gerente",
      permissions: BUSINESS_PERMISSIONS.MANAGER,
    });

    console.log("✅ Usuario asignado al negocio como gerente");

    // Establecer como negocio actual
    userStore.switchBusiness(businessId);

    // Toast de éxito
    success(`¡Empresa "${formData.nombre}" creada exitosamente!`);

    // Resetear el flow
    flowStore.cancelFlow();

    // Redirigir con delay
    setTimeout(() => {
      if (flowStore.isCreateMode) {
        router.push("/select-business");
      } else {
        router.push(`/business/${businessId}/dashboard`);
      }
    }, 1000);
  } catch (err) {
    console.error("❌ Error al crear negocio:", err);
    showError(err.message || "Error al crear el negocio. Intenta nuevamente.");
  } finally {
    isCreating.value = false;
  }
};
</script>
