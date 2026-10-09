// Utilidad para diagnosticar y reparar inconsistencias de datos en Firestore
// Ejecutar en la consola del navegador cuando esté autenticado

import { collection, doc, getDoc, getDocs, query, where, deleteDoc } from 'firebase/firestore'
import { db } from '@/firebaseInit'

/**
 * Diagnosticar inconsistencias entre users/{uid}/businesses y businesses collection
 */
export async function diagnoseBusiness(uid) {
  console.log(`🔍 Diagnosticando negocios para usuario: ${uid}`)

  try {
    // 1. Obtener relaciones usuario-negocio
    const userBusinessesRef = collection(db, 'users', uid, 'businesses')
    const userBusinessesSnapshot = await getDocs(userBusinessesRef)

    const userBusinesses = userBusinessesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    console.log(`📊 Relaciones usuario-negocio encontradas: ${userBusinesses.length}`)

    // 2. Verificar cada negocio en la collection principal
    const diagnostics = []

    for (const userBusiness of userBusinesses) {
      const businessId = userBusiness.businessId
      console.log(`🔍 Verificando negocio: ${businessId}`)

      const businessDocRef = doc(db, 'businesses', businessId)
      const businessDoc = await getDoc(businessDocRef)

      const diagnostic = {
        userBusinessDocId: userBusiness.id,
        businessId: businessId,
        businessName: userBusiness.businessName,
        rol: userBusiness.rol,
        existsInBusinesses: businessDoc.exists(),
        businessData: businessDoc.exists() ? businessDoc.data() : null
      }

      diagnostics.push(diagnostic)

      if (businessDoc.exists()) {
        console.log(`✅ ${businessId} - Negocio existe`)
      } else {
        console.log(`❌ ${businessId} - Negocio NO existe en collection businesses`)
      }
    }

    // 3. Mostrar resumen
    const validBusinesses = diagnostics.filter(d => d.existsInBusinesses)
    const invalidBusinesses = diagnostics.filter(d => !d.existsInBusinesses)

    console.log(`
📋 RESUMEN DEL DIAGNÓSTICO:
- ✅ Negocios válidos: ${validBusinesses.length}
- ❌ Negocios inválidos: ${invalidBusinesses.length}
- 📊 Total de relaciones: ${diagnostics.length}
    `)

    if (invalidBusinesses.length > 0) {
      console.log('❌ NEGOCIOS INVÁLIDOS ENCONTRADOS:')
      invalidBusinesses.forEach(invalid => {
        console.log(`   - ${invalid.businessName} (ID: ${invalid.businessId})`)
      })
    }

    return {
      userBusinesses,
      diagnostics,
      validBusinesses,
      invalidBusinesses
    }

  } catch (error) {
    console.error('❌ Error en diagnóstico:', error)
    throw error
  }
}

/**
 * Reparar inconsistencias eliminando relaciones usuario-negocio inválidas
 */
export async function repairBusinessInconsistencies(uid) {
  console.log(`🔧 Reparando inconsistencias para usuario: ${uid}`)

  try {
    const diagnosis = await diagnoseBusiness(uid)

    if (diagnosis.invalidBusinesses.length === 0) {
      console.log('✅ No se encontraron inconsistencias para reparar')
      return { repaired: 0, remaining: diagnosis.validBusinesses.length }
    }

    console.log(`🔧 Eliminando ${diagnosis.invalidBusinesses.length} relaciones inválidas...`)

    // Eliminar relaciones usuario-negocio inválidas
    for (const invalid of diagnosis.invalidBusinesses) {
      const docRef = doc(db, 'users', uid, 'businesses', invalid.userBusinessDocId)
      await deleteDoc(docRef)
      console.log(`🗑️  Eliminada relación inválida: ${invalid.businessName}`)
    }

    console.log(`
🎉 REPARACIÓN COMPLETADA:
- 🗑️  Relaciones inválidas eliminadas: ${diagnosis.invalidBusinesses.length}
- ✅ Relaciones válidas restantes: ${diagnosis.validBusinesses.length}
    `)

    return {
      repaired: diagnosis.invalidBusinesses.length,
      remaining: diagnosis.validBusinesses.length
    }

  } catch (error) {
    console.error('❌ Error en reparación:', error)
    throw error
  }
}

/**
 * Obtener información completa de todos los negocios del usuario
 */
export async function getFullBusinessInfo(uid) {
  console.log(`📊 Obteniendo información completa de negocios para: ${uid}`)

  try {
    const diagnosis = await diagnoseBusiness(uid)

    console.log('📋 INFORMACIÓN DETALLADA:')

    diagnosis.diagnostics.forEach((diagnostic, index) => {
      console.log(`
${index + 1}. ${diagnostic.businessName}
   📁 ID: ${diagnostic.businessId}
   👤 Rol: ${diagnostic.rol}
   ✅ Existe: ${diagnostic.existsInBusinesses ? 'SÍ' : 'NO'}
   ${diagnostic.businessData ? `📝 Datos: ${JSON.stringify(diagnostic.businessData, null, 2)}` : '❌ Sin datos'}
      `)
    })

    return diagnosis

  } catch (error) {
    console.error('❌ Error obteniendo información:', error)
    throw error
  }
}

// Para usar desde la consola del navegador:
// import { diagnoseBusiness, repairBusinessInconsistencies, getFullBusinessInfo } from '@/utils/businessDiagnostics'
// 
// // Diagnosticar
// await diagnoseBusiness('tu-user-id')
// 
// // Reparar automáticamente
// await repairBusinessInconsistencies('tu-user-id')
// 
// // Ver información completa
// await getFullBusinessInfo('tu-user-id')

console.log('🔧 Business Diagnostics cargado. Usa diagnoseBusiness(), repairBusinessInconsistencies(), o getFullBusinessInfo()')
