<template>
  <div>
    <Header />
    <main class="p-6">
      <Suspense>
        <template #default>
          <RouterView />
        </template>
        <template #fallback>
          <div class="flex items-center justify-center h-screen">
            <div
              class="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"
            ></div>
          </div>
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
