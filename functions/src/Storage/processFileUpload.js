/* eslint-disable */

const { onObjectFinalized } = require('firebase-functions/v2/storage');
const { getFirestore } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');
const path = require('path');
const os = require('os');
const fs = require('fs').promises;

/**
 * 🖼️ Process File Upload
 * 
 * Cloud Function que se dispara cuando se sube un archivo a Storage
 * - Detecta tipo de archivo (imagen, PDF, HEIC)
 * - Genera preview optimizado para imágenes
 * - Convierte HEIC/HEIF a JPG
 * - Extrae metadata
 * - Actualiza documento en Firestore
 * 
 * Trigger: onFinalize en Storage
 * Path: uploads/tmp/**\/original
 */

// ═══════════════════════════════════════════════════════════
// CONFIGURACIÓN
// ═══════════════════════════════════════════════════════════

const CONFIG = {
  preview: {
    maxWidth: 1280,
    maxHeight: 1280,
    quality: 80,
    format: 'jpeg' // Formato de salida del preview
  },
  supportedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/heif', 'image/webp'],
  heicTypes: ['image/heic', 'image/heif']
};

// ═══════════════════════════════════════════════════════════
// FUNCIÓN PRINCIPAL
// ═══════════════════════════════════════════════════════════

exports.processFileUpload = onObjectFinalized(
  {
    region: 'southamerica-east1',
    memory: '1GiB',
    timeoutSeconds: 300,
    cpu: 1
  },
  async (event) => {
    const filePath = event.data.name; // uploads/tmp/{tenantId}/{uid}/{timestamp}-{fileId}/original
    const contentType = event.data.contentType;
    const fileSize = event.data.size;

    console.log('📎 Procesando archivo:', filePath);
    console.log('📦 ContentType:', contentType);
    console.log('💾 Size:', fileSize, 'bytes');

    // ═══════════════════════════════════════════════════════════
    // 1. VALIDAR PATH
    // ═══════════════════════════════════════════════════════════

    // Solo procesar archivos en uploads/tmp/**/original
    if (!filePath.includes('uploads/tmp/') || !filePath.endsWith('/original')) {
      console.log('⏭️  Path no coincide con patrón esperado, ignorando');
      return null;
    }

    // ═══════════════════════════════════════════════════════════
    // 2. EXTRAER METADATA DEL PATH
    // ═══════════════════════════════════════════════════════════

    const pathParts = filePath.split('/');
    // uploads/tmp/{tenantId}/{uid}/{timestamp}-{fileId}/original
    // [0]     [1]  [2]        [3]   [4]                  [5]

    if (pathParts.length < 6) {
      console.error('❌ Path inválido:', filePath);
      return null;
    }

    const tenantId = pathParts[2];
    const uid = pathParts[3];
    const folderName = pathParts[4]; // timestamp-fileId
    const fileId = folderName.split('-').slice(1).join('-'); // Extraer fileId

    console.log('🔑 FileId:', fileId);
    console.log('🏢 TenantId:', tenantId);
    console.log('👤 UID:', uid);

    // ═══════════════════════════════════════════════════════════
    // 3. OBTENER REFERENCIAS
    // ═══════════════════════════════════════════════════════════

    const db = getFirestore();
    const bucket = getStorage().bucket();
    const fileDocRef = db.collection('files').doc(fileId);

    // Verificar que existe el documento en Firestore
    const fileDoc = await fileDocRef.get();
    if (!fileDoc.exists) {
      console.error('❌ Documento no encontrado en Firestore:', fileId);
      return null;
    }

    try {
      // ═══════════════════════════════════════════════════════════
      // 4. DETERMINAR TIPO DE ARCHIVO
      // ═══════════════════════════════════════════════════════════

      const isImage = CONFIG.supportedImageTypes.includes(contentType);
      const isPdf = contentType === 'application/pdf';
      const isHeic = CONFIG.heicTypes.includes(contentType);

      console.log('🖼️  Es imagen:', isImage);
      console.log('📄 Es PDF:', isPdf);
      console.log('🔄 Es HEIC:', isHeic);

      // ═══════════════════════════════════════════════════════════
      // 5. PROCESAR SEGÚN TIPO
      // ═══════════════════════════════════════════════════════════

      if (isImage) {
        await processImage(bucket, filePath, fileId, tenantId, uid, folderName, contentType, fileSize, fileDocRef);
      } else if (isPdf) {
        await processPdf(bucket, filePath, fileId, fileSize, fileDocRef);
      } else {
        // Tipo no soportado, solo guardar metadata
        await fileDocRef.update({
          status: 'ready',
          'urls.original': `https://storage.googleapis.com/${bucket.name}/${filePath}`,
          'meta.processedAt': new Date(),
          'meta.size': fileSize
        });
      }

      console.log('✅ Archivo procesado correctamente:', fileId);
      return null;

    } catch (error) {
      console.error('❌ Error procesando archivo:', error);

      // Actualizar documento con error
      await fileDocRef.update({
        status: 'error',
        error: {
          code: error.code || 'processing_error',
          messageUser: 'Error al procesar el archivo. Por favor, intenta de nuevo.',
          details: error.message
        }
      });

      throw error;
    }
  }
);

