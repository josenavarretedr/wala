<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { usePlanStore } from '@/stores/plan';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  fieldKey: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  helperText: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  sessionId: {
    type: Number,
    default: 2
  },
  businessName: {
    type: String,
    default: ''
  },
  sector: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue', 'update:dualData']);

const authStore = useAuthStore();
const planStore = usePlanStore();

// Estado reactivo local del campo
const rawText = ref(props.modelValue || '');
const consultantNotes = ref('');
const aiRefinedText = ref('');
const finalApproved = ref('');
const reviewStatus = ref('borrador'); // 'borrador' | 'pendiente_revision' | 'aprobado'
const isApprovedExpanded = ref(false); // Estado colapsable para la tarjeta de propuesta formal aprobada

// Mapeo de sessionCode para la sección en base de datos
const sectionKeyMap = {
  1: 's1_identidad_negocio',
  2: 's2_planeamiento_estrategico',
  3: 's3_cliente_propuesta_valor',
  4: 's4_estrategia_comercial',
  5: 's5_modelo_negocio_canvas',
  6: 's6_costeo_directo_recetas',
  7: 's7_presupuesto_capital_semilla',
  8: 's8_evaluacion_integral_cierre'
};

const currentSectionKey = computed(() => {
  return sectionKeyMap[props.sessionId] || `session_${props.sessionId}`;
});

const participantDni = computed(() => {
  return authStore.currentParticipant?.dni || null;
});

// Sincronizar con cambios externos de modelValue
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal !== undefined && newVal !== rawText.value) {
      rawText.value = newVal || '';
    }
  }
);

// Datos duales reactivos desde Pinia
const storedDualData = computed(() => planStore.getDualField(props.sessionId, props.fieldKey));

// Observar reactivamente el store para reflejar aprobaciones o notas del facilitador en tiempo real
watch(
  storedDualData,
  (newData) => {
    if (!newData) return;

    if (newData.rawInput && !rawText.value) {
      rawText.value = newData.rawInput;
      emit('update:modelValue', rawText.value);
    }
    if (newData.consultantNotes !== undefined) {
      consultantNotes.value = newData.consultantNotes;
    }
    if (newData.aiRefinement !== undefined) {
      aiRefinedText.value = newData.aiRefinement;
    }
    if (newData.finalApprovedText !== undefined) {
      finalApproved.value = newData.finalApprovedText || '';
    }
    if (newData.status) {
      reviewStatus.value = newData.status;
    }
  },
  { immediate: true, deep: true }
);

// Cargar estado inicial desde base de datos local y refrescar en segundo plano
onMounted(async () => {
  if (participantDni.value) {
    await planStore.loadQualitativeSection(participantDni.value, props.sessionId, currentSectionKey.value);
  }
});

// Contador de caracteres
const charCount = computed(() => rawText.value.trim().length);

// Manejo de input del usuario en el textarea principal
function handleInput(e) {
  const val = e.target.value;
  rawText.value = val;
  emit('update:modelValue', val);

  // Al modificar el texto, pasa a estado borrador
  if (reviewStatus.value !== 'borrador') {
    reviewStatus.value = 'borrador';
  }

  // Persistir en store local de forma inmediata
  persistDualState();
}

/**
 * Persiste el objeto estructurado dual en Pinia e IndexedDB
 */
async function persistDualState() {
  const dualData = {
    rawInput: rawText.value,
    consultantNotes: consultantNotes.value || '',
    aiRefinement: aiRefinedText.value || '',
    finalApprovedText: finalApproved.value || '',
    status: reviewStatus.value
  };

  emit('update:dualData', dualData);

  if (participantDni.value) {
    await planStore.saveDualField(
      participantDni.value,
      props.sessionId,
      currentSectionKey.value,
      props.fieldKey,
      dualData,
      props.label
    );
  }
}
</script>

