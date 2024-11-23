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

// Obtener instancias de Firestore y Authentication
const db = getFirestore(appFirebase);
const auth = getAuth(appFirebase);
const storage = getStorage(appFirebase);

// Verificar si estamos en un entorno local para conectar a los emuladores
if (window.location.hostname === 'localhost') {
  connectFirestoreEmulator(db, 'localhost', 8080); // Conectar Firestore Emulator en el puerto 8080
  connectAuthEmulator(auth, 'http://localhost:9099'); // Conectar Authentication Emulator en el puerto 9099
  connectStorageEmulator(storage, 'localhost', 9199); // Conectar Storage Emulator en el puerto 9199

}

export default appFirebase;