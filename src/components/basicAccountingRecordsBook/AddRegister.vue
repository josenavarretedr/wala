<template>
  <div class="w-full max-w-lg mx-auto">
    <h1 class="text-2xl font-semibold mb-4">Agregar Registro</h1>
    <!-- Stepper -->
    <div class="flex items-center justify-between mb-8">
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
    </div>

    <!-- Step Content -->
    <div class="p-6 border rounded-lg shadow-md bg-white">
      <h2 class="text-xl font-semibold mb-4">Paso {{ currentStep }}</h2>
      <div v-if="currentStep === 1">
        <button
          @click="selectType('Ingreso')"
          class="px-4 py-2 bg-blue-500 text-white rounded-lg mr-2"
        >
          Ingreso
        </button>
        <button
          @click="selectType('Egreso')"
          class="px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Egreso
        </button>
      </div>
      <div v-else-if="currentStep === 2">
        <button
          @click="selectAccount('Caja/Efectivo')"
          class="px-4 py-2 bg-blue-500 text-white rounded-lg mr-2"
        >
          Caja/Efectivo
        </button>
        <button
          @click="selectAccount('Bancos')"
          class="px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Bancos
        </button>
      </div>
      <div v-else-if="currentStep === 3">
        <component :is="selectedComponent"></component>
      </div>
    </div>

    <!-- Navigation Buttons -->
    <div class="flex justify-between mt-6">
      <button
        @click="prevStep"
        :disabled="currentStep === 1"
        class="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg disabled:opacity-50"
      >
        Anterior
      </button>
      <button
        @click="nextStep"
        :disabled="currentStep === steps.length || !selectedType"
        class="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
      >
        Siguiente
      </button>
    </div>
  </div>
</template>

<script>
import AddIncome from "./AddIncome.vue";
import AddExpenses from "./AddExpense.vue";

export default {
  data() {
    return {
      currentStep: 1,
      steps: [
        { content: "Seleccione el tipo de registro (Ingreso o Egreso)." },
        { content: "Seleccione la cuenta afectada (Caja/Efectivo o Bancos)." },
        { content: "Complete los detalles del registro." },
      ],
      selectedType: null,
      selectedAccount: null,
    };
  },
  computed: {
    selectedComponent() {
      if (this.selectedType === "Ingreso") {
        return AddIncome;
      } else if (this.selectedType === "Egreso") {
        return AddExpenses;
      }
      return null;
    },
  },
  methods: {
    nextStep() {
      if (this.currentStep < this.steps.length) {
        this.currentStep++;
      }
    },
    prevStep() {
      if (this.currentStep > 1) {
        this.currentStep--;
      }
    },
    selectType(type) {
      this.selectedType = type;
      this.nextStep();
    },
    selectAccount(account) {
      this.selectedAccount = account;
      this.nextStep();
    },
  },
};
</script>

<style scoped>
/* Estilos adicionales opcionales */
</style>
