<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
  >
    <div
      class="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
    >
      <!-- Header -->
      <div
        class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl z-10"
      >
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">
              Formulario de Monitoreo
            </h2>
            <p class="text-sm text-gray-600 mt-1">{{ activity.title }}</p>
          </div>
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
      <div class="px-6 py-6 space-y-8">
        <!-- Metadata Section -->
        <div class="bg-purple-50 rounded-lg p-6 border border-purple-200">
          <h3 class="text-lg font-semibold text-purple-900 mb-4">
            Información del Monitoreo
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Participante -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Participante *
              </label>
              <select
                v-model="form.userId"
                @change="handleParticipantChange"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Seleccionar participante</option>
                <option
                  v-for="participant in participants"
                  :key="participant.userId"
                  :value="participant.userId"
                >
                  {{ participant.userName }} - {{ participant.businessName }}
                </option>
              </select>
              <p v-if="errors.userId" class="text-red-600 text-sm mt-1">
                {{ errors.userId }}
              </p>
            </div>

            <!-- Modalidad -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Modalidad *
              </label>
              <select
                v-model="form.modality"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Seleccionar modalidad</option>
                <option value="presencial">Presencial</option>
                <option value="virtual">Virtual</option>
                <option value="hibrido">Híbrido</option>
              </select>
              <p v-if="errors.modality" class="text-red-600 text-sm mt-1">
                {{ errors.modality }}
              </p>
            </div>

            <!-- Fecha de Monitoreo -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Fecha del Monitoreo *
              </label>
              <input
                v-model="form.monitoringDate"
                type="date"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p v-if="errors.monitoringDate" class="text-red-600 text-sm mt-1">
                {{ errors.monitoringDate }}
              </p>
            </div>
          </div>
        </div>

        <!-- Rating Legend -->
        <div
          class="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-5 border border-purple-200"
        >
          <div class="flex items-center justify-between">
            <div>
              <h4 class="text-sm font-semibold text-gray-900 mb-3">
                Escala de Evaluación
              </h4>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div class="flex items-center gap-2">
                  <div
                    class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-sm text-gray-700"
                  >
                    0
                  </div>
                  <span class="text-xs text-gray-600">Sin conocimiento</span>
                </div>
                <div class="flex items-center gap-2">
                  <div
                    class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-sm text-gray-700"
                  >
                    1
                  </div>
                  <span class="text-xs text-gray-600">Conocimiento mínimo</span>
                </div>
                <div class="flex items-center gap-2">
                  <div
                    class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-sm text-gray-700"
                  >
                    2
                  </div>
                  <span class="text-xs text-gray-600">Buen conocimiento</span>
                </div>
                <div class="flex items-center gap-2">
                  <div
                    class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-sm text-gray-700"
                  >
                    3
                  </div>
                  <span class="text-xs text-gray-600">Aplicación completa</span>
                </div>
              </div>
            </div>
            <button
              @click="prefillForm"
              class="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium flex items-center gap-2"
              title="Rellenar formulario para pruebas"
            >
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
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Prefill
            </button>
          </div>
        </div>

        <!-- Categorías y Preguntas -->
        <div
          v-for="category in categories"
          :key="category.key"
          class="border border-gray-200 rounded-lg overflow-hidden"
        >
          <!-- Category Header -->
          <div
            :class="['px-6 py-4 border-b border-gray-200', category.bgClass]"
          >
            <h3 class="text-lg font-semibold" :class="category.textClass">
              {{ category.label }}
            </h3>
            <p class="text-sm" :class="category.descClass">
              {{ category.description }}
            </p>
          </div>

          <!-- Questions -->
          <div class="p-6 space-y-6">
            <div
              v-for="(question, index) in category.questions"
              :key="index"
              class="pb-6 border-b border-gray-100 last:border-0 last:pb-0"
            >
              <p class="text-sm font-medium text-gray-900 mb-3">
                {{ index + 1 }}. {{ question }}
              </p>

              <!-- Rating Scale -->
              <div class="flex items-center gap-2">
                <button
                  v-for="rating in [0, 1, 2, 3]"
                  :key="rating"
                  @click="setRating(category.key, index, rating)"
                  :title="getRatingTooltip(rating)"
                  :class="[
                    'w-12 h-12 rounded-lg font-semibold text-sm transition-all',
                    getRating(category.key, index) === rating
                      ? 'bg-purple-600 text-white ring-2 ring-purple-600 ring-offset-2'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                  ]"
                >
                  {{ rating }}
                </button>
              </div>
            </div>
          </div>

          <!-- Category Comments -->
          <div v-if="hasCategoryResponses(category.key)" class="px-6 pb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Comentarios sobre {{ category.label }} (opcional)
            </label>
            <textarea
              v-model="form.categoryComments[category.key]"
              rows="2"
              :placeholder="`Observaciones específicas sobre ${category.label}...`"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
            ></textarea>
          </div>
        </div>

        <!-- Evidencias (si es requerido) -->
        <div
          v-if="activity.requiredEvidence"
          class="border border-gray-200 rounded-lg p-6"
        >
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            Evidencias Fotográficas
          </h3>
          <p class="text-sm text-gray-600 mb-4">
            Sube fotos que documenten la visita de monitoreo
          </p>

          <div class="space-y-3">
            <input
              type="file"
              accept="image/*"
              multiple
              @change="handleFileUpload"
              class="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
            />

            <div
              v-if="form.evidenceFiles.length"
              class="grid grid-cols-3 gap-3"
            >
              <div
                v-for="(file, index) in form.evidenceFiles"
                :key="index"
                class="relative aspect-square bg-gray-100 rounded-lg overflow-hidden"
              >
                <img
                  :src="getFilePreview(file)"
                  :alt="`Evidencia ${index + 1}`"
                  class="w-full h-full object-cover"
                />
                <button
                  @click="removeFile(index)"
                  class="absolute top-1 right-1 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Comentarios Adicionales -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Comentarios Adicionales
          </label>
          <textarea
            v-model="form.additionalComments"
            rows="4"
            placeholder="Observaciones, recomendaciones o notas adicionales..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          ></textarea>
        </div>

        <!-- Score Preview -->
        <div
          v-if="hasAnyRating"
          class="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200"
        >
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            Vista Previa de Resultados
          </h3>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div
              v-for="category in categories"
              :key="category.key"
              class="bg-white rounded-lg p-3"
            >
              <p class="text-xs text-gray-600 mb-1">{{ category.label }}</p>
              <p class="text-2xl font-bold text-purple-600">
                {{ calculateCategoryScore(category.key) }}
              </p>
            </div>
          </div>

          <div class="bg-white rounded-lg p-4 text-center">
            <p class="text-sm text-gray-600 mb-1">Score General</p>
            <p class="text-4xl font-bold text-purple-600">
              {{ calculateOverallScore() }}
            </p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div
        class="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-2xl flex items-center justify-between"
      >
        <button
          @click="$emit('close')"
          class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Cancelar
        </button>

        <button
          @click="handleSubmit()"
          :disabled="submitting"
          class="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <div
            v-if="submitting"
            class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"
          ></div>
          <span>{{ submitting ? "Enviando..." : "Enviar Monitoreo" }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useActivities } from "@/composables/useActivities";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "@/firebaseInit";
