import { defineStore } from 'pinia';
import { useAuth } from '@/composables/useAuth';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null, // Estado del usuario
  }),
  actions: {
    async login(email, password) {
      const { login } = useAuth();
      const user = await login(email, password);
      this.user = user;
    },
    async logout() {
      const { logout } = useAuth();
      await logout();
      this.user = null;
    },
    setUser(user) {
      this.user = user;
    },
  },
});
