// Script para crear datos de prueba del sistema multi-negocio
// Ejecutar en la consola del navegador cuando esté autenticado

import { collection, doc, setDoc, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebaseInit'
import { v4 as uuidv4 } from 'uuid'

/**
 * Crear datos de prueba para el sistema multi-negocio
 * IMPORTANTE: Ejecutar solo en desarrollo
 */
export async function createDemoData() {
  const DEMO_USER_ID = "demo-user-123" // Reemplazar con el UID real del usuario

  try {
    console.log("🚀 Creando datos de prueba para sistema multi-negocio...")

    // 1. Crear perfil de usuario demo
    const userProfile = {
      uid: DEMO_USER_ID,
      email: "demo@walla.app",
      nombre: "Demo",
      apellidos: "Usuario",
      fechaRegistro: serverTimestamp(),
      activo: true,
      configuracion: {
        theme: "light",
        notifications: true
      }
    }

    await setDoc(doc(db, 'users', DEMO_USER_ID), userProfile)
    console.log("✅ Perfil de usuario creado")

    // 2. Crear negocios de ejemplo
    const businesses = [
      {
        id: `RESTAURANTE-${uuidv4().slice(0, 8).toUpperCase()}`,
        nombre: "Restaurante El Buen Sabor",
        tipo: "restaurante",
        descripcion: "Comida tradicional mexicana",
        direccion: "Av. Principal 123",
        telefono: "+52-555-123-4567"
      },
      {
        id: `TIENDA-${uuidv4().slice(0, 8).toUpperCase()}`,
        nombre: "Tienda La Esquina",
        tipo: "tienda",
        descripcion: "Abarrotes y productos básicos",
        direccion: "Calle Secundaria 456",
        telefono: "+52-555-765-4321"
      },
      {
        id: `CONSULTORIO-${uuidv4().slice(0, 8).toUpperCase()}`,
        nombre: "Consultorio Dental Smile",
        tipo: "servicios",
        descripcion: "Servicios dentales profesionales",
        direccion: "Plaza Medical 789",
        telefono: "+52-555-987-6543"
      }
    ]

    // Crear documentos de negocios
    for (const business of businesses) {
      const businessData = {
        ...business,
        gerenteId: DEMO_USER_ID,
        fechaCreacion: serverTimestamp(),
        activo: true,
        configuracion: {
          moneda: "MXN",
          zona_horaria: "America/Mexico_City",
          formato_fecha: "DD/MM/YYYY"
        }
      }

      await setDoc(doc(db, 'businesses', business.id), businessData)
      console.log(`✅ Negocio creado: ${business.nombre}`)
    }

    // 3. Crear relaciones usuario-negocio
    const userBusinesses = [
      {
        businessId: businesses[0].id,
        businessName: businesses[0].nombre,
        rol: "gerente",
        permissions: {
          verIngresos: true,
          verEgresos: true,
          crearMovimientos: true,
          editarMovimientos: true,
          verReportes: true,
          gestionarEmpleados: true,
          configurarNegocio: true
        },
        departamento: "Administración",
        fechaIngreso: serverTimestamp(),
        activo: true,
        esPrincipal: true,
        estadoInvitacion: "aceptada"
      },
      {
        businessId: businesses[1].id,
        businessName: businesses[1].nombre,
        rol: "gerente",
        permissions: {
          verIngresos: true,
          verEgresos: true,
          crearMovimientos: true,
          editarMovimientos: true,
          verReportes: true,
          gestionarEmpleados: true,
          configurarNegocio: true
        },
        departamento: "Administración",
        fechaIngreso: serverTimestamp(),
        activo: true,
        esPrincipal: false,
        estadoInvitacion: "aceptada"
      },
      {
        businessId: businesses[2].id,
        businessName: businesses[2].nombre,
        rol: "empleado",
        permissions: {
          verIngresos: true,
          verEgresos: false,
          crearMovimientos: true,
          editarMovimientos: false,
          verReportes: false,
          gestionarEmpleados: false,
          configurarNegocio: false
        },
        departamento: "Recepción",
        fechaIngreso: serverTimestamp(),
        activo: true,
        esPrincipal: false,
        estadoInvitacion: "aceptada"
      }
    ]

    // Crear subcollection de businesses para el usuario
    for (const userBusiness of userBusinesses) {
      await addDoc(
        collection(db, 'users', DEMO_USER_ID, 'businesses'),
        userBusiness
      )
      console.log(`✅ Relación usuario-negocio creada: ${userBusiness.businessName} (${userBusiness.rol})`)
    }

    // 4. Crear algunos movimientos de ejemplo para cada negocio
    const sampleTransactions = [
      // Restaurante
      {
        businessId: businesses[0].id,
        tipo: "ingreso",
        monto: 1500,
        descripcion: "Ventas del día",
        categoria: "ventas",
        fecha: serverTimestamp(),
        metodoPago: "efectivo"
      },
      {
        businessId: businesses[0].id,
        tipo: "egreso",
        monto: 300,
        descripcion: "Compra de ingredientes",
        categoria: "inventario",
        fecha: serverTimestamp(),
        metodoPago: "transferencia"
      },
      // Tienda
      {
        businessId: businesses[1].id,
        tipo: "ingreso",
        monto: 800,
        descripcion: "Ventas de abarrotes",
        categoria: "ventas",
        fecha: serverTimestamp(),
        metodoPago: "efectivo"
      },
      // Consultorio
      {
        businessId: businesses[2].id,
        tipo: "ingreso",
        monto: 2000,
        descripcion: "Consulta dental",
        categoria: "servicios",
        fecha: serverTimestamp(),
        metodoPago: "tarjeta"
      }
    ]

    for (const transaction of sampleTransactions) {
      await addDoc(collection(db, 'transactions'), {
        ...transaction,
        creadoPor: DEMO_USER_ID,
        fechaCreacion: serverTimestamp()
      })
    }

    console.log("✅ Transacciones de ejemplo creadas")

    console.log(`
🎉 ¡DATOS DE PRUEBA CREADOS EXITOSAMENTE!

📊 Resumen:
- 1 usuario demo: ${userProfile.email}
- 3 negocios: ${businesses.map(b => b.nombre).join(', ')}
- 3 relaciones usuario-negocio (2 como gerente, 1 como empleado)
- 4 transacciones de ejemplo

🔐 Para probar:
1. Hacer login con: ${userProfile.email}
2. El sistema debería mostrar selector de 3 negocios
3. Cada negocio tendrá permisos diferentes según el rol

⚠️  IMPORTANTE: 
- Cambiar DEMO_USER_ID por el UID real del usuario autenticado
- Solo ejecutar en ambiente de desarrollo
- Los datos se crearán en Firebase inmediatamente
    `)

  } catch (error) {
    console.error("❌ Error creando datos de prueba:", error)
    throw error
  }
}

// Para usar desde la consola del navegador:
// await createDemoData()

// Función auxiliar para limpiar datos de prueba
export async function cleanDemoData() {
  const DEMO_USER_ID = "demo-user-123" // Mismo ID usado arriba

  console.log("🧹 Limpiando datos de prueba...")

  try {
    // Nota: Esta función requiere implementación adicional
    // para eliminar documentos y subcollections
    console.log("⚠️  Función de limpieza pendiente de implementar")
    console.log("💡 Por ahora, eliminar manualmente desde Firebase Console")
  } catch (error) {
    console.error("❌ Error limpiando datos:", error)
  }
}

// Datos demo legacy (mantenidos por compatibilidad)
const demoUsers = [
  {
    uid: 'demo-gerente-001',
    email: 'demo@walla.app',
    nombre: 'Carlos',
    apellidos: 'Pérez',
    rol: 'gerente',
    businessId: null, // Se asignará después de crear el negocio
    businessName: 'Restaurante Demo',
    tipoNegocio: 'restaurante',
    departamento: 'Administración',
    fechaIngreso: new Date('2024-01-01'),
    permissions: {},
    activo: true
  },
  {
    uid: 'demo-empleado-001',
    email: 'empleado1@demo.com',
    nombre: 'María',
    apellidos: 'González',
    rol: 'empleado',
    businessId: 'RESTAURANTE-DEMO001',
    businessName: 'Restaurante Demo',
    tipoNegocio: 'restaurante',
    departamento: 'Cocina',
    fechaIngreso: new Date('2024-02-01'),
    permissions: {
      verIngresos: true,
      verEgresos: true,
      crearMovimientos: true,
      editarMovimientos: false,
      verReportes: false
    },
    activo: true
  },
  {
    uid: 'demo-empleado-002',
    email: 'empleado2@demo.com',
    nombre: 'Juan',
    apellidos: 'Rodríguez',
    rol: 'empleado',
    businessId: null, // Sin asignar - para probar flujo de espera
    businessName: '',
    tipoNegocio: '',
    departamento: '',
    fechaIngreso: new Date('2024-03-01'),
    permissions: {},
    activo: true
  }
]

// Datos demo para negocios
const demoBusinesses = [
  {
    id: 'RESTAURANTE-DEMO001',
    nombre: 'Restaurante Demo',
    tipo: 'restaurante',
    direccion: 'Av. Demo 123, Lima, Perú',
    telefono: '+51 999 888 777',
    email: 'contacto@restaurantedemo.com',
    gerenteId: 'demo-gerente-001',
    fechaCreacion: new Date('2024-01-01'),
    activo: true,
    configuracion: {
      moneda: 'PEN',
      timezone: 'America/Lima',
      permisos: {
        empleados: {
          verIngresos: true,
          verEgresos: true,
          crearMovimientos: true,
          editarMovimientos: false,
          verReportes: false
        }
      }
    }
  }
]

// Función para crear datos demo
export const createDemoData = async () => {
  console.log('🚀 Creando datos demo...')

  try {
    // Crear negocios demo
    for (const business of demoBusinesses) {
      const businessDocRef = doc(db, 'businesses', business.id)
      await setDoc(businessDocRef, business)
      console.log(`✅ Negocio creado: ${business.nombre}`)
    }

    // Actualizar usuarios con businessId correcto
    demoUsers[0].businessId = 'RESTAURANTE-DEMO001' // Gerente

    // Crear usuarios demo
    for (const user of demoUsers) {
      const userDocRef = doc(db, 'users', user.uid)
      await setDoc(userDocRef, user)
      console.log(`✅ Usuario creado: ${user.email}`)
    }

    console.log('🎉 Datos demo creados exitosamente!')
    console.log('')
    console.log('👥 Usuarios creados:')
    console.log('📧 Gerente: demo@walla.app / Demo123!')
    console.log('📧 Empleado 1: empleado1@demo.com / Demo123!')
    console.log('📧 Empleado 2: empleado2@demo.com / Demo123! (sin asignar)')
    console.log('')
    console.log('🏢 Negocios creados:')
    console.log('🍽️ Restaurante Demo (ID: RESTAURANTE-DEMO001)')

  } catch (error) {
    console.error('❌ Error al crear datos demo:', error)
  }
}

// Ejecutar si este archivo es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  createDemoData()
}
