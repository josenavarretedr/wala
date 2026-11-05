import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

// Importación estática inmediata para garantizar disponibilidad 100% offline sin importar fragmentación de chunks
import LoginView from '@/views/LoginView.vue';
import DashboardView from '@/views/DashboardView.vue';
import SessionView from '@/views/SessionView.vue';
import FacilitadorLoginView from '@/views/facilitador/FacilitadorLoginView.vue';
import CohortTableView from '@/views/facilitador/CohortTableView.vue';
import {
  getCurrentFacilitator,
  waitForFacilitatorAuthReady
} from '@/services/auth/facilitatorAuth';

const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: {
      guestOnly: true,
      title: 'Iniciar Sesión | EmprendeApp'
    }
  },
  {
    path: '/facilitador/login',
    name: 'facilitator-login',
    component: FacilitadorLoginView,
    meta: {
      guestFacilitatorOnly: true,
      title: 'Acceso Facilitador | PlanSeed'
    }
  },
  {
    path: '/facilitador',
    name: 'facilitator-dashboard',
    component: CohortTableView,
    meta: {
      requiresFacilitator: true,
      title: 'Consola del Facilitador | PlanSeed'
    }
  },
  {
    path: '/',
    name: 'dashboard',
    component: DashboardView,
    meta: {
      requiresAuth: true,
      title: 'Mi Plan de Negocio | EmprendeApp'
    }
  },
  {
    path: '/sesiones/:id',
    name: 'session-detail',
    component: SessionView,
    meta: {
      requiresAuth: true,
      title: 'Módulo de Sesión | EmprendeApp'
    }
  },
  // Redirecciones pedagógicas para mantener la experiencia 100% secuencial
  {
    path: '/costeo',
    redirect: '/sesiones/6'
  },
  {
    path: '/inversion',
    redirect: '/sesiones/7'
  },
  // Redirección para cualquier ruta desconocida
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  }
});

// Guard de navegación reactivo a autenticación e hidratación
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // Asegurar que la sesión local esté hidratada desde IndexedDB
  if (!authStore.isHydrated) {
    await authStore.hydrateSession();
  }

  // Actualizar título de la ventana
  if (to.meta.title) {
    document.title = to.meta.title;
  }

  // Guardia específica para el módulo de Facilitador
  if (to.meta.requiresFacilitator) {
    const facilitator = await waitForFacilitatorAuthReady();
    if (!facilitator) {
      next({ name: 'facilitator-login', query: { redirect: to.fullPath } });
      return;
    }
    if (!facilitator.isAuthorized) {
      next({ path: '/login', query: { unauthorized: 'facilitator' } });
      return;
    }
    next();
    return;
  }

  if (to.meta.guestFacilitatorOnly) {
    const facilitator = await waitForFacilitatorAuthReady();
    if (facilitator && facilitator.isAuthorized) {
      const targetPath = to.query.redirect || '/facilitador';
      next({ path: targetPath });
      return;
    }
    next();
    return;
  }

  // Soporte para entrada contextualizada directa desde Wala ERP con ?businessId=XYZ
  if (to.query.businessId && !authStore.isAuthenticated) {
    await authStore.loginWithBusinessContext(to.query.businessId, to.query.userId);
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } });
  } else if (to.meta.guestOnly && authStore.isAuthenticated) {
    next({ name: 'dashboard' });
  } else {
    next();
  }
});

export default router;
