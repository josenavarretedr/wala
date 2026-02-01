<template>
  <div class="w-full max-w-xl mx-auto py-10">
    <h2 class="text-3xl font-bold text-center mb-8 text-gray-800">
      Registrar nuevo negocio
    </h2>

    <form
      @submit.prevent="handleSubmit"
      class="bg-white rounded-2xl shadow-xl px-8 py-10 space-y-6"
    >
      <!-- Nombre del negocio -->
      <div class="flex items-center space-x-4 border-b pb-2">
        <Shop class="w-8 h-8 text-blue-500" />
        <input
          v-model="name"
          type="text"
          placeholder="Nombre del negocio o actividad"
          class="w-full text-lg placeholder-gray-400 focus:outline-none"
        />
      </div>

      <!-- Descripción de la actividad -->
      <div class="flex items-start space-x-4 border-b pb-2">
        <Text class="w-8 h-8 text-blue-500 mt-1" />
        <textarea
          v-model="description"
          placeholder="Describe brevemente la actividad"
          class="w-full text-lg placeholder-gray-400 focus:outline-none resize-none"
          rows="3"
        ></textarea>
      </div>

      <!-- Tipo de negocio -->
      <div class="space-y-2">
        <div class="flex items-center space-x-4">
          <Suitcase class="w-8 h-8 text-blue-500" />
          <select
            v-model="type"
            class="w-full text-lg text-gray-700 px-4 py-3 rounded-lg shadow-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option disabled value="">Selecciona el tipo de negocio</option>
            <option value="producción">Producción</option>
            <option value="servicios">Servicios</option>
            <option value="comercio">Comercio</option>
            <option value="mixto">Mixto</option>
          </select>
        </div>

        <p class="text-sm text-gray-500 leading-relaxed">
          <strong>Producción:</strong> transformación de materias primas. <br />
          <strong>Comercio:</strong> compra y venta de productos. <br />
          <strong>Mixto:</strong> combina ambas actividades.
        </p>
      </div>

      <!-- 🆕 INDUSTRIA/RUBRO (para clasificación IA) -->
      <div class="space-y-2">
        <div class="flex items-center space-x-4">
          <svg
            class="w-8 h-8 text-purple-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            ></path>
          </svg>
          <select
            v-model="industry"
            class="w-full text-lg text-gray-700 px-4 py-3 rounded-lg shadow-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option disabled value="">¿Qué productos/servicios ofreces?</option>
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
        </div>

        <p
          v-if="industry === 'otro'"
          class="text-xs text-purple-600 bg-purple-50 rounded-lg p-3 leading-relaxed"
        >
          <strong>💡 Detección automática:</strong> La IA analizará los
          productos que agregues para identificar tu rubro y mejorar las
          sugerencias de clasificación.
        </p>

        <p
          v-else-if="industry"
          class="text-xs text-green-600 bg-green-50 rounded-lg p-3 leading-relaxed"
        >
          <strong>✓ Perfecto:</strong> El sistema usará categorías
          especializadas para {{ getIndustryLabel(industry) }}.
        </p>
      </div>

      <!-- Región -->
      <div class="flex items-center space-x-4 border-b pb-2">
        <MapPin class="w-8 h-8 text-blue-500" />
        <input
          v-model="region"
          type="text"
          placeholder="Región"
          class="w-full text-lg placeholder-gray-400 focus:outline-none"
        />
      </div>

      <!-- Usuario de Instagram o Facebook -->
      <div class="flex items-center space-x-4 border-b pb-2">
        <Internet class="w-8 h-8 text-blue-500" />
        <input
          v-model="socialHandle"
          type="text"
          placeholder="@nombreusuario (Instagram o Facebook)"
          class="w-full text-lg placeholder-gray-400 focus:outline-none"
        />
      </div>

      <!-- Número de contacto -->
      <div class="flex items-center space-x-4 border-b pb-2">
        <Phone class="w-8 h-8 text-blue-500" />
        <input
          v-model="contactNumber"
          type="text"
          placeholder="Número de contacto"
          class="w-full text-lg placeholder-gray-400 focus:outline-none"
        />
      </div>

      <!-- Botón de enviar -->
      <button
        type="submit"
        :disabled="isLoading"
        :class="[
          'w-full flex justify-center items-center text-white text-xl font-semibold py-4 rounded-xl shadow-lg transform transition-all duration-200',
          isLoading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600 hover:scale-105',
        ]"
      >
        <div v-if="isLoading" class="flex items-center">
          <svg
            class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Creando negocio...
        </div>
        <div v-else class="flex items-center">
          <PlusCircle class="w-6 h-6 mr-2" />
          Registrar negocio
        </div>
      </button>
    </form>
  </div>
