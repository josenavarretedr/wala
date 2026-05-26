<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
    
    <!-- Modal container -->
    <div class="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-gray-150 flex flex-col max-h-[90vh] overflow-hidden transform scale-100 transition-all duration-300">
      
      <!-- Header -->
      <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div>
          <h2 class="text-xl font-bold text-gray-900">Invitar Colaborador</h2>
          <p class="text-xs text-gray-500 mt-0.5">Suma personas al equipo con accesos diferenciados.</p>
        </div>
        <button @click="closeModal" class="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Content (Scrollable) -->
      <div class="flex-1 overflow-y-auto p-6 space-y-6">
        
        <!-- STEP 1: Seleccionar Perfil -->
        <div v-if="step === 1" class="space-y-6">
          <div>
            <span class="text-xs font-bold text-[#E35336] uppercase tracking-widest block mb-1">Paso 1 de 2</span>
            <h3 class="text-lg font-bold text-gray-900">Selecciona el perfil sugerido para tu negocio</h3>
            <p class="text-xs text-gray-500">Ofrecemos plantillas configuradas según tu rubro de <strong>{{ getIndustryLabel() }}</strong>.</p>
          </div>

          <!-- Grid de plantillas -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div 
              v-for="tmpl in templates" 
              :key="tmpl.rolNombre"
              @click="selectTemplate(tmpl)"
              :class="[
                'p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex items-start gap-4 select-none relative hover:shadow-md',
                selectedTemplateName === tmpl.rolNombre
                  ? 'border-[#E35336] bg-[#E35336]/10 text-[#8b2413]'
                  : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
              ]"
            >
              <div class="p-2.5 bg-gray-50 rounded-xl shrink-0 flex items-center justify-center">
                <component :is="getIconComponent(tmpl.icon)" class="w-7 h-7 text-gray-600" />
              </div>
              <div class="flex-1">
                <span class="font-bold text-base block">{{ tmpl.rolNombre }}</span>
                <span class="text-xs opacity-80 mt-1 block leading-relaxed">{{ tmpl.description }}</span>
                
                <!-- Badge de módulos cantidad -->
                <span class="inline-flex items-center gap-1 text-[10px] font-bold text-[#E35336] mt-3 px-2 py-0.5 bg-[#E35336]/10 rounded-full">
                  {{ tmpl.modulosAcceso.length }} módulos habilitados
                </span>
              </div>
            </div>

            <!-- Opción personalizado -->
            <div 
              @click="selectCustom"
              :class="[
                'p-5 rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer flex items-start gap-4 select-none hover:shadow-md',
                selectedTemplateName === 'Personalizado'
                  ? 'border-[#E35336] bg-[#E35336]/10 text-[#8b2413]'
                  : 'border-gray-300 bg-white hover:border-gray-400 text-gray-700'
              ]"
            >
              <div class="p-2.5 bg-gray-50 rounded-xl shrink-0 flex items-center justify-center">
                <Settings class="w-7 h-7 text-gray-600" />
              </div>
              <div class="flex-1">
                <span class="font-bold text-base block">Perfil Personalizado</span>
                <span class="text-xs opacity-80 mt-1 block leading-relaxed">Configura los permisos y accesos desde cero para este colaborador.</span>
                <span class="inline-flex items-center gap-1 text-[10px] font-bold text-gray-600 mt-3 px-2 py-0.5 bg-gray-100 rounded-full">
                  Configuración libre
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- STEP 2: Personalizar / Confirmar -->
        <div v-else-if="step === 2" class="space-y-6">
          <div>
            <span class="text-xs font-bold text-[#E35336] uppercase tracking-widest block mb-1">Paso 2 de 2</span>
            <h3 class="text-lg font-bold text-gray-900">
              Confirmar accesos para <span class="text-[#E35336]">"{{ inviteData.rolNombre }}"</span>
            </h3>
            <p class="text-xs text-gray-500">Revisa los accesos del perfil antes de generar el link de invitación.</p>
          </div>

          <!-- Si es sugerido preconfigurado y no editable -->
          <div v-if="selectedTemplateName !== 'Personalizado'" class="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-sm font-bold text-gray-800">Nombre del Perfil:</span>
              <span class="text-sm font-bold text-[#E35336]">{{ inviteData.rolNombre }}</span>
            </div>
            
            <div class="h-px bg-gray-200"></div>

            <div class="space-y-2">
              <span class="text-xs font-bold text-gray-500 uppercase tracking-wider block">Módulos que verá:</span>
              <div class="flex flex-wrap gap-2">
                <span 
                  v-for="modKey in inviteData.modulosAcceso" 
                  :key="modKey"
                  class="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700"
                >
                  {{ getModuleLabel(modKey) }}
                </span>
              </div>
            </div>

            <div class="h-px bg-gray-200"></div>

            <div class="grid grid-cols-3 gap-2 text-center">
              <div class="p-3 bg-white border border-gray-200 rounded-xl">
                <span class="text-xs text-gray-500 block">Registrar</span>
                <span :class="['text-xs font-bold block mt-1', inviteData.canCreate ? 'text-green-600' : 'text-red-500']">
                  {{ inviteData.canCreate ? 'Permitido' : 'Bloqueado' }}
                </span>
              </div>
              <div class="p-3 bg-white border border-gray-200 rounded-xl">
                <span class="text-xs text-gray-500 block">Editar</span>
                <span :class="['text-xs font-bold block mt-1', inviteData.canEdit ? 'text-green-600' : 'text-red-500']">
                  {{ inviteData.canEdit ? 'Permitido' : 'Bloqueado' }}
                </span>
              </div>
              <div class="p-3 bg-white border border-gray-200 rounded-xl">
                <span class="text-xs text-gray-500 block">Eliminar</span>
                <span :class="['text-xs font-bold block mt-1', inviteData.canDelete ? 'text-green-600' : 'text-red-500']">
                  {{ inviteData.canDelete ? 'Permitido' : 'Bloqueado' }}
                </span>
              </div>
            </div>
            
            <div class="text-center pt-2">
              <button @click="enableCustomization" class="text-xs text-[#E35336] hover:text-[#c2412b] font-bold underline inline-flex items-center gap-1">
                <Settings class="w-3.5 h-3.5" />
                <span>Deseo ajustar o personalizar este perfil</span>
              </button>
            </div>
          </div>

          <!-- Si es personalizado o se habilitó edición -->
          <div v-else class="space-y-4">
            <div class="space-y-2">
              <label class="block text-sm font-bold text-gray-700">Nombre del Perfil Personalizado</label>
              <input 
                v-model="inviteData.rolNombre" 
                type="text" 
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#E35336] focus:border-transparent transition-all text-sm font-semibold"
                placeholder="Ej. Personal de Caja, Mozo Nocturno, etc."
                required
              />
            </div>

            <!-- Editor de permisos -->
            <EmployeePermissionsEditor 
              v-model:modulosAcceso="inviteData.modulosAcceso"
              v-model:canCreate="inviteData.canCreate"
              v-model:canEdit="inviteData.canEdit"
              v-model:canDelete="inviteData.canDelete"
            />
          </div>
        </div>

        <!-- STEP 3: Enlace Generado -->
        <div v-else-if="step === 3" class="space-y-6 py-4 text-center">
          <div class="inline-flex p-4 bg-green-500/10 rounded-full text-green-600 mb-2">
            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          
          <div>
            <h3 class="text-xl font-bold text-gray-900">¡Enlace de invitación creado!</h3>
            <p class="text-xs text-gray-500 mt-1">Comparte este enlace con el colaborador para que se registre e ingrese directamente.</p>
          </div>

          <!-- Link container -->
          <div class="bg-gray-50 border border-gray-200 rounded-2xl p-4 max-w-md mx-auto flex items-center justify-between gap-4">
            <span class="text-xs font-mono font-bold text-[#8b2413] truncate flex-1 text-left select-all">
              {{ generatedLink }}
            </span>
            <button 
              @click="copyLink" 
              class="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-700 shadow-sm shrink-0 flex items-center gap-1"
            >
              <span>{{ isCopied ? '¡Copiado!' : 'Copiar' }}</span>
            </button>
          </div>

          <!-- Acciones secundarias -->
          <div class="max-w-md mx-auto space-y-3 pt-4">
            <button 
              @click="shareOnWhatsApp" 
              class="w-full py-3 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 text-sm active:scale-[0.98] transition-all"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.504-5.714-1.466L0 24zm12.008-2.073c1.802 0 3.568-.483 5.113-1.4l.366-.217 3.805.996-.983-3.708.238-.378c.957-1.522 1.462-3.29 1.462-5.127.002-5.514-4.422-10.007-9.882-10.007-5.46 0-9.885 4.494-9.885 10.009.001 1.838.484 3.606 1.403 5.126l.24.382-1.002 3.654 3.743-.981.365.22c1.503.899 3.235 1.376 5.074 1.376h.008z"/>
              </svg>
              <span>Compartir por WhatsApp</span>
            </button>
            
            <button @click="resetFlow" class="w-full py-3 px-4 bg-[#E35336] hover:bg-[#c2412b] text-white font-bold rounded-xl shadow-md text-sm active:scale-[0.98] transition-all">
              Listo, volver al equipo
            </button>
          </div>
        </div>

      </div>

      <!-- Footer (para pasos 1 y 2) -->
      <div v-if="step < 3" class="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
        <button 
          @click="prevStep" 
          :disabled="step === 1"
          class="px-4 py-2 border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-gray-700 rounded-xl transition-colors"
        >
          Atrás
        </button>
        
        <button 
          v-if="step === 1"
          @click="nextStep" 
          :disabled="!selectedTemplateName"
          class="px-5 py-2.5 bg-[#E35336] hover:bg-[#c2412b] disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold text-white rounded-xl transition-all shadow-md active:scale-95"
        >
          Continuar
        </button>
        
        <button 
          v-else-if="step === 2"
          @click="generateInvitationLink" 
          :disabled="isGenerating || !inviteData.rolNombre.trim() || inviteData.modulosAcceso.length === 0"
          class="px-5 py-2.5 bg-[#E35336] hover:bg-[#c2412b] disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold text-white rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5"
        >
          <span v-if="isGenerating">Generando...</span>
          <span v-else>Generar Link de Invitación</span>
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useBusinessStore } from '@/stores/businessStore';
import { useInvitationStore } from '@/stores/invitationStore';
import { getTemplatesForIndustry } from '@/config/roles/roleTemplates';
import { MODULE_DEFINITIONS } from '@/config/roles/moduleDefinitions';
import EmployeePermissionsEditor from './EmployeePermissionsEditor.vue';
import { User, Wallet, BoxIso, Page, Settings } from '@iconoir/vue';

