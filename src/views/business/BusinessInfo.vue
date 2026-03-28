<template>
  <div class="max-w-4xl mx-auto pb-28 lg:pb-24">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-semibold text-gray-900 mb-1">
        Datos del negocio
      </h1>
      <p class="text-sm text-gray-500">
        Información y configuración de tu negocio
      </p>
    </div>

    <!-- Contenido -->
    <div class="space-y-4">
      <!-- Card de información básica -->
      <div
        class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8"
      >
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold text-gray-900">
            Información básica
          </h2>
        </div>

        <form @submit.prevent="handleSave" class="space-y-8">
          <div class="space-y-6">
            <section
              v-for="section in businessSections"
              :key="section.id"
              class="pb-6 border-b border-gray-100 last:border-b-0 last:pb-0"
            >
              <div class="flex items-start gap-3 mb-4">
                <div class="w-8 h-8 flex items-center justify-center shrink-0">
                  <component :is="section.icon" class="w-5 h-5 text-gray-500" />
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

                  <select
                    v-if="field.type === 'options'"
                    v-model="formData[field.key]"
                    :disabled="!isEditing"
                    class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-white disabled:bg-gray-50 disabled:text-gray-500"
                  >
                    <option value="">Seleccione una opción</option>
                    <option
                      v-for="option in field.options"
                      :key="option"
                      :value="option"
                    >
                      {{ option }}
                    </option>
                  </select>

                  <input
                    v-else
                    v-model="formData[field.key]"
                    type="text"
                    :disabled="!isEditing"
                    class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm disabled:bg-gray-50 disabled:text-gray-500"
                  />

                  <p
                    v-if="field.description"
                    class="mt-2 text-xs text-gray-500"
                  >
                    {{ field.description }}
                  </p>
                </div>
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

      <!-- Card de información adicional -->
      <div
        class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8"
      >
        <h2 class="text-lg font-semibold text-gray-900 mb-4">
          Información del sistema
        </h2>
        <div class="space-y-3 text-sm">
          <div class="flex justify-between py-2 border-b border-gray-100">
            <span class="text-gray-600">ID del negocio</span>
            <span class="font-mono text-gray-900">{{
              businessStore.business?.id || "N/A"
            }}</span>
          </div>
          <div class="flex justify-between py-2 border-b border-gray-100">
            <span class="text-gray-600">Fecha de creación</span>
            <span class="text-gray-900">{{ formatDate(createdAt) }}</span>
          </div>
          <div class="flex justify-between py-2">
            <span class="text-gray-600">Estado</span>
            <span
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
            >
              Activo
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
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useRoute } from "vue-router";
import { useBusinessStore } from "@/stores/businessStore";
import { useUserStore } from "@/stores/useUserStore";
import { useAuthStore } from "@/stores/authStore";
import {
  getFirestore,
  doc,
  updateDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import appFirebase from "@/firebaseInit";
import { ProfileCircle, Community, GraphUp } from "@iconoir/vue";

const route = useRoute();
const businessStore = useBusinessStore();
const userStore = useUserStore();
const authStore = useAuthStore();
const db = getFirestore(appFirebase);

const isEditing = ref(true);
const isSaving = ref(false);
const message = ref(null);

const formData = ref({
  nombreNegocio: "",
  anioInicio: "",
  direccionNegocio: "",
  codigoPostal: "",
  telefonoNegocio: "",
  departamento: "",
  lineaNegocio: "",
  descripcionSector: "",
  formaLegal: "",
  posicionNegocio: "",
  experiencia: "",
  oportunidadesMercado: "",
  calidadOportunidades: "",
  numTrabajadores: "",
  localizacionPermanente: "",
  capitalInvertido: "",
  planesLargoPlazo: "",
});

const originalData = ref({ ...formData.value });
const isFormReady = ref(false);

const businessFields = [
  {
    id: "field_nombre_negocio",
    key: "nombreNegocio",
    type: "text",
    title: "Nombre del negocio",
    description: "",
    required: true,
  },
  {
    id: "field_anio_inicio",
    key: "anioInicio",
    type: "text",
    title: "Año en que empezó este negocio",
    description: "",
    required: true,
  },
  {
    id: "field_direccion_negocio",
    key: "direccionNegocio",
    type: "text",
    title: "Dirección del negocio",
    description: "Dirección física donde opera",
    required: false,
  },
  {
    id: "field_codigo_postal",
    key: "codigoPostal",
    type: "text",
    title: "Código Postal",
    description: "",
    required: false,
  },
  {
    id: "field_telefono_negocio",
    key: "telefonoNegocio",
    type: "text",
    title: "Teléfono del negocio",
    description: "",
    required: false,
  },
  {
    id: "field_departamento",
    key: "departamento",
    type: "text",
    title: "Departamento",
    description: "",
    required: false,
  },
  {
    id: "field_linea_negocio",
    key: "lineaNegocio",
    type: "options",
    title: "Línea de negocios",
    description: "Seleccione la línea principal del negocio",
    options: ["Comercio", "Producción", "Servicios"],
    required: true,
  },
  {
    id: "field_descripcion_sector",
    key: "descripcionSector",
    type: "text",
    title: "Descripción del sector / idea de negocio",
    description:
      "Describa brevemente el sector del negocio y/o la idea de negocio del empresari@",
    required: true,
  },
  {
    id: "field_forma_legal",
    key: "formaLegal",
    type: "options",
    title: "Forma legal del negocio",
    description: "",
    options: ["Unipersonal", "Sociedad Comercial", "Cooperativa", "Otra"],
    required: true,
  },
  {
    id: "field_posicion_negocio",
    key: "posicionNegocio",
    type: "options",
    title: "Posición en el negocio",
    description: "",
    options: ["Dueño(a)", "Gerente(a)", "Otro"],
    required: true,
  },
  {
    id: "field_experiencia",
    key: "experiencia",
    type: "options",
    title: "Años de experiencia gestionando éste u otro negocio",
    description: "",
    options: ["Ninguno", "Menos de un año", "1-3 años", "4 años o más"],
    required: true,
  },
  {
    id: "field_oportunidades_mercado",
    key: "oportunidadesMercado",
    type: "text",
    title: "Oportunidades de mercado",
    description:
      "Describa brevemente las oportunidades de mercado de su negocio",
    required: false,
  },
  {
    id: "field_calidad_oportunidades",
    key: "calidadOportunidades",
    type: "options",
    title: "¿Tiene el negocio oportunidades de mercado?",
    description: "",
    options: ["Excelentes", "Buenas", "Regulares"],
    required: true,
  },
  {
    id: "field_num_trabajadores",
    key: "numTrabajadores",
    type: "options",
    title: "Número de trabajadores",
    description: "",
    options: [
      "Trabajador / Propietari@",
      "2-5 trabajadores",
      "6-10 trabajadores",
      "11 o más trabajadores",
    ],
    required: true,
  },
  {
    id: "field_localizacion_permanente",
    key: "localizacionPermanente",
    type: "options",
    title: "¿Tiene una localización permanente donde opera su negocio?",
    description: "",
    options: ["Sí", "No"],
    required: true,
  },
  {
    id: "field_capital_invertido",
    key: "capitalInvertido",
    type: "options",
    title: "¿Ha invertido capital privado en este negocio?",
    description: "",
    options: ["Un poco", "Mucho"],
    required: true,
  },
  {
    id: "field_planes_largo_plazo",
    key: "planesLargoPlazo",
    type: "options",
    title: "¿Tiene planes de quedarse en el negocio por largo tiempo?",
    description: "",
    options: ["Sí", "No necesariamente"],
    required: true,
  },
];

const businessFieldsById = businessFields.reduce((acc, field) => {
  acc[field.id] = field;
  return acc;
}, {});

const businessSections = [
  {
    id: "section_identificacion",
    title: "Identificación del negocio",
    description: "Datos generales y de ubicación principal.",
    icon: ProfileCircle,
    containerClass: "bg-blue-50 border-blue-200",
    iconWrapClass: "bg-blue-100",
    iconClass: "text-blue-600",
    titleClass: "text-blue-900",
    fieldIds: [
      "field_nombre_negocio",
      "field_anio_inicio",
      "field_direccion_negocio",
      "field_codigo_postal",
      "field_telefono_negocio",
      "field_departamento",
    ],
  },
  {
    id: "section_modelo",
    title: "Modelo y perfil del negocio",
    description: "Línea de negocio, forma legal y experiencia.",
    icon: Community,
    containerClass: "bg-emerald-50 border-emerald-200",
    iconWrapClass: "bg-emerald-100",
    iconClass: "text-emerald-600",
    titleClass: "text-emerald-900",
    fieldIds: [
      "field_linea_negocio",
      "field_descripcion_sector",
      "field_forma_legal",
      "field_posicion_negocio",
      "field_experiencia",
    ],
  },
  {
    id: "section_mercado",
    title: "Mercado y sostenibilidad",
    description: "Oportunidades, escala operativa y proyección.",
    icon: GraphUp,
    containerClass: "bg-purple-50 border-purple-200",
    iconWrapClass: "bg-purple-100",
    iconClass: "text-purple-600",
    titleClass: "text-purple-900",
    fieldIds: [
      "field_oportunidades_mercado",
      "field_calidad_oportunidades",
      "field_num_trabajadores",
      "field_localizacion_permanente",
      "field_capital_invertido",
      "field_planes_largo_plazo",
    ],
  },
].map((section) => ({
  ...section,
  fields: section.fieldIds
    .map((fieldId) => businessFieldsById[fieldId])
    .filter(Boolean),
}));

const createdAt = computed(() => {
  const business = businessStore.business;
  return business?.fechaCreacion || business?.createdAt || null;
});

const hasChanges = computed(() => {
  if (!isFormReady.value) return false;

  return Object.keys(formData.value).some(
    (key) => formData.value[key] !== originalData.value[key],
  );
});

watch(
  () => businessStore.business,
  (business) => {
    if (business) {
      loadBusinessData();
    }
  },
  { immediate: true },
);

function loadBusinessData() {
  const business = businessStore.business;
  if (business) {
    const setupInit = business.business?.setupInit || {};

    formData.value = {
      nombreNegocio:
        setupInit.nombreNegocio || business.nombre || business.name || "",
      anioInicio: setupInit.anioInicio || "",
      direccionNegocio: setupInit.direccionNegocio || "",
      codigoPostal: setupInit.codigoPostal || "",
      telefonoNegocio: setupInit.telefonoNegocio || "",
      departamento: setupInit.departamento || "",
      lineaNegocio: setupInit.lineaNegocio || "",
      descripcionSector: setupInit.descripcionSector || "",
      formaLegal: setupInit.formaLegal || "",
      posicionNegocio: setupInit.posicionNegocio || "",
      experiencia: setupInit.experiencia || "",
      oportunidadesMercado: setupInit.oportunidadesMercado || "",
      calidadOportunidades: setupInit.calidadOportunidades || "",
      numTrabajadores: setupInit.numTrabajadores || "",
      localizacionPermanente: setupInit.localizacionPermanente || "",
      capitalInvertido: setupInit.capitalInvertido || "",
      planesLargoPlazo: setupInit.planesLargoPlazo || "",
    };
    originalData.value = { ...formData.value };
    isFormReady.value = true;
  }
}

// Función para actualizar el businessName en todas las relaciones usuarios-negocio
const updateBusinessNameInUserRelations = async (
  businessId,
  newBusinessName,
) => {
  try {
    // Buscar todos los usuarios que tienen este negocio
    const usersRef = collection(db, "users");
    const usersSnapshot = await getDocs(usersRef);

    const updatePromises = [];

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const businessRelationRef = doc(
        db,
        "users",
        userId,
        "businesses",
        businessId,
      );

      // Intentar actualizar la relación (si existe)
      updatePromises.push(
        updateDoc(businessRelationRef, {
          businessName: newBusinessName,
          updatedAt: new Date(),
        }).catch((error) => {
          // Si el documento no existe, no hacemos nada (el usuario no tiene este negocio)
          if (error.code !== "not-found") {
            console.warn(
              `No se pudo actualizar relación para usuario ${userId}:`,
              error,
            );
          }
        }),
      );
    }

    await Promise.all(updatePromises);
    console.log(
      `✅ Nombre del negocio actualizado en todas las relaciones de usuarios`,
    );
  } catch (error) {
    console.error("Error al actualizar relaciones de usuarios:", error);
    // No lanzamos el error para no bloquear la actualización principal
  }
};

