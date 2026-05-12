<template>
  <div class="h-full flex flex-col bg-gray-50/50">
    <!-- Header principal -->
    <header class="bg-white border-b border-gray-100 px-4 py-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between max-w-7xl mx-auto">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-teal-50 text-teal-600 rounded-lg">
            <ChatBubble class="w-6 h-6" />
          </div>
          <div>
            <h1 class="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Asesoría
            </h1>
            <p class="text-sm text-gray-500 mt-0.5">
              Gestiona tus consultas y asesorías
            </p>
          </div>
        </div>
        
        <button
          @click="createNewConsulting"
          class="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors shadow-sm font-medium text-sm"
        >
          <Plus class="w-4 h-4" />
          <span>Nueva Consulta</span>
        </button>
      </div>
    </header>

    <!-- Contenido principal -->
    <main class="flex-1 overflow-y-auto">
      <div class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        
        <!-- Estado de carga -->
        <div v-if="loading" class="flex flex-col items-center justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p class="mt-4 text-sm text-gray-500">Cargando asesorías...</p>
        </div>

        <!-- Estado vacío -->
        <div v-else-if="consultings.length === 0" class="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-2xl border border-gray-100 border-dashed">
          <div class="w-16 h-16 bg-teal-50 text-teal-500 rounded-full flex items-center justify-center mb-4">
            <ChatBubble class="w-8 h-8" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-1">Aún no tienes asesorías</h3>
          <p class="text-gray-500 max-w-sm mb-6 text-sm">
            Crea tu primera consulta para recibir ayuda y consejos sobre tu negocio.
          </p>
          <button
            @click="createNewConsulting"
            class="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm shadow-sm"
          >
            <Plus class="w-4 h-4" />
            <span>Crear primera consulta</span>
          </button>
        </div>

        <!-- Lista de asesorías -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            v-for="consulting in consultings" 
            :key="consulting.id"
            class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <div class="flex items-start justify-between mb-3">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700">
                {{ consulting.status || 'Activa' }}
              </span>
              <span class="text-xs text-gray-400">{{ formatDate(consulting.createdAt) }}</span>
            </div>
            <h3 class="text-base font-semibold text-gray-900 mb-1">{{ consulting.title || 'Consulta sin título' }}</h3>
            <p class="text-sm text-gray-500 line-clamp-2 mb-4">{{ consulting.description || 'Sin descripción' }}</p>
          </div>
        </div>
        
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { ChatBubble, Plus } from '@iconoir/vue';
import { useRoute } from 'vue-router';
import { useConsultingApp } from '@/composables/useConsultingApp';

const route = useRoute();
const businessId = computed(() => route.params.businessId);

const { consultings, loading, error, fetchConsultings } = useConsultingApp();

onMounted(async () => {
  if (businessId.value) {
    await fetchConsultings(businessId.value);
  }
});

const createNewConsulting = () => {
  // TODO: Implementar modal o redirección para crear consulta
  console.log('Crear nueva consulta');
  alert('Funcionalidad de crear nueva consulta próximamente');
};

const formatDate = (dateValue) => {
  if (!dateValue) return '';
  const date = dateValue.toDate ? dateValue.toDate() : new Date(dateValue);
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric', month: 'short', day: 'numeric'
  }).format(date);
};
</script>
