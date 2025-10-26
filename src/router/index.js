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

  // ✅ NUEVO: Onboarding para usuarios sin negocios
  {
    path: '/onboarding',
    name: 'BusinessOnboarding',
    component: () => import('@/views/onboarding/BusinessOnboarding.vue'),
    meta: { requiresAuth: true }
  },

  // ✅ NUEVO: Selector de negocios para usuarios multi-negocio
  {
    path: '/select-business',
    name: 'BusinessSelector',
    component: () => import('@/views/business/BusinessSelector.vue'),
    meta: { requiresAuth: true }
  },

  // Configuración inicial del negocio (LEGACY - mantener por compatibilidad)
  {
    path: '/setup/business/:tempId',
    name: 'BusinessSetup',
    component: () => import('@/views/business/BusinessSetup.vue'),
    meta: { requiresAuth: true, role: 'gerente' }
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
        path: 'employees',
        name: 'EmployeeManagement',
        component: () => import('@/components/Business/CreateNewBusiness.vue'), // Temporal
        meta: { role: 'gerente', title: 'Empleados' }
      },
      {
        path: 'settings',
        name: 'BusinessSettings',
        component: () => import('@/components/Business/CreateNewBusiness.vue'), // Temporal
        meta: { role: 'gerente', title: 'Configuración' }
      },
      {
        path: 'business-info',
        name: 'BusinessInfo',
        component: () => import('@/components/Business/CreateNewBusiness.vue'), // Temporal
        meta: { role: 'gerente', title: 'Datos del Negocio' }
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

      // Ruta para testing del sistema de trazabilidad (solo para desarrollo)
      {
        path: 'testing/traceability',
        name: 'TraceabilityTesting',
        component: () => import('@/views/TraceabilityTesting.vue'),
        meta: { role: 'gerente', title: 'Testing de Trazabilidad' }
      },
      {
        path: 'inventory',
        name: 'InventoryDashboard',
        component: () => import('@/views/Inventory/InventoryDashboard.vue')
      },
      {
        path: 'inventory/product/:productId',
        name: 'InventoryProductDetails',
        component: () => import('@/views/Inventory/ProductDetails.vue')
      },
      {
        path: 'inventory/product/:productId/edit',
        name: 'InventoryEditProduct',
        component: () => import('@/views/Inventory/EditProduct.vue')
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

  // Si el usuario está autenticado y va a rutas de invitado
  if (to.meta.requiresGuest && authStore.user) {
    console.log('🔄 Usuario ya autenticado, redirigiendo...')

    // Cargar negocios del usuario si no están cargados
    if (!userStore.userBusinesses || userStore.userBusinesses.length === 0) {
      await userStore.loadUserBusinesses(authStore.user.uid)
    }

    // Lógica de redirección inteligente
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
