<template>
  <div
    class="bg-white rounded-xl border shadow-sm overflow-hidden transition-all duration-200"
    :class="[
      isLocked
        ? 'border-gray-200 opacity-70'
        : isCompleted
          ? 'border-green-200 ring-1 ring-green-100'
          : 'border-gray-200 hover:border-green-300 hover:shadow-md',
    ]"
  >
    <div class="p-4">
      <div class="flex items-start gap-3">
        <!-- Número de orden -->
        <div
          class="flex items-center justify-center w-9 h-9 rounded-lg text-sm font-bold shrink-0"
          :class="
            isLocked
              ? 'bg-gray-100 text-gray-400'
              : isCompleted
                ? 'bg-green-100 text-green-700'
                : 'bg-green-50 text-green-600'
          "
        >
          <template v-if="isLocked">
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
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </template>
          <template v-else-if="isCompleted">
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
                d="M5 13l4 4L19 7"
              />
            </svg>
          </template>
          <template v-else>
            {{ order }}
          </template>
        </div>

        <!-- Contenido principal -->
        <div class="flex-1 min-w-0">
          <h3 class="text-sm font-semibold text-gray-900 truncate">
            {{ stage.name }}
          </h3>

          <!-- Badge prerequisito (si está bloqueado) -->
          <p
            v-if="isLocked && prerequisiteStageName"
            class="text-xs text-amber-600 mt-0.5"
          >
            Requiere completar "{{ prerequisiteStageName }}"
          </p>

          <!-- Modo facilitador: métricas -->
          <template v-if="userRole === 'facilitator'">
            <div class="mt-2 flex items-center gap-4 text-xs text-gray-500">
              <span>{{ metrics.activityCount }} actividades</span>
              <span v-if="metrics.participantCount > 0">
                {{ metrics.participantsCompleted }}/{{
                  metrics.participantCount
                }}
                completaron
              </span>
            </div>
            <!-- Barra de progreso global -->
            <div
              v-if="metrics.activityCount > 0 && metrics.participantCount > 0"
              class="mt-2"
            >
              <div class="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  class="h-1.5 rounded-full transition-all duration-300"
                  :class="
                    metrics.avgCompletion === 100
                      ? 'bg-green-500'
                      : 'bg-green-400'
                  "
                  :style="{ width: metrics.avgCompletion + '%' }"
                />
              </div>
              <p class="text-xs text-gray-400 mt-1">
                {{ metrics.avgCompletion }}% promedio
              </p>
            </div>
          </template>

          <!-- Modo participante: progreso personal -->
          <template v-else>
            <div v-if="!isLocked" class="mt-2">
              <div
                class="flex items-center justify-between text-xs text-gray-500 mb-1"
              >
                <span
                  >{{ progress.completed }}/{{
                    progress.total
                  }}
                  actividades</span
                >
                <span
                  :class="
                    progress.percentage === 100
                      ? 'text-green-600 font-medium'
                      : ''
                  "
                >
                  {{ progress.percentage }}%
                </span>
              </div>
              <div class="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  class="h-1.5 rounded-full transition-all duration-300"
                  :class="
                    progress.percentage === 100
                      ? 'bg-green-500'
                      : 'bg-green-400'
                  "
                  :style="{ width: progress.percentage + '%' }"
                />
              </div>
            </div>
            <div v-else class="mt-2">
              <p class="text-xs text-gray-400">Etapa bloqueada</p>
            </div>
          </template>
        </div>

        <!-- Acciones facilitador: flechas de reorden -->
        <div
          v-if="userRole === 'facilitator'"
          class="flex flex-col items-center gap-0.5 shrink-0"
        >
          <button
            @click.stop="$emit('move-up')"
            :disabled="isFirst"
            type="button"
            class="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors"
            title="Subir"
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
                d="M5 15l7-7 7 7"
              />
            </svg>
          </button>
          <button
            @click.stop="$emit('move-down')"
            :disabled="isLast"
            type="button"
            class="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors"
            title="Bajar"
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
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>

        <!-- Flecha de navegación -->
        <button
          v-if="!isLocked"
          @click.stop="$emit('go-to-stage')"
          class="p-2 text-gray-400 hover:text-green-600 transition-colors shrink-0"
          title="Ver etapa"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  stage: {
    type: Object,
    required: true,
  },
  order: {
    type: Number,
    default: 1,
  },
  userRole: {
    type: String,
    default: "participant", // 'facilitator' | 'participant'
  },
  // Participant mode
  progress: {
    type: Object,
    default: () => ({ total: 0, completed: 0, percentage: 0 }),
  },
  isLocked: {
    type: Boolean,
    default: false,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  prerequisiteStageName: {
    type: String,
    default: null,
  },
  // Facilitator mode
  metrics: {
    type: Object,
    default: () => ({
      activityCount: 0,
      avgCompletion: 0,
      participantsCompleted: 0,
      participantCount: 0,
    }),
  },
  // Order controls
  isFirst: {
    type: Boolean,
    default: false,
  },
  isLast: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["move-up", "move-down", "go-to-stage"]);
</script>
