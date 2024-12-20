<template>
  <div class="w-full max-w-lg mx-auto p-6 my-6 bg-white rounded-lg shadow-lg">
    <div class="flex items-end mt-3 mb-4">
      <router-link to="/" class="ml-auto text-x">
        <Xmark class="cursor-pointer text-red-500 w-10 h-10"></Xmark>
      </router-link>
    </div>

    <SummaryOfRegister
      :selectedType="register.type"
      :selectedAccount="register.account"
      :itemsList="register.items"
    ></SummaryOfRegister>

    <!-- ACtions Buttons -->
    <div class="flex justify-between mt-6">
      <button
        @click="saludar"
        class="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg disabled:opacity-50 flex items-center"
      >
        <Edit />
        <span class="ml-2">Edtar</span>
      </button>

      <button
        @click="deleteRegister()"
        class="px-4 py-2 bg-red-500 text-white rounded-lg flex items-center"
      >
        <Trash />
        <span class="ml-2">Eliminar</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

import SummaryOfRegister from "@/components/basicAccountingRecordsBook/SummaryOfRegister.vue";

import { Edit, Trash, Xmark } from "@iconoir/vue";

import { useRoute, useRouter } from "vue-router";

import appFirebase from "@/firebaseInit";
import { getFirestore, doc, getDoc, deleteDoc } from "firebase/firestore";
const db = getFirestore(appFirebase);

const route = useRoute();
const router = useRouter();
const register = ref(null);

const registerId = route.params.registerId;

async function getRegister() {
  const docRef = doc(db, "libroContable", registerId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    console.log("Document data:", docSnap.data());
    register.value = docSnap.data();
  } else {
    // docSnap.data() will be undefined in this case
    console.log("No such document!");
  }
}

watch(
  () => route.params.registerId,
  async () => {
    await getRegister();
  }
);

function saludar() {
  alert("Hola");
}

async function deleteRegister() {
  const docRef = doc(db, "libroContable", registerId);
  await deleteDoc(docRef);
  router.push("/");
}

await getRegister();
</script>
