import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, isEmulatorActive } from '@/services/firebase';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

const DEFAULT_AUTHORIZED_EMAILS = [
  'josenavarretedr@gmail.com',
  'facilitador.demo@planseed.org',
  'admin@planseed.org',
  'consultor@planseed.org'
];

/**
 * Obtiene la lista blanca de correos autorizados como facilitadores
 * configurada en variables de entorno (VITE_FACILITATOR_EMAILS) y lista base
 */
export function getAuthorizedEmails() {
  const envEmails = import.meta.env.VITE_FACILITATOR_EMAILS || '';
  const parsed = envEmails
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  // Unir la lista base autorizada con cualquier correo configurado en variables de entorno
  const combined = Array.from(new Set([...DEFAULT_AUTHORIZED_EMAILS, ...parsed]));
  return combined;
}

/**
 * Verifica si un correo electrónico tiene permisos de facilitador / consultor
 * @param {string} email
 * @returns {boolean}
 */
export function isAuthorizedEmail(email) {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  const whitelist = getAuthorizedEmails();

  // Si la lista contiene '*', permite cualquier correo (solo si explícitamente se configuró)
  if (whitelist.includes('*')) return true;

  return whitelist.includes(normalized);
}

const FACILITATOR_SESSION_CACHE_KEY = 'emprendeapp_facilitator_cached_session';

/**
 * Inicia sesión de facilitador con Google vía Firebase Auth
 * @returns {Promise<{ user: object, isAuthorized: boolean }>}
 */
export async function signInFacilitatorWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const isAuthorized = isAuthorizedEmail(user.email);

    if (!isAuthorized) {
      // Si no está en la lista blanca, cerrar sesión para evitar dejar credencial huérfana
      await signOutFacilitator();
      throw new Error(
        `El correo ${user.email} no está registrado en la lista de facilitadores autorizados. Contacta al administrador del programa.`
      );
    }

    const userObj = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email,
      photoURL: user.photoURL,
      isAuthorized: true
    };

    try {
      localStorage.setItem(FACILITATOR_SESSION_CACHE_KEY, JSON.stringify(userObj));
    } catch (e) {
      console.warn('[FacilitatorAuth] No se pudo guardar caché de sesión:', e);
    }

    // Resetear promesa de espera para refrescar estado en próximas consultas
    authReadyPromise = null;

    return { user: userObj, isAuthorized: true };
  } catch (error) {
    console.error('[FacilitatorAuth] Error en signInWithGoogle:', error);
    throw error;
  }
}

/**
 * Acceso rápido para entorno de desarrollo / emulador
 * Permite simular una sesión válida de facilitador sin popups de Google
 */
