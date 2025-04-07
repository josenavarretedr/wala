<template>
  <div class="flex gap-2 justify-center py-10">
    <div class="w-3 h-3 bg-cyan-600 rounded-full animate-pop"></div>
    <div class="w-3 h-3 bg-cyan-600 rounded-full animate-pop delay-150"></div>
    <div class="w-3 h-3 bg-cyan-600 rounded-full animate-pop delay-300"></div>
  </div>
</template>

<style scoped>
@keyframes pop {
  0% {
    transform: scale(1);
    opacity: 0.9;
  }
  50% {
    transform: scale(1.6);
    opacity: 0.4;
  }
  100% {
    transform: scale(1);
    opacity: 0.9;
  }
}
.animate-pop {
  animation: pop 1.2s infinite ease-in-out;
}
.delay-150 {
  animation-delay: 0.15s;
}
.delay-300 {
  animation-delay: 0.3s;
}
</style>
