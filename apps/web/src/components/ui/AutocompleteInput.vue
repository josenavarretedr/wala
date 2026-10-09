<template>
  <div class="space-y-2">
    <label v-if="label" class="block text-sm font-medium text-gray-700">
      {{ label }}
    </label>
    <div class="relative">
      <input
        v-model="inputValue"
        type="text"
        :placeholder="placeholder"
        @input="handleInput"
        @focus="showSuggestions = true"
        @blur="handleBlur"
        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      />

      <!-- Dropdown de sugerencias -->
      <div
        v-if="showSuggestions && filteredSuggestions.length > 0"
        class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
      >
        <button
          v-for="(suggestion, index) in filteredSuggestions"
          :key="index"
          type="button"
          @mousedown.prevent="selectSuggestion(suggestion)"
          class="w-full px-4 py-2 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
        >
          <span class="text-gray-900">{{ suggestion }}</span>
        </button>
      </div>

      <!-- Indicador de valor personalizado -->
      <div
        v-if="inputValue && !isExistingSuggestion"
        class="absolute right-3 top-3 text-xs text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded"
      >
        Nuevo
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  suggestions: {
    type: Array,
    default: () => [],
  },
  label: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "Escribe o selecciona...",
  },
});

const emit = defineEmits(["update:modelValue"]);

const inputValue = ref(props.modelValue);
const showSuggestions = ref(false);

// Normalizar texto para comparación (sin tildes, mayúsculas)
const normalizeText = (text) => {
  if (!text) return "";
  return text
    .toString()
    .toUpperCase()
    .trim()
    .replace(/[ÁÀÄÂ]/g, "A")
    .replace(/[ÉÈËÊ]/g, "E")
    .replace(/[ÍÌÏÎ]/g, "I")
    .replace(/[ÓÒÖÔ]/g, "O")
    .replace(/[ÚÙÜÛ]/g, "U")
    .replace(/Ñ/g, "N");
};

// Filtrar sugerencias según lo que escribe el usuario
const filteredSuggestions = computed(() => {
  if (!inputValue.value || inputValue.value.trim() === "") {
    return props.suggestions.slice(0, 10); // Mostrar primeras 10 si no hay input
  }

  const normalized = normalizeText(inputValue.value);

  return props.suggestions
    .filter((suggestion) => normalizeText(suggestion).includes(normalized))
    .slice(0, 10); // Limitar a 10 resultados
});

// Verificar si el valor actual es una sugerencia existente
const isExistingSuggestion = computed(() => {
  if (!inputValue.value) return false;
  const normalized = normalizeText(inputValue.value);
  return props.suggestions.some((s) => normalizeText(s) === normalized);
});

// Sincronizar con modelValue
watch(
  () => props.modelValue,
  (newVal) => {
    inputValue.value = newVal;
  },
);

watch(inputValue, (newVal) => {
  emit("update:modelValue", newVal);
});

const handleInput = () => {
  showSuggestions.value = true;
};

const selectSuggestion = (suggestion) => {
  inputValue.value = suggestion;
  showSuggestions.value = false;
  emit("update:modelValue", suggestion);
};

const handleBlur = () => {
  // Delay para permitir click en sugerencias
  setTimeout(() => {
    showSuggestions.value = false;
  }, 200);
};
</script>
