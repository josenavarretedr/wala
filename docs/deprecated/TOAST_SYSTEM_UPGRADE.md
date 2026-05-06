# Sistema de Toasts Mejorado - Múltiples Notificaciones

## 📋 Resumen de Cambios

Se ha actualizado el sistema de toasts para soportar múltiples notificaciones simultáneas apiladas con animaciones independientes.

## 🎯 Mejoras Implementadas

### 1. Composable `useToast.js`

Nuevo sistema de gestión global de toasts que permite:

- **Múltiples toasts simultáneos** con IDs únicos
- **Gestión automática** de tiempos de vida
- **API simple y flexible** para crear notificaciones

### 2. Componente `ToastNotification.vue` Actualizado

- **TransitionGroup** para animar múltiples elementos
- **Apilamiento vertical** (de abajo hacia arriba)
- **Fade out de 1 segundo** en las salidas
- **Animaciones suaves** para entrada, salida y reordenamiento

## 📝 Cómo Usar

### Importar el Composable

```javascript
import { useToast } from "@/composables/useToast";

const { showToast, info, success, warning, error, premium } = useToast();
```

### Métodos Disponibles

#### 1. Método General

```javascript
showToast({
  message: "Tu mensaje aquí",
  type: "success", // 'info' | 'success' | 'warning' | 'error' | 'premium'
  duration: 3000, // milisegundos (0 = no auto-cerrar)
  closable: true, // mostrar botón de cerrar
});
```

#### 2. Métodos Helper (Recomendado)

```javascript
// Notificación de información
info("Información importante");

// Notificación de éxito
success("¡Operación completada!");

// Notificación de advertencia
warning("Ten cuidado con esto");

// Notificación de error
error("Algo salió mal");

// Notificación premium
premium("Funcionalidad premium disponible");
```

#### 3. Opciones Personalizadas

```javascript
success("Guardado exitoso", {
  duration: 5000, // 5 segundos
  closable: false, // no mostrar botón cerrar
});
```

#### 4. Gestión Manual

```javascript
// Obtener ID del toast
const toastId = success("Procesando...");

// Remover toast específico
removeToast(toastId);

// Limpiar todos los toasts
clearAllToasts();
```

## 🎨 Características de Animación

- **Entrada**: 0.3s ease-out con fade + scale
- **Salida**: 1s ease-in con fade + scale (según requerimiento)
- **Reordenamiento**: 0.3s ease cuando otros toasts se eliminan
- **Apilamiento**: Los nuevos toasts aparecen en la parte inferior

## 💡 Ejemplos de Uso

### Ejemplo 1: Notificaciones Múltiples

```javascript
function procesarVarios() {
  info("Iniciando proceso...");

  setTimeout(() => {
    success("Paso 1 completado");
  }, 1000);

  setTimeout(() => {
    success("Paso 2 completado");
  }, 2000);

  setTimeout(() => {
    success("¡Proceso finalizado!");
  }, 3000);
}
```

### Ejemplo 2: Manejo de Errores

```javascript
async function guardarDatos() {
  try {
    await api.save();
    success("Datos guardados correctamente");
  } catch (e) {
    error("Error al guardar: " + e.message);
  }
}
```

### Ejemplo 3: Notificación Persistente

```javascript
// Toast que no se cierra automáticamente
const loadingId = info("Cargando datos...", { duration: 0 });

// Cerrar manualmente cuando termine
await cargarDatos();
removeToast(loadingId);
success("Datos cargados");
```

## 🔧 Integración con App.vue

Asegúrate de incluir el componente en tu `App.vue`:

```vue
<template>
  <div id="app">
    <!-- Tu contenido -->
    <ToastNotification />
  </div>
</template>

<script setup>
import ToastNotification from "@/components/ui/ToastNotification.vue";
</script>
```

## ⚠️ Notas Importantes

1. **Sin Props**: El componente ya NO acepta props. Todo se maneja a través del composable.
2. **Estado Global**: Los toasts son globales y persisten entre rutas.
3. **Límite Recomendado**: Aunque soporta ilimitados, recomendamos máximo 5 toasts simultáneos para mejor UX.
4. **Duración Predeterminada**: 3000ms (3 segundos) si no se especifica.

## 🎯 Tipos de Toast

| Tipo      | Color   | Icono         | Uso Recomendado      |
| --------- | ------- | ------------- | -------------------- |
| `info`    | Azul    | InfoCircle    | Información general  |
| `success` | Verde   | CheckCircle   | Operaciones exitosas |
| `warning` | Ámbar   | WarningCircle | Advertencias         |
| `error`   | Rojo    | XmarkCircle   | Errores              |
| `premium` | Naranja | BrightCrown   | Funciones premium    |

## 📦 Archivos Modificados

- ✅ **Nuevo**: `src/composables/useToast.js`
- ✅ **Actualizado**: `src/components/ui/ToastNotification.vue`

---

**Fecha de implementación**: 12 de enero de 2026
