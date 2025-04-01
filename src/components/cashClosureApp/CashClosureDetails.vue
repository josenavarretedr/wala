<template>
  <div class="p-4 max-w-4xl mx-auto">
    <!-- Título -->
    <div class="flex items-center justify-center mb-6">
      <Safe class="w-8 h-8 text-purple-600 mr-2" />
      <h1 class="text-3xl font-extrabold text-purple-700">Cierre del día</h1>
    </div>

    <div v-if="cashClosure" class="space-y-6">
      <!-- Resumen general -->
      <div
        class="bg-white shadow-md rounded-lg p-6 flex items-center justify-between"
      >
        <div class="flex flex-col">
          <span class="text-sm text-gray-500">Estado</span>
          <span
            :class="statusClass(cashClosure.status)"
            class="text-xl font-bold capitalize"
          >
            {{
              cashClosure.status === "success"
                ? "Correcto"
                : cashClosure.status === "success_with_adjustments"
                ? "Con ajuste"
                : "Pendiente"
            }}
          </span>
        </div>

        <div class="flex flex-col text-center">
          <span class="text-sm text-gray-500">Fecha</span>
          <span class="text-xl font-semibold text-gray-700">
            {{ formatDate(cashClosure.date) }}
          </span>
        </div>
      </div>

      <!-- Cuentas: Efectivo y Yape/Plin -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          v-for="account in cashClosure.accounts"
          :key="account.account"
          :class="[
            'rounded-lg shadow-md p-6 border flex flex-col items-center transform hover:scale-105 transition-transform bg-white',
            account.account === 'cash'
              ? 'text-green-500 border-green-500'
              : 'text-purple-500  border-purple-500 ',
          ]"
        >
          <component
            :is="account.account === 'cash' ? Coins : SmartphoneDevice"
            class="w-12 h-12 mb-4"
          />
          <h3 class="text-2xl font-bold capitalize mb-2">
            {{ account.account === "cash" ? "Efectivo" : "Yape / Plin" }}
          </h3>
          <div class="text-lg">
            <p>
              Esperado:
              <span class="font-bold">S/. {{ account.expectedBalance }}</span>
            </p>
            <p>
              Real:
              <span class="font-bold">
                {{
                  account.realBalance !== null
                    ? `S/. ${account.realBalance}`
                    : "No registrado"
                }}
              </span>
            </p>
            <p>
              Diferencia:
              <span class="font-bold">S/. {{ account.difference }}</span>
            </p>
          </div>
        </div>
      </div>

      <!-- Notas si existen -->
      <div
        v-if="cashClosure.notes"
        class="bg-white shadow-sm p-4 rounded-lg border border-gray-200"
      >
        <p class="text-gray-500 text-sm mb-2 font-semibold">Notas:</p>
        <p class="text-gray-700 text-base">{{ cashClosure.notes }}</p>
      </div>
    </div>

    <!-- Si no hay información -->
    <div v-else class="text-center text-gray-500 mt-10">
      No se encontró el cierre de caja.
    </div>
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";
import { useCashClosure } from "@/composables/useCashClosure";
import { Coins, SmartphoneDevice, Safe } from "@iconoir/vue";

const route = useRoute();
const cashClosureId = route.params.cashClosureId;
const { getCashClosureById } = useCashClosure();

const cashClosure = await getCashClosureById(cashClosureId);

const formatDate = (date) => {
  if (!date) return "";
  const d = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
  return d.toLocaleString("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const statusClass = (status) => {
  if (status === "success") return "text-green-400";
  if (status === "success_with_adjustments") return "text-yellow-200";
  return "text-white";
};
</script>
