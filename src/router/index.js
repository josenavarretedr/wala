import { createWebHistory, createRouter } from "vue-router"
import { useAuthStore } from "@/stores/authStore"
import { useUserStore } from "@/stores/useUserStore"
import { useBusinessStore } from "@/stores/businessStore"
import { useAppLoader } from "@/composables/useAppLoader"

// Layouts
import DefaultLayout from "@/layouts/DefaultLayout.vue"
import AuthLayout from "@/layouts/AuthLayout.vue"

const routes = [
  // Redirección inteligente basada en estado de autenticación
  {
    path: '/',
    name: "Home",
    component: () => import('@/views/Home.vue')
  },

  // Autenticación
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        name: 'Login',
        component: () => import('@/views/auth/Login.vue'),
        meta: { requiresGuest: true }
      },
      {
        path: 'register',
        name: 'Register',
        component: () => import('@/views/auth/Register.vue'),
        meta: { requiresGuest: true }
      }
    ]
  },

  // Rutas legales (públicas)
  {
    path: '/legal',
    children: [
      {
        path: 'terminos-condiciones',
        name: 'TerminosCondiciones',
        component: () => import('@/views/legal/TerminosCondiciones.vue'),
        meta: { title: 'Términos y Condiciones' }
      },
      {
        path: 'politica-privacidad',
        name: 'PoliticaPrivacidad',
        component: () => import('@/views/legal/PoliticaPrivacidad.vue'),
        meta: { title: 'Política de Privacidad' }
      }
    ]
  },

  // Layout principal para rutas autenticadas (incluye onboarding y selector)
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      // ✅ Onboarding para usuarios sin negocios
      {
        path: 'onboarding',
        name: 'BusinessOnboarding',
        component: () => import('@/views/onboarding/BusinessOnboarding.vue'),
        meta: { title: 'Onboarding' }
      },

      // ✅ Selector de negocios para usuarios multi-negocio
      {
        path: 'select-business',
        name: 'BusinessSelector',
        component: () => import('@/views/business/BusinessSelector.vue'),
        meta: { title: 'Seleccionar Negocio' }
      },
    ]
  },

  // Dashboard principal del negocio
  {
    path: '/business/:businessId',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      // Dashboard principal
      {
        path: 'dashboard',
        name: 'BusinessDashboard',
        component: () => import('@/views/dashboard/DashboardRedirect.vue'),
        meta: { title: 'Dashboard' }
      },

      {
        path: 'basicAccountingRecordsBook',
        name: 'BasicAccountingRecordsBook',
        component: () => import('@/views/basicAccountingRecords/BasicAccountingRecordsWrapper.vue'),
      },

      // Rutas para gerentes
      {
        path: 'business-info',
        name: 'BusinessInfo',
        component: () => import('@/views/business/BusinessInfo.vue'),
        meta: { title: 'Datos del Negocio' }
      },

      // ✅ NUEVO: Ruta de planes y suscripciones
      {
        path: 'plans',
        name: 'BusinessPlans',
        component: () => import('@/views/Plans/PlansView.vue'),
        meta: { title: 'Planes y Suscripciones' }
      },

      // Rutas de transacciones
      {
        path: 'income',
        name: 'IncomeManagement',
        component: () => import('@/views/basicAccountingRecords/BasicAccountingRecordsWrapper.vue'),
        meta: { permission: 'verIngresos', title: 'Ingresos' }
      },
      {
        path: 'transfers',
        name: 'TransferManagement',
        component: () => import('@/views/basicAccountingRecords/BasicAccountingRecordsWrapper.vue'),
        meta: { permission: 'verTransferencias', title: 'Transferencias' }
      },

      // Rutas de reportes
      {
        path: 'reports',
        name: 'Reports',
        component: () => import('@/views/basicAccountingRecords/BasicAccountingRecordsWrapper.vue'),
        meta: { permission: 'verReportes', title: 'Reportes' }
      },
      {
        path: 'reports/financial',
        name: 'FinancialReports',
        component: () => import('@/views/basicAccountingRecords/BasicAccountingRecordsWrapper.vue'),
        meta: { permission: 'verReportes', title: 'Estado Financiero' }
      },
      {
        path: 'reports/cash-flow',
        name: 'CashFlowReports',
        component: () => import('@/views/basicAccountingRecords/BasicAccountingRecordsWrapper.vue'),
        meta: { permission: 'verReportes', title: 'Análisis de Flujo' }
      },
      {
        path: 'reports/monthly',
        name: 'MonthlyReports',
        component: () => import('@/views/basicAccountingRecords/BasicAccountingRecordsWrapper.vue'),
        meta: { permission: 'verReportes', title: 'Resumen Mensual' }
      },

      // Rutas de detalles de registros
      {
        path: 'records/:registerId',
        name: 'DetailsRecords',
        component: () => import('@/views/basicAccountingRecords/RecordsDetails.vue'),
        meta: { permission: 'verReportes', title: 'Detalle de Registro' }
      },
      {
        path: 'records/all',
        name: 'AllRecords',
        component: () => import('@/views/basicAccountingRecords/AllRecordsWrapper.vue'),
        meta: { permission: 'verReportes', title: 'Todos los Registros' }
      },

      {
        path: 'accounts-balance',
        name: 'AccountBalanceApp',
        component: () => import('@/views/AccountsBalanceApp/AccountBalanceAppWrapper.vue'),
      },

      // ✅ NUEVO: Cuentas por Cobrar
      {
        path: 'accounts-receivable',
        name: 'AccountsReceivable',
        component: () => import('@/views/AccountsReceivable.vue'),
        meta: { requiresAuth: true, title: 'Cuentas por Cobrar' }
      },

      // ✅ NUEVO: Cotizaciones
      {
        path: 'quotes',
        name: 'Quotes',
        component: () => import('@/views/Quotes.vue'),
        meta: { requiresAuth: true, title: 'Cotizaciones' }
      },
      {
        path: 'quotes/:quoteId',
        name: 'QuoteDetails',
        component: () => import('@/components/HistorialRecords/Details/QuoteDetails.vue'),
        meta: { requiresAuth: true, title: 'Detalle de Cotización' }
      },

      // ✨ NUEVO: Premium
      {
        path: 'premium',
        name: 'Premium',
        component: () => import('@/views/business/Premium.vue'),
        meta: {
          requiresAuth: true,
          title: 'WALA Premium'
        }
      },

      // ✨ NUEVO: Módulo Juntos (Programas)
      {
        path: 'programs',
        name: 'ProgramsHub',
        component: () => import('@/views/business/programs/ProgramsHub.vue'),
        meta: {
          requiresAuth: true,
          title: 'Juntos - Programas'
        }
      },
      {
        path: 'programs/create',
        name: 'CreateProgram',
        component: () => import('@/views/business/programs/CreateProgram.vue'),
        meta: {
          requiresAuth: true,
          role: 'gerente',
          title: 'Crear Programa'
        }
      },
      {
        path: 'programs/:programId',
        name: 'ProgramDashboard',
        component: () => import('@/views/business/programs/ProgramDashboard.vue'),
        meta: {
          requiresAuth: true,
          title: 'Detalle de Programa'
        }
      },
      {
        path: 'programs/:programId/info',
        name: 'program-info',
        component: () => import('@/views/business/programs/ProgramInfo.vue'),
        meta: {
          requiresAuth: true,
          title: 'Información del Programa'
        }
      },
      {
        path: 'programs/:programId/session-participation/:activityId',
        name: 'session-participation',
        component: () => import('@/views/business/programs/SessionParticipation.vue'),
        meta: {
          requiresAuth: true,
          title: 'Detalle de Sesión'
        }
      },
      {
        path: 'programs/:programId/consulting-participation/:activityId',
        name: 'consulting-participation',
        component: () => import('@/views/business/programs/ConsultingParticipation.vue'),
        meta: {
          requiresAuth: true,
          title: 'Detalle de Asesoría'
        }
      },
      // Backward compatibility route
      {
        path: 'programs/:programId/monitoring-participation/:activityId',
        name: 'monitoring-participation',
        component: () => import('@/views/business/programs/ConsultingParticipation.vue'),
        meta: {
          requiresAuth: true,
          title: 'Detalle de Asesoría'
        }
      },
      {
        path: 'programs/:programId/event-participation/:activityId',
        name: 'event-participation',
        component: () => import('@/views/business/programs/EventParticipation.vue'),
        meta: {
          requiresAuth: true,
          title: 'Detalle de Evento'
        }
      },

      // Ruta para testing del sistema de trazabilidad (solo para desarrollo)
      {
        path: 'testing/traceability',
        name: 'TraceabilityTesting',
        component: () => import('@/views/TraceabilityTesting.vue'),
        meta: { role: 'gerente', title: 'Testing de Trazabilidad' }
      },
      // ✅ NUEVO: Ruta para testing del sistema de suscripciones
      {
        path: 'testing/subscription',
        name: 'SubscriptionTesting',
        component: () => import('@/views/Testing/SubscriptionTest.vue'),
        meta: { title: 'Testing de Suscripciones' }
      },
      {
        path: 'inventory',
        name: 'InventoryDashboard',
        component: () => import('@/views/Inventory/InventoryDashboard.vue')
      },
      {
        path: 'inventory/product/new',
        name: 'InventoryAddProduct',
        component: () => import('@/views/Inventory/AddProduct.vue')
      }
      ,
      {
        path: 'inventory/product/:productId',
        name: 'InventoryProductDetails',
        component: () => import('@/views/Inventory/ProductDetails.vue')
      },
      {
        path: 'inventory/product/:productId/edit-general-info',
        name: 'InventoryEditProductGeneralInfo',
        component: () => import('@/views/Inventory/EditProductGeneralInfo.vue')
      },
      {
        path: 'inventory/product/:productId/edit-composition',
        name: 'InventoryEditProductComposition',
        component: () => import('@/views/ProductCosting/CostsMaterials.vue')
      },
      {
        path: 'inventory/product/:productId/edit-economic-info',
        name: 'InventoryEditProductEconomicInfo',
        component: () => import('@/views/Inventory/EditProductEconomicInfo.vue')
      },
      {
        path: 'inventory/product/:productId/costing',
        name: 'InventoryProductCosting',
        component: () => import('@/views/ProductCosting/ProductCosting.vue')
      },
      {
        path: 'inventory/product/:productId/costing/costs-materials',
        name: 'CostsMaterials',
        component: () => import('@/views/ProductCosting/CostsMaterials.vue')
      },
      {
        path: 'inventory/product/:productId/costing/costs-mod',
        name: 'CostsMOD',
        component: () => import('@/views/ProductCosting/CostsMOD.vue')
      },
      {
        path: 'inventory/product/:productId/costing/costs-cif',
        name: 'CostsCIF',
        component: () => import('@/views/ProductCosting/CostsCIF.vue')
      },
      {
        path: 'inventory/product/:productId/costing/costs-overhead',
        name: 'CostsOverhead',
        component: () => import('@/views/ProductCosting/CostsOverhead.vue')
      },
      {
        path: 'inventory/product/:productId/add-stock',
        name: 'AddStock',
        component: () => import('@/views/Inventory/AddStock.vue')
      },
      {
        path: 'inventory/product/:productId/remove-stock',
        name: 'RemoveStock',
        component: () => import('@/views/Inventory/RemoveStock.vue')
      },
      {
        path: 'inventory/product/:productId/count',
        name: 'InventoryCount',
        component: () => import('@/views/Inventory/InventoryCount.vue')
      },

      // ✅ NUEVO: Rutas de Clientes
      {
        path: 'clients',
        name: 'ClientsDashboard',
        component: () => import('@/views/Clients/ClientsDashboard.vue'),
        meta: { title: 'Clientes' }
      },
      {
        path: 'clients/:clientId',
        name: 'ClientDetails',
        component: () => import('@/views/Clients/ClientDetails.vue'),
        meta: { title: 'Detalle del Cliente' }
      },

      // {
      //   path: 'records/:registerId',
      //   name: 'DetailsRecords',
      //   component: () => import('@/views/basicAccountingRecords/RecordsDetails.vue'),
      //   meta: { permission: 'verReportes', title: 'Detalle de Registro' }
      // },
      {
        path: 'sales',
        name: 'SalesView',
        component: () => import('@/views/Sales/SalesView.vue'),
      },
      {
        path: 'expenses',
        name: 'ExpensesView',
        component: () => import('@/views/Expenses/ExpensesView.vue'),
      },
      {
        path: 'streak',
        name: 'StreakView',
        component: () => import('@/views/StreakView.vue'),
      }
    ]
  },

  // Rutas de perfil y cuenta (fuera del negocio específico)
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/profile/Profile.vue'),
    meta: { requiresAuth: true, title: 'Mi Perfil' }
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: () => import('@/views/profile/Notifications.vue'),
    meta: { requiresAuth: true, title: 'Notificaciones' }
  },
  {
    path: '/security',
    name: 'Security',
    component: () => import('@/views/profile/Security.vue'),
    meta: { requiresAuth: true, title: 'Seguridad' }
  },

  // ═════════════════════════════════════════════════════════════
  // 🎬 RUTAS DE GESTIÓN DE GUIONES (Marketing)
  // ═════════════════════════════════════════════════════════════

  {
    path: '/guiones',
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'GuionesLanding',
        component: () => import('@/views/guiones/GuionesLanding.vue'),
        meta: { title: 'Gestión de Guiones' }
      },
      {
        path: 'crear',
        name: 'CrearGuion',
        component: () => import('@/views/guiones/CrearGuion.vue'),
        meta: { title: 'Crear Guiones' }
      },
      {
        path: 'dashboard',
        name: 'DashboardGuiones',
        component: () => import('@/views/guiones/DashboardGuiones.vue'),
        meta: { title: 'Dashboard de Guiones' }
      },
      {
        path: 'dashboard/:videoId',
        name: 'DetalleVideo',
        component: () => import('@/views/guiones/DetalleVideo.vue'),
        meta: { title: 'Detalle de Video' }
      }
    ]
  },

  // ═════════════════════════════════════════════════════════════
  // 👨‍💼 RUTAS PARA FACILITADORES/CONSULTORES
  // ═════════════════════════════════════════════════════════════

  // Hub principal de programas para facilitadores
  {
    path: '/programs',
    component: () => import('@/layouts/FacilitatorLayout.vue'),
    meta: {
      requiresAuth: true,
      requiresFacilitatorRole: true
    },
    children: [
      {
        path: '',
        name: 'FacilitatorProgramsHub',
        component: () => import('@/views/facilitator/ProgramsHub.vue'),
        meta: {
          title: 'Mis Programas - Facilitador'
        }
      },
      {
        path: ':programId',
        name: 'FacilitatorProgramDetail',
        component: () => import('@/views/facilitator/ProgramDetail.vue'),
        meta: {
          title: 'Programa - Facilitador'
        }
      },
      {
        path: ':programId/info',
        name: 'ProgramInfo',
        component: () => import('@/views/facilitator/ProgramInfo.vue'),
        meta: {
          title: 'Información del Programa'
        }
      },
      {
        path: ':programId/activities',
        name: 'ProgramActivities',
        component: () => import('@/views/facilitator/ProgramActivities.vue'),
        meta: {
          title: 'Actividades del Programa'
        }
      },
      {
        path: ':programId/activities/:activityId',
        name: 'ActivityDetail',
        component: () => import('@/views/facilitator/ActivityDetail.vue'),
        meta: {
          title: 'Detalle de Actividad'
        }
      },
      {
        path: ':programId/activities/:activityId/participations/:participationId',
        name: 'ParticipationDetail',
        component: () => import('@/views/facilitator/ParticipationDetail.vue'),
        meta: {
          title: 'Detalle de Monitoreo'
        }
      },
      {
        path: ':programId/participants',
        name: 'ProgramParticipants',
        component: () => import('@/views/facilitator/ProgramParticipants.vue'),
        meta: {
          title: 'Participantes del Programa'
        }
      },
      {
        path: ':programId/reports',
        name: 'ProgramReports',
        component: () => import('@/views/facilitator/ProgramReports.vue'),
        meta: {
          title: 'Reportes del Programa'
        }
      }
    ]
  },

  // Página de acceso no autorizado
  {
    path: '/unauthorized',
    name: 'Unauthorized',
    component: () => import('@/views/NotFound.vue'),
  },

  // Admin
  {
    path: '/admin',
    name: 'AdminView',
    component: () => import('@/views/Admin.vue'),
    meta: { requiresAuth: true },
  },

  // 404 - Debe ser la última ruta
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import("@/views/NotFound.vue"),
  },
]

