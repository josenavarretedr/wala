<template>
  <div class="p-8 bg-gray-50 min-h-screen">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">
          Testing Sistema de Trazabilidad
        </h1>
        <p class="text-gray-600 mt-2">
          Verificación completa del sistema implementado
        </p>

        <!-- Estado general del sistema -->
        <div class="mt-4 p-4 rounded-lg" :class="systemStatus.className">
          <div class="flex items-center">
            <div
              class="w-3 h-3 rounded-full mr-3"
              :class="systemStatus.color"
            ></div>
            <span class="font-semibold">{{ systemStatus.text }}</span>
            <span class="ml-2 text-sm">{{ systemStatus.details }}</span>
          </div>
        </div>
      </div>

      <!-- Botones de control -->
      <div class="mb-6 flex flex-wrap gap-4">
        <button
          @click="runAllTests"
          :disabled="testRunning"
          class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {{ testRunning ? "Ejecutando..." : "Ejecutar Todas las Pruebas" }}
        </button>

        <button
          @click="clearResults"
          class="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
        >
          Limpiar Resultados
        </button>

        <button
          @click="exportResults"
          :disabled="!hasResults"
          class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          Exportar Resultados
        </button>
      </div>

      <!-- Progreso general -->
      <div v-if="testRunning || hasResults" class="mb-8">
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold text-gray-900">
              Progreso General
            </h2>
            <div class="text-sm text-gray-500">
              {{ completedTests }}/{{ totalTests }} pruebas completadas
            </div>
          </div>

          <!-- Barra de progreso -->
          <div class="w-full bg-gray-200 rounded-full h-3">
            <div
              class="h-3 rounded-full transition-all duration-500 ease-out"
              :class="overallProgress.color"
              :style="{ width: overallProgress.percentage + '%' }"
            ></div>
          </div>

          <!-- Estadísticas -->
          <div class="mt-4 grid grid-cols-4 gap-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-green-600">
                {{ testStats.passed }}
              </div>
              <div class="text-sm text-gray-500">Exitosas</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-red-600">
                {{ testStats.failed }}
              </div>
              <div class="text-sm text-gray-500">Fallidas</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-yellow-600">
                {{ testStats.warnings }}
              </div>
              <div class="text-sm text-gray-500">Advertencias</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">
                {{ testStats.coverage }}%
              </div>
              <div class="text-sm text-gray-500">Cobertura</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Resultados de pruebas -->
      <div class="space-y-6">
        <div
          v-for="(result, index) in testResults"
          :key="index"
          class="bg-white rounded-lg shadow-sm"
        >
          <!-- Header de la prueba -->
          <div
            class="p-4 border-b cursor-pointer hover:bg-gray-50"
            @click="toggleTestExpanded(index)"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <!-- Estado visual -->
                <div
                  class="w-4 h-4 rounded-full mr-3"
                  :class="getStatusColor(result.status)"
                ></div>

                <!-- Información de la prueba -->
                <div>
                  <h3 class="font-semibold text-gray-900">{{ result.name }}</h3>
                  <p class="text-sm text-gray-600">{{ result.description }}</p>
                </div>
              </div>

              <div class="flex items-center space-x-4">
                <!-- Duración -->
                <span class="text-sm text-gray-500">
                  {{ result.duration }}ms
                </span>

                <!-- Estado -->
                <span
                  class="px-3 py-1 text-xs font-medium rounded-full"
                  :class="getStatusBadgeClass(result.status)"
                >
                  {{ result.status.toUpperCase() }}
                </span>

                <!-- Icono expandir -->
                <svg
                  class="w-5 h-5 text-gray-400 transition-transform"
                  :class="{ 'rotate-180': result.expanded }"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          <!-- Detalles expandidos -->
          <div v-if="result.expanded" class="p-6 bg-gray-50">
            <!-- Pasos ejecutados -->
            <div v-if="result.steps && result.steps.length > 0" class="mb-6">
              <h4 class="font-medium text-gray-900 mb-3">Pasos ejecutados:</h4>
              <div class="space-y-2">
                <div
                  v-for="(step, stepIndex) in result.steps"
                  :key="stepIndex"
                  class="flex items-center text-sm"
                  :class="step.success ? 'text-green-700' : 'text-red-700'"
                >
                  <svg
                    class="w-4 h-4 mr-2"
                    :class="step.success ? 'text-green-500' : 'text-red-500'"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      v-if="step.success"
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                    <path
                      v-else
                      fill-rule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  {{ step.description }}
                  <span v-if="step.detail" class="ml-2 text-gray-500"
                    >- {{ step.detail }}</span
                  >
                </div>
              </div>
            </div>

            <!-- Métricas -->
            <div v-if="result.metrics" class="mb-6">
              <h4 class="font-medium text-gray-900 mb-3">Métricas:</h4>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div
                  v-for="(value, key) in result.metrics"
                  :key="key"
                  class="bg-white p-3 rounded border"
                >
                  <div class="text-sm text-gray-600">
                    {{ formatMetricKey(key) }}
                  </div>
                  <div class="text-lg font-semibold">{{ value }}</div>
                </div>
              </div>
            </div>

            <!-- Datos generados -->
            <div v-if="result.data" class="mb-6">
              <h4 class="font-medium text-gray-900 mb-3">Datos generados:</h4>
              <pre
                class="bg-white p-4 rounded border text-xs overflow-x-auto"
                >{{ JSON.stringify(result.data, null, 2) }}</pre
              >
            </div>

            <!-- Errores -->
            <div v-if="result.error" class="mb-6">
              <h4 class="font-medium text-red-900 mb-3">Error encontrado:</h4>
              <div class="bg-red-50 p-4 rounded border border-red-200">
                <p class="text-red-800 font-medium">
                  {{ result.error.message }}
                </p>
                <pre
                  v-if="result.error.stack"
                  class="mt-2 text-xs text-red-700 overflow-x-auto"
                  >{{ result.error.stack }}</pre
                >
              </div>
            </div>

            <!-- Recomendaciones -->
            <div
              v-if="result.recommendations && result.recommendations.length > 0"
            >
              <h4 class="font-medium text-gray-900 mb-3">Recomendaciones:</h4>
              <ul class="space-y-1">
                <li
                  v-for="(rec, recIndex) in result.recommendations"
                  :key="recIndex"
                  class="text-sm text-amber-700 flex items-start"
                >
                  <svg
                    class="w-4 h-4 mr-2 mt-0.5 text-amber-500 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  {{ rec }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Panel de información del sistema -->
      <div class="mt-8 bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">
          Información del Sistema
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 class="font-medium text-gray-700 mb-2">Configuración:</h3>
            <ul class="text-sm text-gray-600 space-y-1">
              <li>
                • Traceability Engine:
                {{ systemInfo.engineStatus ? "Activo" : "Inactivo" }}
              </li>
              <li>
                • Firebase:
                {{ systemInfo.firebaseStatus ? "Conectado" : "Desconectado" }}
              </li>
              <li>
                • LocalStorage Fallback:
                {{
                  systemInfo.fallbackEnabled ? "Habilitado" : "Deshabilitado"
                }}
              </li>
              <li>
                • AI Analysis:
                {{ systemInfo.aiEnabled ? "Habilitado" : "Deshabilitado" }}
              </li>
            </ul>
          </div>
          <div>
            <h3 class="font-medium text-gray-700 mb-2">Estadísticas:</h3>
            <ul class="text-sm text-gray-600 space-y-1">
              <li>• Logs totales: {{ systemInfo.totalLogs || 0 }}</li>
              <li>
                • Operaciones rastreadas:
                {{ systemInfo.trackedOperations || 0 }}
              </li>
              <li>
                • Relaciones detectadas: {{ systemInfo.detectedRelations || 0 }}
              </li>
              <li>
                • Score de trazabilidad:
                {{ systemInfo.traceabilityScore || 0 }}%
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useTraceability } from "@/composables/useTraceability";
import traceabilitySystemTest from "@/utils/traceabilitySystemTest.js";

