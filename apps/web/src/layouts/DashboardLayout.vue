<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <Header />

    <!-- Main content area -->
    <main class="flex-1 p-6 bg-gray-50">
      <Suspense>
        <template #default>
          <RouterView />
        </template>
        <template #fallback>
          <div class="p-6 text-center text-gray-500">
            Cargando vista del dashboard...
          </div>
        </template>
      </Suspense>
    </main>

    <!-- Footer fijo al final -->
    <Footer class="fixed bottom-0 left-0 w-full" />
  </div>
</template>

<script setup>
import Header from "@/components/LayoutCmpts/Header.vue";
import Footer from "@/components/LayoutCmpts/Dashboard/Footer.vue";
</script>
