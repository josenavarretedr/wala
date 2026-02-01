/* eslint-disable */

const { MercadoPagoConfig, Payment, Preference } = require('mercadopago');
const admin = require('firebase-admin');
const { FieldValue, Timestamp } = require('firebase-admin/firestore');

// Inicializar Firebase Admin si no está inicializado
if (!admin.apps.length) {
  admin.initializeApp();
}

// Inicializar Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
  options: { timeout: 5000 },
});

const paymentClient = new Payment(client);
const preferenceClient = new Preference(client);

/**
 * Configuración de planes Premium
 */
const PLANS = {
  test: {
    name: 'Premium Prueba',
    amount: 5.00,
    duration: 7, // días (1 semana)
    currency: 'PEN',
  },
  monthly: {
    name: 'Premium Mensual',
    amount: 27.00,
    duration: 30, // días
    currency: 'PEN',
  },
  annual: {
    name: 'Premium Anual',
    amount: 225.00,
    duration: 365,
    currency: 'PEN',
  },
  lifetime: {
    name: 'Premium de por Vida',
    amount: 400.00,
    duration: null, // sin vencimiento
    currency: 'PEN',
  },
};

/**
 * Crear preferencia de pago en Mercado Pago
 */
async function createPreference(businessId, planType, userEmail) {
  try {
    const plan = PLANS[planType];
    if (!plan) {
      throw new Error(`Plan inválido: ${planType}`);
    }

    const timestamp = Date.now();
    const externalReference = `business_${businessId}_${planType}_${timestamp}`;

    const preferenceData = {
      items: [
        {
          id: planType,
          title: `WALA ${plan.name}`,
          description: `Suscripción ${plan.name} para WALA`,
          quantity: 1,
          unit_price: plan.amount,
          currency_id: plan.currency,
        },
      ],
      payer: {
        email: userEmail,
      },
      external_reference: externalReference,
      statement_descriptor: 'WALA Premium',
      back_urls: {
        success: `${process.env.APP_URL || 'http://localhost:5173'}/business/${businessId}/premium?status=success`,
        failure: `${process.env.APP_URL || 'http://localhost:5173'}/business/${businessId}/premium?status=failure`,
        pending: `${process.env.APP_URL || 'http://localhost:5173'}/business/${businessId}/premium?status=pending`,
      },
      auto_return: 'approved',
      notification_url: `${process.env.FUNCTIONS_URL}/payments/webhook`, // FASE 2
    };

    const preference = await preferenceClient.create({ body: preferenceData });

    console.log('✅ Preferencia creada:', {
      id: preference.id,
      externalReference,
    });

    return {
      preferenceId: preference.id,
      externalReference,
      amount: plan.amount,
      planType,
    };
  } catch (error) {
    console.error('❌ Error creando preferencia:', error);
    throw error;
  }
}

/**
 * Procesar pago con Mercado Pago
 */
async function processPayment(formData, businessId, planType, uid) {
  try {
    const plan = PLANS[planType];
    if (!plan) {
      throw new Error(`Plan inválido: ${planType}`);
    }

    // Verificar que el usuario es owner del negocio
    const businessDoc = await admin.firestore()
      .collection('businesses')
      .doc(businessId)
      .get();

    if (!businessDoc.exists) {
      throw new Error('Negocio no encontrado');
    }

    const businessData = businessDoc.data();
    if (businessData.gerenteId !== uid) {
      throw new Error('No tienes permisos para este negocio');
    }

    // Validar que no tenga suscripción activa del mismo tipo
    const existingSubscription = businessData.subscription;
    if (existingSubscription &&
      existingSubscription.status === 'active' &&
      existingSubscription.planType === planType) {
      throw new Error(`Ya tienes una suscripción ${plan.name} activa`);
    }

    const timestamp = Date.now();
    const externalReference = `business_${businessId}_${planType}_${timestamp}`;

    // Crear el pago en Mercado Pago
    const paymentData = {
      transaction_amount: plan.amount,
      token: formData.token,
      description: `WALA ${plan.name}`,
      installments: formData.installments || 1,
      payment_method_id: formData.payment_method_id,
      issuer_id: formData.issuer_id,
      payer: {
        email: formData.payer.email,
        identification: {
          type: formData.payer.identification.type,
          number: formData.payer.identification.number,
        },
      },
      external_reference: externalReference,
      statement_descriptor: 'WALA Premium',
      metadata: {
        business_id: businessId,
        plan_type: planType,
        user_id: uid,
      },
    };

    const payment = await paymentClient.create({ body: paymentData });

    console.log('💳 Pago procesado:', {
      id: payment.id,
      status: payment.status,
      status_detail: payment.status_detail,
      externalReference,
    });

    // Si el pago fue aprobado, actualizar Firestore
    if (payment.status === 'approved') {
      await activateSubscription(businessId, planType, payment, externalReference);
    }

    return {
      success: payment.status === 'approved',
      paymentId: payment.id,
      status: payment.status,
      statusDetail: payment.status_detail,
      externalReference,
      planType,
      amount: plan.amount,
    };
  } catch (error) {
    console.error('❌ Error procesando pago:', error);
    throw error;
  }
}

/**
 * Activar suscripción en Firestore
 */
async function activateSubscription(businessId, planType, payment, externalReference) {
  try {
    const plan = PLANS[planType];
    const now = Timestamp.now();

    // Calcular fecha de expiración
    let endDate = null;
    if (plan.duration) {
      const endDateTime = new Date();
      endDateTime.setDate(endDateTime.getDate() + plan.duration);
      endDate = Timestamp.fromDate(endDateTime);
    }

    // Actualizar documento del negocio
    const subscriptionData = {
      plan: 'premium',
      planType: planType,
      status: 'active',
      amount: plan.amount,
      currency: plan.currency,
      paymentMethod: 'mercadopago',
      transactionId: payment.id.toString(),
      startDate: now,
      endDate: endDate,
      autoRenew: false,
      externalReference: externalReference,
      updatedAt: now,
    };

    await admin.firestore()
      .collection('businesses')
      .doc(businessId)
      .update({
        subscription: subscriptionData,
        updatedAt: now,
      });

    // Crear registro en subcolección de historial
    await admin.firestore()
      .collection('businesses')
      .doc(businessId)
      .collection('subscriptions')
      .add({
        planType: planType,
        amount: plan.amount,
        currency: plan.currency,
        status: 'approved',
        mpPaymentId: payment.id.toString(),
        mpStatus: payment.status,
        mpStatusDetail: payment.status_detail,
        externalReference: externalReference,
        paymentMethodId: payment.payment_method_id,
        createdAt: now,
        metadata: {
          cardLastFourDigits: payment.card?.last_four_digits || null,
          installments: payment.installments,
          payerEmail: payment.payer?.email || null,
        },
      });

    console.log('✅ Suscripción activada:', {
      businessId,
      planType,
      endDate: endDate?.toDate() || 'LIFETIME',
    });
  } catch (error) {
    console.error('❌ Error activando suscripción:', error);
    throw error;
  }
}

module.exports = {
  createPreference,
  processPayment,
  PLANS,
};
