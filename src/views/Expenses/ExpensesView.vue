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
            ? 'bg-red-500 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
        ]"
      >
        {{ option.label }}
      </button>
    </div>

    <!-- Grid de widgets -->
    <div class="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-4">
      <!-- TotalExpensesWidget: 2 cols -->
      <div class="col-span-2 sm:col-span-2 order-1">
        <TotalExpensesWidget
          :transactions="filteredTransactionsExpensesNotAdjusted"
          :previousTransactions="
            filteredPreviousTransactionsExpensesNotAdjusted
          "
          :periodLabel="currentPeriodLabel"
          :isPremium="isPremium"
          :isLocked="!isPremium && selectedTimeRange !== 'today'"
          @locked-click="handleLockedClick('totalExpenses')"
          class="w-full"
        />
      </div>

      <!-- TicketsWidget: 1 col -->
      <div class="col-span-2 sm:col-span-1 order-2 sm:order-3">
        <TicketsWidget
          :transactions="filteredTransactionsExpensesNotAdjusted"
          :previousTransactions="
            filteredPreviousTransactionsExpensesNotAdjusted
          "
          :periodLabel="currentPeriodLabel"
          :isPremium="isPremium"
          :isLocked="!isPremium && selectedTimeRange !== 'today'"
          @locked-click="handleLockedClick('tickets')"
          class="w-full"
        />
      </div>

      <!-- TicketsPricePromWidget: 1 col -->
      <div class="col-span-2 sm:col-span-1 order-3 sm:order-4">
        <TicketsPricePromWidget
          :transactions="filteredTransactionsExpensesNotAdjusted"
          :previousTransactions="
            filteredPreviousTransactionsExpensesNotAdjusted
          "
          :periodLabel="currentPeriodLabel"
          :isPremium="isPremium"
          :isLocked="!isPremium && selectedTimeRange !== 'today'"
          @locked-click="handleLockedClick('avgTicket')"
          class="w-full"
        />
      </div>

      <!-- ExpensesAccountsWidget: 2 cols, 2 rows -->
      <div class="col-span-2 sm:col-span-2 sm:row-span-2 order-4 sm:order-2">
        <ExpensesAccountsWidget
          :transactions="filteredTransactionsExpensesNotAdjusted"
          title="Mix por método de pago"
          :isPremium="isPremium"
          :isLocked="!isPremium && selectedTimeRange !== 'today'"
          @locked-click="handleLockedClick('accounts')"
        />
      </div>

      <!-- ExpensesCategoryWidget: 2 cols, 2 rows -->
      <div class="col-span-2 sm:col-span-2 sm:row-span-2 order-5">
        <ExpensesCategoryWidget
          :transactions="filteredTransactionsExpensesNotAdjusted"
          :isPremium="isPremium"
          :isLocked="!isPremium && selectedTimeRange !== 'today'"
          @locked-click="handleLockedClick('category')"
        />
      </div>

      <!-- SparkLineChart: Full width -->
      <div class="col-span-2 sm:col-span-4 order-6">
        <SparkLineChart
          :transactions="filteredTransactionsExpensesNotAdjusted"
          :previousTransactions="
            filteredPreviousTransactionsExpensesNotAdjusted
          "
          type="expense"
          :isPremium="isPremium"
          :isLocked="!isPremium && selectedTimeRange !== 'today'"
          @locked-click="handleLockedClick('sparkline')"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import TotalExpensesWidget from "@/components/Expenses/TotalExpensesWidget.vue";
import TicketsWidget from "@/components/Expenses/TicketsWidget.vue";
import TicketsPricePromWidget from "@/components/Expenses/TicketsPricePromWidget.vue";
import ExpensesAccountsWidget from "@/components/Expenses/ExpensesAccountsWidget.vue";
import ExpensesCategoryWidget from "@/components/Expenses/ExpensesCategoryWidget.vue";
import SparkLineChart from "@/components/Expenses/SparkLineChart.vue";

import { ref, onMounted, watch, computed } from "vue";
import { useRoute } from "vue-router";
import { useTransaccion } from "@/composables/useTransaction";
import { useSubscription } from "@/composables/useSubscription";
import { useToast } from "@/composables/useToast";

const route = useRoute();
const { getTransactionsTodayCmps, getTransactionsRange } = useTransaccion();
const { isPremium } = useSubscription();
const { premium } = useToast();

const selectedTimeRange = ref("today");

const timeOptions = [
  { value: "today", label: "Hoy" },
  { value: "last15d", label: "Últimos 15 días" },
  { value: "last30d", label: "Últimos 30 días" },
];

const transactions = ref([]);
const previousTransactions = ref([]);

const selectTimeRange = (value) => {
  // Si no es premium y selecciona un período que no sea "today"
  if (!isPremium.value && value !== "today") {
    const periodLabels = {
      last15d: "15 días",
      last30d: "30 días",
    };
    premium(
      `Los datos de ${
        periodLabels[value] || "períodos extendidos"
      } no pueden ser analizados.`,
      {
        actionLink: {
          text: "Actualiza a Wala Premium",
          route: `/business/${route.params.businessId}/premium`,
        },
      }
    );
    // Permitir el cambio visual pero los datos estarán bloqueados
  }

  selectedTimeRange.value = value;
  console.log("Selected time range:", value);
};

