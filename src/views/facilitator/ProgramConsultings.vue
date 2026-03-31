<template>
  <div class="min-h-screen bg-gray-50">
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <button
          @click="goBack"
          class="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span class="text-sm font-medium">Volver al Programa</span>
        </button>

        <div>
          <h1 class="text-3xl font-bold text-gray-900">
            Consulting del Programa
          </h1>
          <p v-if="program" class="text-gray-600 mt-1">{{ program.name }}</p>
        </div>
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-12">
      <SpinnerIcon size="xl" class="text-green-600" />
    </div>

    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h2 class="text-lg font-semibold text-gray-900">
              Dashboard de Expedientes
            </h2>
            <p class="text-sm text-gray-500">
              1 expediente activo por participante · flujo bloqueante por fases
            </p>
          </div>

          <div class="w-full sm:w-80">
            <input
              v-model="search"
              type="text"
              placeholder="Buscar participante o negocio..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </div>

      <div
        class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                Participante
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                Negocio
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                Estado
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                Riesgo
              </th>
              <th
                class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                Acción
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-100">
            <tr v-if="!filteredRows.length">
              <td
                colspan="5"
                class="px-4 py-8 text-center text-sm text-gray-500"
              >
                No hay participantes que coincidan con la búsqueda.
              </td>
            </tr>

            <tr
              v-for="row in filteredRows"
              :key="row.participant.userId"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-4 py-3">
                <p class="text-sm font-medium text-gray-900">
                  {{ getParticipantUserName(row.participant) }}
                </p>
                <p class="text-xs text-gray-500">
                  {{
                    row.participant.email ||
                    row.participant.userEmail ||
                    "Sin email"
                  }}
                </p>
              </td>

              <td class="px-4 py-3 text-sm text-gray-700">
                {{
                  getParticipantBusinessName(row.participant) || "Sin negocio"
                }}
              </td>

              <td class="px-4 py-3">
                <span
                  class="inline-flex px-2.5 py-1 rounded-full text-xs font-medium"
                  :class="getStepBadgeClass(row.dossier?.currentStep)"
                >
                  {{
                    row.dossier
                      ? getStepLabel(row.dossier.currentStep)
                      : "Sin expediente"
                  }}
                </span>
              </td>

              <td class="px-4 py-3">
                <span
                  class="inline-flex px-2.5 py-1 rounded-full text-xs font-medium"
                  :class="getRiskBadgeClass(row.dossier?.riskLevel)"
                >
                  {{ getRiskLabel(row.dossier?.riskLevel) }}
                </span>
              </td>

              <td class="px-4 py-3 text-right">
                <button
                  @click="handleOpenDossier(row)"
                  :disabled="creatingRow === row.participant.userId"
                  class="px-3 py-1.5 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {{
                    creatingRow === row.participant.userId
                      ? "Abriendo..."
                      : row.dossier
                        ? "Continuar"
                        : "Nueva consultoría"
                  }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "@/firebaseInit";
import { useProgramStore } from "@/stores/programStore";
import { useConsultingDossiers } from "@/composables/useConsultingDossiers";
import SpinnerIcon from "@/components/ui/SpinnerIcon.vue";

const route = useRoute();
const router = useRouter();
const programStore = useProgramStore();
const { dossiers, loading, loadProgramDossiers, createDossier, getStepLabel } =
  useConsultingDossiers();

const programId = computed(() => route.params.programId);
const program = ref(null);
const participants = ref([]);
const search = ref("");
const creatingRow = ref("");

const rows = computed(() => {
  const byParticipant = {};

  dossiers.value.forEach((dossier) => {
    if (!byParticipant[dossier.participantId]) {
      byParticipant[dossier.participantId] = dossier;
    }
  });

  return participants.value.map((participant) => ({
    participant,
    dossier: byParticipant[participant.userId] || null,
  }));
});

const filteredRows = computed(() => {
  const term = search.value.trim().toLowerCase();
  if (!term) return rows.value;

  return rows.value.filter(({ participant }) => {
    const userName = getParticipantUserName(participant).toLowerCase();
    const businessName = getParticipantBusinessName(participant).toLowerCase();
    const email = (
      participant.email ||
      participant.userEmail ||
      ""
    ).toLowerCase();
    return (
      userName.includes(term) ||
      businessName.includes(term) ||
      email.includes(term)
    );
  });
});

function getParticipantUserName(participant) {
  return (
    participant?.profileUser?.name ||
    participant?.profileUser?.nombre ||
    participant?.userName ||
    ""
  );
}

function getParticipantBusinessName(participant) {
  return (
    participant?.businessProfile?.businessName ||
    participant?.businessProfile?.razonSocial ||
    participant?.businessProfile?.businessName ||
    participant?.businessProfile?.razonSocial ||
    participant?.businessName ||
    ""
  );
}

function getStepBadgeClass(step) {
  if (!step) return "bg-gray-100 text-gray-700";
  if (step === "closed") return "bg-gray-100 text-gray-700";
  if (step.includes("completed")) return "bg-green-100 text-green-700";
  return "bg-blue-100 text-blue-700";
}

function getRiskLabel(riskLevel) {
  if (riskLevel === "high") return "Alto";
  if (riskLevel === "medium") return "Medio";
  if (riskLevel === "low") return "Bajo";
  return "Sin riesgo";
}

function getRiskBadgeClass(riskLevel) {
  if (riskLevel === "high") return "bg-red-100 text-red-700";
  if (riskLevel === "medium") return "bg-amber-100 text-amber-700";
  if (riskLevel === "low") return "bg-emerald-100 text-emerald-700";
  return "bg-gray-100 text-gray-700";
}

async function loadParticipants() {
  const participantsRef = collection(
    db,
    "programs",
    programId.value,
    "participants",
  );
  const participantsQuery = query(participantsRef);
  const participantsSnapshot = await getDocs(participantsQuery);

  participants.value = participantsSnapshot.docs
    .map((participantDoc) => ({
      userId: participantDoc.id,
      ...participantDoc.data(),
    }))
    .filter((participant) => participant.status === "active");
}

async function handleOpenDossier(row) {
  const participantId = row.participant.userId;
  creatingRow.value = participantId;

  try {
    let dossier = row.dossier;
    if (!dossier) {
      dossier = await createDossier(programId.value, row.participant);
    }

    router.push(`/programs/${programId.value}/consultings/${dossier.id}`);
  } catch (error) {
    console.error("Error al abrir expediente:", error);
    alert("No se pudo abrir el expediente de consulting");
  } finally {
    creatingRow.value = "";
  }
}

function goBack() {
  router.push(`/programs/${programId.value}`);
}

onMounted(async () => {
  try {
    await programStore.loadProgram(programId.value);
    program.value = programStore.currentProgram;

    await Promise.all([
      loadParticipants(),
      loadProgramDossiers(programId.value),
    ]);
  } catch (error) {
    console.error("Error al cargar dashboard de consulting:", error);
  }
});
</script>
