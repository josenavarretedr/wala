import { storeToRefs } from 'pinia'
import { useConsultingDossierStore } from '@/stores/consultingDossierStore'

export function useConsultingDossiers() {
  const store = useConsultingDossierStore()

  const {
    dossiers,
    currentDossier,
    loading,
    error,
    activeDossiers,
    dossiersByParticipant,
  } = storeToRefs(store)

  const {
    getStepLabel,
    getAllowedStepTransitions,
    loadProgramDossiers,
    loadDossier,
    createDossier,
    updateDossierStep,
    saveS0Assessment,
    getDossierByParticipant,
  } = store

  return {
    dossiers,
    currentDossier,
    loading,
    error,
    activeDossiers,
    dossiersByParticipant,
    getStepLabel,
    getAllowedStepTransitions,
    loadProgramDossiers,
    loadDossier,
    createDossier,
    updateDossierStep,
    saveS0Assessment,
    getDossierByParticipant,
  }
}
