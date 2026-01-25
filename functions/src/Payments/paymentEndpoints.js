/* eslint-disable */

const express = require('express');
const cors = require('cors');
const { validateAuth } = require('../middleware/validateAuth');
const { createPreference, processPayment } = require('./paymentService');

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

    if (!['monthly', 'yearly', 'lifetime'].includes(planType)) {
      return res.status(400).json({
        error: 'planType debe ser: monthly, yearly o lifetime',
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

module.exports = app;
