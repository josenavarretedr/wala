import { ref, onMounted, onUnmounted } from 'vue';

const isOnline = ref(typeof navigator !== 'undefined' ? navigator.onLine : true);

let listenersInitialized = false;

function handleOnline() {
  isOnline.value = true;
}

function handleOffline() {
  isOnline.value = false;
}

export function useNetworkStatus() {
  if (typeof window !== 'undefined' && !listenersInitialized) {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    listenersInitialized = true;
  }

  return {
    isOnline
  };
}