// Manejar click en widgets bloqueados con mensajes contextuales
const handleLockedClick = (widgetType) => {
  const periodLabels = {
    today: "hoy",
    last15d: "últimos 15 días",
    last30d: "últimos 30 días",
  };

  const messages = {
    totalExpenses: `Análisis de gastos totales de ${
      periodLabels[selectedTimeRange.value]
    } no disponible.`,
    tickets: `Análisis de tickets de ${
      periodLabels[selectedTimeRange.value]
    } no disponible.`,
    avgTicket: `Análisis de ticket promedio de ${
      periodLabels[selectedTimeRange.value]
    } no disponible.`,
    accounts: `Desglose de métodos de pago de ${
      periodLabels[selectedTimeRange.value]
    } no disponible.`,
    category: `Desglose por categoría de ${
      periodLabels[selectedTimeRange.value]
    } no disponible.`,
    sparkline: `Gráfico de tendencias de ${
      periodLabels[selectedTimeRange.value]
    } no disponible.`,
  };

  premium(
    messages[widgetType] ||
      `Análisis de ${periodLabels[selectedTimeRange.value]} no disponible.`,
    {
      actionLink: {
        text: "Actualiza a Wala Premium",
        route: `/business/${route.params.businessId}/premium`,
      },
    }
  );
};

const filteredTransactionsExpensesNotAdjusted = computed(() => {
  return transactions.value.filter((transaction) => {
    return (
      transaction.type === "expense" && transaction.category !== "adjustment"
    );
  });
});

const filteredPreviousTransactionsExpensesNotAdjusted = computed(() => {
  return previousTransactions.value.filter((transaction) => {
    return (
      transaction.type === "expense" && transaction.category !== "adjustment"
    );
  });
});

const currentPeriodLabel = computed(() => {
  const labels = {
    today: "ayer",
    last15d: "15 días previos",
    last30d: "30 días previos",
  };
  return labels[selectedTimeRange.value] || "período anterior";
});

watch(selectedTimeRange, (newValue) => {
  fetchTransactions();
  console.log(
    "Updated filtered transactions:",
    filteredTransactionsExpensesNotAdjusted.value
  );
});

onMounted(() => {
  fetchTransactions();
});

const fetchTransactions = async () => {
  const today = new Date();
  let currentStart, currentEnd, previousStart, previousEnd;

  if (selectedTimeRange.value === "today") {
    // Período actual: hoy
    currentStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    currentEnd = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );

    // Período anterior: ayer
    previousStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - 1
    );
    previousEnd = currentStart;

    // Para "today" usamos getTransactionsTodayCmps para el período actual
    transactions.value = await getTransactionsTodayCmps();

    // Y obtenemos ayer por separado
    previousTransactions.value = await getTransactionsRange(
      previousStart,
      previousEnd
    );
  } else if (selectedTimeRange.value === "last15d") {
    // Período actual: últimos 15 días (hoy - 14 días hasta hoy)
    currentStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - 14
    );
    currentEnd = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );

    // Período anterior: 15 días previos
    previousStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - 29
    );
    previousEnd = currentStart;

    // Una consulta grande para ambos períodos
    const allTransactions = await getTransactionsRange(
      previousStart,
      currentEnd
    );

    // Separar en cliente
    transactions.value = allTransactions.filter((tx) => {
      const txDate = tx.createdAt?.toDate?.() || new Date(tx.createdAt);
      return txDate >= currentStart && txDate < currentEnd;
    });

    previousTransactions.value = allTransactions.filter((tx) => {
      const txDate = tx.createdAt?.toDate?.() || new Date(tx.createdAt);
      return txDate >= previousStart && txDate < previousEnd;
    });
  } else if (selectedTimeRange.value === "last30d") {
    // Período actual: últimos 30 días
    currentStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - 29
    );
    currentEnd = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );

    // Período anterior: 30 días previos
    previousStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - 59
    );
    previousEnd = currentStart;

    // Una consulta grande para ambos períodos
    const allTransactions = await getTransactionsRange(
      previousStart,
      currentEnd
    );

    // Separar en cliente
    transactions.value = allTransactions.filter((tx) => {
      const txDate = tx.createdAt?.toDate?.() || new Date(tx.createdAt);
      return txDate >= currentStart && txDate < currentEnd;
    });

    previousTransactions.value = allTransactions.filter((tx) => {
      const txDate = tx.createdAt?.toDate?.() || new Date(tx.createdAt);
      return txDate >= previousStart && txDate < previousEnd;
    });
  }

  console.log("Fetched transactions:", transactions.value);
  console.log("Previous transactions:", previousTransactions.value);
};
</script>
