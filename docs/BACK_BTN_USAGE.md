# BackBtn Component

Componente reutilizable para botones de retroceso/navegación, diseñado siguiendo la misma lógica de `CloseBtn.vue`.

## 📦 Ubicación

```
src/components/ui/BackBtn.vue
```

## 🎯 Características

- ✅ **Minimalista y consistente** con el diseño del proyecto
- ✅ **Múltiples modos de navegación**
- ✅ **Animaciones y efectos hover sutiles**
- ✅ **Tooltip opcional**
- ✅ **Estados de carga**
- ✅ **Callbacks personalizables**
- ✅ **Responsive**
- ✅ **Eventos emitidos**

## 📋 Props

### Navegación

| Prop          | Tipo             | Default | Descripción                                                              |
| ------------- | ---------------- | ------- | ------------------------------------------------------------------------ |
| `to`          | String \| Object | `null`  | Ruta específica a la que navegar (objeto de ruta de Vue Router)          |
| `routeName`   | String           | `null`  | Nombre de la ruta de destino                                             |
| `routeParams` | Object           | `null`  | Parámetros para la ruta                                                  |
| `routeQuery`  | Object           | `null`  | Query params para la ruta                                                |
| `useBack`     | Boolean          | `false` | Si `true`, usa `router.back()` en lugar de navegar a una ruta específica |

### Apariencia

| Prop          | Tipo    | Default    | Descripción             |
| ------------- | ------- | ---------- | ----------------------- |
| `buttonText`  | String  | `"Volver"` | Texto del botón         |
| `tooltipText` | String  | `""`       | Texto del tooltip       |
| `showTooltip` | Boolean | `false`    | Mostrar/ocultar tooltip |

### Comportamiento

| Prop             | Tipo     | Default | Descripción                                                                    |
| ---------------- | -------- | ------- | ------------------------------------------------------------------------------ |
| `beforeNavigate` | Function | `null`  | Callback ejecutado antes de navegar. Si retorna `false`, cancela la navegación |

## 📤 Eventos

| Evento            | Payload | Descripción                                    |
| ----------------- | ------- | ---------------------------------------------- |
| `beforeBack`      | -       | Se emite antes de iniciar la navegación        |
| `afterBack`       | -       | Se emite después de completar la navegación    |
| `navigationError` | `Error` | Se emite si hay un error durante la navegación |

## 💻 Ejemplos de Uso

### 1. Navegación simple con router.back()

```vue
<template>
  <BackBtn use-back button-text="Volver" />
</template>

<script setup>
import BackBtn from "@/components/ui/BackBtn.vue";
</script>
```

### 2. Navegación a una ruta específica por nombre

```vue
<template>
  <BackBtn
    route-name="InventoryDashboard"
    :route-params="{ businessId: '123' }"
    button-text="Volver al inventario"
  />
</template>

<script setup>
import BackBtn from "@/components/ui/BackBtn.vue";
</script>
```

### 3. Navegación con objeto de ruta completo

```vue
<template>
  <BackBtn
    :to="{
      name: 'Dashboard',
      params: { id: userId },
      query: { tab: 'overview' },
    }"
    button-text="Volver al dashboard"
  />
</template>

<script setup>
import { ref } from "vue";
import BackBtn from "@/components/ui/BackBtn.vue";

const userId = ref("123");
</script>
```

### 4. Con tooltip

```vue
<template>
  <BackBtn
    use-back
    button-text="Volver"
    show-tooltip
    tooltip-text="Regresar a la página anterior"
  />
</template>
```

### 5. Con callback antes de navegar

```vue
<template>
  <BackBtn
    route-name="Products"
    button-text="Volver"
    :before-navigate="handleBeforeNavigate"
    @before-back="onBeforeBack"
    @after-back="onAfterBack"
    @navigation-error="onError"
  />
</template>

<script setup>
import { ref } from "vue";
import BackBtn from "@/components/ui/BackBtn.vue";

const hasUnsavedChanges = ref(true);

const handleBeforeNavigate = async () => {
  if (hasUnsavedChanges.value) {
    const confirmed = confirm("¿Descartar cambios sin guardar?");
    return confirmed;
  }
  return true;
};

const onBeforeBack = () => {
  console.log("Iniciando navegación...");
};

const onAfterBack = () => {
  console.log("Navegación completada");
};

const onError = (error) => {
  console.error("Error en navegación:", error);
};
</script>
```

## 🔄 Lógica de Navegación

El componente determina la navegación en este orden:

1. Si `useBack` es `true` → usa `router.back()`
2. Si existe `to` → navega con `router.push(to)`
3. Si existe `routeName` → construye objeto de ruta y navega
4. Por defecto → usa `router.back()`

## 🎨 Estilos

El componente incluye:

- **Hover effect**: Escala sutil y cambio de color
- **Active state**: Escala reducida al hacer clic
- **Loading state**: Opacidad reducida y cursor disabled
- **Responsive**: Ajuste de padding e iconos en móvil
- **Tooltip**: Aparece al hacer hover (opcional)
