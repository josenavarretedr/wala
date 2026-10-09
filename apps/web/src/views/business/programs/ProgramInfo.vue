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

          <h1 class="text-xl font-bold text-gray-900">
            Información del Programa
          </h1>
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
      v-else-if="program"
      class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <div class="space-y-6">
        <!-- Información Principal -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-start gap-4 mb-6">
            <div
              class="w-16 h-16 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0"
            >
              <Community class="w-8 h-8 text-green-600" />
            </div>
            <div class="flex-1">
              <h2 class="text-2xl font-bold text-gray-900 mb-2">
                {{ program.name }}
              </h2>
              <p class="text-sm text-gray-600">
                {{ program.organizationName }}
              </p>
            </div>
          </div>

          <!-- Descripción -->
          <div v-if="program.description" class="mb-6">
            <h3 class="text-sm font-semibold text-gray-700 mb-2">
              Descripción
            </h3>
            <p class="text-sm text-gray-600 leading-relaxed">
              {{ program.description }}
            </p>
          </div>

          <!-- Detalles del Programa -->
          <div
            class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-gray-100"
          >
            <div class="flex items-center gap-3">
              <Calendar class="w-5 h-5 text-gray-400" />
              <div>
                <p class="text-xs text-gray-500">Fecha de Creación</p>
                <p class="text-sm font-medium text-gray-900">
                  {{ formatDate(program.createdAt) }}
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
                <p class="text-xs text-gray-500">Total de Actividades</p>
                <p class="text-sm font-medium text-gray-900">
                  {{ program.metadata?.totalActivities || 0 }}
                </p>
              </div>
            </div>

            <div v-if="program.startDate" class="flex items-center gap-3">
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <div>
                <p class="text-xs text-gray-500">Fecha de Inicio</p>
                <p class="text-sm font-medium text-gray-900">
                  {{ formatDate(program.startDate) }}
                </p>
              </div>
            </div>

            <div v-if="program.endDate" class="flex items-center gap-3">
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <div>
                <p class="text-xs text-gray-500">Fecha de Finalización</p>
                <p class="text-sm font-medium text-gray-900">
                  {{ formatDate(program.endDate) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Objetivos -->
        <div
          v-if="program.objectives"
          class="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 class="text-lg font-bold text-gray-900 mb-4">Objetivos</h3>
          <p class="text-sm text-gray-600 leading-relaxed">
            {{ program.objectives }}
          </p>
        </div>

        <!-- Información Adicional -->
        <div
          v-if="program.facilitatorName || program.facilitatorContact"
          class="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 class="text-lg font-bold text-gray-900 mb-4">
            Información del Facilitador
          </h3>
          <div class="space-y-3">
            <div v-if="program.facilitatorName" class="flex items-center gap-3">
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <div>
                <p class="text-xs text-gray-500">Nombre</p>
                <p class="text-sm font-medium text-gray-900">
                  {{ program.facilitatorName }}
                </p>
              </div>
            </div>

            <div
              v-if="program.facilitatorContact"
              class="flex items-center gap-3"
            >
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
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <div>
                <p class="text-xs text-gray-500">Contacto</p>
                <p class="text-sm font-medium text-gray-900">
                  {{ program.facilitatorContact }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Contacto WhatsApp -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-bold text-gray-900 mb-4">
            ¿Tienes preguntas?
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
              <p class="text-sm text-green-600">Consulta sobre el programa</p>
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
      <p class="text-gray-500">No se pudo cargar la información del programa</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebaseInit";
import { Community, Calendar } from "@iconoir/vue";
import SpinnerIcon from "@/components/ui/SpinnerIcon.vue";

const route = useRoute();
const router = useRouter();

const program = ref(null);
const loading = ref(false);

const programId = computed(() => route.params.programId);
const businessId = computed(() => route.params.businessId);

const whatsappLink = computed(() => {
  const phone = "51921492993";
  const message = encodeURIComponent(
    `Hola, tengo una consulta sobre el programa "${program.value?.name || ""}"`
  );
  return `https://wa.me/${phone}?text=${message}`;
});

onMounted(async () => {
  await loadProgram();
});

async function loadProgram() {
  loading.value = true;

  try {
    const programRef = doc(db, "programs", programId.value);
    const programSnap = await getDoc(programRef);

    if (programSnap.exists()) {
      program.value = {
        id: programSnap.id,
        ...programSnap.data(),
      };
    }
  } catch (error) {
    console.error("Error loading program:", error);
  } finally {
    loading.value = false;
  }
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
