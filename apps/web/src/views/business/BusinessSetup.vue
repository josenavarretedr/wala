<template>
  <div
    class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-2xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8">
        <div
          class="mx-auto w-20 h-20 bg-green-600 rounded-2xl flex items-center justify-center mb-6"
        >
          <span class="text-3xl text-white">🏢</span>
        </div>
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          Configurar tu Negocio
        </h1>
        <p class="text-gray-600 text-lg">
          Completa la información de tu negocio para comenzar
        </p>
      </div>

      <!-- Información temporal -->
      <div
        v-if="tempBusinessData"
        class="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8"
      >
        <div class="flex items-center space-x-3 mb-4">
          <span class="text-2xl">⚡</span>
          <h3 class="text-lg font-semibold text-yellow-800">
            ID Temporal Asignado
          </h3>
        </div>
        <div class="space-y-2 text-yellow-700">
          <p><strong>ID Temporal:</strong> {{ tempBusinessData.tempId }}</p>
          <p><strong>Nombre:</strong> {{ tempBusinessData.name }}</p>
          <p class="text-sm">
            Este ID se convertirá en el ID oficial una vez completada la
            configuración.
          </p>
        </div>
      </div>

      <!-- Formulario -->
      <div class="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <form @submit.prevent="handleSubmit" class="space-y-8">
          <!-- Información básica -->
          <div class="space-y-6">
            <h2 class="text-2xl font-semibold text-gray-800 border-b pb-3">
              📋 Información Básica
            </h2>

            <!-- Nombre del negocio -->
            <div>
              <label
                for="nombre"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Nombre del Negocio *
              </label>
              <input
                id="nombre"
                v-model="businessForm.nombre"
                type="text"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: Restaurante El Buen Sabor"
              />
            </div>

            <!-- Tipo de negocio -->
            <div>
              <label
                for="tipo"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Tipo de Negocio *
              </label>
              <select
                id="tipo"
                v-model="businessForm.tipo"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecciona el tipo de negocio</option>
                <option value="restaurante">🍽️ Restaurante</option>
                <option value="tienda">🛍️ Tienda</option>
                <option value="farmacia">💊 Farmacia</option>
                <option value="panaderia">🥖 Panadería</option>
                <option value="ferreteria">🔧 Ferretería</option>
                <option value="salon">💄 Salón de Belleza</option>
                <option value="consultorio">🏥 Consultorio</option>
                <option value="taller">🔧 Taller</option>
                <option value="otro">📦 Otro</option>
              </select>
            </div>

            <!-- Email del negocio -->
            <div>
              <label
                for="email"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Email del Negocio
              </label>
              <input
                id="email"
                v-model="businessForm.email"
                type="email"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="contacto@tunegocio.com"
              />
            </div>

            <!-- Teléfono -->
            <div>
              <label
                for="telefono"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Teléfono
              </label>
              <input
                id="telefono"
                v-model="businessForm.telefono"
                type="tel"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+51 999 888 777"
              />
            </div>
          </div>

          <!-- Ubicación -->
          <div class="space-y-6">
            <h2 class="text-2xl font-semibold text-gray-800 border-b pb-3">
              📍 Ubicación
            </h2>

            <!-- Dirección -->
            <div>
              <label
                for="direccion"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Dirección Completa
              </label>
              <textarea
                id="direccion"
                v-model="businessForm.direccion"
                rows="3"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Av. Principal 123, Distrito, Ciudad"
              ></textarea>
            </div>
          </div>

          <!-- Configuración -->
          <div class="space-y-6">
            <h2 class="text-2xl font-semibold text-gray-800 border-b pb-3">
              ⚙️ Configuración
            </h2>

            <!-- Moneda -->
            <div>
              <label
                for="moneda"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Moneda Principal
              </label>
              <select
                id="moneda"
                v-model="businessForm.moneda"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="PEN">🇵🇪 Soles Peruanos (PEN)</option>
                <option value="USD">🇺🇸 Dólares Americanos (USD)</option>
                <option value="EUR">🇪🇺 Euros (EUR)</option>
                <option value="COP">🇨🇴 Pesos Colombianos (COP)</option>
                <option value="MXN">🇲🇽 Pesos Mexicanos (MXN)</option>
              </select>
            </div>

            <!-- Zona horaria -->
            <div>
              <label
                for="timezone"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Zona Horaria
              </label>
              <select
                id="timezone"
                v-model="businessForm.timezone"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="America/Lima">🇵🇪 Lima (UTC-5)</option>
                <option value="America/Bogota">🇨🇴 Bogotá (UTC-5)</option>
                <option value="America/Mexico_City">
                  🇲🇽 Ciudad de México (UTC-6)
                </option>
                <option value="America/New_York">🇺🇸 Nueva York (UTC-5)</option>
                <option value="Europe/Madrid">🇪🇸 Madrid (UTC+1)</option>
              </select>
            </div>
          </div>

          <!-- Botones -->
          <div class="flex space-x-4 pt-6">
            <button
              type="button"
              @click="goBack"
              class="flex-1 py-3 px-4 rounded-xl text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-200"
            >
              ← Volver
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="flex-1 py-3 px-4 rounded-xl text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 transition-all duration-200"
            >
              <span v-if="!isSubmitting">🚀 Crear Negocio</span>
              <span v-else>⏳ Creando...</span>
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
        class="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6 text-center"
      >
        <h4 class="text-lg font-semibold text-blue-800 mb-2">
          💡 ¿Necesitas ayuda?
        </h4>
        <p class="text-blue-700 text-sm">
          Puedes cambiar esta información más tarde desde la configuración del
          negocio.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { useUserStore } from "@/stores/useUserStore";
