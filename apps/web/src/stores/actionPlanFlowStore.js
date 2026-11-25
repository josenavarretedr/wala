import { defineStore } from "pinia";
import { ref } from "vue";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebaseInit";
import { useAuthStore } from "./authStore";
import { useToast } from "@/composables/useToast";
import { resolveActionMeta } from "@/config/actionBankMeta";

export const CYCLE_OPTIONS = [
  { key: "ciclo1", label: "Ciclo 1", description: "Primer ciclo de implementación" },
  { key: "ciclo2", label: "Ciclo 2", description: "Segundo ciclo de profundización" },
  { key: "ciclo3", label: "Ciclo 3", description: "Consolidación y autonomía" },
];

export const ACTION_STATUS = {
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  NOT_DONE: "not_done",
};

/**
 * Normaliza una acción (legacy o v2) asegurando compatibilidad de campos y metadatos
 */
export function normalizeActionItem(act, cycleKey = "ciclo1") {
  if (!act) return null;
  const meta =
    act.actionType && act.evidenceRule
      ? act
      : resolveActionMeta(act.indicatorKey, act.tranche, {
          id: act.actionNumber || act.id?.split("_").pop() || 1,
          action: act.actionText,
          frequency: act.frequency,
          wala: act.walaSection,
        });

  let normalizedStatus = act.status || ACTION_STATUS.IN_PROGRESS;
  if (normalizedStatus === "incomplete") {
    normalizedStatus = ACTION_STATUS.IN_PROGRESS;
  }

  return {
    ...act,
    cycleKey: act.cycleKey || cycleKey,
    tranche: act.tranche || meta.tranche,
    actionKey: act.actionKey || meta.actionKey,
    actionType: act.actionType || meta.actionType,
    actionTypeLabel: act.actionTypeLabel || meta.actionTypeLabel,
    targetRoute:
      act.targetRoute !== undefined ? act.targetRoute : meta.targetRoute,
    presetParams:
      act.presetParams !== undefined ? act.presetParams : meta.presetParams,
    configKey: act.configKey !== undefined ? act.configKey : meta.configKey,
    inputType: act.inputType !== undefined ? act.inputType : meta.inputType,
    options: act.options !== undefined ? act.options : meta.options,
    ctaLabel: act.ctaLabel || meta.ctaLabel,
    promptPlaceholder: act.promptPlaceholder || meta.promptPlaceholder,
    evidenceRule: act.evidenceRule || meta.evidenceRule,
    status: normalizedStatus,
    entrepreneurNote: act.entrepreneurNote || "",
    advisorNote: act.advisorNote || "",
  };
}

