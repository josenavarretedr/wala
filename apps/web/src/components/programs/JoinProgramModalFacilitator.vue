<template>
  <div
    class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50"
  >
    <div
      class="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fade-in"
    >
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h3 class="text-xl font-semibold text-gray-900">
            Unirse como Facilitador
          </h3>
          <p class="mt-1 text-sm text-gray-500">
            Ingresa el código de facilitador
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
        <!-- Código de facilitador -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Código de Facilitador
            <span class="text-red-500">*</span>
          </label>
          <div class="flex gap-2">
            <input
              v-model="code"
              type="text"
              required
              @input="onCodeInput"
              class="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 uppercase text-center text-lg font-semibold tracking-wider"
              placeholder="Ej: CAREP2025-F"
              maxlength="30"
              :disabled="loading || validating"
            />
            <button
              v-if="code.trim().length >= 5"
              @click="validateCode"
              type="button"
              :disabled="validating || programFound"
              class="px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
              fill="none"
              stroke="currentColor"
              class="w-4 h-4 mr-1 flex-shrink-0 mt-0.5"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0"
              />
            </svg>
            <span>
              Ingresa el código de facilitador que te proporcionó la
              organización
            </span>
          </p>
        </div>

        <!-- Vista Previa del Programa -->
        <div
          v-if="programFound"
          class="mb-6 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 animate-fade-in"
        >
          <div class="flex items-start">
            <div
              class="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mr-3 flex-shrink-0"
            >
              <svg
                class="w-6 h-6 text-green-600"
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
              <h4 class="text-sm font-semibold text-green-900">
                {{ programFound.name }}
              </h4>
              <p class="text-xs text-green-700 mt-1">
                {{ programFound.organizationName }}
              </p>
              <div class="flex items-center gap-3 mt-3 text-xs">
                <span
                  class="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-md"
                >
                  {{ programFound.metadata?.totalParticipants || 0 }}
                  participantes
                </span>
              </div>
            </div>
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
            :disabled="loading"
            class="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
              Unirme como Facilitador
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
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { usePrograms } from "@/composables/usePrograms";
import { useUserStore } from "@/stores/useUserStore";

const emit = defineEmits(["close", "joined"]);

const { joinAsFacilitator, loading, error: storeError } = usePrograms();
const userStore = useUserStore();

const code = ref("");
const validating = ref(false);
const error = ref(null);
const success = ref(null);
const programFound = ref(null);

function onCodeInput() {
  // Reset cuando el usuario modifica el código
  if (programFound.value) {
    programFound.value = null;
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

    console.log("🔍 Validando código de facilitador:", codeUpper);

    // Importar firebase directamente para validación
    const { collection, query, where, getDocs } = await import(
      "firebase/firestore"
    );
    const { db } = await import("@/firebaseInit");

    // Buscar programa por codTeam (código para facilitadores)
    const programsRef = collection(db, "programs");
    const q = query(
      programsRef,
      where("codTeam", "==", codeUpper),
      where("isActive", "==", true)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      error.value =
        "Código de facilitador no válido o programa inactivo. Verifica el código e intenta nuevamente.";
      return;
    }

    const programDoc = querySnapshot.docs[0];
    const programData = { id: programDoc.id, ...programDoc.data() };

    console.log("✅ Programa encontrado:", programData);

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
  if (!programFound.value) return;

  error.value = null;
  success.value = null;

  try {
    console.log("📝 Uniéndose como facilitador...");

    // Llamar al composable que usa el store
    const result = await joinAsFacilitator(code.value);

    console.log("✅ Resultado:", result);

    success.value = `¡Te has unido como facilitador a "${result.programName}"!`;

    // Esperar 1.5 segundos para que el usuario vea el mensaje de éxito
    setTimeout(() => {
      emit("joined", {
        programId: result.programId,
        programName: result.programName,
      });
    }, 1500);
  } catch (err) {
    console.error("❌ Error al unirse:", err);
    error.value =
      err.message || "Error al unirse como facilitador. Intenta nuevamente.";
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
</style>
