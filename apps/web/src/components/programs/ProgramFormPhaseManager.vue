<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <label class="block text-sm font-medium text-gray-700">
        Fases del Programa
        <span class="text-red-500">*</span>
      </label>
      <span class="text-xs text-gray-500">{{ phases.length }} fases</span>
    </div>

    <!-- Lista de fases -->
    <div class="space-y-2">
      <TransitionGroup name="phase-list">
        <div
          v-for="(phase, index) in phases"
          :key="index"
          class="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200"
        >
          <div
            class="flex items-center justify-center w-8 h-8 bg-teal-100 text-teal-700 rounded-full text-sm font-bold"
          >
            {{ index + 1 }}
          </div>

          <input
            :value="phase"
            @input="updatePhase(index, $event.target.value)"
            type="text"
            placeholder="Nombre de la fase"
            class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
          />

          <button
            @click="removePhase(index)"
            type="button"
            :disabled="phases.length === 1"
            class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Eliminar fase"
          >
            <Xmark class="w-5 h-5" />
          </button>
        </div>
      </TransitionGroup>
    </div>

    <!-- Botón agregar fase -->
    <button
      @click="addPhase"
      type="button"
      class="w-full px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:border-teal-500 hover:text-teal-600 hover:bg-teal-50 transition-all"
    >
      <span class="flex items-center justify-center gap-2">
        <Plus class="w-5 h-5" />
        Agregar fase
      </span>
    </button>

    <p class="text-xs text-gray-500">
      Define las etapas del programa (ej: baseline, capacitación,
      implementación, evaluación)
    </p>
  </div>
</template>

<script setup>
import { Xmark, Plus } from "@iconoir/vue";

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => ["baseline", "training", "implementation", "evaluation"],
  },
});

const emit = defineEmits(["update:modelValue"]);

const phases = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

function addPhase() {
  const newPhases = [...phases.value, ""];
  emit("update:modelValue", newPhases);
}

function removePhase(index) {
  if (phases.value.length === 1) return;
  const newPhases = phases.value.filter((_, i) => i !== index);
  emit("update:modelValue", newPhases);
}

function updatePhase(index, value) {
  const newPhases = [...phases.value];
  newPhases[index] = value;
  emit("update:modelValue", newPhases);
}
</script>

<script>
import { computed } from "vue";
export default { name: "ProgramFormPhaseManager" };
</script>

<style scoped>
/* Animaciones para la lista */
.phase-list-enter-active,
.phase-list-leave-active {
  transition: all 0.3s ease;
}

.phase-list-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.phase-list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.phase-list-move {
  transition: transform 0.3s ease;
}
</style>
