<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <button
              @click="goBack"
              class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <NavArrowLeft class="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 class="text-xl sm:text-2xl font-bold text-gray-900">
                {{
                  isDraft
                    ? "Completar Participaci\u00f3n"
                    : "Detalle de Asesor\u00eda"
                }}
              </h1>
              <p class="text-sm text-gray-600 mt-0.5">
                {{ participation?.userName || "Cargando..." }}
              </p>
            </div>
          </div>

          <!-- Botón eliminar -->
          <button
            v-if="participation"
            @click="showDeleteConfirm = true"
            class="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
          >
            <Trash class="w-4 h-4" />
            <span class="hidden sm:inline">Eliminar</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div class="animate-pulse space-y-4">
          <div class="h-4 bg-gray-200 rounded w-3/4"></div>
          <div class="h-4 bg-gray-200 rounded w-1/2"></div>
          <div class="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div
      v-else-if="participation"
      class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 mb-20"
    >
      <!-- ══════════════════════════════════════════ -->
      <!-- VISTA FORM (formulario dinámico)           -->
      <!-- ══════════════════════════════════════════ -->
      <template v-if="isFormType">
        <!-- Header info -->
        <div
          class="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6"
        >
          <div class="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p class="text-sm text-gray-500">Participante</p>
              <p class="text-lg font-semibold text-gray-900">
                {{ participation.userName }}
              </p>
              <p class="text-sm text-gray-500">
                {{ participation.businessName }}
              </p>
            </div>
            <div class="text-right">
              <p class="text-xs text-gray-400">
                {{ isDraft ? "Creado" : "Enviado" }}
              </p>
              <p class="text-sm font-medium text-gray-700">
                {{ formatDate(participation.submittedAt) }}
              </p>
              <span
                :class="[
                  'inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded-full',
                  isDraft
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-green-100 text-green-700',
                ]"
              >
                {{ isDraft ? "Borrador" : "Completado" }}
              </span>
            </div>
          </div>
        </div>

        <!-- Banner draft -->
        <div
          v-if="isDraft"
          class="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 flex items-center gap-2"
        >
          <svg
            class="w-5 h-5 shrink-0"
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
          Esta participaci\u00f3n fue creada por el facilitador. Complete los
          campos y guarde para finalizar.
        </div>

        <!-- Guardando cambios banner -->
        <div
          v-if="savingForm"
          class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 flex items-center gap-2"
        >
          <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            ></path>
          </svg>
          Guardando cambios...
        </div>

        <!-- Fields del formulario -->
        <div class="space-y-4">
          <div
            v-for="field in sortedActivityFields"
            :key="field.id"
            class="bg-white rounded-xl border border-gray-200 shadow-sm p-5"
          >
            <FieldRenderer
              :field="field"
              :model-value="editableResponses[field.id]"
              :readonly="field.type !== 'attendance' ? false : false"
              :is-facilitator="true"
              :storage-path="`programs/${programId}/activities/${activityId}/${participation.userId}`"
              @update:model-value="handleFieldUpdate(field, $event)"
            />
          </div>
        </div>

        <!-- Botón guardar cambios -->
        <div class="mt-6 flex gap-3">
          <button
            type="button"
            @click="saveFormChanges"
            :disabled="savingForm || (!formHasChanges && !isDraft)"
            class="flex-1 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{
              savingForm
                ? "Guardando..."
                : isDraft
                  ? "Guardar y Completar"
                  : "Guardar cambios"
            }}
          </button>
        </div>
      </template>

      <!-- ══════════════════════════════════════════ -->
      <!-- VISTA CONSULTING (asesoría)                -->
      <!-- ══════════════════════════════════════════ -->
      <template v-else>
        <!-- Info Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <!-- Score General -->
          <div
            class="bg-white rounded-xl shadow-sm border border-purple-200 p-5"
          >
            <div class="text-center">
              <p class="text-sm text-gray-600 font-medium mb-2">
                Score General
              </p>
              <div class="text-4xl font-bold text-purple-600 mb-1">
                {{
                  (
                    participation.consultingData || participation.monitoringData
                  )?.overallScore?.toFixed(0) || "0"
                }}
              </div>
              <p class="text-xs text-gray-500 mb-3">de 63 puntos</p>
              <!-- Badge Cohorte -->
              <div
                :class="[
                  'inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold',
                  getCohortClass(
                    (
                      participation.consultingData ||
                      participation.monitoringData
                    )?.overallScore,
                  ),
                ]"
              >
                {{
                  getCohortLabel(
                    (
                      participation.consultingData ||
                      participation.monitoringData
                    )?.overallScore,
                  )
                }}
              </div>
            </div>
          </div>

          <!-- Negocio -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div>
              <p class="text-sm text-gray-600 font-medium mb-2">Negocio</p>
              <p class="text-lg font-semibold text-gray-900 mb-1">
                {{ participation.businessName }}
              </p>
              <p class="text-sm text-gray-600">{{ participation.userName }}</p>
            </div>
          </div>

          <!-- Detalles -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div class="space-y-2">
              <div>
                <p class="text-xs text-gray-500">Modalidad</p>
                <div
                  :class="[
                    'inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium border mt-1',
                    getModalityClass(
                      (
                        participation.consultingData ||
                        participation.monitoringData
                      )?.modality,
                    ),
                  ]"
                >
                  {{
                    getModalityLabel(
                      (
                        participation.consultingData ||
                        participation.monitoringData
                      )?.modality,
                    )
                  }}
                </div>
              </div>
              <div>
                <p class="text-xs text-gray-500">Fecha de Asesoría</p>
                <p class="text-sm font-medium text-gray-900">
                  {{
                    formatDate(
                      (
                        participation.consultingData ||
                        participation.monitoringData
                      )?.consultingDate ||
                        (
                          participation.consultingData ||
                          participation.monitoringData
                        )?.monitoringDate,
                    )
                  }}
                </p>
              </div>
              <div>
                <p class="text-xs text-gray-500">Fecha de Envío</p>
                <p class="text-sm font-medium text-gray-900">
                  {{ formatDate(participation.submittedAt) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Category Scores Overview -->
        <div
          v-if="
            (participation.consultingData || participation.monitoringData)
              ?.categoryScores
          "
          class="mb-6"
        >
          <ConsultingDataRadar
            :categoryScores="
              (participation.consultingData || participation.monitoringData)
                .categoryScores
            "
          />
        </div>

        <!-- Respuestas por Categoría -->
        <div class="space-y-4">
          <div
            v-for="category in categoriesWithResponses"
            :key="category.key"
            class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <!-- Category Header -->
            <div
              :class="[
                'px-5 sm:px-6 py-4 border-b border-gray-200',
                category.bgClass,
              ]"
            >
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-lg font-semibold" :class="category.textClass">
                    {{ category.label }}
                  </h3>
                  <p class="text-sm mt-0.5" :class="category.descClass">
                    {{ category.description }}
                  </p>
                </div>
                <div
                  class="text-2xl font-bold px-4 py-2 rounded-lg bg-white bg-opacity-60"
                  :class="category.textClass"
                >
                  {{ getCategoryScore(category.key) }}
                </div>
              </div>
            </div>

            <!-- Preguntas y Respuestas -->
            <div class="p-5 sm:p-6 space-y-5">
              <div
                v-for="(question, index) in category.questions"
                :key="index"
                class="pb-5 border-b border-gray-100 last:border-0 last:pb-0"
              >
                <div class="flex items-start justify-between gap-4 mb-3">
                  <p class="text-sm font-medium text-gray-900 flex-1">
                    {{ index + 1 }}. {{ question }}
                  </p>
                  <!-- Rating Badge -->
                  <div
                    :class="[
                      'flex-shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-lg font-bold text-base',
                      getRatingClass(getQuestionRating(category.key, index)),
                    ]"
                  >
                    {{
                      getQuestionRating(category.key, index) !== null
                        ? getQuestionRating(category.key, index)
                        : "N/A"
                    }}
                  </div>
                </div>

                <!-- Rating Legend -->
                <div class="flex items-center gap-2 text-xs text-gray-600">
                  <span class="font-medium">Evaluación:</span>
                  <span>{{
                    getRatingLabel(getQuestionRating(category.key, index))
                  }}</span>
                </div>
              </div>

              <!-- Category Comments -->
              <div
                v-if="
                  (participation.consultingData || participation.monitoringData)
                    ?.categoryComments?.[category.key]
                "
                class="mt-4 pt-4 border-t border-gray-200"
              >
                <p class="text-xs text-gray-500 font-medium mb-2">
                  Comentarios sobre {{ category.label }}:
                </p>
                <p
                  class="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-3"
                >
                  {{
                    (
                      participation.consultingData ||
                      participation.monitoringData
                    ).categoryComments[category.key]
                  }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Comentarios Adicionales -->
        <div
          v-if="
            (participation.consultingData || participation.monitoringData)
              ?.additionalComments
          "
          class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6 mt-6"
        >
          <h2 class="text-lg font-bold text-gray-900 mb-3">
            Comentarios Adicionales
          </h2>
          <p
            class="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-4"
          >
            {{
              (participation.consultingData || participation.monitoringData)
                .additionalComments
            }}
          </p>
        </div>

        <!-- Evidencias -->
        <div
          v-if="
            (participation.consultingData || participation.monitoringData)
              ?.evidenceUrls?.length
          "
          class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6 mt-6"
        >
          <h2 class="text-lg font-bold text-gray-900 mb-4">
            Evidencias Fotográficas
          </h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            <div
              v-for="(url, index) in (
                participation.consultingData || participation.monitoringData
              ).evidenceUrls"
              :key="index"
              class="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
              @click="openImageModal(url)"
            >
              <img
                :src="url"
                :alt="`Evidencia ${index + 1}`"
                class="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </template>
      <!-- /template v-else consulting -->
    </div>

    <!-- Error State -->
    <div v-else class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p class="text-red-800 font-medium">No se pudo cargar la asesoría</p>
        <button
          @click="goBack"
          class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Volver
        </button>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteConfirm"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <h3 class="text-xl font-bold text-gray-900 mb-2">
          Confirmar Eliminación
        </h3>
        <p class="text-sm text-gray-600 mb-6">
          ¿Estás seguro de que deseas eliminar esta asesoría? Esta acción no se
          puede deshacer.
        </p>
        <div class="flex items-center gap-3 justify-end">
          <button
            @click="showDeleteConfirm = false"
            class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="handleDelete"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>

    <!-- Image Modal -->
    <div
      v-if="selectedImage"
      class="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
      @click="selectedImage = null"
    >
      <img
        :src="selectedImage"
        alt="Evidencia ampliada"
        class="max-w-full max-h-full object-contain"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/firebaseInit";
