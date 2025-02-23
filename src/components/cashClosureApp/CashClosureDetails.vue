<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold text-center mb-6">
      Detalle de Cierre de Caja
    </h1>

    <!-- Se muestra el contenido cuando se ha cargado el cierre -->
    <div v-if="cashClosure" class="space-y-6">
      <!-- Tarjeta de información general -->
      <div
        class="bg-white rounded-lg shadow-lg p-6 transform hover:scale-105 transition-transform"
      >
        <h2 class="text-xl font-semibold mb-2">
          Fecha del cierre:
          <span class="font-normal">{{ formatDate(cashClosure.date) }}</span>
        </h2>
        <p class="mb-2">
          Estado:
          <span :class="statusClass(cashClosure.status)">
            {{ cashClosure.status }}
          </span>
        </p>
        <p>
          Notas:
          <span class="font-normal">
            {{ cashClosure.notes || "Sin notas" }}
          </span>
        </p>
      </div>

      <!-- Detalle por cuenta (efectivo, banco, etc.) -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="account in cashClosure.accounts"
          :key="account.account"
          class="bg-white rounded-lg shadow-lg p-4 transform hover:scale-105 transition-transform"
        >
          <h3 class="text-lg font-bold mb-3 capitalize">
            {{ account.account }}
          </h3>
          <p class="mb-1">
            Balance esperado:
            <span class="font-semibold">S/. {{ account.expectedBalance }}</span>
          </p>
          <p class="mb-1">
            Balance real:
            <span class="font-semibold">
              S/.
              {{
                account.realBalance !== null
                  ? account.realBalance
                  : "No registrado"
              }}
            </span>
          </p>
          <p class="mb-1">
            Diferencia:
            <span class="font-semibold">S/. {{ account.difference }}</span>
          </p>
          <p v-if="account.adjustmentTransactionUuid" class="mb-1">
            Ajuste:
            <span class="font-semibold">{{
              account.adjustmentTransactionUuid
            }}</span>
          </p>
        </div>
      </div>
    </div>

    <!-- Si no se encuentra información -->
    <div v-else class="text-center text-gray-500">
      No se encontró el cierre de caja.
    </div>
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";
import { useCashClosure } from "@/composables/useCashClosure";

// Extrae el parámetro "cashClosureId" del router
const route = useRoute();
const cashClosureId = route.params.cashClosureId;

// Utiliza el composable para obtener el cierre de caja por ID
const { getCashClosureById } = useCashClosure();

// Gracias al top-level await, el componente esperará a que se resuelva la promesa
const cashClosure = await getCashClosureById(cashClosureId);

// Función para formatear la fecha (considera que puede venir como timestamp de Firestore)
const formatDate = (date) => {
  if (!date) return "";
  const d = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
  return d.toLocaleString();
};

// Función que retorna clases CSS según el estado del cierre
const statusClass = (status) => {
  if (status === "success") {
    return "text-green-600 font-bold";
  } else if (status === "success_with_adjustments") {
    return "text-yellow-600 font-bold";
  }
  return "text-gray-600";
};
</script>

<style scoped>
/* Puedes agregar estilos adicionales si es necesario */
</style>