import { Timestamp } from "firebase/firestore";

const props = defineProps({
  programId: {
    type: String,
    required: true,
  },
  activity: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["close", "submitted"]);

const { submitMonitoring } = useActivities();

const submitting = ref(false);
const errors = ref({});
const participants = ref([]);

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

const form = reactive({
  userId: "",
  userName: "",
  businessId: "",
  businessName: "",
  modality: "",
  monitoringDate: "",
  responses: {
    negocioFamilia: {},
    marketing: {},
    controlStock: {},
    compras: {},
    costeo: {},
    mantenimientoRegistros: {},
    planificacion: {},
  },
  categoryComments: {
    negocioFamilia: "",
    marketing: "",
    controlStock: "",
    compras: "",
    costeo: "",
    mantenimientoRegistros: "",
    planificacion: "",
  },
  evidenceFiles: [],
  additionalComments: "",
});

const hasAnyRating = computed(() => {
  return Object.values(form.responses).some(
    (category) => Object.keys(category).length > 0
  );
});

function getRating(categoryKey, questionIndex) {
  return form.responses[categoryKey]?.[questionIndex] !== undefined
    ? form.responses[categoryKey][questionIndex]
    : null;
}

function hasCategoryResponses(categoryKey) {
  const responses = form.responses[categoryKey];
  return responses && Object.keys(responses).length > 0;
}

function getRatingTooltip(rating) {
  const tooltips = {
    0: "Sin conocimiento",
    1: "Conocimiento mínimo y aplicación mínima del conocimiento",
    2: "Mucho conocimiento y cierta aplicación del conocimiento",
    3: "Aplicación del conocimiento",
  };
  return tooltips[rating];
}

function prefillForm() {
  // Seleccionar primer participante si hay
  if (participants.value.length > 0) {
    form.userId = participants.value[0].userId;
    handleParticipantChange();
  }

  // Llenar modalidad y fecha
  form.modality = "presencial";
  form.monitoringDate = new Date().toISOString().split("T")[0];

  // Llenar respuestas aleatorias para todas las categorías
  categories.forEach((category) => {
    category.questions.forEach((_, index) => {
      const randomRating = Math.floor(Math.random() * 4); // 0-3
      setRating(category.key, index, randomRating);
    });
    // Agregar comentario de ejemplo
    form.categoryComments[
      category.key
    ] = `Comentario de prueba para ${category.label}`;
  });

  // Agregar comentarios adicionales
  form.additionalComments =
    "Este es un comentario adicional de prueba para verificar el funcionamiento del formulario.";

  console.log("✅ Formulario prellenado para pruebas");
}

function setRating(categoryKey, questionIndex, rating) {
  if (!form.responses[categoryKey]) {
    form.responses[categoryKey] = {};
  }
  form.responses[categoryKey][questionIndex] = rating;
}

const calculateCategoryScore = (categoryKey) => {
  const responses = form.responses[categoryKey];
  if (!responses || Object.keys(responses).length === 0) return 0;

  const values = Object.values(responses);
  // Sumatoria directa de las 3 preguntas (rango 0-9 por categoría)
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum;
};

const calculateOverallScore = () => {
  // Sumatoria total de todas las categorías (máximo 7 × 9 = 63)
  const sum = categories.reduce((total, category) => {
    return total + calculateCategoryScore(category.key);
  }, 0);
  return sum;
};

function handleParticipantChange() {
  const participant = participants.value.find((p) => p.userId === form.userId);
  if (participant) {
    form.userName = participant.userName;
    form.businessId = participant.businessId;
    form.businessName = participant.businessName;
  }
}

function handleFileUpload(event) {
  const files = Array.from(event.target.files);
  form.evidenceFiles.push(...files);
}

function removeFile(index) {
  form.evidenceFiles.splice(index, 1);
}

function getFilePreview(file) {
  return URL.createObjectURL(file);
}

function validateForm() {
  errors.value = {};

  if (!form.userId) {
    errors.value.userId = "Selecciona un participante";
  }

  if (!form.modality) {
    errors.value.modality = "Selecciona una modalidad";
  }

  if (!form.monitoringDate) {
    errors.value.monitoringDate = "Selecciona la fecha del monitoreo";
  }

  // Validar que al menos una pregunta esté respondida
  const hasResponses = Object.values(form.responses).some(
    (category) => Object.keys(category).length > 0
  );

  if (!hasResponses) {
    alert("Debes responder al menos una pregunta");
    return false;
  }

  return Object.keys(errors.value).length === 0;
}

async function handleSubmit() {
  if (!validateForm()) {
    return;
  }

  submitting.value = true;

  try {
    // TODO: Si hay evidenceFiles, subirlas a Storage primero
    // Por ahora, simularemos URLs vacías
    const evidenceUrls = [];

    const monitoringData = {
      userId: form.userId,
      userName: form.userName,
      businessId: form.businessId,
      businessName: form.businessName,
      modality: form.modality,
      monitoringDate: Timestamp.fromDate(new Date(form.monitoringDate)),
      responses: form.responses,
      categoryComments: form.categoryComments,
      evidenceUrls,
      additionalComments: form.additionalComments,
    };

    await submitMonitoring(props.programId, props.activity.id, monitoringData);

    emit("submitted");
  } catch (error) {
    console.error("Error al enviar monitoreo:", error);
    alert("Error al enviar el monitoreo. Por favor intenta de nuevo.");
  } finally {
    submitting.value = false;
  }
}

async function loadProgramParticipants() {
  try {
    const participantsRef = collection(
      db,
      "programs",
      props.programId,
      "participants"
    );
    const q = query(participantsRef);
    const snapshot = await getDocs(q);

    participants.value = snapshot.docs
      .map((doc) => ({
        userId: doc.id,
        ...doc.data(),
      }))
      .filter((p) => p.status === "active");

    console.log(
      `✅ ${participants.value.length} participantes cargados para monitoreo`
    );
  } catch (error) {
    console.error("Error al cargar participantes:", error);
  }
}

onMounted(() => {
  loadProgramParticipants();

  // Establecer fecha por defecto a hoy
  form.monitoringDate = new Date().toISOString().split("T")[0];
});
</script>
