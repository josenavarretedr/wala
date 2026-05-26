<template>
  <div class="space-y-6 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
    <div>
      <h3 class="text-lg font-bold text-gray-900 mb-1">Módulos permitidos</h3>
      <p class="text-xs text-gray-500">Selecciona a qué secciones de la aplicación podrá ingresar el trabajador.</p>
    </div>

    <!-- Grid de módulos -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div 
        v-for="mod in MODULE_DEFINITIONS" 
        :key="mod.key"
        @click="toggleModule(mod.key)"
        :class="[
          'p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer flex items-start gap-3 select-none',
          localModulosAcceso.includes(mod.key)
            ? 'bg-[#E35336]/5 border-[#E35336] text-[#8b2413] shadow-sm'
            : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
        ]"
      >
        <!-- Icono genérico en base a svg -->
        <div 
          :class="[
            'p-2 rounded-lg shrink-0',
            localModulosAcceso.includes(mod.key) ? 'bg-[#E35336] text-white' : 'bg-gray-100 text-gray-500'
          ]"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
          </svg>
        </div>
        
        <div class="flex-1">
          <span class="font-bold text-sm block">{{ mod.label }}</span>
          <span class="text-xs opacity-80 leading-relaxed block mt-0.5">{{ mod.description }}</span>
        </div>
        
        <!-- Checkbox custom -->
        <div 
          :class="[
            'w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5',
            localModulosAcceso.includes(mod.key) ? 'border-[#E35336] bg-[#E35336] text-white' : 'border-gray-300 bg-white'
          ]"
        >
          <svg v-if="localModulosAcceso.includes(mod.key)" class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- Divider -->
    <div class="h-px bg-gray-100 my-6"></div>

    <!-- Permisos globales de acción -->
    <div>
      <h3 class="text-lg font-bold text-gray-900 mb-1">Acciones globales</h3>
      <p class="text-xs text-gray-500">Define qué nivel de modificación tiene permitido realizar el trabajador.</p>
    </div>

    <div class="space-y-4">
      <!-- Crear registros -->
      <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
        <div class="space-y-0.5 flex-1 pr-4">
          <span class="font-bold text-sm text-gray-900 block">Registrar / Crear movimientos</span>
          <span class="text-xs text-gray-500 block">Permite registrar nuevas ventas, gastos o productos.</span>
        </div>
        <!-- Toggle button -->
        <button 
          type="button"
          @click="localCanCreate = !localCanCreate"
          :class="[
            'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
            localCanCreate ? 'bg-[#E35336]' : 'bg-gray-200'
          ]"
        >
          <span 
            :class="[
              'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
              localCanCreate ? 'translate-x-5' : 'translate-x-0'
            ]"
          ></span>
        </button>
      </div>

      <!-- Editar registros -->
      <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
        <div class="space-y-0.5 flex-1 pr-4">
          <span class="font-bold text-sm text-gray-900 block">Modificar / Editar</span>
          <span class="text-xs text-gray-500 block">Permite editar la información de movimientos o catálogo de productos existentes.</span>
        </div>
        <button 
          type="button"
          @click="localCanEdit = !localCanEdit"
          :class="[
            'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
            localCanEdit ? 'bg-[#E35336]' : 'bg-gray-200'
          ]"
        >
          <span 
            :class="[
              'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
              localCanEdit ? 'translate-x-5' : 'translate-x-0'
            ]"
          ></span>
        </button>
      </div>

      <!-- Eliminar registros -->
      <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
        <div class="space-y-0.5 flex-1 pr-4">
          <span class="font-bold text-sm text-gray-900 block">Eliminar / Borrar</span>
          <span class="text-xs text-gray-500 block">Permite anular ventas, gastos o borrar productos del catálogo. (Precaución)</span>
        </div>
        <button 
          type="button"
          @click="localCanDelete = !localCanDelete"
          :class="[
            'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
            localCanDelete ? 'bg-[#E35336]' : 'bg-gray-200'
          ]"
        >
          <span 
            :class="[
              'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
              localCanDelete ? 'translate-x-5' : 'translate-x-0'
            ]"
          ></span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { MODULE_DEFINITIONS } from '@/config/roles/moduleDefinitions';

const props = defineProps({
  modulosAcceso: { type: Array, default: () => [] },
  canCreate: { type: Boolean, default: true },
  canEdit: { type: Boolean, default: false },
  canDelete: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modulosAcceso', 'update:canCreate', 'update:canEdit', 'update:canDelete', 'change']);

// Copias locales reactivas
const localModulosAcceso = ref([...props.modulosAcceso]);
const localCanCreate = ref(props.canCreate);
const localCanEdit = ref(props.canEdit);
const localCanDelete = ref(props.canDelete);

function toggleModule(key) {
  const index = localModulosAcceso.value.indexOf(key);
  if (index > -1) {
    localModulosAcceso.value.splice(index, 1);
  } else {
    localModulosAcceso.value.push(key);
  }
}

// Watchers para emitir cambios
watch(localModulosAcceso, (newVal) => {
  emit('update:modulosAcceso', newVal);
  emit('change', getValues());
}, { deep: true });

watch(localCanCreate, (newVal) => {
  emit('update:canCreate', newVal);
  emit('change', getValues());
});

watch(localCanEdit, (newVal) => {
  emit('update:canEdit', newVal);
  emit('change', getValues());
});

watch(localCanDelete, (newVal) => {
  emit('update:canDelete', newVal);
  emit('change', getValues());
});

// Sincronizar props entrantes si cambian desde afuera
watch(() => props.modulosAcceso, (newVal) => {
  localModulosAcceso.value = [...newVal];
}, { deep: true });

watch(() => props.canCreate, (newVal) => { localCanCreate.value = newVal; });
watch(() => props.canEdit, (newVal) => { localCanEdit.value = newVal; });
watch(() => props.canDelete, (newVal) => { localCanDelete.value = newVal; });

function getValues() {
  return {
    modulosAcceso: localModulosAcceso.value,
    canCreate: localCanCreate.value,
    canEdit: localCanEdit.value,
    canDelete: localCanDelete.value
  };
}

defineExpose({
  getValues
});
</script>
