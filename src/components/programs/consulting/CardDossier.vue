<template>
  <div
    @click="handleClick"
    class="bg-white rounded-xl shadow-sm border border-purple-200 p-4 transition-all duration-200 hover:shadow-md hover:border-purple-300 cursor-pointer relative"
  >
    <div class="absolute -top-2 -right-2 z-10">
      <div
        :class="[
          'w-10 h-10 rounded-full border-4 border-white shadow-md flex items-center justify-center',
          progress.isClosed ? 'bg-emerald-500' : 'bg-purple-500',
        ]"
      >
        <Check
          v-if="progress.isClosed"
          class="w-5 h-5 text-white"
          stroke-width="2.8"
        />
        <GraphUp v-else class="w-5 h-5 text-white" />
      </div>
    </div>

    <div class="flex items-start justify-between gap-3 mb-3">
      <div class="flex items-center gap-2 flex-wrap flex-1">
        <div
          class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200"
        >
          <GraphUp class="w-3 h-3" />
          <span>Expediente</span>
        </div>

        <div
          class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border"
          :class="stepBadgeClass"
        >
          {{ progress.label }}
        </div>
      </div>
    </div>

    <h3 class="text-base font-semibold text-gray-900 mb-1">
      {{ dossier.participantName || "Tu expediente" }}
    </h3>

    <p class="text-sm text-gray-600 mb-3 line-clamp-2">
      {{ dossier.programName || "Programa de asesorias" }}
    </p>

    <div class="space-y-2">
      <div class="w-full h-2 rounded-full bg-purple-100 overflow-hidden">
        <div
          class="h-full rounded-full bg-purple-500 transition-all duration-300"
          :style="{ width: `${progress.percent}%` }"
        ></div>
      </div>

      <div class="flex items-center justify-between text-xs text-gray-500">
        <span>Avance {{ progress.percent }}%</span>
        <span> {{ progress.current }}/{{ progress.total }} etapas </span>
      </div>
    </div>

    <div
      class="flex items-center justify-between mt-3 pt-3 border-t border-gray-100"
    >
      <div class="flex items-center gap-1.5 text-xs text-gray-400">
        <Calendar class="w-3 h-3" />
        <span>{{ formatDate(dossier.updatedAt || dossier.createdAt) }}</span>
      </div>
      <div class="text-xs text-purple-600 font-medium">Ver expediente</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { GraphUp, Check, Calendar } from "@iconoir/vue";

const props = defineProps({
  dossier: {
    type: Object,
    required: true,
  },
  progress: {
    type: Object,
    default: () => ({
      label: "Sin estado",
      percent: 0,
      current: 0,
      total: 12,
      isClosed: false,
    }),
  },
});

const emit = defineEmits(["click"]);

const stepBadgeClass = computed(() => {
  if (props.progress.isClosed)
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (props.progress.percent >= 70)
    return "bg-blue-50 text-blue-700 border-blue-200";
  return "bg-amber-50 text-amber-700 border-amber-200";
});

function handleClick() {
  emit("click", props.dossier);
}

function formatDate(timestamp) {
  if (!timestamp) return "Sin fecha";

  let date;
  if (typeof timestamp.toDate === "function") {
    date = timestamp.toDate();
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else {
    date = new Date(timestamp);
  }

  if (Number.isNaN(date.getTime())) return "Sin fecha";

  return date.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
</script>