const getIconComponent = (iconName) => {
  const iconMap = {
    User,
    Wallet,
    BoxIso,
    Page,
    Settings
  };
  return iconMap[iconName] || User;
};

const props = defineProps({
  isOpen: { type: Boolean, default: false }
});

const emit = defineEmits(['close', 'created']);

const businessStore = useBusinessStore();
const invitationStore = useInvitationStore();

const step = ref(1);
const templates = ref([]);
const selectedTemplateName = ref('');
const isGenerating = ref(false);
const generatedLink = ref('');
const isCopied = ref(false);

const inviteData = ref({
  rolNombre: '',
  modulosAcceso: [],
  canCreate: true,
  canEdit: false,
  canDelete: false
});

// Cargar plantillas al abrir el modal
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    step.value = 1;
    selectedTemplateName.value = '';
    const industry = businessStore.business?.industry || 'otro';
    templates.value = getTemplatesForIndustry(industry);
    isCopied.value = false;
  }
});

function getIndustryLabel() {
  const labels = {
    ferreteria: 'Ferretería',
    reposteria: 'Repostería',
    libreria: 'Librería',
    restaurante: 'Restaurante',
    farmacia: 'Farmacia',
    otro: 'Otro rubro'
  };
  const ind = businessStore.business?.industry || 'otro';
  return labels[ind] || ind;
}

