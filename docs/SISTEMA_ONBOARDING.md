# Sistema de Onboarding con Driver.js

## 📚 Descripción General

Sistema de tours guiados integrado con **Driver.js** que permite crear experiencias de onboarding interactivas para diferentes vistas de la aplicación.

## 🎯 Características

- ✅ Tours personalizados por vista/ruta
- ✅ Persistencia en Firestore del progreso del usuario
- ✅ Auto-inicio en primera visita
- ✅ Tracking de analytics (inicios y completaciones)
- ✅ Botón de ayuda rápida flotante (QuickActionBtn)
- ✅ Totalmente reutilizable y escalable
- ✅ Soporte para múltiples tours

## 📁 Estructura de Archivos

```
src/
├── composables/
│   └── useOnboarding.js          # Composable principal con toda la lógica
├── config/
│   └── onboarding/
│       ├── index.js              # Exporta todas las configs
│       ├── dashboard.config.js   # Config del tour del dashboard
│       └── [vista].config.js     # Configs de otras vistas
├── assets/
│   └── css/
│       └── onboarding.css        # Estilos personalizados
└── components/
    └── Dashboard/
        └── QuickActionBtn.vue    # Botón flotante de ayuda
```

## 🚀 Uso Básico

### 1. Crear una configuración de tour

Crea un archivo en `/config/onboarding/[nombre].config.js`:

```javascript
export const miVistaConfig = {
  id: "mi-vista-tour",
  name: "Tour de Mi Vista",
  autoStart: true, // Auto-iniciar en primera visita

  // Matcher para determinar cuándo aplicar este tour
  routeMatcher: (routePath) => {
    return routePath.includes("/mi-ruta");
  },

  // Configuración específica de Driver.js
  driverConfig: {
    animate: true,
    overlayOpacity: 0.75,
  },

  // Pasos del tour
  steps: [
    {
      popover: {
        title: "Bienvenido 👋",
        description: "Este es el primer paso del tour.",
      },
    },
    {
      element: '[data-tour="elemento-1"]',
      popover: {
        title: "Elemento Importante",
        description: "Aquí puedes hacer X cosa.",
        side: "bottom",
        align: "start",
      },
    },
    // ... más pasos
  ],
};
```

### 2. Registrar la configuración

En `/config/onboarding/index.js`:

```javascript
import { miVistaConfig } from "./mi-vista.config";

export const onboardingConfigs = {
  dashboard: dashboardConfig,
  miVista: miVistaConfig, // ✅ Agregar aquí
};
```

### 3. Agregar atributos `data-tour` en tu vista

```vue
<template>
  <div>
    <div data-tour="elemento-1">
      <!-- Tu contenido -->
    </div>

    <button data-tour="boton-principal">Acción</button>

    <!-- Botón de ayuda flotante -->
    <QuickActionBtn />
  </div>
</template>
```

### 4. Auto-iniciar el tour en `onMounted`

```vue
<script setup>
import { onMounted } from "vue";
import { useOnboarding } from "@/composables/useOnboarding";

const { autoStartIfFirstVisit } = useOnboarding();

onMounted(async () => {
  // Tu lógica de carga...

  // ✅ Auto-iniciar tour
  await autoStartIfFirstVisit();
});
</script>
```

## 🎨 Personalización de Estilos

Los estilos están en `/assets/css/onboarding.css`. Puedes personalizar:

- Colores (variables CSS)
- Tamaño de fuentes
- Animaciones
- Espaciado
- Responsividad

```css
:root {
  --driver-primary-color: #2563eb;
  --driver-text-color: #1f2937;
  --driver-border-radius: 12px;
}
```

## 📊 Persistencia en Firestore

Los datos se guardan en una **subcolección `settings/onboarding`** dentro del documento del negocio:

```
businesses/{businessId}/settings/onboarding
```

Estructura del documento:

```javascript
{
  // Tours completados por usuario (objeto con UIDs como keys)
  completedTours: {
    'userId1': ['dashboard-tour', 'transactions-tour'],
    'userId2': ['dashboard-tour']
  },

  // Último tour completado (metadatos)
  lastTourCompleted: {
    tourId: 'dashboard-tour',
    completedAt: '2025-11-02T...',
    userId: 'abc123',
    businessId: 'business123'
  },

  // Tracking de inicios de tours (analytics)
  tourStarts: [
    {
      tourId: 'dashboard-tour',
      startedAt: '2025-11-02T...',
      userId: 'abc123',
      businessId: 'business123'
    }
  ],

  createdAt: '2025-11-02T...',
  updatedAt: '2025-11-02T...'
}
```

### 🔑 Ventajas de guardar en subcolección settings/:

- ✅ Cada usuario puede completar tours independientemente en cada negocio
- ✅ Los gerentes pueden ver estadísticas de onboarding de su negocio
- ✅ Analytics por negocio (no mezcla datos entre negocios)
- ✅ Si un usuario trabaja en varios negocios, cada uno tiene su propio progreso
- ✅ Mejor organización: Configuraciones separadas del documento principal
- ✅ Escalabilidad: Permite agregar más configuraciones en `settings/`
- ✅ Rendimiento: Lecturas más específicas sin cargar todo el documento business

**Nota**: Para más detalles sobre la estructura completa del documento business, consulta: [`BUSINESS_DOCUMENT_STRUCTURE.md`](./BUSINESS_DOCUMENT_STRUCTURE.md)

