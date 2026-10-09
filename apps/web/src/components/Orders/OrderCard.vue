<template>
  <div
    draggable="true"
    @dragstart="onDragStart"
    @click="$emit('click', order)"
    class="bg-white rounded-xl border border-gray-150 p-4 shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-200 cursor-grab active:cursor-grabbing transform hover:-translate-y-0.5 group relative"
  >
    <!-- Handle visual para arrastrar (líneas verticales discretas) -->
    <div class="absolute right-3 top-3 flex gap-0.5 opacity-0 group-hover:opacity-40 transition-opacity duration-200">
      <div class="w-1 h-3 bg-gray-400 rounded-full"></div>
      <div class="w-1 h-3 bg-gray-400 rounded-full"></div>
    </div>

    <!-- Canal de venta y fecha relativa -->
    <div class="flex items-center justify-between mb-2">
      <span
        :class="[
          'px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase',
          getChannelClass(order.salesChannel),
        ]"
      >
        {{ getChannelLabel(order.salesChannel) }}
      </span>
      <span class="text-[10px] font-medium text-gray-400 flex items-center gap-1">
        <Clock class="w-3 h-3 text-gray-300" />
        {{ getRelativeTime(order.createdAt) }}
      </span>
    </div>

    <!-- Código de orden y total -->
    <div class="flex items-baseline justify-between mb-2">
      <span class="text-xs font-bold text-gray-500 font-mono tracking-tight group-hover:text-orange-600 transition-colors duration-150">
        {{ order.orderNumber }}
      </span>
      <span class="text-sm font-extrabold text-gray-800">
        S/ {{ (order.total || 0).toFixed(2) }}
      </span>
    </div>

    <!-- Cliente y Delivery info -->
    <div class="pt-2.5 border-t border-gray-50 space-y-1.5">
      <div class="flex items-center gap-1.5 text-xs text-gray-605">
        <User class="w-3.5 h-3.5 text-gray-400 shrink-0" />
        <span class="font-semibold text-gray-700 truncate max-w-[150px]">
          {{ order.clientName || 'Cliente Anónimo' }}
        </span>
      </div>

      <!-- Dirección si es delivery -->
      <div
        v-if="order.salesChannel === 'DELIVERY' && order.deliveryAddress"
        class="flex items-center gap-1.5 text-[11px] text-gray-500"
      >
        <MapPin class="w-3.5 h-3.5 text-orange-500 shrink-0" />
        <span class="truncate max-w-[155px]" :title="order.deliveryAddress">
          {{ order.deliveryAddress }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Clock, User, MapPin } from "@iconoir/vue";

const props = defineProps({
  order: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["dragstart", "click"]);

const onDragStart = (event) => {
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", props.order.id);
  emit("dragstart", props.order);
};

const getChannelLabel = (channel) => {
  const labels = {
    LOCAL: "Mesa",
    TAKEAWAY: "Llevar",
    DELIVERY: "Delivery",
  };
  return labels[channel] || channel || "Mesa";
};

const getChannelClass = (channel) => {
  const classes = {
    LOCAL: "bg-blue-50 text-blue-600 border border-blue-100",
    TAKEAWAY: "bg-purple-50 text-purple-600 border border-purple-100",
    DELIVERY: "bg-orange-50 text-orange-600 border border-orange-100",
  };
  return classes[channel] || "bg-gray-50 text-gray-600 border border-gray-100";
};

const getRelativeTime = (date) => {
  if (!date) return "";
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return "hace un momento";
  if (diffMins < 60) return `hace ${diffMins} min`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `hace ${diffHours} h`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `hace ${diffDays} d`;
};
</script>

<style scoped>
/* Transición en drag */
div[draggable="true"]:active {
  cursor: grabbing;
}
</style>
