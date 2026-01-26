/* eslint-disable */

/**
 * renderToImage.js - Cloud Function para renderizar HTML como imagen usando Puppeteer
 * Renderiza con Chrome headless real para máxima fidelidad visual
 */

const { onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const { sanitizeHTML, validateDimensions, validateHTMLSize } = require('./htmlSanitizer');

// Detectar si estamos en local (emuladores) o producción (Cloud)
const isLocalEmulator = process.env.FUNCTIONS_EMULATOR === 'true';

let chromium, puppeteer;

if (isLocalEmulator) {
  // Local: usar puppeteer completo con Chromium incluido
  puppeteer = require('puppeteer');
  console.log('🔧 [renderToImage] Modo LOCAL - usando puppeteer completo');
} else {
  // Producción: usar @sparticuz/chromium optimizado
  chromium = require('@sparticuz/chromium');
  puppeteer = require('puppeteer-core');
  console.log('☁️ [renderToImage] Modo CLOUD - usando @sparticuz/chromium');
}

/**
 * Cloud Function para renderizar HTML como imagen PNG
 * 
 * Request Body:
 * {
 *   html: string,           // HTML completo del elemento
 *   width: number,          // Ancho del viewport
 *   height: number,         // Alto del viewport
 *   deviceScaleFactor: 2,   // Escala para retina (siempre 2)
 *   userId: string          // Firebase Auth UID
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   imageDataUrl: string,   // data:image/png;base64,...
 *   fileSize: number,       // Bytes
 *   renderTime: number      // Milisegundos
 * }
 */
async function renderToImageHandler(req, res) {
  const startTime = Date.now();

  // Solo POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  // Validar autenticación manual
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('❌ [renderToImage] No authorization header');
    return res.status(401).json({
      success: false,
      error: 'Unauthorized'
    });
  }

  const idToken = authHeader.split('Bearer ')[1];
  let decodedToken;

  try {
    decodedToken = await admin.auth().verifyIdToken(idToken);
  } catch (error) {
    console.error('❌ [renderToImage] Invalid token:', error.message);
    return res.status(401).json({
      success: false,
      error: 'Unauthorized'
    });
  }

  const userId = decodedToken.uid;

  const {
    html,
    width = 400,
    height = 800,
    deviceScaleFactor = 2
  } = req.body;

  // Validar entrada
  if (!html) {
    return res.status(400).json({
      success: false,
      error: 'HTML es requerido'
    });
  }

  console.log('🚀 [renderToImage] Start', {
    userId,
    width,
    height,
    htmlSize: html.length
  });

  // Validar tamaño del HTML
  if (!validateHTMLSize(html)) {
    return res.status(413).json({
      success: false,
      error: 'HTML demasiado grande (máx 500KB)'
    });
  }

  // Validar dimensiones
  if (!validateDimensions(width, height)) {
    return res.status(400).json({
      success: false,
      error: 'Dimensiones inválidas (100-1200 x 100-2500)'
    });
  }

  // Sanitizar HTML
  const cleanHTML = sanitizeHTML(html);
  if (!cleanHTML) {
    return res.status(400).json({
      success: false,
      error: 'HTML inválido o peligroso'
    });
  }

  let browser = null;

  try {
    // Lanzar navegador según el entorno
    console.log('🌐 [renderToImage] Launching Puppeteer...');

    const launchOptions = isLocalEmulator
      ? {
        // Local: configuración simple
        headless: 'new',
        args: ['--no-sandbox', '--disable-web-security']
      }
      : {
        // Producción: @sparticuz/chromium optimizado
        args: [...chromium.args, '--no-sandbox', '--disable-web-security'],
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless
      };

    browser = await puppeteer.launch(launchOptions);

    const page = await browser.newPage();

    // Configurar viewport
    await page.setViewport({
      width: Math.ceil(width),
      height: Math.ceil(height),
      deviceScaleFactor: deviceScaleFactor
    });

    // Construir HTML completo - SIN Tailwind CDN (viene con estilos inline)
    const fullHTML = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          
          <!-- Tailwind CSS CDN -->
          <script src="https://cdn.tailwindcss.com"></script>
          
          <!-- Google Fonts - Inter -->
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
          
          <!-- CSS Reset y base -->
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            html {
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }
            
            body {
              font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              background: #ffffff;
            }
          </style>
        </head>
        <body>
          ${cleanHTML}
        </body>
        </html>
      `;

    // Cargar HTML
    console.log('📄 [renderToImage] Loading HTML...');
    await page.setContent(fullHTML, {
      waitUntil: ['networkidle0', 'load'],
      timeout: 30000
    });

    // Esperar a que Tailwind CSS se cargue
    console.log('🎨 [renderToImage] Waiting for Tailwind CSS...');

    try {
      await page.waitForFunction(() => {
        return typeof window.tailwind !== 'undefined' ||
          document.querySelector('[class*="bg-"]')?.className.includes('bg-');
      }, { timeout: 5000 });
    } catch (e) {
      console.warn('⚠️ Tailwind timeout - continuing anyway');
    }

    // Esperar a que las fuentes carguen
    console.log('🔤 [renderToImage] Waiting for fonts...');
    await page.evaluateHandle('document.fonts.ready').catch(() => {
      console.warn('⚠️ Fonts timeout - continuing anyway');
    });

    // Esperar un momento adicional para renderizado final
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Tomar screenshot
    console.log('📸 [renderToImage] Taking screenshot...');

    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: true,
      omitBackground: false
    });

    await browser.close();
    browser = null;

    // Convertir a Data URL
    const base64 = screenshot.toString('base64');
    const dataUrl = `data:image/png;base64,${base64}`;

    const renderTime = Date.now() - startTime;

    console.log('✅ [renderToImage] Success', {
      userId,
      fileSize: screenshot.length,
      renderTime: `${renderTime}ms`
    });

    // Retornar resultado
    return res.status(200).json({
      success: true,
      imageDataUrl: dataUrl,
      fileSize: screenshot.length,
      renderTime: renderTime
    });

  } catch (error) {
    console.error('❌ [renderToImage] Error:', {
      userId,
      error: error.message,
      stack: error.stack
    });

    if (browser) {
      await browser.close().catch(() => { });
    }

    return res.status(500).json({
      success: false,
      error: error.message || 'Error desconocido al renderizar'
    });
  }
}

// Crear app Express con body parser para payloads grandes
const app = express();
app.use(cors({ origin: true })); // CORS configurado correctamente para Express
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.all('/', renderToImageHandler);

module.exports = {
  renderToImage: onRequest(
    {
      region: 'southamerica-east1',
      timeoutSeconds: 60,
      memory: '1GiB',  // @sparticuz/chromium requiere mínimo 512MB, usamos 1GB
      minInstances: 0,
      maxInstances: 10,
      cors: true
    },
    app
  )
};