// ═══════════════════════════════════════════════════════════
// FUNCIONES AUXILIARES
// ═══════════════════════════════════════════════════════════

/**
 * Procesa una imagen (resize, preview, conversión HEIC)
 */
async function processImage(bucket, filePath, fileId, tenantId, uid, folderName, contentType, fileSize, fileDocRef) {
  const sharp = require('sharp');
  const tempLocalFile = path.join(os.tmpdir(), `temp-${fileId}`);
  const tempPreviewFile = path.join(os.tmpdir(), `preview-${fileId}.jpg`);

  try {
    // 1. Descargar archivo original
    console.log('⬇️  Descargando archivo original...');
    await bucket.file(filePath).download({ destination: tempLocalFile });

    // 2. Procesar con Sharp
    console.log('🔧 Procesando con Sharp...');
    const image = sharp(tempLocalFile);
    const metadata = await image.metadata();

    console.log('📐 Dimensiones originales:', metadata.width, 'x', metadata.height);
    console.log('🎨 Formato:', metadata.format);

    // 3. Generar preview (resize + optimizar)
    await image
      .rotate() // Auto-rotar según EXIF
      .resize(CONFIG.preview.maxWidth, CONFIG.preview.maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({
        quality: CONFIG.preview.quality,
        progressive: true
      })
      .toFile(tempPreviewFile);

    console.log('✅ Preview generado');

    // 4. Subir preview a Storage
    const previewPath = `uploads/tmp/${tenantId}/${uid}/${folderName}/preview`;
    await bucket.upload(tempPreviewFile, {
      destination: previewPath,
      metadata: {
        contentType: 'image/jpeg',
        metadata: {
          fileId,
          type: 'preview'
        }
      }
    });

    console.log('✅ Preview subido a Storage');

    // 5. Obtener URLs públicas
    const originalUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
    const previewUrl = `https://storage.googleapis.com/${bucket.name}/${previewPath}`;

    // 6. Actualizar Firestore
    await fileDocRef.update({
      status: 'ready',
      'storage.previewPath': previewPath,
      'urls.original': originalUrl,
      'urls.preview': previewUrl,
      'meta.width': metadata.width,
      'meta.height': metadata.height,
      'meta.format': metadata.format,
      'meta.size': fileSize,
      'meta.processedAt': new Date()
    });

    console.log('✅ Firestore actualizado');

    // 7. Limpiar archivos temporales
    await fs.unlink(tempLocalFile);
    await fs.unlink(tempPreviewFile);

  } catch (error) {
    console.error('❌ Error procesando imagen:', error);

    // Limpiar archivos temporales si existen
    try {
      await fs.unlink(tempLocalFile);
      await fs.unlink(tempPreviewFile);
    } catch (cleanupError) {
      // Ignorar errores de limpieza
    }

    throw error;
  }
}

/**
 * Procesa un PDF (solo extrae metadata)
 */
async function processPdf(bucket, filePath, fileId, fileSize, fileDocRef) {
  try {
    console.log('📄 Procesando PDF...');

    // Obtener URL
    const originalUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

    // Actualizar Firestore (PDF no tiene preview)
    await fileDocRef.update({
      status: 'ready',
      'urls.original': originalUrl,
      'urls.preview': null,
      'meta.size': fileSize,
      'meta.format': 'pdf',
      'meta.processedAt': new Date()
    });

    console.log('✅ PDF procesado (metadata guardada)');

  } catch (error) {
    console.error('❌ Error procesando PDF:', error);
    throw error;
  }
}
