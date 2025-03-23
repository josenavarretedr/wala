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
        class="w-full flex justify-center items-center bg-blue-500 hover:bg-blue-600 text-white text-xl font-semibold py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
      >
        <PlusCircle class="w-6 h-6 mr-2" />
        Registrar negocio
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
const businessStore = useBusinessStore();
const router = useRouter();

// Refs para formulario
const name = ref("");
const description = ref("");
const type = ref("");
const region = ref("");
const socialHandle = ref("");
const contactNumber = ref("");

async function handleSubmit() {
  try {
    const id = await businessStore.createNewBusiness({
      name: name.value,
      description: description.value,
      type: type.value,
      region: region.value,
      socialHandle: socialHandle.value,
      contactNumber: contactNumber.value,
    });

    if (id) {
      alert("Negocio registrado exitosamente.");
      router.push(`/dashboard/${id}`);
    } else {
      alert("No se pudo registrar el negocio.");
    }
  } catch (error) {
    console.error("Error al registrar el negocio:", error);
    alert("Error al registrar el negocio.");
  }
}
</script>
