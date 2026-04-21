import { ref } from 'vue';
import { getAuth } from 'firebase/auth';

// Usar credenciales de producción o TEST según el entorno
const MP_PUBLIC_KEY = import.meta.env.VITE_MP_PUBLIC_KEY || 'TEST-d9db5058-7d42-47a5-a224-9a283c925466';
const FUNCTIONS_URL = import.meta.env.VITE_FUNCTIONS_URL || 'http://127.0.0.1:5001/wala-lat/southamerica-east1';

function getPublicKeyMode(publicKey) {
  if (typeof publicKey !== 'string') return 'UNKNOWN';
  if (publicKey.startsWith('TEST-')) return 'TEST';
  if (publicKey.startsWith('APP_USR-')) return 'PROD';
  return 'UNKNOWN';
}

// Log para verificar entorno (solo en desarrollo)
if (import.meta.env.DEV) {
  console.log('🔑 Modo:', import.meta.env.MODE);
  console.log('🔑 MP Public Key:', MP_PUBLIC_KEY.substring(0, 25) + '...');
  console.log('🌐 Functions URL:', FUNCTIONS_URL);
}

export function useMercadoPago() {
  const isLoading = ref(false);
  const error = ref(null);

  let mp = null;
  let bricksBuilder = null;
  let paymentBrickController = null;
  let isRenderingBrick = false;

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
      if (isRenderingBrick) {
        return;
      }

      isRenderingBrick = true;

      if (!mp || !bricksBuilder) {
        initMercadoPago();
      }

      // Destruir instancia anterior si existe
      if (paymentBrickController) {
        await Promise.resolve(paymentBrickController.unmount());
        paymentBrickController = null;
        await wait(50);
      }

      const containerElement = document.getElementById(containerId);
      if (!containerElement) {
        throw new Error(`No se encontró el contenedor del Payment Brick: ${containerId}`);
      }

      containerElement.innerHTML = '';

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
            debitCard: "all",
            yape: 'all',
            maxInstallments: 1
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
                    planType,
                    selectedPaymentMethod,
                    mpPublicKeyMode: getPublicKeyMode(MP_PUBLIC_KEY)
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
    } finally {
      isRenderingBrick = false;
    }
  };

  /**
   * Destruir instancia del Brick
   */
  const unmountBrick = async () => {
    if (paymentBrickController) {
      await Promise.resolve(paymentBrickController.unmount());
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