import { NavArrowLeft, Trash } from "@iconoir/vue";
import ConsultingDataRadar from "@/components/activities/detail/ConsultingDataRadar.vue";
import FieldRenderer from "@/components/activities/fields/FieldRenderer.vue";
import { useActivities } from "@/composables/useActivities";
import { useToast } from "@/composables/useToast";

const route = useRoute();
const router = useRouter();
const { success, error: toastError } = useToast();
const { updateParticipationResponse, markAttendanceField } = useActivities();

const programId = route.params.programId;
const activityId = route.params.activityId;
const participationId = route.params.participationId;

const participation = ref(null);
const activityData = ref(null); // activity definition (fields[])
const loading = ref(true);
const showDeleteConfirm = ref(false);
const selectedImage = ref(null);
const savingForm = ref(false);

// Para type: 'form'
const editableResponses = reactive({});
const originalResponses = ref({});

const isFormType = computed(
  () =>
    participation.value?.activityType === "activity" ||
    participation.value?.activityType === "form",
);
const isDraft = computed(() => participation.value?.status === "draft");

const sortedActivityFields = computed(() => {
  if (!activityData.value?.fields) return [];
  return [...activityData.value.fields].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );
});

const formHasChanges = computed(() => {
  return (
    JSON.stringify(editableResponses) !==
    JSON.stringify(originalResponses.value)
  );
});

