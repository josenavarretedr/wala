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

    <!-- Tabs -->
    <div class="flex border-b border-gray-200 mb-6">
      <button
        @click="activeTab = 'overview'"
        :class="[
          'px-4 py-3 text-sm font-medium border-b-2 transition-colors',
          activeTab === 'overview'
            ? 'border-blue-500 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        ]"
      >
        Datos Generales
      </button>
      <button
        v-if="isManager"
        @click="activeTab = 'config'"
        :class="[
          'px-4 py-3 text-sm font-medium border-b-2 transition-colors',
          activeTab === 'config'
            ? 'border-blue-500 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        ]"
      >
        Configuración
      </button>
    </div>

    <div
      class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8"
    >
      <form @submit.prevent="handleSave">
        <!-- Contenido de las pestañas -->
        <BusinessInfoOverview
          v-show="activeTab === 'overview'"
          v-model="formData"
          :businessId="businessStore.business?.id"
          :createdAt="createdAt"
        />

        <BusinessInfoConfig
          v-if="isManager"
          v-show="activeTab === 'config'"
          v-model="formData"
        />
      </form>
    </div>

    <!-- Banner Guardar Cambios -->
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
import { ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useBusinessStore } from "@/stores/businessStore";
import { useUserStore } from "@/stores/useUserStore";
import { useAuthStore } from "@/stores/authStore";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import appFirebase from "@/firebaseInit";
import { useToast } from "@/composables/useToast";

// Componentes
import BusinessInfoOverview from "./components/BusinessInfoOverview.vue";
import BusinessInfoConfig from "./components/BusinessInfoConfig.vue";

const route = useRoute();
const router = useRouter();
const businessStore = useBusinessStore();
const userStore = useUserStore();
const authStore = useAuthStore();
const db = getFirestore(appFirebase);
const toast = useToast();

const isManager = computed(() => userStore.isCurrentBusinessManager);

// Active Tab from query param or default
const activeTab = ref(route.query.tab || 'overview');

// Sync tab with query params
watch(activeTab, (newTab) => {
  router.replace({ query: { ...route.query, tab: newTab } });
});

const isSaving = ref(false);

const formData = ref({
  // Perfil de negocio original
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
  
  // Documento raíz
  industry: "",
  businessType: "",
  moneda: "PEN",
  country: "PE",

  // Configuración de configuraciones/settings/config
  workingHours: {
    monday: { open: '08:00', close: '18:00', isOpen: true },
    tuesday: { open: '08:00', close: '18:00', isOpen: true },
    wednesday: { open: '08:00', close: '18:00', isOpen: true },
    thursday: { open: '08:00', close: '18:00', isOpen: true },
    friday: { open: '08:00', close: '18:00', isOpen: true },
    saturday: { open: '09:00', close: '14:00', isOpen: true },
    sunday: { open: '00:00', close: '00:00', isOpen: false }
  },
  notifications: {
    email: true,
    push: true,
    lowStock: true,
    dailyReport: false
  }
});

const originalData = ref(JSON.parse(JSON.stringify(formData.value)));
const isFormReady = ref(false);

const createdAt = computed(() => {
  const business = businessStore.business;
  return business?.fechaCreacion || business?.createdAt || null;
});

const hasChanges = computed(() => {
  if (!isFormReady.value) return false;
  return JSON.stringify(formData.value) !== JSON.stringify(originalData.value);
});

watch(
  () => businessStore.business?.id,
  (newId, oldId) => {
    if (newId && newId !== oldId) {
      loadBusinessData();
    } else if (newId && !isFormReady.value) {
      loadBusinessData();
    }
  },
  { immediate: true },
);

function loadBusinessData() {
  const businessId = businessStore.business?.id || route.params.businessId;
  if (businessId) {
    loadBusinessProfileData(businessId);
  }
}

async function loadBusinessProfileData(businessId) {
  try {
    isFormReady.value = false;

    // Load full business with settings
    const businessWithSettings = await businessStore.loadBusinessWithSettings(businessId);
    
    // Perfil extendido
    const businessProfileRef = doc(db, "businesses", businessId, "settings", "businessProfile");
    const businessProfileSnap = await getDoc(businessProfileRef);
    const businessProfile = businessProfileSnap.exists() ? businessProfileSnap.data() : null;

    const profileSource = businessProfile || businessWithSettings.setupInit || {};
    
    const configSettings = businessWithSettings.settings?.config || {};
    
    // Contact info
    const contactInfo = businessWithSettings.contactInfo || {};
    const address = contactInfo.address || {};

    formData.value = {
      nombreNegocio: profileSource.nombreNegocio || businessWithSettings.businessName || businessWithSettings.nombre || businessWithSettings.name || "",
      anioInicio: profileSource.anioInicio || "",
      direccionNegocio: profileSource.direccionNegocio || "",
      codigoPostal: profileSource.codigoPostal || "",
      telefonoNegocio: profileSource.telefonoNegocio || "",
      departamento: profileSource.departamento || "",
      lineaNegocio: profileSource.lineaNegocio || "",
      descripcionSector: profileSource.descripcionSector || "",
      formaLegal: profileSource.formaLegal || "",
      posicionNegocio: profileSource.posicionNegocio || "",
      experiencia: profileSource.experiencia || "",
      oportunidadesMercado: profileSource.oportunidadesMercado || "",
      calidadOportunidades: profileSource.calidadOportunidades || "",
      numTrabajadores: profileSource.numTrabajadores || "",
      localizacionPermanente: profileSource.localizacionPermanente || "",
      capitalInvertido: profileSource.capitalInvertido || "",
      planesLargoPlazo: profileSource.planesLargoPlazo || "",
      
      industry: businessWithSettings.industry || "",
      businessType: businessWithSettings.businessType || "",
      
      moneda: businessWithSettings.configuracion?.moneda || "PEN",
      country: address.country || "PE",

      workingHours: configSettings.workingHours || {
        monday: { open: '08:00', close: '18:00', isOpen: true },
        tuesday: { open: '08:00', close: '18:00', isOpen: true },
        wednesday: { open: '08:00', close: '18:00', isOpen: true },
        thursday: { open: '08:00', close: '18:00', isOpen: true },
        friday: { open: '08:00', close: '18:00', isOpen: true },
        saturday: { open: '09:00', close: '14:00', isOpen: true },
        sunday: { open: '00:00', close: '00:00', isOpen: false }
      },
      notifications: configSettings.notifications || {
        email: true,
        push: true,
        lowStock: true,
        dailyReport: false
      }
    };
  } catch (error) {
    console.error("Error al cargar businessProfile y configuración:", error);
  } finally {
    originalData.value = JSON.parse(JSON.stringify(formData.value));
    isFormReady.value = true;
  }
}

