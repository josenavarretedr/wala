import { ref } from 'vue';
import { getAuth } from 'firebase/auth';

const MP_PUBLIC_KEY = 'TEST-d9db5058-7d42-47a5-a224-9a283c925466';
const FUNCTIONS_URL = import.meta.env.VITE_FUNCTIONS_URL || 'http://127.0.0.1:5001/wala-lat/southamerica-east1';

export function useMercadoPago() {
  const isLoading = ref(false);
  const error = ref(null);

  let mp = null;
  let bricksBuilder = null;
  let paymentBrickController = null;

  /**
   * Inicializar SDK de Mercado Pago
   */
  const initMercadoPago = () => {
    if (!window.MercadoPago) {
      console.error('SDK de Mercado Pago no cargado');
      return false;
    }

    mp = new window.MercadoPago(MP_PUBLIC_KEY);
    bricksBuilder = mp.bricks();
    return true;
  };

  /**
   * Crear preferencia de pago
   */
  const createPreference = async (businessId, planType) => {
    try {
      isLoading.value = true;
      error.value = null;

      const token = await authStore.currentUser.getIdToken();

      const response = await fetch(`${FUNCTIONS_URL}/payments/create_preference`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ businessId, planType })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error creando preferencia');
      }

      const result = await response.json();
      return result.data;

    } catch (err) {
      console.error('Error creando preferencia:', err);
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Renderizar Payment Brick
   */
  const renderPaymentBrick = async (containerId, amount, businessId, planType, onSuccess, onError) => {
    try {
      if (!mp || !bricksBuilder) {
        initMercadoPago();
      }

      // Destruir instancia anterior si existe
      if (paymentBrickController) {
        paymentBrickController.unmount();
      }

      const settings = {
        initialization: {
          amount: amount,
        },
        customization: {
          visual: {
            style: {
              theme: "default",
            },
          },
          paymentMethods: {
            creditCard: "all",
            bankTransfer: "all",
            onboarding_credits: "all",
            debitCard: "all",
            maxInstallments: 2
          },
        },
        callbacks: {
          onReady: () => {
            console.log('✅ Payment Brick listo');
          },
          onSubmit: async ({ selectedPaymentMethod, formData }) => {
            console.log('📤 onSubmit llamado:', { selectedPaymentMethod, formData });
            return new Promise(async (resolve, reject) => {
              try {
                isLoading.value = true;

                const auth = getAuth();
                const currentUser = auth.currentUser;
                if (!currentUser) {
                  throw new Error('Usuario no autenticado');
                }
                const token = await currentUser.getIdToken();

                const response = await fetch(`${FUNCTIONS_URL}/payments/process_payment`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({
                    formData,
                    businessId,
                    planType
                  })
                });

                if (!response.ok) {
                  const errorData = await response.json();
                  throw new Error(errorData.error || 'Error procesando pago');
                }

                const result = await response.json();

                if (result.success) {
                  console.log('🎉 Pago exitoso:', result.data);
                  onSuccess(result.data);
                  resolve();
                } else {
                  throw new Error(result.data.statusDetail || 'Pago rechazado');
                }

              } catch (err) {
                console.error('Error en onSubmit:', err);
                onError(err);
                reject(err);
              } finally {
                isLoading.value = false;
              }
            });
          },
          onError: (err) => {
            console.error('Error en Payment Brick:', err);
            error.value = err.message;
            onError(err);
          }
        }
      };

      paymentBrickController = await bricksBuilder.create(
        'payment',
        containerId,
        settings
      );

    } catch (err) {
      console.error('Error renderizando Payment Brick:', err);
      error.value = err.message;
      throw err;
    }
  };

  /**
   * Destruir instancia del Brick
   */
  const unmountBrick = () => {
    if (paymentBrickController) {
      paymentBrickController.unmount();
      paymentBrickController = null;
    }
  };

  return {
    isLoading,
    error,
    initMercadoPago,
    createPreference,
    renderPaymentBrick,
    unmountBrick
  };
}
