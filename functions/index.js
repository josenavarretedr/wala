/* eslint-disable */

/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");


exports.scheduledAutoClose = require('./src/AccountsBalance/scheduledAutoClose');
exports.onTransactionWrite = require('./src/AccountsBalance/onTransactionWrite');
exports.lazyCloseIfNeeded = require('./src/AccountsBalance/lazyCloseIfNeeded');

// 🤖 CLASIFICACIÓN IA - Sistema de 3 Capas
exports.classifyProductRequest = require('./src/Inventory/classifyProductRequest').classifyProductRequest;
exports.onProductCorrected = require('./src/Inventory/onProductCorrected').onProductCorrected;
exports.classifyExpenseOnCreate = require('./src/Expense/classifyExpenseOnCreate').classifyExpenseOnCreate;

// 🏢 BUSINESS - Detección automática de industria
exports.onBusinessCreated = require('./src/Business/onBusinessCreated').onBusinessCreated;

// 📚 TAXONOMY - Generación de taxonomías base
exports.generateInitialTaxonomies = require('./src/Taxonomy/generateInitialTaxonomies').generateInitialTaxonomies;

// ⚙️ SETUP - Inicialización de taxonomías (ejecutar una sola vez)
exports.initializeTaxonomies = require('./src/Setup/initializeTaxonomies').initializeTaxonomies;

// INVENTORY AI CLASSIFICATION (Legacy - comentado)
// exports.onProductCreatedClassify = require('./src/Inventory/onProductCreatedClassify');
// exports.classifyProduct = require('./src/Inventory/classifyProductCallable');

// ✨ PROGRAMAS (MÓDULO JUNTOS)
exports.joinProgramByCode = require('./src/Programs/joinProgramByCode').joinProgramByCode;

// � STORAGE - Procesamiento de archivos subidos
exports.processFileUpload = require('./src/Storage/processFileUpload').processFileUpload;

// �🖼️ SHARE - Renderizado de imágenes server-side (Gen2)
exports.renderToImageV2 = require('./src/Share/renderToImage').renderToImage;

// 💳 PAYMENTS - Mercado Pago Integration
const paymentApp = require("./src/Payments/paymentEndpoints");
exports.payments = onRequest(
  {
    cors: true,
    region: "southamerica-east1",
    timeoutSeconds: 60,
    memory: "256MiB",
  },
  paymentApp
);

// FUNCIÓN DE PRUEBA (remover en producción)
// exports.testScheduledAutoClose = require('./src/AccountsBalance/testScheduledAutoClose');




