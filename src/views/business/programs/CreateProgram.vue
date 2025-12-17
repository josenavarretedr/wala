<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <button
          @click="goBack"
          class="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <NavArrowLeft class="w-5 h-5" />
          <span class="text-sm font-medium">Volver a Programas</span>
        </button>

        <div class="flex items-center gap-4">
          <div
            class="flex items-center justify-center w-16 h-16 bg-teal-100 rounded-2xl"
          >
            <Community class="w-8 h-8 text-teal-600" />
          </div>
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Crear Programa</h1>
            <p class="text-gray-600 mt-1">
              Define un nuevo programa de acompañamiento empresarial
            </p>
          </div>
        </div>
      </div>

      <!-- Botón de Pre-llenado (Testing) -->
      <div class="mb-4">
        <button
          @click="fillDemoData"
          type="button"
          class="w-full px-4 py-2.5 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 border-2 border-purple-300 border-dashed"
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
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          Pre-llenar datos de prueba (Testing)
        </button>
      </div>

      <!-- Form Card -->
      <div
        class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
      >
        <form @submit.prevent="handleSubmit" class="p-8 space-y-8">
          <!-- Información Básica -->
          <section>
            <h2
              class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"
            >
              <div class="w-2 h-2 bg-teal-500 rounded-full"></div>
              Información Básica
            </h2>

            <div class="space-y-5">
              <ProgramFormInput
                id="program-name"
                v-model="formData.name"
                label="Nombre del Programa"
                placeholder="Ej: Fortalecimiento Empresarial 2025"
                required
                hint="Nombre descriptivo que identifique el programa"
                :error="errors.name"
              />

              <ProgramFormInput
                id="program-organization"
                v-model="formData.organizationName"
                label="Nombre de la Organización"
                placeholder="Ej: CARE Perú"
                required
                hint="ONG o institución que gestiona el programa"
                :error="errors.organizationName"
              />

              <ProgramFormTextarea
                id="program-description"
                v-model="formData.description"
                label="Descripción"
                placeholder="Describe los objetivos, metodología y alcance del programa..."
                required
                :rows="5"
                hint="Proporciona una descripción detallada que ayude a los participantes a entender el programa"
                :error="errors.description"
              />
            </div>
          </section>

          <!-- Duración y Fechas -->
          <section>
            <h2
              class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"
            >
              <div class="w-2 h-2 bg-teal-500 rounded-full"></div>
              Duración y Fechas
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
              <ProgramFormInput
                id="program-duration"
                v-model="formData.duration"
                label="Duración"
                placeholder="Ej: 6 meses"
                required
                hint="Duración total del programa"
                :error="errors.duration"
              />

              <ProgramFormDatePicker
                id="program-start-date"
                v-model="formData.startDate"
                label="Fecha de Inicio"
                required
                :min="todayDate"
                hint="Inicio del programa"
                :error="errors.startDate"
              />

              <ProgramFormDatePicker
                id="program-end-date"
                v-model="formData.endDate"
                label="Fecha de Fin"
                required
                :min="formData.startDate || todayDate"
                hint="Finalización del programa"
                :error="errors.endDate"
              />
            </div>
          </section>

          <!-- Fases del Programa -->
          <section>
            <h2
              class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"
            >
              <div class="w-2 h-2 bg-teal-500 rounded-full"></div>
              Estructura del Programa
            </h2>

            <ProgramFormPhaseManager v-model="formData.phases" />
          </section>

          <!-- Estado Inicial -->
          <section>
            <h2
              class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"
            >
              <div class="w-2 h-2 bg-teal-500 rounded-full"></div>
              Estado Inicial
            </h2>

            <div
              class="flex items-center gap-3 bg-teal-50 px-5 py-4 rounded-xl border border-teal-200"
            >
              <input
                id="program-is-active"
                v-model="formData.isActive"
                type="checkbox"
                class="w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
              />
              <label for="program-is-active" class="flex-1 cursor-pointer">
                <span class="text-sm font-medium text-gray-900"
                  >Activar programa inmediatamente</span
                >
                <p class="text-xs text-gray-600 mt-0.5">
                  Los negocios podrán unirse al programa usando códigos de
                  invitación
                </p>
              </label>
            </div>
          </section>

          <!-- Códigos de Acceso -->
          <section>
            <h2
              class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"
            >
              <div class="w-2 h-2 bg-teal-500 rounded-full"></div>
              Códigos de Acceso
            </h2>

            <div class="space-y-5">
              <div>
                <ProgramFormInput
                  id="program-code-user"
                  v-model="formData.codUser"
                  label="Código para Usuarios"
                  placeholder="Ej: CAREP2025"
                  hint="Código que los negocios usarán para unirse al programa"
                  :error="errors.codUser"
                />
                <button
                  v-if="
                    suggestedCodeUser && formData.codUser !== suggestedCodeUser
                  "
                  @click="applySuggestedCodeUser"
                  type="button"
                  class="mt-2 text-xs text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
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
                  Usar sugerencia: {{ suggestedCodeUser }}
                </button>
              </div>

              <div>
                <ProgramFormInput
                  id="program-code-team"
                  v-model="formData.codTeam"
                  label="Código para Facilitadores"
                  placeholder="Ej: CAREP2025-F"
                  hint="Código que los facilitadores usarán para unirse al equipo del programa"
                  :error="errors.codTeam"
                />
                <button
                  v-if="
                    suggestedCodeTeam && formData.codTeam !== suggestedCodeTeam
                  "
                  @click="applySuggestedCodeTeam"
                  type="button"
                  class="mt-2 text-xs text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
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
                  Usar sugerencia: {{ suggestedCodeTeam }}
                </button>
              </div>

              <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p class="text-xs text-blue-700">
                  💡 <strong>Tip:</strong> Los códigos son opcionales pero
                  recomendados. Puedes agregarlos más tarde si lo prefieres.
                </p>
              </div>
            </div>
          </section>

          <!-- Error General -->
          <div
            v-if="errors.general"
            class="bg-red-50 border border-red-200 rounded-xl p-4"
          >
            <p class="text-sm text-red-700 flex items-center gap-2">
              <WarningTriangle class="w-5 h-5" />
              {{ errors.general }}
            </p>
          </div>

          <!-- Actions -->
          <div
            class="flex items-center justify-end gap-3 pt-4 border-t border-gray-200"
          >
            <button
              @click="goBack"
              type="button"
              :disabled="loading"
              class="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              :disabled="loading || !isFormValid"
              class="px-8 py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Check v-if="!loading" class="w-5 h-5" />
              <div
                v-else
                class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
              ></div>
              {{ loading ? "Creando..." : "Crear Programa" }}
            </button>
          </div>
        </form>
      </div>

      <!-- Preview Card (opcional, para mostrar resumen) -->
      <div
        v-if="showPreview"
        class="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6"
      >
        <h3 class="text-sm font-semibold text-blue-900 mb-3">Vista Previa</h3>
        <div class="text-sm text-blue-800 space-y-2">
          <p><strong>Programa:</strong> {{ formData.name }}</p>
          <p><strong>Organización:</strong> {{ formData.organizationName }}</p>
          <p><strong>Duración:</strong> {{ formData.duration }}</p>
          <p>
            <strong>Fechas:</strong> {{ formData.startDate }} →
            {{ formData.endDate }}
          </p>
          <p>
            <strong>Fases:</strong>
            {{ formData.phases.filter((p) => p).length }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { Community, NavArrowLeft, Check, WarningTriangle } from "@iconoir/vue";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebaseInit";
import { useAuthStore } from "@/stores/authStore";
import { useUserStore } from "@/stores/useUserStore";

// Componentes
import ProgramFormInput from "@/components/programs/ProgramFormInput.vue";
import ProgramFormTextarea from "@/components/programs/ProgramFormTextarea.vue";
import ProgramFormDatePicker from "@/components/programs/ProgramFormDatePicker.vue";
import ProgramFormPhaseManager from "@/components/programs/ProgramFormPhaseManager.vue";

const router = useRouter();
const authStore = useAuthStore();
const userStore = useUserStore();

// ═══════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════

const loading = ref(false);
const showPreview = ref(false);

const formData = ref({
  name: "",
  organizationName: "",
  description: "",
  duration: "",
  startDate: "",
  endDate: "",
  phases: ["baseline", "training", "implementation", "evaluation"],
  isActive: true,
  codUser: "",
  codTeam: "",
});

const errors = ref({
  name: "",
  organizationName: "",
  description: "",
  duration: "",
  startDate: "",
  endDate: "",
  codUser: "",
  codTeam: "",
  general: "",
});

// ═══════════════════════════════════════════════════════════
// COMPUTED
// ═══════════════════════════════════════════════════════════

const todayDate = computed(() => {
  return new Date().toISOString().split("T")[0];
});

const isFormValid = computed(() => {
  return (
    formData.value.name.trim() &&
    formData.value.organizationName.trim() &&
    formData.value.description.trim() &&
    formData.value.duration.trim() &&
    formData.value.startDate &&
    formData.value.endDate &&
    formData.value.phases.filter((p) => p.trim()).length > 0
  );
});

const suggestedCodeUser = computed(() => {
  if (!formData.value.organizationName.trim()) return "";
  const orgName = formData.value.organizationName
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/[^A-Z0-9]/g, "");
  return `${orgName}2025`;
});

