<script setup>
import { ref } from 'vue';
import { useFacilitatorStore } from '@/stores/facilitator';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'participantCreated']);

const facilitatorStore = useFacilitatorStore();

const formData = ref({
  dni: '',
  nombres: '',
  apellidos: '',
  telefono: '',
  nombre_negocio: '',
  rubro: 'General',
  naturaleza: 'produccion'
});

const isSubmitting = ref(false);
const errorMessage = ref('');

function resetForm() {
  formData.value = {
    dni: '',
    nombres: '',
    apellidos: '',
    telefono: '',
    nombre_negocio: '',
    rubro: 'General',
    naturaleza: 'produccion'
  };
  errorMessage.value = '';
}

function handleClose() {
  resetForm();
  emit('close');
}

async function handleSubmit() {
  errorMessage.value = '';

  const dni = formData.value.dni.trim();
  const nombres = formData.value.nombres.trim();

  if (!dni || !nombres) {
    errorMessage.value = 'DNI y Nombres son campos obligatorios.';
    return;
  }

  const regex = /^[a-zA-Z0-9]{8,12}$/;
  if (!regex.test(dni)) {
    errorMessage.value = 'El DNI o Cédula debe tener entre 8 y 12 caracteres alfanuméricos.';
    return;
  }

  // Si no puso nombre de negocio, autogenerar uno
  if (!formData.value.nombre_negocio.trim()) {
    formData.value.nombre_negocio = `Emprendimiento de ${nombres}`;
  }

  isSubmitting.value = true;

  try {
    await facilitatorStore.registerSingleParticipant(formData.value);
    emit('participantCreated', formData.value);
    handleClose();
  } catch (err) {
    console.error('Error al registrar participante:', err);
    errorMessage.value = 'No se pudo registrar el participante en Firestore. Verifica la conexión.';
  } finally {
    isSubmitting.value = false;
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
      class="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 z-10 animate-scaleUp"
    >
      <!-- Cabecera -->
      <div class="flex items-center justify-between pb-4 border-b border-slate-100">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
            👤
          </div>
          <div>
            <h3 class="text-base font-extrabold text-slate-900">Alta Rápida de Participante</h3>
            <p class="text-xs text-slate-500">Registro en 15 segundos para la cohorte {{ facilitatorStore.activeCohortId }}</p>
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

      <!-- Alerta de error -->
      <div
        v-if="errorMessage"
        class="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold"
      >
        ⚠️ {{ errorMessage }}
      </div>

      <!-- Formulario -->
      <form @submit.prevent="handleSubmit" class="mt-4 space-y-4 text-xs">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <!-- DNI -->
          <div>
            <label class="block font-bold text-slate-700 mb-1">DNI o Cédula *</label>
            <input
              v-model="formData.dni"
              type="text"
              maxlength="12"
              placeholder="Ej: 45892134"
              class="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-mono"
              required
            />
          </div>

          <!-- Teléfono -->
          <div>
            <label class="block font-bold text-slate-700 mb-1">Teléfono / WhatsApp</label>
            <input
              v-model="formData.telefono"
              type="tel"
              placeholder="Ej: 987654321"
              class="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <!-- Nombres -->
          <div>
            <label class="block font-bold text-slate-700 mb-1">Nombres *</label>
            <input
              v-model="formData.nombres"
              type="text"
              placeholder="Ej: Rosa María"
              class="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              required
            />
          </div>

          <!-- Apellidos -->
          <div>
            <label class="block font-bold text-slate-700 mb-1">Apellidos</label>
            <input
              v-model="formData.apellidos"
              type="text"
              placeholder="Ej: Quispe Flores"
              class="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>
        </div>

        <!-- Nombre del Negocio -->
        <div>
          <label class="block font-bold text-slate-700 mb-1">Nombre Comercial del Emprendimiento</label>
          <input
            v-model="formData.nombre_negocio"
            type="text"
            placeholder="Ej: Panadería Doña Rosa"
            class="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <!-- Rubro -->
          <div>
            <label class="block font-bold text-slate-700 mb-1">Rubro / Sector</label>
            <input
              v-model="formData.rubro"
              type="text"
              placeholder="Ej: Gastronomía, Textil..."
              class="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          <!-- Naturaleza -->
          <div>
            <label class="block font-bold text-slate-700 mb-1">Naturaleza del Negocio</label>
            <select
              v-model="formData.naturaleza"
              class="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white"
            >
              <option value="produccion">Producción (elabora bienes)</option>
              <option value="servicio">Servicio (brinda atención)</option>
              <option value="comercio">Comercio (compra/venta)</option>
            </select>
          </div>
        </div>

        <!-- Mensaje pedagógico -->
        <p class="text-[11px] text-slate-400 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          ℹ️ Al guardar, se inicializará el participante con la <strong>Sesión 1 desbloqueada</strong> y las Sesiones 2 a 8 bloqueadas listas para el aula.
        </p>

        <!-- Botones de Acción -->
        <div class="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
          <button
            type="button"
            @click="handleClose"
            class="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-sm flex items-center gap-2"
          >
            <svg
              v-if="isSubmitting"
              class="animate-spin h-3.5 w-3.5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            <span>{{ isSubmitting ? 'Registrando...' : 'Registrar y Habilitar S1' }}</span>
          </button>
        </div>
      </form>
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
