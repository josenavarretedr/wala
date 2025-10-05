<template>
  <div class="space-y-6">
    <!-- Título mejorado -->
    <div class="text-center space-y-2">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">
        Detalles de la Transferencia
      </h1>
      <p class="text-sm text-gray-500 max-w-md mx-auto">
        Configura el origen, destino y monto de tu transferencia entre cuentas
      </p>
    </div>

    <!-- Formulario de transferencia -->
    <div class="max-w-lg mx-auto space-y-8">
      <!-- CUENTA ORIGEN -->
      <div class="space-y-4">
        <div class="text-center">
          <h3 class="text-lg font-semibold text-gray-800 mb-2">
            Cuenta Origen
          </h3>
          <p class="text-sm text-gray-500">¿Desde dónde sale el dinero?</p>
        </div>

        <!-- Select estilizado para cuenta origen -->
        <div class="relative">
          <select
            v-model="fromAccount"
            class="w-full appearance-none bg-white border-2 border-gray-200 rounded-xl px-6 py-4 pr-12 text-lg font-medium text-gray-700 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all cursor-pointer shadow-sm hover:shadow-md hover:border-green-300"
          >
            <option value="" disabled class="text-gray-400">
              Selecciona cuenta origen
            </option>
            <option value="cash" class="py-3">
              💰 Efectivo - Dinero físico
            </option>
            <option value="bank" class="py-3">
              📱 Yape/Plin - Pago digital
            </option>
          </select>
          <!-- Ícono de flecha personalizado -->
          <div
            class="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none"
          >
            <ArrowDown class="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>

      <!-- SEPARADOR CON ÍCONO DE INTERCAMBIO -->
      <div class="flex justify-center">
        <div class="relative">
          <div
            class="bg-gradient-to-r from-blue-100 to-purple-100 rounded-full p-4 shadow-sm border border-blue-200"
          >
            <RefreshDouble class="w-6 h-6 text-blue-600" />
            <!-- Animación de pulso -->
            <div
              class="absolute inset-0 bg-blue-200 rounded-full animate-ping opacity-25"
            ></div>
          </div>
        </div>
      </div>

      <!-- CUENTA DESTINO -->
      <div class="space-y-4">
        <div class="text-center">
          <h3 class="text-lg font-semibold text-gray-800 mb-2">
            Cuenta Destino
          </h3>
          <p class="text-sm text-gray-500">¿Hacia dónde va el dinero?</p>
        </div>

        <!-- Select estilizado para cuenta destino -->
        <div class="relative">
          <select
            v-model="toAccount"
            :disabled="!fromAccount"
            class="w-full appearance-none bg-white border-2 border-gray-200 rounded-xl px-6 py-4 pr-12 text-lg font-medium text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all cursor-pointer shadow-sm hover:shadow-md hover:border-purple-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200"
          >
            <option value="" disabled class="text-gray-400">
              {{
                !fromAccount
                  ? "Primero selecciona origen"
                  : "Selecciona cuenta destino"
              }}
            </option>
            <option
              value="cash"
              :disabled="fromAccount === 'cash'"
              :class="
                fromAccount === 'cash' ? 'text-gray-400 bg-gray-100' : 'py-3'
              "
            >
              💰 Efectivo - Dinero físico
              {{ fromAccount === "cash" ? " (No disponible)" : "" }}
            </option>
            <option
              value="bank"
              :disabled="fromAccount === 'bank'"
              :class="
                fromAccount === 'bank' ? 'text-gray-400 bg-gray-100' : 'py-3'
              "
            >
              📱 Yape/Plin - Pago digital
              {{ fromAccount === "bank" ? " (No disponible)" : "" }}
            </option>
          </select>
          <!-- Ícono de flecha personalizado -->
          <div
            class="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none"
          >
            <ArrowDown class="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>

      <!-- SEPARADOR -->
      <div class="flex justify-center">
        <div class="bg-orange-100 rounded-full p-4 shadow-sm">
          <Calculator class="w-6 h-6 text-orange-600" />
        </div>
      </div>

      <!-- MONTO -->
      <div class="space-y-4">
        <div class="text-center">
          <h3 class="text-lg font-semibold text-gray-800 mb-2">
            Monto a Transferir
          </h3>
          <p class="text-sm text-gray-500">Ingresa la cantidad en soles</p>
        </div>

        <div class="relative">
          <input
            v-model.number="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            :disabled="!fromAccount || !toAccount"
            class="w-full pl-16 pr-12 py-4 border-2 border-gray-200 rounded-xl text-center font-bold text-3xl text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm hover:shadow-md hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200"
          />
          <div
            class="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-2xl"
          >
            S/
          </div>
          <!-- Indicador de estado del monto -->
          <div
            v-if="amount && amount > 0"
            class="absolute right-4 top-1/2 -translate-y-1/2"
          >
            <div class="w-4 h-4 bg-green-500 rounded-full shadow-sm"></div>
          </div>
        </div>

        <!-- Indicador del monto -->
        <div v-if="amount && amount > 0" class="flex justify-center">
          <div
            class="inline-flex items-center gap-3 px-4 py-3 bg-blue-50 rounded-xl text-blue-700 border border-blue-200 shadow-sm"
          >
            <Calculator class="w-5 h-5" />
            <span class="font-semibold">S/ {{ formatAmount(amount) }}</span>
            <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
          </div>
        </div>
      </div>

      <!-- RESUMEN VISUAL DE LA TRANSFERENCIA -->
      <!-- RESUMEN VISUAL DE LA TRANSFERENCIA -->
      <!-- <div
        v-if="fromAccount && toAccount && amount && amount > 0"
        class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 shadow-sm"
      >
        <div class="text-center space-y-4">
          <div class="flex items-center justify-center gap-2">
        <div
          class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center"
        >
          <Check class="w-4 h-4 text-white" />
        </div>
        <h4 class="font-semibold text-blue-800 text-lg">
          ¡Transferencia Lista!
        </h4>
          </div>

          <div class="space-y-3">
        <div class="flex items-center justify-center gap-4">
          <div class="flex flex-col items-center gap-2">
            <div
          :class="[
            'w-12 h-12 rounded-full flex items-center justify-center shadow-sm',
            fromAccount === 'cash' ? 'bg-green-500' : 'bg-purple-500',
          ]"
            >
          <Coins
            v-if="fromAccount === 'cash'"
            class="w-6 h-6 text-white"
          />
          <SmartphoneDevice v-else class="w-6 h-6 text-white" />
            </div>
            <span class="text-xs font-medium text-gray-600">
          {{ getAccountLabel(fromAccount) }}
            </span>
          </div>

          <ArrowRight class="w-6 h-6 text-blue-600" />

          <div class="flex flex-col items-center gap-2">
            <div
          :class="[
            'w-12 h-12 rounded-full flex items-center justify-center shadow-sm',
            toAccount === 'cash' ? 'bg-green-500' : 'bg-purple-500',
          ]"
            >
          <Coins
            v-if="toAccount === 'cash'"
            class="w-6 h-6 text-white"
          />
          <SmartphoneDevice v-else class="w-6 h-6 text-white" />
            </div>
            <span class="text-xs font-medium text-gray-600">
          {{ getAccountLabel(toAccount) }}
            </span>
          </div>
        </div>

        <div class="bg-white rounded-lg p-4 border border-blue-100">
          <div class="text-3xl font-bold text-blue-900">
            S/ {{ formatAmount(amount) }}
          </div>
          <div class="text-sm text-blue-700 mt-1">Monto a transferir</div>
        </div>
          </div>
        </div>
      </div> -->

      <!-- INDICADORES DE PROGRESO PARA MÓVIL -->
      <div
        v-if="fromAccount || toAccount || (amount && amount > 0)"
        class="flex flex-wrap justify-center gap-2"
      >
        <div
          v-if="fromAccount"
          class="inline-flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full text-xs text-green-700"
        >
          <div class="w-2 h-2 bg-green-500 rounded-full"></div>
          Origen: {{ getAccountLabel(fromAccount) }}
        </div>
        <div
          v-if="toAccount"
          class="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 rounded-full text-xs text-purple-700"
        >
          <div class="w-2 h-2 bg-purple-500 rounded-full"></div>
          Destino: {{ getAccountLabel(toAccount) }}
        </div>
        <div
          v-if="amount && amount > 0"
          class="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full text-xs text-blue-700"
        >
          <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
          S/ {{ formatAmount(amount) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { useTransactionStore } from "@/stores/transaction/transactionStore";
import {
  Coins,
  SmartphoneDevice,
  ArrowRight,
  ArrowDown,
  Calculator,
  Check,
  RefreshDouble,
} from "@iconoir/vue";

const transactionStore = useTransactionStore();

// Variables reactivas locales
const fromAccount = ref("cash"); // Por defecto: Cash
const toAccount = ref("bank"); // Por defecto: Bank
const amount = ref(null);

// Configurar valores por defecto al montar el componente
onMounted(() => {
  // Establecer valores por defecto en el store
  transactionStore.setTransferFromAccount(fromAccount.value);
  transactionStore.setTransferToAccount(toAccount.value);

  // Si ya hay valores en el store, usarlos
  if (transactionStore.transactionToAdd.value?.fromAccount) {
    fromAccount.value = transactionStore.transactionToAdd.value.fromAccount;
  }
  if (transactionStore.transactionToAdd.value?.toAccount) {
    toAccount.value = transactionStore.transactionToAdd.value.toAccount;
  }
  if (transactionStore.transactionToAdd.value?.amount) {
    amount.value = transactionStore.transactionToAdd.value.amount;
  }
});

// Watchers para sincronizar con el store
watch(fromAccount, (newFromAccount) => {
  transactionStore.setTransferFromAccount(newFromAccount);
  // Si el destino es igual al origen, cambiar automáticamente
  if (newFromAccount === toAccount.value) {
    const newToAccount = newFromAccount === "cash" ? "bank" : "cash";
    toAccount.value = newToAccount;
    transactionStore.setTransferToAccount(newToAccount);
  }
});

watch(toAccount, (newToAccount) => {
  // Solo actualizar si no es la misma cuenta de origen
  if (newToAccount !== fromAccount.value) {
    transactionStore.setTransferToAccount(newToAccount);
  }
});

watch(amount, (newAmount) => {
  transactionStore.setExpenseAmount(newAmount); // Usar setExpenseAmount para amount
});

// Función para obtener etiquetas de cuentas
const getAccountLabel = (account) => {
  const labels = {
    cash: "Efectivo",
    bank: "Yape/Plin",
  };
  return labels[account] || "";
};

// Función para formatear el monto
const formatAmount = (value) => {
  if (!value) return "0.00";
  return parseFloat(value).toFixed(2);
};
</script>
