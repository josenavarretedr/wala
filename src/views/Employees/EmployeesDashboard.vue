<template>
  <div class="space-y-8 max-w-5xl mx-auto py-4">
    <!-- Top Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white/40 backdrop-blur-md p-6 rounded-3xl border border-white/20 shadow-sm">
      <div class="space-y-1">
        <h1 class="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
          <Group class="w-8 h-8 text-gray-800" />
          <span>Equipo de Trabajo</span>
        </h1>
        <p class="text-sm text-gray-500 font-medium">Gestiona accesos diferenciados y roles de tus colaboradores.</p>
      </div>
      
      <button 
        @click="isInviteModalOpen = true" 
        class="inline-flex justify-center items-center gap-2 px-5 py-3.5 bg-[#E35336] hover:bg-[#c2412b] text-white font-bold rounded-xl shadow-md active:scale-[0.98] transition-all text-sm shrink-0"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <span>Invitar Colaborador</span>
      </button>
    </div>

    <!-- Alert de límites si aplica (Suscripción Free limita a 3) -->
    <div 
      v-if="businessStore.limits?.employees?.max <= 3" 
      class="bg-[#E35336]/10 border border-[#E35336]/20 rounded-2xl p-4 flex items-start gap-3"
    >
      <LightBulb class="w-5 h-5 text-[#E35336] shrink-0 mt-0.5" />
      <div class="flex-1">
        <h4 class="font-bold text-sm text-[#8b2413]">Plan Gratuito: Límite de 3 colaboradores</h4>
        <p class="text-xs text-[#8b2413]/90 mt-0.5">
          Tu plan actual permite tener hasta 3 personas trabajando. Si necesitas un equipo más grande, considera adquirir 
          <router-link :to="`/business/${businessStore.getBusinessId}/plans`" class="font-bold underline text-[#E35336] hover:text-[#c2412b]">WALA Premium</router-link> para colaboradores ilimitados.
        </p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex flex-col items-center py-20 space-y-4">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E35336]"></div>
      <p class="text-gray-500 text-sm">Cargando equipo...</p>
    </div>

    <!-- Listado principal -->
    <div v-else class="space-y-8">
      
      <!-- 1. Colaboradores Activos -->
      <div class="space-y-4">
        <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2">
          <span>Habilitados</span>
          <span class="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">
            {{ activeEmployees.length }}
          </span>
        </h3>
        
        <div v-if="activeEmployees.length === 0" class="bg-white border border-gray-150 rounded-2xl p-8 text-center space-y-3">
          <Community class="w-12 h-12 text-gray-300 mx-auto" />
          <h4 class="font-bold text-gray-800">Aún no hay colaboradores habilitados</h4>
          <p class="text-xs text-gray-500 max-w-sm mx-auto">
            Invita a cajeros, meseros o vendedores para que registren operaciones sin ver información sensible como tus utilidades o configuraciones de cuenta.
          </p>
          <button @click="isInviteModalOpen = true" class="text-xs font-bold text-[#E35336] hover:text-[#c2412b] underline">
            Invitar mi primer colaborador ahora
          </button>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EmployeeCard 
            v-for="emp in activeEmployees" 
            :key="emp.uid" 
            :employee="emp"
            @disable="openDisableDialog"
          />
        </div>
      </div>

      <!-- 2. Invitaciones Pendientes -->
      <div class="space-y-4">
        <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2">
          <span>Enlaces e invitaciones pendientes</span>
          <span class="px-2 py-0.5 bg-[#E35336]/10 text-[#E35336] text-xs font-bold rounded-full">
            {{ activeInvitations.length }}
          </span>
        </h3>

        <div v-if="activeInvitations.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            v-for="inv in activeInvitations" 
            :key="inv.id"
            class="p-5 bg-white border border-gray-200 rounded-2xl shadow-sm flex items-center justify-between gap-4"
          >
            <div class="space-y-1">
              <span class="text-xs font-bold text-[#E35336] flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-[#E35336] animate-ping"></span>
                Pendiente de unión
              </span>
              <h4 class="font-bold text-gray-900">Enlace para puesto: {{ inv.rolNombre }}</h4>
              <p class="text-[10px] text-gray-400">Creado hace {{ formatTimeAgo(inv.createdAt) }} • Expira en 7 días</p>
            </div>

            <div class="flex items-center gap-2">
              <button 
                @click="copyInviteLink(inv.token)" 
                class="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 transition-colors"
              >
                Copiar
              </button>
              <button 
                @click="cancelInvitation(inv.id)"
                class="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
                title="Cancelar invitación"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        <p v-else class="text-xs text-gray-400 font-medium">No hay invitaciones activas esperando registro.</p>
      </div>

      <!-- 3. Colaboradores Suspendidos -->
      <div v-if="disabledEmployees.length > 0" class="space-y-4">
        <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2">
          <span>Accesos suspendidos</span>
          <span class="px-2 py-0.5 bg-red-50 text-red-600 text-xs font-bold rounded-full">
            {{ disabledEmployees.length }}
          </span>
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EmployeeCard 
            v-for="emp in disabledEmployees" 
            :key="emp.uid" 
            :employee="emp"
            @reactivate="reactivateEmployee"
          />
        </div>
      </div>

    </div>

    <!-- Modales -->
    <InviteEmployeeModal 
      :is-open="isInviteModalOpen"
      @close="isInviteModalOpen = false"
      @created="onInviteCreated"
    />

    <!-- Dialogo de Desactivación -->
    <div v-if="isDisableDialogOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div class="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-gray-100 space-y-4">
        <h3 class="text-lg font-bold text-gray-900">Suspender acceso de colaborador</h3>
        <p class="text-xs text-gray-500 leading-relaxed">
          El colaborador ya no podrá ingresar a la información de este negocio ni registrar nuevas operaciones. Sus datos históricos permanecerán intactos para auditoría.
        </p>
        
        <div class="space-y-2">
          <label class="block text-xs font-bold text-gray-700">Razón / Motivo (Opcional)</label>
          <textarea 
            v-model="disableReason" 
            class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#E35336] focus:border-transparent text-xs"
            placeholder="Ej. Fin de contrato temporal, cambio de sucursal, etc."
            rows="3"
          ></textarea>
        </div>

        <div class="flex items-center justify-end gap-3 pt-2">
          <button @click="closeDisableDialog" class="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-700 transition-colors">
            Cancelar
          </button>
          <button @click="confirmDisable" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-md">
            Suspender Acceso
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useBusinessStore } from '@/stores/businessStore';
import { useEmployeeStore } from '@/stores/employeeStore';
import { useInvitationStore } from '@/stores/invitationStore';
import EmployeeCard from '@/components/Employees/EmployeeCard.vue';
import InviteEmployeeModal from '@/components/Employees/InviteEmployeeModal.vue';
import { Group, LightBulb, Community } from '@iconoir/vue';

