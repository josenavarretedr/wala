<template>
  <!-- Full Screen Loader -->
  <FullScreenLoader />

  <!-- Main App Content -->
  <RouterView />

  <!-- Toast Notification System -->
  <ToastNotification />
</template>

<script setup>
import { RouterView } from "vue-router";
import FullScreenLoader from "@/components/ui/FullScreenLoader.vue";
import ToastNotification from "@/components/ui/ToastNotification.vue";
</script>