function handleFieldUpdate(field, value) {
  editableResponses[field.id] = value;
}

async function saveFormChanges() {
  savingForm.value = true;
  try {
    const responsesClone = { ...editableResponses };
    await updateParticipationResponse(
      programId,
      participationId,
      responsesClone,
    );

    // Si es draft, cambiar status a completed
    if (isDraft.value) {
      const {
        doc: fbDoc,
        updateDoc,
        serverTimestamp: srvTs,
      } = await import("firebase/firestore");
      const { db: fbDb } = await import("@/firebaseInit");
      const participationRef = fbDoc(
        fbDb,
        "programs",
        programId,
        "participations",
        participationId,
      );
      await updateDoc(participationRef, {
        status: "completed",
        submittedAt: srvTs(),
        updatedAt: srvTs(),
      });
      participation.value.status = "completed";
    }

    originalResponses.value = { ...responsesClone };
    success(
      isDraft.value
        ? "Participaci\u00f3n completada exitosamente"
        : "Cambios guardados exitosamente",
    );
  } catch (err) {
    console.error(err);
    toastError("Error al guardar los cambios");
  } finally {
    savingForm.value = false;
  }
}

// Categorías (mismo array que ConsultingForm.vue)
const categories = [
  {
    key: "negocioFamilia",
    label: "Negocio y Familia",
    description: "Separación entre negocio y finanzas familiares",
    bgClass: "bg-blue-50",
    textClass: "text-blue-900",
    descClass: "text-blue-700",
    questions: [
      "¿El participante se asigna un salario personal del negocio?",
      "¿Los familiares que trabajan en el negocio reciben un salario definido?",
      "¿Evita retirar dinero del negocio para gastos personales sin registro?",
    ],
  },
  {
    key: "marketing",
    label: "Marketing",
    description: "Estrategias de promoción y ventas",
    bgClass: "bg-green-50",
    textClass: "text-green-900",
    descClass: "text-green-700",
    questions: [
      "¿Identifica y comprende las necesidades de sus clientes y las oportunidades de mercado?",
      "¿Implementa acciones para promocionar el negocio y sus productos?",
      "¿Establece precios de forma competitiva y estratégica basándose en costos y márgenes?",
    ],
  },
  {
    key: "controlStock",
    label: "Control de Stock",
    description: "Gestión de inventarios",
    bgClass: "bg-purple-50",
    textClass: "text-purple-900",
    descClass: "text-purple-700",
    questions: [
      "¿Lleva un registro actualizado de su inventario?",
      "¿Realiza conteos físicos periódicos?",
      "¿Identifica productos de alta y baja rotación?",
    ],
  },
  {
    key: "compras",
    label: "Compras",
    description: "Gestión de aprovisionamiento",
    bgClass: "bg-yellow-50",
    textClass: "text-yellow-900",
    descClass: "text-yellow-700",
    questions: [
      "¿Planifica sus compras con anticipación?",
      "¿Compara precios entre diferentes proveedores?",
      "¿Mantiene buenas relaciones con sus proveedores?",
    ],
  },
  {
    key: "costeo",
    label: "Costeo",
    description: "Cálculo y control de costos",
    bgClass: "bg-red-50",
    textClass: "text-red-900",
    descClass: "text-red-700",
    questions: [
      "¿Calcula y controla los costos de materiales directos utilizados en la producción?",
      "¿Determina los costos de mano de obra directa involucrada en sus productos o servicios?",
      "¿Identifica y asigna los costos indirectos del negocio?",
    ],
  },
  {
    key: "mantenimientoRegistros",
    label: "Mantenimiento de Registros",
    description: "Documentación y archivo",
    bgClass: "bg-indigo-50",
    textClass: "text-indigo-900",
    descClass: "text-indigo-700",
    questions: [
      "¿Mantiene libros de registro actualizados y comprensibles?",
      "¿Lleva un control de las cuentas de sus clientes?",
      "¿Calcula las ganancias y pérdidas del negocio de manera regular?",
    ],
  },
  {
    key: "planificacion",
    label: "Planificación",
    description: "Proyección y estrategia",
    bgClass: "bg-pink-50",
    textClass: "text-pink-900",
    descClass: "text-pink-700",
    questions: [
      "¿Realiza proyecciones de ventas y costos futuros?",
      "¿Planifica el flujo de efectivo del negocio?",
      "¿Da seguimiento a su plan de negocios y lo ajusta cuando es necesario?",
    ],
  },
];

