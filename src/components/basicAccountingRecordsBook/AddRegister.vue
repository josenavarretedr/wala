<template>
  <div class="w-full max-w-lg mx-auto p-6 my-6 bg-white rounded-lg shadow-lg">
    <div class="flex items-end mt-3 mb-4">
      <router-link to="/" class="ml-auto text-x">
        <Xmark class="cursor-pointer text-red-500 w-10 h-10"></Xmark>
      </router-link>
    </div>
    DEl STORE:
    <pre>
        {{ transactionStore }}
      </pre
    >

    DEl INVENTARIO:

    <pre>
        {{ inventoryStore }}
      </pre
    >
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
                transactionStore.currentStepOfAddTransaction.value >= index + 1,
              'bg-white text-gray-500 border-gray-300':
                transactionStore.currentStepOfAddTransaction.value < index + 1,
            }"
          >
            {{ index + 1 }}
          </div>
          <div
            v-if="index < steps.length - 1"
            class="flex-1 h-0.5 transition-all duration-300"
            :class="{
              'bg-blue-500':
                transactionStore.currentStepOfAddTransaction.value > index + 1,
              'bg-gray-300':
                transactionStore.currentStepOfAddTransaction.value <= index + 1,
            }"
          ></div>
        </div>
      </div>

      <!-- Step Content -->
      <div class="p-6">
        <div v-if="transactionStore.currentStepOfAddTransaction.value === 1">
          <IncomeOrExpense></IncomeOrExpense>
        </div>
        <div
          v-else-if="transactionStore.currentStepOfAddTransaction.value === 2"
        >
          <CashOrBank></CashOrBank>
        </div>
        <div
          v-else-if="transactionStore.currentStepOfAddTransaction.value === 3"
        >
          <AddIncome
            v-if="transactionStore.transactionToAdd.value.type === 'income'"
            :initialItemsList="itemsList"
            @update:itemsList="handleItemsList"
          />
          <AddExpense
            v-else-if="
              transactionStore.transactionToAdd.value.type === 'expense'
            "
            :initialExpense="itemsList"
            @update:itemsList="handleItemsList"
          />
        </div>
        <div
          v-else-if="transactionStore.currentStepOfAddTransaction.value === 4"
        >
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
        :totalSum="totalFinal"
      ></SummaryOfRegister>
    </div>

    <!-- Navigation Buttons -->
    <div class="flex justify-between mt-6">
      <button
        @click="transactionStore.prevStepToAddTransaction()"
        v-if="finish === false"
        :disabled="transactionStore.currentStepOfAddTransaction.value === 1"
        class="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg disabled:opacity-50 flex items-center"
      >
        <NavArrowLeft />
        <span class="ml-2">Atrás</span>
      </button>

      <button
        @click="saveRegister"
        v-if="
          transactionStore.currentStepOfAddTransaction.value === steps.length &&
          !finish
        "
        class="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center"
      >
        <CloudUpload />
        <span class="ml-2">Guardar</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import AddIncome from "./AddIncome.vue";
import AddExpense from "./AddExpense.vue";
import IncomeOrExpense from "./IncomeOrExpense.vue";
import PreRegister from "./PreRegister.vue";
import SummaryOfRegister from "./SummaryOfRegister.vue";
import CashOrBank from "./CashOrBank.vue";
import { NavArrowLeft, CloudUpload, BinMinusIn, Xmark } from "@iconoir/vue";
import { v4 as uuidv4 } from "uuid";

import appFirebase from "@/firebaseInit";

import { useTransactionStore } from "@/stores/transactionStore";

const transactionStore = useTransactionStore();

import { useInventoryStore } from "@/stores/inventoryStore";
const inventoryStore = useInventoryStore();

import {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
const db = getFirestore(appFirebase);

const steps = [
  "IncomeOrExpense",
  "CashOrBank",
  "AddIncomeOrExpense",
  "Summary",
];
const selectedType = ref(null);
const selectedAccount = ref(null);
const itemsList = ref([]);
const totalFinal = ref(0);
const finish = ref(false);

function handleItemsList(newItemsList) {
  itemsList.value = newItemsList;
  nextStep();
}

async function saveRegister() {
  const uuidRegister = uuidv4();

  const total = itemsList.value.reduce((acc, item) => {
    return acc + item.quantity * item.price;
  }, 0);

  totalFinal.value = total;

  const register = {
    uuid: uuidRegister,
    timestamp: new Date(),
    type: selectedType.value,
    account: selectedAccount.value,
    total: total,
    registerStockLog: [],
  };

  for (let item of itemsList.value) {
    const itemRef = doc(db, "products", item.uuid);
    const stockLogUuid = uuidv4();
    const registerStockLog = {
      item: item.uuid,
      stockLog: stockLogUuid,
    };
    await updateDoc(itemRef, {
      stockLog: arrayUnion({
        uuid: stockLogUuid,
        date: new Date().toISOString(),
        quantity: item.quantity,
        type: "output",
      }),
    });

    register.registerStockLog.push(registerStockLog);
  }

  const registerRef = doc(db, "libroContable", uuidRegister);
  try {
    await setDoc(registerRef, register);

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
