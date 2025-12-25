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
          <h2 class="text-2xl font-bold text-gray-900">
            {{ editMode ? "Editar Actividad" : "Nueva Actividad" }}
          </h2>
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
              @click="!editMode && (form.type = type.value)"
              :disabled="editMode"
              :class="[
                'p-4 border-2 rounded-lg text-left transition-all',
                form.type === type.value
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300',
                editMode ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
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

          <div v-if="form.type === 'event'" class="mb-3 flex flex-wrap gap-2">
            <button
              @click="prefillEvent('feria')"
              type="button"
              class="text-xs px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
            >
              ✨ Feria/Exposición
            </button>
            <button
              @click="prefillEvent('taller')"
              type="button"
              class="text-xs px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
            >
              ✨ Taller/Workshop
            </button>
            <button
              @click="prefillEvent('conferencia')"
              type="button"
              class="text-xs px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
            >
              ✨ Conferencia
            </button>
            <button
              @click="prefillEvent('networking')"
              type="button"
              class="text-xs px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
            >
              ✨ Networking
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

        <!-- Link de Google Drive (solo para Sesión y Evento) -->
        <div v-if="form.type === 'session' || form.type === 'event'">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Link de Google Drive (opcional)
          </label>
          <input
            v-model="form.driveLink"
            type="url"
            placeholder="https://drive.google.com/..."
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

        <!-- Campos específicos para Evento -->
        <div
          v-if="form.type === 'event'"
          class="space-y-4 p-4 bg-orange-50 rounded-lg border border-orange-200"
        >
          <h3 class="text-sm font-semibold text-orange-900">
            Configuración de Evento
          </h3>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Fecha de inicio *
            </label>
            <input
              v-model="form.startDate"
              type="date"
              :min="getTodayDate()"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <p v-if="errors.startDate" class="text-red-600 text-sm mt-1">
              {{ errors.startDate }}
            </p>
          </div>

          <div class="flex items-center gap-3">
            <input
              id="isSingleDay"
              v-model="form.isSingleDay"
              type="checkbox"
              class="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
            />
            <label for="isSingleDay" class="text-sm font-medium text-gray-700">
              Evento de un solo día
            </label>
          </div>

          <div v-if="!form.isSingleDay">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Fecha de cierre *
            </label>
            <input
              v-model="form.endDate"
              type="date"
              :min="form.startDate"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <p v-if="errors.endDate" class="text-red-600 text-sm mt-1">
              {{ errors.endDate }}
            </p>
          </div>
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
          <span>{{
            submitting
              ? editMode
                ? "Guardando..."
                : "Creando..."
              : editMode
              ? "Guardar Cambios"
              : "Crear Actividad"
          }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from "vue";
import { useActivities } from "@/composables/useActivities";

const props = defineProps({
  program: {
    type: Object,
    required: true,
  },
  activities: {
    type: Array,
    default: () => [],
  },
  editMode: {
    type: Boolean,
    default: false,
  },
  activityToEdit: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["close", "created"]);

const { createActivity, updateActivity } = useActivities();

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
    value: "event",
    label: "Evento",
    bgClass: "bg-orange-100",
    iconClass: "text-orange-600",
    iconPath:
      "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
  },
];

const form = reactive({
  type: "session",
  title: "",
  description: "",
  isRequired: false,
  driveLink: "",
  requiredEvidence: false,
  // Campos para eventos
  startDate: "",
  endDate: "",
  isSingleDay: true,
});

// Calcular el número de la próxima sesión
const nextSessionNumber = computed(() => {
  const sessionActivities = props.activities.filter(
    (a) => a.type === "session"
  );
  return sessionActivities.length + 1;
});

// Obtener fecha de hoy en formato YYYY-MM-DD
function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Limpiar campos del formulario
function clearFormFields() {
  form.title = "";
  form.description = "";
  form.driveLink = "";
  form.isRequired = false;
  form.requiredEvidence = false;
  form.startDate = "";
  form.endDate = "";
  form.isSingleDay = true;
  errors.value = {};
}

