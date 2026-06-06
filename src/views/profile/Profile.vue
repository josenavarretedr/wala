<template>
  <div class="min-h-screen relative overflow-x-hidden flex flex-col">
    <!-- Capa de fondo fija de alta resolución -->
    <div
      class="profile-bg"
      :style="{ backgroundImage: `url(${bgWall})` }"
    ></div>

    <!-- Header -->
    <Header />

    <!-- Contenido principal -->
    <main class="flex-1 p-4 md:p-6">
      <div class="max-w-4xl mx-auto pb-28 lg:pb-24">
        <!-- Header con botón de volver -->
        <div class="mb-6">
          <button
            @click="goBack"
            class="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Volver
          </button>
          <h1 class="text-2xl font-semibold text-gray-900 mb-1">Mis datos</h1>
          <p class="text-sm text-gray-500">Información personal de tu cuenta</p>
        </div>

        <div
          class="bg-white/95 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8"
        >
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-lg font-semibold text-gray-900">
          Información personal
        </h2>
      </div>

      <form @submit.prevent="handleSave" class="space-y-2">
        <section
          v-for="section in profileSections"
          :key="section.id"
          class="py-5 border-b border-gray-100 last:border-b-0"
        >
          <div class="flex items-start gap-3 mb-4">
            <div
              class="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center"
            >
              <component :is="section.icon" class="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 class="text-sm font-semibold text-gray-900">
                {{ section.title }}
              </h3>
              <p class="text-xs text-gray-500 mt-0.5">
                {{ section.description }}
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div v-for="field in section.fields" :key="field.key">
              <label class="block text-sm font-medium text-gray-900 mb-2 flex items-center justify-between">
                <span>{{ field.label }}</span>
                <span v-if="field.key === 'phone'" class="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-1">
                  <span>🎁 Requerido para Plan Pro Gratis</span>
                </span>
              </label>
              <input
                :id="`input-${field.key}`"
                v-model="formData[field.key]"
                type="text"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-white"
                :placeholder="field.placeholder"
              />
              <div v-if="field.key === 'phone'" class="mt-2 flex flex-col gap-2">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    @click="addWhatsappCountryCode"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <svg class="w-3.5 h-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    Este teléfono tiene wsp
                  </button>
                  <span class="text-[10px] text-gray-500 italic">
                    Código detectado: {{ detectedCountryCode }}
                  </span>
                </div>
                <p v-if="formData.phone && !isPhoneValid" class="text-xs text-red-500 mt-1">
                  Por favor, ingresa un número de teléfono válido (5-15 dígitos).
                </p>
              </div>
            </div>
          </div>
        </section>

        <section class="py-5 border-b border-gray-100">
          <div class="flex items-start gap-3 mb-4">
            <div
              class="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center"
            >
              <Mail class="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 class="text-sm font-semibold text-gray-900">Cuenta</h3>
              <p class="text-xs text-gray-500 mt-0.5">
                Datos de acceso de tu cuenta
              </p>
            </div>
          </div>

          <label class="block text-sm font-medium text-gray-900 mb-2">
            Correo electrónico
          </label>
          <input
            v-model="formData.email"
            type="email"
            disabled
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
          />
          <p class="mt-1 text-xs text-gray-500">
            El correo electrónico no se puede modificar
          </p>
        </section>

        <!-- Sección de Beneficio de Trial Premium -->
        <div v-if="showTrialCta" class="my-6 p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-200/60 shadow-sm relative overflow-hidden">
          <div class="absolute top-0 right-0 p-3 opacity-10">
            <span class="text-6xl">🎁</span>
          </div>
          
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div class="flex items-center gap-2 mb-1.5">
                <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 uppercase tracking-wide">Beneficio de Onboarding</span>
                <span class="text-sm">🎁</span>
              </div>
              <h4 class="text-base font-bold text-gray-900">Plan Pro de 5 días gratis</h4>
              <p class="text-xs text-gray-600 mt-1 max-w-lg">
                Desbloquea todas las funcionalidades avanzadas (reportes detallados, exportación de datos, colaboradores ilimitados) completando tus datos de perfil (especialmente el teléfono).
              </p>
              
              <!-- Progreso -->
              <div class="mt-4 flex items-center gap-3">
                <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden max-w-xs">
                  <div 
                    class="h-full bg-emerald-500 transition-all duration-500" 
                    :style="{ width: `${completionPercentage}%` }"
                  ></div>
                </div>
                <span class="text-xs font-semibold text-gray-700">{{ completionPercentage }}% completado</span>
              </div>

              <!-- Requisitos Faltantes -->
              <div v-if="missingFields.length > 0" class="mt-2 text-[10px] text-amber-600 flex items-center gap-1 font-medium">
                <span>⚠️ Pendiente: {{ missingFields.join(', ') }}</span>
              </div>
            </div>
            
            <div class="flex sm:flex-col items-stretch justify-end">
              <button 
                v-if="canActivateTrial"
                type="button"
                @click="handleActivateTrial"
                :disabled="isActivatingTrial"
                class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-xs hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md shadow-emerald-600/10 flex items-center justify-center gap-1.5 animate-pulse"
              >
                <span v-if="isActivatingTrial" class="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></span>
                <span v-else>🚀 Activar 5 días Pro</span>
              </button>
              <button 
                v-else-if="!isProfileComplete"
                type="button"
                @click="focusMissingField"
                class="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs transition-all flex items-center justify-center"
              >
                Completa tu perfil
              </button>
            </div>
          </div>
        </div>

        <!-- Trial Activo -->
        <div v-else-if="subscription?.status === 'trial'" class="my-6 p-5 rounded-xl bg-blue-50/50 border border-blue-100 flex items-start gap-4">
          <div class="text-2xl">🎁</div>
          <div class="flex-1">
            <h4 class="text-sm font-semibold text-gray-900 font-bold">Tienes una prueba gratuita Pro activa</h4>
            <p class="text-xs text-gray-600 mt-0.5">
              Disfrutas de los beneficios de Pro hasta el <strong>{{ formatDate(subscription?.endDate) }}</strong>.
            </p>
            <div class="mt-2 text-xs text-blue-600 font-medium flex items-center gap-2">
              <span class="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">ACTIVO</span>
              <span>Quedan {{ daysRemaining }} días de prueba.</span>
            </div>
          </div>
        </div>

        <section class="pt-5">
          <h3 class="text-sm font-semibold text-gray-900 mb-3">
            Información de la cuenta
          </h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between py-2 border-b border-gray-100">
              <span class="text-gray-600">ID de usuario</span>
              <span class="font-mono text-gray-900">{{
                authStore.user?.uid || "N/A"
              }}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-gray-100">
              <span class="text-gray-600">Fecha de registro</span>
              <span class="text-gray-900">{{ formatDate(createdAt) }}</span>
            </div>
            <div class="flex justify-between py-2">
              <span class="text-gray-600">Negocios</span>
              <span class="text-gray-900">
                {{ userStore.userBusinesses.length }} negocio{{
                  userStore.userBusinesses.length !== 1 ? "s" : ""
                }}
              </span>
            </div>
          </div>
        </section>
      </form>
    </div>

    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div
        v-if="hasChanges"
        class="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[92%] sm:w-[70%] lg:w-1/3"
      >
        <div class="mb-2 flex justify-center">
          <span
            class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
          >
            Tienes cambios sin guardar
          </span>
        </div>

        <button
          @click="handleSave(false)"
          :disabled="isSaving"
          class="w-full py-3 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-sm shadow-lg shadow-blue-500/20"
        >
          <span v-if="!isSaving" class="flex items-center justify-center">
            Guardar cambios
          </span>
          <span v-else class="flex items-center justify-center">
            <div
              class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"
            ></div>
            Guardando...
          </span>
        </button>
      </div>
    </Transition>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { useUserStore } from "@/stores/useUserStore";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import appFirebase from "@/firebaseInit";
