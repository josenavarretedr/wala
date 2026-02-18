<template>
  <div
    class="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-12 px-4"
  >
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          🎬 Sistema de Gestión de Guiones
        </h1>
        <p class="text-lg text-gray-600">
          Crea y gestiona guiones de video para redes sociales con IA
        </p>
      </div>

      <!-- Dos botones principales -->
      <div class="grid md:grid-cols-2 gap-6">
        <!-- Botón Crear -->
        <button
          @click="goToCrear"
          class="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border-2 border-purple-100 hover:border-purple-300"
        >
          <div
            class="absolute inset-0 bg-gradient-to-br from-purple-500 to-indigo-600 opacity-0 group-hover:opacity-10 transition-opacity"
          ></div>

          <div class="relative">
            <div class="text-6xl mb-4">✨</div>
            <h2 class="text-2xl font-bold text-gray-900 mb-2">Crear Guiones</h2>
            <p class="text-gray-600 mb-4">
              Genera guiones estructurados con inteligencia artificial
            </p>
            <div
              class="flex items-center justify-center text-purple-600 font-medium"
            >
              <span>Empezar</span>
              <svg
                class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                ></path>
              </svg>
            </div>
          </div>
        </button>

        <!-- Botón Dashboard -->
        <button
          @click="goToDashboard"
          class="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border-2 border-blue-100 hover:border-blue-300"
        >
          <div
            class="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-600 opacity-0 group-hover:opacity-10 transition-opacity"
          ></div>

          <div class="relative">
            <div class="text-6xl mb-4">📊</div>
            <h2 class="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
            <p class="text-gray-600 mb-4">
              Gestiona y organiza todos tus guiones creados
            </p>
            <div
              class="flex items-center justify-center text-blue-600 font-medium"
            >
              <span>Ver guiones</span>
              <svg
                class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                ></path>
              </svg>
            </div>
          </div>
        </button>
      </div>

      <!-- Botón Migrar JSONs (Solo visible si hay 0 videos) -->
      <div v-if="stats && stats.total === 0" class="mt-6">
        <button
          @click="showMigrationModal = true"
          class="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 flex items-center justify-center gap-3"
        >
          <span class="text-2xl">📦</span>
          <div class="text-left">
            <div class="font-bold">Migrar Guiones desde JSON</div>
            <div class="text-sm opacity-90">
              Importa guiones existentes a Firestore
            </div>
          </div>
        </button>
      </div>

      <!-- Stats rápidas -->
      <div v-if="stats" class="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div class="text-2xl font-bold text-purple-600">
            {{ stats.total }}
          </div>
          <div class="text-sm text-gray-600">Total Videos</div>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div class="text-2xl font-bold text-green-600">
            {{ stats.publicados }}
          </div>
          <div class="text-sm text-gray-600">Publicados</div>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div class="text-2xl font-bold text-yellow-600">
            {{ stats.editando }}
          </div>
          <div class="text-sm text-gray-600">En Edición</div>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div class="text-2xl font-bold text-blue-600">
            {{ stats.grabando }}
          </div>
          <div class="text-sm text-gray-600">Grabando</div>
        </div>
      </div>

      <!-- Modal de Migración -->
      <Teleport to="body">
        <div
          v-if="showMigrationModal"
          class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          @click.self="closeMigrationModal"
        >
          <div
            class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
          >
            <!-- Header -->
            <div
              class="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6"
            >
              <h2 class="text-2xl font-bold flex items-center gap-3">
                <span>📦</span>
                <span>Migración de Guiones</span>
              </h2>
              <p class="text-sm opacity-90 mt-2">
                Importar guiones desde archivos JSON a Firestore
              </p>
            </div>

            <!-- Contenido -->
            <div class="p-6">
              <!-- Progreso -->
              <div v-if="migracion.migrating.value" class="space-y-4">
                <div class="flex items-center gap-3">
                  <div
                    class="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"
                  ></div>
                  <div>
                    <div class="font-medium">Migrando...</div>
                    <div class="text-sm text-gray-600">
                      {{ migracion.progress.value.current }} /
                      {{ migracion.progress.value.total }} archivos
                    </div>
                  </div>
                </div>

                <div
                  v-if="migracion.progress.value.currentFile"
                  class="text-sm text-gray-600"
                >
                  Procesando:
                  <span class="font-medium">{{
                    migracion.progress.value.currentFile
                  }}</span>
                </div>

                <!-- Logs -->
                <div
                  class="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-sm max-h-64 overflow-y-auto"
                >
                  <div
                    v-for="(log, idx) in migracion.progress.value.logs"
                    :key="idx"
                  >
                    {{ log }}
                  </div>
                </div>
              </div>

              <!-- Estado inicial -->
              <div v-else-if="!migrationCompleted" class="space-y-4">
                <div
                  class="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
                >
                  <div class="flex items-start gap-3">
                    <span class="text-2xl">⚠️</span>
                    <div class="flex-1">
                      <div class="font-medium text-yellow-900">
                        ¿Qué hace esta migración?
                      </div>
                      <ul
                        class="text-sm text-yellow-800 mt-2 space-y-1 list-disc list-inside"
                      >
                        <li>Lee archivos JSON desde /src/assets/guiones/</li>
                        <li>Valida la estructura de cada archivo</li>
                        <li>
                          Guarda cada video en Firestore
                          (marketing/guiones/videos/)
                        </li>
                        <li>Genera un reporte detallado del proceso</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div class="text-sm text-gray-600">
                  <strong>Archivos que se migrarán:</strong>
                  <ul class="mt-2 space-y-1">
                    <li>• ordenRegistro.json</li>
                    <li>• guiones_flujo_caja.json</li>
                    <li>• comprasRegistros.json</li>
                  </ul>
                </div>
              </div>

              <!-- Estado completado -->
              <div v-else class="text-center py-8">
                <div class="text-6xl mb-4">🎉</div>
                <div class="text-2xl font-bold text-gray-900 mb-2">
                  ¡Migración Completada!
                </div>
                <div class="text-gray-600">
                  Los guiones se guardaron exitosamente en Firestore
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="border-t border-gray-200 p-6 flex gap-3">
              <button
                v-if="!migracion.migrating.value && !migrationCompleted"
                @click="closeMigrationModal"
                class="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
              >
                Cancelar
              </button>
              <button
                v-if="!migracion.migrating.value && !migrationCompleted"
                @click="ejecutarMigracion"
                class="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:shadow-lg font-medium"
              >
                Iniciar Migración
              </button>
              <button
                v-if="migrationCompleted"
                @click="finalizarMigracion"
                class="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
              >
                Ir al Dashboard
              </button>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useGuionesStore } from "@/stores/guionesStore";
