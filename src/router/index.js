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
        name: 'Dashboard',
        component: () => import('@/pages/Dashboard.vue'),
      },
      {
        path: 'basicAccountingRecordsBook',
        name: 'BasicAccountingRecordsBook',
        component: () => import("@/components/basicAccountingRecordsBook/AddRegister.vue")
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

// Protección de rutas
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // Verificar si la ruta requiere autenticación
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // Si el usuario no está autenticado, redirigir a la página de login
    if (!authStore.user) {
      await authStore.checkUser(); // Verificar el usuario actual
    }

    if (!authStore.user) {
      next({ name: 'Login' });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