const suggestedCodeTeam = computed(() => {
  if (!suggestedCodeUser.value) return "";
  return `${suggestedCodeUser.value}-T`;
});

// ═══════════════════════════════════════════════════════════
// WATCHERS - Auto-aplicar sugerencias
// ═══════════════════════════════════════════════════════════

watch(
  () => formData.value.organizationName,
  (newOrgName) => {
    if (newOrgName.trim()) {
      // Auto-aplicar sugerencias cuando cambia el nombre de la organización
      formData.value.codUser = suggestedCodeUser.value;
      formData.value.codTeam = suggestedCodeTeam.value;
    } else {
      // Limpiar códigos si se borra el nombre de la organización
      formData.value.codUser = "";
      formData.value.codTeam = "";
    }
  }
);

// ═══════════════════════════════════════════════════════════
// METHODS
// ═══════════════════════════════════════════════════════════

function applySuggestedCodeUser() {
  if (suggestedCodeUser.value) {
    formData.value.codUser = suggestedCodeUser.value;
  }
}

function applySuggestedCodeTeam() {
  if (suggestedCodeTeam.value) {
    formData.value.codTeam = suggestedCodeTeam.value;
  }
}

function fillDemoData() {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() + 7); // 7 días desde hoy

  const endDate = new Date(startDate);
  endDate.setMonth(startDate.getMonth() + 6); // 6 meses después

  formData.value = {
    name: "Fortalecimiento Empresarial - Demo " + today.getFullYear(),
    organizationName: "CARE Perú",
    description:
      "Programa de acompañamiento de 6 meses para fortalecer capacidades empresariales en gestión financiera, marketing y operaciones. Incluye talleres prácticos, asesorías personalizadas y networking con otros emprendedores.",
    duration: "6 meses",
    codUser: "USER2025",
    codTeam: "TEAM2025",
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
    phases: ["baseline", "training", "implementation", "evaluation"],
    isActive: true,
  };

  console.log("✅ Datos de prueba cargados");
}

