<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
  >
    <div
      class="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
    >
      <!-- Header -->
      <div
        class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl"
      >
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold text-gray-900">Nueva Actividad</h2>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Body -->
      <div class="px-6 py-6 space-y-6">
        <!-- Tipo de Actividad -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">
            Tipo de Actividad *
          </label>
          <div class="grid grid-cols-3 gap-3">
            <button
              v-for="type in activityTypes"
              :key="type.value"
              @click="form.type = type.value"
              :class="[
                'p-4 border-2 rounded-lg text-left transition-all',
                form.type === type.value
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300',
              ]"
            >
              <div
                :class="[
                  'w-10 h-10 rounded-lg flex items-center justify-center mb-2',
                  type.bgClass,
                ]"
              >
                <svg
                  class="w-6 h-6"
                  :class="type.iconClass"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    :d="type.iconPath"
                  />
                </svg>
              </div>
              <div class="text-sm font-medium text-gray-900">
                {{ type.label }}
              </div>
            </button>
          </div>
        </div>

        <!-- Título -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Título *
          </label>

          <!-- Botones de pre-llenado según tipo -->
          <div v-if="form.type === 'session'" class="mb-3">
            <button
              @click="prefillSession"
              type="button"
              class="text-xs px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              ✨ Usar plantilla: Sesión {{ nextSessionNumber }}
            </button>
          </div>

          <div
            v-if="form.type === 'monitoring'"
            class="mb-3 flex flex-wrap gap-2"
          >
            <button
              @click="prefillMonitoring('pre')"
              type="button"
              class="text-xs px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
            >
              ✨ Pre capacitación
            </button>
            <button
              @click="prefillMonitoring('post')"
              type="button"
              class="text-xs px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
            >
              ✨ Post capacitación
            </button>
            <button
              @click="prefillMonitoring('impact')"
              type="button"
              class="text-xs px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
            >
              ✨ Evaluación de impacto
            </button>
          </div>

          <input
            v-model="form.title"
            type="text"
            placeholder="Ej: Sesión de Marketing Digital"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <p v-if="errors.title" class="text-red-600 text-sm mt-1">
            {{ errors.title }}
          </p>
        </div>

        <!-- Descripción -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Descripción *
          </label>
          <textarea
            v-model="form.description"
            rows="3"
            placeholder="Describe la actividad..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
          ></textarea>
          <p v-if="errors.description" class="text-red-600 text-sm mt-1">
            {{ errors.description }}
          </p>
        </div>

        <!-- Fase -->
        <div v-if="program?.metadata?.phases?.length">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Fase
          </label>
          <select
            v-model="form.phase"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Sin fase asignada</option>
            <option
              v-for="phase in program.metadata.phases"
              :key="phase"
              :value="phase"
            >
              {{ phase }}
            </option>
          </select>
        </div>

        <!-- Fecha Programada -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Fecha Programada
          </label>
          <input
            v-model="form.scheduledDate"
            type="date"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <!-- Es Obligatoria -->
        <div class="flex items-center gap-3">
          <input
            id="isRequired"
            v-model="form.isRequired"
            type="checkbox"
            class="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
          />
          <label for="isRequired" class="text-sm font-medium text-gray-700">
            Actividad obligatoria
          </label>
        </div>

        <!-- Campos específicos para Sesión -->
        <div
          v-if="form.type === 'session'"
          class="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200"
        >
          <h3 class="text-sm font-semibold text-blue-900">
            Configuración de Sesión
          </h3>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Duración (minutos)
              </label>
              <input
                v-model.number="form.sessionConfig.duration"
                type="number"
                min="15"
                placeholder="60"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Máx. Participantes
              </label>
              <input
                v-model.number="form.sessionConfig.maxParticipants"
                type="number"
                min="1"
                placeholder="30"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Ubicación
            </label>
            <input
              v-model="form.sessionConfig.location"
              type="text"
              placeholder="Ej: Sala de capacitación"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Link de Reunión (opcional)
            </label>
            <input
              v-model="form.sessionConfig.meetingLink"
              type="url"
              placeholder="https://zoom.us/j/..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        <!-- Campos específicos para Monitoreo -->
        <div
          v-if="form.type === 'monitoring'"
          class="space-y-4 p-4 bg-purple-50 rounded-lg border border-purple-200"
        >
          <h3 class="text-sm font-semibold text-purple-900">
            Configuración de Monitoreo
          </h3>

          <div class="flex items-center gap-3">
            <input
              id="requiredEvidence"
              v-model="form.requiredEvidence"
              type="checkbox"
              class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <label
              for="requiredEvidence"
              class="text-sm font-medium text-gray-700"
            >
              Requerir evidencias (fotos)
            </label>
          </div>

          <div class="text-sm text-gray-600 bg-white p-3 rounded-lg">
            <p class="font-medium mb-1">El formulario de monitoreo incluye:</p>
            <ul class="list-disc list-inside space-y-1">
              <li>7 categorías de evaluación</li>
              <li>21 preguntas en total (3 por categoría)</li>
              <li>Escala de calificación del 1 al 5</li>
              <li>Cálculo automático de scores</li>
            </ul>
          </div>
        </div>

        <!-- Campos específicos para Evaluación -->
        <div
          v-if="form.type === 'assessment'"
          class="space-y-4 p-4 bg-orange-50 rounded-lg border border-orange-200"
        >
          <h3 class="text-sm font-semibold text-orange-900">
            Configuración de Evaluación
          </h3>
          <p class="text-sm text-gray-600">
            Las evaluaciones se configurarán en una versión futura del sistema.
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div
        class="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-2xl flex items-center justify-end gap-3"
      >
        <button
          @click="$emit('close')"
          class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Cancelar
        </button>
        <button
          @click="handleSubmit"
          :disabled="submitting"
          class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <div
            v-if="submitting"
            class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"
          ></div>
          <span>{{ submitting ? "Creando..." : "Crear Actividad" }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import { useActivities } from "@/composables/useActivities";
import { Timestamp } from "firebase/firestore";

const props = defineProps({
  program: {
    type: Object,
    required: true,
  },
  activities: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["close", "created"]);

const { createActivity } = useActivities();

const submitting = ref(false);
const errors = ref({});

const activityTypes = [
  {
    value: "session",
    label: "Sesión",
    bgClass: "bg-blue-100",
    iconClass: "text-blue-600",
    iconPath:
      "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  },
  {
    value: "monitoring",
    label: "Monitoreo",
    bgClass: "bg-purple-100",
    iconClass: "text-purple-600",
    iconPath:
      "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
  },
  {
    value: "assessment",
    label: "Evaluación",
    bgClass: "bg-orange-100",
    iconClass: "text-orange-600",
    iconPath:
      "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
];

const form = reactive({
  type: "session",
  title: "",
  description: "",
  phase: "",
  scheduledDate: "",
  isRequired: false,
  sessionConfig: {
    duration: 60,
    location: "",
    meetingLink: "",
    maxParticipants: null,
  },
  requiredEvidence: false,
});

// Calcular el número de la próxima sesión
const nextSessionNumber = computed(() => {
  const sessionActivities = props.activities.filter(
    (a) => a.type === "session"
  );
  return sessionActivities.length + 1;
});

// Pre-llenar sesión numerada
function prefillSession() {
  form.title = `Sesión ${nextSessionNumber.value}`;
  form.description = `Sesión de capacitación #${nextSessionNumber.value}`;
  form.isRequired = true;
}

// Pre-llenar monitoreos predefinidos
function prefillMonitoring(type) {
  const templates = {
    pre: {
      title: "Evaluación de pre capacitación",
      description:
        "Evaluación inicial para medir el estado del negocio antes de iniciar el programa de capacitación.",
    },
    post: {
      title: "Evaluación post capacitación",
      description:
        "Evaluación intermedia para medir el progreso del negocio durante el programa de capacitación.",
    },
    impact: {
      title: "Evaluación de impacto",
      description:
        "Evaluación final para medir el impacto del programa de capacitación en el negocio.",
    },
  };

  const template = templates[type];
  if (template) {
    form.title = template.title;
    form.description = template.description;
    form.isRequired = true;
    form.requiredEvidence = true;
  }
}

function validateForm() {
  errors.value = {};

  if (!form.title.trim()) {
    errors.value.title = "El título es obligatorio";
  }

  if (!form.description.trim()) {
    errors.value.description = "La descripción es obligatoria";
  }

  return Object.keys(errors.value).length === 0;
}

async function handleSubmit() {
  if (!validateForm()) {
    return;
  }

  submitting.value = true;

  try {
    const activityData = {
      type: form.type,
      title: form.title.trim(),
      description: form.description.trim(),
      phase: form.phase || null,
      isRequired: form.isRequired,
    };

    // Agregar fecha si está definida
    if (form.scheduledDate) {
      const date = new Date(form.scheduledDate + "T00:00:00");
      activityData.scheduledDate = Timestamp.fromDate(date);
    }

    // Agregar configuración específica según tipo
    if (form.type === "session") {
      activityData.sessionConfig = {
        duration: form.sessionConfig.duration || 60,
        location: form.sessionConfig.location || "",
        meetingLink: form.sessionConfig.meetingLink || null,
        maxParticipants: form.sessionConfig.maxParticipants || null,
      };
    } else if (form.type === "monitoring") {
      activityData.requiredEvidence = form.requiredEvidence;
    }

    const createdActivity = await createActivity(
      props.program.id,
      activityData
    );

    emit("created", createdActivity);
  } catch (error) {
    console.error("Error al crear actividad:", error);
    alert("Error al crear la actividad. Por favor intenta de nuevo.");
  } finally {
    submitting.value = false;
  }
}
</script>
