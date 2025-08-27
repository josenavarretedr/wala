import { initializeApp } from 'firebase/app';

import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAuth, connectAuthEmulator } from 'firebase/auth';



const firebaseConfig = {

  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}



const appFirebase = initializeApp(firebaseConfig);


const db = getFirestore(appFirebase);
/**
 * An instance of Firebase Authentication service.
 * 
 * Provides methods for user authentication, such as sign-in, sign-out,
 * password management, and user account management.
 * 
 * @type {import('firebase/auth').Auth}
 * @see {@link https://firebase.google.com/docs/reference/js/auth.Auth}
 */
const auth = getAuth(appFirebase);
/**
 * Firebase Cloud Storage instance initialized with the provided Firebase app.
 * 
 * Use this instance to upload, download, and manage files in Firebase Storage.
 * 
 * @constant
 * @type {import("firebase/storage").FirebaseStorage}
 * @see {@link https://firebase.google.com/docs/storage}
 */
const storage = getStorage(appFirebase);

// Verificar si estamos en un entorno local para conectar a los emuladores
if (window.location.hostname === 'localhost') {
  connectFirestoreEmulator(db, 'localhost', 8080); // Conectar Firestore Emulator en el puerto 8080
  connectAuthEmulator(auth, 'http://localhost:9099'); // Conectar Authentication Emulator en el puerto 9099
  connectStorageEmulator(storage, 'localhost', 9199); // Conectar Storage Emulator en el puerto 9199
}

export default appFirebase;
export { db, auth, storage };