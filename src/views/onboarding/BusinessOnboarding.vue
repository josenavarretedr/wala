<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4">
    <div class="max-w-2xl mx-auto">
      <!-- Botón de volver (solo en modo create) -->
      <button
        v-if="isCreateMode"
        @click="goBack"
        class="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 mb-6 transition-colors"
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
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Volver
      </button>

      <!-- Header -->
      <div class="text-center mb-8">
        <div
          class="mx-auto w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4"
        >
          <svg
            class="w-6 h-6 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              v-if="isCreateMode"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
            <path
              v-else
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </div>
        <h1 class="text-2xl font-semibold text-gray-900 mb-1">
          {{ isCreateMode ? "Crear nuevo negocio" : "¡Bienvenido a Wala!" }}
        </h1>
        <p class="text-sm text-gray-500">
          {{
            isCreateMode
              ? "Agrega un nuevo negocio a tu cuenta"
              : "Configura tu primer negocio para comenzar"
          }}
        </p>
      </div>

      <!-- Formulario -->
      <div
        class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8"
      >
        <form @submit.prevent="handleCreateBusiness" class="space-y-6">
          <!-- Nombre del negocio -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">
              Nombre del negocio
              <span class="text-red-500">*</span>
            </label>
            <input
              v-model="businessForm.nombre"
              type="text"
              required
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
              placeholder="Ej: Mi Bodega Central"
            />
          </div>

          <!-- 🤖 Rubro/Industria para IA -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">
              ¿Qué productos/servicios ofreces?
              <span class="text-red-500">*</span>
            </label>
            <select
              v-model="businessForm.industry"
              required
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-white"
            >
              <option value="">Selecciona tu rubro</option>
              <option value="ferreteria">
                🔨 Ferretería / Materiales de Construcción
              </option>
              <option value="reposteria">
                🍰 Repostería / Panadería / Pastelería
              </option>
              <option value="libreria">📚 Librería / Papelería</option>
              <option value="restaurante">
                🍽️ Restaurante / Cafetería / Comida
              </option>
              <option value="farmacia">💊 Farmacia / Botica</option>
              <option value="otro">
                ❓ Otro (la IA lo detectará automáticamente)
              </option>
            </select>

            <p
              v-if="businessForm.industry === 'otro'"
              class="mt-2 text-xs text-purple-600 bg-purple-50 rounded-lg p-3"
            >
              <strong>💡 Detección automática:</strong> La IA analizará los
              productos que agregues para identificar tu rubro y mejorar las
              sugerencias de clasificación.
            </p>

            <p
              v-else-if="businessForm.industry"
              class="mt-2 text-xs text-green-600 bg-green-50 rounded-lg p-3"
            >
              <strong>¡Excelente!</strong> Wala usará y análisis para
              {{ getIndustryLabel(businessForm.industry) }}.
            </p>
          </div>

          <!-- Descripción del negocio -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">
              Descripción del negocio
              <span class="text-gray-400 text-xs font-normal">(opcional)</span>
            </label>
            <textarea
              v-model="businessForm.descripcion"
              rows="3"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm resize-none"
              placeholder="Describe brevemente tu negocio: qué vendes, qué servicios ofreces, o cualquier detalle relevante..."
            ></textarea>
            <p class="mt-1 text-xs text-gray-500">
              Esta información te ayudará a identificar mejor tu negocio
            </p>
          </div>

          <!-- Botones -->
          <div class="flex flex-col-reverse sm:flex-row gap-3 pt-4">
            <button
              v-if="isCreateMode"
              type="button"
              @click="goBack"
              class="flex-1 py-2.5 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
            >
              Cancelar
            </button>

            <button
              type="submit"
              :disabled="isLoading"
              class="flex-1 py-2.5 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm"
            >
              <span v-if="!isLoading" class="flex items-center justify-center">
                <svg
                  class="w-4 h-4 mr-2"
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
                {{ isCreateMode ? "Crear negocio" : "Continuar" }}
              </span>
              <span v-else class="flex items-center justify-center">
                <div
                  class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"
                ></div>
                Creando...
              </span>
            </button>
          </div>

          <!-- Error message -->
          <div
            v-if="error"
            class="bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <div class="flex items-start">
              <svg
                class="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span class="text-sm text-red-700">{{ error }}</span>
            </div>
          </div>
        </form>
      </div>

      <!-- Información adicional -->
      <div
        class="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-4 text-center"
      >
        <p class="text-xs text-blue-700">
          Podrás cambiar esta información en cualquier momento desde la
          configuración de tu negocio
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { useUserStore } from "@/stores/useUserStore";
import { useBusinessStore } from "@/stores/businessStore";
import { v4 as uuidv4 } from "uuid";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const userStore = useUserStore();
const businessStore = useBusinessStore();

