/* eslint-disable */

const { MercadoPagoConfig, Payment } = require('mercadopago');
const admin = require('firebase-admin');
const { Timestamp } = require('firebase-admin/firestore');

// Inicializar Mercado Pago
const accessToken = process.env.MP_ACCESS_TOKEN;
const client = new MercadoPagoConfig({
  accessToken: accessToken,
  options: { timeout: 5000 }
});
const paymentClient = new Payment(client);

const YAPE_CAPABILITY_TTL_MS = 5 * 60 * 1000;
let yapeCapabilityCache = {
  checkedAt: 0,
  enabled: null,
  sampleMethods: [],
};

// Configuración de planes
const PLANS = {
  pro_monthly: {
    plan: 'pro',
    name: 'Pro Mensual',
    amount: 50,
    durationDays: 30
  },
  pro_yearly: {
    plan: 'pro',
    name: 'Pro Anual',
    amount: 500,
    durationDays: 365
  },
  max: {
    plan: 'max',
    name: 'Max',
    amount: 360,
    durationDays: null
  }
};

/**
 * Validar datos de Yape
 */
function validateYapeData(token, businessId, planType, phoneNumber) {
  if (!token || typeof token !== 'string') {
    throw new Error('Token de Yape inválido');
  }

  if (!businessId || typeof businessId !== 'string') {
    throw new Error('ID de negocio inválido');
  }

  if (!PLANS[planType]) {
    throw new Error('Tipo de plan inválido');
  }

  if (!phoneNumber || !/^\d{9}$/.test(phoneNumber)) {
    throw new Error('Número de celular inválido (debe tener 9 dígitos)');
  }

  return true;
}

function normalizeMercadoPagoError(error) {
  const cause = Array.isArray(error?.cause) ? error.cause : [];
  const firstCause = cause[0] || {};
  const status = error?.httpStatus || error?.status || firstCause?.status;
  const code = firstCause?.code || error?.code || 'unknown_error';
  const description = firstCause?.description || error?.message || 'Error al procesar pago con Yape';

  const normalizedError = new Error(description);
  normalizedError.code = code;
  normalizedError.httpStatus = Number.isInteger(status) ? status : 500;
  normalizedError.details = {
    code,
    status,
    description,
    cause,
  };

  return normalizedError;
}

async function validateYapeCapability(accessTokenValue) {
  const now = Date.now();
  if (yapeCapabilityCache.enabled !== null && (now - yapeCapabilityCache.checkedAt) < YAPE_CAPABILITY_TTL_MS) {
    return yapeCapabilityCache;
  }

  const response = await fetch('https://api.mercadopago.com/v1/payment_methods/search?site_id=MPE', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessTokenValue}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = new Error('No se pudo validar disponibilidad de Yape para la credencial de Mercado Pago.');
    error.httpStatus = 502;
    throw error;
  }

  const payload = await response.json();
  const methods = Array.isArray(payload?.results) ? payload.results : [];
  const yapeMethod = methods.find((method) => method?.id === 'yape');
  const enabled = Boolean(yapeMethod && yapeMethod.status === 'active');

  yapeCapabilityCache = {
    checkedAt: now,
    enabled,
    sampleMethods: methods.slice(0, 10).map((method) => method?.id).filter(Boolean),
  };

  if (!enabled) {
    const capabilityError = new Error('La credencial MP_ACCESS_TOKEN no tiene Yape habilitado para cobros en MPE. Activa Yape en tu aplicación de Mercado Pago o usa una credencial con Yape habilitado.');
    capabilityError.httpStatus = 400;
    capabilityError.code = 'yape_not_enabled_for_collector';
    capabilityError.details = {
      availableMethodsSample: yapeCapabilityCache.sampleMethods,
    };
    throw capabilityError;
  }

  return yapeCapabilityCache;
}

/**
 * Crear pago con Yape en Mercado Pago
 */
async function createYapePayment(token, businessId, planType, phoneNumber, userEmail, userId) {
  try {
    if (!accessToken) {
      const configError = new Error('Mercado Pago no está configurado: falta MP_ACCESS_TOKEN');
      configError.httpStatus = 500;
      throw configError;
    }

    if (!userEmail || typeof userEmail !== 'string') {
      const validationError = new Error('No se pudo obtener el email del pagador. Inicia sesión con una cuenta que tenga email válido.');
      validationError.httpStatus = 400;
      throw validationError;
    }

    const plan = PLANS[planType];
    const externalReference = `business_${businessId}_yape_${planType}_${Date.now()}`;

    console.log('💳 Creando pago Yape:', {
      businessId,
      planType,
      amount: plan.amount,
      phoneNumber: phoneNumber.substring(0, 3) + 'XXX' + phoneNumber.substring(6)
    });

    const paymentData = {
      token: token,
      transaction_amount: plan.amount,
      description: `WALA ${plan.name}`,
      installments: 1,
      payment_method_id: 'yape',
      payer: {
        email: userEmail
      },
      external_reference: externalReference,
      metadata: {
        business_id: businessId,
        plan_type: planType,
        plan_name: plan.name,
        user_id: userId,
        phone_number: phoneNumber,
        payment_type: 'yape'
      }
    };

    const payment = await paymentClient.create({ body: paymentData });

    console.log('💳 Respuesta de Mercado Pago:', {
      id: payment.id,
      status: payment.status,
      status_detail: payment.status_detail
    });

    return payment;

  } catch (error) {
    console.error('❌ Error creando pago Yape en Mercado Pago:', error);
    throw normalizeMercadoPagoError(error);
  }
}

