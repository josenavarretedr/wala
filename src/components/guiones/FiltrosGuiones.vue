<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 p-4">
    <!-- responsive grid: mobile 1 col, sm 2 cols, md 3 cols, lg 4 cols (incluye checkbox) -->
    <div
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
    >
      <!-- Búsqueda de texto -->
      <div class="lg:col-span-2">
        <input
          :value="activeFilters.searchText"
          @input="update('searchText', $event.target.value)"
          type="text"
          placeholder="Buscar tema, sector, gancho..."
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
        />
      </div>

      <!-- Filtro por Tema -->
      <div>
        <select
          :value="activeFilters.tema || ''"
          @change="update('tema', $event.target.value || null)"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
        >
          <option value="">Todos los temas</option>
          <option v-for="tema in filterOptions.temas" :key="tema" :value="tema">
            {{ tema }}
          </option>
        </select>
      </div>

      <!-- Filtro por Ruta -->
      <div>
        <select
          :value="activeFilters.ruta || ''"
          @change="update('ruta', $event.target.value || null)"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
        >
          <option value="">Todas las rutas</option>
          <option value="tecnica">Técnica</option>
          <option value="viral">Viral</option>
          <option value="amplia">Amplia</option>
        </select>
      </div>

      <!-- Filtro por Tipo de Contenido -->
      <div>
        <select
          :value="activeFilters.tipo_contenido || ''"
          @change="update('tipo_contenido', $event.target.value || null)"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
        >
          <option value="">Edu / Práctico</option>
          <option value="educativo">Educativo</option>
          <option value="practico">Práctico</option>
        </select>
      </div>

      <!-- Filtro por Narrativa -->
      <div>
        <select
          :value="activeFilters.narrativa || ''"
          @change="update('narrativa', $event.target.value || null)"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
        >
          <option value="">Narrativa</option>
          <option value="directa">Directa</option>
          <option value="estructurada">Estructurada</option>
        </select>
      </div>

      <!-- Nuevo: Filtro por Fase del Funnel -->
      <div>
        <select
          :value="activeFilters.fase_funnel || ''"
          @change="
            update(
              'fase_funnel',
              ($event.target.value || null)?.toLowerCase?.() || null,
            )
          "
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
        >
          <option value="">Todas las fases</option>
          <option v-for="fase in filterOptions.fases" :key="fase" :value="fase">
            {{
              fase === "tofu"
                ? "ToFu"
                : fase === "mofu"
                  ? "MoFu"
                  : fase === "bofu"
                    ? "BoFu"
                    : fase
            }}
          </option>
        </select>
      </div>

      <!-- Nuevo: Filtro por Voz -->
      <div>
        <select
          :value="activeFilters.voz || ''"
          @change="update('voz', $event.target.value || null)"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
        >
          <option value="">Voz</option>
          <option v-for="voz in filterOptions.voces" :key="voz" :value="voz">
            {{ voz === "A" ? "José (A)" : voz === "B" ? "WALA (B)" : voz }}
          </option>
        </select>
      </div>

      <!-- Nuevo: Checkbox huevos de oro -->
      <div class="flex items-center mt-2 lg:mt-0">
        <input
          id="filtro-huevo"
          type="checkbox"
          :checked="activeFilters.es_huevo_oro === true"
          @change="update('es_huevo_oro', $event.target.checked ? true : null)"
          class="h-4 w-4 text-purple-600 border-gray-300 rounded"
        />
        <label for="filtro-huevo" class="ml-2 text-sm text-gray-700">
          Sólo huevos de oro
        </label>
      </div>
    </div>

    <!-- Segunda fila: Estado + Limpiar -->
    <div
      class="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
    >
      <div class="flex flex-wrap items-center gap-2">
        <!-- Filtro por Estado como pills -->
        <button
          v-for="estado in filterOptions.estados"
          :key="estado"
          @click="toggleEstado(estado)"
          :class="[
            'px-3 py-1 rounded-full text-xs font-semibold transition-colors',
            activeFilters.estado === estado
              ? estadoActiveClass(estado)
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
          ]"
        >
          {{ estado }}
        </button>
      </div>

      <button
        v-if="hasActiveFilters"
        @click="clearFilters"
        class="text-sm text-purple-600 hover:text-purple-700 font-medium whitespace-nowrap self-start sm:self-auto"
      >
        Limpiar filtros
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  filterOptions: { type: Object, required: true },
  activeFilters: { type: Object, required: true },
});

const emit = defineEmits(["update:filters"]);

const hasActiveFilters = computed(
  () =>
    props.activeFilters.tema ||
    props.activeFilters.ruta ||
    props.activeFilters.tipo_contenido ||
    props.activeFilters.narrativa ||
    props.activeFilters.estado ||
    props.activeFilters.fase_funnel ||
    props.activeFilters.voz ||
    props.activeFilters.es_huevo_oro != null ||
    props.activeFilters.searchText,
);

const update = (key, value) => {
  emit("update:filters", { [key]: value });
};

const toggleEstado = (estado) => {
  const newEstado = props.activeFilters.estado === estado ? null : estado;
  emit("update:filters", { estado: newEstado });
};

const clearFilters = () => {
  emit("update:filters", {
    tema: null,
    ruta: null,
    tipo_contenido: null,
    narrativa: null,
    estado: null,
    fase_funnel: null,
    voz: null,
    es_huevo_oro: null,
    searchText: "",
  });
};

const estadoActiveClass = (estado) =>
  ({
    GRABANDO: "bg-blue-100 text-blue-700",
    EDITANDO: "bg-yellow-100 text-yellow-700",
    PUBLICADO: "bg-green-100 text-green-700",
  })[estado] || "bg-gray-200 text-gray-700";
</script>
