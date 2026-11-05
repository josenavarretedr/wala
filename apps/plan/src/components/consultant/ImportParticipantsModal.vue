<script setup>
import { ref } from 'vue';
import { useFacilitatorStore } from '@/stores/facilitator';
import {
  parseParticipantsSpreadsheet,
  commitParticipantsImport,
  downloadParticipantsTemplate
} from '@/services/import/participantImporter';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'importCompleted']);

const facilitatorStore = useFacilitatorStore();

const isParsing = ref(false);
const isImporting = ref(false);
const parsedResult = ref(null);
const fileInputRef = ref(null);
const selectedFileName = ref('');
const errorMessage = ref('');
const successMessage = ref('');

function resetModal() {
  parsedResult.value = null;
  selectedFileName.value = '';
  errorMessage.value = '';
  successMessage.value = '';
  if (fileInputRef.value) fileInputRef.value.value = '';
}

function handleClose() {
  resetModal();
  emit('close');
}

async function handleFileChange(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  selectedFileName.value = file.name;
  errorMessage.value = '';
  successMessage.value = '';
  isParsing.value = true;

  try {
    const result = await parseParticipantsSpreadsheet(file);
    parsedResult.value = result;

    if (result.validRows.length === 0) {
      errorMessage.value = 'El archivo no contiene filas válidas para importar. Revisa el formato.';
    }
  } catch (err) {
    console.error('Error al procesar hoja de cálculo:', err);
    errorMessage.value = 'No se pudo leer el archivo. Asegúrate de subir un archivo Excel (.xlsx, .xls) o CSV válido.';
  } finally {
    isParsing.value = false;
  }
}

