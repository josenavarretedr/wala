<template>
  <div class="space-y-3">
    <!-- Empty State -->
    <div
      v-if="!sortedActivities.length"
      class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center"
    >
      <div
        class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
      >
        <svg
          class="w-8 h-8 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No hay actividades</h3>
      <p class="text-sm text-gray-600">
        {{ emptyMessage }}
      </p>
    </div>

    <!-- Lista de Actividades (Timeline) -->
    <component
      v-for="activity in sortedActivities"
      :key="activity.id"
      :is="getCardComponent(activity.type)"
      :activity="activity"
      :user-role="userRole"
      :participant-status="getParticipantStatus(activity)"
      @click="handleActivityClick"
      @edit="$emit('edit', $event)"
      @delete="$emit('delete', $event)"
      class="transition-all duration-200"
    />
  </div>
</template>

<script setup>
import { computed } from "vue";
import SessionCard from "./cards/SessionCard.vue";
import MonitoringCard from "./cards/MonitoringCard.vue";
import EventCard from "./cards/EventCard.vue";

const props = defineProps({
  activities: {
    type: Array,
    default: () => [],
  },
  userRole: {
    type: String,
    default: "facilitator", // 'facilitator' | 'participant'
  },
  currentUserId: {
    type: String,
    default: "",
  },
  participations: {
    type: Array,
    default: () => [],
  },
  emptyMessage: {
    type: String,
    default: "Las actividades aparecerán aquí cuando se creen",
  },
});

const emit = defineEmits(["click", "edit", "delete"]);

// Ordenar actividades: más recientes primero
const sortedActivities = computed(() => {
  return [...props.activities].sort((a, b) => {
    // Para eventos, usar startDate
    if (a.type === "event" && b.type === "event") {
      return new Date(b.startDate) - new Date(a.startDate);
    }

    // Para el resto, usar createdAt
    const dateA = getTimestamp(a.createdAt);
    const dateB = getTimestamp(b.createdAt);

    return dateB - dateA;
  });
});

function getTimestamp(date) {
  if (!date) return 0;
  if (date.toDate) return date.toDate().getTime();
  if (date instanceof Date) return date.getTime();
  return new Date(date).getTime();
}

function getCardComponent(type) {
  const components = {
    session: SessionCard,
    monitoring: MonitoringCard,
    event: EventCard,
  };
  return components[type] || SessionCard;
}

function getParticipantStatus(activity) {
  if (props.userRole !== "participant" || !props.currentUserId) {
    return "pending";
  }

  // Buscar participación del usuario en esta actividad
  const participation = props.participations.find(
    (p) => p.activityId === activity.id && p.userId === props.currentUserId
  );

  if (!participation) return "pending";

  // Para sesiones y eventos
  if (activity.type === "session" || activity.type === "event") {
    if (participation.attendance?.attended) return "completed";
    if (participation.attendance?.attended === false) return "absent";
    return "pending";
  }

  // Para monitoreos
  if (activity.type === "monitoring") {
    return participation.overallScore ? "completed" : "pending";
  }

  return "pending";
}

function handleActivityClick(activity) {
  emit("click", activity);
}
</script>