// Crear instancia de router
const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Router Guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const userStore = useUserStore()
  const businessStore = useBusinessStore()
  const loader = useAppLoader()

  console.log('🔄 Navegando a:', to.path)
  console.log('🔑 Usuario actual:', authStore.user?.email || 'No autenticado')

  // 🔄 Si es la primera navegación (from.name === undefined) y va a una ruta de negocio
  const isInitialNavigation = !from.name
  const isBusinessRoute = to.params.businessId && to.meta.requiresAuth

  console.log('📊 isInitialNavigation:', isInitialNavigation)
  console.log('📊 isBusinessRoute:', isBusinessRoute)

  // Mostrar loader en la primera carga si va a cargar un negocio
  if (isInitialNavigation && isBusinessRoute) {
    console.log('📍 Router: Mostrando loader (navegación inicial a negocio)')
    loader.show()
  }

  // ✅ CRÍTICO: Inicializar autenticación antes de aplicar guards
  if (!authStore.user) {
    await authStore.restoreSession()
  }

  // Rutas que requieren autenticación
  if (to.meta.requiresAuth && !authStore.user) {
    console.log('❌ Acceso denegado - Se requiere autenticación')
    loader.hide() // Ocultar loader si hay error
    return next('/auth/login')
  }

  // Verificar rol de facilitador para rutas específicas
  if (to.meta.requiresFacilitatorRole && authStore.user) {
    // Cargar perfil del usuario si no está cargado
    if (!userStore.userProfile) {
      await userStore.loadUserProfile(authStore.user.uid)
    }

    const userRole = userStore.userProfile?.rol

    if (userRole !== 'facilitator') {
      console.log('❌ Acceso denegado - Se requiere rol de facilitador')
      console.log('👤 Rol del usuario:', userRole)

      // Redirigir según el rol actual
      if (userRole === 'business_owner') {
        return next('/select-business')
      } else {
        return next('/unauthorized')
      }
    }

    console.log('✅ Usuario tiene rol de facilitador')
  }

  // Si el usuario está autenticado y va a rutas de invitado
  if (to.meta.requiresGuest && authStore.user) {
    console.log('🔄 Usuario ya autenticado, redirigiendo...')

    // Cargar perfil del usuario si no está cargado
    if (!userStore.userProfile) {
      await userStore.loadUserProfile(authStore.user.uid)
    }

    const userRole = userStore.userProfile?.rol

    // Si es facilitador, redirigir a /programs
    if (userRole === 'facilitator') {
      console.log('🔄 Usuario facilitador, redirigiendo a /programs')
      return next('/programs')
    }

    // Para business owners: cargar negocios
    if (!userStore.userBusinesses || userStore.userBusinesses.length === 0) {
      await userStore.loadUserBusinesses(authStore.user.uid)
    }

    // Lógica de redirección inteligente para business owners
    if (userStore.userBusinesses.length === 0) {
      return next('/onboarding')
    } else if (userStore.userBusinesses.length === 1) {
      const business = userStore.userBusinesses[0]
      return next(`/business/${business.businessId}/dashboard`)
    } else {
      return next('/select-business')
    }
  }

  // Si está accediendo a una ruta de negocio específico
  if (to.params.businessId && authStore.user) {
    const businessId = to.params.businessId

    // Cargar negocios del usuario si no están cargados
    if (!userStore.userBusinesses || userStore.userBusinesses.length === 0) {
      await userStore.loadUserBusinesses(authStore.user.uid)
    }

    // Verificar que el usuario tiene acceso a este negocio
    const userBusiness = userStore.userBusinesses.find(b => b.businessId === businessId)

    if (!userBusiness) {
      console.log('❌ Usuario no tiene acceso al negocio:', businessId)
      return next('/select-business')
    }

    // ✅ ARQUITECTURA COHERENTE: UserStore gestiona currentBusiness, BusinessStore carga datos completos

    // SIEMPRE mostrar loader si vamos a cargar datos del negocio
    const needsToLoadBusiness = businessStore.business?.id !== businessId
    const needsToSetBusiness = userStore.currentBusiness?.businessId !== businessId

    console.log('🔍 needsToLoadBusiness:', needsToLoadBusiness, '(businessStore.business?.id:', businessStore.business?.id, 'vs', businessId, ')')
    console.log('🔍 needsToSetBusiness:', needsToSetBusiness, '(userStore.currentBusiness?.businessId:', userStore.currentBusiness?.businessId, 'vs', businessId, ')')

    if (needsToLoadBusiness || needsToSetBusiness) {
      if (!loader.isVisible.value) {
        console.log('📍 Router: Mostrando loader (va a cargar negocio)')
        loader.show()
      } else {
        console.log('⚠️ Loader ya está visible, no se muestra de nuevo')
      }
    } else {
      console.log('ℹ️ No necesita cargar nada, negocio ya está listo')
    }

    // Establecer el negocio activo en UserStore si no lo está
    if (needsToSetBusiness) {
      console.log('🔄 Estableciendo negocio activo en UserStore:', businessId)
      await userStore.setCurrentBusiness(businessId)
      console.log('✅ Negocio activo establecido')
    }

    // Cargar datos completos del negocio en BusinessStore si no está cargado
    if (needsToLoadBusiness) {
      console.log('🔄 Cargando datos completos del negocio en BusinessStore:', businessId)

      await businessStore.loadBusiness(businessId, userBusiness)
      console.log('✅ Datos del negocio cargados')

      // Ocultar loader con animación (garantiza tiempo mínimo)
      console.log('📍 Router: Llamando hide()')
      loader.hide()
    } else if (loader.isVisible.value) {
      // Si el negocio ya estaba cargado pero el loader está visible, ocultarlo
      console.log('📍 Router: Negocio ya cargado, ocultando loader')
      loader.hide()
    }

    // ==========================================
    // 🔐 NUEVO: Verificar feature requerida por ruta
    // ==========================================
    if (to.meta.requiresFeature) {
      const hasFeature = businessStore.hasFeature(to.meta.requiresFeature)

      if (!hasFeature) {
        console.log('❌ Feature no disponible:', to.meta.requiresFeature)
        console.log('🔄 Redirigiendo a página de planes...')

        // Redirigir a página de planes con el query param de la feature bloqueada
        return next({
          path: `/business/${businessId}/plans`,
          query: {
            feature: to.meta.requiresFeature,
            from: to.path
          }
        })
      } else {
        console.log('✅ Feature disponible:', to.meta.requiresFeature)
      }
    }

    // Verificar permisos específicos usando BusinessStore
    if (to.meta.permission) {

      console.log('🔍 Verificando permiso:', to.meta.permission)
      console.log('📋 Permisos actuales:', userStore.currentBusiness?.permissions)

      const hasPermission = false || userStore.hasPermission(to.meta.permission)
      if (!hasPermission) {
        console.log('❌ Sin permisos para:', to.meta.permission)
        return next(`/business/${businessId}/dashboard`)
      }
    }

    // Verificar roles específicos usando BusinessStore
    if (to.meta.role) {
      const userRole = businessStore.getCurrentUserRole
      if (userRole !== to.meta.role && userRole !== 'gerente') {
        console.log('❌ Rol insuficiente. Requerido:', to.meta.role, 'Usuario:', userRole)
        return next(`/business/${businessId}/dashboard`)
      }
    }
  }

  // Actualizar el título de la página
  if (to.meta.title) {
    document.title = `${to.meta.title} - Wala`
  } else {
    document.title = 'Wala | Copiloto para crecer'
  }

  console.log('✅ Acceso permitido a:', to.path)
  next()
})

export default router