export const useActionPlanFlowStore = defineStore("actionPlanFlow", () => {
  const currentStep = ref(0); // 0: Select Critical Area, 1-3: Config Indicators, 4: Review & Save
  const selectedCycleKey = ref("ciclo1");
  const activeCycleKey = ref("ciclo1");
  const actionPlansByCycle = ref({
    ciclo1: [],
    ciclo2: [],
    ciclo3: [],
  });

  const selectedAreaKey = ref(null);
  const selectedActions = ref([]);
  const saving = ref(false);

  const authStore = useAuthStore();
  const toast = useToast();

  const resetFlow = (keepCycle = false) => {
    currentStep.value = 0;
    selectedAreaKey.value = null;
    selectedActions.value = [];
    saving.value = false;
    if (!keepCycle) {
      selectedCycleKey.value = activeCycleKey.value || "ciclo1";
    }
  };

  const loadDossierActionPlans = async (businessId) => {
    if (!businessId) return;
    try {
      const docRef = doc(db, "businesses", businessId, "consulting", "dossier");
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        actionPlansByCycle.value = { ciclo1: [], ciclo2: [], ciclo3: [] };
        activeCycleKey.value = "ciclo1";
        selectedCycleKey.value = "ciclo1";
        return;
      }

      const data = docSnap.data();
      const loadedActiveCycle = data.activeCycleKey || "ciclo1";
      activeCycleKey.value = loadedActiveCycle;

      const hasCyclesMap = Boolean(
        data.actionPlansByCycle && typeof data.actionPlansByCycle === "object"
      );
      const byCycle = data.actionPlansByCycle || {};
      const legacyFlat = Array.isArray(data.actionPlan) ? data.actionPlan : [];

      const ciclo1Raw = hasCyclesMap
        ? Array.isArray(byCycle.ciclo1)
          ? byCycle.ciclo1
          : []
        : legacyFlat;
      const ciclo2Raw = Array.isArray(byCycle.ciclo2) ? byCycle.ciclo2 : [];
      const ciclo3Raw = Array.isArray(byCycle.ciclo3) ? byCycle.ciclo3 : [];

      actionPlansByCycle.value = {
        ciclo1: ciclo1Raw.map((a) => normalizeActionItem(a, "ciclo1")).filter(Boolean),
        ciclo2: ciclo2Raw.map((a) => normalizeActionItem(a, "ciclo2")).filter(Boolean),
        ciclo3: ciclo3Raw.map((a) => normalizeActionItem(a, "ciclo3")).filter(Boolean),
      };
    } catch (error) {
      console.error("Error cargando planes por ciclo:", error);
    }
  };

  const setSelectedCycle = (cycleKey) => {
    if (!["ciclo1", "ciclo2", "ciclo3"].includes(cycleKey)) return;
    selectedCycleKey.value = cycleKey;
    if (selectedAreaKey.value) {
      hydrateSelectedAreaFromCycle(selectedAreaKey.value);
    }
  };

  const hydrateSelectedAreaFromCycle = (areaKey) => {
    const cycleActions = actionPlansByCycle.value[selectedCycleKey.value] || [];
    selectedActions.value = cycleActions
      .filter((a) => a.areaKey === areaKey)
      .map((a) => ({ ...a }));
  };

  const setArea = (areaKey) => {
    selectedAreaKey.value = areaKey;
    hydrateSelectedAreaFromCycle(areaKey);
  };

  const buildActionId = (actionItem, indicatorKey) => {
    if (actionItem.actionKey) return actionItem.actionKey;
    const tranche = actionItem.tranche || "0-1";
    return `${indicatorKey}_${tranche}_${actionItem.id}`;
  };

  const findActionIndexInSelected = (actionItem, indicatorKey) => {
    const newId = buildActionId(actionItem, indicatorKey);
    const legacyId = `${indicatorKey}_${actionItem.id}`;
    return selectedActions.value.findIndex(
      (a) => a.id === newId || a.id === legacyId || a.actionKey === newId
    );
  };

  const toggleAction = (actionItem, indicatorKey, indicatorTitle) => {
    const idx = findActionIndexInSelected(actionItem, indicatorKey);

    if (idx > -1) {
      selectedActions.value.splice(idx, 1);
      return;
    }

    const actionId = buildActionId(actionItem, indicatorKey);
    const meta = resolveActionMeta(indicatorKey, actionItem.tranche, actionItem);

    selectedActions.value.push({
      id: actionId,
      actionKey: actionId,
      cycleKey: selectedCycleKey.value,
      areaKey: selectedAreaKey.value,
      indicatorKey,
      indicatorTitle,
      actionNumber: actionItem.id,
      tranche: meta.tranche,
      actionText: actionItem.action,
      frequency: actionItem.frequency,
      walaSection: actionItem.wala,
      actionType: meta.actionType,
      actionTypeLabel: meta.actionTypeLabel,
      targetRoute: meta.targetRoute,
      presetParams: meta.presetParams,
      configKey: meta.configKey,
      inputType: meta.inputType,
      options: meta.options,
      ctaLabel: meta.ctaLabel,
      promptPlaceholder: meta.promptPlaceholder,
      evidenceRule: meta.evidenceRule,
      status: ACTION_STATUS.IN_PROGRESS,
      entrepreneurNote: "",
      advisorNote: "",
      createdAt: new Date().toISOString(),
    });
  };

  const isActionSelected = (actionItemOrId, indicatorKey = null) => {
    if (typeof actionItemOrId === "object" && actionItemOrId !== null && indicatorKey) {
      return findActionIndexInSelected(actionItemOrId, indicatorKey) > -1;
    }
    return selectedActions.value.some(
      (a) => a.id === actionItemOrId || a.actionKey === actionItemOrId
    );
  };

  const getAction = (actionItemOrId, indicatorKey = null) => {
    if (typeof actionItemOrId === "object" && actionItemOrId !== null && indicatorKey) {
      const idx = findActionIndexInSelected(actionItemOrId, indicatorKey);
      return idx > -1 ? selectedActions.value[idx] : undefined;
    }
    return selectedActions.value.find(
      (a) => a.id === actionItemOrId || a.actionKey === actionItemOrId
    );
  };

  const updateActionText = (actionItemOrId, newText, indicatorKey = null) => {
    const action = getAction(actionItemOrId, indicatorKey);
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

  const setActiveCycle = async (businessId, cycleKey) => {
    if (!businessId || !["ciclo1", "ciclo2", "ciclo3"].includes(cycleKey)) return false;
    try {
      activeCycleKey.value = cycleKey;
      const docRef = doc(db, "businesses", businessId, "consulting", "dossier");
      const activeList = actionPlansByCycle.value[cycleKey] || [];
      await setDoc(
        docRef,
        {
          activeCycleKey: cycleKey,
          actionPlan: activeList,
          updatedAt: new Date(),
          updatedBy: authStore.user?.uid || "admin",
        },
        { merge: true }
      );
      toast.success(`Ciclo activo cambiado a ${CYCLE_OPTIONS.find((c) => c.key === cycleKey)?.label || cycleKey}`);
      return true;
    } catch (error) {
      console.error("Error al cambiar el ciclo activo:", error);
      toast.error("No se pudo actualizar el ciclo activo");
      return false;
    }
  };

  /**
   * Guarda el plan de acción del ciclo seleccionado manteniendo las otras áreas
   * del mismo ciclo y el historial de otros ciclos, y sincronizando actionPlan.
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

      let currentByCycle = {
        ciclo1: [],
        ciclo2: [],
        ciclo3: [],
      };
      let currentActiveCycle = activeCycleKey.value || "ciclo1";

      if (docSnap.exists()) {
        const data = docSnap.data();
        currentActiveCycle = data.activeCycleKey || currentActiveCycle;
        if (data.actionPlansByCycle) {
          currentByCycle = {
            ciclo1: Array.isArray(data.actionPlansByCycle.ciclo1)
              ? data.actionPlansByCycle.ciclo1
              : [],
            ciclo2: Array.isArray(data.actionPlansByCycle.ciclo2)
              ? data.actionPlansByCycle.ciclo2
              : [],
            ciclo3: Array.isArray(data.actionPlansByCycle.ciclo3)
              ? data.actionPlansByCycle.ciclo3
              : [],
          };
        } else if (Array.isArray(data.actionPlan)) {
          currentByCycle.ciclo1 = data.actionPlan;
        }
      }

      const cycleKey = selectedCycleKey.value || "ciclo1";
      const existingCyclePlan = currentByCycle[cycleKey] || [];
      const existingById = new Map(existingCyclePlan.map((a) => [a.id, a]));

      // Preservar progreso y notas si la acción ya existía previamente
      const sanitizedSelected = selectedActions.value.map((act) => {
        const prev = existingById.get(act.id);
        return {
          ...act,
          cycleKey,
          status: prev?.status || act.status || ACTION_STATUS.IN_PROGRESS,
          entrepreneurNote: prev?.entrepreneurNote || act.entrepreneurNote || "",
          advisorNote: prev?.advisorNote || act.advisorNote || "",
          completedAt: prev?.completedAt || null,
          updatedAt: new Date().toISOString(),
        };
      });

      const otherAreasInCycle = existingCyclePlan.filter(
        (action) => action.areaKey !== selectedAreaKey.value
      );

      const updatedCyclePlan = [...otherAreasInCycle, ...sanitizedSelected];
      currentByCycle[cycleKey] = updatedCyclePlan;

      // Sincronizar store local
      actionPlansByCycle.value = {
        ciclo1: currentByCycle.ciclo1.map((a) => normalizeActionItem(a, "ciclo1")),
        ciclo2: currentByCycle.ciclo2.map((a) => normalizeActionItem(a, "ciclo2")),
        ciclo3: currentByCycle.ciclo3.map((a) => normalizeActionItem(a, "ciclo3")),
      };

      const flatActivePlan = currentByCycle[currentActiveCycle] || updatedCyclePlan;

      await setDoc(
        docRef,
        {
          activeCycleKey: currentActiveCycle,
          actionPlansByCycle: currentByCycle,
          actionPlan: flatActivePlan,
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
    selectedCycleKey,
    activeCycleKey,
    actionPlansByCycle,
    selectedAreaKey,
    selectedActions,
    saving,
    resetFlow,
    loadDossierActionPlans,
    setSelectedCycle,
    setActiveCycle,
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
