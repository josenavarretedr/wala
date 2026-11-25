import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import {
  getAuth,
  connectAuthEmulator,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const appFirebase = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(appFirebase);
const auth = getAuth(appFirebase);
const functions = getFunctions(appFirebase, 'southamerica-east1');

if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.warn('[Firebase Auth] Aviso al fijar persistencia local:', err?.message || err);
  });
}

// Conectar a los emuladores locales de Firebase si estamos en localhost (con guardia HMR)
const EMULATOR_CONNECTED_KEY = '__WALA_CONTENT_EMULATORS_CONNECTED__';
if (
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
  !globalThis[EMULATOR_CONNECTED_KEY]
) {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectFunctionsEmulator(functions, 'localhost', 5001);
    globalThis[EMULATOR_CONNECTED_KEY] = true;
    console.log('🔌 Emuladores locales conectados (Firestore: 8080, Auth: 9099, Functions: 5001)');
  } catch (err) {
    console.warn('[Firebase] Aviso al conectar emuladores:', err?.message || err);
  }
}

export { db, auth, functions };
export default appFirebase;
