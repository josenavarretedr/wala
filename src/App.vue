<template>
  <Suspense>
    <template #default>
      <router-view />
    </template>
    <template #fallback>
      <div>Cargando ...</div>
    </template>
  </Suspense>
</template>

<script setup>
import { RouterView } from "vue-router";
</script>
