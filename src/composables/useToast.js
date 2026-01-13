import { ref } from 'vue';

// Estado global para gestionar múltiples toasts
const toasts = ref([]);
let toastId = 0;

export function useToast() {
  /**
   * Muestra un nuevo toast
   * @param {Object} options - Opciones del toast
   * @param {string} options.message - Mensaje a mostrar
   * @param {string} options.type - Tipo de toast: 'info', 'success', 'warning', 'error', 'premium'
   * @param {number} options.duration - Duración en ms (default: 3000)
   * @param {boolean} options.closable - Si se puede cerrar manualmente (default: true)
   */
  const showToast = (options) => {
    const {
      message = '',
      type = 'info',
      duration = 1500,
      closable = true,
    } = options;

    const id = ++toastId;
    const toast = {
      id,
      message,
      type,
      duration,
      closable,
      show: true,
    };

    // Agregar el toast a la pila
    toasts.value.push(toast);

    // Auto-cerrar después de la duración especificada
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  };

  /**
   * Remueve un toast específico
   * @param {number} id - ID del toast a remover
   */
  const removeToast = (id) => {
    const index = toasts.value.findIndex((t) => t.id === id);
    if (index !== -1) {
      toasts.value.splice(index, 1);
    }
  };

  /**
   * Limpia todos los toasts
   */
  const clearAllToasts = () => {
    toasts.value = [];
  };

  // Métodos helper para tipos específicos
  const info = (message, options = {}) => {
    return showToast({ message, type: 'info', ...options });
  };

  const success = (message, options = {}) => {
    return showToast({ message, type: 'success', ...options });
  };

  const warning = (message, options = {}) => {
    return showToast({ message, type: 'warning', ...options });
  };

  const error = (message, options = {}) => {
    return showToast({ message, type: 'error', ...options });
  };

  const premium = (message, options = {}) => {
    return showToast({ message, type: 'premium', ...options });
  };

  return {
    toasts,
    showToast,
    removeToast,
    clearAllToasts,
    info,
    success,
    warning,
    error,
    premium,
  };
}
