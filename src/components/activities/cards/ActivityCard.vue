<template>
  <div
    @click="handleClick"
    class="bg-white rounded-xl shadow-sm border border-green-200 p-4 transition-all duration-200 hover:shadow-md hover:border-green-300 cursor-pointer relative"
  >
    <!-- Badge de Estado (solo para participantes) -->
    <div
      v-if="userRole === 'participant'"
      class="absolute -top-2 -right-2 z-10"
    >
      <div
        :class="[
          'w-10 h-10 rounded-full border-4 border-white shadow-md flex items-center justify-center',
          participantStatus === 'completed'
            ? 'bg-green-500'
            : participantStatus === 'in_progress'
              ? 'bg-blue-500'
              : 'bg-amber-500',
        ]"
      >
        <svg
          v-if="participantStatus === 'completed'"
          class="w-5 h-5 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="3"
            d="M5 13l4 4L19 7"
          />
        </svg>
        <svg
          v-else-if="participantStatus === 'in_progress'"
          class="w-5 h-5 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="3"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <svg
          v-else
          class="w-5 h-5 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="3"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
    </div>

    <!-- Header -->
    <div class="flex items-start justify-between gap-3 mb-3">
      <div class="flex items-center gap-2 flex-wrap flex-1">
        <!-- Badge Formulario -->
        <div
          class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200"
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
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <span>Actividad</span>
        </div>
        <!-- Campos count -->
        <!-- <div
          v-if="activity.fields?.length"
          class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-600"
        >
          {{ activity.fields.length }} campo{{
            activity.fields.length !== 1 ? "s" : ""
          }}
        </div> -->
        <!-- Badge Stage -->
        <div
          v-if="activity.stageName"
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
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 9m0 8V9m0 0L9 7"
            />
          </svg>
          <span>{{ activity.stageName }}</span>
        </div>
        <!-- Badge asistencia -->
        <div
          v-if="hasAttendanceField"
          class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
        >
          Asistencia
        </div>
      </div>

      <!-- Menú acciones (solo facilitador) -->
      <!-- <div
        v-if="userRole === 'facilitator'"
        class="flex items-center gap-1 shrink-0"
        @click.stop
      >
        <button
          @click="$emit('edit', activity)"
          class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </button>
        <button
          @click="$emit('delete', activity)"
          class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div> -->
    </div>

    <!-- Título -->
    <h3 class="text-base font-semibold text-gray-900 mb-2">
      {{ activity.title }}
    </h3>

    <!-- Descripción -->
    <p
      v-if="activity.description"
      class="text-sm text-gray-600 mb-3 line-clamp-2"
    >
      {{ activity.description }}
    </p>

    <!-- Footer -->
    <div
      class="flex items-center justify-between mt-3 pt-3 border-t border-gray-100"
    >
      <div class="flex items-center gap-1.5 text-xs text-gray-400">
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
      <div v-if="userRole === 'facilitator'" class="text-xs text-gray-400">
        {{ activity.metadata?.totalParticipants || 0 }} respuestas
      </div>
      <div
        v-else-if="participantStatus === 'completed'"
        class="text-xs text-green-600 font-medium"
      >
        Completado ✓
      </div>
      <div
        v-else-if="participantStatus === 'in_progress'"
        class="text-xs text-blue-600 font-medium"
      >
        En progreso
      </div>
      <div v-else class="text-xs text-amber-600 font-medium">Pendiente</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  activity: { type: Object, required: true },
  userRole: { type: String, default: "participant" },
  participantStatus: { type: String, default: "pending" },
});
const emit = defineEmits(["click", "edit", "delete"]);

const hasAttendanceField = computed(() =>
  (props.activity.fields || []).some((f) => f.type === "attendance"),
);

function handleClick() {
  emit("click", props.activity);
}

function formatDate(ts) {
  if (!ts) return "";
  const d = ts.toDate?.() ?? new Date(ts);
  return d.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
</script>