import { useMigracionGuiones } from "@/composables/useMigracionGuiones";
import { useToast } from "@/composables/useToast";

const router = useRouter();
const guionesStore = useGuionesStore();
const migracion = useMigracionGuiones();
const toast = useToast();

const stats = ref(null);
const showMigrationModal = ref(false);
const migrationCompleted = ref(false);

const goToCrear = () => {
  router.push("/guiones/crear");
};

const goToDashboard = () => {
  router.push("/guiones/dashboard");
};

const closeMigrationModal = () => {
  if (!migracion.migrating.value) {
    showMigrationModal.value = false;
    migrationCompleted.value = false;
    migracion.reset();
  }
};

const ejecutarMigracion = async () => {
  try {
    await migracion.migrar();
    migrationCompleted.value = true;
    toast.success("Migración completada exitosamente");
  } catch (error) {
    toast.error("Error en la migración: " + error.message);
  }
};

const finalizarMigracion = async () => {
  // Recargar stats
  await loadStats();
  closeMigrationModal();
  router.push("/guiones/dashboard");
};

const loadStats = async () => {
  try {
    await guionesStore.loadVideos();

    stats.value = {
      total: guionesStore.videos.length,
      publicados: guionesStore.videosPorEstado.publicado,
      editando: guionesStore.videosPorEstado.editando,
      grabando: guionesStore.videosPorEstado.grabando,
    };
  } catch (error) {
    console.error("Error al cargar stats:", error);
  }
};

onMounted(async () => {
  await loadStats();
});
</script>
