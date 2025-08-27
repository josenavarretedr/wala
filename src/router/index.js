import { createWebHistory, createRouter } from "vue-router"
import { useAuthStore } from "@/stores/authStore"
import { useUserStore } from "@/stores/useUserStore"
import { useBusinessStore } from "@/stores/businessStore"

// Layouts
import DefaultLayout from "@/layouts/DefaultLayout.vue"
import AuthLayout from "@/layouts/AuthLayout.vue"

const routes = [
  // Redirección inteligente basada en estado de autenticación
  {
    path: '/',
    redirect: (to) => {
      // Esta lógica se maneja en el guard, por defecto ir a login
      return '/login'
    }
  },

  // Autenticación
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/auth/Login.vue'),
        meta: { requiresGuest: true }
      },
      {
        path: '/register',
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

  // ✅ NUEVO: Dashboard general (redirige según contexto)
  {
    path: '/dashboard',
    name: 'DashboardGeneral',
    component: () => import('@/views/dashboard/DashboardRedirect.vue'),
    meta: { requiresAuth: true }
  },

  // Configuración inicial del negocio (LEGACY - mantener por compatibilidad)
  {
    path: '/setup/business/:tempId',
    name: 'BusinessSetup',
    component: () => import('@/views/business/BusinessSetup.vue'),
    meta: { requiresAuth: true, role: 'gerente' }
  },

  // Página de espera para empleados sin asignación (LEGACY)
  {
    path: '/waiting-assignment',
    name: 'WaitingAssignment',
    component: () => import('@/views/auth/WaitingAssignment.vue'),
    meta: { requiresAuth: true, role: 'empleado' }
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
        path: 'expenses',
        name: 'ExpenseManagement',
        component: () => import('@/views/basicAccountingRecords/BasicAccountingRecordsWrapper.vue'),
        meta: { permission: 'verEgresos', title: 'Egresos' }
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

  // Rutas legacy (mantener compatibilidad)
  {
    path: '/dashboard',
    component: () => import('@/layouts/DashboardLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'DashboardRedirect',
        component: () => import('@/views/dashboard/DashboardRedirect.vue'),
      },
      {
        path: 'createNewBusiness',
        name: 'CreateNewBusiness',
        component: () => import('@/components/Business/CreateNewBusiness.vue'),
      },
      {
        path: ':idBusiness',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
      },
      {
        path: 'basicAccountingRecordsBook',
        name: 'BasicAccountingRecordsBook',
        component: () => import('@/views/basicAccountingRecords/BasicAccountingRecordsWrapper.vue'),
      },
      {
        path: 'basicAccountingRecordsBook/:registerId',
        name: 'DetailsRecords',
        component: () => import('@/views/basicAccountingRecords/RecordsDetails.vue'),
      },
      {
        path: 'cashClosureApp',
        children: [
          {
            path: '',
            name: 'CashClosureApp',
            component: () => import('@/views/cashClosureApp/CashClosureApp.vue'),
          },
          {
            path: ':cashClosureId',
            name: 'CashClosureDetails',
            component: () => import('@/views/cashClosureApp/CashClosureDetails.vue'),
          },
          {
            path: 'all',
            name: 'CashClosureAll',
            component: () => import('@/views/cashClosureApp/MonthlyCashCalendarWrapper.vue'),
          }
        ]
      },
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

  // Home (legacy)
  {
    path: '/home',
    component: DefaultLayout,
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import("@/views/Home.vue")
      },
    ],
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

  console.log('🔄 Navegando a:', to.path)
  console.log('🔑 Usuario actual:', authStore.user?.email || 'No autenticado')

  // ✅ CRÍTICO: Inicializar autenticación antes de aplicar guards
  if (!authStore.user) {
    await authStore.restoreSession()
  }

  // Rutas que requieren autenticación
  if (to.meta.requiresAuth && !authStore.user) {
    console.log('❌ Acceso denegado - Se requiere autenticación')
    return next('/login')
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

    // Establecer el negocio activo en UserStore si no lo está
    if (userStore.currentBusiness?.businessId !== businessId) {
      console.log('🔄 Estableciendo negocio activo en UserStore:', businessId)
      await userStore.setCurrentBusiness(businessId)
    }

    // Cargar datos completos del negocio en BusinessStore si no está cargado
    if (businessStore.business?.id !== businessId) {
      console.log('🔄 Cargando datos completos del negocio en BusinessStore:', businessId)
      await businessStore.loadBusiness(businessId, userBusiness)
    }

    // Verificar permisos específicos usando BusinessStore
    if (to.meta.permission) {
      const hasPermission = businessStore.hasPermission(to.meta.permission)
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
    document.title = `${to.meta.title} - Wala Business`
  } else {
    document.title = 'Wala Business'
  }

  console.log('✅ Acceso permitido a:', to.path)
  next()
})

export default router
