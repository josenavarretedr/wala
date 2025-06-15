// Importaciones necesarias
import { createWebHistory, createRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore"; // Importa el store de autenticación
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import AuthLayout from "@/layouts/AuthLayout.vue";

// Definir rutas
const routes = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import("@/pages/Home.vue")
      },
    ],
  },

  {
    path: '/admin',
    name: 'AdminView',
    component: () => import('@/views/Admin.vue'),
    meta: { requiresAuth: true },
  },

  {
    path: '/auth',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        name: 'Login',
        component: () => import('@/views/auth/Login.vue')
      },
      {
        path: 'register',
        name: 'RegisterView',
        component: () => import('@/views/auth/Register.vue')
      },
    ],
  },
  {
    path: '/dashboard',
    component: () => import('@/layouts/DashboardLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'DashboardRedirect',
        component: () => import('@/pages/DashboardRedirect.vue'),
      },

      // Creación de nuevo negocio
      {
        path: 'createNewBusiness',
        name: 'CreateNewBusiness',
        component: () => import('@/components/Business/CreateNewBusiness.vue'),
      },

      // Panel por negocio
      {
        path: ':idBusiness',
        name: 'Dashboard',
        component: () => import('@/pages/Dashboard.vue'),
      },

      // Módulo de Registro Contable
      {
        path: 'basicAccountingRecordsBook',
        component: () => import('@/pages/BasicAccountingRecordsWrapper.vue'),
        children: [
          {
            path: '',
            name: 'BasicAccountingRecordsBook',
            component: () => import('@/pages/BasicAccountingRecordsWrapper.vue'),
          },
          {
            path: ':registerId',
            name: 'DetailsRecords',
            component: () => import('@/components/HistorialRecords/DetailsRecords.vue'),
          }
        ]
      },

      // Módulo de Caja Diaria
      {
        path: 'cashClosureApp',
        component: () => import('@/components/cashClosureApp/CashClosureApp.vue'),
        children: [
          {
            path: '',
            name: 'CashClosureApp',
            component: () => import('@/components/cashClosureApp/CashClosureApp.vue'),
          },
          {
            path: ':cashClosureId',
            name: 'CashClosureDetails',
            component: () => import('@/components/cashClosureApp/CashClosureDetails.vue'),
          },
          {
            path: 'all',
            name: 'CashClosureAll',
            component: () => import('@/pages/MonthlyCashCalendarWrapper.vue'),
          }
        ]
      },

      // Vista Wizard para Caja (Apertura o Cierre)
      {
        path: 'caja',
        name: 'CajaDiaria',
        component: () => import('@/components/cashClosureApp/CajaDiaria.vue'),
        props: route => ({ type: route.query.type || 'closure' })
      }
    ]
  },

  // Ruta para la página NO encontrada
  // Debe ser la última ruta definida
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import("@/pages/NotFound.vue"),
  },
];

// Crear instancia de router
const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // Verificar si la ruta requiere autenticación
  if (to.matched.some(record => record.meta.requiresAuth)) {
    console.log('Se requiere autenticación');

    try {
      await authStore.checkUser(); // Verificar el usuario actual
      const currentUser = authStore.user.value;

      if (!currentUser) {
        console.log('Usuario no autenticado');
        next({ name: 'Login' });
      } else {
        console.log('Usuario autenticado:', currentUser);
        next();
      }
    } catch (error) {
      console.error('Error al verificar el usuario:', error);
      next({ name: 'Login' });
    }
  } else {
    next();
  }
});

export default router;
