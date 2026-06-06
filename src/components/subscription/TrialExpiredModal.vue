<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto">
      <!-- Backdrop -->
      <div @click="handleDismiss" class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm"></div>

      <!-- Modal Card -->
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 scale-95 translate-y-4"
        enter-to-class="opacity-100 scale-100 translate-y-0"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 scale-100 translate-y-0"
        leave-to-class="opacity-0 scale-95 translate-y-4"
      >
        <div class="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-10 p-6 sm:p-8 text-center">
          <!-- Close button -->
          <button 
            @click="handleDismiss" 
            class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Icon Banner -->
          <div class="mx-auto w-16 h-16 bg-amber-50 border border-amber-100 text-amber-600 rounded-2xl flex items-center justify-center text-3xl mb-5 shadow-sm">
            ⏰
          </div>

          <h3 class="text-xl font-extrabold text-gray-900 leading-snug">
            Tu prueba gratuita del Plan Pro ha terminado
          </h3>
          
          <p class="text-sm text-gray-500 mt-2">
            El período de prueba de 5 días para tu negocio ha expirado. Tu cuenta ha vuelto al plan Free básico.
          </p>

          <!-- Feature comparison / what they lose -->
          <div class="my-6 p-4 rounded-xl bg-gray-50 border border-gray-100 text-left space-y-3">
            <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider">¿Qué funcionalidades se han bloqueado?</h4>
            
            <ul class="space-y-2 text-xs text-gray-600">
              <li class="flex items-center gap-2">
                <span class="text-red-500 text-sm">🔒</span>
                <span><strong>Reportes Avanzados:</strong> Gráficos y análisis de ingresos vs egresos.</span>
              </li>
              <li class="flex items-center gap-2">
                <span class="text-red-500 text-sm">🔒</span>
                <span><strong>Exportación de Datos:</strong> Descargas de Excel, PDF y CSV.</span>
              </li>
              <li class="flex items-center gap-2">
                <span class="text-red-500 text-sm">🔒</span>
                <span><strong>Personalización de Marca:</strong> Compartir contenido con tu propio logotipo.</span>
              </li>
              <li class="flex items-center gap-2">
                <span class="text-red-500 text-sm">🔒</span>
                <span><strong>Límite de Colaboradores:</strong> Capacidad para añadir a tu equipo sin restricciones.</span>
              </li>
            </ul>
          </div>

          <!-- Actions -->
          <div class="flex flex-col gap-3">
            <button 
              @click="handleUpgrade"
              class="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-1.5"
            >
              <span>Adquirir Plan Pro</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            
            <button 
              @click="handleDismiss"
              class="w-full py-2.5 px-5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 font-semibold text-xs transition-colors border border-gray-200/60"
            >
              Continuar con Plan Free (Limitado)
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useSubscription } from '@/composables/useSubscription'
import { useBusinessStore } from '@/stores/businessStore'

const { subscription, goToPlans } = useSubscription()
const businessStore = useBusinessStore()

const isOpen = ref(false)

const businessId = computed(() => businessStore.getBusinessId)

const checkExpirationState = () => {
  if (!businessId.value) return
  
  const sub = subscription.value
  
  // Condición: trial usado, actualmente en free, y modal no descartado aún
  const isExpired = sub?.trialUsed && (!sub?.plan || sub?.plan === 'free')
  const storageKey = `trial_expired_modal_dismissed_${businessId.value}`
  const alreadyShown = localStorage.getItem(storageKey) === 'true'
  
  if (isExpired && !alreadyShown) {
    isOpen.value = true
  } else {
    isOpen.value = false
  }
}

// Watch for store state changes to trigger modal
watch(() => [subscription.value, businessId.value], () => {
  checkExpirationState()
}, { deep: true })

onMounted(() => {
  checkExpirationState()
})

const handleDismiss = () => {
  if (businessId.value) {
    const storageKey = `trial_expired_modal_dismissed_${businessId.value}`
    localStorage.setItem(storageKey, 'true')
  }
  isOpen.value = false
}

const handleUpgrade = () => {
  handleDismiss()
  goToPlans()
}
</script>
