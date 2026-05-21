import { defineStore } from "pinia";
import { ref } from "vue";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebaseInit";
import { useAuthStore } from "./authStore";
import { useToast } from "@/composables/useToast";
import { AREAS_CONFIG } from "./performanceStore";

export const useActionPlanFlowStore = defineStore("actionPlanFlow", () => {
  const currentStep = ref(0); // 0: Select Critical Area, 1-3: Config Indicators, 4: Review & Save
  const selectedAreaKey = ref(null);
  
  // Array of action objects selected/customized in the wizard:
  // { id, areaKey, indicatorKey, indicatorTitle, actionText, frequency, walaSection, status: 'incomplete' }
  const selectedActions = ref([]);
  const saving = ref(false);

  const authStore = useAuthStore();
  const toast = useToast();

  const resetFlow = () => {
    currentStep.value = 0;
    selectedAreaKey.value = null;
    selectedActions.value = [];
    saving.value = false;
  };

  const setArea = (areaKey) => {
    selectedAreaKey.value = areaKey;
    selectedActions.value = []; // Reset selected actions for a new design flow
  };

  const toggleAction = (actionItem, indicatorKey, indicatorTitle) => {
    // Unique ID combining indicator key and original action index
    const actionId = `${indicatorKey}_${actionItem.id}`;
    const index = selectedActions.value.findIndex((a) => a.id === actionId);

    if (index > -1) {
      // If already selected, remove it
      selectedActions.value.splice(index, 1);
    } else {
      // Add a copy to selected actions
      selectedActions.value.push({
        id: actionId,
        areaKey: selectedAreaKey.value,
        indicatorKey,
        indicatorTitle,
        actionText: actionItem.action, // Editable copy
        frequency: actionItem.frequency,
        walaSection: actionItem.wala,
        status: "incomplete", // Initial status is always incomplete
        createdAt: new Date().toISOString(),
      });
    }
  };

  const isActionSelected = (actionId) => {
    return selectedActions.value.some((a) => a.id === actionId);
  };

  const getAction = (actionId) => {
    return selectedActions.value.find((a) => a.id === actionId);
  };

  const updateActionText = (actionId, newText) => {
    const action = getAction(actionId);
    if (action) {
      action.actionText = newText;
    }
  };

  const nextStep = () => {
    if (currentStep.value < 4) {
      currentStep.value++;
    }
  };

  const prevStep = () => {
    if (currentStep.value > 0) {
      currentStep.value--;
    }
  };

  /**
   * Saves the action plan by fetching the existing actionPlan from Firestore,
   * removing existing actions for the currently active selectedAreaKey,
   * appending the newly configured actions, and saving it all back.
   */
  const saveActionPlan = async (businessId) => {
    if (!businessId) {
      toast.error("ID de negocio no válido");
      return false;
    }

    if (!selectedAreaKey.value) {
      toast.error("No se ha seleccionado un área crítica");
      return false;
    }

    saving.value = true;
    try {
      const docRef = doc(db, "businesses", businessId, "consulting", "dossier");
      const docSnap = await getDoc(docRef);
      
      let existingActionPlan = [];
      if (docSnap.exists()) {
        const data = docSnap.data();
        existingActionPlan = data.actionPlan || [];
      }

      // Filter out existing actions for the CURRENT selected area to overwrite/update them
      const filteredActionPlan = existingActionPlan.filter(
        (action) => action.areaKey !== selectedAreaKey.value
      );

      // Append newly designed actions
      const finalActionPlan = [...filteredActionPlan, ...selectedActions.value];

      // Save to Firestore
      await setDoc(
        docRef,
        {
          actionPlan: finalActionPlan,
          updatedAt: new Date(),
          updatedBy: authStore.user?.uid || "admin",
        },
        { merge: true }
      );

      // Synchronize hasConsulting in primary business document
      const bizRef = doc(db, "businesses", businessId);
      await setDoc(
        bizRef,
        {
          hasConsulting: true,
          updatedAt: new Date(),
        },
        { merge: true }
      );

      toast.success("Plan de Acción guardado con éxito");
      return true;
    } catch (error) {
      console.error("Error al guardar el Plan de Acción:", error);
      toast.error("Ocurrió un error al guardar el Plan de Acción");
      return false;
    } finally {
      saving.value = false;
    }
  };

  return {
    currentStep,
    selectedAreaKey,
    selectedActions,
    saving,
    resetFlow,
    setArea,
    toggleAction,
    isActionSelected,
    getAction,
    updateActionText,
    nextStep,
    prevStep,
    saveActionPlan,
  };
});