async function handleConfirmImport() {
  if (!parsedResult.value || parsedResult.value.validRows.length === 0) return;

  isImporting.value = true;
  errorMessage.value = '';

  try {
    const res = await commitParticipantsImport(
      parsedResult.value.validRows,
      facilitatorStore.activeCohortId
    );

    successMessage.value = `¡Éxito! Se registraron ${res.total} participantes y sus 8 sesiones en la cohorte ${facilitatorStore.activeCohortId}.`;
    emit('importCompleted', res);

    setTimeout(() => {
      handleClose();
    }, 1800);
  } catch (err) {
    console.error('Error durante la importación en lote:', err);
    errorMessage.value = 'Ocurrió un error al registrar los participantes en Firestore. Inténtalo nuevamente.';
  } finally {
    isImporting.value = false;
  }
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4"
  >
    <!-- Fondo oscuro traslúcido -->
    <div
      class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      @click="handleClose"
    ></div>

    <!-- Modal Card -->
    <div
      class="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 z-10 animate-scaleUp text-xs"
    >
      <!-- Cabecera -->
      <div class="flex items-center justify-between pb-4 border-b border-slate-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xl">
            📥
          </div>
          <div>
            <h3 class="text-base font-extrabold text-slate-900">Importación Masiva de Participantes</h3>
            <p class="text-slate-500">
              Cohorte destino: <span class="font-bold text-blue-700">{{ facilitatorStore.activeCohortId }}</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          @click="handleClose"
          class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          ✕
        </button>
      </div>

      <!-- Zona de descarga de plantilla y ayuda -->
      <div class="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between gap-3">
        <div>
          <p class="font-bold text-slate-800">¿No tienes el formato estándar?</p>
          <p class="text-[11px] text-slate-500">
            Descarga nuestra plantilla con columnas preconfiguradas. Se preservan y normalizan automáticamente DNIs con ceros a la izquierda (ej. 007701587).
          </p>
        </div>
        <button
          type="button"
          @click="downloadParticipantsTemplate"
          class="shrink-0 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 font-bold text-slate-700 text-xs shadow-2xs transition-colors flex items-center gap-1.5"
        >
          <span>📄</span>
          <span>Descargar Plantilla (.xlsx)</span>
        </button>
      </div>

      <!-- Dropzone / Input de archivo -->
      <div class="mt-4">
        <label
          for="excel-upload"
          class="border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors"
          :class="[
            selectedFileName
              ? 'border-blue-400 bg-blue-50/40'
              : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
          ]"
        >
          <span class="text-3xl mb-1">📊</span>
          <p class="font-bold text-slate-800 text-sm">
            {{ selectedFileName ? selectedFileName : 'Haz clic para seleccionar o arrastra tu archivo Excel / CSV' }}
          </p>
          <p class="text-[11px] text-slate-400 mt-0.5">Formatos compatibles: .xlsx, .xls, .csv</p>
          <input
            id="excel-upload"
            ref="fileInputRef"
            type="file"
            accept=".xlsx, .xls, .csv"
            class="hidden"
            @change="handleFileChange"
          />
        </label>
      </div>

      <!-- Spinner durante el parseo -->
      <div v-if="isParsing" class="py-6 text-center text-slate-500 flex items-center justify-center gap-2">
        <div class="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span>Analizando estructura de columnas y datos...</span>
      </div>

      <!-- Mensajes de Estado -->
      <div
        v-if="errorMessage"
        class="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl font-semibold"
      >
        ⚠️ {{ errorMessage }}
      </div>
      <div
        v-if="successMessage"
        class="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-semibold"
      >
        ✓ {{ successMessage }}
      </div>

      <!-- Resumen del Análisis y Previsualización -->
      <div v-if="parsedResult && !isParsing" class="mt-4 space-y-3">
        <!-- Indicadores de conteo -->
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold">
            ✓ {{ parsedResult.validRows.length }} filas válidas
          </span>
          <span
            v-if="parsedResult.invalidRows.length > 0"
            class="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 font-bold"
          >
            ⚠️ {{ parsedResult.invalidRows.length }} filas con errores
          </span>
          <span class="text-slate-400 text-[11px]">Total: {{ parsedResult.totalRows }} filas</span>
        </div>

        <!-- Errores detectados (si los hay) -->
        <div
          v-if="parsedResult.invalidRows.length > 0"
          class="max-h-28 overflow-y-auto bg-rose-50/70 border border-rose-200 p-2.5 rounded-xl space-y-1 text-[11px] text-rose-800"
        >
          <div v-for="inv in parsedResult.invalidRows" :key="inv.rowNumber">
            Fila {{ inv.rowNumber }}: {{ inv.errors.join(', ') }} (DNI: {{ inv.data.dni || 'vacío' }})
          </div>
        </div>

        <!-- Vista previa de los primeros 5 participantes válidos -->
        <div v-if="parsedResult.validRows.length > 0" class="border border-slate-200 rounded-xl overflow-hidden">
          <div class="bg-slate-100 px-3 py-1.5 font-bold text-slate-700 text-[11px] border-b border-slate-200">
            Vista Previa de Importación (primeros registros):
          </div>
          <div class="max-h-36 overflow-y-auto">
            <table class="w-full text-left text-[11px]">
              <thead class="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th class="p-2">DNI</th>
                  <th class="p-2">Nombres</th>
                  <th class="p-2">Negocio</th>
                  <th class="p-2">Naturaleza</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-slate-700 font-mono">
                <tr v-for="row in parsedResult.validRows.slice(0, 5)" :key="row.dni">
                  <td class="p-2 font-bold">{{ row.dni }}</td>
                  <td class="p-2 font-sans">{{ row.nombres }} {{ row.apellidos }}</td>
                  <td class="p-2 font-sans truncate max-w-[150px]">{{ row.nombre_negocio }}</td>
                  <td class="p-2 font-sans capitalize">{{ row.naturaleza }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Pie de Acciones -->
      <div class="mt-6 pt-3 flex items-center justify-between border-t border-slate-100">
        <button
          type="button"
          @click="handleClose"
          class="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
        >
          Cancelar
        </button>

        <button
          type="button"
          :disabled="!parsedResult || parsedResult.validRows.length === 0 || isImporting"
          @click="handleConfirmImport"
          class="px-5 py-2 rounded-xl font-bold text-white shadow-sm flex items-center gap-2 transition-all"
          :class="[
            !parsedResult || parsedResult.validRows.length === 0 || isImporting
              ? 'bg-slate-300 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-700 active:scale-98'
          ]"
        >
          <svg
            v-if="isImporting"
            class="animate-spin h-3.5 w-3.5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <span v-else>📥</span>
          <span>
            {{
              isImporting
                ? 'Importando a Firestore...'
                : `Confirmar e Importar ${parsedResult?.validRows?.length || 0} Participantes`
            }}
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes scaleUp {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.animate-scaleUp {
  animation: scaleUp 0.2s ease-out forwards;
}
</style>
