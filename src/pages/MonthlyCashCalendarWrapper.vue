<!-- src/pages/BasicAccountingRecordsWrapper.vue -->
<template>
  <div>
    <Suspense>
      <template #default> <ClashClosureBtn /> </template>
      <template #fallback>
        <div class="text-center p-6">Cargando racha...</div>
      </template>
    </Suspense>

    <Suspense>
      <template #default>
        <MonthlyCashCalendar />
      </template>
      <template #fallback>
        <div class="text-center p-6">
          Cargando vista mensual de cashCalendar...
        </div>
      </template>
    </Suspense>
  </div>
</template>

<script setup>
import ClashClosureBtn from "@/components/cashClosureApp/ClashClosureBtn.vue";

import MonthlyCashCalendar from "@/components/cashClosureApp/MonthlyCashCalendar.vue";
</script>
