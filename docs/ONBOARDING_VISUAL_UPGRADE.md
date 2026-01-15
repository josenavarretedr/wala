# 🎨 Actualización Visual del Sistema de Onboarding

## 📋 Resumen de Cambios

Se ha mejorado completamente el sistema de onboarding de WALA para lograr **coherencia visual** con los componentes existentes (ResumenDay, cards, etc.) y una experiencia de usuario más profesional.

---

## ✅ Cambios Implementados

### 1. **CSS Personalizado con Estilo WALA Card**

**Archivo:** [`onboarding.css`](../src/assets/css/onboarding.css)

#### Características principales:

- ✅ **Diseño tipo card** con `rounded-xl` (igual que ResumenDay)
- ✅ **Gradiente sutil** de fondo: `#ffffff → #f9fafb`
- ✅ **Sombras sutiles** (shadow-sm + border gray-200)
- ✅ **Colores planos** sin gradientes en botones
- ✅ **Animaciones sutiles** (fade-in + scale suave)
- ✅ **Overlay más visible** con `opacity: 0.5` + blur

#### Paleta de colores:

```css
--driver-primary: #2563eb; /* blue-600 */
--driver-primary-light: #dbeafe; /* blue-50 */
--driver-text-primary: #1f2937; /* gray-800 */
--driver-text-secondary: #6b7280; /* gray-500 */
--driver-success: #10b981; /* emerald-500 */
--driver-warning: #f59e0b; /* amber-500 */
--driver-purple: #8b5cf6; /* purple-500 */
```

#### Estructura del popover:

```
┌─────────────────────────────────┐
│ [🚀] Título del paso        [×] │ ← Ícono circular + botón cerrar
│─────────────────────────────────│
│ Descripción con HTML           │
│ • Soporte para <strong>        │
│ • Soporte para <code>          │
│ • Soporte para <hr>            │
│─────────────────────────────────│
│ [1 de 7] ← Badge de progreso   │
│─────────────────────────────────│
│ [← Anterior]  [Siguiente →]    │ ← Botones con hover sutil
└─────────────────────────────────┘
```

---

### 2. **Iconos Dinámicos de Iconoir**

**Archivos:** [`useOnboarding.js`](../src/composables/useOnboarding.js) + [`dashboard.config.js`](../src/config/onboarding/dashboard.config.js)

#### Iconos disponibles por paso:

| Paso             | Ícono        | Color    | Descripción           |
| ---------------- | ------------ | -------- | --------------------- |
| Bienvenida       | 🚀 Rocket    | Azul     | Inicio del tour       |
| Micro Apps       | 📱 AppWindow | Morado   | Accesos rápidos       |
| Resumen día      | 📊 BarChart  | Verde    | Métricas del día      |
| Transacciones    | 📋 List      | Azul     | Lista de movimientos  |
| Rutina diaria    | 🎯 Target    | Morado   | Ciclo apertura-cierre |
| Aperturar/Cerrar | 📚 BookStack | Amarillo | Gestión de caja       |
| Nuevo registro   | ➕ Plus      | Verde    | Crear transacción     |

#### Implementación:

```javascript
// En dashboard.config.js
{
  element: '[data-tour="resumen-day"]',
  popover: {
    title: 'Tu día en números',
    description: '...'
  },
  iconName: 'BarChart',     // ✅ Nombre del ícono de Iconoir
  iconColor: 'success',     // ✅ Variante: 'blue', 'success', 'purple', 'warning'
}
```

El composable renderiza dinámicamente el ícono en un contenedor circular con fondo de color:

```html
<div class="icon-wrapper">
  <!-- bg-blue-50, rounded-lg -->
  <svg>...</svg>
  <!-- w-5 h-5, color blue-600 -->
</div>
```

---

### 3. **Badge "NUEVO" en QuickActionBtn**

**Archivo:** [`QuickActionBtn.vue`](../src/components/Dashboard/QuickActionBtn.vue)

#### Comportamiento:

- ✅ Muestra un **badge morado con animación ping** si el tour NO ha sido completado
- ✅ Se oculta automáticamente al iniciar el tour
- ✅ Verifica estado en Firebase por negocio y usuario

```vue
<!-- Badge "NUEVO" -->
<span v-if="showNewBadge" class="absolute -top-1 -right-1 flex h-3 w-3">
  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
  <span class="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
</span>
```

#### Lógica:

```javascript
const checkTourCompletion = async () => {
  const config = getCurrentConfig();
  if (config) {
    const completed = await hasCompletedTour(config.id);
    showNewBadge.value = !completed; // Mostrar si NO completado
  }
};
```

---

### 4. **Configuración Global Mejorada**

**Archivo:** [`useOnboarding.js`](../src/composables/useOnboarding.js)

#### Cambios clave:

```javascript
driverInstance.value = driver({
  // ... configuración existente ...
  overlayOpacity: 0.5, // ✅ Más visible (antes: 0.2)
  popoverClass: "wala-theme", // ✅ Aplicar tema personalizado

  onPopoverRender: (popover, { state }) => {
    // ✅ Renderizar ícono dinámico
    const currentStepData = config.steps?.[state?.activeIndex];

    if (currentStepData?.iconName) {
      // Crear wrapper + SVG
      const iconWrapper = document.createElement("div");
      iconWrapper.className = "icon-wrapper";

      const iconSvg = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );
      iconSvg.innerHTML = getIconoirPath(currentStepData.iconName);

      // Aplicar variante de color
      if (currentStepData.iconColor === "success") {
        popover.wrapper.classList.add("wala-success");
      }

      // Insertar en título
      titleElement.insertBefore(iconWrapper, titleElement.firstChild);
    }
  },
});
```