import { ProfileCircle, Map, Mail } from "@iconoir/vue";
import { useToast } from "@/composables/useToast";
import { useProfileCompletion } from "@/composables/useProfileCompletion";
import { useSubscription } from "@/composables/useSubscription";
import Header from "@/components/LayoutCmpts/Header.vue";
import bgWall from "@/assets/bg_wall.png";

const router = useRouter();
const authStore = useAuthStore();
const userStore = useUserStore();
const db = getFirestore(appFirebase);
const toast = useToast();

const isSaving = ref(false);
const isActivatingTrial = ref(false);

const { isProfileComplete, completionPercentage, missingFields, checkFields } = useProfileCompletion();
const { subscription, daysRemaining, activateTrial } = useSubscription();

const isPhoneValid = computed(() => {
  const cleanPhone = (formData.value.phone || "").replace(/[\s-]/g, "");
  const phoneRegex = /^\+?\d{5,15}$/;
  return phoneRegex.test(cleanPhone);
});

const formData = ref({
  name: "",
  lastName: "",
  phone: "",
  country: "",
  region: "",
  province: "",
  district: "",
  email: "",
});

const originalData = ref({ ...formData.value });
const isFormReady = ref(false);

const countryCodes = {
  peru: "+51",
  "perú": "+51",
  colombia: "+57",
  chile: "+56",
  argentina: "+54",
  mexico: "+52",
  "méxico": "+52",
  ecuador: "+593",
  bolivia: "+591",
  venezuela: "+58",
  espana: "+34",
  "españa": "+34",
  uruguay: "+598",
  paraguay: "+595",
  "costa rica": "+506",
  panama: "+507",
  "panamá": "+507",
  "el salvador": "+503",
  guatemala: "+502",
  honduras: "+504",
  nicaragua: "+505",
  "republica dominicana": "+1",
  "república dominicana": "+1",
  "estados unidos": "+1",
  usa: "+1",
  eeuu: "+1",
  "ee.uu.": "+1"
};

