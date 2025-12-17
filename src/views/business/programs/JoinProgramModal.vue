<template>
  <div
    class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50"
  >
    <div class="bg-white rounded-xl shadow-2xl w-full p-6 animate-fade-in">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h3 class="text-xl font-semibold text-gray-900">
            Unirse a un Programa
          </h3>
          <p class="mt-1 text-sm text-gray-500">
            Ingresa el código de invitación
          </p>
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

      <!-- Form -->
      <form @submit.prevent="handleSubmit">
        <!-- Negocio Actual -->
        <div class="mb-4 bg-teal-50 border border-teal-200 rounded-lg p-3">
          <div class="flex items-start">
            <svg
              class="w-5 h-5 text-teal-600 mr-2 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <div>
              <p class="text-xs font-medium text-teal-900">
                Te unirás con el negocio:
              </p>
              <p class="text-sm font-semibold text-teal-700 mt-0.5">
                {{ currentBusinessName || "Mi Negocio" }}
              </p>
            </div>
          </div>
        </div>

        <!-- Código de invitación -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Código de Invitación
            <span class="text-red-500">*</span>
          </label>
          <div class="flex gap-2">
            <input
              v-model="code"
              type="text"
              required
              @input="onCodeInput"
              class="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase text-center text-lg font-semibold tracking-wider"
              placeholder="Ej: CARE2025"
              maxlength="20"
              :disabled="loading || validating"
            />
            <button
              v-if="code.trim().length >= 5"
              @click="validateCode"
              type="button"
              :disabled="validating || programFound"
              class="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="!validating">Validar</span>
              <div
                v-else
                class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"
              ></div>
            </button>
          </div>
          <p class="mt-2 text-xs text-gray-500 flex items-start">
            <svg
              class="w-4 h-4 mr-1 flex-shrink-0 mt-0.5"
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
            <span>
              Ingresa el código que te proporcionó la organización y haz clic en
              "Validar"
            </span>
          </p>
        </div>

        <!-- Vista Previa del Programa -->
        <div
          v-if="programFound"
          class="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 animate-fade-in"
        >
          <div class="flex items-start">
            <div
              class="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mr-3 flex-shrink-0"
            >
              <svg
                class="w-6 h-6 text-blue-600"
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
            <div class="flex-1">
              <h4 class="text-sm font-semibold text-blue-900">
                {{ programFound.name }}
              </h4>
              <p class="text-xs text-blue-700 mt-1">
                {{ programFound.organizationName }}
              </p>
              <p class="text-xs text-blue-600 mt-2 line-clamp-2">
                {{ programFound.description }}
              </p>
              <div class="flex items-center gap-3 mt-3 text-xs">
                <span
                  class="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded-md"
                >
                  <svg
                    class="w-3 h-3 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {{ programFound.metadata?.duration || "N/A" }}
                </span>
                <span
                  class="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded-md"
                >
                  <svg
                    class="w-3 h-3 mr-1"
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
                  {{ programFound.metadata?.totalParticipants || 0 }}
                  participantes
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Checkbox de Autorización -->
        <div v-if="programFound" class="mb-6">
          <div
            class="flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-lg p-4"
          >
            <input
              id="authorize-data"
              v-model="dataAuthorized"
              type="checkbox"
              class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
              required
            />
            <label for="authorize-data" class="flex-1 cursor-pointer">
              <span class="text-sm font-medium text-gray-900">
                Autorizo el uso de mi información básica
              </span>
              <p class="text-xs text-gray-600 mt-1.5 leading-relaxed">
                Al unirme a este programa, autorizo a
                <strong>{{ programFound.organizationName }}</strong> a acceder a
                mi información básica de contacto (nombre del negocio, correo
                electrónico) y datos de progreso del programa (evaluaciones,
                asistencia a talleres) con el único propósito de gestionar mi
                participación y brindarme acompañamiento empresarial.
              </p>
              <p class="text-xs text-yellow-700 font-medium mt-2">
                ⚠️ Tus datos financieros y transaccionales permanecen privados y
                no serán compartidos.
              </p>
            </label>
          </div>
        </div>

        <!-- Error message -->
        <div
          v-if="error"
          class="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 animate-shake"
        >
          <div class="flex items-start">
            <svg
              class="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p class="text-sm text-red-700">{{ error }}</p>
          </div>
        </div>

        <!-- Success message -->
        <div
          v-if="success"
          class="mb-4 bg-green-50 border border-green-200 rounded-lg p-3"
        >
          <div class="flex items-start">
            <svg
              class="w-5 h-5 text-green-400 mr-2 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p class="text-sm text-green-700">{{ success }}</p>
          </div>
        </div>

        <!-- Buttons -->
        <div class="flex gap-3">
          <button
            type="button"
            @click="$emit('close')"
            :disabled="loading"
            class="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            v-if="programFound"
            type="submit"
            :disabled="loading || !dataAuthorized"
            class="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="!loading" class="flex items-center justify-center">
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Confirmar y Unirme
            </span>
            <span v-else class="flex items-center justify-center">
              <div
                class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"
              ></div>
              Uniéndome...
            </span>
          </button>
        </div>
      </form>

      <!-- Info adicional -->
      <div class="mt-6 pt-6 border-t border-gray-200">
        <div class="flex items-start text-xs text-gray-500">
          <svg
            class="w-4 h-4 mr-2 flex-shrink-0 mt-0.5 text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <p>
            <strong>Solo gerentes pueden unir negocios a programas.</strong>
            Al unirte, aceptas compartir información de progreso con la
            organización, pero tus datos financieros permanecen privados.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "@/firebaseInit";
