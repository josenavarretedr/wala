<template>
  <section class="bg-slate-50 py-16 sm:py-20 px-4">
    <div class="max-w-6xl mx-auto">
      <div class="max-w-3xl mx-auto text-center space-y-3 mb-12">
        <span class="inline-block px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-medium tracking-wide">
          Estructura de la Sesión
        </span>
        <h2 class="font-display text-2xl sm:text-3xl font-bold text-slate-900">
          Qué evaluamos en tus 30 minutos de diagnóstico
        </h2>
        <p class="text-sm sm:text-base text-slate-600 leading-relaxed">
          No es una charla improvisada. Evaluamos tu comportamiento operativo real en una matriz de 7 áreas y 21 indicadores (escala 0 a 3).
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="area in areas"
          :key="area.title"
          class="bg-white border border-slate-200 rounded-xl p-5 space-y-2.5"
        >
          <div class="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
            <component :is="area.icon" class="w-4 h-4 stroke-[2]" />
          </div>
          <h3 class="font-display font-bold text-base text-slate-900">
            {{ area.title }}
          </h3>
          <p class="text-sm text-slate-600 leading-relaxed">
            {{ area.description }}
          </p>
        </div>
      </div>

      <div class="mt-12 space-y-5">
        <h3 class="font-display text-xl sm:text-2xl font-bold text-slate-900 text-center">
          Las 2 únicas salidas al terminar la llamada
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-white border border-slate-200 rounded-2xl p-6 space-y-2">
            <h4 class="font-display font-bold text-base sm:text-lg text-slate-900">
              Salida 1 · Ruta Autónoma (WALA Pro)
            </h4>
            <p class="text-sm sm:text-base text-slate-600 leading-relaxed">
              Si tu diagnóstico muestra que solo necesitas orden y visibilidad diaria, te activas en WALA Pro y sigues por tu cuenta.
            </p>
          </div>

          <div class="bg-white border border-slate-200 rounded-2xl p-6 space-y-2">
            <h4 class="font-display font-bold text-base sm:text-lg text-slate-900">
              Salida 2 · Ruta Acompañada (Programa 1:1 de 2 meses)
            </h4>
            <p class="text-sm sm:text-base text-slate-600 leading-relaxed">
              Si necesitas destrabar cuellos de botella con criterio e interpretación semanal, te presentamos cómo funciona el acompañamiento.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import {
  Box,
  Calculator,
  Compass,
  Home,
  Journal,
  Megaphone,
  ShoppingBag,
} from '@iconoir/vue';

const areas = [
  {
    title: '1. Negocios y Familia',
    description: 'Sueldo del dueño, retiros y separación de cuentas.',
    icon: Home,
  },
  {
    title: '2. Marketing y Precios',
    description: 'Conocimiento del cliente, canales y fijación de precio.',
    icon: Megaphone,
  },
  {
    title: '3. Compras',
    description: 'Comparación de proveedores y reposición con datos.',
    icon: ShoppingBag,
  },
  {
    title: '4. Control de Stock',
    description: 'Rotación, quiebres de inventario y mermas.',
    icon: Box,
  },
  {
    title: '5. Costeo',
    description: 'Materiales directos, mano de obra y costos indirectos.',
    icon: Calculator,
  },
  {
    title: '6. Mantenimiento de Registros',
    description: 'Ingresos diarios, cuentas por cobrar y cierre.',
    icon: Journal,
  },
  {
    title: '7. Planificación',
    description: 'Proyección de ventas, costos y flujo de caja.',
    icon: Compass,
  },
];
</script>
