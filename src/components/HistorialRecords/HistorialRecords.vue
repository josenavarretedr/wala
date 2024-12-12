<template>
  <div class="w-full max-w-lg mx-auto p-6 my-6 bg-white rounded-lg shadow-lg">
    <div
      class="px-4 py-2 border rounded-lg flex items-center text-xl cursor-pointer"
      @click="showResume = !showResume"
    >
      <component :is="showResume ? EyeClosed : Eye"></component>
      <span class="ml-2">{{
        showResume ? "Ocultar resumen" : "Mostrar resumen"
      }}</span>
    </div>

    <div v-if="showResume" class="px-4 py-2 mt-4 text-lg">
      <div class="flex items-center mb-2">
        <Cash class="mr-2" />
        <span>Saldo anterior: S/ 0.00</span>
      </div>
      <div class="flex items-center mb-2">
        <GraphUp class="mr-2" />
        <span>Ingresos totales: S/ 0.00</span>
      </div>
      <div class="flex items-center mb-2">
        <DatabaseExport class="mr-2" />
        <span>Egresos totales: S/ 0.00</span>
      </div>
      <div class="flex items-center">
        <Cash class="mr-2" />
        <span>Saldo actual: S/ 0.00</span>
      </div>
    </div>

    <!-- Historial -->

    <ListRecordByDay :initialDailyData="dailyData"> </ListRecordByDay>

    <!-- Navigation Buttons -->
    <div class="flex justify-between mt-6">
      <div
        class="px-4 py-2 border border-purple-600 text-purple-600 rounded-lg flex items-center text-xl"
      >
        <Safe />
        <span class="ml-2">CERRAR DIA</span>
      </div>

      <router-link
        to="/basicAccountingRecordsBook"
        class="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center text-xl"
      >
        <DatabaseScriptPlus />
        <span class="ml-2">REGISTRAR</span>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import {
  Safe,
  DatabaseScriptPlus,
  GraphUp,
  Eye,
  EyeClosed,
  DatabaseExport,
  Cash,
} from "@iconoir/vue";
import ListRecordByDay from "@/components/HistorialRecords/ListRecordByDay.vue";

import appFirebase from "@/firebaseInit";

import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
const db = getFirestore(appFirebase);

const showResume = ref(false);

const dailyData = ref([]);

async function getDayData() {
  // Obtén el inicio y el final del día actual
  const today = new Date();
  const startOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const endOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1
  );

  // Crea una consulta con las condiciones
  const q = query(
    collection(db, "libroContable"),
    where("timestamp", ">=", startOfDay),
    where("timestamp", "<", endOfDay)
  );

  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    dailyData.value.push(doc.data());
  });
}

getDayData();
</script>

<style scoped>
/* Estilos adicionales opcionales */
</style>
