// Importaciones necesarias
import { createWebHistory, createRouter, createMemoryHistory } from "vue-router";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import AuthLayout from "@/layouts/AuthLayout.vue";
import Login from "@/pages/Login.vue";

// Firebase (opcional si necesitas autenticación más adelante)
import appFirebase from "@/firebaseInit";
// import { getAuth, onAuthStateChanged } from "firebase/auth";

// Rutas definidas
const routes = [
  // Rutas con Layout por defecto
  {
    path: '/',
    component: DefaultLayout, // Diseño por defecto
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import("@/pages/Home.vue")
      },
    ],
  },

  // Rutas de administración
  {
    path: '/admin',
    name: 'AdminView',
    component: () => import('@/views/Admin.vue'),
    meta: { requiresAdmin: true, requiresAuth: true }, // Requiere autenticación y permisos de admin
  },

  // Rutas con Layout de Autenticación
  {
    path: '/auth',
    component: AuthLayout, // Diseño para autenticación
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

  // Rutas con Layout de Dashboard

  {
    path: '/dashboard',
    component: () => import('@/layouts/DashboardLayout.vue'),
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
        component: () => import('@/components/cashClosureApp/CashClosureApp2.vue')
      }
    ]
  },


  // Página no encontrada (404)
  {
    path: '/:pathMatch(.*)*', // Maneja rutas no definidas
    name: 'NotFound',
    component: () => import("@/pages/NotFound.vue"),
  },
];

// Crear instancia de router
const router = createRouter({
  // history: createWebHistory(), // Historial con URLs limpias
  history: createMemoryHistory(), // Historial en memoria (para Netlify)
  routes,
});

// AUTENTICACIÓN Y GUARDIAS DE SEGURIDAD (DESCOMENTAR SI SE NECESITA)
// const auth = getAuth(appFirebase);

// Middleware para proteger rutas
// router.beforeEach((to, from, next) => {
//   onAuthStateChanged(auth, (user) => {
//     if (to.matched.some(record => record.meta.requiresAuth)) {
//       if (user) {
//         // Validar roles personalizados (claims) en Firebase
//         user.getIdTokenResult().then(idTokenResult => {
//           const isAdmin = idTokenResult.claims.admin;

//           // Chequeo de permisos basado en roles
//           if (to.matched.some(record => record.meta.requiresAdmin) && !isAdmin) {
//             next('/dashboard'); // Redirigir si no tiene permisos
//           } else {
//             next(); // Acceso permitido
//           }
//         });
//       } else {
//         next('/auth/login'); // Redirigir a Login si no está autenticado
//       }
//     } else {
//       next(); // Acceso libre
//     }
//   });
// });

// Exportar instancia del router
export default router;