const businessStore = useBusinessStore();
const employeeStore = useEmployeeStore();
const invitationStore = useInvitationStore();

const isLoading = ref(true);
const isInviteModalOpen = ref(false);

// Estado de desactivación/suspensión
const isDisableDialogOpen = ref(false);
const selectedEmployeeUid = ref(null);
const disableReason = ref('');

const activeEmployees = computed(() => employeeStore.employees.filter(emp => emp.activo));
const disabledEmployees = computed(() => employeeStore.employees.filter(emp => !emp.activo));
const activeInvitations = computed(() => invitationStore.invitations.filter(inv => inv.status === 'active'));

onMounted(async () => {
  await refreshData();
});

async function refreshData() {
  isLoading.value = true;
  try {
    const businessId = businessStore.getBusinessId;
    if (businessId) {
      await Promise.all([
        employeeStore.loadEmployees(businessId),
        invitationStore.loadInvitations(businessId)
      ]);
    }
  } catch (err) {
    console.error('Error al cargar datos del panel de empleados:', err);
  } finally {
    isLoading.value = false;
  }
}

function onInviteCreated() {
  const businessId = businessStore.getBusinessId;
  invitationStore.loadInvitations(businessId);
}

function copyInviteLink(token) {
  const domain = window.location.origin;
  const link = `${domain}/invite/${token}`;
  navigator.clipboard.writeText(link);
  alert('¡Enlace de invitación copiado!');
}

async function cancelInvitation(invitationId) {
  if (confirm('¿Estás seguro de cancelar esta invitación? El enlace ya no funcionará.')) {
    const businessId = businessStore.getBusinessId;
    await invitationStore.cancelInvitation(businessId, invitationId);
  }
}

// Control del diálogo de desactivación
function openDisableDialog(uid) {
  selectedEmployeeUid.value = uid;
  disableReason.value = '';
  isDisableDialogOpen.value = true;
}

function closeDisableDialog() {
  isDisableDialogOpen.value = false;
  selectedEmployeeUid.value = null;
}

async function confirmDisable() {
  if (!selectedEmployeeUid.value) return;
  try {
    const businessId = businessStore.getBusinessId;
    await employeeStore.disableEmployee(businessId, selectedEmployeeUid.value, disableReason.value);
    closeDisableDialog();
  } catch (err) {
    console.error('Error suspendiendo empleado:', err);
  }
}

async function reactivateEmployee(uid) {
  if (confirm('¿Deseas reactivar y habilitar nuevamente el acceso de este colaborador?')) {
    try {
      const businessId = businessStore.getBusinessId;
      await employeeStore.reactivateEmployee(businessId, uid);
    } catch (err) {
      console.error('Error reactivando empleado:', err);
    }
  }
}

function formatTimeAgo(date) {
  if (!date) return '';
  const now = new Date();
  const d = new Date(date);
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  
  if (diffMins < 60) return `${diffMins} min`;
  if (diffHours < 24) return `${diffHours} horas`;
  return `${Math.floor(diffHours / 24)} días`;
}
</script>
