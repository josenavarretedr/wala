<template>
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
      class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8"
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
              <label class="block text-sm font-medium text-gray-900 mb-2">
                {{ field.label }}
              </label>
              <input
                v-model="formData[field.key]"
                type="text"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-white"
                :placeholder="field.placeholder"
              />
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
          @click="handleSave"
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
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { useUserStore } from "@/stores/useUserStore";
import { getFirestore, doc, updateDoc, getDoc } from "firebase/firestore";
import appFirebase from "@/firebaseInit";
import { ProfileCircle, Map, Mail } from "@iconoir/vue";
import { useToast } from "@/composables/useToast";

const router = useRouter();
const authStore = useAuthStore();
const userStore = useUserStore();
const db = getFirestore(appFirebase);
const toast = useToast();

const isSaving = ref(false);

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
  return userStore.userData?.createdAt || null;
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
          name: profile.name || userData.name || user.displayName || "",
          lastName: profile.lastName || "",
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

const handleSave = async () => {
  isSaving.value = true;

  try {
    const user = authStore.user;
    if (!user) throw new Error("No hay usuario autenticado");

    const userRef = doc(db, "users", user.uid);

    await updateDoc(userRef, {
      name: formData.value.name,
      profile: {
        name: formData.value.name,
        lastName: formData.value.lastName,
        phone: formData.value.phone,
        country: formData.value.country,
        region: formData.value.region,
        province: formData.value.province,
        district: formData.value.district,
      },
      updatedAt: new Date(),
    });

    toast.success("Tus datos se han actualizado correctamente", {
      duration: 2200,
    });
    originalData.value = { ...formData.value };
  } catch (error) {
    console.error("Error al guardar:", error);
    toast.error("Error al guardar los cambios. Inténtalo de nuevo.", {
      duration: 2600,
    });
  } finally {
    isSaving.value = false;
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
