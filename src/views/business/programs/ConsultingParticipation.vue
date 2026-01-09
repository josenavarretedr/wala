<template>
  <div class="min-h-screen bg-gray-50 pb-24">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <button
            @click="goBack"
            class="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span class="font-medium">Volver</span>
          </button>

          <h1 class="text-xl font-bold text-gray-900">Detalles de Asesoría</h1>
          <div class="w-20"></div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <SpinnerIcon size="xl" class="text-green-600" />
    </div>

    <!-- Content -->
    <div
      v-else-if="activity"
      class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <div class="space-y-6">
        <!-- Información General -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-start gap-4 mb-4">
            <div
              class="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0"
            >
              <GraphUp class="w-6 h-6 text-purple-600" />
            </div>
            <div class="flex-1">
              <h2 class="text-2xl font-bold text-gray-900 mb-2">
                {{ activity.title }}
              </h2>
              <p class="text-sm text-gray-600 leading-relaxed">
                {{ activity.description }}
              </p>
            </div>
          </div>

          <!-- Detalles -->
          <div
            class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100"
          >
            <div class="flex items-center gap-3">
              <Calendar class="w-5 h-5 text-gray-400" />
              <div>
                <p class="text-xs text-gray-500">Fecha de Creación</p>
                <p class="text-sm font-medium text-gray-900">
                  {{ formatDate(activity.createdAt) }}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <svg
                class="w-5 h-5 text-gray-400"
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
              <div>
                <p class="text-xs text-gray-500">Total de Preguntas</p>
                <p class="text-sm font-medium text-gray-900">
                  {{
                    activity.consultingConfig?.totalQuestions ||
                    activity.monitoringConfig?.totalQuestions ||
                    21
                  }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Score de Participación -->
        <div
          :class="[
            'rounded-xl shadow-sm border-2 p-6',
            hasParticipation
              ? 'bg-green-50 border-green-300'
              : 'bg-amber-50 border-amber-300',
          ]"
        >
          <div class="flex items-start gap-4">
            <div
              :class="[
                'w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0',
                hasParticipation ? 'bg-green-100' : 'bg-amber-100',
              ]"
            >
              <CheckCircle
                v-if="hasParticipation"
                class="w-6 h-6 text-green-600"
              />
              <WarningCircle v-else class="w-6 h-6 text-amber-600" />
            </div>
            <div class="flex-1">
              <h3
                :class="[
                  'text-lg font-bold mb-1',
                  hasParticipation ? 'text-green-900' : 'text-amber-900',
                ]"
              >
                {{
                  hasParticipation
                    ? "Asesoría Completada"
                    : "Asesoría Pendiente"
                }}
              </h3>
              <p
                :class="[
                  'text-sm',
                  hasParticipation ? 'text-green-700' : 'text-amber-700',
                ]"
              >
                {{
                  hasParticipation
                    ? `Completado el ${formatDate(participation?.submittedAt)}`
                    : "Aún no se ha realizado tu asesoría pendiente."
                }}
              </p>

              <!-- Score si está completado -->
              <div
                v-if="
                  hasParticipation &&
                  (participation?.consultingData?.overallScore !== undefined ||
                    participation?.monitoringData?.overallScore !== undefined)
                "
                class="mt-4 flex items-center gap-3"
              >
                <div class="text-center">
                  <div
                    :class="[
                      'text-4xl font-bold',
                      getCohortClass(
                        (
                          participation.consultingData ||
                          participation.monitoringData
                        ).overallScore
                      ),
                    ]"
                  >
                    {{
                      (
                        participation.consultingData ||
                        participation.monitoringData
                      ).overallScore
                    }}
                  </div>
                  <p class="text-xs text-green-600 font-medium mt-1">
                    / 63 puntos
                  </p>
                </div>
                <div>
                  <div
                    :class="[
                      'inline-flex px-3 py-1 rounded-full text-xs font-bold',
                      getCohortClass(
                        (
                          participation.consultingData ||
                          participation.monitoringData
                        ).overallScore
                      ),
                    ]"
                  >
                    {{
                      getCohortLabel(
                        (
                          participation.consultingData ||
                          participation.monitoringData
                        ).overallScore
                      )
                    }}
                  </div>
                  <p class="text-xs text-green-600 mt-1">Nivel alcanzado</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Gráfico Radar de Categorías -->
        <ConsultingDataRadar
          v-if="
            hasParticipation &&
            (participation?.consultingData?.categoryScores ||
              participation?.monitoringData?.categoryScores)
          "
          :category-scores="
            participation.consultingData?.categoryScores ||
            participation.monitoringData?.categoryScores
          "
        />

        <!-- Recursos -->
        <div
          v-if="activity.driveUrl"
          class="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 class="text-lg font-bold text-gray-900 mb-4">Recursos</h3>
          <a
            :href="activity.driveUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
          >
            <svg
              class="w-6 h-6 text-blue-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0012.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z"
              />
            </svg>
            <div class="flex-1">
              <p class="font-medium text-blue-900">Ver Documentos en Drive</p>
              <p class="text-sm text-blue-600">
                Materiales y recursos de la asesoría
              </p>
            </div>
            <svg
              class="w-5 h-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>

        <!-- Contacto WhatsApp -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-bold text-gray-900 mb-4">
            ¿Necesitas ayuda?
          </h3>
          <a
            :href="whatsappLink"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
          >
            <svg
              class="w-6 h-6 text-green-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"
              />
            </svg>
            <div class="flex-1">
              <p class="font-medium text-green-900">Contactar Facilitador</p>
              <p class="text-sm text-green-600">
                Consultar sobre tu evaluación
              </p>
            </div>
            <svg
              class="w-5 h-5 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else
      class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center"
    >
      <p class="text-gray-500">No se pudo cargar la actividad</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useActivitiesStore } from "@/stores/activitiesStore";
