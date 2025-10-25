<template>
  <div class="space-y-6 max-w-4xl mx-auto mb-20 px-4">
    <!-- Selector de período -->
    <div class="flex gap-2">
      <button
        v-for="option in timeOptions"
        :key="option.value"
        @click="selectTimeRange(option.value)"
        :class="[
          'px-3 py-1 rounded-full text-sm font-medium transition-colors',
          selectedTimeRange === option.value
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
        ]"
      >
        {{ option.label }}
      </button>
    </div>

    <!-- Grid de widgets (inspirado en MicroApps) -->
    <div class="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-4">
      <!-- TotalSalesWidget: Full width on small, 2 cols on large -->
      <div class="col-span-2 sm:col-span-2 order-1">
        <TotalSalesWidget
          :transactions="filteredTransactionsIncomeNotAdjusted"
          class="w-full"
        />
      </div>

      <!-- TicketsWidget: Full width on small, 1 col on large -->
      <div class="col-span-2 sm:col-span-1 order-2 sm:order-3">
        <TicketsWidget
          :transactions="filteredTransactionsIncomeNotAdjusted"
          class="w-full"
        />
      </div>

      <!-- TicketsPricePromWidget: Full width on small, 1 col on large -->
      <div class="col-span-2 sm:col-span-1 order-3 sm:order-4">
        <TicketsPricePromWidget
          :transactions="filteredTransactionsIncomeNotAdjusted"
          class="w-full"
        />
      </div>

      <!-- SalesAccountsWidget: Full width on small, 2 cols and 2 rows on large -->
      <div class="col-span-2 sm:col-span-2 sm:row-span-2 order-4 sm:order-2">
        <SalesAccountsWidget
          :transactions="filteredTransactionsIncomeNotAdjusted"
          title="Mix por método de pago"
        />
      </div>

      <!-- SparkLineChart: Full width -->
      <div class="col-span-2 sm:col-span-4 order-5">
        <SparkLineChart :transactions="filteredTransactionsIncomeNotAdjusted" />
      </div>
    </div>
    <TopProductsByUnits
      :transactions="filteredTransactionsIncomeNotAdjusted"
      :limit="5"
      title="Top por unidades"
      @select="(row) => goToProduct(row.key)"
    />

    <!-- Desde transacciones con items -->
    <TopProductsByRevenue
      :transactions="filteredTransactionsIncomeNotAdjusted"
      :limit="5"
      title="Top por ingreso"
      @select="(row) => goToProduct(row.key)"
    />
  </div>
</template>

<script setup>
import TotalSalesWidget from "@/components/Sales/TotalSalesWidget.vue";
import TicketsWidget from "@/components/Sales/TicketsWidget.vue";
import TicketsPricePromWidget from "@/components/Sales/TicketsPricePromWidget.vue";
import SparkLineChart from "@/components/Sales/SparkLineChart.vue";
import SalesAccountsWidget from "@/components/Sales/SalesAccountsWidget.vue";
import TopProductsByUnits from "@/components/Sales/TopProductsByUnits.vue";
import TopProductsByRevenue from "@/components/Sales/TopProductsByRevenue.vue";

import { ref, onMounted, watch, computed } from "vue";
import { useTransaccion } from "@/composables/useTransaction";

const { getTransactionsTodayCmps, getTransactionsRange } = useTransaccion();

const selectedTimeRange = ref("today");

const timeOptions = [
  { value: "today", label: "Hoy" },
  { value: "last15d", label: "Últimos 15 días" },
  { value: "last30d", label: "Últimos 30 días" },
];

const transactions = ref([]);

const selectTimeRange = (value) => {
  selectedTimeRange.value = value;
  console.log("Selected time range:", value);
};

const filteredTransactionsIncomeNotAdjusted = computed(() => {
  return transactions.value.filter((transaction) => {
    return (
      transaction.type === "income" && transaction.category !== "adjustment"
    );
  });
});

watch(selectedTimeRange, (newValue) => {
  fetchTransactions();
  console.log(
    "Updated filtered transactions:",
    filteredTransactionsIncomeNotAdjusted.value
  );
});

onMounted(() => {
  fetchTransactions();
});

const fetchTransactions = async () => {
  let startDate, endDate;

  const today = new Date();
  if (selectedTimeRange.value === "today") {
    transactions.value = await getTransactionsTodayCmps();
  } else if (selectedTimeRange.value === "last15d") {
    startDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - 15
    );
    endDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );
    transactions.value = await getTransactionsRange(startDate, endDate);
  } else if (selectedTimeRange.value === "last30d") {
    startDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - 30
    );
    endDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );
    transactions.value = await getTransactionsRange(startDate, endDate);
  }

  console.log("Fetched transactions:", transactions.value);
};
</script>