const isLoading = ref(false);
const error = ref(null);

const isCreateMode = computed(() => route.query.mode === "create");

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

const businessForm = ref({
  nombre: "",
  tipo: "",
  industry: "", // 🆕 Campo para clasificación IA
  descripcion: "",
  userRole: "gerente",
  departamento: "",
});

// Helper: Obtener etiqueta de industria
const getIndustryLabel = (industryValue) => {
  const labels = {
    ferreteria: "Ferretería / Materiales de Construcción",
    reposteria: "Repostería / Panadería",
    libreria: "Librería / Papelería",
    restaurante: "Restaurante / Cafetería",
    farmacia: "Farmacia / Botica",
    otro: "Otro",
  };
  return labels[industryValue] || industryValue;
};

onMounted(() => {
  // Verificar autenticación
  if (!authStore.isAuthenticated) {
    router.push("/login");
    return;
  }

  // Si ya tiene negocios y NO está en modo create, redirigir al selector
  if (userStore.userBusinesses.length > 0 && !isCreateMode.value) {
    router.push("/select-business");
    return;
  }
});

const handleCreateBusiness = async () => {
  error.value = null;
  isLoading.value = true;

  try {
    // Validaciones
    if (!businessForm.value.nombre.trim()) {
      throw new Error("El nombre del negocio es obligatorio");
    }

    if (!businessForm.value.industry) {
      throw new Error("Debe seleccionar el rubro de tu negocio");
    }

    if (!businessForm.value.userRole) {
      throw new Error("Debe seleccionar su rol en el negocio");
    }

    console.log(`🏗️ Creando negocio: ${businessForm.value.nombre}`);

    // Crear el negocio en Firestore
    const businessData = {
      businessName: businessForm.value.nombre.trim(),
      industry: businessForm.value.industry, // 🆕 Campo para clasificación IA
      descripcion: businessForm.value.descripcion.trim() || "",
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
    console.log(`✅ Negocio creado con ID: ${businessId}`);

    // Agregar relación usuario-negocio
    await userStore.addBusinessToUser(authStore.user.uid, {
      businessId: businessId,
      businessName: businessForm.value.nombre.trim(),
      rol: businessForm.value.userRole,
      permissions:
        businessForm.value.userRole === "gerente"
          ? BUSINESS_PERMISSIONS.MANAGER
          : BUSINESS_PERMISSIONS.EMPLOYEE,
    });

    console.log(
      `✅ Usuario asignado al negocio como ${businessForm.value.userRole}`,
    );

    // Establecer como negocio actual
    const switched = userStore.switchBusiness(businessId);
    if (!switched) {
      console.warn(
        `⚠️  No se pudo establecer negocio actual, pero continuando...`,
      );
    }

    console.log(
      `🚀 Redirigiendo ${
        isCreateMode.value
          ? "al selector de negocios"
          : "al dashboard del negocio"
      }: ${businessId}`,
    );

    // Redirigir con un pequeño delay para asegurar sincronización
    setTimeout(() => {
      if (isCreateMode.value) {
        // En modo create, ir al selector para que pueda elegir el negocio
        router.push("/select-business");
      } else {
        // En onboarding inicial, ir directamente al dashboard
        router.push(`/business/${businessId}/dashboard`);
      }
    }, 500);
  } catch (err) {
    console.error("❌ Error al crear negocio:", err);
    error.value = err.message || "Error al crear el negocio";
  } finally {
    isLoading.value = false;
  }
};

const goBack = () => {
  if (userStore.userBusinesses.length > 0) {
    router.push("/select-business");
  } else {
    router.push("/login");
  }
};
</script>
