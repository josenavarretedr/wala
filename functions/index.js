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

// INVENTORY AI CLASSIFICATION
// exports.onProductCreatedClassify = require('./src/Inventory/onProductCreatedClassify');
// exports.classifyProduct = require('./src/Inventory/classifyProductCallable');

// ✨ PROGRAMAS (MÓDULO JUNTOS)
exports.joinProgramByCode = require('./src/Programs/joinProgramByCode').joinProgramByCode;

// FUNCIÓN DE PRUEBA (remover en producción)
// exports.testScheduledAutoClose = require('./src/AccountsBalance/testScheduledAutoClose');




