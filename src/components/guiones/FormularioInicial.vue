<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-900 mb-6">
      Paso 1: Información Inicial
    </h2>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Tema -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Tema del Contenido *
        </label>

        <!-- Sugerencias de temas -->
        <div class="flex flex-wrap gap-2 mb-3">
          <button
            v-for="tema in temasSugeridos"
            :key="tema"
            type="button"
            @click="seleccionarTema(tema)"
            :class="[
              'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
              formData.tema === tema
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-purple-100 hover:text-purple-700',
            ]"
          >
            {{ tema }}
          </button>
        </div>

        <input
          v-model="formData.tema"
          type="text"
          required
          placeholder="O escribe tu propio tema..."
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        <p class="text-sm text-gray-500 mt-1">
          Selecciona un tema sugerido o escribe uno personalizado
        </p>
      </div>

      <!-- Sectores -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Sectores Objetivo *
        </label>

        <!-- Opción "Todos los sectores" -->
        <div class="mb-3">
          <label class="inline-flex items-center cursor-pointer">
            <input
              v-model="todosSectores"
              @change="handleTodosSectores"
              type="checkbox"
              class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <span class="ml-2 text-sm text-gray-700">Todos los sectores</span>
          </label>
        </div>

        <!-- Buscador con sugerencias (solo si no está "Todos" activo) -->
        <div v-if="!todosSectores" class="relative">
          <input
            v-model="sectorInput"
            @input="handleSectorInput"
            @focus="showSuggestions = true"
            @blur="handleBlur"
            type="text"
            placeholder="Escribe y selecciona sectores (ej: Bodega, Ferretería)"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />

          <!-- Dropdown de sugerencias -->
          <div
            v-if="showSuggestions && filteredSectorOptions.length > 0"
            class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            <button
              v-for="sector in filteredSectorOptions"
              :key="sector"
              type="button"
              @mousedown="addSector(sector)"
              class="w-full px-4 py-2 text-left hover:bg-purple-50 focus:bg-purple-50 text-sm"
            >
              {{ sector }}
            </button>
          </div>
        </div>

        <!-- Sectores seleccionados -->
        <div
          v-if="!todosSectores && formData.sectores.length > 0"
          class="flex flex-wrap gap-2 mt-3"
        >
          <span
            v-for="(sector, idx) in formData.sectores"
            :key="idx"
            class="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
          >
            {{ sector }}
            <button
              type="button"
              @click="removeSector(idx)"
              class="hover:text-purple-900"
            >
              ×
            </button>
          </span>
        </div>

        <p class="text-sm text-gray-500 mt-1">
          {{
            todosSectores
              ? "Los guiones se generarán para todos los sectores disponibles"
              : "Puedes seleccionar múltiples sectores para aplicar los guiones"
          }}
        </p>
      </div>

      <!-- Total de videos -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Total de Videos a Generar *
        </label>
        <input
          v-model.number="formData.total_videos"
          type="number"
          min="1"
          max="10"
          required
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        <p class="text-sm text-gray-500 mt-1">
          Cantidad de guiones a generar (recomendado: 5-6 videos)
        </p>
      </div>

      <!-- Distribución Voz A/B -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Distribución de Voces
        </label>

        <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <!-- Visualización de la distribución -->
          <div class="flex justify-between items-center mb-3">
            <div class="text-center flex-1">
              <div class="text-xs text-gray-600 mb-1">Voz A (José)</div>
              <div class="text-2xl font-bold text-purple-600">
                {{ vozACount }}
              </div>
            </div>
            <div class="text-gray-400 text-lg">|</div>
            <div class="text-center flex-1">
              <div class="text-xs text-gray-600 mb-1">Voz B (WALA)</div>
              <div class="text-2xl font-bold text-blue-600">
                {{ vozBCount }}
              </div>
            </div>
          </div>

          <!-- Slider de distribución -->
          <div class="relative">
            <input
              v-model.number="sliderValue"
              type="range"
              min="0"
              :max="formData.total_videos"
              class="w-full h-2 bg-gradient-to-r from-purple-200 via-purple-300 to-blue-300 rounded-lg appearance-none cursor-pointer slider"
              :style="sliderStyle"
            />

            <!-- Labels debajo del slider -->
            <div class="flex justify-between text-xs text-gray-500 mt-1">
              <span>0 A</span>
              <span>{{ formData.total_videos }} videos total</span>
              <span>0 B</span>
            </div>
          </div>
        </div>

        <p class="text-sm text-gray-500 mt-1">
          Arrastra el control para ajustar la distribución entre las dos voces
        </p>
      </div>

      <!-- Fase del funnel -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Fase del Funnel
        </label>
        <select
          v-model="formData.fase_funnel"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="atraccion">Atracción (ToFu)</option>
          <option value="consideracion">Consideración (MoFu)</option>
          <option value="conversion">Conversión (BoFu)</option>
        </select>
      </div>

      <!-- Botón Submit -->
      <div class="flex justify-end">
        <button
          type="submit"
          class="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium flex items-center gap-2"
        >
          <span>Continuar</span>
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
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            ></path>
          </svg>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const emit = defineEmits(["submit"]);