## 🎛️ API del Composable `useOnboarding`

### Estado

- `isActive` (ref): Si hay un tour activo
- `hasTourForCurrentRoute` (computed): Si hay tour disponible para la ruta actual
- `currentTourData` (ref): Datos del tour actual

### Métodos

```javascript
const {
  // Métodos principales
  startTour, // Iniciar tour (forceRestart = false)
  stopTour, // Detener tour actual
  autoStartIfFirstVisit, // Auto-iniciar si es primera visita

  // Métodos de verificación
  hasCompletedTour, // Verificar si completó un tour
  getCurrentConfig, // Obtener config de la ruta actual
  getUserTourStats, // Obtener estadísticas del usuario
} = useOnboarding();
```

### Ejemplos de uso

```javascript
// Iniciar tour manualmente
startTour();

// Forzar reinicio del tour
startTour(true);

// Verificar si completó un tour
const completed = await hasCompletedTour("dashboard-tour");

// Obtener estadísticas
const stats = await getUserTourStats();
console.log(stats.completedTours); // ['dashboard-tour', ...]
```

## 🔧 Configuración Avanzada

### Pasos con callbacks

```javascript
{
  element: '[data-tour="elemento"]',
  popover: {
    title: 'Paso Avanzado',
    description: 'Este paso tiene callbacks personalizados',
    onNextClick: () => {
      // Lógica personalizada antes de siguiente
      // Cargar datos, hacer scroll, etc.
      driverObj.moveNext();
    },
    onPrevClick: () => {
      driverObj.movePrevious();
    }
  },
  onHighlighted: (element) => {
    console.log('Elemento destacado:', element);
  },
  onDeselected: (element) => {
    console.log('Elemento deseleccionado:', element);
  }
}
```

### Tours con contenido dinámico

```javascript
steps: [
  {
    popover: {
      title: "Cargando datos...",
      onNextClick: async () => {
        // Cargar datos de forma asíncrona
        await cargarDatos();
        driverObj.moveNext();
      },
    },
  },
  {
    element: ".dynamic-element", // Elemento cargado dinámicamente
    popover: {
      title: "Datos Cargados",
      description: "Aquí están tus datos",
    },
  },
];
```

## 📱 QuickActionBtn Component

Botón flotante que aparece automáticamente en vistas con tours disponibles.

### Características:

- Solo se muestra si hay tour para la ruta actual
- Animación de pulsación para llamar la atención
- Badge verde indicando tour disponible
- Ícono de progreso cuando el tour está activo

### Personalización:

```vue
<!-- Cambiar posición -->
<QuickActionBtn class="bottom-20 right-6" />

<!-- Cambiar colores en el componente -->
```

## 📈 Analytics y Tracking

El sistema rastrea automáticamente:

1. **Inicios de tours**: Cada vez que un usuario inicia un tour
2. **Completaciones**: Cuando un usuario finaliza un tour
3. **Abandono implícito**: Si cierra el tour antes de terminar

### Consultar datos en Firestore:

```javascript
const stats = await getUserTourStats();
console.log("Tours completados:", stats.completedTours.length);
console.log("Tours iniciados:", stats.tourStarts.length);
console.log(
  "Tasa de completación:",
  stats.completedTours.length / stats.tourStarts.length
);
```

## 🎯 Mejores Prácticas

1. **Pasos cortos y claros**: Máximo 7-9 pasos por tour
2. **Usar emojis**: Hacen los tours más amigables 🎉
3. **Títulos descriptivos**: Directo al punto
4. **Descripciones concisas**: 1-2 líneas máximo
5. **Orden lógico**: Flujo natural de uso de la vista
6. **Elementos visibles**: Asegúrate de que los elementos existan
7. **Testing**: Prueba el tour en diferentes tamaños de pantalla

## 🐛 Troubleshooting

### El tour no se inicia automáticamente

- Verifica que `autoStart: true` en la config
- Confirma que el `routeMatcher` coincide con la ruta
- Revisa la consola para errores

### Elementos no se destacan

- Verifica que el selector `[data-tour="..."]` sea correcto
- Asegúrate de que el elemento esté visible en el DOM
- Revisa que no haya conflictos de z-index

### El botón QuickActionBtn no aparece

- Confirma que hay una configuración para esa ruta
- Verifica que el componente esté importado en la vista

## 🚀 Próximas Mejoras

- [ ] Menú de selección de tours disponibles
- [ ] Soporte multiidioma
- [ ] Modo "Tips avanzados"
- [ ] Integración con sistema de notificaciones
- [ ] Dashboard de analytics admin
- [ ] Tours condicionados por rol/permisos

## 📝 Ejemplo Completo: Dashboard

Ver implementación en:

- Config: `/config/onboarding/dashboard.config.js`
- Vista: `/views/dashboard/DashboardRedirect.vue`
- Componentes: `/components/Dashboard/MainBtns.vue`

---

**Creado:** 28 de octubre de 2025  
**Autor:** Sistema de Onboarding - Wala  
**Versión:** 1.0.0


---

## Changelog

### [Auditoría - Marzo 2026]
- Revisado: Funcionalidad verificada como activa en código fuente.
- Sin cambios de contenido en esta auditoría.
- Documentación movida al estado vigente confirmado.

