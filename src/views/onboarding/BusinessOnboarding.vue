<template>
  <div
    class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4"
  >
    <div class="max-w-2xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8">
        <div
          class="mx-auto w-20 h-20 bg-green-600 rounded-2xl flex items-center justify-center mb-6"
        >
          <span class="text-3xl text-white">{{
            isCreateMode ? "➕" : "🏢"
          }}</span>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          {{ isCreateMode ? "Crear nuevo negocio" : "¡Bienvenido a Walla!" }}
        </h1>
        <p class="text-gray-600">
          {{
            isCreateMode
              ? "Agrega un nuevo negocio a tu cuenta"
              : "Configura tu primer negocio para comenzar"
          }}
        </p>
      </div>

      <!-- Formulario -->
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <form @submit.prevent="handleCreateBusiness" class="space-y-6">
          <!-- Nombre del negocio -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Nombre del negocio *
            </label>
            <input
              v-model="businessForm.nombre"
              type="text"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Ej: Restaurante El Buen Sabor"
            />
          </div>

          <!-- Tipo de negocio -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Tipo de negocio *
            </label>
            <select
              v-model="businessForm.tipo"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">Selecciona un tipo</option>
              <option value="restaurante">🍽️ Restaurante</option>
              <option value="tienda">🛍️ Tienda</option>
              <option value="farmacia">💊 Farmacia</option>
              <option value="panaderia">🥖 Panadería</option>
              <option value="ferreteria">🔧 Ferretería</option>
              <option value="salon">💄 Salón de Belleza</option>
              <option value="consultorio">🏥 Consultorio</option>
              <option value="servicios">🔧 Servicios</option>
              <option value="consultoria">💼 Consultoría</option>
              <option value="freelance">💻 Freelance</option>
              <option value="otro">📦 Otro</option>
            </select>
          </div>

          <!-- Departamento (opcional para empleados) -->
          <!-- <div v-if="businessForm.userRole === 'empleado'">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Departamento (opcional)
            </label>
            <input
              v-model="businessForm.departamento"
              type="text"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Ej: Cocina, Ventas, Administración"
            />
          </div> -->

          <!-- Información adicional -->
          <!-- <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div class="flex">
              <span class="text-blue-400 text-lg mr-3">💡</span>
              <div>
                <h4 class="text-sm font-medium text-blue-800">
                  Información importante
                </h4>
                <p class="text-sm text-blue-700 mt-1">
                  
                </p>
              </div>
            </div>
          </div> -->

          <!-- Botones -->
          <div class="flex flex-col sm:flex-row gap-4">
            <button
              v-if="isCreateMode"
              type="button"
              @click="goBack"
              class="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200"
            >
              ← Volver
            </button>

            <button
              type="submit"
              :disabled="isLoading"
              class="flex-1 py-3 px-4 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 transition-all duration-200 font-medium"
            >
              <span v-if="!isLoading" class="flex items-center justify-center">
                <span class="mr-2">🚀</span>
                {{ isCreateMode ? "Crear negocio" : "Comenzar" }}
              </span>
              <span v-else class="flex items-center justify-center">
                <span class="mr-2">⏳</span>
                Creando...
              </span>
            </button>
          </div>

          <!-- Error message -->
          <div
            v-if="error"
            class="bg-red-50 border border-red-200 rounded-xl p-4"
          >
            <span class="text-red-400 mr-2">⚠️</span>
            <span class="text-sm text-red-700">{{ error }}</span>
          </div>
        </form>
      </div>

      <!-- Ayuda -->
      <div
        class="mt-8 bg-gray-50 border border-gray-200 rounded-xl p-6 text-center"
      >
        <h4 class="text-lg font-semibold text-gray-800 mb-2">
          ¿Necesitas ayuda?
        </h4>
        <p class="text-gray-600 text-sm mb-4">
          Puedes cambiar esta información más tarde desde la configuración del
          negocio.
        </p>
        <div class="text-xs text-gray-500">
          📧 soporte@walla.app | 📞 +51 999 888 777
        </div>
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
  userRole: "gerente",
  departamento: "",
});

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

    if (!businessForm.value.tipo) {
      throw new Error("Debe seleccionar un tipo de negocio");
    }

    if (!businessForm.value.userRole) {
      throw new Error("Debe seleccionar su rol en el negocio");
    }

    // Generar ID para el negocio
    const uuid = uuidv4().slice(0, 8);
    const businessId = `${businessForm.value.tipo.toUpperCase()}-${uuid}`;

    console.log(`🏗️ Creando negocio: ${businessForm.value.nombre}`);

    // Crear el negocio en Firestore
    const businessData = {
      id: businessId,
      nombre: businessForm.value.nombre.trim(),
      tipo: businessForm.value.tipo,
      direccion: "",
      telefono: "",
      email: "",
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

    await businessStore.createBusiness(businessData);
    console.log(`✅ Negocio creado con ID: ${businessId}`);

    // Agregar relación usuario-negocio
    await userStore.addBusinessToUser(authStore.user.uid, {
      businessId: businessId,
      businessName: businessForm.value.nombre.trim(),
      rol: businessForm.value.userRole,
      departamento: businessForm.value.departamento.trim() || null,
      permissions:
        businessForm.value.userRole === "gerente"
          ? BUSINESS_PERMISSIONS.MANAGER
          : BUSINESS_PERMISSIONS.EMPLOYEE,
    });

    console.log(
      `✅ Usuario asignado al negocio como ${businessForm.value.userRole}`
    );

    // Establecer como negocio actual
    const switched = userStore.switchBusiness(businessId);
    if (!switched) {
      console.warn(
        `⚠️  No se pudo establecer negocio actual, pero continuando...`
      );
    }

    console.log(
      `🚀 Redirigiendo ${
        isCreateMode.value
          ? "al selector de negocios"
          : "al dashboard del negocio"
      }: ${businessId}`
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
