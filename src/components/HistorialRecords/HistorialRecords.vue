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
    <ResumenDay v-if="showResume" :initialDailyData="dailyData" />

    <!-- Historial -->

    <Suspense>
      <template #default>
        <ListRecordByDay :initialDailyData="dailyData"> </ListRecordByDay>
      </template>
      <template #fallback>
        <div>Cargando ...</div>
      </template>
    </Suspense>

    <!-- ACTIONS Buttons -->
    <div class="flex justify-between mt-6">
      <div
        class="px-4 py-2 border border-purple-600 text-purple-600 rounded-lg flex items-center text-xl"
      >
        <Safe />
        <span class="ml-2">CERRAR DIA</span>
      </div>

      <router-link
        :to="{ name: 'BasicAccountingRecordsBook' }"
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
import ResumenDay from "@/components/HistorialRecords/ResumenDay.vue";

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

/**
 * Obtiene los datos del día actual desde Firestore y los almacena en `dailyData`.
 * La consulta se realiza en la colección "libroContable" y filtra los documentos
 * cuyo campo "timestamp" esté dentro del rango del día actual.
 *
 * @async
 * @function getDayData
 * @returns {Promise<void>} Una promesa que se resuelve cuando los datos se han obtenido y almacenado.
 */
async function getDayData() {
  // Obtén el inicio del día actual (00:00:00)
  const today = new Date();
  const startOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  // Obtén el final del día actual (23:59:59)
  const endOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1
  );

  // Crea una consulta para obtener los documentos de "libroContable"
  // cuyo campo "timestamp" esté entre el inicio y el final del día actual
  const q = query(
    collection(db, "libroContable"),
    where("timestamp", ">=", startOfDay),
    where("timestamp", "<", endOfDay)
  );

  // Ejecuta la consulta y almacena los resultados en `dailyData`
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
