<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4">
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

      <!-- Contenido -->
      <div class="space-y-4">
        <!-- Card de información personal -->
        <div
          class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8"
        >
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold text-gray-900">
              Información personal
            </h2>
          </div>

          <form @submit.prevent="handleSave" class="space-y-8">
            <div class="space-y-6">
              <section
                v-for="section in profileSections"
                :key="section.id"
                class="pb-6 border-b border-gray-100 last:border-b-0 last:pb-0"
              >
                <div class="flex items-start gap-3 mb-4">
                  <div
                    class="w-8 h-8 flex items-center justify-center shrink-0"
                  >
                    <component
                      :is="section.icon"
                      class="w-5 h-5 text-gray-500"
                    />
                  </div>
                  <div>
                    <h3 class="text-base font-semibold text-gray-900">
                      {{ section.title }}
                    </h3>
                    <p class="text-xs text-gray-600 mt-1">
                      {{ section.description }}
                    </p>
                  </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div
                    v-for="field in section.fields"
                    :key="field.id"
                    class="space-y-2"
                  >
                    <div class="flex items-center gap-2 mb-2">
                      <label class="text-sm font-medium text-gray-900">
                        {{ field.title }}
                      </label>
                      <span
                        v-if="field.required"
                        class="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"
                      >
                        Requerido
                      </span>
                    </div>
                    <input
                      v-model="formData[field.key]"
                      type="text"
                      :disabled="!isEditing"
                      class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm disabled:bg-gray-50 disabled:text-gray-500"
                      :placeholder="field.placeholder"
                    />
                  </div>
                </div>
              </section>

              <section
                class="pb-6 border-b border-gray-100 last:border-b-0 last:pb-0"
              >
                <div class="flex items-start gap-3 mb-4">
                  <div
                    class="w-8 h-8 flex items-center justify-center shrink-0"
                  >
                    <Mail class="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <h3 class="text-base font-semibold text-gray-900">
                      Cuenta
                    </h3>
                    <p class="text-xs text-gray-600 mt-1">
                      Datos de acceso de tu cuenta.
                    </p>
                  </div>
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-900 mb-2">
                    Correo electrónico
                  </label>
                  <input
                    v-model="formData.email"
                    type="email"
                    disabled
                    class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <p class="mt-2 text-xs text-gray-500">
                    El correo electrónico no se puede modificar
                  </p>
                </div>
              </section>
            </div>

            <!-- Mensaje de éxito/error -->
            <div
              v-if="message"
              :class="[
                'rounded-lg p-4',
                message.type === 'success'
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200',
              ]"
            >
              <div class="flex items-start">
                <svg
                  v-if="message.type === 'success'"
                  class="w-5 h-5 text-green-400 mr-2 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <svg
                  v-else
                  class="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span
                  :class="[
                    'text-sm',
                    message.type === 'success'
                      ? 'text-green-700'
                      : 'text-red-700',
                  ]"
                >
                  {{ message.text }}
                </span>
              </div>
            </div>
          </form>
        </div>

        <!-- Card de información de la cuenta -->
        <div
          class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8"
        >
          <h2 class="text-lg font-semibold text-gray-900 mb-4">
            Información de la cuenta
          </h2>
          <div class="space-y-3 text-sm">
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
        </div>
      </div>

      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-2"
      >
        <div v-if="hasChanges" class="fixed inset-x-0 bottom-0 z-40">
          <div
            class="bg-white/90 backdrop-blur-sm border-t border-gray-200 shadow-[0_-4px_14px_rgba(0,0,0,0.06)]"
          >
            <div class="max-w-7xl mx-auto px-4 py-3">
              <button
                @click="handleSave"
                :disabled="isSaving"
                class="w-full lg:w-1/3 lg:mx-auto py-3 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-sm"
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
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { useUserStore } from "@/stores/useUserStore";
import { getFirestore, doc, updateDoc, getDoc } from "firebase/firestore";
import appFirebase from "@/firebaseInit";
import { ProfileCircle, Map, Mail, Community } from "@iconoir/vue";

const router = useRouter();
const authStore = useAuthStore();
const userStore = useUserStore();
const db = getFirestore(appFirebase);

const isEditing = ref(true);
const isSaving = ref(false);
const message = ref(null);

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

const profileFields = [
  {
    id: "field_nombre",
    key: "name",
    title: "Nombre",
    placeholder: "Ej: Juan",
    sectionId: "personal",
    required: true,
  },
  {
    id: "field_apellidos",
    key: "lastName",
    title: "Apellidos",
    placeholder: "Ej: Pérez Gómez",
    sectionId: "personal",
    required: true,
  },
  {
    id: "field_telefono",
    key: "phone",
    title: "Teléfono",
    placeholder: "",
    sectionId: "personal",
    required: true,
  },
  {
    id: "field_pais",
    key: "country",
    title: "País",
    placeholder: "",
    sectionId: "ubicacion",
    required: true,
  },
  {
    id: "field_region",
    key: "region",
    title: "Región / Estado",
    placeholder: "",
    sectionId: "ubicacion",
    required: true,
  },
  {
    id: "field_provincia",
    key: "province",
    title: "Provincia",
    placeholder: "",
    sectionId: "ubicacion",
    required: false,
  },
  {
    id: "field_distrito",
    key: "district",
    title: "Distrito / Ciudad",
    placeholder: "",
    sectionId: "ubicacion",
    required: false,
  },
];

const profileSections = [
  {
    id: "personal",
    title: "Información personal",
    description: "Datos base del emprendedor.",
    icon: ProfileCircle,
    containerClass: "bg-blue-50 border-blue-200",
    iconWrapClass: "bg-blue-100",
    iconClass: "text-blue-600",
    titleClass: "text-blue-900",
  },
  {
    id: "ubicacion",
    title: "Ubicación",
    description: "Información territorial para identificación.",
    icon: Map,
    containerClass: "bg-emerald-50 border-emerald-200",
    iconWrapClass: "bg-emerald-100",
    iconClass: "text-emerald-600",
    titleClass: "text-emerald-900",
  },
].map((section) => ({
  ...section,
  fields: profileFields.filter((field) => field.sectionId === section.id),
}));

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
  message.value = null;

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

    message.value = {
      type: "success",
      text: "Tus datos se han actualizado correctamente",
    };
    originalData.value = { ...formData.value };

    // Limpiar mensaje después de 3 segundos
    setTimeout(() => {
      message.value = null;
    }, 3000);
  } catch (error) {
    console.error("Error al guardar:", error);
    message.value = {
      type: "error",
      text: "Error al guardar los cambios. Inténtalo de nuevo.",
    };
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