const handleSave = async () => {
  isSaving.value = true;
  message.value = null;

  try {
    const businessId = route.params.businessId;
    const businessRef = doc(db, "businesses", businessId);

    // 1. Actualizar el documento principal del negocio
    await updateDoc(businessRef, {
      "business.setupInit": {
        ...formData.value,
      },
      nombre: formData.value.nombreNegocio,
      updatedAt: new Date(),
    });

    // 2. Actualizar el nombre del negocio en todas las relaciones usuarios-negocio
    // Solo actualizamos businessName, que es el campo que se replica
    await updateBusinessNameInUserRelations(
      businessId,
      formData.value.nombreNegocio,
    );

    // 3. Actualizar el store local del negocio
    await businessStore.loadBusiness(businessId);

    // 4. Actualizar el store local del usuario (para reflejar el cambio en currentBusiness)
    if (authStore.user?.uid) {
      await userStore.loadUserBusinesses(authStore.user.uid);

      // Si el negocio actual es el que se está editando, actualizar currentBusiness
      if (userStore.currentBusiness?.businessId === businessId) {
        const updatedBusiness = userStore.userBusinesses.find(
          (b) => b.businessId === businessId,
        );
        if (updatedBusiness) {
          userStore.currentBusiness = updatedBusiness;
          localStorage.setItem(
            "currentBusiness",
            JSON.stringify(updatedBusiness),
          );
        }
      }
    }

    message.value = {
      type: "success",
      text: "Los datos del negocio se han actualizado correctamente",
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
</script>
