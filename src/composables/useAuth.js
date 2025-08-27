// useAuth.js - Única capa de conexión con Firebase Auth
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '@/firebaseInit';

// Proveedor para Google Auth
const googleProvider = new GoogleAuthProvider();

// Traducción de errores Firebase
const translateFirebaseError = (errorCode) => {
  const errors = {
    // Errores de login
    'auth/user-not-found': 'Usuario no encontrado',
    'auth/wrong-password': 'Contraseña incorrecta',
    'auth/too-many-requests': 'Demasiados intentos fallidos. Intenta más tarde',
    'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
    'auth/invalid-email': 'Formato de email inválido',
    'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
    'auth/invalid-credential': 'Credenciales inválidas',

    // Errores de registro
    'auth/email-already-in-use': 'Este correo electrónico ya está registrado',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
    'auth/operation-not-allowed': 'El registro no está permitido',
    'auth/invalid-display-name': 'El nombre no es válido'
  }
  return errors[errorCode] || 'Error de autenticación'
}

export function useAuth() {

  // 🔐 LOGIN CON EMAIL Y PASSWORD
  async function loginWithEmail(email, password) {
    try {
      console.log('🔄 Iniciando login con email:', email);

      if (!email || !password) {
        throw new Error('Email y contraseña son obligatorios');
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified,
        timestamp: Date.now()
      };

      console.log('✅ Login exitoso:', userData.email);
      return userData;

    } catch (error) {
      console.error('❌ Error en login:', error);
      const translatedError = translateFirebaseError(error.code) || error.message;
      throw new Error(translatedError);
    }
  }

  // 📝 REGISTRO CON EMAIL, PASSWORD Y NOMBRE
  async function registerWithEmail(email, password, displayName) {
    try {
      console.log('🔄 Iniciando registro con email:', email);

      // Validaciones básicas
      if (!email || !password || !displayName) {
        throw new Error('Todos los campos son obligatorios');
      }

      if (password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      if (displayName.trim().length < 2) {
        throw new Error('El nombre debe tener al menos 2 caracteres');
      }

      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Actualizar perfil con el nombre
      await updateProfile(user, {
        displayName: displayName.trim()
      });

      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: displayName.trim(),
        emailVerified: user.emailVerified,
        timestamp: Date.now()
      };

      console.log('✅ Registro exitoso:', userData.email);
      console.log('👤 Nombre establecido:', displayName.trim());
      return userData;

    } catch (error) {
      console.error('❌ Error en registro:', error);
      const translatedError = translateFirebaseError(error.code) || error.message;
      throw new Error(translatedError);
    }
  }

  // 🔐 LOGIN CON GOOGLE
  async function loginWithGoogle() {
    try {
      console.log('🔄 Iniciando login con Google');

      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;

      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified,
        photoURL: user.photoURL,
        timestamp: Date.now()
      };

      console.log('✅ Login con Google exitoso:', userData.email);
      return userData;

    } catch (error) {
      console.error('❌ Error en login con Google:', error);
      const translatedError = translateFirebaseError(error.code) || error.message;
      throw new Error(translatedError);
    }
  }

  // 🚪 LOGOUT
  async function logoutUser() {
    try {
      console.log('🔄 Cerrando sesión...');
      await signOut(auth);
      console.log('✅ Sesión cerrada exitosamente');
      return true;
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
      throw new Error('Error al cerrar sesión');
    }
  }

  // 👤 OBTENER USUARIO ACTUAL
  function getCurrentUser() {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        if (user) {
          const userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            emailVerified: user.emailVerified,
            photoURL: user.photoURL
          };
          resolve(userData);
        } else {
          resolve(null);
        }
      });
    });
  }

  // 🔍 VERIFICAR ESTADO DE AUTENTICACIÓN
  async function checkAuthState() {
    try {
      console.log('🔍 Verificando estado de autenticación...');

      const user = await getCurrentUser();

      if (user) {
        console.log('✅ Usuario autenticado:', user.email);
        return user;
      } else {
        console.log('ℹ️ No hay usuario autenticado');
        return null;
      }
    } catch (error) {
      console.error('❌ Error verificando autenticación:', error);
      throw error;
    }
  }

  // 🔄 MONITOREAR CAMBIOS DE AUTENTICACIÓN
  function onAuthChange(callback) {
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified,
          photoURL: user.photoURL
        };
        callback(userData);
      } else {
        callback(null);
      }
    });
  }

  return {
    // Métodos principales
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    logoutUser,

    // Métodos de estado
    getCurrentUser,
    checkAuthState,
    onAuthChange,

    // Utilidades
    translateFirebaseError
  };
}
