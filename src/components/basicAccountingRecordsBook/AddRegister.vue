<template>
  <div class="w-full max-w-lg mx-auto p-6 my-6 bg-white rounded-lg shadow-lg">
    <div class="flex items-end mt-3 mb-4">
      <router-link to="/" class="ml-auto text-x">
        <Xmark class="cursor-pointer text-red-500 w-10 h-10"></Xmark>
      </router-link>
    </div>
    <div v-if="!finish">
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
              'bg-blue-500 text-white border-blue-500':
                currentStep >= index + 1,
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
      <div class="p-6">
        <div v-if="currentStep === 1">
          <IncomeOrExpense
            :selectedType="selectedType"
            @update:selectedType="selectType"
          ></IncomeOrExpense>
        </div>
        <div v-else-if="currentStep === 2">
          <CashOrBank
            :selectedAccount="selectedAccount"
            @update:selectedAccount="selectAccount"
          ></CashOrBank>
        </div>
        <div v-else-if="currentStep === 3">
          <AddIncome
            v-if="selectedType === 'income'"
            :initialItemsList="itemsList"
            @update:itemsList="handleItemsList"
          />
          <AddExpense
            v-else-if="selectedType === 'expense'"
            :initialExpense="itemsList"
            @update:itemsList="handleItemsList"
          />
        </div>
        <div v-else-if="currentStep === 4">
          <PreRegister
            :selectedType="selectedType"
            :selectedAccount="selectedAccount"
            :itemsList="itemsList"
          />
        </div>
      </div>
    </div>

    <div v-else>
      <SummaryOfRegister
        :selectedType="selectedType"
        :selectedAccount="selectedAccount"
        :itemsList="itemsList"
      ></SummaryOfRegister>
    </div>

    <!-- Navigation Buttons -->
    <div class="flex justify-between mt-6">
      <button
        @click="prevStep"
        v-if="finish === false"
        :disabled="currentStep === 1"
        class="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg disabled:opacity-50 flex items-center"
      >
        <NavArrowLeft />
        <span class="ml-2">Atrás</span>
      </button>

      <button
        @click="saveRegister"
        v-if="currentStep === steps.length && !finish"
        class="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center"
      >
        <CloudUpload />
        <span class="ml-2">Guardar</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import AddIncome from "./AddIncome.vue";
import AddExpense from "./AddExpense.vue";
import IncomeOrExpense from "./IncomeOrExpense.vue";
import PreRegister from "./PreRegister.vue";
import SummaryOfRegister from "./SummaryOfRegister.vue";
import CashOrBank from "./CashOrBank.vue";
import { NavArrowLeft, CloudUpload, BinMinusIn, Xmark } from "@iconoir/vue";
import { v4 as uuidv4 } from "uuid";

import appFirebase from "@/firebaseInit";

import { getFirestore, doc, setDoc } from "firebase/firestore";
const db = getFirestore(appFirebase);

const currentStep = ref(1);
const steps = [
  "IncomeOrExpense",
  "CashOrBank",
  "AddIncomeOrExpense",
  "Summary",
];
const selectedType = ref(null);
const selectedAccount = ref(null);
const itemsList = ref([]);
const finish = ref(false);

function nextStep() {
  if (currentStep.value < steps.length) {
    currentStep.value++;
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
}

function selectType(type) {
  selectedType.value = type;
  if (currentStep.value === 1) {
    nextStep();
  }
}

function selectAccount(account) {
  selectedAccount.value = account;
  nextStep();
}

function handleItemsList(newItemsList) {
  itemsList.value = newItemsList;
  nextStep();
}

async function saveRegister() {
  const uuid = uuidv4();
  const register = {
    uuid,
    timestamp: new Date(),
    type: selectedType.value,
    account: selectedAccount.value,
    items: itemsList.value,
  };

  const registerRef = doc(db, "libroContable", uuid);
  try {
    await setDoc(registerRef, register);
    console.log("Register successfully written!");
    finish.value = true;
  } catch (error) {
    console.error("Error writing register: ", error);
  }

  console.log("Register saved!");
}

watch(selectedType, (newVal, oldVal) => {
  if (itemsList.value.length > 0) {
    itemsList.value = [];
  }
});
</script>

<style scoped>
/* Estilos adicionales opcionales */
</style>
