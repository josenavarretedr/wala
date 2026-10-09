<template>
  <div
    @click="handleClick"
    class="bg-white rounded-xl shadow-sm border border-purple-200 p-4 transition-all duration-200 hover:shadow-md hover:border-purple-300 cursor-pointer relative"
  >
    <div class="absolute -top-2 -right-2 z-10">
      <div
        :class="[
          'w-10 h-10 rounded-full border-4 border-white shadow-md flex items-center justify-center',
          displayProgress.isClosed ? 'bg-emerald-500' : 'bg-purple-500',
        ]"
      >
        <Check
          v-if="displayProgress.isClosed"
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
          {{ displayProgress.label }}
        </div>
      </div>
    </div>

    <h3 class="text-base font-semibold text-gray-900 mb-1">
      {{ dossier.participantName || "Tu expediente" }}
    </h3>

    <p class="text-sm text-gray-600 mb-3 line-clamp-2">
      {{ dossier.programName || "Programa de asesorias" }}
    </p>

    <div
      v-if="displayProgress.hasCycleData"
      class="flex flex-wrap gap-1.5 mb-3"
    >
      <span
        v-if="displayProgress.currentCycleLabel"
        class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border bg-purple-50 text-purple-700 border-purple-200"
      >
        {{ displayProgress.currentCycleLabel }}
      </span>

      <span
        class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border"
        :class="
          displayProgress.planSet
            ? 'bg-blue-50 text-blue-700 border-blue-200'
            : 'bg-amber-50 text-amber-700 border-amber-200'
        "
      >
        {{ displayProgress.planSet ? "Plan seteado" : "Plan pendiente" }}
      </span>

      <span
        v-if="displayProgress.actionCount > 0"
        class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border bg-gray-50 text-gray-700 border-gray-200"
      >
        {{ displayProgress.actionCount }} acciones
      </span>
    </div>

    <div v-if="criticalAreaLabels.length" class="flex flex-wrap gap-1.5 mb-3">
      <span
        v-for="areaName in criticalAreaLabels"
        :key="areaName"
        class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border bg-rose-50 text-rose-700 border-rose-200"
      >
        {{ areaName }}
      </span>
    </div>

    <div class="space-y-2">
      <div class="w-full h-2 rounded-full bg-purple-100 overflow-hidden">
        <div
          class="h-full rounded-full bg-purple-500 transition-all duration-300"
          :style="{ width: `${displayProgress.percent}%` }"
        ></div>
      </div>

      <div class="flex items-center justify-between text-xs text-gray-500">
        <span>Avance {{ displayProgress.percent }}%</span>
        <span>
          {{ displayProgress.current }}/{{ displayProgress.total }}
          {{ displayProgress.hasCycleData ? "ciclos" : "etapas" }}
        </span>
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

const AREA_LABELS = {
  negocioFamilia: "Negocio y familia",
  marketing: "Marketing",
  compras: "Compras",
  controlStock: "Control de stock",
  costeo: "Costeo",
  registros: "Registros",
  planificacion: "Planificacion",
};

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

const displayProgress = computed(() => {
  if (!props.progress) {
    return {
      label: "Sin estado",
      percent: 0,
      current: 0,
      total: 3,
      isClosed: false,
      hasCycleData: false,
      currentCycleLabel: "",
      actionCount: 0,
      planSet: false,
    };
  }

  return {
    hasCycleData: Boolean(props.progress.hasCycleData),
    currentCycleLabel: props.progress.currentCycleLabel || "",
    actionCount: props.progress.actionCount || 0,
    planSet: Boolean(props.progress.planSet),
    label: props.progress.label || "Sin estado",
    percent: Number.isFinite(props.progress.percent)
      ? props.progress.percent
      : 0,
    current: Number.isFinite(props.progress.current)
      ? props.progress.current
      : 0,
    total: Number.isFinite(props.progress.total) ? props.progress.total : 0,
    isClosed: Boolean(props.progress.isClosed),
  };
});

const criticalAreaLabels = computed(() => {
  if (!Array.isArray(props.progress?.criticalAreaNames)) return [];

  return props.progress.criticalAreaNames
    .slice(0, 3)
    .map((areaKey) => AREA_LABELS[areaKey] || areaKey)
    .filter((label) => typeof label === "string" && label.length > 0);
});

const stepBadgeClass = computed(() => {
  if (displayProgress.value.isClosed)
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (displayProgress.value.percent >= 70)
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