import { useBusinessStore } from "@/stores/businessStore";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const userStore = useUserStore();
const businessStore = useBusinessStore();

const isSubmitting = ref(false);
const error = ref(null);

// Datos temporales del negocio
const tempBusinessData = ref(null);

// Formulario del negocio
const businessForm = ref({
  nombre: "",
  tipo: "",
  email: "",
  telefono: "",
  direccion: "",
  moneda: "PEN",
  timezone: "America/Lima",
});

const tempId = computed(() => route.params.tempId);

onMounted(async () => {
  // Verificar autenticación
  if (!authStore.isAuthenticated) {
    router.push("/login");
    return;
  }

  // Verificar que es gerente
  if (userStore.userProfile?.rol !== "gerente") {
    router.push("/login");
    return;
  }

  // Cargar datos temporales del localStorage
  const tempData = localStorage.getItem("walla_temp_business");
  if (tempData) {
    tempBusinessData.value = JSON.parse(tempData);

    // Verificar que el tempId coincide
    if (tempBusinessData.value.tempId !== tempId.value) {
      console.error("ID temporal no coincide");
      router.push("/login");
      return;
    }

    // Pre-llenar el formulario
    businessForm.value.nombre = tempBusinessData.value.name || "";

    // Obtener tipo de negocio del tempId
    if (tempId.value.includes("RESTAURANTE")) {
      businessForm.value.tipo = "restaurante";
    } else if (tempId.value.includes("TIENDA")) {
      businessForm.value.tipo = "tienda";
    } else if (tempId.value.includes("FARMACIA")) {
      businessForm.value.tipo = "farmacia";
    }
  } else {
    console.error("No se encontraron datos temporales del negocio");
    router.push("/login");
  }
});

const handleSubmit = async () => {
  error.value = null;
  isSubmitting.value = true;

  try {
    // Validaciones básicas
    if (!businessForm.value.nombre.trim()) {
      throw new Error("El nombre del negocio es obligatorio");
    }

    if (!businessForm.value.tipo) {
      throw new Error("Debe seleccionar un tipo de negocio");
    }

    // Crear el negocio en Firestore
    const businessData = {
      nombre: businessForm.value.nombre.trim(),
      tipo: businessForm.value.tipo,
      email: businessForm.value.email.trim(),
      telefono: businessForm.value.telefono.trim(),
      direccion: businessForm.value.direccion.trim(),
      moneda: businessForm.value.moneda,
      timezone: businessForm.value.timezone,
      gerenteId: authStore.user.uid,
    };

    console.log("📝 Creando negocio con datos:", businessData);

    const newBusiness = await businessStore.createBusiness(businessData);

    console.log("✅ Negocio creado exitosamente:", newBusiness.id);

    // Actualizar el perfil del usuario con el ID real del negocio
    await userStore.updateUserProfile({
      businessId: newBusiness.id,
      businessName: newBusiness.nombre,
      tipoNegocio: newBusiness.tipo,
    });

    console.log("✅ Perfil de usuario actualizado");

    // Limpiar datos temporales
    localStorage.removeItem("walla_temp_business");

    // Redirigir al dashboard del negocio
    setTimeout(() => {
      router.push(`/business/${newBusiness.id}/dashboard`);
    }, 1000);
  } catch (err) {
    console.error("❌ Error al crear negocio:", err);
    error.value = err.message || "Error al crear el negocio";
  } finally {
    isSubmitting.value = false;
  }
};

const goBack = () => {
  router.push("/login");
};
</script>