// Observar cambios en el tipo de actividad para limpiar el formulario
watch(
  () => form.type,
  () => {
    if (!props.editMode) {
      clearFormFields();
    }
  }
);

// Inicializar formulario en modo edición
watch(
  () => props.activityToEdit,
  (activity) => {
    if (props.editMode && activity) {
      form.type = activity.type;
      form.title = activity.title || "";
      form.description = activity.description || "";
      form.isRequired = activity.isRequired || false;
      form.driveLink = activity.driveLink || "";
      form.requiredEvidence = activity.requiredEvidence || false;

      // Campos específicos para eventos
      if (activity.type === "event") {
        // Convertir Timestamp a formato de fecha si es necesario
        if (activity.startDate) {
          const startDate = activity.startDate.toDate
            ? activity.startDate.toDate()
            : new Date(activity.startDate);
          form.startDate = startDate.toISOString().split("T")[0];
        }
        if (activity.endDate) {
          const endDate = activity.endDate.toDate
            ? activity.endDate.toDate()
            : new Date(activity.endDate);
          form.endDate = endDate.toISOString().split("T")[0];
        }
        form.isSingleDay = activity.isSingleDay || false;
      }
    }
  },
  { immediate: true }
);

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

// Pre-llenar eventos predefinidos
function prefillEvent(type) {
  const templates = {
    feria: {
      title: "Feria de Emprendedores",
      description:
        "Evento de exposición y venta donde los participantes presentan sus productos y servicios al público.",
    },
    taller: {
      title: "Taller de Desarrollo Empresarial",
      description:
        "Taller práctico para el desarrollo de habilidades específicas de emprendimiento y gestión empresarial.",
    },
    conferencia: {
      title: "Conferencia Motivacional",
      description:
        "Charla inspiracional con expertos del sector para motivar y compartir experiencias de éxito.",
    },
    networking: {
      title: "Encuentro de Networking",
      description:
        "Evento de conexión entre emprendedores para generar alianzas, colaboraciones y oportunidades de negocio.",
    },
  };

  const template = templates[type];
  if (template) {
    form.title = template.title;
    form.description = template.description;
    form.isRequired = false;
    form.startDate = getTodayDate();
    form.endDate = getTodayDate();
    form.isSingleDay = true;
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

  // Validaciones específicas para eventos
  if (form.type === "event") {
    if (!form.startDate) {
      errors.value.startDate = "La fecha de inicio es obligatoria";
    }

    if (!form.isSingleDay && !form.endDate) {
      errors.value.endDate = "La fecha de cierre es obligatoria";
    }

    if (
      !form.isSingleDay &&
      form.startDate &&
      form.endDate &&
      new Date(form.endDate) < new Date(form.startDate)
    ) {
      errors.value.endDate =
        "La fecha de cierre debe ser posterior a la fecha de inicio";
    }
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
      isRequired: form.isRequired,
    };

    // Agregar driveLink si está definido (solo para session y event)
    if (
      (form.type === "session" || form.type === "event") &&
      form.driveLink.trim()
    ) {
      activityData.driveLink = form.driveLink.trim();
    }

    // Agregar configuración específica para monitoring
    if (form.type === "monitoring") {
      activityData.requiredEvidence = form.requiredEvidence;
    }

    // Agregar configuración específica para eventos
    if (form.type === "event") {
      activityData.startDate = form.startDate;
      activityData.endDate = form.isSingleDay ? form.startDate : form.endDate;
      activityData.isSingleDay = form.isSingleDay;
    }

    let result;
    if (props.editMode && props.activityToEdit) {
      // Modo edición: actualizar actividad existente
      await updateActivity(
        props.program.id,
        props.activityToEdit.id,
        activityData
      );
      result = { ...props.activityToEdit, ...activityData };
    } else {
      // Modo creación: crear nueva actividad
      result = await createActivity(props.program.id, activityData);
    }

    emit("created", result);
  } catch (error) {
    console.error("Error al guardar actividad:", error);
    alert(
      `Error al ${
        props.editMode ? "actualizar" : "crear"
      } la actividad. Por favor intenta de nuevo.`
    );
  } finally {
    submitting.value = false;
  }
}
</script>
