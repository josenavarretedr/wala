<template>
  <div class="min-h-screen bg-slate-50 p-6">
    <div
      class="mx-auto mt-10 max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"
    >
      <p class="text-xs font-semibold uppercase tracking-wide text-teal-700">
        Sesiones
      </p>
      <h1 class="mt-2 text-2xl font-black text-slate-900">
        Esta sesion aun no esta publicada
      </h1>
      <p class="mt-3 text-slate-600">
        Ya dejamos la estructura lista para nuevas rutas en /sesiones/sesion-n.
        Por ahora solo esta disponible la Sesion 1 de Costeo.
      </p>

      <RouterLink
        to="/sesiones/sesion-1"
        class="mt-6 inline-flex rounded-xl border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700 transition hover:bg-teal-100"
      >
        Ir a Sesion 1
      </RouterLink>
    </div>
  </div>
</template>