const detectedCountryCode = computed(() => {
  const countryInput = (formData.value.country || "").trim().toLowerCase();
  const normalizedCountry = countryInput
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return countryCodes[normalizedCountry] || "+51";
});

const addWhatsappCountryCode = () => {
  const code = detectedCountryCode.value;
  let currentPhone = (formData.value.phone || "").trim();
  
  if (!currentPhone) {
    formData.value.phone = code;
    return;
  }
  
  // Si ya empieza con el código de país (con o sin +), no hacer nada
  const cleanCode = code.replace("+", "");
  if (currentPhone.startsWith(code) || currentPhone.startsWith(cleanCode)) {
    if (!currentPhone.startsWith("+")) {
      formData.value.phone = "+" + currentPhone;
    }
    return;
  }
  
  // Si ya empieza con "+", asumimos que ya tiene algún código
  if (currentPhone.startsWith("+")) {
    return;
  }
  
  // Prepend el código
  formData.value.phone = `${code}${currentPhone}`;
};

// Show CTA if trial not used and no active/paid plan
const showTrialCta = computed(() => {
  const sub = subscription.value;
  return !sub?.trialUsed && (!sub?.plan || sub?.plan === "free");
});

// Can activate if profile is 100% complete and they qualify
const canActivateTrial = computed(() => {
  return isProfileComplete.value && showTrialCta.value;
});

const profileSections = [
  {
    id: "personal",
    title: "Datos personales",
    description: "Información base del emprendedor",
    icon: ProfileCircle,
    fields: [
      { key: "name", label: "Nombre", placeholder: "Ej: Juan" },
      { key: "lastName", label: "Apellidos", placeholder: "Ej: Pérez Gómez" },
      { key: "phone", label: "Teléfono", placeholder: "" },
    ],
  },
  {
    id: "ubicacion",
    title: "Ubicación",
    description: "Datos territoriales de contacto",
    icon: Map,
    fields: [
      { key: "country", label: "País", placeholder: "" },
      { key: "region", label: "Región / Estado", placeholder: "" },
      { key: "province", label: "Provincia", placeholder: "" },
      { key: "district", label: "Distrito / Ciudad", placeholder: "" },
    ],
  },
];

const createdAt = computed(() => {
  return userStore.userProfile?.fechaRegistro || null;
});

const hasChanges = computed(() => {
  if (!isFormReady.value) return false;

  return Object.keys(formData.value).some(
    (key) => formData.value[key] !== originalData.value[key],
  );
});

