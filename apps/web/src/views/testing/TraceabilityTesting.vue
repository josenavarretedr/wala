<template>
  <div class="testing-page min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4">
      <!-- Header de la página -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-800 mb-4">
          🧪 Testing del Sistema de Trazabilidad
        </h1>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          Panel completo para probar y verificar el funcionamiento del sistema
          de trazabilidad implementado. Ejecuta pruebas automáticas y verifica
          métricas en tiempo real.
        </p>
      </div>

      <!-- Panel principal de testing -->
      <div class="max-w-6xl mx-auto">
        <TraceabilityTestPanel />
      </div>

      <!-- Información adicional -->
      <div class="mt-12 max-w-4xl mx-auto">
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-2xl font-bold text-gray-800 mb-4">
            📖 Información sobre los Tests
          </h2>

          <div class="grid md:grid-cols-2 gap-6">
            <div>
              <h3 class="font-semibold text-lg text-blue-800 mb-3">
                🔍 Tests Implementados
              </h3>
              <ul class="space-y-2 text-sm text-gray-700">
                <li class="flex items-start gap-2">
                  <span class="text-blue-600 font-bold">1️⃣</span>
                  <span
                    ><strong>Inicialización:</strong> Verifica que el motor de
                    trazabilidad y authContext estén funcionando</span
                  >
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-blue-600 font-bold">2️⃣</span>
                  <span
                    ><strong>Composable:</strong> Prueba todos los métodos del
                    composable useTraceability</span
                  >
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-blue-600 font-bold">3️⃣</span>
                  <span
                    ><strong>Operaciones Complejas:</strong> Cadenas de
                    operaciones y transacciones multi-entidad</span
                  >
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-blue-600 font-bold">4️⃣</span>
                  <span
                    ><strong>Stores Integrados:</strong> Verifica que los stores
                    tengan trazabilidad integrada</span
                  >
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-blue-600 font-bold">5️⃣</span>
                  <span
                    ><strong>Sistema de Fallback:</strong> Prueba localStorage y
                    recuperación de errores</span
                  >
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-blue-600 font-bold">6️⃣</span>
                  <span
                    ><strong>Análisis IA:</strong> Verifica generación de datos
                    estructurados para IA</span
                  >
                </li>
              </ul>
            </div>

            <div>
              <h3 class="font-semibold text-lg text-green-800 mb-3">
                ✅ Qué se Verifica
              </h3>
              <ul class="space-y-2 text-sm text-gray-700">
                <li class="flex items-start gap-2">
                  <span class="text-green-600">✓</span>
                  <span>Generación de traceIds únicos</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-green-600">✓</span>
                  <span>Detección automática de relaciones</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-green-600">✓</span>
                  <span>Estados anteriores y nuevos capturados</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-green-600">✓</span>
                  <span>Contexto de usuario y sesión</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-green-600">✓</span>
                  <span>Sistema de buffering y batching</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-green-600">✓</span>
                  <span>Fallback a localStorage</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-green-600">✓</span>
                  <span>Datos estructurados para IA</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-green-600">✓</span>
                  <span>Métricas del sistema en tiempo real</span>
                </li>
              </ul>
            </div>
          </div>

          <div
            class="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
          >
            <h4 class="font-semibold text-yellow-800 mb-2">
              ⚠️ Notas Importantes
            </h4>
            <ul class="text-sm text-yellow-700 space-y-1">
              <li>• Los tests no afectan datos reales de la aplicación</li>
              <li>
                • Algunos tests pueden fallar si no hay conexión a Firebase (se
                usa fallback)
              </li>
              <li>
                • El sistema guarda automáticamente en localStorage como backup
              </li>
              <li>
                • Las métricas se actualizan automáticamente cada 30 segundos
              </li>
              <li>
                • Todos los logs aparecen también en la consola del navegador
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Métricas del sistema -->
      <div class="mt-8 max-w-4xl mx-auto">
        <div
          class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 text-white"
        >
          <h2 class="text-2xl font-bold mb-4">
            📊 Estado del Sistema en Tiempo Real
          </h2>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="text-center">
              <div class="text-3xl font-bold">
                {{ realTimeMetrics.totalOperations || 0 }}
              </div>
              <div class="text-sm opacity-80">Operaciones Totales</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold">
                {{ realTimeMetrics.successfulOperations || 0 }}
              </div>
              <div class="text-sm opacity-80">Exitosas</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold">
                {{ realTimeMetrics.bufferSize || 0 }}
              </div>
              <div class="text-sm opacity-80">En Buffer</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold">
                {{ realTimeMetrics.isOnline ? "🟢" : "🔴" }}
              </div>
              <div class="text-sm opacity-80">
                {{ realTimeMetrics.isOnline ? "Online" : "Offline" }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import TraceabilityTestPanel from "@/components/testing/TraceabilityTestPanel.vue";
import { useTraceability } from "@/composables/useTraceability";

// Reactive data
const realTimeMetrics = ref({});

// Methods
const { getMetrics } = useTraceability();

const updateRealTimeMetrics = () => {
  try {
    realTimeMetrics.value = getMetrics();
  } catch (error) {
    console.error("Error updating real-time metrics:", error);
  }
};

// Auto-update metrics
let metricsInterval = null;

// Lifecycle
onMounted(() => {
  updateRealTimeMetrics();

  // Update metrics every 5 seconds for real-time display
  metricsInterval = setInterval(updateRealTimeMetrics, 5000);

  console.log("🧪 Testing page initialized");
});

onUnmounted(() => {
  if (metricsInterval) {
    clearInterval(metricsInterval);
  }
});
</script>

<style scoped>
.testing-page {
  min-height: 100vh;
}

.container {
  max-width: 1400px;
}
</style>
