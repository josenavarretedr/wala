<template>
  <!-- Botón de Guardar Cambios Fixed Bottom -->
  <div
    class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 z-50"
  >
    <div class="max-w-4xl mx-auto">
      <button
        @click="handleSave"
        :disabled="!hasChanges || saving"
        :class="[
          'w-full py-3 px-6 text-lg font-semibold rounded-xl shadow-lg transition-all duration-200 transform flex items-center justify-center gap-3 backdrop-blur-sm',
          hasChanges && !saving
            ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-green-500/25 hover:from-green-700 hover:to-green-800 hover:shadow-green-500/35 hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
            : 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-500 shadow-gray-400/15 cursor-not-allowed opacity-70',
        ]"
      >
        <SpinnerIcon v-if="saving" size="md" class="flex-shrink-0" />
        <Check v-else class="w-6 h-6 flex-shrink-0" />
        <span class="font-bold tracking-wide">
          {{ saving ? "Guardando..." : "Guardar cambios" }}
        </span>
      </button>

      <!-- Indicador de campos modificados -->
      <div
        v-if="hasChanges && !saving"
        class="mt-2 text-center text-xs text-gray-600"
      >
        {{ changedFieldsCount }} campo{{
          changedFieldsCount > 1 ? "s" : ""
        }}
        modificado{{ changedFieldsCount > 1 ? "s" : "" }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { Check } from "@iconoir/vue";
import SpinnerIcon from "@/components/ui/SpinnerIcon.vue";

// Props
const props = defineProps({
  localData: {
    type: Object,
    required: true,
  },
  originalData: {
    type: Object,
    required: true,
  },
  saving: {
    type: Boolean,
    default: false,
  },
  section: {
    type: String,
    required: true,
    validator: (value) => ["general", "economic"].includes(value),
  },
});

// Emits
const emit = defineEmits(["save"]);

// Función para comparar profundamente dos objetos y obtener campos cambiados
const getChangedFields = (original, current) => {
  const changes = {};

  for (const key in current) {
    // Comparación profunda usando JSON.stringify
    const originalValue = JSON.stringify(original[key]);
    const currentValue = JSON.stringify(current[key]);

    if (originalValue !== currentValue) {
      changes[key] = current[key];
    }
  }

  return changes;
};

// Computed: Detectar si hay cambios
const changedFields = computed(() => {
  return getChangedFields(props.originalData, props.localData);
});

const hasChanges = computed(() => {
  return Object.keys(changedFields.value).length > 0;
});

const changedFieldsCount = computed(() => {
  return Object.keys(changedFields.value).length;
});

// Método para manejar el guardado
const handleSave = () => {
  if (hasChanges.value && !props.saving) {
    emit("save", {
      changes: changedFields.value,
      section: props.section,
    });
  }
};
</script>

<style scoped>
/* Animaciones suaves */
button {
  transition: all 0.2s ease;
}

/* Mejoras de accesibilidad */
button:focus {
  outline: 2px solid rgba(34, 197, 94, 0.5);
  outline-offset: 2px;
}
</style>
