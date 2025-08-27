// Script rápido para diagnosticar y solucionar el error "El negocio no existe"
// Pegar este código en la consola del navegador cuando estés autenticado

// 🔍 PASO 1: Obtener el UID del usuario actual
const getCurrentUserId = () => {
  try {
    // Intentar obtener desde localStorage de authStore
    const authData = localStorage.getItem('walla_auth');
    if (authData) {
      const auth = JSON.parse(authData);
      return auth.uid;
    }

    // Intentar obtener desde profile de userStore
    const profileData = localStorage.getItem('walla_profile');
    if (profileData) {
      const profile = JSON.parse(profileData);
      return profile.uid;
    }

    console.log('❌ No se pudo obtener el UID del usuario');
    console.log('💡 Asegúrate de estar autenticado');
    return null;
  } catch (error) {
    console.error('❌ Error obteniendo UID:', error);
    return null;
  }
};

// 🔍 PASO 2: Verificar datos del usuario
const checkUserData = async () => {
  const uid = getCurrentUserId();
  if (!uid) return;

  console.log(`🔍 Verificando datos para usuario: ${uid}`);

  try {
    // Importar Firebase (asumiendo que está disponible globalmente)
    const { collection, doc, getDoc, getDocs, query, where } = await import('firebase/firestore');
    const { db } = await import('./src/firebaseInit');

    // Verificar perfil de usuario
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      console.log('✅ Perfil de usuario existe');
      console.log('👤 Datos:', userDoc.data());
    } else {
      console.log('❌ Perfil de usuario NO existe');
    }

    // Verificar negocios del usuario
    const businessesRef = collection(db, 'users', uid, 'businesses');
    const businessesSnapshot = await getDocs(businessesRef);

    console.log(`📊 ${businessesSnapshot.docs.length} relaciones usuario-negocio encontradas`);

    const businessChecks = [];

    for (const businessDoc of businessesSnapshot.docs) {
      const businessData = businessDoc.data();
      console.log(`\n🔍 Verificando: ${businessData.businessName}`);
      console.log(`📁 Business ID: ${businessData.businessId}`);

      // Verificar si el negocio existe en la collection principal
      const mainBusinessDoc = await getDoc(doc(db, 'businesses', businessData.businessId));

      const check = {
        userBusinessId: businessDoc.id,
        businessId: businessData.businessId,
        businessName: businessData.businessName,
        rol: businessData.rol,
        existsInMain: mainBusinessDoc.exists(),
        mainData: mainBusinessDoc.exists() ? mainBusinessDoc.data() : null
      };

      businessChecks.push(check);

      if (mainBusinessDoc.exists()) {
        console.log('✅ Existe en collection businesses');
        console.log('🏢 Nombre:', mainBusinessDoc.data().nombre);
      } else {
        console.log('❌ NO existe en collection businesses');
        console.log('🔧 Esta es la causa del error!');
      }
    }

    // Resumen
    const valid = businessChecks.filter(c => c.existsInMain);
    const invalid = businessChecks.filter(c => !c.existsInMain);

    console.log(`\n📋 RESUMEN:`);
    console.log(`✅ Negocios válidos: ${valid.length}`);
    console.log(`❌ Negocios inválidos: ${invalid.length}`);

    if (invalid.length > 0) {
      console.log(`\n🔧 SOLUCIÓN RECOMENDADA:`);
      console.log(`Los siguientes negocios causan el error y deben eliminarse:`);
      invalid.forEach(inv => {
        console.log(`- ${inv.businessName} (ID: ${inv.businessId})`);
      });

      console.log(`\n📝 EJECUTA ESTA FUNCIÓN PARA ARREGLAR:`);
      console.log(`cleanInvalidBusinesses('${uid}')`);
    }

    return { uid, valid, invalid, businessChecks };

  } catch (error) {
    console.error('❌ Error verificando datos:', error);
  }
};

// 🔧 PASO 3: Limpiar relaciones inválidas
const cleanInvalidBusinesses = async (uid) => {
  console.log(`🔧 Limpiando relaciones inválidas para: ${uid}`);

  try {
    const { collection, doc, getDoc, getDocs, deleteDoc } = await import('firebase/firestore');
    const { db } = await import('./src/firebaseInit');

    const businessesRef = collection(db, 'users', uid, 'businesses');
    const businessesSnapshot = await getDocs(businessesRef);

    let deletedCount = 0;

    for (const businessDoc of businessesSnapshot.docs) {
      const businessData = businessDoc.data();

      // Verificar si existe en collection principal
      const mainBusinessDoc = await getDoc(doc(db, 'businesses', businessData.businessId));

      if (!mainBusinessDoc.exists()) {
        // Eliminar relación inválida
        await deleteDoc(doc(db, 'users', uid, 'businesses', businessDoc.id));
        console.log(`🗑️  Eliminado: ${businessData.businessName}`);
        deletedCount++;
      }
    }

    console.log(`✅ Limpieza completada. ${deletedCount} relaciones inválidas eliminadas.`);
    console.log(`🔄 Ahora recarga la página y vuelve a hacer login.`);

  } catch (error) {
    console.error('❌ Error limpiando datos:', error);
  }
};

// 🚀 EJECUTAR DIAGNÓSTICO AUTOMÁTICAMENTE
console.log('🔍 DIAGNÓSTICO DE NEGOCIOS INICIADO...');
console.log('');

// Ejecutar verificación
checkUserData().then(result => {
  if (result && result.invalid.length > 0) {
    console.log('');
    console.log('🚨 PROBLEMA DETECTADO!');
    console.log('');
    console.log('📋 Para solucionarlo, ejecuta:');
    console.log(`cleanInvalidBusinesses('${result.uid}')`);
    console.log('');

    // Definir función global para fácil acceso
    window.cleanInvalidBusinesses = cleanInvalidBusinesses;
    window.checkUserData = checkUserData;
  } else if (result && result.invalid.length === 0) {
    console.log('');
    console.log('✅ No se encontraron problemas con los datos de negocios');
    console.log('🤔 El error puede estar en otro lugar');
  }
});

console.log('');
console.log('📋 FUNCIONES DISPONIBLES:');
console.log('- checkUserData() - Vuelve a verificar los datos');
console.log('- cleanInvalidBusinesses(uid) - Limpia relaciones inválidas');
