<template>
  <div
    @click="handleClick"
    class="bg-white rounded-xl shadow-sm border border-purple-200 p-4 transition-all duration-200 hover:shadow-md hover:border-purple-300 cursor-pointer"
  >
    <!-- Header -->
    <div class="flex items-start justify-between gap-3 mb-3">
      <div class="flex items-center gap-2 flex-wrap flex-1">
        <!-- Badge de Monitoreo -->
        <div
          class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200"
        >
          <svg
            class="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
          <span>Monitoreo</span>
        </div>

        <!-- Badge Obligatoria -->
        <div
          v-if="activity.isRequired"
          class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-200"
        >
          Obligatoria
        </div>

        <!-- Badge con evidencia -->
        <div
          v-if="activity.requiredEvidence"
          class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200"
        >
          <svg
            class="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span>Requiere fotos</span>
        </div>

        <!-- Badge Estado Participante -->
        <div
          v-if="userRole === 'participant' && activity.isRequired"
          :class="[
            'inline-flex items-center px-2 py-1 rounded-md text-xs font-medium',
            participantStatus === 'completed'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-yellow-50 text-yellow-700 border border-yellow-200',
          ]"
        >
          {{ participantStatus === "completed" ? "Completado" : "Pendiente" }}
        </div>
      </div>
    </div>

    <!-- Título -->
    <h3 class="text-base font-semibold text-gray-900 mb-2">
      {{ activity.title }}
    </h3>

    <!-- Descripción -->
    <p class="text-sm text-gray-600 mb-3 line-clamp-2">
      {{ activity.description }}
    </p>

    <!-- Metadata -->
    <div class="space-y-2">
      <!-- Fecha -->
      <div class="flex items-center gap-1.5 text-xs text-gray-500">
        <svg
          class="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>{{ formatDate(activity.createdAt) }}</span>
      </div>

      <!-- Participantes monitoreados (solo facilitador) -->
      <div
        v-if="userRole === 'facilitator' && activity.metadata"
        class="flex items-center gap-1.5 text-xs text-gray-600"
      >
        <svg
          class="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span
          >{{ activity.metadata.totalParticipants || 0 }} monitoreados ({{
            Math.round(activity.metadata.completionRate || 0)
          }}%)</span
        >
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  activity: {
    type: Object,
    required: true,
  },
  userRole: {
    type: String,
    default: "facilitator",
  },
  participantStatus: {
    type: String,
    default: "pending", // 'completed' | 'pending'
  },
});

const emit = defineEmits(["click", "edit", "delete"]);

function handleClick() {
  emit("click", props.activity);
}

function formatDate(timestamp) {
  if (!timestamp) return "";

  let date;
  if (timestamp.toDate) {
    date = timestamp.toDate();
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else {
    date = new Date(timestamp);
  }

  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
</script>

<style scoped>
/* Transiciones suaves */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Hover effects para touch devices */
@media (hover: hover) {
  .hover\:shadow-md:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
}
</style>