/**
 * Activar suscripción después de pago exitoso
 */
async function activateYapeSubscription(businessId, planType, payment, externalReference) {
  try {
    const plan = PLANS[planType];
    const db = admin.firestore();
    const now = Timestamp.now();

    // Calcular fecha de expiración
    let endDate = null;
    if (plan.durationDays) {
      const endDateTime = new Date();
      endDateTime.setDate(endDateTime.getDate() + plan.durationDays);
      endDate = Timestamp.fromDate(endDateTime);
    }

    // Crear datos de suscripción con la misma estructura que paymentService.js
    const subscriptionData = {
      plan: plan.plan,
      planType: planType,
      planVariant: planType,
      status: 'active',
      amount: plan.amount,
      currency: 'PEN',
      paymentMethod: 'yape',
      paymentId: payment.id.toString(),
      transactionId: payment.id.toString(),
      startDate: now,
      endDate: endDate,
      autoRenew: false,
      externalReference: externalReference,
      updatedAt: now,
    };

    // Actualizar documento del negocio
    await db.collection('businesses')
      .doc(businessId)
      .update({
        subscription: subscriptionData,
        updatedAt: now,
      });

    // Crear registro en subcolección de historial
    await db.collection('businesses')
      .doc(businessId)
      .collection('subscriptions')
      .doc(payment.id.toString())
      .set({
        paymentId: payment.id.toString(),
        plan: plan.plan,
        planType: planType,
        planVariant: planType,
        amount: plan.amount,
        currency: 'PEN',
        status: payment.status,
        method: 'yape',
        mpPaymentId: payment.id.toString(),
        mpStatus: payment.status,
        mpStatusDetail: payment.status_detail,
        externalReference: externalReference,
        paymentMethodId: 'yape',
        createdAt: now,
        metadata: {
          phoneNumber: payment.metadata?.phone_number || null,
          payerEmail: payment.payer?.email || null,
        },
      });

    console.log('✅ Suscripción activada:', {
      businessId,
      planType,
      endDate: endDate ? endDate.toDate() : 'LIFETIME',
    });

    return subscriptionData;

  } catch (error) {
    console.error('❌ Error activando suscripción:', error);
    throw error;
  }
}

/**
 * Procesar pago con Yape (función principal)
 */
async function processYapePayment(token, businessId, planType, phoneNumber, userEmail, userId) {
  try {
    // 1. Validar datos
    validateYapeData(token, businessId, planType, phoneNumber);

    // 2. Crear pago en Mercado Pago
    const payment = await createYapePayment(
      token,
      businessId,
      planType,
      phoneNumber,
      userEmail,
      userId
    );

    // 3. Verificar estado del pago
    if (payment.status === 'approved') {
      // 4. Activar suscripción
      await activateYapeSubscription(
        businessId,
        planType,
        payment,
        payment.external_reference
      );

      console.log('🎉 PAGO YAPE PROCESADO CORRECTAMENTE:', {
        paymentId: payment.id,
        businessId,
        planType,
        amount: payment.transaction_amount
      });

      return {
        success: true,
        paymentId: payment.id,
        status: payment.status,
        statusDetail: payment.status_detail,
        externalReference: payment.external_reference,
        planVariant: planType,
        planType: planType,
        method: 'yape',
        amount: payment.transaction_amount
      };

    } else {
      // Pago rechazado o pendiente
      console.log('⚠️ Pago Yape no aprobado:', {
        status: payment.status,
        statusDetail: payment.status_detail
      });

      return {
        success: false,
        paymentId: payment.id,
        status: payment.status,
        statusDetail: payment.status_detail,
        message: getStatusMessage(payment.status, payment.status_detail)
      };
    }

  } catch (error) {
    console.error('❌ Error procesando pago Yape:', error);
    throw error;
  }
}

/**
 * Obtener mensaje de error según status
 */
function getStatusMessage(status, statusDetail) {
  const messages = {
    'rejected': {
      'cc_rejected_insufficient_amount': 'Saldo insuficiente en tu cuenta Yape',
      'cc_rejected_bad_filled_security_code': 'Código OTP inválido',
      'cc_rejected_call_for_authorize': 'Debes autorizar el pago en tu app Yape',
      'cc_rejected_card_type_not_allowed': 'Método de pago no permitido',
      'cc_rejected_max_attempts': 'Excediste el número máximo de intentos',
      'cc_rejected_other_reason': 'Pago rechazado. Intenta nuevamente.',
      'cc_rejected_form_error': 'Revisa los datos ingresados'
    },
    'pending': {
      'pending_waiting_payment': 'Esperando confirmación del pago'
    }
  };

  return messages[status]?.[statusDetail] || 'Error al procesar el pago';
}

module.exports = {
  processYapePayment,
  validateYapeData,
  createYapePayment,
  activateYapeSubscription,
  PLANS
};
