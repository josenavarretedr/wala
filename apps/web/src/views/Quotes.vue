<template>
  <div class="min-h-screen">
    <QuotesPanel @close="goBack" />
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import QuotesPanel from "@/components/Quotes/QuotesPanel.vue";

const router = useRouter();

const goBack = () => {
  router.back();
};
</script>
