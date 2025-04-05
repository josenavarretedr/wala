// Importaciones necesarias
import { createWebHistory, createRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore"; // Importa el store de autenticación
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import AuthLayout from "@/layouts/AuthLayout.vue";
import Login from "@/pages/Login.vue";

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
        component: Login
      },
      {
        path: 'register',
        name: 'RegisterView',
        component: () => import('@/pages/Register.vue')
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
      {
        path: 'createNewBusiness',
        name: 'CreateNewBusiness',
        component: () => import('@/components/Business/CreateNewBusiness.vue'),
      },
      {
        path: ':idBusiness',
        name: 'Dashboard',
        component: () => import('@/pages/Dashboard.vue'),
      },
      {
        path: 'basicAccountingRecordsBook',
        name: 'BasicAccountingRecordsBook',
        component: () => import('@/pages/BasicAccountingRecordsWrapper.vue'),
      },
      {
        path: 'basicAccountingRecordsBook/:registerId',
        name: 'DetailsRecords',
        component: () => import('@/components/HistorialRecords/DetailsRecords.vue')
      },
      {
        path: 'cashClosureApp',
        name: 'CashClosureApp',
        component: () => import('@/components/cashClosureApp/CashClosureApp.vue')
      },
      {
        path: 'cashClosureApp/:cashClosureId',
        name: 'CashClosureDetails',
        component: () => import('@/components/cashClosureApp/CashClosureDetails.vue')
      },
      {
        path: 'caja',
        name: 'CajaDiaria',
        component: () => import('@/components/cashClosureApp/CajaDiaria.vue'),
        props: route => ({ type: route.query.type || 'closure' })
      }
    ]
  },

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
