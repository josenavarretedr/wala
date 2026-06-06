<template>
  <div
    v-if="visible"
    class="group relative overflow-hidden rounded-xl border border-l-4 transition-all duration-300 bg-white/80 backdrop-blur-md shadow-sm hover:shadow-md hover:-translate-y-0.5"
    :class="bannerClasses"
  >
    <!-- Background subtle shapes for premium feel -->
    <div
      class="absolute -right-10 -top-10 w-32 h-32 rounded-full blur-xl pointer-events-none transition-all duration-500"
      :class="shapeClasses"
    ></div>
    <div
      class="absolute -left-10 -bottom-10 w-28 h-28 rounded-full blur-xl pointer-events-none transition-all duration-500"
      :class="shapeClasses"
    ></div>

    <div
      class="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10"
    >
      <div class="flex items-start gap-4 flex-1 min-w-0">
        <!-- Icon container -->
        <div
          class="w-12 h-12 rounded-xl flex items-center justify-center border shadow-xs shrink-0 transition-transform duration-300 group-hover:scale-105"
          :class="iconContainerClasses"
        >
          <TaskList v-if="currentState === 'incomplete'" class="w-6 h-6" />
          <Gift v-else-if="currentState === 'eligible'" class="w-6 h-6" />
          <BrightCrown v-else-if="currentState === 'active'" class="w-6 h-6" />
          <InfoCircle v-else-if="currentState === 'expired'" class="w-6 h-6" />
          <BrightCrown v-else class="w-6 h-6" />
        </div>

        <div class="space-y-1.5 flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <span
              class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border"
              :class="badgeClasses"
            >
              {{ badgeText }}
            </span>
            <span
              v-if="isTrialActive"
              class="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1 animate-pulse"
            >
              <span>⚡</span>
              <span>Modo Pro Activo</span>
            </span>
          </div>

          <h3 class="text-base font-bold text-gray-900 leading-tight">
            {{ titleText }}
          </h3>

          <p class="text-xs text-gray-600 max-w-xl">
            {{ descriptionText }}
          </p>

          <!-- Progress bar for incomplete profile -->
          <div
            v-if="showProfileProgress"
            class="mt-3 flex items-center gap-3 pt-1 flex-wrap sm:flex-nowrap"
          >
            <div
              class="w-36 h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-200/30 shrink-0"
            >
              <div
                class="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 rounded-full"
                :style="{ width: `${completionPercentage}%` }"
              ></div>
            </div>
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="text-xs font-semibold text-gray-600"
                >{{ completionPercentage }}% completado</span
              >
              <span
                v-if="missingFields.length > 0"
                class="text-[10px] text-amber-600 font-medium bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-md"
              >
                (Falta: {{ missingFields[0] }})
              </span>
            </div>
          </div>

          <!-- Progress bar for active trial -->
          <div
            v-if="isTrialActive && daysRemaining !== null"
            class="mt-3 flex items-center gap-3 pt-1"
          >
            <div
              class="w-36 h-2 bg-emerald-100/60 rounded-full overflow-hidden border border-emerald-200/20 shrink-0"
            >
              <div
                class="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
                :style="{ width: `${(daysRemaining / 5) * 100}%` }"
              ></div>
            </div>
            <span class="text-xs font-semibold text-emerald-800">
              Quedan {{ daysRemaining }} día{{
                daysRemaining !== 1 ? "s" : ""
              }}
              de prueba
            </span>
          </div>
        </div>
      </div>

      <!-- Action Button -->
      <div
        class="flex items-center gap-3 w-full md:w-auto justify-end shrink-0"
      >
        <button
          v-if="actionText"
          @click="handleAction"
          :disabled="isActivating"
          class="group w-full md:w-auto px-5 py-2.5 rounded-lg font-bold text-xs shadow-sm transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-1.5"
          :class="actionButtonClasses"
        >
          <span
            v-if="isActivating"
            class="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-current"
          ></span>
          <template v-else>
            <span>{{ actionText }}</span>
            <svg
              class="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.5"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </template>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { useProfileCompletion } from "@/composables/useProfileCompletion";
import { useSubscription } from "@/composables/useSubscription";
import { useToast } from "@/composables/useToast";
import { TaskList, Gift, BrightCrown, InfoCircle } from "@iconoir/vue";

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const { isProfileComplete, completionPercentage, missingFields } =
  useProfileCompletion();
const {
  isTrialActive,
  isTrialExpired,
  subscription,
  daysRemaining,
  activateTrial,
  goToPlans,
} = useSubscription();

const isActivating = ref(false);

// Determine the state of the trial/profile
// States: 'incomplete' | 'eligible' | 'active' | 'expired' | 'hidden'
const currentState = computed(() => {
  const sub = subscription.value;

  // If active trial
  if (isTrialActive.value) {
    return "active";
  }

  // If trial has been used and they are currently free
  if (sub?.trialUsed && (!sub?.plan || sub?.plan === "free")) {
    return "expired";
  }

  // If already premium/pro/max active (paid plan)
  if (sub?.plan && sub?.plan !== "free" && sub?.status === "active") {
    return "hidden";
  }

  // If profile is complete but trial not started
  if (isProfileComplete.value) {
    return "eligible";
  }

  // If profile is incomplete and trial not used
  return "incomplete";
});

