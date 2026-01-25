import { ref } from 'vue';
import { getAuth } from 'firebase/auth';

const MP_PUBLIC_KEY = import.meta.env.VITE_MP_PUBLIC_KEY || 'TEST-d9db5058-7d42-47a5-a224-9a283c925466';
const FUNCTIONS_URL = import.meta.env.VITE_FUNCTIONS_URL || 'http://127.0.0.1:5001/wala-lat/southamerica-east1';

export function useYape() {
  const isLoading = ref(false);
  const error = ref(null);
  let mp = null;

  /**
   * Inicializar SDK de Mercado Pago
   */
  const initMercadoPago = () => {
    if (!window.MercadoPago) {
      console.error('SDK de Mercado Pago no cargado');
      return false;
    }
    mp = new window.MercadoPago(MP_PUBLIC_KEY);
    return true;
  };

  /**
   * Generar token de Yape
   * @param {string} phoneNumber - Número de celular (ej: "987654321")
   * @param {string} otp - Código OTP de 6 dígitos de la app Yape
   * @returns {Promise<string>} Token generado
   */
  const generateYapeToken = async (phoneNumber, otp) => {
    try {
      if (!mp) {
        initMercadoPago();
      }

      console.log('🔐 Generando token Yape...');

      const yapeOptions = {
        phoneNumber: phoneNumber.trim(),
        otp: otp.trim()
      };

      const yape = mp.yape(yapeOptions);
      const yapeTokenResponse = await yape.create();

      console.log('✅ Token Yape generado:', yapeTokenResponse.id.substring(0, 20) + '...');

      return yapeTokenResponse.id;

    } catch (err) {
      console.error('❌ Error generando token Yape:', err);
      throw new Error(err.message || 'Error al generar token de Yape');
    }
  };

  /**
   * Procesar pago con Yape
   * @param {Object} paymentData - Datos del pago
   * @param {string} paymentData.token - Token de Yape
   * @param {string} paymentData.businessId - ID del negocio
   * @param {string} paymentData.planType - Tipo de plan (monthly/annual/lifetime)
   * @param {string} paymentData.phoneNumber - Número de celular
   * @returns {Promise<Object>} Resultado del pago
   */
  const processYapePayment = async ({ token, businessId, planType, phoneNumber }) => {
    try {
      isLoading.value = true;
      error.value = null;

      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error('Usuario no autenticado');
      }

      const userToken = await currentUser.getIdToken();

      console.log('💳 Procesando pago Yape...', { businessId, planType });

      const response = await fetch(`${FUNCTIONS_URL}/payments/process_yape_payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          token,
          businessId,
          planType,
          phoneNumber
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error procesando pago con Yape');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Pago rechazado');
      }

      console.log('✅ Pago Yape exitoso:', result.data);
      return result.data;

    } catch (err) {
      console.error('❌ Error en pago Yape:', err);
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    error,
    generateYapeToken,
    processYapePayment,
    initMercadoPago
  };
}
