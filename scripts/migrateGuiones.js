/**
 * Script de migración: JSON → Firestore
 * 
 * Migra todos los archivos JSON de guiones desde /src/assets/guiones/
 * a la colección marketing/guiones/videos en Firestore
 * 
 * USO:
 * node scripts/migrateGuiones.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import admin from 'firebase-admin';
import { createRequire } from 'module';

// ES module equivalente de __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar service account usando createRequire
const require = createRequire(import.meta.url);
const serviceAccount = require('../wala-lat-firebase-adminsdk.json');

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Configuración
const GUIONES_DIR = path.join(__dirname, '../src/assets/guiones');
const COLLECTION_PATH = 'marketing/guiones/videos';

/**
 * Genera un ID único para el video
 */
function generateVideoId(videoData, tema) {
  const sanitize = (str) => {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const temaSanitized = sanitize(tema);
  const subtemaSanitized = sanitize(videoData.subtema || 'sin-subtema');
  const numero = videoData.numero || Date.now();

  return `${temaSanitized}_${subtemaSanitized}_${numero}`;
}

/**
 * Procesa un archivo JSON de guiones
 */
async function processGuionFile(filePath) {
  console.log(`\n📄 Procesando: ${path.basename(filePath)}`);

  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const guionData = JSON.parse(fileContent);

    // Validar estructura
    if (!guionData.meta_analisis || !guionData.videos || !Array.isArray(guionData.videos)) {
      console.log(`⚠️  Archivo con estructura inválida, saltando...`);
      return { success: false, error: 'Estructura inválida' };
    }

    const results = [];

    // Procesar cada video
    for (const video of guionData.videos) {
      try {
        const videoId = generateVideoId(video, guionData.meta_analisis.tema);

        const videoData = {
          ...video,
          tema: guionData.meta_analisis.tema,
          sectores: guionData.meta_analisis.sectores || [guionData.meta_analisis.sector],
          fase_funnel: guionData.generacion.fase_funnel,
          estrategia_aplicada: guionData.meta_analisis.estrategia_aplicada,
          propuesta_valor_central: guionData.meta_analisis.propuesta_valor_central,
          estado: video.estado || 'GRABANDO',
          tipo_contenido: video.tipo_contenido || 'STORYTELLING',
          comentarios: video.comentarios || '',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          _migrated: true,
          _sourceFile: path.basename(filePath)
        };

        // Guardar en Firestore
        await db.doc(`${COLLECTION_PATH}/${videoId}`).set(videoData);

        console.log(`  ✅ Video ${video.numero}: ${video.subtema}`);
        results.push({ success: true, videoId, subtema: video.subtema });
      } catch (error) {
        console.log(`  ❌ Error en video ${video.numero}: ${error.message}`);
        results.push({ success: false, error: error.message, video: video.numero });
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`\n📊 Resumen: ${successful} exitosos, ${failed} fallidos`);

    return { success: true, results };
  } catch (error) {
    console.error(`❌ Error procesando archivo: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Encuentra todos los archivos JSON en el directorio de guiones
 */
function findGuionFiles() {
  const files = fs.readdirSync(GUIONES_DIR);
  return files
    .filter(file => file.endsWith('.json') && file !== 'package.json')
    .map(file => path.join(GUIONES_DIR, file));
}

/**
 * Main
 */
async function main() {
  console.log('🎬 Iniciando migración de guiones...\n');
  console.log(`📂 Directorio: ${GUIONES_DIR}`);
  console.log(`🔥 Colección: ${COLLECTION_PATH}\n`);

  const jsonFiles = findGuionFiles();

  if (jsonFiles.length === 0) {
    console.log('⚠️  No se encontraron archivos JSON para migrar');
    process.exit(0);
  }

  console.log(`📋 Archivos encontrados: ${jsonFiles.length}\n`);
  jsonFiles.forEach((file, idx) => {
    console.log(`  ${idx + 1}. ${path.basename(file)}`);
  });

  console.log('\n🚀 Comenzando migración...');

  const allResults = [];

  for (const file of jsonFiles) {
    const result = await processGuionFile(file);
    allResults.push({
      file: path.basename(file),
      ...result
    });
  }

  // Resumen final
  console.log('\n' + '═'.repeat(60));
  console.log('📊 RESUMEN FINAL DE MIGRACIÓN');
  console.log('═'.repeat(60) + '\n');

  const totalFiles = allResults.length;
  const successfulFiles = allResults.filter(r => r.success).length;
  const failedFiles = allResults.filter(r => !r.success).length;

  let totalVideos = 0;
  allResults.forEach(r => {
    if (r.results) {
      totalVideos += r.results.filter(v => v.success).length;
    }
  });

  console.log(`Archivos procesados: ${totalFiles}`);
  console.log(`  ✅ Exitosos: ${successfulFiles}`);
  console.log(`  ❌ Fallidos: ${failedFiles}`);
  console.log(`\nVideos migrados: ${totalVideos}`);

  console.log('\n' + '═'.repeat(60));
  console.log('✅ Migración completada');
  console.log('═'.repeat(60));

  process.exit(0);
}

// Ejecutar
main().catch(error => {
  console.error('\n❌ Error fatal en la migración:', error);
  process.exit(1);
});
