/* eslint-disable */

const admin = require('firebase-admin');

// Inicializar Firebase Admin si no está inicializado
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Middleware para validar el token de Firebase Auth
 */
async function validateAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'No se proporcionó token de autenticación'
      });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email
    };

    next();
  } catch (error) {
    console.error('Error validando autenticación:', error);
    return res.status(401).json({
      error: 'Token inválido o expirado'
    });
  }
}

module.exports = { validateAuth };
