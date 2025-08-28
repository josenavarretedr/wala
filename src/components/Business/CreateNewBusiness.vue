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
import { createBusiness } from "@/composables/useBusiness";

const businessStore = useBusinessStore();
const userStore = useUserStore();
const authStore = useAuthStore();
const router = useRouter();

// Refs para formulario
const name = ref("");
const description = ref("");
const type = ref("");
const region = ref("");
const socialHandle = ref("");
const contactNumber = ref("");
const isLoading = ref(false);

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

  isLoading.value = true;

  try {
    console.log("🔄 Creando nuevo negocio...");

    // Obtener el UID del usuario actual
    const currentUser = authStore.currentUser;
    if (!currentUser) {
      throw new Error("Usuario no autenticado");
    }

    // Preparar datos del negocio
    const businessData = {
      nombre: name.value.trim(),
      descripcion: description.value.trim(),
      tipo: type.value,
      region: region.value.trim(),
      redSocial: socialHandle.value.trim(),
      telefono: contactNumber.value.trim(),
    };

    // Crear negocio usando el composable
    const businessId = await createBusiness(currentUser.uid, businessData);

    console.log("✅ Negocio creado con ID:", businessId);

    // Agregar el negocio al store del usuario
    const newBusinessForUser = {
      businessId: businessId,
      businessName: businessData.nombre,
      businessType: businessData.tipo,
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
    userStore.switchBusiness(businessId);

    // Cargar datos del negocio en el store
    await businessStore.loadBusiness(businessId, newBusinessForUser);

    alert("¡Negocio registrado exitosamente!");

    // Redirigir al dashboard del nuevo negocio
    router.push(`/business/${businessId}/dashboard`);
  } catch (error) {
    console.error("❌ Error al registrar el negocio:", error);
    alert(`Error al registrar el negocio: ${error.message}`);
  } finally {
    isLoading.value = false;
  }
}
</script>
