<template>
  <div class="space-y-8 max-w-5xl mx-auto py-4">
    <!-- Back button & Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="space-y-1">
        <router-link 
          :to="`/business/${businessStore.getBusinessId}/employees`" 
          class="inline-flex items-center gap-1 text-xs font-bold text-[#E35336] hover:text-[#c2412b] hover:underline mb-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          <span>Volver al Equipo</span>
        </router-link>
        
        <div v-if="employee" class="flex items-center gap-3">
          <div class="w-12 h-12 bg-[#E35336]/10 text-[#E35336] rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
            {{ employee.nombre.charAt(0) }}{{ employee.apellidos.charAt(0) }}
          </div>
          <div>
            <h1 class="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <span>{{ employee.nombre }} {{ employee.apellidos }}</span>
              <span v-if="!employee.activo" class="px-2.5 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded-full uppercase">
                Suspendido
              </span>
            </h1>
            <p class="text-xs text-gray-500 font-medium">
              Colaborador activo como <strong>{{ employee.rolNombre }}</strong> • Ingresó el {{ formatDate(employee.fechaIngreso) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Quick action buttons -->
      <div v-if="employee" class="flex items-center gap-2">
        <button 
          v-if="employee.activo"
          @click="toggleStatus" 
          class="px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-xl text-xs font-bold transition-colors"
        >
          Suspender Acceso
        </button>
        <button 
          v-else
          @click="toggleStatus" 
          class="px-4 py-2 bg-green-50 hover:bg-green-100 border border-green-200 text-green-600 rounded-xl text-xs font-bold transition-colors"
        >
          Reactivar Acceso
        </button>
      </div>
    </div>

    <!-- Cargar -->
    <div v-if="isLoading" class="flex flex-col items-center py-20 space-y-4">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E35336]"></div>
      <p class="text-gray-500 text-sm">Cargando detalles...</p>
    </div>

    <!-- Contenido -->
    <div v-else-if="employee" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Left / Column 1 & 2: Editor de permisos -->
      <div class="lg:col-span-2 space-y-6">
        
        <!-- Editor Card -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold text-gray-900">Accesos y Permisos</h3>
            <button 
              @click="savePermissions" 
              :disabled="isSaving || !employee.activo"
              class="px-4 py-2 bg-[#E35336] hover:bg-[#c2412b] disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold text-white rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5"
            >
              <span v-if="isSaving">Guardando...</span>
              <span v-else>Guardar Cambios</span>
            </button>
          </div>

          <!-- Componente Editor de Permisos -->
          <EmployeePermissionsEditor 
            ref="editorRef"
            v-model:modulosAcceso="editedPermissions.modulosAcceso"
            v-model:canCreate="editedPermissions.canCreate"
            v-model:canEdit="editedPermissions.canEdit"
            v-model:canDelete="editedPermissions.canDelete"
          />
        </div>

      </div>

      <!-- Right / Column 3: Actividad reciente -->
      <div class="space-y-6">
        <h3 class="text-lg font-bold text-gray-900">Actividad Reciente</h3>

        <!-- Lista de actividad -->
        <div v-if="activity.length === 0" class="bg-white border border-gray-150 rounded-2xl p-6 text-center space-y-2">
          <Page class="w-12 h-12 text-gray-300 mx-auto" />
          <h4 class="font-bold text-sm text-gray-800">Sin operaciones registradas</h4>
          <p class="text-[10px] text-gray-400">Cuando este colaborador registre ingresos o egresos, aparecerán listados aquí en tiempo real.</p>
        </div>

        <div v-else class="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          <div 
            v-for="item in activity" 
            :key="item.id"
            class="p-4 bg-white border border-gray-200 rounded-2xl shadow-sm flex items-center justify-between gap-4"
          >
            <div class="space-y-0.5">
              <span 
                :class="[
                  'px-2 py-0.5 rounded-full text-[9px] font-bold uppercase',
                  item.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                ]"
              >
                {{ item.type === 'income' ? 'Venta' : 'Gasto' }}
              </span>
              <h4 class="font-bold text-xs text-gray-900 truncate max-w-[180px]">{{ item.description || 'Sin descripción' }}</h4>
              <p class="text-[9px] text-gray-400">{{ formatDateTime(item.createdAt) }} • Cuenta: {{ item.account }}</p>
            </div>
            
            <div class="text-right shrink-0">
              <span class="text-xs font-bold text-gray-900 block">S/. {{ item.amount.toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useBusinessStore } from '@/stores/businessStore';
import { useEmployeeStore } from '@/stores/employeeStore';
import EmployeePermissionsEditor from '@/components/Employees/EmployeePermissionsEditor.vue';
import { Page } from '@iconoir/vue';

const route = useRoute();
const businessStore = useBusinessStore();
const employeeStore = useEmployeeStore();

const isLoading = ref(true);
const isSaving = ref(false);
const employee = ref(null);
const activity = ref([]);
const editorRef = ref(null);

const editedPermissions = ref({
  modulosAcceso: [],
  canCreate: true,
  canEdit: false,
  canDelete: false
});

onMounted(async () => {
  await loadEmployeeDetails();
});

async function loadEmployeeDetails() {
  isLoading.value = true;
  try {
    const businessId = businessStore.getBusinessId;
    const employeeId = route.params.employeeId;
    
    // Cargar empleados de la tienda si no están cargados
    if (employeeStore.employees.length === 0) {
      await employeeStore.loadEmployees(businessId);
    }
    
    const emp = employeeStore.employees.find(e => e.uid === employeeId);
    if (emp) {
      employee.value = emp;
      editedPermissions.value = {
        modulosAcceso: [...emp.modulosAcceso],
        canCreate: emp.canCreate !== false,
        canEdit: emp.canEdit === true,
        canDelete: emp.canDelete === true
      };
      
      // Cargar actividad e historial del empleado
      activity.value = await employeeStore.loadEmployeeActivity(businessId, employeeId);
    }
  } catch (err) {
    console.error('Error al cargar detalles de colaborador:', err);
  } finally {
    isLoading.value = false;
  }
}

async function savePermissions() {
  if (isSaving.value) return;
  isSaving.value = true;
  try {
    const businessId = businessStore.getBusinessId;
    const employeeId = route.params.employeeId;
    
    const editorValues = editorRef.value.getValues();
    const roleConfig = {
      rolNombre: employee.value.rolNombre,
      ...editorValues
    };
    
    await employeeStore.updateEmployeePermissions(businessId, employeeId, roleConfig);
    alert('¡Permisos de colaborador actualizados exitosamente!');
  } catch (err) {
    console.error('Error al guardar permisos de colaborador:', err);
  } finally {
    isSaving.value = false;
  }
}

async function toggleStatus() {
  if (!employee.value) return;
  const businessId = businessStore.getBusinessId;
  const employeeId = employee.value.uid;
  
  if (employee.value.activo) {
    const reason = prompt('Por favor, ingresa el motivo de la suspensión (opcional):');
    if (reason !== null) {
      await employeeStore.disableEmployee(businessId, employeeId, reason);
      employee.value.activo = false;
    }
  } else {
    if (confirm('¿Estás seguro de reactivar este colaborador?')) {
      await employeeStore.reactivateEmployee(businessId, employeeId);
      employee.value.activo = true;
    }
  }
}

function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatDateTime(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' }) + ' ' + d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
}
</script>
