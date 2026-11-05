<script setup>
defineProps({
  modelValue: {
    type: String,
    default: 'produccion'
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

const options = [
  {
    id: 'produccion',
    label: 'Producción',
    sublabel: 'Tanda / Receta',
    icon: '🍲',
    activeClass: 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-500/50',
    inactiveClass: 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
  },
  {
    id: 'servicio',
    label: 'Servicios',
    sublabel: 'El Minutero',
    icon: '✂️',
    activeClass: 'bg-purple-600 text-white shadow-sm ring-2 ring-purple-500/50',
    inactiveClass: 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
  },
  {
    id: 'comercio',
    label: 'Comercio',
    sublabel: 'El Mayorista',
    icon: '🏷️',
    activeClass: 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/50',
    inactiveClass: 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
  }
];

function selectOption(id) {
  emit('update:modelValue', id);
  emit('change', id);
}
</script>

<template>
  <div class="space-y-1.5">
    <div class="flex items-center justify-between">
      <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
        <span>⚙️</span>
        <span>Modalidad de Costeo de este Producto</span>
      </span>
      <span class="text-[10px] text-slate-400">Puedes mezclar modalidades</span>
    </div>

    <!-- Segmented Control Táctil (Mínimo 48px por botón) -->
    <div class="grid grid-cols-3 gap-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200">
      <button
        v-for="opt in options"
        :key="opt.id"
        type="button"
        @click="selectOption(opt.id)"
        :class="[
          'py-2.5 px-2 rounded-xl text-center transition-all duration-150 flex flex-col items-center justify-center min-h-[48px] select-none border',
          modelValue === opt.id
            ? opt.activeClass
            : opt.inactiveClass
        ]"
      >
        <span class="text-base leading-none mb-0.5">{{ opt.icon }}</span>
        <span class="text-xs font-black tracking-tight leading-tight block truncate max-w-full">
          {{ opt.label }}
        </span>
        <span
          class="text-[9px] font-semibold leading-none block truncate max-w-full"
          :class="modelValue === opt.id ? 'text-white/90' : 'text-slate-400'"
        >
          {{ opt.sublabel }}
        </span>
      </button>
    </div>
  </div>
</template>
