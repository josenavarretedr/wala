import { createWebHistory, createRouter } from "vue-router"
import { useAuthStore } from "@/stores/authStore"
import { useUserStore } from "@/stores/useUserStore"
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/firebaseInit'

// Layouts
import DefaultLayout from "@/layouts/DefaultLayout.vue"
import AuthLayout from "@/layouts/AuthLayout.vue"

const routes = [
  // Redirección por defecto
  {
    path: '/',
    redirect: '/login'
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
    component: () => import('@/views/business/Dashboard.vue'),
    meta: { requiresAuth: true },
    children: [
      // Dashboard principal
      {
        path: 'dashboard',
        name: 'BusinessDashboard',
        component: () => import('@/views/dashboard/DashboardRedirect.vue')
      },

      // Rutas para gerentes
      {
        path: 'employees',
        name: 'EmployeeManagement',
        component: () => import('@/components/Business/CreateNewBusiness.vue'), // Temporal
        meta: { role: 'gerente' }
      },
      {
        path: 'settings',
        name: 'BusinessSettings',
        component: () => import('@/components/Business/CreateNewBusiness.vue'), // Temporal
        meta: { role: 'gerente' }
      },

      // Rutas compartidas
      {
        path: 'income',
        name: 'IncomeManagement',
        component: () => import('@/views/basicAccountingRecords/BasicAccountingRecordsWrapper.vue'),
        meta: { permission: 'verIngresos' }
      },
      {
        path: 'expenses',
        name: 'ExpenseManagement',
        component: () => import('@/views/basicAccountingRecords/BasicAccountingRecordsWrapper.vue'),
        meta: { permission: 'verEgresos' }
      },
      {
        path: 'reports',
        name: 'Reports',
        component: () => import('@/views/basicAccountingRecords/BasicAccountingRecordsWrapper.vue'),
        meta: { permission: 'verReportes' }
      }
    ]
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

  console.log('🔄 Navegando a:', to.path)
  console.log('🔑 Autenticado:', authStore.isAuthenticated)

  // ✅ CRÍTICO: Verificar sesión real antes de aplicar guards
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    console.log('🔍 Verificando sesión real con Firebase...')

    try {
      const user = await authStore.checkUser()
      if (!user) {
        console.log('❌ No hay sesión válida, redirigiendo a login')
        return next('/login')
      }
    } catch (error) {
      console.error('❌ Error al verificar sesión:', error)
      return next('/login')
    }
  }

  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    console.log('� Usuario ya autenticado, redirigiendo...')

    // Si ya está autenticado, usar la lógica de redirección inteligente
    try {
      await userStore.loadUserProfile(authStore.user.uid)
      const userBusinesses = userStore.userBusinesses

      if (userBusinesses.length === 0) {
        return next('/onboarding')
      } else if (userBusinesses.length === 1) {
        return next(`/business/${userBusinesses[0].businessId}/dashboard`)
      } else {
        return next('/select-business')
      }
    } catch (error) {
      console.error('❌ Error al cargar datos del usuario:', error)
      return next('/onboarding')
    }
  }

  if (to.meta.role && userStore.currentBusiness?.rol !== to.meta.role) {
    console.log('❌ Acceso denegado por rol')
    return next('/unauthorized')
  }

  console.log('✅ Acceso permitido')
  next()
})

export default router
