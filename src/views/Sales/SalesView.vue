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
          :previousTransactions="filteredPreviousTransactionsIncomeNotAdjusted"
          :periodLabel="currentPeriodLabel"
          :isPremium="isPremium"
          :isLocked="!isPremium && selectedTimeRange !== 'today'"
          @locked-click="handleLockedClick('totalSales')"
          class="w-full"
        />
      </div>

      <!-- TicketsWidget: Full width on small, 1 col on large -->
      <div class="col-span-2 sm:col-span-1 order-2 sm:order-3">
        <TicketsWidget
          :transactions="filteredTransactionsIncomeNotAdjusted"
          :previousTransactions="filteredPreviousTransactionsIncomeNotAdjusted"
          :periodLabel="currentPeriodLabel"
          :isPremium="isPremium"
          :isLocked="!isPremium && selectedTimeRange !== 'today'"
          @locked-click="handleLockedClick('tickets')"
          class="w-full"
        />
      </div>

      <!-- TicketsPricePromWidget: Full width on small, 1 col on large -->
      <div class="col-span-2 sm:col-span-1 order-3 sm:order-4">
        <TicketsPricePromWidget
          :transactions="filteredTransactionsIncomeNotAdjusted"
          :previousTransactions="filteredPreviousTransactionsIncomeNotAdjusted"
          :periodLabel="currentPeriodLabel"
          :isPremium="isPremium"
          :isLocked="!isPremium && selectedTimeRange !== 'today'"
          @locked-click="handleLockedClick('avgTicket')"
          class="w-full"
        />
      </div>

      <!-- SalesAccountsWidget: Full width on small, 2 cols and 2 rows on large -->
      <div class="col-span-2 sm:col-span-2 sm:row-span-2 order-4 sm:order-2">
        <SalesAccountsWidget
          :transactions="filteredTransactionsIncomeNotAdjusted"
          title="Mix por método de pago"
          :isPremium="isPremium"
          :isLocked="!isPremium && selectedTimeRange !== 'today'"
          @locked-click="handleLockedClick('accounts')"
        />
      </div>

      <!-- SparkLineChart: Full width -->
      <div class="col-span-2 sm:col-span-4 order-5">
        <SparkLineChart
          :transactions="filteredTransactionsIncomeNotAdjusted"
          :previousTransactions="filteredPreviousTransactionsIncomeNotAdjusted"
          type="income"
          :isPremium="isPremium"
          :isLocked="!isPremium && selectedTimeRange !== 'today'"
          @locked-click="handleLockedClick('sparkline')"
        />
      </div>
    </div>
    <TopProductsByUnits
      :transactions="filteredTransactionsIncomeNotAdjusted"
      :limit="5"
      title="Top por unidades"
      :isPremium="isPremium"
      :isLocked="!isPremium && selectedTimeRange !== 'today'"
      @locked-click="handleLockedClick('topUnits')"
      @select="(row) => goToProduct(row.key)"
    />

    <!-- Desde transacciones con items -->
    <TopProductsByRevenue
      :transactions="filteredTransactionsIncomeNotAdjusted"
      :limit="5"
      title="Top por ingreso"
      :isPremium="isPremium"
      :isLocked="!isPremium && selectedTimeRange !== 'today'"
      @locked-click="handleLockedClick('topRevenue')"
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
import { useRoute } from "vue-router";

import { ref, onMounted, watch, computed } from "vue";
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
      },
    );
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
    totalSales: `Análisis de ventas totales de ${
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
    sparkline: `Gráfico de tendencias de ${
      periodLabels[selectedTimeRange.value]
    } no disponible.`,
    topUnits: `Top productos por unidades de ${
      periodLabels[selectedTimeRange.value]
    } no disponible.`,
    topRevenue: `Top productos por ingreso de ${
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
    },
  );
};

const filteredTransactionsIncomeNotAdjusted = computed(() => {
  return transactions.value.filter((transaction) => {
    return (
      transaction.type === "income" && transaction.category !== "adjustment"
    );
  });
});

const filteredPreviousTransactionsIncomeNotAdjusted = computed(() => {
  return previousTransactions.value.filter((transaction) => {
    return (
      transaction.type === "income" && transaction.category !== "adjustment"
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
    filteredTransactionsIncomeNotAdjusted.value,
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
      today.getDate(),
    );
    currentEnd = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1,
    );

    // Período anterior: ayer
    previousStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - 1,
    );
    previousEnd = currentStart;

    // Para "today" usamos getTransactionsTodayCmps para el período actual
    transactions.value = await getTransactionsTodayCmps();

    // Y obtenemos ayer por separado
    previousTransactions.value = await getTransactionsRange(
      previousStart,
      previousEnd,
    );
  } else if (selectedTimeRange.value === "last15d") {
    // Período actual: últimos 15 días (hoy - 14 días hasta hoy)
    currentStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - 14,
    );
    currentEnd = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1,
    );

    // Período anterior: 15 días previos
    previousStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - 29,
    );
    previousEnd = currentStart;

    // Una consulta grande para ambos períodos
    const allTransactions = await getTransactionsRange(
      previousStart,
      currentEnd,
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
      today.getDate() - 29,
    );
    currentEnd = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1,
    );

    // Período anterior: 30 días previos
    previousStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - 59,
    );
    previousEnd = currentStart;

    // Una consulta grande para ambos períodos
    const allTransactions = await getTransactionsRange(
      previousStart,
      currentEnd,
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

const goToProduct = (productId) => {
  console.log("Navigate to product:", productId);
  // TODO: Implementar navegación al detalle del producto
  // router.push({ name: 'ProductDetail', params: { productId } });
};
</script>
