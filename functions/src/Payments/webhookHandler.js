/* eslint-disable */

/**
 * WEBHOOK DE MERCADO PAGO
 * 
 * Maneja notificaciones de Mercado Pago cuando un pago cambia de estado.
 * 
 * CONFIGURACIÓN EN MERCADO PAGO DASHBOARD:
 * - URL: https://southamerica-east1-wala-lat.cloudfunctions.net/payments/webhook
 * - Eventos: payment.created, payment.updated
 * - Copiar el secret a la variable de entorno MP_WEBHOOK_SECRET
 */

const admin = require('firebase-admin');
const { MercadoPagoConfig, Payment } = require('mercadopago');
const crypto = require('crypto');

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

const paymentClient = new Payment(client);

const PLANS = {
  test: {
    durationDays: 7,
    name: 'Premium Prueba'
  },
  monthly: {
    durationDays: 30,
    name: 'Premium Mensual'
  },
  annual: {
    durationDays: 365,
    name: 'Premium Anual'
  },
  lifetime: {
    durationDays: null,
    name: 'Premium Vitalicio'
  }
};

/**
 * Validar firma de webhook de Mercado Pago
 * @param {Object} req - Request de Express
 * @return {boolean}
 */
function validateWebhookSignature(req) {
  const xSignature = req.headers['x-signature'];
  const xRequestId = req.headers['x-request-id'];

  if (!xSignature || !xRequestId) {
    console.warn('⚠️ Headers de firma faltantes');
    return false;
  }

  const parts = xSignature.split(',');
  let ts, hash;

  parts.forEach(part => {
    const [key, value] = part.split('=');
    if (key && value) {
      const trimmedKey = key.trim();
      const trimmedValue = value.trim();
      if (trimmedKey === 'ts') {
        ts = trimmedValue;
      } else if (trimmedKey === 'v1') {
        hash = trimmedValue;
      }
    }
  });

  if (!ts || !hash) {
    console.warn('⚠️ Formato de firma inválido');
    return false;
  }

  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) {
    console.warn('⚠️ MP_WEBHOOK_SECRET no configurado');
    return true; // Permitir en desarrollo
  }

  const dataId = req.query['data.id'];
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(manifest);
  const sha = hmac.digest('hex');

  return sha === hash;
}

/**
 * Procesar notificación de webhook
 * @param {Object} req - Request de Express
 * @return {Promise<void>}
 */
async function processWebhook(req) {
  try {
    const type = req.query.type;
    const dataId = req.query['data.id'];

    console.log('📬 Webhook recibido:', { type, dataId });

    // Validar firma
    if (!validateWebhookSignature(req)) {
      console.error('❌ Firma de webhook inválida');
      return;
    }

    // Solo procesar notificaciones de pagos
    if (type !== 'payment') {
      console.log('⏭️ Notificación ignorada (no es payment):', type);
      return;
    }

    // Guardar evento
    await saveWebhookEvent(req);

    // Obtener detalles del pago
    const payment = await paymentClient.get({ id: dataId });

    // Extraer metadata del pago
    const { business_id, plan_type, user_id } = payment.metadata || {};

    if (!business_id || !plan_type) {
      console.error('❌ Metadata incompleta en pago:', dataId);
      return;
    }

    console.log('💳 Pago recibido:', {
      paymentId: dataId,
      status: payment.status,
      businessId: business_id,
      planType: plan_type,
      amount: payment.transaction_amount,
      paymentMethod: payment.payment_method_id
    });

    // Procesar según el estado
    if (payment.status === 'approved') {
      await handleApprovedPayment(business_id, plan_type, payment);
    } else if (payment.status === 'rejected') {
      await handleRejectedPayment(business_id, payment);
    } else if (payment.status === 'pending') {
      await handlePendingPayment(business_id, payment);
    }

  } catch (error) {
    console.error('❌ Error procesando webhook:', error);
  }
}

/**
 * Manejar pago aprobado
 */
async function handleApprovedPayment(businessId, planType, payment) {
  try {
    console.log('✅ Procesando pago aprobado:', {
      businessId,
      planType,
      paymentId: payment.id,
      amount: payment.transaction_amount
    });

    const planConfig = PLANS[planType];
    if (!planConfig) {
      throw new Error(`Plan type inválido: ${planType}`);
    }

    const db = admin.firestore();
    const businessRef = db.collection('businesses').doc(businessId);

    // Calcular fechas
    const startDate = admin.firestore.Timestamp.now();
    let expiryDate = null;

    if (planConfig.durationDays) {
      const expiryMs = Date.now() + (planConfig.durationDays * 24 * 60 * 60 * 1000);
      expiryDate = admin.firestore.Timestamp.fromMillis(expiryMs);
    }

    // Crear documento de suscripción
    const subscription = {
      planType,
      planName: planConfig.name,
      startDate,
      expiryDate,
      status: 'active',
      paymentId: payment.id.toString(),
      paymentMethod: payment.payment_method_id,
      amount: payment.transaction_amount,
      currency: payment.currency_id,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Guardar suscripción
    await businessRef.collection('subscriptions').doc(payment.id.toString()).set(subscription);

    // Actualizar business
    await businessRef.update({
      premium: true,
      premiumPlan: planType,
      premiumStartDate: startDate,
      premiumExpiryDate: expiryDate,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('🎉 Suscripción activada vía webhook:', {
      businessId,
      planType,
      expiryDate: expiryDate ? expiryDate.toDate() : 'lifetime'
    });

  } catch (error) {
    console.error('❌ Error activando suscripción:', error);
    throw error;
  }
}

/**
 * Manejar pago rechazado
 */
async function handleRejectedPayment(businessId, payment) {
  console.log('❌ Pago rechazado:', {
    businessId,
    paymentId: payment.id,
    statusDetail: payment.status_detail
  });

  // TODO: Enviar notificación al usuario
}

/**
 * Manejar pago pendiente
 */
async function handlePendingPayment(businessId, payment) {
  console.log('⏳ Pago pendiente:', {
    businessId,
    paymentId: payment.id,
    statusDetail: payment.status_detail
  });

  // TODO: Actualizar estado a pending en business
}

/**
 * Guardar evento de webhook
 */
async function saveWebhookEvent(req) {
  try {
    const db = admin.firestore();
    const dataId = req.query['data.id'];

    await db.collection('webhookEvents').add({
      type: req.query.type,
      dataId,
      query: req.query,
      headers: {
        'x-signature': req.headers['x-signature'],
        'x-request-id': req.headers['x-request-id']
      },
      body: req.body,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('📝 Evento de webhook guardado:', dataId);
  } catch (error) {
    console.error('❌ Error guardando evento webhook:', error);
  }
}

module.exports = {
  processWebhook,
  validateWebhookSignature
};
