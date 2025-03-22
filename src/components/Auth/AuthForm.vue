<template>
  <div class="w-full max-w-lg mx-auto p-6 my-6 bg-white rounded-lg shadow-lg">
    <!-- Stepper -->
    <!-- <div class="flex items-center justify-between mb-8">
      <div
        v-for="(step, index) in steps"
        :key="index"
        class="flex items-center"
      >
        <div
          class="flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors duration-300"
          :class="{
            'bg-blue-500 text-white border-blue-500': currentStep >= index + 1,
            'bg-white text-gray-500 border-gray-300': currentStep < index + 1,
          }"
        >
          {{ index + 1 }}
        </div>
        <div
          v-if="index < steps.length - 1"
          class="flex-1 h-0.5 transition-all duration-300"
          :class="{
            'bg-blue-500': currentStep > index + 1,
            'bg-gray-300': currentStep <= index + 1,
          }"
        ></div>
      </div>
    </div> -->

    <!-- Step Content -->
    <div class="p-6">
      <Step1Auth v-if="currentStep === 1" @next="nextStep" />
      <!-- <Step2BusinessInfo v-if="currentStep === 2" @submit="submitForm" /> -->
    </div>

    <!-- Navigation Buttons -->
    <div class="flex justify-between mt-6">
      <button
        @click="prevStep"
        v-if="currentStep > 1"
        class="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg"
      >
        Atrás
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import Step1Auth from "./Step1Auth.vue";
import Step2BusinessInfo from "./Step2BusinessInfo.vue";
import { useAuthStore } from "@/stores/authStore";

const currentStep = ref(1);
const authStore = useAuthStore();

const steps = [1, 2];

const nextStep = () => {
  currentStep.value++;
};

const prevStep = () => {
  currentStep.value--;
};

const submitForm = async (businessInfo) => {
  // Guardar el negocio en Firestore
  await authStore.saveBusinessInfo(businessInfo);
  // Redirigir al dashboard
  this.$router.push("/dashboard");
};
</script>
