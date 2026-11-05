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
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'wala-lat.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'wala-lat',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'wala-lat.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789012:web:wala-plan'
};

// Inicialización de la app de Firebase (singleton)
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Instancia modular de Firestore
export const db = getFirestore(app);

// Instancia modular de Auth con persistencia local garantizada
export const auth = getAuth(app);
export { getAuth };

// Instancia modular de Functions (región southamerica-east1 por estándar de Wala)
export const functions = getFunctions(app, 'southamerica-east1');

// Fijar persistencia local en navegador para mantener sesión activa tras recargas
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.warn('[Firebase Auth] Aviso al fijar persistencia local:', err?.message || err);
  });
}

// Indicador reactivo / exportable de uso de emulador
export const isEmulatorActive = Boolean(
  import.meta.env.DEV && (
    import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true' ||
    (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
  )
);

// Conexión a Emuladores Locales de Firebase (con guardia de Vite HMR)
const EMULATOR_CONNECTED_KEY = '__FIREBASE_EMULATORS_CONNECTED__';

if (isEmulatorActive && !globalThis[EMULATOR_CONNECTED_KEY]) {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectFunctionsEmulator(functions, 'localhost', 5001);
    globalThis[EMULATOR_CONNECTED_KEY] = true;
    console.info('[Firebase] Emuladores locales conectados exitosamente (Firestore: 8080, Auth: 9099, Functions: 5001)');
  } catch (error) {
    console.warn('[Firebase] Aviso al conectar con emuladores locales:', error.message || error);
  }
}

export default app;
