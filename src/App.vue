<template>
  <!-- Full Screen Loader -->
  <FullScreenLoader />

  <!-- Main App Content -->
  <router-view />
</template>

<script setup>
import { RouterView } from "vue-router";
import FullScreenLoader from "@/components/ui/FullScreenLoader.vue";
</script>
