/**
 * Onboarding WALA – Racha diaria (Aperturar → Registrar → Cerrar)
 * ✨ Con iconos dinámicos de @iconoir/vue
 * 🎨 Estilo coherente con componentes WALA
 */
export const dashboardConfig = {
  id: 'dashboard-tour',
  name: 'Tour del Dashboard',
  description: 'Activa tu racha diaria con WALA',
  autoStart: true,

  routeMatcher: (routePath) =>
    routePath.includes('/dashboard') ||
    (routePath.includes('/sales/') &&
      !routePath.includes('/transactions') &&
      !routePath.includes('/accounts') &&
      !routePath.includes('/clients') &&
      !routePath.includes('/inventory')),

  driverConfig: {
    animate: true,
    smoothScroll: true,
    overlayOpacity: 0.5,
    // popoverClass: 'wala-theme',  ✅ Aplicar tema personalizado
  },

  steps: [
    // 0) Bienvenida
    {
      popover: {
        title: 'Bienvenido a WALA',
        description: `
          <div style="font-size: 0.875rem; line-height: 1.625; text-align: left;">
            <img src="/logoWala2.png" alt="Logo WALA" style="width: 120px; height: 120px; margin: 0 auto 1rem auto; display: block; object-fit: contain;" />
            <p style="margin-bottom: 0.5rem; font-size: 0.875rem; color: #1f2937;">Tu <strong>copiloto empresarial</strong> que te dice si <strong>tu negocio ganó o perdió</strong>, día a día.</p>
            <p style="color: #6b7280; font-size: 0.75rem; margin-top: 0.5rem; font-weight: 400;">Te presentamos lo esencial paso a paso.</p>
          </div>
        `,
        side: 'center',
        align: 'center',
      },
      iconName: 'Rocket',
    },



    // 1) Acciones principales (racha)
    {
      element: '[data-tour="main-buttons"]',
      popover: {
        title: 'Construye el hábito',
        description: `
          <div style="font-size: 0.875rem; line-height: 1.625;">
            <p style="margin-bottom: 0.5rem;">WALA trabaja simple, por días:</p>
            <p style="margin-bottom: 0.375rem;">1. <strong>Aquí ves si el día está abierto,</strong></p>
            <p style="margin-bottom: 0.375rem;">2. <strong>Si ya registraste movimientos</strong></p>
            <p style="margin-bottom: 0.5rem;">3. <strong>Si ya cerraste el día</strong></p>
            <p style="color: #6b7280; font-size: 0.75rem; margin-top: 0.5rem; font-weight: 400;">Para saber luego cómo te fue hoy</p>
          </div>
        `,
        side: 'top',
        align: 'center',
      },
      iconName: 'FireFlame',
      iconColor: 'orange',
    },

    // 2) Resumen del día
    {
      element: '[data-tour="resumen-day"]',
      popover: {
        title: 'Resultado del día',
        description: `
          <div class="text-sm leading-relaxed">
          <p>Wala te muestra <strong>cómo te fue hoy.</strong></p>
            <p style="color: #6b7280;">Tu negocio, claro y simple.</p>
            <p style="color: #6b7280; font-size: 0.75rem; margin-top: 0.5rem; font-weight: 400;">No necesitas calcular nada, solo registrar</p>
          </div>
        `,
        side: 'top',
        align: 'start',
      },
      iconName: 'StatsDownSquare',
      iconColor: 'success',
    },



    // 3) Nuevo movimiento
    {
      element: '[data-tour="new-record-btn"]',
      popover: {
        title: 'Registra, y Wala, hace el resto',
        description: `
          <div style="font-size: 0.875rem; line-height: 1.625;">
            <p style="margin-bottom: 0.5rem;">Registra cada <strong>venta</strong>, <strong>gastos</strong> o <strong>transferencias</strong> en segundos.</p>
            <p style="color: #6b7280; font-size: 0.75rem; margin-top: 0.5rem; font-weight: 400;">Si olvidas cerrar Wala lo hace por ti.</p>
          </div>
        `,
        side: 'top',
        align: 'end',
      },
      iconName: 'DatabaseScriptPlus',
      iconColor: '#1d4ed8',
    },
    {
      popover: {
        title: '¡Listo para comenzar!',
        description: `
          <div style="font-size: 0.875rem; line-height: 1.625; text-align: center;">
            <img src="/logoWala2.png" alt="Logo WALA" style="width: 80px; height: 80px; margin: 0 auto 1rem auto; display: block; object-fit: contain;" />
            <p style="margin-bottom: 0.5rem;">Gracias por confiar en nosotros para <strong>entender tu negocio</strong> y tomar mejores decisiones, día a día.</p>
          </div>
        `,
        side: 'center',
        align: 'center',
      },
      iconName: 'Rocket',
    },
  ],
};
