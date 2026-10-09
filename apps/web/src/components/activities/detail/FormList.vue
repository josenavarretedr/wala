<template>
  <div
    class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
  >
    <div
      class="px-5 py-4 border-b border-gray-100 flex items-center justify-between"
    >
      <h3 class="text-base font-semibold text-gray-900">
        Respuestas recibidas
      </h3>
      <span class="text-sm text-gray-500"
        >{{ participations.length }} participación{{
          participations.length !== 1 ? "es" : ""
        }}</span
      >
    </div>

    <!-- Loading -->
    <div v-if="loading" class="p-8 text-center">
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"
      ></div>
    </div>

    <!-- Empty -->
    <div
      v-else-if="!participations.length"
      class="p-10 text-center text-gray-400"
    >
      <svg
        class="w-12 h-12 mx-auto mb-3 text-gray-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
      <p class="text-sm">Aún no hay respuestas</p>
    </div>

    <!-- Lista -->
    <div v-else class="divide-y divide-gray-100">
      <div
        v-for="p in participations"
        :key="p.id"
        class="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 cursor-pointer transition-colors group"
        @click="$emit('view-details', p)"
      >
        <!-- Avatar -->
        <div
          class="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center shrink-0 text-sm font-semibold text-green-700"
        >
          {{ getInitials(p.userName) }}
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 truncate">
            {{ p.userName }}
          </p>
          <p class="text-xs text-gray-500 truncate">
            {{ p.businessName || "—" }}
          </p>
        </div>

        <!-- Asistencia badges (campos attendance) -->
        <div v-if="attendanceFieldIds.length" class="flex gap-1.5 shrink-0">
          <div
            v-for="fieldId in attendanceFieldIds"
            :key="fieldId"
            :title="getFieldTitle(fieldId)"
            :class="[
              'w-6 h-6 rounded-full flex items-center justify-center',
              p.responses?.[fieldId]?.attended === true
                ? 'bg-green-100'
                : p.responses?.[fieldId]?.attended === false
                  ? 'bg-red-100'
                  : 'bg-gray-100',
            ]"
          >
            <svg
              v-if="p.responses?.[fieldId]?.attended === true"
              class="w-3.5 h-3.5 text-green-600"
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
              v-else-if="p.responses?.[fieldId]?.attended === false"
              class="w-3.5 h-3.5 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="3"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <span v-else class="text-gray-400 text-xs">?</span>
          </div>
        </div>

        <!-- Fecha -->
        <p class="text-xs text-gray-400 shrink-0 hidden sm:block">
          {{ formatDate(p.submittedAt) }}
        </p>

        <!-- Chevron -->
        <svg
          class="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors shrink-0"
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
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  participations: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  activityFields: { type: Array, default: () => [] },
});

defineEmits(["view-details"]);

const attendanceFieldIds = props.activityFields
  .filter((f) => f.type === "attendance")
  .map((f) => f.id);

function getFieldTitle(fieldId) {
  return props.activityFields.find((f) => f.id === fieldId)?.title ?? fieldId;
}

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function formatDate(ts) {
  if (!ts) return "—";
  const d = ts.toDate?.() ?? new Date(ts);
  return d.toLocaleDateString("es-CL", { day: "2-digit", month: "short" });
}
</script>