const formData = ref({
  tema: "",
  sectores: [],
  total_videos: 5,
  distribucion: {
    voz_a: null,
    voz_b: null,
  },
  fase_funnel: "atraccion",
});

// Temas sugeridos
const temasSugeridos = [
  "Flujo de caja",
  "Control de inventario",
  "Gestión de clientes",
  "Marketing digital",
  "Ventas y atención",
  "Finanzas básicas",
  "Productividad",
  "Recursos humanos",
];

const seleccionarTema = (tema) => {
  formData.value.tema = tema;
};

// Opciones de sectores predefinidas
const sectorOptions = [
  "Bodega",
  "Ferretería",
  "Minimarket",
  "Tienda de Barrio",
  "Librería",
  "Panadería",
  "Restaurante",
  "Cafetería",
  "Peluquería/Barbería",
  "Taller Mecánico",
  "Farmacia",
  "Verdulería",
  "Carnicería",
  "Boutique/Ropa",
  "Zapatería",
  "Papelería",
  "Juguetería",
  "Electrónica",
  "Licorería",
  "Perfumería",
  "Veterinaria",
  "Floristería",
  "Lavandería",
  "Gimnasio",
  "Centro de Estética",
];

const sectorInput = ref("");
const showSuggestions = ref(false);
const todosSectores = ref(false);

const handleTodosSectores = () => {
  if (todosSectores.value) {
    formData.value.sectores = [...sectorOptions];
  } else {
    formData.value.sectores = [];
  }
};

const filteredSectorOptions = computed(() => {
  if (!sectorInput.value) return sectorOptions;

  const search = sectorInput.value.toLowerCase();
  return sectorOptions.filter(
    (s) =>
      s.toLowerCase().includes(search) && !formData.value.sectores.includes(s),
  );
});

const handleSectorInput = () => {
  showSuggestions.value = true;
};

const handleBlur = () => {
  // Delay para permitir el click en la sugerencia
  setTimeout(() => {
    showSuggestions.value = false;
  }, 200);
};

const addSector = (sector) => {
  if (!formData.value.sectores.includes(sector)) {
    formData.value.sectores.push(sector);
  }
  sectorInput.value = "";
  showSuggestions.value = false;
};

const removeSector = (index) => {
  formData.value.sectores.splice(index, 1);
  // Desactivar "Todos" si se quita algún sector
  if (todosSectores.value) {
    todosSectores.value = false;
  }
};

// Slider para distribución de voces
const sliderValue = ref(Math.floor(formData.value.total_videos / 2));

const vozACount = computed(() => sliderValue.value);
const vozBCount = computed(
  () => formData.value.total_videos - sliderValue.value,
);

const sliderStyle = computed(() => {
  const percentage = (sliderValue.value / formData.value.total_videos) * 100;
  return {
    background: `linear-gradient(to right, #9333ea ${percentage}%, #3b82f6 ${percentage}%)`,
  };
});

// Actualizar distribución cuando cambia el slider
watch(sliderValue, (newVal) => {
  formData.value.distribucion.voz_a = newVal;
  formData.value.distribucion.voz_b = formData.value.total_videos - newVal;
});

// Recalcular slider cuando cambia total_videos
watch(
  () => formData.value.total_videos,
  (newTotal) => {
    sliderValue.value = Math.floor(newTotal / 2);
  },
);

const handleSubmit = () => {
  // Validación básica
  if (!formData.value.tema || formData.value.sectores.length === 0) {
    alert("Por favor completa los campos requeridos");
    return;
  }

  emit("submit", formData.value);
};
</script>

<style scoped>
/* Estilos personalizados para el slider */
.slider::-webkit-slider-thumb {
  appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: white;
  border: 3px solid #9333ea;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider::-moz-range-thumb {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: white;
  border: 3px solid #9333ea;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  border-color: #7c3aed;
}

.slider::-moz-range-thumb:hover {
  transform: scale(1.1);
  border-color: #7c3aed;
}
</style>