<template>
  <div class="space-y-2.5 text-left">
    <!-- Fila Superior: Etiqueta del Campo e Indicador Visual de Estado -->
    <div class="flex items-center justify-between gap-2">
      <label :for="fieldKey" class="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1">
        <span>{{ label }}</span>
        <span v-if="required" class="text-red-500 font-normal text-xs">* Obligatorio</span>
      </label>

      <!-- Indicadores de Estado Visuales -->
      <!-- 1. Propuesta Formal Aprobada ✓ -->
      <span
        v-if="reviewStatus === 'aprobado'"
        class="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full shrink-0"
      >
        <span>✓</span>
        <span>Propuesta Formal Aprobada</span>
      </span>

      <!-- 2. Enviado para revisión del facilitador ⏳ -->
      <span
        v-else-if="reviewStatus === 'pendiente_revision'"
        class="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full shrink-0"
      >
        <span>⏳</span>
        <span>Enviado para revisión</span>
      </span>

      <!-- 3. Borrador ✏️ -->
      <span
        v-else
        class="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full shrink-0"
      >
        <span>✏️</span>
        <span>Borrador</span>
      </span>
    </div>

    <!-- Pregunta Orientativa o Helper Text -->
    <p v-if="helperText" class="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
      {{ helperText }}
    </p>

    <!-- Campo Principal: Textarea táctil para redacción en palabras propias (rawInput) -->
    <div class="relative">
      <textarea
        :id="fieldKey"
        :value="rawText"
        @input="handleInput"
        :placeholder="helperText || 'Escribe con tus propias palabras...'"
        rows="3"
        class="block w-full rounded-2xl border border-slate-300 bg-white px-3.5 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors shadow-2xs"
      ></textarea>

      <!-- Contador de caracteres sutil -->
      <div class="flex items-center justify-between mt-1 px-1 text-[11px] text-slate-400">
        <span>Tus palabras serán la base técnica del proyecto</span>
        <span :class="{ 'text-slate-500': charCount < 10, 'text-emerald-600 font-semibold': charCount >= 10 }">
          {{ charCount }} caracteres
        </span>
      </div>
    </div>

    <!-- Mensaje orientador cuando está en revisión -->
    <div
      v-if="reviewStatus === 'pendiente_revision'"
      class="text-[11px] text-amber-800 bg-amber-50/80 border border-amber-200/90 rounded-xl px-3 py-2 flex items-center gap-2 animate-fadeIn"
    >
      <span class="text-sm">⏳</span>
      <span>
        Tus respuestas están guardadas. Tu facilitador elaborará la propuesta formal con el asistente IA durante la revisión.
      </span>
    </div>

    <!-- TARJETA DESPLEGABLE (COLLAPSIBLE): MODO LECTURA DE LA PROPUESTA FORMAL APROBADA ✓ -->
    <div
      v-if="reviewStatus === 'aprobado' && finalApproved"
      class="bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-slate-50 border-2 border-emerald-400/80 rounded-2xl overflow-hidden shadow-2xs transition-all animate-fadeIn"
    >
      <!-- Cabecera Botón Táctil para Colapsar/Expandir -->
      <button
        type="button"
        @click="isApprovedExpanded = !isApprovedExpanded"
        class="w-full min-h-[48px] px-3.5 py-2.5 flex items-center justify-between gap-2 text-left bg-emerald-100/40 hover:bg-emerald-100/70 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
      >
        <div class="flex items-center gap-2 min-w-0">
          <span class="text-base shrink-0">🏛️</span>
          <div class="truncate">
            <h4 class="text-xs font-black text-emerald-950 uppercase tracking-wider truncate">
              Propuesta Formal Aprobada ✓
            </h4>
            <p class="text-[10px] text-emerald-700 font-medium truncate">
              {{ isApprovedExpanded ? 'Toca para ocultar la propuesta' : 'Toca para desplegar la redacción oficial' }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <span class="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full hidden sm:inline-block">
            Documento Oficial
          </span>
          <span
            class="w-6 h-6 rounded-full bg-emerald-200/80 text-emerald-800 flex items-center justify-center text-xs font-bold transition-transform duration-200"
            :class="{ 'rotate-180': isApprovedExpanded }"
          >
            ▼
          </span>
        </div>
      </button>

      <!-- Contenido Desplegable -->
      <div
        v-show="isApprovedExpanded"
        class="p-3.5 pt-2.5 border-t border-emerald-200/80 space-y-2.5 animate-fadeIn"
      >
        <div class="bg-white rounded-xl p-3.5 border border-emerald-200 text-xs sm:text-sm text-slate-900 leading-relaxed shadow-2xs font-medium whitespace-pre-wrap">
          {{ finalApproved }}
        </div>

        <p class="text-[11px] text-emerald-700 font-medium flex items-center gap-1.5">
          <span>✓</span>
          <span>Esta es la redacción técnica aprobada por tu facilitador para presentar al comité de capital semilla.</span>
        </p>
      </div>
    </div>
  </div>
</template>
