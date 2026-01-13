<template>
  <header
    class="bg-white border-b border-gray-200 shadow-sm px-6 py-6 lg:py-5 flex items-center justify-between min-h-[80px]"
  >
    <!-- Botón menú mobile y desktop - Lado izquierdo -->
    <button
      @click="$emit('toggle-sidebar')"
      class="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-lg"
    >
      <svg
        class="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    </button>

    <!-- Logo / Nombre del negocio - Centro -->
    <div class="absolute left-1/2 transform -translate-x-1/2">
      <component
        :is="logoLinkComponent"
        :to="logoLinkRoute"
        class="flex items-center gap-3 group cursor-pointer"
        @click="handleLogoClick"
      >
        <Folder
          class="w-6 h-6 text-blue-600 group-hover:text-blue-800 transition"
        />
        <h1
          class="text-xl md:text-2xl lg:text-2xl font-semibold text-gray-800 tracking-wide group-hover:text-blue-700"
        >
          {{ displayName }}
        </h1>

        <!-- Badge Premium/Emprendedor -->
        <span
          v-if="isPremium"
          class="flex items-center gap-1.5 px-3 py-1 bg-white text-orange-600 text-xs font-semibold rounded-full border-orange-600 shadow-lg"
        >
          <BrightCrown class="w-4 h-4" />
          Premium
        </span>
        <span
          v-else
          class="flex items-center gap-1.5 px-3 py-1 bg-gray-400 text-white text-xs font-semibold rounded-full"
        >
          <Crown class="w-4 h-4" />
          Gratis
        </span>
      </component>
    </div>

    <!-- Espacio para elementos del lado derecho (reservado para futuro uso) -->
    <div class="w-12 flex justify-end">
      <!-- Aquí puedes agregar elementos como notificaciones, perfil, etc. -->
    </div>
  </header>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { useBusinessStore } from "@/stores/businessStore";
import { useUserStore } from "@/stores/useUserStore";
import { useTransactionStore } from "@/stores/transaction/transactionStore";
import { useRoute } from "vue-router";
import BtnLogout from "@/components/Auth/BtnLogout.vue";
import { Folder, BrightCrown, Crown } from "@iconoir/vue";
import { useTransactionFlowStore } from "@/stores/transaction/transactionFlowStore";

import { useSubscription } from "@/composables/useSubscription";

const { isPremium } = useSubscription();

// ✅ Definir props opcionales
const props = defineProps({
  contextName: {
    type: String,
    default: null,
  },
  facilitatorMode: {
    type: Boolean,
    default: false,
  },
  facilitatorHomeRoute: {
    type: String,
    default: "/programs",
  },
});

// ✅ Definir el emit para comunicarse con el componente padre
const emit = defineEmits(["toggle-sidebar"]);

const route = useRoute();
const authStore = useAuthStore();
const businessStore = useBusinessStore();
const userStore = useUserStore();
const transactionStore = useTransactionStore();
const flow = useTransactionFlowStore();

const displayName = ref("WALA");

// Computed para obtener el businessId actual
const currentBusinessId = computed(() => {
  const id =
    route.params.businessId ||
    businessStore.business?.id ||
    userStore.currentBusiness?.businessId ||
    null;

  console.log("🔍 Header currentBusinessId:", {
    routeParam: route.params.businessId,
    businessStoreId: businessStore.business?.id,
    userStoreBusiness: userStore.currentBusiness?.businessId,
    finalId: id,
  });

  return id;
});

// Computed para el componente del logo (RouterLink o div)
const logoLinkComponent = computed(() => {
  if (props.facilitatorMode) {
    return "RouterLink";
  }
  return currentBusinessId.value ? "RouterLink" : "div";
});

// Computed para la ruta del logo
const logoLinkRoute = computed(() => {
  if (props.facilitatorMode) {
    return props.facilitatorHomeRoute;
  }
  if (currentBusinessId.value) {
    return {
      name: "BusinessDashboard",
      params: { businessId: currentBusinessId.value },
    };
  }
  return undefined;
});

// ✅ Función para manejar el click en el logo - mantiene @click.stop y agrega reset
const handleLogoClick = (event) => {
  event.stopPropagation(); // Equivalente a @click.stop
  flow.resetFlow();
  transactionStore.resetTransactionToAdd();
};

const businessName = computed(() => {
  const currentBusiness = businessStore.business;
  return currentBusiness?.nombre || null;
});

// Watch para actualizar el título dinámicamente
watch(
  () => authStore.user,
  (newUser) => {
    if (!newUser) {
      displayName.value = "WALA";
    } else {
      // Si viene contextName desde props (FacilitatorLayout), usarlo
      displayName.value = props.contextName || businessName.value || "WALA";
    }
  },
  { immediate: true }
);

// También observar si cambia el negocio seleccionado
watch(
  () => businessStore.business,
  () => {
    if (authStore.user) {
      displayName.value = props.contextName || businessName.value || "WALA";
    }
  }
);

// Observar cambios en contextName (para FacilitatorLayout)
watch(
  () => props.contextName,
  (newName) => {
    if (newName) {
      displayName.value = newName;
    }
  },
  { immediate: true }
);
</script>
