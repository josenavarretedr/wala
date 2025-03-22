import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
  arrayUnion,
  increment
} from "firebase/firestore";
import appFirebase from "@/firebaseInit";

import { v4 as uuidv4 } from 'uuid';

const db = getFirestore(appFirebase);

export function useUsers() {
  // Crear un nuevo ítem
  const createUser = async (user, name) => {
    try {

      const userRef = doc(db, `users`, user.uid);

      await setDoc(userRef, {
        uid: user.uid,
        name,
        email: user.email,
        createdAt: serverTimestamp(),
      });
      console.log("Users created successfully");
    } catch (error) {
      console.error("Error creating user: ", error);
      throw error;
    }
  };

  return {
    createUser,
  };
}
