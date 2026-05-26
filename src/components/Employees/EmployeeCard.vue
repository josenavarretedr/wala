<template>
  <div 
    :class="[
      'p-5 rounded-2xl border transition-all duration-200 flex items-center justify-between hover:shadow-md relative bg-white',
      employee.activo ? 'border-gray-200' : 'border-gray-200 bg-gray-50/50 opacity-70'
    ]"
  >
      <!-- Left: Info & Avatar -->
    <div class="flex items-center gap-4">
      <!-- Avatar con Iniciales -->
      <div 
        :class="[
          'w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base shadow-sm shrink-0 uppercase',
          employee.activo ? 'bg-[#E35336]/10 text-[#E35336]' : 'bg-gray-200 text-gray-500'
        ]"
      >
        {{ getInitials(employee.nombre, employee.apellidos) }}
      </div>

      <!-- Text details -->
      <div class="space-y-1">
        <h4 class="text-base font-bold text-gray-900 flex items-center gap-2">
          <span>{{ employee.nombre }} {{ employee.apellidos }}</span>
          <span 
            v-if="!employee.activo" 
            class="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded-full uppercase"
          >
            Suspendido
          </span>
        </h4>
        <p class="text-xs text-gray-500 font-medium">{{ employee.email }}</p>
        
        <!-- Puesto/Rol chip -->
        <div class="flex items-center gap-1.5 pt-1.5">
          <span class="px-2.5 py-0.5 bg-[#E35336]/10 border border-[#E35336]/20 rounded-lg text-xs font-bold text-[#E35336]">
            {{ employee.rolNombre }}
          </span>
          <span class="text-[10px] text-gray-400 font-semibold">•</span>
          <span class="text-[10px] text-gray-400 font-semibold">
            Ingreso: {{ formatDate(employee.fechaIngreso) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Right: Contextual menu button -->
    <div class="relative">
      <button 
        @click="toggleMenu" 
        class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
        </svg>
      </button>

      <!-- Dropdown Menu -->
      <div 
        v-if="isMenuOpen" 
        v-click-outside="closeMenu"
        class="absolute right-0 mt-2 w-48 bg-white border border-gray-150 rounded-2xl shadow-xl z-20 py-2 animate-pop-in"
      >
        <!-- Ver Detalle -->
        <button 
          @click="viewDetails" 
          class="w-full text-left px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-[#E35336]/10 hover:text-[#8b2413] transition-colors flex items-center gap-2"
        >
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
          </svg>
          <span>Ver perfil y actividad</span>
        </button>

        <!-- Reactivar / Suspender -->
        <button 
          v-if="employee.activo"
          @click="disableEmployee" 
          class="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
        >
          <svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
          </svg>
          <span>Suspender acceso</span>
        </button>
        
        <button 
          v-else
          @click="reactivateEmployee" 
          class="w-full text-left px-4 py-2.5 text-xs font-semibold text-green-600 hover:bg-green-50 transition-colors flex items-center gap-2"
        >
          <svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span>Reactivar acceso</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useBusinessStore } from '@/stores/businessStore';

const props = defineProps({
  employee: { type: Object, required: true }
});

const emit = defineEmits(['disable', 'reactivate']);

const router = useRouter();
const businessStore = useBusinessStore();
const isMenuOpen = ref(false);

function getInitials(nombre, apellidos) {
  const n = (nombre || '').charAt(0);
  const a = (apellidos || '').charAt(0);
  return `${n}${a}` || 'U';
}

function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
}

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value;
}

function closeMenu() {
  isMenuOpen.value = false;
}

function viewDetails() {
  closeMenu();
  const businessId = businessStore.getBusinessId;
  router.push(`/business/${businessId}/employees/${props.employee.uid}`);
}

function disableEmployee() {
  closeMenu();
  emit('disable', props.employee.uid);
}

function reactivateEmployee() {
  closeMenu();
  emit('reactivate', props.employee.uid);
}

// Custom directive click-outside to close contextual menu
const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = function(event) {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event);
      }
    };
    document.body.addEventListener('click', el.clickOutsideEvent);
  },
  unmounted(el) {
    document.body.removeEventListener('click', el.clickOutsideEvent);
  }
};
</script>

<style scoped>
.animate-pop-in {
  animation: popIn 0.15s ease-out forwards;
}
@keyframes popIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
