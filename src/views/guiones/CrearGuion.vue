<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4">
    <div class="max-w-4xl mx-auto">
      <!-- Header con navegación -->
      <div class="mb-8">
        <button
          @click="$router.push('/guiones')"
          class="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
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
              d="M15 19l-7-7 7-7"
            ></path>
          </svg>
          Volver
        </button>

        <h1 class="text-3xl font-bold text-gray-900">
          ✨ Crear Nuevos Guiones
        </h1>
        <p class="text-gray-600 mt-2">
          Sigue el proceso paso a paso para generar guiones con IA
        </p>
      </div>

      <!-- Indicador de pasos -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div v-for="(step, idx) in steps" :key="idx" class="flex-1 relative">
            <div class="flex flex-col items-center">
              <div
                :class="[
                  'w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all',
                  currentStep > idx
                    ? 'bg-green-500 text-white'
                    : currentStep === idx
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-500',
                ]"
              >
                <span v-if="currentStep > idx">✓</span>
                <span v-else>{{ idx + 1 }}</span>
              </div>
              <span class="text-xs mt-2 text-gray-600 hidden md:block">{{
                step
              }}</span>
            </div>

            <!-- Línea conectora -->
            <div
              v-if="idx < steps.length - 1"
              :class="[
                'absolute top-5 left-1/2 w-full h-0.5 -z-10',
                currentStep > idx ? 'bg-green-500' : 'bg-gray-200',
              ]"
            ></div>
          </div>
        </div>
      </div>

      <!-- Contenido por pasos -->
      <div class="bg-white rounded-2xl shadow-lg p-6 md:p-8">
        <!-- PASO 1: Formulario Inicial -->
        <FormularioInicial
          v-if="currentStep === 0"
          @submit="handleFormularioInicial"
        />

        <!-- PASO 2: Preguntas de la IA -->
        <PreguntasIA
          v-else-if="currentStep === 1"
          :preguntas="preguntasIA"
          :loading="loadingPreguntas"
          @submit="handleRespuestas"
          @back="currentStep--"
        />

        <!-- PASO 3: Preview y Confirmación -->
        <PreviewGuion
          v-else-if="currentStep === 2"
          :guion-data="guionGenerado"
          :loading="loadingGuion"
          @confirm="handleConfirmar"
          @back="currentStep--"
          @regenerar="handleRegenerar"
        />

        <!-- PASO 4: Éxito -->
        <div v-else-if="currentStep === 3" class="text-center py-12">
          <div class="text-6xl mb-4">🎉</div>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">
            ¡Guiones guardados exitosamente!
          </h2>
          <p class="text-gray-600 mb-8">
            Se guardaron {{ videosGuardados.length }} videos en la base de datos
          </p>

          <div class="flex gap-4 justify-center">
            <button
              @click="$router.push('/guiones/dashboard')"
              class="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
            >
              Ver Dashboard
            </button>
            <button
              @click="reiniciarProceso"
              class="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              Crear Más Guiones
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useGuionesStore } from "@/stores/guionesStore";
import {
  generarPreguntasAclaracion,
  generarGuionesCompletos,
} from "@/services/iaGuionesService";
import { useToast } from "@/composables/useToast";

import FormularioInicial from "@/components/guiones/FormularioInicial.vue";
import PreguntasIA from "@/components/guiones/PreguntasIA.vue";
import PreviewGuion from "@/components/guiones/PreviewGuion.vue";

const router = useRouter();
const guionesStore = useGuionesStore();
const toast = useToast();

const steps = ["Datos Iniciales", "Preguntas IA", "Preview", "Confirmación"];
const currentStep = ref(0);

const datosIniciales = ref(null);
const preguntasIA = ref(null);
const loadingPreguntas = ref(false);
const respuestasUsuario = ref(null);
const guionGenerado = ref(null);
const loadingGuion = ref(false);
const videosGuardados = ref([]);

// PASO 1 → PASO 2: Enviar datos iniciales y recibir preguntas
const handleFormularioInicial = async (datos) => {
  try {
    datosIniciales.value = datos;
    loadingPreguntas.value = true;
    currentStep.value = 1;

    console.log("📝 Generando preguntas de aclaración...", datos);

    const resultado = await generarPreguntasAclaracion(datos);
    preguntasIA.value = resultado.preguntas;

    toast.success("Preguntas generadas por IA");
  } catch (error) {
    console.error("Error al generar preguntas:", error);
    toast.error("Error al generar preguntas: " + error.message);
    currentStep.value = 0;
  } finally {
    loadingPreguntas.value = false;
  }
};

// PASO 2 → PASO 3: Enviar respuestas y generar guiones completos
const handleRespuestas = async (respuestas) => {
  try {
    respuestasUsuario.value = respuestas;
    loadingGuion.value = true;
    currentStep.value = 2;

    console.log("🤖 Generando guiones completos...");

    const fullContext = {
      datosIniciales: datosIniciales.value,
      respuestas: respuestas.map((resp, idx) => ({
        pregunta: preguntasIA.value[idx],
        respuesta: resp,
      })),
    };

    guionGenerado.value = await generarGuionesCompletos(fullContext);

    toast.success(`${guionGenerado.value.videos.length} guiones generados`);
  } catch (error) {
    console.error("Error al generar guiones:", error);
    toast.error("Error al generar guiones: " + error.message);
    currentStep.value = 1;
  } finally {
    loadingGuion.value = false;
  }
};

// PASO 3 → PASO 4: Confirmar y guardar en Firestore
const handleConfirmar = async () => {
  try {
    console.log("💾 Guardando guiones en Firestore...");

    const ids = await guionesStore.saveVideosFromIA(guionGenerado.value);
    videosGuardados.value = ids;

    currentStep.value = 3;
    toast.success("Guiones guardados exitosamente");
  } catch (error) {
    console.error("Error al guardar guiones:", error);
    toast.error("Error al guardar: " + error.message);
  }
};

// Regenerar con mismos datos
const handleRegenerar = async () => {
  await handleRespuestas(respuestasUsuario.value);
};

// Reiniciar todo el proceso
const reiniciarProceso = () => {
  currentStep.value = 0;
  datosIniciales.value = null;
  preguntasIA.value = null;
  respuestasUsuario.value = null;
  guionGenerado.value = null;
  videosGuardados.value = [];
};
</script>
