<template>
  <div class="traceability-test-panel p-6 bg-white rounded-lg shadow-lg">
    <!-- Header -->
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-800 mb-2">
        🧪 Panel de Testing - Sistema de Trazabilidad
      </h2>
      <p class="text-gray-600">
        Ejecuta pruebas completas para verificar el funcionamiento del sistema
        de trazabilidad
      </p>
    </div>

    <!-- Estado del Sistema -->
    <div class="mb-6 p-4 bg-blue-50 rounded-lg">
      <h3 class="font-semibold text-blue-800 mb-2">📊 Estado del Sistema</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <span class="text-gray-600">Sesión:</span>
          <span class="block font-mono text-xs">{{ sessionId }}</span>
        </div>
        <div>
          <span class="text-gray-600">Operaciones:</span>
          <span class="block font-bold">{{
            systemMetrics.totalOperations
          }}</span>
        </div>
        <div>
          <span class="text-gray-600">Buffer:</span>
          <span class="block font-bold">{{ systemMetrics.bufferSize }}</span>
        </div>
        <div>
          <span class="text-gray-600">Estado:</span>
          <span
            class="block"
            :class="systemMetrics.isOnline ? 'text-green-600' : 'text-red-600'"
          >
            {{ systemMetrics.isOnline ? "🟢 Online" : "🔴 Offline" }}
          </span>
        </div>
      </div>
    </div>

    <!-- Controles de Testing -->
    <div class="mb-6">
      <div class="flex flex-wrap gap-3 mb-4">
        <button
          @click="runCompleteTest"
          :disabled="isRunningTests"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <span v-if="isRunningTests" class="animate-spin">⏳</span>
          <span v-else>🚀</span>
          {{ isRunningTests ? "Ejecutando..." : "Ejecutar Tests Completos" }}
        </button>

        <button
          @click="runSingleTest('test1_SystemInitialization')"
          :disabled="isRunningTests"
          class="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
        >
          Test 1: Inicialización
        </button>

        <button
          @click="runSingleTest('test2_UseTraceabilityComposable')"
          :disabled="isRunningTests"
          class="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
        >
          Test 2: Composable
        </button>

        <button
          @click="clearResults"
          class="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
        >
          🗑️ Limpiar
        </button>

        <button
          @click="refreshMetrics"
          class="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
        >
          🔄 Actualizar Métricas
        </button>
      </div>
    </div>

    <!-- Resultados de Tests -->
    <div v-if="testResults" class="mb-6">
      <div class="bg-gray-50 rounded-lg p-4">
        <h3 class="font-semibold text-gray-800 mb-3">📋 Resultados de Tests</h3>

        <!-- Resumen -->
        <div
          v-if="testSummary"
          class="mb-4 p-3 rounded-lg"
          :class="
            testSummary.success
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          "
        >
          <div class="flex items-center gap-2 mb-2">
            <span class="text-2xl">{{
              testSummary.success ? "✅" : "❌"
            }}</span>
            <span
              class="font-bold"
              :class="testSummary.success ? 'text-green-800' : 'text-red-800'"
            >
              {{
                testSummary.success
                  ? "TODOS LOS TESTS PASARON"
                  : "ALGUNOS TESTS FALLARON"
              }}
            </span>
          </div>
          <div class="text-sm text-gray-700">
            <span
              >Tests exitosos: {{ testSummary.summary?.passedTests || 0 }}/{{
                testSummary.summary?.totalTests || 0
              }}</span
            >
            <span class="ml-4"
              >Éxito: {{ testSummary.summary?.successRate || 0 }}%</span
            >
          </div>
        </div>

        <!-- Detalles de cada test -->
        <div class="space-y-3">
          <div
            v-for="(result, testName) in testResults"
            :key="testName"
            class="p-3 rounded-lg border"
            :class="
              result.success
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            "
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-lg">{{ result.success ? "✅" : "❌" }}</span>
                <span class="font-medium">{{ formatTestName(testName) }}</span>
              </div>
              <button
                @click="toggleTestDetails(testName)"
                class="text-sm text-blue-600 hover:text-blue-800"
              >
                {{
                  expandedTests.includes(testName)
                    ? "🔼 Ocultar"
                    : "🔽 Ver detalles"
                }}
              </button>
            </div>

            <!-- Detalles expandibles -->
            <div
              v-if="expandedTests.includes(testName)"
              class="mt-3 p-3 bg-white rounded border text-sm"
            >
              <pre class="whitespace-pre-wrap text-xs">{{
                JSON.stringify(result, null, 2)
              }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Log en Tiempo Real -->
    <div class="mb-6">
      <div
        class="bg-black text-green-400 rounded-lg p-4 font-mono text-sm max-h-96 overflow-y-auto"
      >
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-green-300 font-bold">🖥️ Log del Sistema</h3>
          <button
            @click="clearLog"
            class="text-xs text-gray-400 hover:text-white"
          >
            Limpiar log
          </button>
        </div>
        <div v-if="systemLog.length === 0" class="text-gray-500 italic">
          Esperando actividad del sistema...
        </div>
        <div v-for="(logEntry, index) in systemLog" :key="index" class="mb-1">
          <span class="text-gray-400">{{ logEntry.timestamp }}</span>
          <span :class="getLogColor(logEntry.level)">{{
            logEntry.message
          }}</span>
        </div>
      </div>
    </div>

    <!-- Información adicional -->
    <div class="text-sm text-gray-600">
      <p class="mb-2">
        <strong>Nota:</strong> Este panel ejecuta pruebas del sistema de
        trazabilidad sin afectar datos reales.
      </p>
      <p>
        Los tests verifican: inicialización, composables, operaciones complejas,
        stores integrados, sistema de fallback y análisis para IA.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useTraceability } from "@/composables/useTraceability";
