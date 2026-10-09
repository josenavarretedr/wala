# 📚 Configuraciones de Onboarding

Esta carpeta contiene todas las configuraciones de tours para el sistema de onboarding.

## 📝 Archivos

- `index.js` - Exporta todas las configuraciones
- `dashboard.config.js` - Tour del Dashboard principal
- `*.config.js.example` - Ejemplos para crear nuevos tours

## 🚀 Crear un nuevo tour

1. **Crea un nuevo archivo**: `mi-vista.config.js`

2. **Usa esta plantilla**:

```javascript
export const miVistaConfig = {
  id: "mi-vista-tour",
  name: "Tour de Mi Vista",
  autoStart: true,

  routeMatcher: (routePath) => {
    return routePath.includes("/mi-ruta");
  },

  driverConfig: {
    animate: true,
  },

  steps: [
    {
      popover: {
        title: "Título",
        description: "Descripción",
      },
    },
    {
      element: '[data-tour="elemento"]',
      popover: {
        title: "Paso 2",
        description: "Descripción del paso",
        side: "bottom",
      },
    },
  ],
};
```

3. **Registra en `index.js`**:

```javascript
import { miVistaConfig } from "./mi-vista.config";

export const onboardingConfigs = {
  // ... otros
  miVista: miVistaConfig,
};
```

4. **Usa en tu componente**:

```vue
<template>
  <div data-tour="elemento">
    <!-- contenido -->
  </div>
  <QuickActionBtn />
</template>

<script setup>
import { useOnboarding } from "@/composables/useOnboarding";

const { autoStartIfFirstVisit } = useOnboarding();

onMounted(async () => {
  await autoStartIfFirstVisit();
});
</script>
```

## 📖 Documentación completa

Ver: `/docs/SISTEMA_ONBOARDING.md`
