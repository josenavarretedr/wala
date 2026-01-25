/* eslint-disable */


/**
 * WEBHOOK DE MERCADO PAGO - FASE 2
 *
 * Este archivo contiene la estructura para recibir notificaciones
 * de Mercado Pago cuando un pago cambia de estado.
 *
 * IMPORTANTE: Configurar en Mercado Pago Dashboard:
 * - URL: https://YOUR-PROJECT.cloudfunctions.net/payments/webhook
 * - Eventos: payment.created, payment.updated
 *
 * USO:
 * 1. Descomentar el endpoint en paymentEndpoints.js
 * 2. Configurar la URL en Mercado Pago Dashboard
 * 3. Validar firma de seguridad (x-signature)
 */

const admin = require('firebase-admin');
const { MercadoPagoConfig, Payment } = require('mercadopago');

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

const paymentClient = new Payment(client);

/**
 * Procesar notificación de webhook
 *
 * @param {Object} notification - Notificación de Mercado Pago
 * @return {Promise<void>}
 */
async function processWebhook(notification) {
  try {
    // Solo procesar notificaciones de pagos
    if (notification.type !== 'payment') {
      console.log('⏭️ Notificación ignorada (no es payment):', notification.type);
      return;
    }

    const paymentId = notification.data.id;
    console.log('🔔 Webhook recibido para payment:', paymentId);

    // Obtener detalles del pago
    const payment = await paymentClient.get({ id: paymentId });

    // Extraer metadata del pago
    const { business_id, plan_type } = payment.metadata || {};

    if (!business_id || !plan_type) {
      console.error('❌ Metadata incompleta en pago:', paymentId);
      return;
    }

    // Actualizar estado según el status del pago
    if (payment.status === 'approved') {
      // FASE 2: Activar suscripción si no está activa
      console.log('✅ Pago aprobado vía webhook:', {
        businessId: business_id,
        planType: plan_type,
        paymentId,
      });

      // TODO: Implementar lógica de activación
      // await activateSubscription(business_id, plan_type, payment);
    } else if (payment.status === 'rejected') {
      console.log('❌ Pago rechazado:', paymentId);
      // TODO: Notificar al usuario
    } else if (payment.status === 'pending') {
      console.log('⏳ Pago pendiente:', paymentId);
      // TODO: Actualizar estado a pending
    }
  } catch (error) {
    console.error('❌ Error procesando webhook:', error);
    throw error;
  }
}

module.exports = {
  processWebhook,
};

/*
===============================================
DESCOMENTAR EN paymentEndpoints.js (FASE 2):
===============================================

const { processWebhook } = require('./webhookHandler');

app.post('/webhook', async (req, res) => {
  try {
    // IMPORTANTE: Validar firma de seguridad
    // const signature = req.headers['x-signature'];
    // const requestId = req.headers['x-request-id'];

    await processWebhook(req.body);

    res.status(200).send('OK');
  } catch (error) {
    console.error('Error en webhook:', error);
    res.status(500).send('Error');
  }
});

===============================================
CONFIGURACIÓN EN MERCADO PAGO DASHBOARD:
===============================================

1. Ir a: https://www.mercadopago.com.pe/developers/panel/webhooks
2. Crear webhook:
   - URL: https://southamerica-east1-wala-app.cloudfunctions.net/payments/webhook
   - Eventos: payment.created, payment.updated
3. Copiar la firma secreta para validación

===============================================
VALIDACIÓN DE FIRMA (SEGURIDAD):
===============================================

Para validar que la notificación viene de Mercado Pago:

const crypto = require('crypto');

function validateWebhookSignature(req) {
  const xSignature = req.headers['x-signature'];
  const xRequestId = req.headers['x-request-id'];
  const dataID = req.body.data.id;

  // Extraer ts y hash del header x-signature
  const parts = xSignature.split(',');
  const ts = parts[0].split('=')[1];
  const hash = parts[1].split('=')[1];

  // Crear string para validar
  const manifest = `id:${dataID};request-id:${xRequestId};ts:${ts};`;

  // Obtener secret key desde Mercado Pago Dashboard
  const secret = process.env.MP_WEBHOOK_SECRET;

  // Generar hash
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(manifest);
  const sha = hmac.digest('hex');

  return sha === hash;
}
*/