import testModule from "@/tests/traceabilitySystemTest";

// Reactive data
const isRunningTests = ref(false);
const testResults = ref(null);
const testSummary = ref(null);
const systemMetrics = ref({});
const expandedTests = ref([]);
const systemLog = ref([]);

// System state
const { getMetrics, isTraceabilityHealthy } = useTraceability();

const sessionId = computed(() => {
  return systemMetrics.value.sessionId?.substring(0, 8) + "..." || "N/A";
});

// Methods
const refreshMetrics = () => {
  try {
    systemMetrics.value = getMetrics();
    logToSystem("info", "📊 Métricas actualizadas");
  } catch (error) {
    logToSystem("error", `❌ Error actualizando métricas: ${error.message}`);
  }
};

const runCompleteTest = async () => {
  isRunningTests.value = true;
  testResults.value = null;
  testSummary.value = null;

  logToSystem("info", "🚀 Iniciando batería completa de tests...");

  try {
    const result = await testModule.runCompleteTest();
    testResults.value = result.testResults;
    testSummary.value = result;

    logToSystem(
      result.success ? "success" : "error",
      `🏁 Tests completados: ${result.success ? "ÉXITO" : "CON ERRORES"}`
    );

    refreshMetrics();
  } catch (error) {
    logToSystem("error", `❌ Error ejecutando tests: ${error.message}`);
    testSummary.value = { success: false, error: error.message };
  } finally {
    isRunningTests.value = false;
  }
};

const runSingleTest = async (testName) => {
  if (!testModule[testName]) {
    logToSystem("error", `❌ Test ${testName} no encontrado`);
    return;
  }

  isRunningTests.value = true;
  logToSystem("info", `🧪 Ejecutando ${testName}...`);

  try {
    const result = await testModule[testName]();

    if (!testResults.value) testResults.value = {};
    testResults.value[testName] = result;

    logToSystem(
      result.success ? "success" : "error",
      `${result.success ? "✅" : "❌"} ${testName}: ${
        result.success ? "PASÓ" : "FALLÓ"
      }`
    );

    refreshMetrics();
  } catch (error) {
    logToSystem("error", `❌ Error en ${testName}: ${error.message}`);
  } finally {
    isRunningTests.value = false;
  }
};

const toggleTestDetails = (testName) => {
  const index = expandedTests.value.indexOf(testName);
  if (index > -1) {
    expandedTests.value.splice(index, 1);
  } else {
    expandedTests.value.push(testName);
  }
};

const clearResults = () => {
  testResults.value = null;
  testSummary.value = null;
  expandedTests.value = [];
  logToSystem("info", "🗑️ Resultados limpiados");
};

const clearLog = () => {
  systemLog.value = [];
};

const logToSystem = (level, message) => {
  const timestamp = new Date().toLocaleTimeString();
  systemLog.value.push({ timestamp, level, message });

  // Mantener solo los últimos 50 logs
  if (systemLog.value.length > 50) {
    systemLog.value = systemLog.value.slice(-50);
  }

  // También log a consola
  console.log(`[${timestamp}] ${message}`);
};

const getLogColor = (level) => {
  switch (level) {
    case "error":
      return "text-red-400";
    case "success":
      return "text-green-400";
    case "info":
      return "text-blue-400";
    default:
      return "text-gray-300";
  }
};

const formatTestName = (testName) => {
  const names = {
    test1_SystemInitialization: "1️⃣ Inicialización del Sistema",
    test2_UseTraceabilityComposable: "2️⃣ Composable useTraceability",
    test3_ComplexOperation: "3️⃣ Operaciones Complejas",
    test4_IntegratedStores: "4️⃣ Stores Integrados",
    test5_FallbackSystem: "5️⃣ Sistema de Fallback",
    test6_AIAnalysis: "6️⃣ Análisis para IA",
  };
  return names[testName] || testName;
};

// Lifecycle
onMounted(() => {
  refreshMetrics();
  logToSystem("info", "🚀 Panel de testing inicializado");

  // Auto-refresh metrics every 30 seconds
  setInterval(refreshMetrics, 30000);
});
</script>

<style scoped>
/* Estilos adicionales para el panel de testing */
.traceability-test-panel {
  max-width: 1200px;
}

/* Scrollbar personalizado para el log */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #1f2937;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}
</style>
