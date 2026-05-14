// src/composables/useBusiness.js
import { collection, query, where, getDocs, setDoc, updateDoc, doc, arrayUnion, getFirestore } from "firebase/firestore";
import appFirebase from "@/firebaseInit";
import { v4 as uuidv4 } from 'uuid';
import { getBusinessCapabilities } from "@/utils/businessCapabilities";

const db = getFirestore(appFirebase);

// 🔍 Buscar negocios del usuario propietario
export const fetchBusinessesByOwner = async (uid) => {
  const businessRef = collection(db, "businesses");
  const q = query(businessRef, where("owner", "==", uid));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// 🆕 Crear nuevo negocio
export const createBusiness = async (uid, businessData) => {

  const businessUuid = uuidv4();
  const businessRef = doc(db, 'businesses', businessUuid);

  // Excluir 'descripcion' del spread para evitar campo duplicado en Firestore
  const { descripcion: _legacyDesc, ...cleanBusinessData } = businessData;
  const normalizedDescription = businessData.description || businessData.descripcion || '';

  const businessDocument = {
    ...cleanBusinessData,
    uuid: businessUuid,
    owner: uid,
    collaborators: [],
    createdAt: new Date(),
    updatedAt: new Date(),

    // ===== CLASIFICACIÓN IA =====
    industry: businessData.industry || 'otro',
    industryDetectedBy: businessData.industry && businessData.industry !== 'otro' ? 'manual' : 'pending',
    industryConfidence: businessData.industry && businessData.industry !== 'otro' ? 1.0 : 0.0,
    description: normalizedDescription,

    // ===== TIPO DE ACTIVIDAD ECONÓMICA =====
    businessType: businessData.businessType || '',

    // ===== CONTROL DE USO DE IA =====
    aiUsage: {
      classificationsThisMonth: 0,
      llmCallsThisMonth: 0,
      lastResetAt: new Date(),
      plan: 'free',
      limits: {
        maxClassificationsPerDay: 50,
        maxLLMCallsPerDay: 10
      }
    },
    hasCustomTaxonomy: false,

    // ===== INFORMACIÓN DE CONTACTO =====
    contactInfo: {
      email: businessData.contactInfo?.email || businessData.email || '',
      phone: businessData.contactInfo?.phone || businessData.telefono || '',
      address: {
        street: businessData.contactInfo?.address?.street || businessData.direccion || '',
        city: businessData.contactInfo?.address?.city || '',
        state: businessData.contactInfo?.address?.state || '',
        country: businessData.contactInfo?.address?.country || 'CO',
        zipCode: businessData.contactInfo?.address?.zipCode || ''
      },
      website: businessData.contactInfo?.website || '',
      socialMedia: {
        facebook: businessData.contactInfo?.socialMedia?.facebook || '',
        instagram: businessData.contactInfo?.socialMedia?.instagram || '',
        twitter: businessData.contactInfo?.socialMedia?.twitter || '',
        linkedin: businessData.contactInfo?.socialMedia?.linkedin || ''
      }
    },

    // ===== SUSCRIPCIÓN Y CARACTERÍSTICAS =====
    subscription: {
      plan: 'free',
      status: 'active',
      startDate: new Date(),
      endDate: null,
      trialUsed: false,
      paymentMethod: null,
      lastPaymentDate: null,
      autoRenew: false,
      updatedAt: new Date(),
      updatedBy: uid
    },
    features: {
      maxEmployees: 3,
      maxProducts: 100,
      advancedReports: false,
      multiLocation: false,
      apiAccess: false,
      prioritySupport: false,
      customBranding: false,
      aiClassification: false,
      exportData: false,
      ...getBusinessCapabilities(businessData.businessType)
    },
    usage: {
      employeeCount: 1,
      productCount: 0,
      lastUpdated: new Date()
    },

    // ===== METADATOS =====
    isActive: true,
    deleted: false,
    version: 1
  };

  await setDoc(businessRef, businessDocument);

  // ===== CREAR SUBCOLECCIÓN SETTINGS =====
  console.log('📁 Creando configuraciones en settings/...')

  // 1. settings/onboarding
  const onboardingRef = doc(db, 'businesses', businessUuid, 'settings', 'onboarding')
  await setDoc(onboardingRef, {
    completedTours: {},
    tourStarts: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })

  // 2. settings/config
  const configRef = doc(db, 'businesses', businessUuid, 'settings', 'config')
  await setDoc(configRef, {
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
    },
    display: {
      theme: 'auto',
      language: 'es',
      dateFormat: 'DD/MM/YYYY',
      currencyFormat: '$1,000.00'
    },
    // Plataformas de delivery predefinidas
    deliveryPlatforms: [
      { id: 'rappi', name: 'Rappi', defaultCommission: 30, enabled: true },
      { id: 'pedidosya', name: 'PedidosYa', defaultCommission: 25, enabled: true },
      { id: 'ubereats', name: 'Uber Eats', defaultCommission: 30, enabled: true },
      { id: 'glovo', name: 'Glovo', defaultCommission: 28, enabled: false },
      { id: 'whatsapp', name: 'WhatsApp Directo', defaultCommission: 0, enabled: true },
    ],
    updatedAt: new Date()
  })

  // 3. settings/integrations
  const integrationsRef = doc(db, 'businesses', businessUuid, 'settings', 'integrations')
  await setDoc(integrationsRef, {
    payment: {},
    accounting: {},
    shipping: {},
    updatedAt: new Date()
  })

  // 4. settings/customization
  const customizationRef = doc(db, 'businesses', businessUuid, 'settings', 'customization')
  await setDoc(customizationRef, {
    branding: {
      logo: '',
      favicon: '',
      primaryColor: '#3B82F6',
      secondaryColor: '#10B981',
      accentColor: '#F59E0B'
    },
    invoice: {
      template: 'modern',
      footer: '',
      notes: ''
    },
    receipt: {
      header: businessData.nombre || businessData.name || 'Mi Negocio',
      footer: 'Gracias por su compra',
      showLogo: false
    },
    updatedAt: new Date()
  })

  // 5. settings/businessProfile
  // Requerido por la Cloud Function joinProgramByCode como prerequisito
  const businessProfileRef = doc(db, 'businesses', businessUuid, 'settings', 'businessProfile')
  await setDoc(businessProfileRef, {
    // Campo crítico leído por la CF en getFirstNonEmpty()
    businessName: cleanBusinessData.businessName || cleanBusinessData.nombre || '',
    // Alias usados por distintas partes del sistema
    nombreNegocio: cleanBusinessData.businessName || cleanBusinessData.nombre || '',
    razonSocial: cleanBusinessData.businessName || cleanBusinessData.nombre || '',
    // Descripción del negocio
    descripcionSector: normalizedDescription,
    // Campos del perfil extendido (vacíos, se completan en business-info)
    lineaNegocio: '',
    formaLegal: '',
    posicionNegocio: '',
    experiencia: '',
    anioInicio: '',
    direccionNegocio: '',
    codigoPostal: '',
    telefonoNegocio: '',
    departamento: '',
    numTrabajadores: '',
    localizacionPermanente: '',
    capitalInvertido: '',
    planesLargoPlazo: '',
    oportunidadesMercado: '',
    calidadOportunidades: '',
    // Metadata
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    source: 'onboarding_v1',
  })

  console.log('✅ Negocio y configuraciones creadas exitosamente')

  return businessUuid;
};

// 🤝 Agregar colaborador
export const addBusinessCollaborator = async (businessId, collaboratorUid) => {
  const businessDocRef = doc(db, "businesses", businessId);
  await updateDoc(businessDocRef, {
    collaborators: arrayUnion(collaboratorUid),
  });

  return true;
};
