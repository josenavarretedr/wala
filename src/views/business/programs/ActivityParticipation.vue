<template>
  <div class="min-h-screen bg-gray-50 pb-24">
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between gap-3">
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

          <h1 class="text-xl font-bold text-gray-900">Detalle de Actividad</h1>
          <div class="w-20"></div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-12">
      <SpinnerIcon size="xl" class="text-green-600" />
    </div>

    <div
      v-else-if="activity"
      class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <div class="space-y-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-start gap-4 mb-4">
            <div
              class="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0"
            >
              <Book class="w-6 h-6 text-green-600" />
            </div>
            <div class="flex-1 min-w-0">
              <h2 class="text-2xl font-bold text-gray-900 mb-2">
                {{ activity.title }}
              </h2>
              <p class="text-sm text-gray-600 leading-relaxed">
                {{ activity.description || "Sin descripción" }}
              </p>

              <div class="mt-3 flex items-center gap-2 flex-wrap">
                <span
                  class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200"
                >
                  Actividad
                </span>
                <span
                  class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-600"
                >
                  {{ sortedFields.length }} campo{{
                    sortedFields.length !== 1 ? "s" : ""
                  }}
                </span>
                <span
                  v-if="hasAttendanceField"
                  class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                >
                  Incluye asistencia
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          :class="[
            'rounded-xl shadow-sm border-2 p-6',
            participationIsComplete
              ? 'bg-green-50 border-green-300'
              : currentParticipation
                ? 'bg-amber-50 border-amber-300'
                : 'bg-blue-50 border-blue-300',
          ]"
        >
          <div class="flex items-start gap-4">
            <div
              :class="[
                'w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0',
                participationIsComplete
                  ? 'bg-green-100'
                  : currentParticipation
                    ? 'bg-amber-100'
                    : 'bg-blue-100',
              ]"
            >
              <CheckCircle
                v-if="participationIsComplete"
                class="w-6 h-6 text-green-600"
              />
              <WarningCircle
                v-else
                :class="
                  currentParticipation ? 'text-amber-600' : 'text-blue-600'
                "
                class="w-6 h-6"
              />
            </div>
            <div class="flex-1">
              <h3
                :class="[
                  'text-lg font-bold mb-1',
                  participationIsComplete
                    ? 'text-green-900'
                    : currentParticipation
                      ? 'text-amber-900'
                      : 'text-blue-900',
                ]"
              >
                {{
                  participationIsComplete
                    ? "Actividad Completada"
                    : currentParticipation
                      ? "Respuestas Enviadas"
                      : "Actividad Pendiente"
                }}
              </h3>
              <p
                :class="[
                  'text-sm',
                  participationIsComplete
                    ? 'text-green-700'
                    : currentParticipation
                      ? 'text-amber-700'
                      : 'text-blue-700',
                ]"
              >
                {{
                  participationIsComplete
                    ? `Completada el ${formatDate(currentParticipation?.submittedAt)}`
                    : currentParticipation && hasAttendanceField
                      ? "Tus respuestas están enviadas. Falta validación de asistencia por facilitador."
                      : currentParticipation
                        ? "Puedes seguir editando tus respuestas hasta completar la actividad."
                        : "Completa los campos requeridos para enviar tu actividad."
                }}
              </p>
            </div>
          </div>
        </div>

        <div class="space-y-5">
          <div
            v-for="field in sortedFields"
            :key="field.id"
            class="bg-white rounded-xl border border-gray-200 shadow-sm p-5"
          >
            <FieldRenderer
              :field="field"
              :model-value="responses[field.id]"
              :readonly="isReadonly(field)"
              :is-facilitator="false"
              :storage-path="`programs/${programId}/activities/${activityId}/${userId}`"
              @update:model-value="responses[field.id] = $event"
            />
          </div>
        </div>

        <div
          v-if="validationError"
          class="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
        >
          {{ validationError }}
        </div>

        <div v-if="canEdit">
          <button
            type="button"
            @click="handleSubmit"
            :disabled="submitting"
            class="w-full py-4 bg-green-600 text-white text-base font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="submitting">Guardando...</span>
            <span v-else>{{
              currentParticipation
                ? "Actualizar respuestas"
                : "Enviar respuestas"
            }}</span>
          </button>
          <p class="text-center text-xs text-gray-400 mt-2">
            Los campos de asistencia son gestionados por el facilitador.
          </p>
        </div>

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
                Reportar asistencia o consultar dudas
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

    <div
      v-else
      class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-gray-500"
    >
      No se encontró la actividad.
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useActivities } from "@/composables/useActivities";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/composables/useToast";
import FieldRenderer from "@/components/activities/fields/FieldRenderer.vue";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { success, error: toastError } = useToast();
const {
  currentActivity: activity,
  currentParticipation,
  loading,
  loadActivity,
  loadUserParticipation,
  submitActivityParticipation,
  updateParticipationResponse,
  isParticipationComplete,
} = useActivities();
import { Book, CheckCircle, WarningCircle } from "@iconoir/vue";
import SpinnerIcon from "@/components/ui/SpinnerIcon.vue";