---

## 🎯 Variantes de Color Disponibles

Puedes aplicar diferentes colores a cada paso usando la propiedad `iconColor`:

### **Blue (Por defecto)**

```css
.icon-wrapper {
  background: #dbeafe; /* blue-50 */
  color: #2563eb; /* blue-600 */
}
```

### **Success (Verde)**

```css
.wala-success .icon-wrapper {
  background: #d1fae5; /* emerald-100 */
  color: #10b981; /* emerald-500 */
}
```

### **Purple (Morado)**

```css
.wala-purple .icon-wrapper {
  background: #ede9fe; /* purple-100 */
  color: #8b5cf6; /* purple-500 */
}
```

### **Warning (Amarillo)**

```css
.wala-warning .icon-wrapper {
  background: #fef3c7; /* amber-100 */
  color: #f59e0b; /* amber-500 */
}
```

---

## 📱 Responsive Design

El sistema es completamente responsive:

### Desktop (> 640px)

- Max-width: `26rem` (416px)
- Padding: `1.5rem`
- Font title: `1.125rem`

### Mobile (≤ 640px)

- Max-width: `90vw`
- Padding: `1.25rem`
- Font title: `1rem`
- Font description: `0.8125rem`

---

## ♿ Accesibilidad

- ✅ **Focus visible** en todos los botones (outline blue)
- ✅ **ARIA labels** en QuickActionBtn
- ✅ **Reduced motion** respetado (`prefers-reduced-motion`)
- ✅ **Alto contraste** en textos (WCAG AA)

---

## 🚀 Cómo Usar

### 1. **Agregar nuevo tour**

```javascript
// En tu archivo de configuración (ej: products.config.js)
export const productsConfig = {
  id: "products-tour",
  name: "Tour de Productos",
  autoStart: true,

  steps: [
    {
      element: '[data-tour="products-list"]',
      popover: {
        title: "Lista de productos",
        description: "<p>Gestiona tu inventario aquí</p>",
      },
      iconName: "Package", // ✅ Ícono de Iconoir
      iconColor: "blue", // ✅ Variante de color
    },
  ],
};
```

### 2. **Iconos disponibles de Iconoir**

Consulta todos los iconos en: https://iconoir.com/

**Iconos ya configurados:**

- `Rocket` - Bienvenida
- `AppWindow` - Aplicaciones
- `BarChart` - Estadísticas
- `List` - Listas
- `Target` - Objetivos
- `BookStack` - Documentos
- `Plus` - Agregar

**Para agregar más:**

1. Busca el ícono en https://iconoir.com/
2. Copia el path SVG
3. Agrégalo en `getIconoirPath()` en [`useOnboarding.js`](../src/composables/useOnboarding.js)

---

## 📊 Comparación Visual

### Antes ❌

- Overlay muy claro (difícil de ver)
- Sin iconos (solo emojis en texto)
- Estilo genérico de Driver.js
- Sin badge de "nuevo"
- Botones con gradientes inconsistentes

### Después ✅

- Overlay con blur y opacidad 0.5
- Iconos SVG dinámicos de Iconoir
- Estilo card coherente con WALA
- Badge morado animado para tours nuevos
- Botones planos con hover sutil (-2px translateY)

---

## 🔍 Testing

Para probar los cambios:

1. **Limpia localStorage/Firestore** para simular primera visita:

```javascript
// En DevTools Console
localStorage.clear();
```

2. **Navega a Dashboard** - El tour debería auto-iniciarse

3. **Verifica:**
   - ✅ Badge morado visible en QuickActionBtn
   - ✅ Overlay oscuro con blur
   - ✅ Iconos circulares en cada paso
   - ✅ Colores coherentes (azul, verde, morado, amarillo)
   - ✅ Animaciones sutiles
   - ✅ Responsive en móvil

---

## 📝 Notas Técnicas

### CSS Importado

El archivo `onboarding.css` se importa automáticamente en [`useOnboarding.js`](../src/composables/useOnboarding.js):

```javascript
import "@/assets/css/onboarding.css";
```

### Persistencia

Los tours completados se guardan en Firestore:

```
businesses/{businessId}/settings/onboarding
  ├─ completedTours: {
  │    userId: [tourId1, tourId2, ...]
  │  }
  └─ lastTourCompleted: { ... }
```

### Performance

- ✅ Iconos renderizados como SVG inline (no requiere importación dinámica)
- ✅ CSS con variables CSS para fácil theming
- ✅ Animaciones optimizadas con `cubic-bezier` y `transform`

---

## 🎯 Próximos Pasos

Si quieres expandir el sistema:

1. **Agregar más tours** para otras vistas (Inventario, Clientes, etc.)
2. **Personalizar colores por negocio** (usando Firestore)
3. **Analytics avanzado** (tiempo en cada paso, tasas de abandono)
4. **Tooltips permanentes** para elementos clave (sin ser tour completo)
5. **Video embebido** en popovers (usando iframe en description)

---

## 📚 Recursos

- **Driver.js Docs:** https://driverjs.com/docs/theming
- **Iconoir Icons:** https://iconoir.com/
- **Tailwind Colors:** https://tailwindcss.com/docs/customizing-colors
- **WALA Design System:** Ver componentes en `src/components/`

---

**Autor:** Sistema de Onboarding WALA  
**Fecha:** 14 de enero de 2026  
**Versión:** 2.0 - Visual Upgrade
