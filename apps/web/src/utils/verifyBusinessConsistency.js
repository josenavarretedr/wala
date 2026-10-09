// Script para verificar la consistencia de IDs entre businesses y user businesses
// Ejecutar en la consola del navegador

console.log('🔍 VERIFICACIÓN DE CONSISTENCIA DE IDs');
console.log('=====================================');

const verifyBusinessConsistency = async (uid) => {
  try {
    console.log(`📊 Verificando consistencia para usuario: ${uid}`);

    // Importar Firebase
    const { collection, doc, getDoc, getDocs } = await import('firebase/firestore');
    const { db } = await import('./src/firebaseInit');

    // 1. Obtener todas las relaciones usuario-negocio
    const userBusinessesRef = collection(db, 'users', uid, 'businesses');
    const userBusinessesSnapshot = await getDocs(userBusinessesRef);

    console.log(`\n📋 RELACIONES USUARIO-NEGOCIO:`);
    console.log(`Total encontradas: ${userBusinessesSnapshot.docs.length}`);

    const consistencyResults = [];

    for (const userBusinessDoc of userBusinessesSnapshot.docs) {
      const userBusinessData = userBusinessDoc.data();
      const documentId = userBusinessDoc.id;
      const businessId = userBusinessData.businessId;

      console.log(`\n🔍 Verificando relación:`);
      console.log(`  Document Path: users/${uid}/businesses/${documentId}`);
      console.log(`  Business ID referenciado: ${businessId}`);
      console.log(`  Business Name: ${userBusinessData.businessName}`);
      console.log(`  Rol: ${userBusinessData.rol}`);

      // 2. Verificar si el negocio existe en collection principal
      const businessDocRef = doc(db, 'businesses', businessId);
      const businessDoc = await getDoc(businessDocRef);

      const result = {
        documentId,
        businessId,
        businessName: userBusinessData.businessName,
        rol: userBusinessData.rol,
        existsInMainCollection: businessDoc.exists(),
        idsMatch: documentId === businessId, // ✅ ESTO DEBE SER TRUE
        mainBusinessData: businessDoc.exists() ? businessDoc.data() : null
      };

      if (businessDoc.exists()) {
        const mainBusinessData = businessDoc.data();
        console.log(`  ✅ Negocio existe en businesses/${businessId}`);
        console.log(`  📝 Nombre en collection principal: ${mainBusinessData.nombre}`);
        console.log(`  👤 Gerente: ${mainBusinessData.gerenteId}`);

        // Verificar que el gerente coincida
        if (mainBusinessData.gerenteId === uid) {
          console.log(`  ✅ Gerente coincide con usuario actual`);
        } else {
          console.log(`  ⚠️  Gerente NO coincide (esperado: ${uid}, actual: ${mainBusinessData.gerenteId})`);
        }
      } else {
        console.log(`  ❌ Negocio NO existe en businesses/${businessId}`);
      }

      // Verificar consistencia de IDs
      if (documentId === businessId) {
        console.log(`  ✅ ID CONSISTENTE: Document ID = Business ID = ${businessId}`);
      } else {
        console.log(`  ❌ ID INCONSISTENTE: Document ID (${documentId}) ≠ Business ID (${businessId})`);
      }

      consistencyResults.push(result);
    }

    // 3. Resumen de consistencia
    const consistentIds = consistencyResults.filter(r => r.idsMatch);
    const inconsistentIds = consistencyResults.filter(r => !r.idsMatch);
    const validBusinesses = consistencyResults.filter(r => r.existsInMainCollection);
    const invalidBusinesses = consistencyResults.filter(r => !r.existsInMainCollection);

    console.log(`\n📊 RESUMEN DE CONSISTENCIA:`);
    console.log(`  ✅ IDs consistentes: ${consistentIds.length}/${consistencyResults.length}`);
    console.log(`  ❌ IDs inconsistentes: ${inconsistentIds.length}/${consistencyResults.length}`);
    console.log(`  ✅ Negocios válidos: ${validBusinesses.length}/${consistencyResults.length}`);
    console.log(`  ❌ Negocios inválidos: ${invalidBusinesses.length}/${consistencyResults.length}`);

    if (inconsistentIds.length > 0) {
      console.log(`\n⚠️  PROBLEMAS DE CONSISTENCIA DETECTADOS:`);
      inconsistentIds.forEach(issue => {
        console.log(`  - ${issue.businessName}: Document ID="${issue.documentId}" ≠ Business ID="${issue.businessId}"`);
      });
    }

    if (invalidBusinesses.length > 0) {
      console.log(`\n❌ NEGOCIOS INVÁLIDOS DETECTADOS:`);
      invalidBusinesses.forEach(invalid => {
        console.log(`  - ${invalid.businessName}: Business ID="${invalid.businessId}" no existe en collection principal`);
      });
    }

    if (inconsistentIds.length === 0 && invalidBusinesses.length === 0) {
      console.log(`\n🎉 ¡PERFECTO! Todas las relaciones están correctamente configuradas.`);
    }

    return {
      total: consistencyResults.length,
      consistent: consistentIds.length,
      valid: validBusinesses.length,
      issues: [...inconsistentIds, ...invalidBusinesses]
    };

  } catch (error) {
    console.error('❌ Error en verificación:', error);
    throw error;
  }
};