const programId = computed(() => route.params.programId);
const activityId = computed(() => route.params.activityId);
const businessId = computed(() => route.params.businessId);
const userId = computed(() => authStore.user?.uid);

const responses = reactive({});
const submitting = ref(false);
const validationError = ref("");
const facilitatorPhone = "+51921492993";

const sortedFields = computed(() => {
  if (!activity.value?.fields) return [];
  return [...activity.value.fields].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );
});

const hasAttendanceField = computed(() =>
  sortedFields.value.some((field) => field.type === "attendance"),
);

const participationIsComplete = computed(() => {
  if (!activity.value || !currentParticipation.value) return false;
  return isParticipationComplete(activity.value, currentParticipation.value);
});

const canEdit = computed(() => !participationIsComplete.value);

const whatsappLink = computed(() => {
  const message = encodeURIComponent(
    `Hola, quiero soporte sobre la actividad "${activity.value?.title || ""}"`,
  );
  return `https://wa.me/${facilitatorPhone.replace(/\D/g, "")}?text=${message}`;
});

// Los campos de attendance los llena el facilitador — en modo participante siempre son readonly
function isReadonly(field) {
  if (field.type === "attendance") return true;
  if (participationIsComplete.value) return true;
  return false;
}

function formatDate(ts) {
  if (!ts) return "—";
  const d = ts.toDate?.() ?? new Date(ts);
  return d.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function validate() {
  for (const field of sortedFields.value) {
    if (field.required && field.type !== "attendance") {
      const val = responses[field.id];
      const isEmptyString = typeof val === "string" && !val.trim();
      const isEmptyArray = Array.isArray(val) && val.length === 0;
      const isEmptyObject =
        val &&
        typeof val === "object" &&
        !Array.isArray(val) &&
        !Object.keys(val).length;

      if (
        val === undefined ||
        val === null ||
        isEmptyString ||
        isEmptyArray ||
        isEmptyObject
      ) {
        return `El campo "${field.title}" es requerido.`;
      }
    }
  }
  return "";
}

async function handleSubmit() {
  validationError.value = "";

  const err = validate();
  if (err) {
    validationError.value = err;
    return;
  }

  submitting.value = true;
  try {
    if (currentParticipation.value?.id) {
      await updateParticipationResponse(
        programId.value,
        currentParticipation.value.id,
        {
          ...responses,
        },
      );
      await loadUserParticipation(programId.value, activityId.value);
      success("Respuestas actualizadas exitosamente");
    } else {
      await submitActivityParticipation(programId.value, activityId.value, {
        ...responses,
      });
      await loadUserParticipation(programId.value, activityId.value);
      success("Actividad enviada exitosamente");
    }
  } catch (err) {
    console.error(err);
    toastError(err.message || "Error al guardar la actividad");
  } finally {
    submitting.value = false;
  }
}

function goBack() {
  router.push(`/business/${businessId.value}/programs/${programId.value}`);
}

onMounted(async () => {
  await Promise.all([
    loadActivity(programId.value, activityId.value),
    loadUserParticipation(programId.value, activityId.value),
  ]);

  // Pre-llenar respuestas si ya existe participación
  if (currentParticipation.value?.responses) {
    Object.entries(currentParticipation.value.responses).forEach(
      ([key, val]) => {
        responses[key] = val;
      },
    );
  }
});
</script>