export async function signInAsDevFacilitator(demoEmail = 'josenavarretedr@gmail.com') {
  if (!import.meta.env.DEV && !isEmulatorActive) {
    throw new Error('El acceso de desarrollo solo está disponible en modo DEV o con emuladores activos.');
  }

  const name = demoEmail === 'josenavarretedr@gmail.com' ? 'José Navarrete' : 'Consultor Demo PlanSeed';

  // Objeto de usuario simulado para pruebas locales rápidas
  const mockUser = {
    uid: 'dev-facilitator-uid-01',
    email: demoEmail,
    displayName: name,
    photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff`,
    emailVerified: true
  };

  localStorage.setItem('emprendeapp_dev_facilitator_user', JSON.stringify(mockUser));
  try {
    localStorage.setItem(FACILITATOR_SESSION_CACHE_KEY, JSON.stringify({ ...mockUser, isAuthorized: true }));
  } catch (e) {}

  authReadyPromise = null;
  return { user: mockUser, isAuthorized: true };
}

/**
 * Cierra la sesión activa del facilitador y limpia almacenamiento local
 */
export async function signOutFacilitator() {
  try {
    localStorage.removeItem('emprendeapp_dev_facilitator_user');
    localStorage.removeItem(FACILITATOR_SESSION_CACHE_KEY);
  } catch (e) {}
  authReadyPromise = null;
  try {
    await signOut(auth);
  } catch (err) {
    console.warn('[FacilitatorAuth] Aviso al cerrar sesión en Firebase Auth:', err);
  }
}

/**
 * Obtiene el usuario facilitador actualmente autenticado (real o dev o en caché local)
 */
export function getCurrentFacilitator() {
  if (auth.currentUser) {
    const isAuth = isAuthorizedEmail(auth.currentUser.email);
    const userObj = {
      uid: auth.currentUser.uid,
      email: auth.currentUser.email,
      displayName: auth.currentUser.displayName || auth.currentUser.email,
      photoURL: auth.currentUser.photoURL,
      isAuthorized: isAuth
    };
    if (isAuth) {
      try {
        localStorage.setItem(FACILITATOR_SESSION_CACHE_KEY, JSON.stringify(userObj));
      } catch (e) {}
    }
    return userObj;
  }

  // Verificar si hay sesión en caché local (permite acceso instantáneo sin parpadeo al recargar)
  const cached = localStorage.getItem(FACILITATOR_SESSION_CACHE_KEY);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (parsed?.email && isAuthorizedEmail(parsed.email)) {
        return parsed;
      }
    } catch (e) {
      localStorage.removeItem(FACILITATOR_SESSION_CACHE_KEY);
    }
  }

  // Verificar si hay sesión dev almacenada en localStorage
  if (import.meta.env.DEV || isEmulatorActive) {
    const devStored = localStorage.getItem('emprendeapp_dev_facilitator_user');
    if (devStored) {
      try {
        const user = JSON.parse(devStored);
        return {
          ...user,
          isAuthorized: isAuthorizedEmail(user.email)
        };
      } catch (e) {
        localStorage.removeItem('emprendeapp_dev_facilitator_user');
      }
    }
  }

  return null;
}

// Promesa singleton para resolver la carga inicial de Firebase Auth
let authReadyPromise = null;

/**
 * Espera a que Firebase Auth termine de restaurar su estado desde IndexedDB/almacenamiento local
 * @param {number} [timeoutMs=2500] Tiempo límite máximo antes de continuar
 * @returns {Promise<object|null>} Usuario facilitador resuelto o null
 */
export async function waitForFacilitatorAuthReady(timeoutMs = 2500) {
  if (!authReadyPromise) {
    authReadyPromise = new Promise((resolve) => {
      let isSettled = false;

      const finish = () => {
        if (!isSettled) {
          isSettled = true;
          resolve(getCurrentFacilitator());
        }
      };

      const timer = setTimeout(finish, timeoutMs);

      if (typeof auth.authStateReady === 'function') {
        auth.authStateReady()
          .then(() => {
            clearTimeout(timer);
            finish();
          })
          .catch((err) => {
            console.warn('[FacilitatorAuth] Error en authStateReady:', err);
            clearTimeout(timer);
            finish();
          });
      } else {
        const unsub = onAuthStateChanged(
          auth,
          () => {
            clearTimeout(timer);
            unsub();
            finish();
          },
          (err) => {
            console.warn('[FacilitatorAuth] Error en onAuthStateChanged listener:', err);
            clearTimeout(timer);
            finish();
          }
        );
      }
    });
  }

  return authReadyPromise;
}

/**
 * Observa cambios en el estado de autenticación de Firebase
 * @param {Function} callback
 * @returns {Function} unsubscribe function
 */
export function subscribeToFacilitatorAuth(callback) {
  return onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      const isAuth = isAuthorizedEmail(firebaseUser.email);
      const userObj = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || firebaseUser.email,
        photoURL: firebaseUser.photoURL,
        isAuthorized: isAuth
      };
      if (isAuth) {
        try {
          localStorage.setItem(FACILITATOR_SESSION_CACHE_KEY, JSON.stringify(userObj));
        } catch (e) {}
      }
      callback(userObj);
    } else {
      // Si Firebase confirma que no hay usuario activo, limpiar caché de sesión salvo que sea dev
      const devStored = localStorage.getItem('emprendeapp_dev_facilitator_user');
      if (!devStored) {
        localStorage.removeItem(FACILITATOR_SESSION_CACHE_KEY);
      }
      const devUser = getCurrentFacilitator();
      callback(devUser);
    }
  });
}
