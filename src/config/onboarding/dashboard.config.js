/**
 * Onboarding WALA – Racha diaria (Aperturar → Registrar → Cerrar)
 * HTML en descriptions + Tailwind via popoverClass / stageClass
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
    overlayOpacity: 0.4,
  },

  steps: [
    // 0) Bienvenida
    {
      popover: {
        title: '💜 Bienvenido a WALA',
        description: `
          <div class="text-sm leading-relaxed">
            <p>Tu <strong>racha diaria</strong> es el corazón de WALA: <strong>Aperturar → Registrar → Cerrar</strong>.</p>
            <p class="text-gray-600">Completa este ciclo cada día y mantén tu negocio bajo control.</p>
          </div>
        `,
        side: 'center',
        align: 'center',
      },
      popoverClass: 'max-w-[26rem] text-slate-700',
      stageClass: 'backdrop-blur-sm',
    },

    // 1) Micro Apps
    {
      element: '[data-tour="micro-apps"]',
      popover: {
        title: '📱 Todo en un solo lugar',
        description: `
          <div class="text-sm leading-relaxed">
            <p>Desde aquí accedes a <strong>ventas</strong>, <strong>gastos</strong>, <strong>inventario</strong> y <strong>reportes</strong>.</p>
            <p class="text-gray-600">Menos apps, más foco. <span class="font-medium">Tip:</span> ancla tus favoritas para llegar en 1 clic.</p>
          </div>
        `,
        side: 'bottom',
        align: 'start',
      },
      popoverClass: 'max-w-[26rem] text-slate-700',
      stageClass: 'ring-2 ring-purple-400/70 rounded-xl',
    },

    // 2) Resumen del día
    {
      element: '[data-tour="resumen-day"]',
      popover: {
        title: '📊 Tu día en números',
        description: `
          <div class="text-sm leading-relaxed">
            <p>Visualiza <strong>ingresos</strong>, <strong>egresos</strong> y <strong>balance</strong> en <span class="text-emerald-600 font-semibold">tiempo real</span>.</p>
            <p class="text-gray-600">Si el balance no cuadra, revisa movimientos o inventario.</p>
          </div>
        `,
        side: 'top',
        align: 'start',
      },
      popoverClass: 'max-w-[26rem] text-slate-700',
      stageClass: 'ring-2 ring-emerald-400/70 rounded-xl',
    },

    // 3) Lista de transacciones
    {
      element: '[data-tour="transactions-list"]',
      popover: {
        title: '🧾 Movimientos del día',
        description: `
          <div class="text-sm leading-relaxed">
            <p>Aquí queda todo con hora, monto y tipo.</p>
            <p>Puedes <strong>compartir como nota</strong> (sin ser boleta) o <strong>eliminar</strong> si te equivocaste.</p>
          </div>
        `,
        side: 'top',
        align: 'start',
      },
      popoverClass: 'max-w-[26rem] text-slate-700',
      stageClass: 'ring-2 ring-sky-400/70 rounded-xl',
    },

    // 4) Acciones principales (racha)
    {
      element: '[data-tour="main-buttons"]',
      popover: {
        title: '⚡ Acciones de racha',
        description: `
          <div class="text-sm leading-relaxed">
            <p><strong>1)</strong> <strong>Aperturar caja</strong></p>
            <p><strong>2)</strong> <strong>Registrar movimientos</strong> <span class="text-gray-500">(ingresos, egresos, transferencias)</span></p>
            <p><strong>3)</strong> <strong>Cerrar caja</strong></p>
            <hr class="my-2 border-gray-200">
            <p>Completa el ciclo y <span class="text-purple-600 font-semibold">suma a tu racha</span> 🔥</p>
          </div>
        `,
        side: 'top',
        align: 'center',
      },
      popoverClass: 'max-w-[26rem] text-slate-700',
      stageClass: 'ring-2 ring-purple-500/70 rounded-xl',
    },

    // 5) Apertura / Cierre
    {
      element: '[data-tour="account-balance-btn"]',
      popover: {
        title: '💰 Aperturar / Cerrar',
        description: `
          <div class="text-sm leading-relaxed">
            <p><strong>Apertura:</strong> registra con cuánto inicias (efectivo y banco).</p>
            <p><strong>Cierre:</strong> confirma con cuánto terminas. WALA calcula diferencias y guarda tu historial.</p>
          </div>
        `,
        side: 'top',
        align: 'start',
      },
      popoverClass: 'max-w-[26rem] text-slate-700',
      stageClass: 'ring-2 ring-amber-400/70 rounded-xl',
    },

    // 6) Nuevo movimiento
    {
      element: '[data-tour="new-record-btn"]',
      popover: {
        title: '➕ Nuevo movimiento',
        description: `
          <div class="text-sm leading-relaxed">
            <p>Registra <strong>ingresos</strong>, <strong>egresos</strong> o <strong>transferencias</strong> en segundos.</p>
            <p class="text-gray-600">Atajo: <code class="px-1 py-0.5 bg-slate-100 rounded border">N</code> abre el formulario (si está activo).</p>
          </div>
        `,
        side: 'top',
        align: 'end',
      },
      popoverClass: 'max-w-[26rem] text-slate-700',
      stageClass: 'ring-2 ring-emerald-500/70 rounded-xl',
    },

    // 7) Ayuda rápida
    {
      element: '[data-tour="quick-action"]',
      popover: {
        title: '🚀 Ayuda contextual',
        description: `
          <div class="text-sm leading-relaxed">
            <p>Repite este tour o abre guías según la vista.</p>
            <p>Si te trabas, WALA te guía con pasos claros.</p>
          </div>
        `,
        side: 'left',
        align: 'center',
      },
      popoverClass: 'max-w-[22rem] text-slate-700',
      stageClass: 'ring-2 ring-slate-400/70 rounded-xl',
    },

    // 8) Cierre del tour (CTA)
    {
      popover: {
        title: '🎯 Activa tu racha hoy',
        description: `
          <div class="text-sm leading-relaxed text-center">
            <p>Completa el ciclo <strong>Aperturar → Registrar → Cerrar</strong>.</p>
            <p class="text-gray-600">Menos caos, más claridad. ¿Listo para abrir tu día?</p>
          </div>
        `,
        side: 'center',
        align: 'center',
      },
      popoverClass: 'max-w-[26rem] text-slate-700',
      stageClass: 'backdrop-blur-sm',
    },
  ],
};