const updateBusinessNameInUserRelations = async (businessId, newBusinessName) => {
  try {
    const usersRef = collection(db, "users");
    const usersSnapshot = await getDocs(usersRef);

    const updatePromises = [];

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const businessRelationRef = doc(db, "users", userId, "businesses", businessId);

      updatePromises.push(
        updateDoc(businessRelationRef, {
          businessName: newBusinessName,
          updatedAt: new Date(),
        }).catch((error) => {
          if (error.code !== "not-found") {
            console.warn(`No se pudo actualizar relación para usuario ${userId}:`, error);
          }
        }),
      );
    }

    await Promise.all(updatePromises);
    console.log(`✅ Nombre del negocio actualizado en todas las relaciones de usuarios`);
  } catch (error) {
    console.error("Error al actualizar relaciones de usuarios:", error);
  }
};

const handleSave = async () => {
  isSaving.value = true;

  try {
    const businessId = route.params.businessId || businessStore.business?.id;
    const normalizedBusinessName = (formData.value.nombreNegocio || "").toLocaleUpperCase("es-ES");
    formData.value.nombreNegocio = normalizedBusinessName;

    const businessRef = doc(db, "businesses", businessId);
    const businessProfileRef = doc(db, "businesses", businessId, "settings", "businessProfile");
    const configRef = doc(db, "businesses", businessId, "settings", "config");

    // 1. Perfil del negocio (datos overview)
    await setDoc(
      businessProfileRef,
      {
        nombreNegocio: normalizedBusinessName,
        anioInicio: formData.value.anioInicio,
        direccionNegocio: formData.value.direccionNegocio,
        codigoPostal: formData.value.codigoPostal,
        telefonoNegocio: formData.value.telefonoNegocio,
        departamento: formData.value.departamento,
        lineaNegocio: formData.value.lineaNegocio,
        descripcionSector: formData.value.descripcionSector,
        formaLegal: formData.value.formaLegal,
        posicionNegocio: formData.value.posicionNegocio,
        experiencia: formData.value.experiencia,
        oportunidadesMercado: formData.value.oportunidadesMercado,
        calidadOportunidades: formData.value.calidadOportunidades,
        numTrabajadores: formData.value.numTrabajadores,
        localizacionPermanente: formData.value.localizacionPermanente,
        capitalInvertido: formData.value.capitalInvertido,
        planesLargoPlazo: formData.value.planesLargoPlazo,
        updatedAt: new Date(),
      },
      { merge: true },
    );

    // 2. Documento raíz (nombre, industry, businessType, moneda, country)
    // Manteniendo la estructura actual de contactInfo si existe
    const currentBusiness = await getDoc(businessRef);
    let contactInfo = {};
    if (currentBusiness.exists()) {
      contactInfo = currentBusiness.data().contactInfo || {};
    }
    
    if (!contactInfo.address) contactInfo.address = {};
    contactInfo.address.country = formData.value.country;

    await updateDoc(businessRef, {
      businessName: normalizedBusinessName,
      industry: formData.value.industry,
      businessType: formData.value.businessType,
      "configuracion.moneda": formData.value.moneda,
      contactInfo: contactInfo,
      updatedAt: new Date(),
    });

    // 3. Settings Config (workingHours, notifications)
    await setDoc(
      configRef,
      {
        workingHours: formData.value.workingHours,
        notifications: formData.value.notifications,
        updatedAt: new Date(),
      },
      { merge: true }
    );

    // 4. Actualizar relaciones
    await updateBusinessNameInUserRelations(businessId, normalizedBusinessName);

    // 5. Actualizar store local
    await businessStore.loadBusinessWithSettings(businessId);

    // 6. Actualizar userStore si es el currentBusiness
    if (authStore.user?.uid) {
      await userStore.loadUserBusinesses(authStore.user.uid);
      if (userStore.currentBusiness?.businessId === businessId) {
        const updatedBusiness = userStore.userBusinesses.find((b) => b.businessId === businessId);
        if (updatedBusiness) {
          userStore.currentBusiness = updatedBusiness;
          localStorage.setItem("currentBusiness", JSON.stringify(updatedBusiness));
        }
      }
    }

    toast.success("Los datos del negocio se han actualizado correctamente", { duration: 2200 });
    originalData.value = JSON.parse(JSON.stringify(formData.value));
  } catch (error) {
    console.error("Error al guardar:", error);
    toast.error("Error al guardar los cambios. Inténtalo de nuevo.", { duration: 2600 });
  } finally {
    isSaving.value = false;
  }
};
</script>
