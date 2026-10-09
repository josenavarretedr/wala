<template>
  <div>
    <h2 class="text-2xl font-bold mb-4">Información del Negocio</h2>

    <input
      v-model="businessName"
      type="text"
      placeholder="Nombre del negocio"
      class="w-full p-2 border border-gray-300 rounded-md"
    />
    <input
      v-model="socialMedia"
      type="text"
      placeholder="Redes sociales"
      class="w-full p-2 mt-2 border border-gray-300 rounded-md"
    />
    <input
      v-model="industry"
      type="text"
      placeholder="Rubro"
      class="w-full p-2 mt-2 border border-gray-300 rounded-md"
    />
    <textarea
      v-model="description"
      placeholder="Descripción"
      class="w-full p-2 mt-2 border border-gray-300 rounded-md"
    ></textarea>

    <div class="mt-4">
      <button
        @click="submit"
        class="w-full py-2 bg-blue-500 text-white rounded-md"
      >
        Guardar y continuar
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "@/stores/authStore";

const businessName = ref("");
const socialMedia = ref("");
const industry = ref("");
const description = ref("");

const authStore = useAuthStore();

const submit = async () => {
  try {
    const businessInfo = {
      businessName: businessName.value,
      socialMedia: socialMedia.value,
      industry: industry.value,
      description: description.value,
    };
    // Emitir la información para que se guarde en Firestore
    $emit("submit", businessInfo);
  } catch (error) {
    console.error(error);
  }
};
</script>
