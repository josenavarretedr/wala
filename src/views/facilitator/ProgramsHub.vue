<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Mis Programas</h1>
            <p class="text-sm text-gray-500 mt-1">
              Panel de facilitador - Gestiona tus programas de acompañamiento
            </p>
          </div>

          <div class="flex items-center gap-4">
            <!-- Botón Unirse a Programa -->
            <button
              @click="showJoinModal = true"
              class="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm"
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
              Unirme a Programa
            </button>

            <!-- Perfil del usuario -->
            <div class="flex items-center gap-3">
              <div class="text-right">
                <p class="text-sm font-medium text-gray-900">{{ userName }}</p>
                <p class="text-xs text-gray-500">Facilitador</p>
              </div>
              <div
                class="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold"
              >
                {{ userInitials }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="text-center">
          <div
            class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"
          ></div>
          <p class="text-sm text-gray-500">Cargando programas...</p>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="programs.length === 0"
        class="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center"
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
          No tienes programas asignados
        </h3>
        <p class="text-sm text-gray-500 mb-6 max-w-md mx-auto">
          Contacta con tu organización para que te agreguen como facilitador a
          uno o más programas de acompañamiento.
        </p>
      </div>

      <!-- Programs Grid -->
      <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="program in programs"
          :key="program.id"
          @click="goToProgram(program.id)"
          class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer group"
        >
          <!-- Header -->
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <h3
                class="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors line-clamp-2"
              >
                {{ program.name }}
              </h3>
              <p class="text-sm text-gray-500 mt-1">
                {{ program.organizationName }}
              </p>
            </div>
            <span
              :class="[
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                program.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800',
              ]"
            >
              {{ program.isActive ? "Activo" : "Inactivo" }}
            </span>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div class="bg-gray-50 rounded-lg p-3">
              <p class="text-xs text-gray-500 mb-1">Participantes</p>
              <p class="text-lg font-semibold text-gray-900">
                {{ program.metadata?.totalParticipants || 0 }}
              </p>
            </div>
            <div class="bg-gray-50 rounded-lg p-3">
              <p class="text-xs text-gray-500 mb-1">Duración</p>
              <p class="text-sm font-medium text-gray-900">
                {{ program.metadata?.duration || "N/A" }}
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div
            class="flex items-center justify-between pt-4 border-t border-gray-100"
          >
            <div class="flex items-center text-xs text-gray-500">
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
              {{ formatDate(program.metadata?.startDate) }}
            </div>

            <svg
              class="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors"
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
    </div>

    <!-- Join Modal -->
    <JoinProgramModalFacilitator
      v-if="showJoinModal"
      @close="showJoinModal = false"
      @joined="handleProgramJoined"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { usePrograms } from "@/composables/usePrograms";
import { useUserStore } from "@/stores/useUserStore";
import JoinProgramModalFacilitator from "@/components/programs/JoinProgramModalFacilitator.vue";

const router = useRouter();
const { activePrograms, loading, loadPrograms } = usePrograms();
const userStore = useUserStore();

const showJoinModal = ref(false);

const userName = computed(() => {
  return userStore.userProfile?.nombre || "Usuario";
});

const userInitials = computed(() => {
  const name = userName.value;
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
});

// Usar activePrograms del store en lugar de programs local
const programs = computed(() => activePrograms.value);

onMounted(async () => {
  await loadFacilitatorPrograms();
});

async function loadFacilitatorPrograms() {
  try {
    console.log("🔍 Cargando programas del facilitador desde el store...");

    // Importar la función del store directamente
    const { useProgramStore } = await import("@/stores/programStore");
    const programStore = useProgramStore();

    // Llamar a la función actualizada del store
    await programStore.loadFacilitatorPrograms();

    console.log(`✅ ${activePrograms.value.length} programas cargados`);
  } catch (error) {
    console.error("❌ Error cargando programas:", error);
  }
}

function goToProgram(programId) {
  router.push(`/programs/${programId}`);
}

function handleProgramJoined() {
  showJoinModal.value = false;
  loadFacilitatorPrograms(); // Recargar programas
}

function formatDate(date) {
  if (!date) return "N/A";

  let jsDate;
  if (date.toDate) {
    jsDate = date.toDate();
  } else if (date.seconds) {
    jsDate = new Date(date.seconds * 1000);
  } else {
    jsDate = new Date(date);
  }

  return jsDate.toLocaleDateString("es-PE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
</script>
