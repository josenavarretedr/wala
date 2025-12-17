<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Juntos</h1>
          <p class="mt-1 text-sm text-gray-500">
            Programas de acompañamiento para tu negocio
          </p>
        </div>

        <div class="flex items-center gap-3">
          <!-- Botón Crear Programa (solo gerentes) -->
          <button
            v-if="canJoinPrograms"
            @click="goToCreateProgram"
            class="inline-flex items-center px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors shadow-sm"
          >
            <svg
              class="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Crear Programa
          </button>

          <!-- Botón Unirse a Programa -->
          <button
            v-if="canJoinPrograms"
            @click="showJoinModal = true"
            class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <svg
              class="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
            Unirme a un Programa
          </button>
        </div>
      </div>

      <!-- Mensaje para empleados -->
      <div
        v-if="!canJoinPrograms"
        class="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4"
      >
        <div class="flex items-start">
          <svg
            class="w-5 h-5 text-yellow-400 mr-2 flex-shrink-0 mt-0.5"
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
          <p class="text-sm text-yellow-700">
            Solo los gerentes pueden unir el negocio a programas de
            acompañamiento. Si deseas participar en un programa, consulta con el
            gerente de tu negocio.
          </p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="text-center">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
        ></div>
        <p class="text-sm text-gray-500">Cargando programas...</p>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!hasActiveProgram"
      class="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center"
    >
      <svg
        class="mx-auto h-16 w-16 text-gray-400 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">
        No estás en ningún programa
      </h3>
      <p class="text-sm text-gray-500 mb-6 max-w-md mx-auto">
        Únete a un programa de acompañamiento empresarial usando un código de
        invitación proporcionado por organizaciones como CARE, OIT, o tu
        municipalidad local.
      </p>
      <button
        v-if="canJoinPrograms"
        @click="showJoinModal = true"
        class="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        <svg
          class="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        Unirme Ahora
      </button>
    </div>

    <!-- Active Programs List -->
    <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="program in activePrograms"
        :key="program.id"
        class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer group"
        @click="goToProgram(program.id)"
      >
        <!-- Header -->
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <h3
              class="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors"
            >
              {{ program.name }}
            </h3>
            <p class="mt-1 text-sm text-gray-500">
              {{ program.organizationName }}
            </p>
          </div>
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
          >
            Activo
          </span>
        </div>

        <!-- Description -->
        <p
          v-if="program.description"
          class="text-sm text-gray-600 line-clamp-2 mb-4"
        >
          {{ program.description }}
        </p>

        <!-- Metadata -->
        <div
          class="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100"
        >
          <div class="flex items-center">
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Desde {{ formatDate(program.membership?.joinedAt) }}
          </div>

          <svg
            class="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </div>

    <!-- Join Modal -->
    <JoinProgramModal
      v-if="showJoinModal"
      @close="showJoinModal = false"
      @joined="handleProgramJoined"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { usePrograms } from "@/composables/usePrograms";
import JoinProgramModal from "./JoinProgramModal.vue";

const router = useRouter();
const {
  activePrograms,
  hasActiveProgram,
  loading,
  canJoinPrograms,
  loadPrograms,
} = usePrograms();

const showJoinModal = ref(false);

onMounted(async () => {
  await loadPrograms();
});

function goToProgram(programId) {
  const businessId = router.currentRoute.value.params.businessId;
  router.push(`/business/${businessId}/programs/${programId}`);
}

function goToCreateProgram() {
  const businessId = router.currentRoute.value.params.businessId;
  router.push(`/business/${businessId}/programs/create`);
}

function handleProgramJoined(result) {
  showJoinModal.value = false;
  loadPrograms();

  // Mostrar notificación de éxito (opcional)
  console.log("✅ Unido exitosamente:", result);
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
</script>