const visible = computed(() => currentState.value !== "hidden");

const badgeText = computed(() => {
  switch (currentState.value) {
    case "incomplete":
      return "Perfil Pendiente";
    case "eligible":
      return "¡Listo para Activar!";
    case "active":
      return "Prueba Gratuita Pro";
    case "expired":
      return "Prueba Terminada";
    default:
      return "";
  }
});

const titleText = computed(() => {
  switch (currentState.value) {
    case "incomplete":
      return "Consigue 5 días de Plan Pro Gratis";
    case "eligible":
      return "¡Tu perfil está listo!";
    case "active":
      return "Disfrutando de 5 días Pro";
    case "expired":
      return "Tu prueba gratuita ha terminado";
    default:
      return "";
  }
});

const descriptionText = computed(() => {
  switch (currentState.value) {
    case "incomplete":
      return "Completa los datos de tu perfil (especialmente el teléfono de contacto) para desbloquear todos los reportes avanzados y funcionalidades Pro y Max.";
    case "eligible":
      return "Ya has ingresado tus datos de contacto obligatorios. Activa ahora mismo tu período de prueba Pro por 5 días sin costo.";
    case "active":
      return "Tienes acceso total a todas las herramientas avanzadas para potenciar tu negocio. ¡Aprovéchalas al máximo!";
    case "expired":
      return "Esperamos que hayas disfrutado del plan Pro. Actualiza hoy mismo para no perder el acceso a tus reportes avanzados y límites ampliados.";
    default:
      return "";
  }
});

const showProfileProgress = computed(() => currentState.value === "incomplete");

const actionText = computed(() => {
  switch (currentState.value) {
    case "incomplete":
      return "Completar Perfil";
    case "eligible":
      return "Activar Prueba";
    case "active":
      return "Ver Detalles del Plan";
    case "expired":
      return "Ver Planes";
    default:
      return "";
  }
});

// Tailwind UI configurations
const bannerClasses = computed(() => {
  switch (currentState.value) {
    case "incomplete":
      return "border-gray-100 border-l-blue-500";
    case "eligible":
      return "border-emerald-100/80 border-l-emerald-500 shadow-emerald-500/5 bg-gradient-to-br from-white/95 to-emerald-50/20";
    case "active":
      return "border-gray-100 border-l-indigo-500 bg-gradient-to-br from-white/95 to-indigo-50/20";
    case "expired":
      return "border-gray-100 border-l-amber-500 bg-gradient-to-br from-white/95 to-amber-50/10";
    default:
      return "border-gray-100 border-l-gray-400";
  }
});

const iconContainerClasses = computed(() => {
  switch (currentState.value) {
    case "incomplete":
      return "bg-blue-50 border-blue-100 text-blue-600";
    case "eligible":
      return "bg-emerald-50 border-emerald-100 text-emerald-600 shadow-sm shadow-emerald-500/10";
    case "active":
      return "bg-indigo-50 border-indigo-100 text-indigo-600 shadow-sm shadow-indigo-500/10";
    case "expired":
      return "bg-amber-50 border-amber-100 text-amber-700";
    default:
      return "bg-gray-50 border-gray-100 text-gray-600";
  }
});

const badgeClasses = computed(() => {
  switch (currentState.value) {
    case "incomplete":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "eligible":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 font-extrabold animate-pulse";
    case "active":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    case "expired":
      return "bg-amber-50 text-amber-700 border-amber-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
});

const actionButtonClasses = computed(() => {
  switch (currentState.value) {
    case "incomplete":
      return "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/10 hover:shadow-blue-600/20";
    case "eligible":
      return "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-600/20 hover:shadow-emerald-600/30";
    case "active":
      return "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/10 hover:shadow-indigo-600/20";
    case "expired":
      return "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/10 hover:shadow-amber-600/20";
    default:
      return "bg-gray-800 hover:bg-gray-900 text-white";
  }
});

const shapeClasses = computed(() => {
  switch (currentState.value) {
    case "incomplete":
      return "bg-blue-500/5";
    case "eligible":
      return "bg-emerald-500/10";
    case "active":
      return "bg-indigo-500/5";
    case "expired":
      return "bg-amber-500/5";
    default:
      return "bg-gray-500/5";
  }
});

const handleAction = async () => {
  switch (currentState.value) {
    case "incomplete":
      router.push("/profile");
      break;
    case "eligible":
      isActivating.value = true;
      try {
        const success = await activateTrial(authStore.user?.uid);
        if (success) {
          toast.success("¡Prueba gratuita de 5 días de plan Pro activada! 🚀", {
            duration: 4000,
          });
        }
      } catch (err) {
        console.error(err);
        toast.error(err.message || "Error al activar la prueba gratuita.");
      } finally {
        isActivating.value = false;
      }
      break;
    case "active":
    case "expired":
      goToPlans();
      break;
  }
};
</script>
