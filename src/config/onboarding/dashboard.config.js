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
    (routePath.includes('/business/') &&
      !routePath.includes('/transactions') &&
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
          <div style="font-size: 0.875rem; line-height: 1.625; text-align: center;">
            <img src="/logoWala2.png" alt="Logo WALA" style="width: 120px; height: 120px; margin: 0 auto 1rem auto; display: block; object-fit: contain;" />
            <p style="margin-bottom: 0.5rem;">Tu <strong>copiloto empresarial para entender tu negocio</strong> y tomar mejores decisiones, día a día.</p>
            <p style="color: #6b7280;">Te presentamos lo esencial paso a paso.</p>
          </div>
        `,
        side: 'center',
        align: 'center',
      },
      iconName: 'Rocket',
    },

    // 1) Micro Apps
    {
      element: '[data-tour="micro-apps"]',
      popover: {
        title: 'Todo en un solo lugar',
        description: `
          <div style="font-size: 0.875rem; line-height: 1.625;">
            <p style="margin-bottom: 0.5rem;">Accesos rápidos: <strong>Ventas</strong>, <strong>gastos</strong>, <strong>inventario</strong> y <strong>más</strong>.</p>
            <p style="color: #6b7280;">Enfócate en lo importante.</p>
          </div>
        `,
        side: 'bottom',
        align: 'start',
      },
      iconName: 'AppWindow',
      iconColor: 'purple',
    },

    // 2) Resumen del día
    {
      element: '[data-tour="resumen-day"]',
      popover: {
        title: 'Tu día en números',
        description: `
          <div class="text-sm leading-relaxed">
            <p>Mira <strong>ingresos</strong>, <strong>egresos</strong> y <strong>balance</strong> en <span style="color: #10b981; font-weight: 600;">tiempo real</span>.</p>
            <p style="color: #6b7280;">Tu negocio, claro y simple.</p>
          </div>
        `,
        side: 'top',
        align: 'start',
      },
      iconName: 'BarChart',
      iconColor: 'success',
    },

    // 3) Lista de transacciones
    {
      element: '[data-tour="transactions-list"]',
      popover: {
        title: 'Movimientos del día',
        description: `
          <div style="font-size: 0.875rem; line-height: 1.625;">
            <p style="margin-bottom: 0.5rem;">Aquí queda todo registrado con hora, monto y tipo.</p>
            <p>Tu negocio <strong>bajo control</strong>.</p>
          </div>
        `,
        side: 'top',
        align: 'start',
      },
      iconName: 'List',
      iconColor: 'blue',
    },

    // 4) Acciones principales (racha)
    {
      element: '[data-tour="main-buttons"]',
      popover: {
        title: 'Rutina diaria',
        description: `
          <div style="font-size: 0.875rem; line-height: 1.625;">
            <p style="margin-bottom: 0.5rem;">WALA funciona en un ciclo simple:</p>
            <p style="margin-bottom: 0.375rem;"><strong>1)</strong> <strong>Aperturar caja</strong></p>
            <p style="margin-bottom: 0.375rem;"><strong>2)</strong> <strong>Registrar movimientos</strong> <span style="color: #6b7280;">(ingresos, egresos, transferencias)</span></p>
            <p style="margin-bottom: 0.5rem;"><strong>3)</strong> <strong>Cerrar caja</strong></p>
          </div>
        `,
        side: 'top',
        align: 'center',
      },
      iconName: 'FireFlame',
      iconColor: 'orange',
    },

    // 5) Apertura / Cierre
    {
      element: '[data-tour="account-balance-btn"]',
      popover: {
        title: 'Aperturar / Cerrar',
        description: `
          <div style="font-size: 0.875rem; line-height: 1.625;">
            <p style="margin-bottom: 0.5rem;"><strong>Apertura:</strong> registra con cuánto inicias (efectivo y banco).</p>
            <p><strong>Cierre:</strong> con cuánto terminas. WALA calcula diferencias y guarda tu historial.</p>
          </div>
        `,
        side: 'top',
        align: 'start',
      },
      iconName: 'SafeOpen',
      iconColor: 'warning',
    },

    // 6) Nuevo movimiento
    {
      element: '[data-tour="new-record-btn"]',
      popover: {
        title: 'Registrar es lo más importante',
        description: `
          <div style="font-size: 0.875rem; line-height: 1.625;">
            <p style="margin-bottom: 0.5rem;">Registra <strong>ingresos</strong>, <strong>gastos</strong> o <strong>transferencias</strong> en segundos.</p>
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
