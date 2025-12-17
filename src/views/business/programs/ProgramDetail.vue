<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="text-center">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
        ></div>
        <p class="text-sm text-gray-500">Cargando programa...</p>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="bg-red-50 border border-red-200 rounded-lg p-6"
    >
      <div class="flex items-start">
        <svg
          class="w-6 h-6 text-red-400 mr-3 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <h3 class="text-sm font-medium text-red-800">
            Error al cargar el programa
          </h3>
          <p class="mt-1 text-sm text-red-700">{{ error }}</p>
          <button
            @click="goBack"
            class="mt-4 inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700"
          >
            Volver a programas
          </button>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div v-else-if="currentProgram">
      <!-- Header con breadcrumb -->
      <div class="mb-6">
        <nav class="flex items-center text-sm text-gray-500 mb-4">
          <button @click="goBack" class="hover:text-gray-700 flex items-center">
            <svg
              class="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Juntos
          </button>
          <span class="mx-2">/</span>
          <span class="text-gray-900">{{ currentProgram.name }}</span>
        </nav>

        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-3">
              <h1 class="text-3xl font-bold text-gray-900">
                {{ currentProgram.name }}
              </h1>
              <span
                v-if="isParticipant"
                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
              >
                ● Activo
              </span>
            </div>
            <p class="mt-2 text-lg text-gray-600">
              {{ currentProgram.organizationName }}
            </p>
            <p
              v-if="currentProgram.description"
              class="mt-2 text-sm text-gray-600"
            >
              {{ currentProgram.description }}
            </p>
          </div>

          <!-- Botón de salida -->
          <button
            v-if="isParticipant"
            @click="handleLeaveProgram"
            class="ml-4 px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
          >
            Salir del Programa
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-blue-100 rounded-lg p-3">
              <svg
                class="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Fecha de Ingreso</p>
              <p class="text-lg font-semibold text-gray-900">
                {{ formatDate(currentProgram.membership?.joinedAt) }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-green-100 rounded-lg p-3">
              <svg
                class="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Fase Actual</p>
              <p class="text-lg font-semibold text-gray-900 capitalize">
                {{
                  currentProgram.membership?.metadata?.currentPhase ||
                  "Baseline"
                }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-purple-100 rounded-lg p-3">
              <svg
                class="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Evaluaciones</p>
              <p class="text-lg font-semibold text-gray-900">
                {{ assessments.length }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Secciones con tabs -->
      <div class="bg-white rounded-lg border border-gray-200">
        <!-- Tabs -->
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              @click="activeTab = 'info'"
              :class="[
                activeTab === 'info'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
              ]"
            >
              Información
            </button>
            <button
              @click="activeTab = 'assessments'"
              :class="[
                activeTab === 'assessments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
              ]"
            >
              Evaluaciones
              <span
                v-if="assessments.length > 0"
                class="ml-2 py-0.5 px-2 rounded-full text-xs font-medium"
                :class="
                  activeTab === 'assessments'
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600'
                "
              >
                {{ assessments.length }}
              </span>
            </button>
          </nav>
        </div>

        <!-- Tab Content -->
        <div class="p-6">
          <!-- Información del programa -->
          <div v-if="activeTab === 'info'" class="space-y-6">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-4">
                Acerca del Programa
              </h3>
              <div class="bg-gray-50 rounded-lg p-4">
                <dl class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <dt class="text-sm font-medium text-gray-500">
                      Organización
                    </dt>
                    <dd class="mt-1 text-sm text-gray-900">
                      {{ currentProgram.organizationName }}
                    </dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Estado</dt>
                    <dd class="mt-1 text-sm text-gray-900">
                      <span
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                      >
                        Activo
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">
                      Fecha de creación
                    </dt>
                    <dd class="mt-1 text-sm text-gray-900">
                      {{ formatDate(currentProgram.createdAt) }}
                    </dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Tu rol</dt>
                    <dd class="mt-1 text-sm text-gray-900 capitalize">
                      Participante
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <div v-if="currentProgram.description">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">
                Descripción
              </h3>
              <p class="text-sm text-gray-600 leading-relaxed">
                {{ currentProgram.description }}
              </p>
            </div>

            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div class="flex items-start">
                <svg
                  class="w-5 h-5 text-blue-400 mr-3 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div class="text-sm text-blue-700">
                  <p class="font-medium mb-1">Privacidad de tus datos</p>
                  <p>
                    La organización solo tiene acceso a tus evaluaciones de
                    progreso. Tus datos financieros (ventas, gastos,
                    transacciones) permanecen completamente privados.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Evaluaciones -->
          <div v-else-if="activeTab === 'assessments'">
            <div v-if="assessments.length === 0" class="text-center py-12">
              <svg
                class="mx-auto h-12 w-12 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 class="text-sm font-medium text-gray-900 mb-1">
                No hay evaluaciones
              </h3>
              <p class="text-sm text-gray-500">
                Las evaluaciones serán realizadas por los facilitadores del
                programa.
              </p>
            </div>

            <div v-else class="space-y-4">
              <div
                v-for="assessment in assessments"
                :key="assessment.id"
                class="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
              >
                <div class="flex items-start justify-between mb-3">
                  <div>
                    <h4 class="text-sm font-semibold text-gray-900 capitalize">
                      {{ assessment.sessionType }}
                    </h4>
                    <p class="text-xs text-gray-500 mt-1">
                      {{ formatDate(assessment.submittedAt) }}
                    </p>
                  </div>
                  <span
                    class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                    :class="getScoreColor(assessment.overallScore)"
                  >
                    Puntuación: {{ assessment.overallScore.toFixed(1) }}
                  </span>
                </div>

                <p class="text-xs text-gray-500">
                  Evaluado por el facilitador del programa
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { usePrograms } from "@/composables/usePrograms";

const router = useRouter();
const route = useRoute();

const {
  currentProgram,
  isParticipant,
  loading,
  error,
  loadProgram,
  loadAssessments,
  leaveProgram,
} = usePrograms();

const activeTab = ref("info");
const assessments = ref([]);

const programId = computed(() => route.params.programId);

onMounted(async () => {
  try {
    await loadProgram(programId.value);
    assessments.value = await loadAssessments(programId.value);
  } catch (err) {
    console.error("Error cargando programa:", err);
  }
});

function goBack() {
  const businessId = route.params.businessId;
  router.push(`/business/${businessId}/programs`);
}

async function handleLeaveProgram() {
  try {
    const success = await leaveProgram(programId.value);
    if (success) {
      goBack();
    }
  } catch (err) {
    console.error("Error al salir del programa:", err);
  }
}

function formatDate(timestamp) {
  if (!timestamp) return "";

  let date;
  if (timestamp.toDate) {
    date = timestamp.toDate();
  } else if (timestamp.seconds) {
    date = new Date(timestamp.seconds * 1000);
  } else {
    date = new Date(timestamp);
  }

  return date.toLocaleDateString("es-PE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getScoreColor(score) {
  if (score >= 2.5) return "bg-green-100 text-green-800";
  if (score >= 1.5) return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-800";
}
</script>
