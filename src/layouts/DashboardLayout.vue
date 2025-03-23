<template>
  <div>
    <Header />
    <main class="p-6">
      <Suspense>
        <template #default>
          <RouterView />
        </template>
        <template #fallback>
          <div class="p-6 text-center">Cargando vista del dashboard...</div>
        </template>
      </Suspense>
    </main>
    <Footer class="fixed bottom-0 w-full" />
  </div>
</template>

<script setup>
import Header from "@/components/LayoutCmpts/Header.vue";
import Footer from "@/components/LayoutCmpts/Dashboard/Footer.vue";
</script>
