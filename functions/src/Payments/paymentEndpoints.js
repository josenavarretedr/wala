/* eslint-disable */

const express = require('express');
const cors = require('cors');
const { validateAuth } = require('../middleware/validateAuth');
const { createPreference, processPayment } = require('./paymentService');
const { processYapePayment } = require('./yapeService');
const { processWebhook } = require('./webhookHandler');

const app = express();

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

    if (!['test', 'monthly', 'yearly', 'lifetime'].includes(planType)) {
      return res.status(400).json({
        error: 'planType debe ser: test, monthly, yearly o lifetime',
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
    const { formData, businessId, planType } = req.body;
    const { uid } = req.user;

    if (!formData || !businessId || !planType) {
      return res.status(400).json({
        error: 'Se requiere formData, businessId y planType',
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
    res.status(500).json({
      error: error.message || 'Error procesando pago',
    });
  }
});

/**
 * POST /payments/process_yape_payment
 * Procesar pago con Yape
 */
app.post('/process_yape_payment', validateAuth, async (req, res) => {
  try {
    const { token, businessId, planType, phoneNumber } = req.body;
    const { uid, email } = req.user;

    if (!token || !businessId || !planType || !phoneNumber) {
      return res.status(400).json({
        error: 'Se requiere token, businessId, planType y phoneNumber'
      });
    }

    if (!['test', 'monthly', 'annual', 'lifetime'].includes(planType)) {
      return res.status(400).json({
        error: 'planType debe ser: test, monthly, annual o lifetime'
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
    }

    res.status(200).json({
      success: result.success,
      data: result,
      error: result.success ? null : result.message
    });

  } catch (error) {
    console.error('❌ Error en process_yape_payment:', error);
    res.status(500).json({
      error: error.message || 'Error procesando pago con Yape'
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
