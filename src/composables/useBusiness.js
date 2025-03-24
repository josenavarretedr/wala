// src/composables/useBusiness.js
import { collection, query, where, getDocs, setDoc, updateDoc, doc, arrayUnion, getFirestore } from "firebase/firestore";
import appFirebase from "@/firebaseInit";
import { v4 as uuidv4 } from 'uuid';


const db = getFirestore(appFirebase);

// 🔍 Buscar negocios del usuario propietario
export const fetchBusinessesByOwner = async (uid) => {
  const businessRef = collection(db, "business");
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
  const businessRef = doc(db, 'business', businessUuid);

  await setDoc(businessRef, {
    ...businessData,
    uuid: businessUuid,
    owner: uid,
    collaborators: [],
    createdAt: new Date(),
  });

  return businessUuid;
};

// 🤝 Agregar colaborador
export const addBusinessCollaborator = async (businessId, collaboratorUid) => {
  const businessDocRef = doc(db, "business", businessId);
  await updateDoc(businessDocRef, {
    collaborators: arrayUnion(collaboratorUid),
  });

  return true;
};
