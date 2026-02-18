<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
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

        <div
          class="flex flex-col md:flex-row md:items-center md:justify-between"
        >
          <div>
            <h1 class="text-3xl font-bold text-gray-900">
              📊 Dashboard de Guiones
            </h1>
            <p class="text-gray-600 mt-2">{{ videosFiltered.length }} videos</p>
          </div>

          <button
            @click="$router.push('/guiones/crear')"
            class="mt-4 md:mt-0 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium flex items-center gap-2 w-full md:w-auto justify-center"
          >
            <span>✨</span>
            <span>Crear Nuevo</span>
          </button>
        </div>
      </div>

      <!-- Filtros -->
      <FiltrosGuiones
        :filter-options="filterOptions"
        :active-filters="activeFilters"
        @update:filters="handleFilterUpdate"
      />

      <!-- Stats rápidas -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <div class="text-sm text-gray-600">Total</div>
          <div class="text-2xl font-bold text-gray-900">
            {{ videosFiltered.length }}
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <div class="text-sm text-gray-600">Voz A (José)</div>
          <div class="text-2xl font-bold text-purple-600">
            {{ videosPorVoz.vozA }}
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <div class="text-sm text-gray-600">Voz B (WALA)</div>
          <div class="text-2xl font-bold text-blue-600">
            {{ videosPorVoz.vozB }}
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <div class="text-sm text-gray-600">Publicados</div>
          <div class="text-2xl font-bold text-green-600">
            {{ videosPorEstado.publicado }}
          </div>
        </div>
      </div>

      <!-- Loader -->
      <div v-if="loading" class="flex justify-center py-12">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"
        ></div>
      </div>

      <!-- Lista de videos -->
      <div v-else-if="!loading && videosFiltered.length > 0">
        <!-- Tabla (Desktop) -->
        <div class="hidden lg:block">
          <TablaVideos
            :videos="videosFiltered"
            @edit="handleEdit"
            @delete="handleDelete"
          />
        </div>

        <!-- Cards (Mobile/Tablet) -->
        <div class="lg:hidden grid gap-4">
          <CardVideo
            v-for="video in videosFiltered"
            :key="video.id"
            :video="video"
            @click="handleEdit(video.id)"
            @delete="handleDelete(video.id)"
          />
        </div>
      </div>

      <!-- Estado vacío -->
      <div
        v-else-if="!loading && videosFiltered.length === 0"
        class="text-center py-12"
      >
        <div class="text-6xl mb-4">📝</div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">No hay guiones aún</h3>
        <p class="text-gray-600 mb-6">
          Comienza creando tu primer conjunto de guiones
        </p>
        <button
          @click="$router.push('/guiones/crear')"
          class="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium inline-flex items-center gap-2"
        >
          <span>✨</span>
          <span>Crear Guiones</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useGuionesStore } from "@/stores/guionesStore";
import { useToast } from "@/composables/useToast";

import FiltrosGuiones from "@/components/guiones/FiltrosGuiones.vue";
import TablaVideos from "@/components/guiones/TablaVideos.vue";
import CardVideo from "@/components/guiones/CardVideo.vue";

const router = useRouter();
const guionesStore = useGuionesStore();
const toast = useToast();

const loading = computed(() => guionesStore.loading);
const videosFiltered = computed(() => guionesStore.videosFiltered);
const videosPorVoz = computed(() => guionesStore.videosPorVoz);
const videosPorEstado = computed(() => guionesStore.videosPorEstado);
const filterOptions = computed(() => guionesStore.filterOptions);
const activeFilters = computed(() => guionesStore.activeFilters);

const handleFilterUpdate = (filters) => {
  guionesStore.setFilters(filters);
};

const handleEdit = (videoId) => {
  router.push(`/guiones/dashboard/${videoId}`);
};

const handleDelete = async (videoId) => {
  if (!confirm("¿Estás seguro de eliminar este video?")) return;

  try {
    await guionesStore.deleteVideoFromStore(videoId);
    toast.success("Video eliminado");
  } catch (error) {
    toast.error("Error al eliminar: " + error.message);
  }
};

onMounted(async () => {
  await guionesStore.loadVideos();
  await guionesStore.loadFilterOptions();
});
</script>
