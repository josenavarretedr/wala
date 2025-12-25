<template>
  <div
    @click="handleClick"
    class="bg-white rounded-xl shadow-sm border border-blue-200 p-4 transition-all duration-200 hover:shadow-md hover:border-blue-300 cursor-pointer"
  >
    <!-- Header -->
    <div class="flex items-start justify-between gap-3 mb-3">
      <div class="flex items-center gap-2 flex-wrap flex-1">
        <!-- Badge de Sesión -->
        <div
          class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
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
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>Sesión</span>
        </div>

        <!-- Badge Obligatoria -->
        <div
          v-if="activity.isRequired"
          class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-200"
        >
          Obligatoria
        </div>

        <!-- Badge Estado Participante -->
        <div
          v-if="userRole === 'participant' && activity.isRequired"
          :class="[
            'inline-flex items-center px-2 py-1 rounded-md text-xs font-medium',
            participantStatus === 'completed'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : participantStatus === 'absent'
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-yellow-50 text-yellow-700 border border-yellow-200',
          ]"
        >
          {{
            participantStatus === "completed"
              ? "Asistió"
              : participantStatus === "absent"
              ? "Falta"
              : "Pendiente"
          }}
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

      <!-- Drive Link (solo si existe) -->
      <div
        v-if="activity.driveLink"
        class="flex items-center gap-1.5 text-xs text-gray-500"
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
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
        <a
          :href="activity.driveLink"
          target="_blank"
          @click.stop
          class="text-blue-600 hover:text-blue-700 hover:underline"
        >
          Ver archivos
        </a>
      </div>

      <!-- Asistencia (solo facilitador) -->
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
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <span
          >{{ activity.metadata.totalParticipants || 0 }} asistentes ({{
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
    default: "facilitator", // 'facilitator' | 'participant'
  },
  participantStatus: {
    type: String,
    default: "pending", // 'completed' | 'absent' | 'pending'
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