// Función para obtener el UID actual
const getCurrentUID = () => {
  try {
    const authData = localStorage.getItem('walla_auth');
    if (authData) {
      return JSON.parse(authData).uid;
    }

    const profileData = localStorage.getItem('walla_profile');
    if (profileData) {
      return JSON.parse(profileData).uid;
    }

    console.log('❌ No se pudo obtener el UID del usuario actual');
    return null;
  } catch (error) {
    console.error('❌ Error obteniendo UID:', error);
    return null;
  }
};

// Función para verificar automáticamente el usuario actual
const verifyCurrentUser = async () => {
  const uid = getCurrentUID();
  if (uid) {
    console.log(`🔍 Verificando usuario actual: ${uid}`);
    return await verifyBusinessConsistency(uid);
  } else {
    console.log('❌ No hay usuario autenticado o no se pudo obtener el UID');
    return null;
  }
};

// Ejemplo de estructura CORRECTA que debe verse
const showCorrectStructure = () => {
  console.log(`\n📋 ESTRUCTURA CORRECTA ESPERADA:`);
  console.log(`
Collection: businesses
├── FARMACIA-abc12345/
│   ├── id: "FARMACIA-abc12345"
│   ├── nombre: "Farmacia El Buen Precio"
│   ├── gerenteId: "user123"
│   └── ...otros datos

SubCollection: users/{uid}/businesses  
├── FARMACIA-abc12345/     ← MISMO ID que el documento principal
│   ├── businessId: "FARMACIA-abc12345"
│   ├── businessName: "Farmacia El Buen Precio"
│   ├── rol: "gerente"
│   └── ...otros datos

✅ CLAVE: El ID del documento en la subcollection DEBE ser igual al businessId
  `);
};

// Ejecutar verificación automática
console.log('🚀 Iniciando verificación automática...');
verifyCurrentUser().then(result => {
  if (result) {
    console.log('\n✅ Verificación completada');
  }
});

showCorrectStructure();

// Hacer funciones disponibles globalmente
window.verifyBusinessConsistency = verifyBusinessConsistency;
window.verifyCurrentUser = verifyCurrentUser;
window.getCurrentUID = getCurrentUID;

console.log('\n📋 FUNCIONES DISPONIBLES:');
console.log('- verifyCurrentUser() - Verificar usuario actual');
console.log('- verifyBusinessConsistency(uid) - Verificar usuario específico');
console.log('- getCurrentUID() - Obtener UID del usuario actual');
