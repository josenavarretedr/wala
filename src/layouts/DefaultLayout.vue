<template>
  <div>
    <Header />
    <main class="p-6">
      <RouterView />
    </main>
    <Footer />
  </div>
</template>

<script setup>
import Header from "@/components/LayoutCmpts/Header.vue";
import Footer from "@/components/LayoutCmpts/Footer.vue";
</script>
