<template>
  <div class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
    <div class="overflow-x-auto">
      <table class="min-w-full border-separate border-spacing-0">
        <thead>
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              class="border-b border-gray-200 bg-gray-50 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-600"
            >
              {{ column.label }}
            </th>
            <th class="w-16 border-b border-gray-200 bg-gray-50 px-3 py-2"></th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(row, index) in modelValue" :key="index" class="align-top">
            <td
              v-for="column in columns"
              :key="`${column.key}-${index}`"
              class="border-b border-gray-100 px-2 py-2"
            >
              <input
                :type="column.type || 'text'"
                :placeholder="column.placeholder || ''"
                :value="row[column.key]"
                :step="column.type === 'number' ? '0.01' : undefined"
                :min="column.type === 'number' ? '0' : undefined"
                @input="updateCell(index, column.key, $event.target.value)"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
              />
            </td>

            <td class="border-b border-gray-100 px-2 py-2 text-right">
              <button
                type="button"
                class="inline-flex rounded-lg p-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="modelValue.length <= minRows"
                @click="removeRow(index)"
                title="Eliminar fila"
              >
                <Trash class="h-4 w-4" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-4">
      <button
        type="button"
        @click="addRow"
        class="inline-flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-medium text-teal-700 transition hover:bg-teal-100"
      >
        <Plus class="h-4 w-4" />
        {{ addLabel }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { Plus, Trash } from "@iconoir/vue";

const props = defineProps({
  modelValue: {
    type: Array,
    required: true,
  },
  columns: {
    type: Array,
    required: true,
  },
  minRows: {
    type: Number,
    default: 1,
  },
  addLabel: {
    type: String,
    default: "Agregar fila",
  },
});

const emit = defineEmits(["update:modelValue"]);

const buildEmptyRow = () => {
  return props.columns.reduce((acc, column) => {
    acc[column.key] = "";
    return acc;
  }, {});
};

const cloneRows = () => props.modelValue.map((row) => ({ ...row }));

const updateCell = (index, key, value) => {
  const next = cloneRows();
  next[index][key] = value;
  emit("update:modelValue", next);
};

const addRow = () => {
  emit("update:modelValue", [...cloneRows(), buildEmptyRow()]);
};

const removeRow = (index) => {
  if (props.modelValue.length <= props.minRows) return;
  const next = cloneRows();
  next.splice(index, 1);
  emit("update:modelValue", next);
};
</script>
