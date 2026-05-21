import re

with open('src/stores/adminBusinessConsultingStore.js', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('useConsultingDossierStore', 'useAdminBusinessConsultingStore')
c = c.replace(\"'consultingDossier'\", \"'adminBusinessConsulting'\")
c = re.sub(r\"doc\\(db, 'programs', programId, 'consultingDossiers', dossierId\\)\", \"doc(db, 'businesses', businessId, 'consulting', 'consulting')\", c)
c = c.replace(\"loadProgramDossiers(programId)\", \"loadProgramDossiers(businessId)\")
c = c.replace(\"loadDossier(programId, dossierId)\", \"loadDossier(businessId)\")
c = c.replace(\"updateDossierStep(programId, dossierId, nextStep)\", \"updateDossierStep(businessId, nextStep)\")
c = c.replace(\"saveS0Assessment(programId, dossierId, payload)\", \"saveS0Assessment(businessId, payload)\")
c = c.replace(\"saveProgramConsultingDossier(programId, dossierId, payload)\", \"saveProgramConsultingDossier(businessId, payload)\")
c = c.replace(\"markCycleCompleted(programId, dossierId, cycleKey)\", \"markCycleCompleted(businessId, cycleKey)\")
c = c.replace(\"reopenCycleWithCascade(programId, dossierId, cycleKey)\", \"reopenCycleWithCascade(businessId, cycleKey)\")
c = c.replace(\"createDossier(programId, participant)\", \"createDossier(businessId, participant)\")

with open('src/stores/adminBusinessConsultingStore.js', 'w', encoding='utf-8') as f:
    f.write(c)