function validateForm() {
  // Reset errors
  errors.value = {
    name: "",
    organizationName: "",
    description: "",
    duration: "",
    startDate: "",
    endDate: "",
    general: "",
  };

  let isValid = true;

  // Validar nombre
  if (!formData.value.name.trim()) {
    errors.value.name = "El nombre del programa es obligatorio";
    isValid = false;
  } else if (formData.value.name.trim().length < 5) {
    errors.value.name = "El nombre debe tener al menos 5 caracteres";
    isValid = false;
  }

  // Validar organización
  if (!formData.value.organizationName.trim()) {
    errors.value.organizationName =
      "El nombre de la organización es obligatorio";
    isValid = false;
  }

  // Validar descripción
  if (!formData.value.description.trim()) {
    errors.value.description = "La descripción es obligatoria";
    isValid = false;
  } else if (formData.value.description.trim().length < 20) {
    errors.value.description =
      "La descripción debe tener al menos 20 caracteres";
    isValid = false;
  }

  // Validar duración
  if (!formData.value.duration.trim()) {
    errors.value.duration = "La duración es obligatoria";
    isValid = false;
  }

  // Validar fechas
  if (!formData.value.startDate) {
    errors.value.startDate = "La fecha de inicio es obligatoria";
    isValid = false;
  }

  if (!formData.value.endDate) {
    errors.value.endDate = "La fecha de fin es obligatoria";
    isValid = false;
  }

  // Validar que endDate sea posterior a startDate
  if (formData.value.startDate && formData.value.endDate) {
    const start = new Date(formData.value.startDate);
    const end = new Date(formData.value.endDate);

    if (end <= start) {
      errors.value.endDate =
        "La fecha de fin debe ser posterior a la fecha de inicio";
      isValid = false;
    }
  }

  // Validar fases
  const validPhases = formData.value.phases.filter((p) => p.trim());
  if (validPhases.length === 0) {
    errors.value.general = "Debes definir al menos una fase del programa";
    isValid = false;
  }

  return isValid;
}

