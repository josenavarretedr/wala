/* eslint-disable */

const express = require('express');
const cors = require('cors');
const { validateAuth } = require('../middleware/validateAuth');
const { createPreference, processPayment } = require('./paymentService');
const { processYapePayment } = require('./yapeService');
const { processWebhook } = require('./webhookHandler');

const VALID_PLAN_TYPES = ['pro_monthly', 'pro_yearly', 'max'];

const app = express();

function getMercadoPagoModeFromCredential(value) {
  if (typeof value !== 'string') return 'UNKNOWN';
  if (value.startsWith('TEST-')) return 'TEST';
  if (value.startsWith('APP_USR-')) return 'PROD';
  return 'UNKNOWN';
}

// Configurar CORS
app.use(cors({ origin: true }));
app.use(express.json());

/**
 * POST /payments/create_preference
 * Crear preferencia de pago en Mercado Pago
 */
app.post('/create_preference', validateAuth, async (req, res) => {
  try {
    const { businessId, planType } = req.body;
    const { uid, email } = req.user;

    if (!businessId || !planType) {
      return res.status(400).json({
        error: 'Se requiere businessId y planType',
      });
    }

    if (!VALID_PLAN_TYPES.includes(planType)) {
      return res.status(400).json({
        error: 'planType debe ser: pro_monthly, pro_yearly o max',
      });
    }

    const result = await createPreference(businessId, planType, email);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error en create_preference:', error);
    res.status(500).json({
      error: error.message || 'Error creando preferencia',
    });
  }
});

/**
 * POST /payments/process_payment
 * Procesar pago desde Payment Brick
 */
app.post('/process_payment', validateAuth, async (req, res) => {
  try {
    const { formData, businessId, planType, selectedPaymentMethod, mpPublicKeyMode } = req.body;
    const { uid } = req.user;

    if (!formData || !businessId || !planType) {
      return res.status(400).json({
        error: 'Se requiere formData, businessId y planType',
      });
    }

    const accessTokenMode = getMercadoPagoModeFromCredential(process.env.MP_ACCESS_TOKEN);
    const isEmulator = process.env.FUNCTIONS_EMULATOR === 'true' || Boolean(process.env.FIREBASE_EMULATOR_HUB);

    if (isEmulator && accessTokenMode === 'PROD') {
      return res.status(400).json({
        error: 'Emulador detectado con credenciales PROD. Para pruebas usa MP_ACCESS_TOKEN TEST y MP_PUBLIC_KEY TEST.',
      });
    }

    if (mpPublicKeyMode && mpPublicKeyMode !== 'UNKNOWN' && accessTokenMode !== 'UNKNOWN' && mpPublicKeyMode !== accessTokenMode) {
      return res.status(400).json({
        error: `Credenciales de Mercado Pago mezcladas (${mpPublicKeyMode} vs ${accessTokenMode}). Usa Public Key y Access Token del mismo entorno.`,
      });
    }

    if (!formData?.token || !formData?.payment_method_id) {
      return res.status(400).json({
        error: 'Faltan datos de pago del Brick (token o payment_method_id).',
        data: {
          selectedPaymentMethod: selectedPaymentMethod || null,
          hasToken: Boolean(formData?.token),
          paymentMethodId: formData?.payment_method_id || null,
        },
      });
    }

    const result = await processPayment(formData, businessId, planType, uid);

    // LOG PARA DEBUGGING
    console.log('🎉 PAGO PROCESADO CORRECTAMENTE:', {
      businessId,
      planType,
      paymentId: result.paymentId,
      status: result.status,
      amount: result.amount,
    });

    res.status(200).json({
      success: result.success,
      data: result,
    });
  } catch (error) {
    console.error('Error en process_payment:', error);
    const status = Number.isInteger(error?.httpStatus) ? error.httpStatus : 500;
    const safeStatus = status >= 400 && status < 600 ? status : 500;

    res.status(safeStatus).json({
      error: error.message || 'Error procesando pago',
      data: error?.details || null,
    });
  }
});

/**
 * POST /payments/process_yape_payment
 * Procesar pago con Yape
 */
