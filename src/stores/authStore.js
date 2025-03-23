// authStore.js
import { ref } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { useUsers } from '@/composables/useUsers';

const user = ref(null);
const loading = ref(false);
const error = ref(null);

export function useAuthStore() {


  const { loginWithEmail, loginWithGoogle, registerUser, logoutUser, fetchUser } = useAuth();

  const { createUser } = useUsers();

  async function login(email, password) {
    loading.value = true;
    error.value = null;
    try {
      user.value = await loginWithEmail(email, password);
    } catch (error) {
      error.value = error.message;
    } finally {
      loading.value = false;
    }
  }

  async function loginGoogle() {
    loading.value = true;
    error.value = null;
    try {
      user.value = await loginWithGoogle();
    } catch (error) {
      error.value = error.message;
    } finally {
      loading.value = false;
    }
  }

  async function register(email, password, name) {
    loading.value = true;
    error.value = null;
    try {
      let userCmps = await registerUser(email, password);
      checkUser()
      await createUser(userCmps, name);

    } catch (error) {
      error.value = error.message;
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    await logoutUser();
    user.value = null;
  }

  async function checkUser() {
    if (user.value === null) {
      const fetchedUser = await fetchUser();
      user.value = fetchedUser;
    }
  }

  return {
    user,
    loading,
    error,
    login,
    loginGoogle,
    register,
    logout,
    checkUser,
  };
}