import { useAuthStore } from "@/stores/authStore";
import { useUserStore } from "@/stores/useUserStore";

const emit = defineEmits(["close", "joined"]);

const authStore = useAuthStore();
const userStore = useUserStore();

const code = ref("");
const loading = ref(false);
const validating = ref(false);
const error = ref(null);
const success = ref(null);
const programFound = ref(null);
const dataAuthorized = ref(false);

const currentBusinessName = computed(() => {
  return (
    userStore.currentBusiness?.razonSocial ||
    userStore.currentBusiness?.businessId ||
    "Mi Negocio"
  );
});

function onCodeInput() {
  // Reset cuando el usuario modifica el código
  if (programFound.value) {
    programFound.value = null;
    dataAuthorized.value = false;
    error.value = null;
  }
}

async function validateCode() {
  if (!code.value.trim()) return;

  validating.value = true;
  error.value = null;
  programFound.value = null;

  try {
    const codeUpper = code.value.trim().toUpperCase();

    console.log("🔍 Buscando programa con código:", codeUpper);

    // Buscar programa por codUser
    const programsRef = collection(db, "programs");
    const q = query(
      programsRef,
      where("codUser", "==", codeUpper),
      where("isActive", "==", true)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      error.value =
        "Código no válido o programa inactivo. Verifica el código e intenta nuevamente.";
      return;
    }

    const programDoc = querySnapshot.docs[0];
    const programData = { id: programDoc.id, ...programDoc.data() };

    console.log("✅ Programa encontrado:", programData);

    // Verificar si ya está inscrito
    const currentUserId = authStore.user?.uid;
    const currentBusinessId = userStore.currentBusiness?.businessId;

    if (
      programData.members?.some(
        (m) => m.userId === currentUserId && m.businessId === currentBusinessId
      )
    ) {
      error.value = "Ya estás inscrito en este programa con este negocio.";
      return;
    }

    programFound.value = programData;
  } catch (err) {
    console.error("❌ Error validando código:", err);
    error.value =
      err.message || "Error al validar el código. Intenta nuevamente.";
  } finally {
    validating.value = false;
  }
}

async function handleSubmit() {
  if (!programFound.value || !dataAuthorized.value) return;

  // Validar autenticación y negocio actual
  if (!authStore.user?.uid) {
    error.value = "Debes iniciar sesión para unirte a un programa.";
    return;
  }

  if (!userStore.currentBusiness?.businessId) {
    error.value =
      "No se encontró el negocio actual. Intenta recargar la página.";
    return;
  }

  loading.value = true;
  error.value = null;
  success.value = null;

  try {
    const memberData = {
      userId: authStore.user.uid,
      businessId: userStore.currentBusiness.businessId,
      businessName: userStore.currentBusiness.razonSocial || "Sin nombre",
      joinedAt: new Date(),
      role: "participant", // participant, facilitator, admin
      status: "active",
    };

    console.log("📝 Agregando miembro al programa:", memberData);

    // 1. Actualizar documento del programa
    const programRef = doc(db, "programs", programFound.value.id);
    await updateDoc(programRef, {
      members: arrayUnion(memberData),
      "metadata.totalParticipants":
        (programFound.value.metadata?.totalParticipants || 0) + 1,
    });

    console.log("✅ Miembro agregado al programa");

    // 2. Actualizar documento del business con el programId
    const businessRef = doc(
      db,
      "businesses",
      userStore.currentBusiness.businessId
    );
    await updateDoc(businessRef, {
      programs: arrayUnion(programFound.value.id),
    });

    console.log("✅ ProgramId agregado a businesses/{businessId}.programs");

    success.value = `¡Te has unido exitosamente a "${programFound.value.name}"!`;

    // Esperar 1.5 segundos para que el usuario vea el mensaje de éxito
    setTimeout(() => {
      emit("joined", {
        programId: programFound.value.id,
        programName: programFound.value.name,
      });
    }, 1500);
  } catch (err) {
    console.error("❌ Error al unirse al programa:", err);
    error.value =
      err.message || "Error al unirse al programa. Intenta nuevamente.";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}

.animate-fade-in {
  animation: fade-in 0.2s ease-out;
}

.animate-shake {
  animation: shake 0.3s ease-in-out;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
