// Script de limpieza rápida para datos inconsistentes
// Ejecutar en la consola del navegador

console.log('🧹 Iniciando limpieza de datos inconsistentes...');

// Función para limpiar datos del usuario actual
const cleanupCurrentUser = async () => {
  try {
    // Obtener UID del usuario actual
    const authData = localStorage.getItem('walla_auth');
    const profileData = localStorage.getItem('walla_profile');

    let uid = null;
    if (authData) {
      uid = JSON.parse(authData).uid;
    } else if (profileData) {
      uid = JSON.parse(profileData).uid;
    }

    if (!uid) {
      console.log('❌ No se pudo obtener el UID del usuario. Asegúrate de estar autenticado.');
      return;
    }

    console.log(`🔍 Limpiando datos para usuario: ${uid}`);

    // Importar Firebase
    const { collection, getDocs, doc, getDoc, deleteDoc } = await import('firebase/firestore');
    const { db } = await import('./src/firebaseInit');

    // Obtener todas las relaciones usuario-negocio
    const businessesRef = collection(db, 'users', uid, 'businesses');
    const snapshot = await getDocs(businessesRef);

    let deletedCount = 0;
    let validCount = 0;

    console.log(`📊 Encontradas ${snapshot.docs.length} relaciones usuario-negocio`);

    for (const businessDoc of snapshot.docs) {
      const businessData = businessDoc.data();
      const businessId = businessData.businessId;

      console.log(`🔍 Verificando: ${businessData.businessName} (${businessId})`);

      // Verificar si el negocio existe en la collection principal
      const mainBusinessRef = doc(db, 'businesses', businessId);
      const mainBusinessDoc = await getDoc(mainBusinessRef);

      if (!mainBusinessDoc.exists()) {
        // Eliminar relación inválida
        await deleteDoc(doc(db, 'users', uid, 'businesses', businessDoc.id));
        console.log(`🗑️  Eliminado: ${businessData.businessName}`);
        deletedCount++;
      } else {
        console.log(`✅ Válido: ${businessData.businessName}`);
        validCount++;
      }
    }

    // Limpiar localStorage
    localStorage.removeItem('walla_businesses');
    localStorage.removeItem('walla_current_business');
    console.log('🧹 localStorage limpiado');

    console.log(`
🎉 LIMPIEZA COMPLETADA:
- ✅ Relaciones válidas: ${validCount}
- 🗑️  Relaciones eliminadas: ${deletedCount}
- 🧹 LocalStorage limpiado

🔄 SIGUIENTE PASO: Recarga la página completamente (Ctrl+F5)
    `);

  } catch (error) {
    console.error('❌ Error en limpieza:', error);
  }
};

// Ejecutar limpieza automáticamente
cleanupCurrentUser();

// También hacer disponible globalmente
window.cleanupCurrentUser = cleanupCurrentUser;
window.forceReload = () => {
  localStorage.clear();
  location.reload(true);
};

console.log('');
console.log('📋 FUNCIONES DISPONIBLES:');
console.log('- cleanupCurrentUser() - Limpiar datos inconsistentes');
console.log('- forceReload() - Limpiar todo y recargar página');