import { useAuthStore } from "@/stores/authStore";
import { GraphUp, Calendar, CheckCircle, WarningCircle } from "@iconoir/vue";
import SpinnerIcon from "@/components/ui/SpinnerIcon.vue";
import ConsultingDataRadar from "@/components/activities/detail/ConsultingDataRadar.vue";

const route = useRoute();
const router = useRouter();
const activitiesStore = useActivitiesStore();
const authStore = useAuthStore();

const activity = ref(null);
const participation = ref(null);
const loading = ref(false);

const programId = computed(() => route.params.programId);
const activityId = computed(() => route.params.activityId);
const businessId = computed(() => route.params.businessId);

const hasParticipation = computed(() => {
  return participation.value && participation.value.status === "completed";
});

const whatsappLink = computed(() => {
  const phone = "51921492993"; // Número de WhatsApp
  const message = encodeURIComponent(
    `Hola, quiero consultar sobre mi asesoría "${activity.value?.title || ""}"`
  );
  return `https://wa.me/${phone}?text=${message}`;
});

onMounted(async () => {
  await loadActivityData();
});

async function loadActivityData() {
  loading.value = true;

  try {
    // Cargar actividad
    await activitiesStore.loadActivity(programId.value, activityId.value);
    activity.value = activitiesStore.currentActivity;

    // Cargar participación del usuario
    const userParticipations = await activitiesStore.loadUserActivities(
      programId.value,
      authStore.user?.uid
    );

    participation.value = userParticipations.find(
      (p) => p.activityId === activityId.value
    );
  } catch (error) {
    console.error("Error loading activity data:", error);
  } finally {
    loading.value = false;
  }
}

function getCohortLabel(score) {
  if (!score) return "Sin Evaluar";
  if (score <= 21) return "Inicial";
  if (score <= 42) return "Intermedio";
  return "Avanzado";
}

function getCohortClass(score) {
  if (!score) return "text-gray-700";
  if (score <= 21) return "text-amber-700";
  if (score <= 42) return "text-blue-700";
  return "text-green-700";
}

function formatDate(timestamp) {
  if (!timestamp) return "N/A";

  let date;
  if (timestamp.toDate) {
    date = timestamp.toDate();
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else {
    date = new Date(timestamp);
  }

  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function goBack() {
  router.push(`/business/${businessId.value}/programs/${programId.value}`);
}
</script>
