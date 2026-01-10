<template>
  <div
    class="bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-orange-50/30 min-h-screen pb-24"
  >
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <SpinnerIcon class="w-6 h-6 text-purple-600 mx-auto mb-4" />
        <p class="text-lg text-gray-600 font-medium">Cargando programas...</p>
      </div>
    </div>

    <!-- Empty State - Rediseñado -->
    <div
      v-else-if="!hasActiveProgram"
      class="max-w-6xl mx-auto px-4 pt-12 sm:pt-20"
    >
      <div
        class="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-12 md:p-16 text-center"
      >
        <!-- Icono -->
        <div class="flex justify-center mb-6">
          <div
            class="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center"
          >
            <svg
              class="w-12 h-12 text-purple-600"
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
          </div>
        </div>

        <!-- Título -->
        <h2
          class="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight"
        >
          Aún no estás en ningún <span class="text-purple-600">programa</span>
        </h2>

        <!-- Descripción -->
        <p
          class="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
        >
          Únete a un programa de acompañamiento empresarial usando un código de
          invitación proporcionado por organizaciones aliadas.
        </p>
      </div>
    </div>

    <!-- Active Programs List - Con menos padding -->
    <div v-else class="max-w-6xl mx-auto px-4 pt-8 sm:pt-12">
      <!-- Header sutil -->
      <div class="mb-6">
        <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Tus programas activos
        </h2>
        <p class="text-gray-600">Programas en los que estás participando</p>
      </div>

      <!-- Grid de programas -->
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="program in activePrograms"
          :key="program.id"
          class="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group hover:-translate-y-1"
          @click="goToProgram(program.id)"
        >
          <!-- Header -->
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <h3
                class="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors leading-tight"
              >
                {{ program.name }}
              </h3>
              <p class="mt-1 text-sm text-gray-500 font-medium">
                {{ program.organizationName }}
              </p>
            </div>
            <span
              class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700"
            >
              Activo
            </span>
          </div>

          <!-- Description -->
          <p
            v-if="program.description"
            class="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed"
          >
            {{ program.description }}
          </p>

          <!-- Metadata -->
          <div
            class="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100"
          >
            <div class="flex items-center gap-1.5">
              <svg
                class="w-4 h-4"
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
              <span class="font-medium"
                >Desde {{ formatDate(program.membership?.joinedAt) }}</span
              >
            </div>

            <svg
              class="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors"
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

    <!-- ProgramsPitch - Con menos espacio superior -->
    <div>
      <ProgramsPitch @open-join-modal="showJoinModal = true" />
    </div>

    <!-- Join Modal -->
    <JoinProgramModal
      v-if="showJoinModal"
      @close="showJoinModal = false"
      @joined="handleProgramJoined"
    />

    <!-- Botones de navegación flotantes -->
    <NavigationBtnProgramsUser @open-join-modal="showJoinModal = true" />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { usePrograms } from "@/composables/usePrograms";
import JoinProgramModal from "./JoinProgramModal.vue";
import ProgramsPitch from "@/components/programs/ProgramsPitch.vue";
import NavigationBtnProgramsUser from "@/components/programs/NavigationBtnProgramsUser.vue";
import SpinnerIcon from "@/components/ui/SpinnerIcon.vue";

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
