// src/composables/useBusiness.js
import { collection, query, where, getDocs, addDoc, updateDoc, doc, arrayUnion, getFirestore } from "firebase/firestore";
import appFirebase from "@/firebaseInit";

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
  const businessRef = collection(db, "business");

  const docRef = await addDoc(businessRef, {
    ...businessData,
    owner: uid,
    collaborators: [],
    createdAt: new Date(),
  });

  return docRef.id;
};

// 🤝 Agregar colaborador
export const addBusinessCollaborator = async (businessId, collaboratorUid) => {
  const businessDocRef = doc(db, "business", businessId);
  await updateDoc(businessDocRef, {
    collaborators: arrayUnion(collaboratorUid),
  });

  return true;
};