onMounted(() => {
  loadUserData();
});

const loadUserData = async () => {
  const user = authStore.user;
  if (user) {
    // Cargar datos desde Firestore
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const profile = userData.profile || {};

        formData.value = {
          name: profile.name || userData.name || userData.nombre || user.displayName || "",
          lastName: profile.lastName || userData.apellidos || "",
          phone: profile.phone || "",
          country: profile.country || "",
          region: profile.region || "",
          province: profile.province || "",
          district: profile.district || "",
          email: user.email || "",
        };
      } else {
        formData.value = {
          name: user.displayName || "",
          lastName: "",
          phone: "",
          country: "",
          region: "",
          province: "",
          district: "",
          email: user.email || "",
        };
      }
      originalData.value = { ...formData.value };
      isFormReady.value = true;
    } catch (error) {
      console.error("Error al cargar datos del usuario:", error);
      formData.value = {
        name: user.displayName || "",
        lastName: "",
        phone: "",
        country: "",
        region: "",
        province: "",
        district: "",
        email: user.email || "",
      };
      originalData.value = { ...formData.value };
      isFormReady.value = true;
    }
  }
};

const handleSave = async (silent = false) => {
  if (formData.value.name.trim().length < 2) {
    toast.error("El nombre debe tener al menos 2 caracteres");
    return false;
  }
  
  if (formData.value.lastName.trim().length < 2) {
    toast.error("Los apellidos deben tener al menos 2 caracteres");
    return false;
  }

  if (formData.value.phone && !isPhoneValid.value) {
    toast.error("Por favor, ingresa un número de teléfono válido (5-15 dígitos)");
    return false;
  }

  isSaving.value = true;

  try {
    const user = authStore.user;
    if (!user) throw new Error("No hay usuario autenticado");

    const updates = {
      nombre: formData.value.name,
      apellidos: formData.value.lastName,
      name: formData.value.name,
      profile: {
        name: formData.value.name,
        nombre: formData.value.name,
        apellidos: formData.value.lastName,
        lastName: formData.value.lastName,
        phone: formData.value.phone,
        country: formData.value.country,
        region: formData.value.region,
        province: formData.value.province,
        district: formData.value.district,
        email: formData.value.email,
      },
      updatedAt: new Date(),
    };

    await userStore.updateUserProfile(updates);

    if (!silent) {
      toast.success("Tus datos se han actualizado correctamente", {
        duration: 2200,
      });
    }
    originalData.value = { ...formData.value };
    return true;
  } catch (error) {
    console.error("Error al guardar:", error);
    if (!silent) {
      toast.error("Error al guardar los cambios. Inténtalo de nuevo.", {
        duration: 2600,
      });
    }
    return false;
  } finally {
    isSaving.value = false;
  }
};

const focusMissingField = () => {
  const missing = checkFields.value.find((f) => !f.isValid);
  if (missing) {
    const el = document.getElementById(`input-${missing.name}`);
    if (el) {
      el.focus();
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }
};

const handleActivateTrial = async () => {
  if (hasChanges.value) {
    const saved = await handleSave(true);
    if (!saved) return;
  }

  isActivatingTrial.value = true;
  try {
    const success = await activateTrial(authStore.user?.uid);
    if (success) {
      toast.success("¡Plan Pro gratuito activado por 5 días! 🚀", {
        duration: 3500,
      });
    }
  } catch (error) {
    console.error("Error al activar trial:", error);
    toast.error(error.message || "Error al activar la prueba gratuita. Inténtalo de nuevo.");
  } finally {
    isActivatingTrial.value = false;
  }
};

const formatDate = (date) => {
  if (!date) return "No disponible";
  try {
    let dateObj;
    if (date && date.seconds) {
      dateObj = new Date(date.seconds * 1000);
    } else if (date) {
      dateObj = new Date(date);
    } else {
      return "No disponible";
    }
    return dateObj.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch (error) {
    return "Fecha inválida";
  }
};

const goBack = () => {
  router.back();
};
</script>

<style scoped>
.profile-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  z-index: -10;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  pointer-events: none;
  transform: translate3d(0, 0, 0);
  will-change: transform;
}
</style>
