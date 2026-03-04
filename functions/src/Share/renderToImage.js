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

// =====================================================================
// BROWSER SINGLETON - Reutilizar entre requests del mismo proceso
// =====================================================================
let _browserSingleton = null;

const getLaunchOptions = async () => {
  if (isLocalEmulator) {
    return {
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security', '--disable-dev-shm-usage']
    };
  }
  return {
    args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security', '--disable-dev-shm-usage'],
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless
  };
};

const getOrCreateBrowser = async () => {
  if (_browserSingleton) {
    try {
      await _browserSingleton.pages();
      return _browserSingleton;
    } catch (e) {
      console.warn('⚠️ [Browser] Instancia muerta, recreando...');
      _warmPage = null;
      _warmPageBusy = false;
      _browserSingleton = null;
    }
  }
  console.log('🆕 [Browser] Lanzando nueva instancia Puppeteer...');
  const launchOptions = await getLaunchOptions();
  _browserSingleton = await puppeteer.launch(launchOptions);
  return _browserSingleton;
};

// =====================================================================
// WARM PAGE SINGLETON
// ⚡ Tailwind CDN + Google Fonts se cargan UNA SOLA VEZ.
//    Cada request solo inyecta el HTML en el body (~150ms vs ~2300ms).
// =====================================================================
let _warmPage = null;
let _warmPageBusy = false;

// Página base con todos los recursos externos pre-cargados (body vacío)
const WARM_PAGE_TEMPLATE = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
    body { font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #ffffff; }
  </style>
</head>
<body></body>
</html>`;

/**
 * Crea y calienta una nueva página con todos los assets externos ya cargados.
 */
const createWarmPage = async (browser) => {
  const page = await browser.newPage();
  await page.setViewport({ width: 400, height: 800, deviceScaleFactor: 2 });
  await page.setContent(WARM_PAGE_TEMPLATE, { waitUntil: 'load', timeout: 30000 });
  console.log('🔥 [WarmPage] Página pre-cargada con Tailwind + fonts');
  return page;
};

/**
 * Devuelve la warm page si está libre, o null si está ocupada (fallback a página nueva).
 */
const acquireWarmPage = async () => {
  const browser = await getOrCreateBrowser();

  if (!_warmPage) {
    // Primera vez: crear y guardar
    _warmPage = await createWarmPage(browser);
  } else {
    // Verificar que siga viva
    try {
      await _warmPage.evaluate(() => document.readyState);
    } catch (e) {
      console.warn('⚠️ [WarmPage] Página muerta, recreando...');
      _warmPage = await createWarmPage(browser);
    }
  }

  if (_warmPageBusy) {
    // Request concurrente: crear página temporal (rara vez ocurre)
    console.warn('⚡ [WarmPage] Ocupada — usando página temporal');
    return { page: await browser.newPage(), isWarm: false };
  }

  _warmPageBusy = true;
  return { page: _warmPage, isWarm: true };
};

/**
 * Libera la warm page reseteando el body para el próximo request.
 */
const releaseWarmPage = async (isWarm, tempPage) => {
  if (!isWarm && tempPage) {
    await tempPage.close().catch(() => { });
    return;
  }
  // Resetear body y viewport para dejarla limpia
  try {
    await _warmPage.evaluate(() => { document.body.innerHTML = ''; });
    await _warmPage.setViewport({ width: 400, height: 800, deviceScaleFactor: 2 });
  } catch (e) {
    // Si falla el reset, marcar para recrear en el próximo request
    console.warn('⚠️ [WarmPage] Error al resetear, se recreará en próximo request');
    _warmPage = null;
  }
  _warmPageBusy = false;
};
// =====================================================================

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

  let page = null;
  let isWarm = false;

  try {
    // ⚡ Obtener warm page (Tailwind + fonts ya cargados)
    const t_page = Date.now();
    const acquired = await acquireWarmPage();
    page = acquired.page;
    isWarm = acquired.isWarm;
    console.log(`⏱️ [renderToImage] Página lista en ${Date.now() - t_page}ms (warm=${isWarm})`);

    // Ajustar viewport al contenido del request
    await page.setViewport({
      width: Math.ceil(width),
      height: Math.ceil(height),
      deviceScaleFactor: deviceScaleFactor
    });

    // ⚡ FAST PATH: inyectar solo el HTML en el body de la página ya caliente
    //    Tailwind CDN tiene MutationObserver activo — detecta los nuevos elementos
    //    y aplica las clases automáticamente sin necesidad de recargar nada.
    const t_inject = Date.now();
    await page.evaluate((html) => {
      document.body.innerHTML = html;
    }, cleanHTML);
    console.log(`⏱️ [renderToImage] HTML inyectado en ${Date.now() - t_inject}ms`);

    // Dar tiempo al MutationObserver de Tailwind para procesar los nuevos nodos
    // y al navegador para completar el layout (antes era 400ms, redujimos a 150ms)
    await new Promise(resolve => setTimeout(resolve, 150));

    // Tomar screenshot
    console.log('📸 [renderToImage] Taking screenshot...');
    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: true,
      omitBackground: false
    });

    // ⚡ Liberar warm page (reset body) sin cerrarla — lista para el próximo request
    await releaseWarmPage(isWarm, page);
    page = null;

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

    if (page) {
      await releaseWarmPage(isWarm, page).catch(() => { });
      page = null;
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