const categoriesWithResponses = computed(() => {
  const data =
    participation.value?.consultingData || participation.value?.monitoringData;
  if (!data?.responses) return [];
  return categories.filter((cat) => data.responses[cat.key]);
});

async function loadParticipation() {
  try {
    loading.value = true;
    const participationRef = doc(
      db,
      "programs",
      programId,
      "participations",
      participationId,
    );

    const participationSnap = await getDoc(participationRef);

    if (participationSnap.exists()) {
      participation.value = {
        id: participationSnap.id,
        ...participationSnap.data(),
      };
      console.log("✅ Participación cargada:", participation.value);

      // Si es form, cargar la actividad para obtener fields[]
      if (
        participation.value.activityType === "activity" ||
        participation.value.activityType === "form"
      ) {
        const activityRef = doc(
          db,
          "programs",
          programId,
          "activities",
          activityId,
        );
        const activitySnap = await getDoc(activityRef);
        if (activitySnap.exists()) {
          activityData.value = { id: activitySnap.id, ...activitySnap.data() };
        }

        // Inicializar respuestas editables
        const resps = participation.value.responses || {};
        Object.entries(resps).forEach(([k, v]) => {
          editableResponses[k] = v;
        });
        originalResponses.value = { ...resps };
      }
    } else {
      console.error(
        "Participación no encontrada en programs/{programId}/participations",
      );
    }
  } catch (error) {
    console.error("Error al cargar participación:", error);
  } finally {
    loading.value = false;
  }
}

