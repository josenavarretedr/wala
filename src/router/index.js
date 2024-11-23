import { createWebHistory, createMemoryHistory, createRouter } from "vue-router";

import appFirebase from "@/firebaseInit";


const routes = [
  {
    path: "/",
    name: "HomeView",
    component: () => import("../views/Home.vue")
  },
  {
    path: '/login',
    name: 'LoginView',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/register',
    name: 'RegisterView',
    component: () => import('../views/Register.vue')
  },
  {
    path: '/admin',
    name: 'AdminView',
    component: () => import('../views/Admin.vue'),
    meta: { requiresAdmin: false, requiresAuth: false }
  }
];

const router = createRouter({
  history: createWebHistory(),
  // history: createMemoryHistory(),
  routes
})

// const auth = getAuth(appFirebase);

// router.beforeEach((to, from, next) => {
//   onAuthStateChanged(auth, (user) => {
//     if (to.matched.some(record => record.meta.requiresAuth)) {
//       if (user) {
//         // TODO tambien chequear si es que hay algo en el local storage
//         user.getIdTokenResult().then(idTokenResult => {
//           const isAdmin = idTokenResult.claims.admin;
//           const isFiso = idTokenResult.claims.fiso;
//           const isFinalUser = idTokenResult.claims.finalUser;

//           if (to.matched.some(record => record.meta.requiresAdmin) && !isAdmin) {
//             next('/dashboardFiso');
//           } else if (to.matched.some(record => record.meta.requiresFiso) && !isFiso) {
//             next('/dashboard');
//           } else {
//             next();
//           }
//         });
//       } else {
//         next('/login');
//       }
//     } else {
//       next();
//     }
//   });
// });

export default router