function selectTemplate(tmpl) {
  selectedTemplateName.value = tmpl.rolNombre;
  inviteData.value = {
    rolNombre: tmpl.rolNombre,
    modulosAcceso: [...tmpl.modulosAcceso],
    canCreate: tmpl.canCreate !== false,
    canEdit: tmpl.canEdit === true,
    canDelete: tmpl.canDelete === true
  };
}

function selectCustom() {
  selectedTemplateName.value = 'Personalizado';
  inviteData.value = {
    rolNombre: '',
    modulosAcceso: [],
    canCreate: true,
    canEdit: false,
    canDelete: false
  };
}

function enableCustomization() {
  selectedTemplateName.value = 'Personalizado';
}

function getModuleLabel(key) {
  const mod = MODULE_DEFINITIONS.find(m => m.key === key);
  return mod ? mod.label : key;
}

function nextStep() {
  if (step.value === 1 && selectedTemplateName.value) {
    step.value = 2;
  }
}

function prevStep() {
  if (step.value === 2) {
    step.value = 1;
  }
}

async function generateInvitationLink() {
  if (isGenerating.value) return;
  isGenerating.value = true;
  try {
    const businessId = businessStore.getBusinessId;
    const businessName = businessStore.getBusinessName;
    
    const inv = await invitationStore.createInvitation(businessId, businessName, inviteData.value);
    
    // Armar enlace completo de invitación
    const domain = window.location.origin;
    generatedLink.value = `${domain}/invite/${inv.token}`;
    
    step.value = 3;
    emit('created');
  } catch (err) {
    console.error('Error creating invitation link:', err);
  } finally {
    isGenerating.value = false;
  }
}

function copyLink() {
  navigator.clipboard.writeText(generatedLink.value);
  isCopied.value = true;
  setTimeout(() => {
    isCopied.value = false;
  }, 2000);
}

function shareOnWhatsApp() {
  const businessName = businessStore.getBusinessName;
  const roleName = inviteData.value.rolNombre;
  const message = encodeURIComponent(
    `¡Hola! Te invito a unirte a nuestro equipo en *${businessName}* con el puesto de *${roleName}*.\n\n` +
    `Regístrate e ingresa a tu panel usando este enlace:\n${generatedLink.value}`
  );
  window.open(`https://api.whatsapp.com/send?text=${message}`, '_blank');
}

function resetFlow() {
  emit('close');
}

function closeModal() {
  emit('close');
}
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.25s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
