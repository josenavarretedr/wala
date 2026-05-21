const fs = require('fs');

let c = fs.readFileSync('src/stores/consultingDossierStore.js', 'utf8');
c = c.replace(/useConsultingDossierStore/g, 'useAdminBusinessConsultingStore');
c = c.replace(/'consultingDossier'/g, \"'adminBusinessConsulting'\");
c = c.replace(/loadProgramDossiers\(programId\)/g, \"loadProgramDossiers(businessId)\");
c = c.replace(/loadDossier\(programId, dossierId\)/g, \"loadDossier(businessId)\");
c = c.replace(/updateDossierStep\(programId, dossierId, nextStep\)/g, \"updateDossierStep(businessId, nextStep)\");
c = c.replace(/saveS0Assessment\(programId, dossierId, payload\)/g, \"saveS0Assessment(businessId, payload)\");
c = c.replace(/saveProgramConsultingDossier\(programId, dossierId, payload\)/g, \"saveProgramConsultingDossier(businessId, payload)\");
c = c.replace(/markCycleCompleted\(programId, dossierId, cycleKey\)/g, \"markCycleCompleted(businessId, cycleKey)\");
c = c.replace(/reopenCycleWithCascade\(programId, dossierId, cycleKey\)/g, \"reopenCycleWithCascade(businessId, cycleKey)\");
c = c.replace(/createDossier\(programId, participant\)/g, \"createDossier(businessId, participant)\");

// Inside loadProgramDossiers
c = c.replace(/collection\(db, 'programs', programId, 'consultingDossiers'\)/g, \"collection(db, 'businesses', businessId, 'consulting')\");

// Inside loadDossier, updateDossierStep, saveS0Assessment, saveProgramConsultingDossier, markCycleCompleted, reopenCycleWithCascade
c = c.replace(/doc\(db, 'programs', programId, 'consultingDossiers', dossierId\)/g, \"doc(db, 'businesses', businessId, 'consulting', 'consulting')\");

// replace "programs", programId, "consultingDossiers", dossierId references
c = c.replace(/dossierId/g, \"businessId\");
c = c.replace(/programId/g, \"businessId\");

fs.writeFileSync('src/stores/adminBusinessConsultingStore.js', c);