async function handleSubmit() {
  if (!validateForm()) {
    return;
  }

  // Validar autenticación
  if (!authStore.user?.uid) {
    errors.value.general = "Debes iniciar sesión para crear un programa";
    return;
  }

  loading.value = true;
  errors.value.general = "";

  try {
    console.log("🚀 Creando programa...");

    // Preparar datos del programa
    const programData = {
      name: formData.value.name.trim(),
      organizationName: formData.value.organizationName.trim(),
      description: formData.value.description.trim(),
      isActive: formData.value.isActive,
      codUser: formData.value.codUser.trim() || null,
      codTeam: formData.value.codTeam.trim() || null,
      createdAt: serverTimestamp(),
      createdBy: authStore.user.uid,
      metadata: {
        duration: formData.value.duration.trim(),
        startDate: new Date(formData.value.startDate),
        endDate: new Date(formData.value.endDate),
        totalParticipants: 0,
        phases: formData.value.phases
          .filter((p) => p.trim())
          .map((p) => p.trim()),
      },
    };

    console.log("📝 Datos del programa:", programData);

    // Crear programa en Firestore
    const programRef = await addDoc(collection(db, "programs"), programData);

    console.log("✅ Programa creado con ID:", programRef.id);

    // Mostrar mensaje de éxito (puedes usar toast/notification aquí)
    alert(`✅ Programa "${programData.name}" creado exitosamente!`);

    // Redirigir al hub de programas
    router.push({
      name: "ProgramsHub",
      params: { businessId: userStore.currentBusiness?.businessId },
    });
  } catch (error) {
    console.error("❌ Error creando programa:", error);
    errors.value.general =
      error.message || "Error al crear el programa. Inténtalo nuevamente.";
  } finally {
    loading.value = false;
  }
}

function goBack() {
  router.push({
    name: "ProgramsHub",
    params: { businessId: userStore.currentBusiness?.businessId },
  });
}
</script>

<style scoped>
/* Animación de entrada */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.bg-white {
  animation: fadeIn 0.3s ease-out;
}
</style>