</template>
<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import {
  Shop,
  Text,
  Suitcase,
  MapPin,
  Phone,
  Internet,
  PlusCircle,
} from "@iconoir/vue";

import { useBusinessStore } from "@/stores/businessStore";
import { useUserStore } from "@/stores/useUserStore";
import { useAuthStore } from "@/stores/authStore";
import { v4 as uuidv4 } from "uuid";

const businessStore = useBusinessStore();
const userStore = useUserStore();
const authStore = useAuthStore();
const router = useRouter();

// Refs para formulario
const name = ref("");
const description = ref("");
const type = ref("");
const industry = ref("");
const region = ref("");
const socialHandle = ref("");
const contactNumber = ref("");
const isLoading = ref(false);

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

async function handleSubmit() {
  if (isLoading.value) return;

  // Validación básica
  if (!name.value.trim()) {
    alert("El nombre del negocio es obligatorio");
    return;
  }

  if (!type.value) {
    alert("Selecciona un tipo de negocio");
    return;
  }

  if (!industry.value) {
    alert("Selecciona el rubro de tu negocio");
    return;
  }

  isLoading.value = true;

  try {
    console.log("🔄 Creando nuevo negocio...");

    // Obtener el UID del usuario actual
    const currentUser = authStore.currentUser;
    if (!currentUser) {
      throw new Error("Usuario no autenticado");
    }

    // Generar ID único para el negocio
    const businessId = uuidv4();

    // Preparar datos del negocio
    const businessData = {
      id: businessId,
      nombre: name.value.trim(),
      tipo: type.value,
      industry: industry.value, // 🆕 Campo para clasificación IA
      direccion: region.value.trim(), // Mapear region a direccion
      telefono: contactNumber.value.trim(),
      email: "", // Campo requerido por el store
      gerenteId: currentUser.uid,
      descripcion: description.value.trim(),
      redSocial: socialHandle.value.trim(),
    };

    // Crear negocio usando el store
    const business = await businessStore.createBusiness(businessData);

    console.log("✅ Negocio creado:", business.nombre, "con ID:", business.id);

    // Agregar el negocio al store del usuario
    const newBusinessForUser = {
      businessId: business.id,
      businessName: business.nombre,
      businessType: business.tipo,
      rol: "gerente",
      permissions: {
        fullAccess: true,
        manageEmployees: true,
        manageFinances: true,
        viewReports: true,
      },
    };

    // Actualizar el store del usuario
    await userStore.addBusinessToUser(currentUser.uid, newBusinessForUser);

    // Cambiar al negocio recién creado
    userStore.switchBusiness(business.id);

    // El negocio ya está cargado en businessStore.business, no necesitamos llamar loadBusiness

    alert("¡Negocio registrado exitosamente!");

    // Redirigir al dashboard del nuevo negocio
    router.push(`/business/${business.id}/dashboard`);
  } catch (error) {
    console.error("❌ Error al registrar el negocio:", error);
    alert(`Error al registrar el negocio: ${error.message}`);
  } finally {
    isLoading.value = false;
  }
}
</script>
