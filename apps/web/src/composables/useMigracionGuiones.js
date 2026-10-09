import { ref } from 'vue';
import { saveVideosFromJSON } from '@/services/guionesService';

/**
 * Composable para migrar guiones desde JSON a Firestore
 */
export function useMigracionGuiones() {
  const migrating = ref(false);
  const progress = ref({
    current: 0,
    total: 0,
    currentFile: '',
    logs: []
  });
  const error = ref(null);

  /**
   * Archivos JSON de guiones disponibles
   * IMPORTANTE: Los archivos deben estar en /public/guiones/ para producción
   */
  const jsonFiles = [
    { name: 'ordenRegistro.json', path: '/guiones/ordenRegistro.json' },
    { name: 'guiones_flujo_caja.json', path: '/guiones/guiones_flujo_caja.json' },
    { name: 'comprasRegistros.json', path: '/guiones/comprasRegistros.json' },
    { name: 'RegistrosIngresos.json', path: '/guiones/RegistrosIngresos.json' }
  ];

  /**
   * Carga un archivo JSON desde public
   */
  async function loadJSONFile(path) {
    try {
      progress.value.logs.push(`  → Cargando desde: ${path}`);

      const response = await fetch(path);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      progress.value.logs.push(`  → JSON parseado correctamente`);

      return data;
    } catch (err) {
      progress.value.logs.push(`  ✗ Error de carga: ${err.message}`);
      throw new Error(`Error al cargar ${path}: ${err.message}`);
    }
  }

  /**
   * Valida la estructura del JSON
   */
  function validateJSON(data) {
    if (!data.meta_analisis) {
      throw new Error('Falta "meta_analisis"');
    }
    if (!data.generacion) {
      throw new Error('Falta "generacion"');
    }
    if (!data.videos || !Array.isArray(data.videos)) {
      throw new Error('Falta "videos" o no es un array');
    }
    if (data.videos.length === 0) {
      throw new Error('El array "videos" está vacío');
    }
    return true;
  }

  /**
   * Ejecuta la migración completa
   */
  async function migrar() {
    try {
      migrating.value = true;
      error.value = null;
      progress.value = {
        current: 0,
        total: jsonFiles.length,
        currentFile: '',
        logs: ['🎬 Iniciando migración de guiones...', `📍 Entorno: ${import.meta.env.MODE}`]
      };

      const results = [];

      for (const file of jsonFiles) {
        progress.value.currentFile = file.name;
        progress.value.logs.push(`\n${'─'.repeat(50)}`);
        progress.value.logs.push(`📄 Procesando: ${file.name}`);

        try {
          // Cargar JSON
          const jsonData = await loadJSONFile(file.path);
          progress.value.logs.push(`  ✓ JSON cargado (${jsonData.videos?.length || 0} videos)`);

          // Validar estructura
          validateJSON(jsonData);
          progress.value.logs.push(`  ✓ Estructura validada`);

          // Guardar videos en Firestore
          progress.value.logs.push(`  → Guardando en Firestore...`);
          const savedIds = await saveVideosFromJSON(jsonData);
          progress.value.logs.push(`  ✓ ${savedIds.length} videos guardados en Firestore`);

          results.push({
            file: file.name,
            success: true,
            count: savedIds.length
          });

          progress.value.current++;
        } catch (err) {
          console.error(`Error procesando ${file.name}:`, err);
          progress.value.logs.push(`  ❌ Error: ${err.message}`);
          results.push({
            file: file.name,
            success: false,
            error: err.message
          });
          progress.value.current++;
        }
      }

      // Resumen final
      progress.value.logs.push('\n' + '═'.repeat(50));
      progress.value.logs.push('📊 RESUMEN FINAL');
      progress.value.logs.push('═'.repeat(50));

      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      const totalVideos = results.reduce((sum, r) => sum + (r.count || 0), 0);

      progress.value.logs.push(`\nArchivos procesados: ${results.length}`);
      progress.value.logs.push(`  ✅ Exitosos: ${successful}`);
      progress.value.logs.push(`  ❌ Fallidos: ${failed}`);
      progress.value.logs.push(`\nTotal videos migrados: ${totalVideos}`);

      if (failed > 0) {
        progress.value.logs.push(`\n⚠️ Migración completada con errores`);
        results.filter(r => !r.success).forEach(r => {
          progress.value.logs.push(`  • ${r.file}: ${r.error}`);
        });
      } else {
        progress.value.logs.push('\n✅ Migración completada exitosamente');
      }

      return {
        success: failed === 0,
        results,
        totalVideos
      };
    } catch (err) {
      console.error('Error fatal en migración:', err);
      error.value = err.message;
      progress.value.logs.push(`\n❌ Error fatal: ${err.message}`);
      throw err;
    } finally {
      migrating.value = false;
    }
  }

  /**
   * Resetea el estado
   */
  function reset() {
    migrating.value = false;
    progress.value = {
      current: 0,
      total: 0,
      currentFile: '',
      logs: []
    };
    error.value = null;
  }

  return {
    migrating,
    progress,
    error,
    migrar,
    reset,
    jsonFiles // Exponer para debug
  };
}