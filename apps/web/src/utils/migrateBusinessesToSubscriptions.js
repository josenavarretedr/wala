/**
 * 🔄 Script de Migración: Agregar Suscripciones a Negocios Existentes
 * 
 * Este script agrega los campos de subscription, features y usage
 * a todos los negocios existentes en Firestore.
 * 
 * INSTRUCCIONES:
 * 1. Abrir la consola del navegador en la aplicación (ya autenticado)
 * 2. Copiar y pegar este script completo
 * 3. Ejecutar: migrateBusinessesToSubscriptions()
 * 4. Verificar en Firestore que los cambios se aplicaron
 */

import { collection, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore'
import { db } from '@/firebaseInit'

/**
 * Obtiene las features por defecto para un plan
 */
function getFeaturesForPlan(plan) {
  if (plan === 'premium') {
    return {
      maxEmployees: 999999,
      maxProducts: 999999,
      advancedReports: true,
      multiLocation: true,
      apiAccess: true,
      prioritySupport: true,
      customBranding: true,
      aiClassification: true,
      exportData: true
    }
  }
  
  // Plan free (por defecto)
  return {
    maxEmployees: 3,
    maxProducts: 100,
    advancedReports: false,
    multiLocation: false,
    apiAccess: false,
    prioritySupport: false,
    customBranding: false,
    aiClassification: false,
    exportData: false
  }
}

/**
 * Obtiene suscripción por defecto (plan free)
 */
function getDefaultSubscription(ownerId) {
  return {
    plan: 'free',
    status: 'active',
    startDate: new Date(),
    endDate: null,
    trialUsed: false,
    paymentMethod: null,
    lastPaymentDate: null,
    autoRenew: false,
    updatedAt: new Date(),
    updatedBy: ownerId
  }
}

/**
 * Obtiene stats de uso por defecto
 */
function getDefaultUsageStats() {
  return {
    employeeCount: 1, // Al menos el gerente
    productCount: 0,
    lastUpdated: new Date()
  }
}

/**
 * Cuenta empleados y productos de un negocio
 */
async function getBusinessUsageStats(businessId) {
  try {
    // Contar empleados
    const usersRef = collection(db, 'users')
    const usersSnapshot = await getDocs(usersRef)
    let employeeCount = 0
    
    usersSnapshot.forEach((doc) => {
      const userData = doc.data()
      if (userData.businessId === businessId) {
        employeeCount++
      }
    })

    // Contar productos (si existe la colección)
    let productCount = 0
    try {
      const productsRef = collection(db, 'businesses', businessId, 'products')
      const productsSnapshot = await getDocs(productsRef)
      productCount = productsSnapshot.size
    } catch (error) {
      console.log('No hay colección de productos para negocio:', businessId)
    }

    return {
      employeeCount: Math.max(employeeCount, 1), // Mínimo 1 (el gerente)
      productCount,
      lastUpdated: new Date()
    }
  } catch (error) {
    console.error('Error contando stats:', error)
    return getDefaultUsageStats()
  }
}

/**
 * Migra un negocio individual
 */
async function migrateBusiness(businessDoc) {
  const businessId = businessDoc.id
  const businessData = businessDoc.data()
  
  console.log(`\n📦 Migrando negocio: ${businessData.nombre} (${businessId})`)
  
  // Verificar si ya tiene subscription
  if (businessData.subscription) {
    console.log('  ⏭️  Ya tiene subscription, verificando integridad...')
    
    // Verificar que tenga todos los campos necesarios
    const hasFeatures = businessData.features !== undefined
    const hasUsage = businessData.usage !== undefined
    
    if (hasFeatures && hasUsage) {
      console.log('  ✅ Negocio ya completamente migrado')
      return { skipped: true }
    }
    
    console.log('  🔧 Agregando campos faltantes...')
  }

  // Obtener stats reales de uso
  console.log('  📊 Calculando stats de uso...')
  const usage = await getBusinessUsageStats(businessId)
  console.log(`  👥 Empleados: ${usage.employeeCount}`)
  console.log(`  📦 Productos: ${usage.productCount}`)

  // Determinar el plan (por defecto free)
  const plan = businessData.subscription?.plan || 'free'
  console.log(`  💎 Plan: ${plan}`)

  // Preparar datos de actualización
  const updates = {}

  // Solo agregar subscription si no existe
  if (!businessData.subscription) {
    updates.subscription = getDefaultSubscription(businessData.gerenteId)
    console.log('  ➕ Agregando subscription')
  }

  // Agregar/actualizar features
  updates.features = getFeaturesForPlan(plan)
  console.log('  ➕ Actualizando features')

  // Agregar/actualizar usage
  updates.usage = usage
  console.log('  ➕ Actualizando usage')

  // Aplicar actualización
  try {
    await updateDoc(doc(db, 'businesses', businessId), updates)
    console.log('  ✅ Negocio migrado exitosamente')
    return { migrated: true, businessName: businessData.nombre }
  } catch (error) {
    console.error('  ❌ Error migrando negocio:', error)
    return { error: true, businessName: businessData.nombre, errorMessage: error.message }
  }
}

/**
 * Función principal de migración
 */
async function migrateBusinessesToSubscriptions() {
  console.log('🚀 ========================================')
  console.log('🚀 MIGRACIÓN DE SUSCRIPCIONES')
  console.log('🚀 ========================================\n')
  
  console.log('📍 Paso 1: Obteniendo negocios desde Firestore...')
  
  try {
    const businessesRef = collection(db, 'businesses')
    const snapshot = await getDocs(businessesRef)
    
    const totalBusinesses = snapshot.size
    console.log(`✅ Encontrados ${totalBusinesses} negocios\n`)

    if (totalBusinesses === 0) {
      console.log('⚠️  No hay negocios para migrar')
      return
    }

    console.log('📍 Paso 2: Migrando negocios...\n')

    const results = {
      total: totalBusinesses,
      migrated: [],
      skipped: [],
      errors: []
    }

    for (const businessDoc of snapshot.docs) {
      const result = await migrateBusiness(businessDoc)
      
      if (result.migrated) {
        results.migrated.push(result.businessName)
      } else if (result.skipped) {
        results.skipped.push(businessDoc.data().nombre)
      } else if (result.error) {
        results.errors.push({
          name: result.businessName,
          error: result.errorMessage
        })
      }
    }

    // Resumen
    console.log('\n')
    console.log('🎉 ========================================')
    console.log('🎉 MIGRACIÓN COMPLETADA')
    console.log('🎉 ========================================\n')
    console.log(`📊 Total de negocios: ${results.total}`)
    console.log(`✅ Migrados: ${results.migrated.length}`)
    console.log(`⏭️  Saltados (ya migrados): ${results.skipped.length}`)
    console.log(`❌ Errores: ${results.errors.length}`)

    if (results.migrated.length > 0) {
      console.log('\n✅ Negocios migrados:')
      results.migrated.forEach((name, index) => {
        console.log(`  ${index + 1}. ${name}`)
      })
    }

    if (results.skipped.length > 0) {
      console.log('\n⏭️  Negocios saltados:')
      results.skipped.forEach((name, index) => {
        console.log(`  ${index + 1}. ${name}`)
      })
    }

    if (results.errors.length > 0) {
      console.log('\n❌ Errores:')
      results.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error.name}: ${error.error}`)
      })
    }

    console.log('\n✨ ¡Migración finalizada!')
    console.log('📝 Verifica en Firestore que los cambios se aplicaron correctamente')
    console.log('🔄 Recarga la aplicación para ver los cambios')

    return results

  } catch (error) {
    console.error('❌ Error crítico en la migración:', error)
    throw error
  }
}

// Exportar función para uso en consola
export { migrateBusinessesToSubscriptions }

// Para uso en consola del navegador, también hacer disponible globalmente
if (typeof window !== 'undefined') {
  window.migrateBusinessesToSubscriptions = migrateBusinessesToSubscriptions
  console.log('✅ Script de migración cargado')
  console.log('📝 Para ejecutar, usa: migrateBusinessesToSubscriptions()')
}
