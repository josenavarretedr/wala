<template>
  <div
    @click="$emit('click')"
    class="group bg-white rounded-xl border border-gray-200 hover:border-teal-300 hover:shadow-lg transition-all cursor-pointer overflow-hidden"
  >
    <!-- Header del programa -->
    <div class="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-4">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-white line-clamp-1">
            {{ program.name }}
          </h3>
          <p class="text-teal-50 text-sm mt-1">
            {{ program.organizationName }}
          </p>
        </div>

        <div
          class="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg"
        >
          <Community class="w-6 h-6 text-white" />
        </div>
      </div>
    </div>

    <!-- Contenido -->
    <div class="px-6 py-4 space-y-4">
      <!-- Descripción -->
      <p class="text-sm text-gray-600 line-clamp-2">
        {{ program.description }}
      </p>

      <!-- Metadata -->
      <div class="flex items-center gap-4 text-xs text-gray-500">
        <div class="flex items-center gap-1.5">
          <IconoirClock class="w-4 h-4" />
          <span>{{ program.metadata?.duration || "N/A" }}</span>
        </div>

        <div class="flex items-center gap-1.5">
          <IconoirCalendar class="w-4 h-4" />
          <span>{{ formatDate(program.metadata?.startDate) }}</span>
        </div>

        <div v-if="program.membership" class="flex items-center gap-1.5">
          <CheckCircle class="w-4 h-4 text-green-500" />
          <span class="text-green-600 font-medium">Activo</span>
        </div>
      </div>

      <!-- Fases -->
      <div
        v-if="program.metadata?.phases?.length"
        class="pt-2 border-t border-gray-100"
      >
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-xs font-medium text-gray-500">Fases:</span>
          <div
            v-for="(phase, index) in program.metadata.phases.slice(0, 3)"
            :key="index"
            class="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700"
          >
            {{ phase }}
          </div>
          <span
            v-if="program.metadata.phases.length > 3"
            class="text-xs text-gray-500"
          >
            +{{ program.metadata.phases.length - 3 }} más
          </span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="px-6 py-3 bg-gray-50 border-t border-gray-100">
      <div class="flex items-center justify-between text-sm">
        <span class="text-gray-500">
          Unido el {{ formatDate(program.membership?.joinedAt) }}
        </span>

        <span
          class="text-teal-600 font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-1"
        >
          Ver detalles
          <IconoirNavArrowRight class="w-4 h-4" />
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  Community,
  IconoirClock,
  IconoirCalendar,
  CheckCircle,
  IconoirNavArrowRight,
} from "@iconoir/vue";

defineProps({
  program: {
    type: Object,
    required: true,
  },
});

defineEmits(["click"]);

function formatDate(timestamp) {
  if (!timestamp) return "N/A";

  try {
    let date;
    if (timestamp.toDate) {
      date = timestamp.toDate();
    } else if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      date = new Date(timestamp);
    }

    return date.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch (error) {
    return "N/A";
  }
}
</script>