export default {
  name: "TraceabilityTesting",
  setup() {
    // Estados reactivos
    const testResults = ref([]);
    const testRunning = ref(false);
    const currentTestIndex = ref(0);

    // Información del sistema
    const systemInfo = ref({
      engineStatus: false,
      firebaseStatus: false,
      fallbackEnabled: false,
      aiEnabled: false,
      totalLogs: 0,
      trackedOperations: 0,
      detectedRelations: 0,
      traceabilityScore: 0,
    });

    // Composables
    const { getSystemStatus, getMetrics } = useTraceability();

    // Computed properties
    const hasResults = computed(() => testResults.value.length > 0);
    const completedTests = computed(
      () => testResults.value.filter((r) => r.status !== "running").length
    );
    const totalTests = computed(() => testResults.value.length);

    const testStats = computed(() => {
      const results = testResults.value;
      return {
        passed: results.filter((r) => r.status === "passed").length,
        failed: results.filter((r) => r.status === "failed").length,
        warnings: results.filter((r) => r.status === "warning").length,
        coverage: Math.round(
          (results.filter((r) => r.status === "passed").length /
            Math.max(results.length, 1)) *
            100
        ),
      };
    });

    const overallProgress = computed(() => {
      const percentage =
        totalTests.value > 0
          ? (completedTests.value / totalTests.value) * 100
          : 0;
      let color = "bg-blue-500";

      if (percentage === 100) {
        if (testStats.value.failed === 0) {
          color = "bg-green-500";
        } else if (testStats.value.failed > testStats.value.passed) {
          color = "bg-red-500";
        } else {
          color = "bg-yellow-500";
        }
      }

      return { percentage, color };
    });

    const systemStatus = computed(() => {
      if (testRunning.value) {
        return {
          text: "Ejecutando pruebas...",
          details: `Prueba ${currentTestIndex.value + 1} de ${
            totalTests.value
          }`,
          className: "bg-blue-50 border border-blue-200",
          color: "bg-blue-500",
        };
      }

      if (!hasResults.value) {
        return {
          text: "Listo para testing",
          details: "Sistema preparado para ejecutar pruebas",
          className: "bg-gray-50 border border-gray-200",
          color: "bg-gray-500",
        };
      }

      const { passed, failed } = testStats.value;

      if (failed === 0) {
        return {
          text: "Todas las pruebas exitosas",
          details: `${passed} pruebas completadas sin errores`,
          className: "bg-green-50 border border-green-200",
          color: "bg-green-500",
        };
      }

      if (failed > passed) {
        return {
          text: "Sistema requiere atención",
          details: `${failed} pruebas fallidas de ${totalTests.value}`,
          className: "bg-red-50 border border-red-200",
          color: "bg-red-500",
        };
      }

      return {
        text: "Sistema parcialmente funcional",
        details: `${failed} pruebas fallidas, ${passed} exitosas`,
        className: "bg-yellow-50 border border-yellow-200",
        color: "bg-yellow-500",
      };
    });

    // Métodos
    const loadSystemInfo = async () => {
      try {
        const status = await getSystemStatus();
        const metrics = await getMetrics();

        systemInfo.value = {
          ...systemInfo.value,
          ...status,
          ...metrics,
        };
      } catch (error) {
        console.warn("No se pudo cargar información del sistema:", error);
      }
    };

    const runAllTests = async () => {
      testRunning.value = true;
      testResults.value = [];
      currentTestIndex.value = 0;

      try {
        console.log(
          "🧪 Iniciando testing completo del sistema de trazabilidad..."
        );

        const tests = await traceabilitySystemTest.getAllTests();

        for (let i = 0; i < tests.length; i++) {
          currentTestIndex.value = i;
          const test = tests[i];

          // Agregar resultado inicial
          const resultIndex = testResults.value.length;
          testResults.value.push({
            name: test.name,
            description: test.description,
            status: "running",
            duration: 0,
            expanded: false,
            steps: [],
            metrics: {},
            data: null,
            error: null,
            recommendations: [],
          });

          const startTime = Date.now();

          try {
            console.log(`🔄 Ejecutando: ${test.name}`);
            const result = await test.run();
            const duration = Date.now() - startTime;

            // Actualizar resultado
            testResults.value[resultIndex] = {
              ...testResults.value[resultIndex],
              status: result.success ? "passed" : "failed",
              duration,
              steps: result.steps || [],
              metrics: result.metrics || {},
              data: result.data || null,
              error: result.error || null,
              recommendations: result.recommendations || [],
            };

            if (result.success) {
              console.log(`✅ ${test.name}: Exitosa`);
            } else {
              console.log(
                `❌ ${test.name}: Fallida -`,
                result.error?.message || "Error desconocido"
              );
            }
          } catch (error) {
            const duration = Date.now() - startTime;

            testResults.value[resultIndex] = {
              ...testResults.value[resultIndex],
              status: "failed",
              duration,
              error: {
                message: error.message,
                stack: error.stack,
              },
              recommendations: [
                `Revisar implementación de ${test.name}`,
                "Verificar dependencias del sistema",
              ],
            };

            console.error(`❌ ${test.name}: Error -`, error);
          }

          // Pequeña pausa entre pruebas para que se vea el progreso
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        // Actualizar información del sistema
        await loadSystemInfo();

        console.log("🎯 Testing completado:", {
          total: testResults.value.length,
          passed: testStats.value.passed,
          failed: testStats.value.failed,
          coverage: testStats.value.coverage,
        });
      } catch (error) {
        console.error("❌ Error durante el testing:", error);
      } finally {
        testRunning.value = false;
        currentTestIndex.value = 0;
      }
    };

    const clearResults = () => {
      testResults.value = [];
      currentTestIndex.value = 0;
    };

    const toggleTestExpanded = (index) => {
      testResults.value[index].expanded = !testResults.value[index].expanded;
    };

    const exportResults = () => {
      const results = {
        timestamp: new Date().toISOString(),
        systemInfo: systemInfo.value,
        stats: testStats.value,
        results: testResults.value.map((r) => ({
          name: r.name,
          status: r.status,
          duration: r.duration,
          metrics: r.metrics,
          error: r.error?.message,
        })),
      };

      const blob = new Blob([JSON.stringify(results, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `traceability-test-results-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    // Helpers
    const getStatusColor = (status) => {
      switch (status) {
        case "passed":
          return "bg-green-500";
        case "failed":
          return "bg-red-500";
        case "warning":
          return "bg-yellow-500";
        case "running":
          return "bg-blue-500";
        default:
          return "bg-gray-300";
      }
    };

    const getStatusBadgeClass = (status) => {
      switch (status) {
        case "passed":
          return "bg-green-100 text-green-800";
        case "failed":
          return "bg-red-100 text-red-800";
        case "warning":
          return "bg-yellow-100 text-yellow-800";
        case "running":
          return "bg-blue-100 text-blue-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    };

    const formatMetricKey = (key) => {
      return key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase());
    };

    // Lifecycle
    onMounted(() => {
      loadSystemInfo();
    });

    return {
      // Estados
      testResults,
      testRunning,
      systemInfo,

      // Computed
      hasResults,
      completedTests,
      totalTests,
      testStats,
      overallProgress,
      systemStatus,

      // Métodos
      runAllTests,
      clearResults,
      toggleTestExpanded,
      exportResults,
      getStatusColor,
      getStatusBadgeClass,
      formatMetricKey,
    };
  },
};
</script>

<style scoped>
.rotate-180 {
  transform: rotate(180deg);
}
</style>