app.post('/process_yape_payment', validateAuth, async (req, res) => {
  try {
    const { token, businessId, planType, phoneNumber, mpPublicKeyMode } = req.body;
    const { uid, email } = req.user;

    if (!token || !businessId || !planType || !phoneNumber) {
      return res.status(400).json({
        error: 'Se requiere token, businessId, planType y phoneNumber'
      });
    }

    if (!VALID_PLAN_TYPES.includes(planType)) {
      return res.status(400).json({
        error: 'planType debe ser: pro_monthly, pro_yearly o max'
      });
    }

    const accessTokenMode = getMercadoPagoModeFromCredential(process.env.MP_ACCESS_TOKEN);
    const isEmulator = process.env.FUNCTIONS_EMULATOR === 'true' || Boolean(process.env.FIREBASE_EMULATOR_HUB);

    // En emulador, para flujos de prueba de Yape se deben usar credenciales TEST.
    if (isEmulator && accessTokenMode === 'PROD') {
      return res.status(400).json({
        error: 'Emulador detectado con credenciales PROD. Para pruebas Yape usa MP_ACCESS_TOKEN TEST y MP_PUBLIC_KEY TEST.',
      });
    }

    if (mpPublicKeyMode && mpPublicKeyMode !== 'UNKNOWN' && accessTokenMode !== 'UNKNOWN' && mpPublicKeyMode !== accessTokenMode) {
      return res.status(400).json({
        error: `Credenciales de Mercado Pago mezcladas (${mpPublicKeyMode} vs ${accessTokenMode}). Usa Public Key y Access Token del mismo entorno.`
      });
    }

    console.log('📱 Procesando pago Yape:', {
      businessId,
      planType,
      phoneNumber: phoneNumber.substring(0, 3) + 'XXX' + phoneNumber.substring(6),
      userId: uid
    });

    const result = await processYapePayment(
      token,
      businessId,
      planType,
      phoneNumber,
      email,
      uid
    );

    if (result.success) {
      console.log('🎉 PAGO YAPE PROCESADO CORRECTAMENTE:', {
        businessId,
        planType,
        paymentId: result.paymentId,
        status: result.status,
        amount: result.amount
      });

      return res.status(200).json({
        success: true,
        data: result
      });
    }

    // Pago rechazado por Mercado Pago (token válido pero pago no aprobado)
    console.log('⚠️ Pago Yape rechazado por MP:', {
      businessId,
      planType,
      status: result.status,
      statusDetail: result.statusDetail
    });

    return res.status(422).json({
      success: false,
      message: result.message,
      data: {
        status: result.status,
        statusDetail: result.statusDetail,
        paymentId: result.paymentId
      }
    });

  } catch (error) {
    console.error('❌ Error en process_yape_payment:', error);
    const isMercadoPagoInternalError = error?.message === 'internal_error' || error?.details?.description === 'internal_error';

    if (isMercadoPagoInternalError) {
      return res.status(502).json({
        error: 'Mercado Pago devolvió internal_error. Verifica credenciales TEST/PROD, habilitación de Yape y datos de prueba válidos.',
        message: 'Mercado Pago devolvió internal_error. Verifica credenciales TEST/PROD, habilitación de Yape y datos de prueba válidos.',
        data: error?.details || null,
      });
    }

    const status = Number.isInteger(error?.httpStatus) ? error.httpStatus : 500;
    const safeStatus = status >= 400 && status < 600 ? status : 500;

    res.status(safeStatus).json({
      error: error.message || 'Error procesando pago con Yape',
      message: error.message || 'Error procesando pago con Yape',
      data: error?.details || null
    });
  }
});

/**
 * GET /payments/health
 * Health check
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'WALA Payments',
    timestamp: new Date().toISOString(),
  });
});

/**
 * POST /payments/webhook
 * Webhook de Mercado Pago para notificaciones de pagos
 */
app.post('/webhook', async (req, res) => {
  try {
    console.log('📬 Webhook recibido:', {
      type: req.query.type,
      data_id: req.query['data.id'],
      headers: req.headers
    });

    // Responder inmediatamente con 200 (requisito de MP)
    res.status(200).send('OK');

    // Procesar webhook de forma asíncrona
    await processWebhook(req);

  } catch (error) {
    console.error('❌ Error procesando webhook:', error);
    // Ya respondimos con 200, solo logueamos el error
  }
});

module.exports = app;
