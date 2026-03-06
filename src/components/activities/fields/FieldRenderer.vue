<template>
  <component
    :is="component"
    :field="field"
    :model-value="modelValue"
    :readonly="readonly"
    :is-facilitator="isFacilitator"
    :storage-path="storagePath"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script setup>
import { computed } from "vue";
import FieldText from "./FieldText.vue";
import FieldFile from "./FieldFile.vue";
import FieldSelect from "./FieldSelect.vue";
import FieldAttendance from "./FieldAttendance.vue";

const props = defineProps({
  field: { type: Object, required: true },
  modelValue: { default: null },
  readonly: { type: Boolean, default: false },
  isFacilitator: { type: Boolean, default: false },
  storagePath: { type: String, default: "programs/uploads" },
});
defineEmits(["update:modelValue"]);

const componentMap = {
  text: FieldText,
  file: FieldFile,
  select: FieldSelect,
  attendance: FieldAttendance,
};

const component = computed(() => componentMap[props.field.type] || FieldText);
</script>