function getCategoryLabel(category) {
  const labels = {
    negocioFamilia: "Negocio y Familia",
    marketing: "Marketing",
    controlStock: "Control de Stock",
    compras: "Compras",
    costeo: "Costeo",
    mantenimientoRegistros: "Registros",
    planificacion: "Planificación",
  };
  return labels[category] || category;
}

function getCategoryColorClass(category) {
  const colorClasses = {
    negocioFamilia: "bg-blue-50 text-blue-900 border-blue-200",
    marketing: "bg-green-50 text-green-900 border-green-200",
    controlStock: "bg-purple-50 text-purple-900 border-purple-200",
    compras: "bg-yellow-50 text-yellow-900 border-yellow-200",
    costeo: "bg-red-50 text-red-900 border-red-200",
    mantenimientoRegistros: "bg-indigo-50 text-indigo-900 border-indigo-200",
    planificacion: "bg-pink-50 text-pink-900 border-pink-200",
  };
  return colorClasses[category] || "bg-gray-50 text-gray-900 border-gray-200";
}

function getModalityLabel(modality) {
  const labels = {
    presencial: "Presencial",
    virtual: "Virtual",
    hibrido: "Híbrido",
  };
  return labels[modality] || modality || "N/A";
}

function getModalityClass(modality) {
  const classes = {
    presencial: "bg-blue-50 text-blue-700 border-blue-200",
    virtual: "bg-purple-50 text-purple-700 border-purple-200",
    hibrido: "bg-indigo-50 text-indigo-700 border-indigo-200",
  };
  return classes[modality] || "bg-gray-50 text-gray-700 border-gray-200";
}

function getCohortLabel(score) {
  if (!score) return "Sin Evaluar";
  if (score <= 21) return "Inicial";
  if (score <= 42) return "Intermedio";
  return "Avanzado";
}

function getCohortClass(score) {
  if (!score) return "bg-gray-100 text-gray-700 border border-gray-200";
  if (score <= 21) return "bg-amber-100 text-amber-800 border border-amber-300";
  if (score <= 42) return "bg-blue-100 text-blue-800 border border-blue-300";
  return "bg-green-100 text-green-800 border border-green-300";
}

function getCategoryScore(categoryKey) {
  const data =
    participation.value?.consultingData || participation.value?.monitoringData;
  const responses = data?.responses?.[categoryKey];
  if (!responses) return 0;
  return Object.values(responses).reduce((sum, val) => sum + val, 0);
}

function getQuestionRating(categoryKey, questionIndex) {
  const data =
    participation.value?.consultingData || participation.value?.monitoringData;
  return data?.responses?.[categoryKey]?.[questionIndex] ?? null;
}

function getRatingClass(rating) {
  if (rating === null || rating === undefined)
    return "bg-gray-100 text-gray-600";
  if (rating === 0) return "bg-red-100 text-red-800";
  if (rating === 1) return "bg-orange-100 text-orange-800";
  if (rating === 2) return "bg-blue-100 text-blue-800";
  if (rating === 3) return "bg-green-100 text-green-800";
  return "bg-gray-100 text-gray-600";
}

function getRatingLabel(rating) {
  const labels = {
    0: "Sin conocimiento",
    1: "Conocimiento mínimo y aplicación mínima del conocimiento",
    2: "Mucho conocimiento y cierta aplicación del conocimiento",
    3: "Aplicación del conocimiento",
  };
  return labels[rating] || "No evaluado";
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

function openImageModal(url) {
  selectedImage.value = url;
}

function goBack() {
  router.push({
    name: "ActivityDetail",
    params: { programId, activityId },
  });
}

async function handleDelete() {
  try {
    // Las participaciones se guardan en programs/{programId}/participations
    const participationRef = doc(
      db,
      "programs",
      programId,
      "participations",
      participationId,
    );

    await deleteDoc(participationRef);
    console.log("✅ Asesoría eliminada");
    goBack();
  } catch (error) {
    console.error("Error al eliminar asesoría:", error);
    alert("Error al eliminar la asesoría");
  } finally {
    showDeleteConfirm.value = false;
  }
}

onMounted(() => {
  loadParticipation();
});
</script>
