import { defineStore } from "pinia";
import { ref } from "vue";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/firebaseInit";
import { useAuthStore } from "./authStore";
import { useToast } from "@/composables/useToast";
import { AREAS_CONFIG } from "./performanceStore";

export const useCriticalAreasFlowStore = defineStore("criticalAreasFlow", () => {
  const currentStep = ref(0); // Steps: 0 (Area 1), 1 (Area 2), 2 (Area 3), 3 (Success Screen)
  const selectedAreas = ref([null, null, null]);
  const justifications = ref(["", "", ""]);
  const saving = ref(false);
  
  const authStore = useAuthStore();
  const toast = useToast();

  const resetFlow = () => {
    currentStep.value = 0;
    selectedAreas.value = [null, null, null];
    justifications.value = ["", "", ""];
    saving.value = false;
  };

  const setArea = (stepIndex, areaKey) => {
    if (stepIndex >= 0 && stepIndex < 3) {
      selectedAreas.value[stepIndex] = areaKey;
    }
  };

  const setJustification = (stepIndex, text) => {
    if (stepIndex >= 0 && stepIndex < 3) {
      justifications.value[stepIndex] = text;
    }
  };

  const nextStep = () => {
    if (currentStep.value < 3) {
      currentStep.value++;
    }
  };

  const prevStep = () => {
    if (currentStep.value > 0) {
      currentStep.value--;
    }
  };

  const saveCriticalAreas = async (businessId, scoresByArea) => {
    if (!businessId) {
      toast.error("ID de negocio no válido");
      return false;
    }

    // Validate that all 3 areas are selected and have justifications
    for (let i = 0; i < 3; i++) {
      if (!selectedAreas.value[i]) {
        toast.error(`Por favor selecciona el área crítica #${i + 1}`);
        return false;
      }
      if (!justifications.value[i] || !justifications.value[i].trim()) {
        toast.error(`Por favor ingresa la justificación para el área #${i + 1}`);
        return false;
      }
    }

    saving.value = true;
    try {
      const docRef = doc(db, "businesses", businessId, "consulting", "dossier");

      // Build array of 3 critical areas
      const criticalAreasPayload = selectedAreas.value.map((areaKey, idx) => {
        const config = AREAS_CONFIG.find((a) => a.key === areaKey);
        return {
          areaKey,
          resumenArea: config ? config.name : "",
          justification: justifications.value[idx].trim(),
          score: scoresByArea[areaKey] !== undefined ? parseFloat(scoresByArea[areaKey]) : 0,
        };
      });

      // We will save it in criticalAreas field of dossier, and also create a readable summary string
      const summaryText = criticalAreasPayload
        .map((ca, idx) => `${idx + 1}. ${ca.resumenArea}: ${ca.justification}`)
        .join("\n\n");

      await setDoc(
        docRef,
        {
          criticalAreas: criticalAreasPayload,
          areasCriticasText: summaryText, // update readable summary text field as well
          updatedAt: new Date(),
          updatedBy: authStore.user?.uid || "admin",
        },
        { merge: true }
      );

      // Sincronizar hasConsulting en el negocio principal
      const bizRef = doc(db, "businesses", businessId);
      await setDoc(
        bizRef,
        {
          hasConsulting: true,
          updatedAt: new Date(),
        },
        { merge: true }
      );

      toast.success("Áreas críticas definidas con éxito");
      return true;
    } catch (error) {
      console.error("Error al guardar áreas críticas:", error);
      toast.error("Ocurrió un error al guardar las áreas críticas");
      return false;
    } finally {
      saving.value = false;
    }
  };

  return {
    currentStep,
    selectedAreas,
    justifications,
    saving,
    resetFlow,
    setArea,
    setJustification,
    nextStep,
    prevStep,
    saveCriticalAreas,
  };
});
