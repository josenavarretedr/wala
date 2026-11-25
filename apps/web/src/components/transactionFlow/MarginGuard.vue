<template>
  <div v-if="evaluation" class="mt-2 text-xs">
    <!-- Estado: OK (Verde) -->
    <div
      v-if="evaluation.status === 'ok'"
      class="flex items-center justify-between p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800"
    >
      <div class="flex items-center gap-1.5 font-medium">
        <span>🟢 Margen saludable:</span>
        <strong class="font-bold">{{ evaluation.marginPct }}%</strong>
      </div>
      <span class="text-[11px] text-emerald-600">
        Piso min: S/ {{ evaluation.floorPrice.toFixed(2) }}
      </span>
    </div>

    <!-- Estado: Debajo de Piso (Ámbar) -->
    <div
      v-else-if="evaluation.status === 'below_floor'"
      class="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 gap-1"
    >
      <div class="flex items-center gap-1.5 font-semibold">
        <span>🟡 Margen bajo:</span>
        <span>{{ evaluation.marginPct }}%</span>
        <span class="text-xs font-normal text-amber-700">
          (Piso sugerido: S/ {{ evaluation.floorPrice.toFixed(2) }})
        </span>
      </div>

      <div class="text-[11px] font-medium" :class="canBypass ? 'text-amber-700' : 'text-amber-900 font-bold'">
        <span v-if="action === 'require_manager' && !canBypass">
          🔒 Requiere autorización de Gerente
        </span>
        <span v-else-if="action === 'block'">
          ⛔ Venta bloqueada por política de negocio
        </span>
        <span v-else>
          ⚠️ Advertencia: Venta bajo margen objetivo
        </span>
      </div>
    </div>

    <!-- Estado: Debajo de Costo (Rojo Crítico) -->
    <div
      v-else-if="evaluation.status === 'below_cost'"
      class="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-800 gap-1"
    >
      <div class="flex items-center gap-1.5 font-bold">
        <span>🔴 ¡Alerta: Venta por debajo del costo!</span>
        <span class="text-xs font-normal">({{ evaluation.marginPct }}%)</span>
      </div>

      <div class="text-[11px] font-semibold text-red-700">
        Costo: S/ {{ evaluation.presentationCost.toFixed(2) }} ·
        <span v-if="evaluation.isBlocked" class="text-red-900 font-bold">
          Bloqueado
        </span>
        <span v-else class="text-red-700 font-bold">
          Pérdida asumida
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  evaluation: {
    type: Object,
    default: null, // { status, marginPct, floorPrice, presentationCost, isBlocked }
  },
  action: {
    type: String,
    default: 'warn', // 'warn' | 'require_manager' | 'block'
  },
  canBypass: {
    type: Boolean,
    default: false, // true si es gerente o tiene permiso
  },
});
</script>
