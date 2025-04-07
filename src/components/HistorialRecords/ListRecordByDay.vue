<template>
  <div class="w-full max-w-3xl mt-6">
    <h3 class="text-xl font-bold text-gray-700 mb-4">Registros diarios</h3>

    <div class="space-y-4">
      <template v-if="transactionStore.transactionsInStore.value.length">
        <component
          v-for="(record, index) in dataOrdenada"
          :is="getRecordComponent(record.type)"
          :key="record.uuid || index"
          :record="record"
        />
      </template>

      <template v-else>
        <div
          class="bg-white shadow-md rounded-lg p-4 flex items-center justify-center"
        >
          <p class="text-lg font-semibold text-gray-800">
            No tienes registros... todavía.
          </p>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useTransactionStore } from "@/stores/transactionStore";
import CardClosure from "@/components/HistorialRecords/CardClosure.vue";
import CardOpening from "@/components/HistorialRecords/CardOpening.vue";
import CardTransfer from "@/components/HistorialRecords/CardTransfer.vue";
import CardStandard from "@/components/HistorialRecords/CardStandard.vue";

const transactionStore = useTransactionStore();

const dataOrdenada = computed(() => {
  const all = transactionStore.transactionsInStore.value;

  const closure = all.find((tx) => tx.type === "closure");
  const opening = all.find((tx) => tx.type === "opening");

  const middle = all
    .filter((tx) => tx.type !== "closure" && tx.type !== "opening")
    .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);

  const result = [];

  if (closure) result.push(closure);
  result.push(...middle);
  if (opening) result.push(opening);

  return result;
});

/**
 * Mapea el tipo de transacción con el componente a renderizar
 */
function getRecordComponent(type) {
  switch (type) {
    case "closure":
      return CardClosure;
    case "opening":
      return CardOpening;
    case "transfer":
      return CardTransfer;
    default:
      return CardStandard; // income, expense, adjustment, etc.
  }
}

await transactionStore.getTransactionsToday();
</script>
