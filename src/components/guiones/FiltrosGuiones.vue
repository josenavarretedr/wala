<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 p-4">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <!-- Búsqueda de texto -->
      <div>
        <input
          :value="activeFilters.searchText"
          @input="handleSearchInput"
          type="text"
          placeholder="Buscar..."
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
        />
      </div>

      <!-- Filtro por Tema -->
      <div>
        <select
          :value="activeFilters.tema || ''"
          @change="handleTemaChange"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
        >
          <option value="">Todos los temas</option>
          <option v-for="tema in filterOptions.temas" :key="tema" :value="tema">
            {{ tema }}
          </option>
        </select>
      </div>

      <!-- Filtro por Sector -->
      <div>
        <select
          :value="activeFilters.sector || ''"
          @change="handleSectorChange"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
        >
          <option value="">Todos los sectores</option>
          <option
            v-for="sector in filterOptions.sectores"
            :key="sector"
            :value="sector"
          >
            {{ sector }}
          </option>
        </select>
      </div>

      <!-- Filtro por Estado -->
      <div>
        <select
          :value="activeFilters.estado || ''"
          @change="handleEstadoChange"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
        >
          <option value="">Todos los estados</option>
          <option
            v-for="estado in filterOptions.estados"
            :key="estado"
            :value="estado"
          >
            {{ estado }}
          </option>
        </select>
      </div>
    </div>

    <!-- Botón para limpiar filtros -->
    <div v-if="hasActiveFilters" class="mt-3 flex justify-end">
      <button
        @click="clearFilters"
        class="text-sm text-purple-600 hover:text-purple-700 font-medium"
      >
        Limpiar filtros
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  filterOptions: {
    type: Object,
    required: true,
  },
  activeFilters: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["update:filters"]);

const hasActiveFilters = computed(() => {
  return (
    props.activeFilters.tema ||
    props.activeFilters.sector ||
    props.activeFilters.estado ||
    props.activeFilters.searchText
  );
});

const handleSearchInput = (event) => {
  emit("update:filters", { searchText: event.target.value });
};

const handleTemaChange = (event) => {
  const value = event.target.value;
  emit("update:filters", { tema: value === "" ? null : value });
};

const handleSectorChange = (event) => {
  const value = event.target.value;
  emit("update:filters", { sector: value === "" ? null : value });
};

const handleEstadoChange = (event) => {
  const value = event.target.value;
  emit("update:filters", { estado: value === "" ? null : value });
};

const clearFilters = () => {
  emit("update:filters", {
    tema: null,
    sector: null,
    estado: null,
    searchText: "",
  });
};
</script>
