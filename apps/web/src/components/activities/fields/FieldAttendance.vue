<template>
  <div class="space-y-1.5">
    <label class="block text-sm font-medium text-gray-700">{{
      field.title
    }}</label>
    <p v-if="field.description" class="text-xs text-gray-500">
      {{ field.description }}
    </p>

    <!-- Facilitador puede marcar asistencia -->
    <div
      v-if="isFacilitator"
      class="p-4 border border-gray-200 rounded-lg bg-white space-y-3"
    >
      <div class="flex items-center gap-3">
        <button
          type="button"
          @click="toggleAttended(true)"
          :class="[
            'flex-1 py-2 px-4 rounded-lg text-sm font-medium border transition-all',
            localAttended === true
              ? 'bg-green-600 text-white border-green-600'
              : 'bg-white text-gray-700 border-gray-300 hover:border-green-400',
          ]"
        >
          Asistió
        </button>
        <button
          type="button"
          @click="toggleAttended(false)"
          :class="[
            'flex-1 py-2 px-4 rounded-lg text-sm font-medium border transition-all',
            localAttended === false
              ? 'bg-red-500 text-white border-red-500'
              : 'bg-white text-gray-700 border-gray-300 hover:border-red-400',
          ]"
        >
          No asistió
        </button>
      </div>
      <textarea
        v-model="localNotes"
        @input="emitValue"
        rows="2"
        placeholder="Notas (opcional)"
        class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
      />
    </div>

    <!-- Participante: solo lectura del estado -->
    <div v-else class="p-4 border border-gray-200 rounded-lg bg-gray-50">
      <div v-if="modelValue && modelValue.markedBy">
        <div
          :class="[
            'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium',
            modelValue.attended
              ? 'bg-green-100 text-green-700 border border-green-200'
              : 'bg-red-100 text-red-700 border border-red-200',
          ]"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              v-if="modelValue.attended"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
            <path
              v-else
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          {{
            modelValue.attended
              ? "Asististe a esta actividad"
              : "No registraste asistencia"
          }}
        </div>
        <p v-if="modelValue.notes" class="text-xs text-gray-500 mt-2">
          {{ modelValue.notes }}
        </p>
      </div>
      <div v-else class="flex items-center gap-2 text-sm text-gray-500">
        <svg
          class="w-4 h-4 text-gray-400"
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
        Pendiente — tu facilitador marcará tu asistencia
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  field: { type: Object, required: true },
  modelValue: { type: Object, default: null },
  readonly: { type: Boolean, default: false },
  isFacilitator: { type: Boolean, default: false },
});
const emit = defineEmits(["update:modelValue"]);

const localAttended = ref(props.modelValue?.attended ?? null);
const localNotes = ref(props.modelValue?.notes ?? "");

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      localAttended.value = val.attended ?? null;
      localNotes.value = val.notes ?? "";
    }
  },
);

function toggleAttended(value) {
  localAttended.value = value;
  emitValue();
}

function emitValue() {
  if (localAttended.value === null) return;
  emit("update:modelValue", {
    attended: localAttended.value,
    notes: localNotes.value,
  });
}
</script>
