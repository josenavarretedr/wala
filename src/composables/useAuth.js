import { ref } from 'vue';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

export function useAuth() {
  const auth = getAuth();
  const loading = ref(false);

  // Función para iniciar sesión
  const login = async (email, password) => {
    loading.value = true;
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user; // Retorna el usuario
    } catch (error) {
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // Función para cerrar sesión
  const logout = async () => {
    await signOut(auth);
  };

  // Observar el estado de autenticación
  const observeAuthState = (callback) => {
    return onAuthStateChanged(auth, callback); // Callback con el usuario
  };

  return { login, logout, observeAuthState, loading };
}
