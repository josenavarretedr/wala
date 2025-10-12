# Sistema de Full Screen Loader - Minimalista

## 📋 Descripción

Sistema de carga de pantalla completa con diseño **minimalista y limpio** que muestra 3 pasos durante la carga. Garantiza un **tiempo mínimo de visualización** para que el usuario siempre vea la animación completa, incluso en cargas muy rápidas.

## 🎯 Características Clave

- **Tiempo mínimo garantizado**: 4 segundos + 2.5s de animación = **6.5 segundos mínimo**
- **Diseño minimalista**: Fondo blanco, elementos limpios
- **3 pasos automáticos**: Siempre muestra los mismos 3 mensajes
- **Iconos Iconoir**: Check para completado
- **Estados claros**: Gris → Azul (cargando) → Verde (completado)

## ⏱️ Sistema de Tiempo Mínimo

### El Problema

Si la carga es muy rápida (< 1 segundo), el loader desaparece antes de que el usuario vea los pasos.

### La Solución

```javascript
const MIN_DISPLAY_TIME = 4000; // 4 segundos mínimo

// Garantiza visualización completa:
// - Mínimo 4s mostrando pasos
// - + 2.5s de animación de completado
// = Total mínimo: 6.5 segundos
```

### Ejemplos de Timing

**Carga rápida (500ms)**

```javascript
loader.show(); // T=0ms
await quickLoad(); // T=500ms (muy rápido!)
loader.hide(); // T=500ms
// Espera automáticamente hasta T=6500ms
// Usuario ve animación completa
```

**Carga normal (2s)**

```javascript
loader.show(); // T=0ms
await normalLoad(); // T=2000ms
loader.hide(); // T=2000ms
// Espera 2s más + 2.5s animación = T=6500ms
```

**Carga larga (6s)**

```javascript
loader.show(); // T=0ms
await longLoad(); // T=6000ms
loader.hide(); // T=6000ms
// Ya pasó el mínimo, solo añade 2.5s = T=8500ms
```

## 🚀 Uso Básico

```javascript
import { useAppLoader } from "@/composables/useAppLoader";

const loader = useAppLoader();

// 1. Mostrar
loader.show();

// 2. Hacer operaciones (rápidas o lentas)
await loadData();

// 3. Ocultar (tiempo mínimo garantizado)
loader.hide();
```

## 🎨 Los 3 Pasos

1. **"Buscando datos del negocio"** - Color azul con spinner
2. **"Cargando transacciones"** - Color azul con spinner
3. **"Listo para usar!"** - Color azul con spinner

Al completar → Todos se ponen en verde con check ✓

## 📊 Timeline Completa

```
0ms     - show() → loader visible
0ms     - Paso 1 cargando (spinner azul)
200ms   - Tu código termina
200ms   - hide() llamado → calcula espera de 3800ms
1200ms  - Paso 2 cargando
2400ms  - Paso 3 cargando
3600ms  - Paso 3 completado
4000ms  - Tiempo mínimo cumplido → empieza animación verde
4500ms  - Paso 1 ✓ verde
4800ms  - Paso 2 ✓ verde
5100ms  - Paso 3 ✓ verde
6500ms  - Loader desaparece
```

## 💻 Implementación

### En `main.js`

```javascript
const loader = useAppLoader();

const initApp = async () => {
  loader.show();
  await authStore.restoreSession(); // Puede ser muy rápido
  loader.hide(); // Garantiza 6.5s mínimo
  app.mount("#app");
};
```

### En `router/index.js`

```javascript
const loader = useAppLoader();

if (needsToLoadBusiness) {
  loader.show();
  await userStore.setCurrentBusiness(businessId);
  await businessStore.loadBusiness(businessId);
  loader.hide(); // Garantiza tiempo mínimo
}
```

## 🎯 Ventajas

✅ **UX consistente** - Animación completa siempre  
✅ **Profesional** - No parpadea ni desaparece abruptamente  
✅ **Inteligente** - Se adapta a operaciones rápidas y lentas  
✅ **Sin configuración** - Funciona automáticamente

## ⚙️ API del Composable

```javascript
const {
  isVisible, // boolean: Si el loader está visible
  isLoading, // boolean: Si está cargando (antes de completar)
  show, // function: Mostrar loader (guarda timestamp)
  hide, // function: Ocultar loader (garantiza tiempo mínimo)
} = useAppLoader();
```

## 🎨 Colores y Estilos

```css
/* Pendiente */
Background: #f3f4f6   Dot: #d1d5db   Label: #9ca3af

/* Cargando */
Background: #e0e7ff   Spinner: #6366f1   Label: #6366f1

/* Completado */
Background: #10b981   Check: white   Label: #10b981
```

## ✅ Mejores Prácticas

✓ Usar para inicio de app  
✓ Usar para carga/cambio de negocio  
✓ Confiar en el tiempo mínimo  
✓ Siempre llamar `hide()` incluso con errores

## ❌ No Hacer

✗ Intentar acelerar manualmente  
✗ Usar para operaciones triviales  
✗ Medir tiempos manualmente  
✗ Mostrar múltiples veces seguidas

---

**Versión**: 2.1.0 (Con Tiempo Mínimo)  
**Octubre 2025** - Wala Team
