# Refactorización del Sistema de Sidebar Responsive

## Cambios Implementados

### 1. Nuevo componente SidebarContent.vue

Se creó `src/components/layout/SidebarContent.vue` que contiene:

- Header del negocio con información del negocio actual
- Selector de negocio (si tiene múltiples negocios)
- Navegación principal con secciones
- Footer con botón de logout
- Botón de cerrar (solo visible en móvil con `lg:hidden`)

### 2. Refactorización de MainLayout.vue

#### Template:

- **< lg (móvil+tablet)**: sidebar tipo drawer fullscreen con overlay y animación `translate-x`
- **≥ lg (desktop)**: sidebar anclado a la izquierda que empuja el contenido (layout en columnas)
- Eliminadas todas las clases conflictivas (`md:hidden`, `lg:hidden`, `xl:hidden`) del aside desktop
- Dos asides separados: uno para móvil y otro para desktop

#### Script:

- Actualizado breakpoint de `768px (md)` a `1024px (lg)`
- Función `handleResize()` actualizada para usar breakpoint lg
- `router.afterEach()` actualizado para cerrar drawer solo en < lg

### 3. Comportamiento Responsive

#### < lg (móviles y tablets):

- Sidebar cerrado por defecto
- Se abre como drawer fullscreen con overlay
- Click en overlay cierra el sidebar
- Navegación automáticamente cierra el sidebar
- Botón "✕" visible en header del negocio

#### ≥ lg (desktop):

- Sidebar abierto por defecto
- Anclado a la izquierda con `lg:relative`
- Transición suave de ancho (`lg:w-72` ↔ `lg:w-0`)
- Sin overlay
- Sin botón "✕" (oculto con `lg:hidden`)

### 4. Características Técnicas

- **Overlay**: Solo visible en `< lg` con `lg:hidden` y `z-50`
- **Sidebar móvil**: `z-60` para cubrir elementos fijos como botones del dashboard
- **Animaciones**: `transition-transform duration-300` para móvil, `transition-[width] duration-300` para desktop
- **Accessibility**: `role="dialog"` y `aria-modal="true"` en drawer móvil
- **Layout**: Uso de `lg:flex` en contenedor principal para layout en columnas
- **Z-index personalizado**: Agregado `z-60` en configuración de Tailwind

### 5. Funcionalidades Mantenidas

- Selector de negocio
- Permisos y roles de usuario
- Secciones de navegación (Principal, Administración, Mi Cuenta)
- BusinessSelectorModal
- Todos los stores y lógica de negocio

## Criterios de Aceptación ✅

- [x] **< lg**: botón del header abre drawer fullscreen; overlay cierra al click; al navegar se cierra
- [x] **≥ lg**: sidebar visible por defecto, anclado a la izquierda; el contenido queda a la derecha
- [x] **Alternar en ≥ lg**: cambia anchura (lg:w-72 ↔ lg:w-0) con transición, sin overlay
- [x] **Sin conflictos**: eliminadas todas las clases `md/lg/xl:hidden` que afectaban al aside desktop
- [x] **Breakpoint**: uso correcto de lg (1024px) en lugar de md (768px)

## Archivos Modificados

1. `src/layouts/MainLayout.vue` - Refactorización completa del layout
2. `src/components/layout/SidebarContent.vue` - Nuevo componente para contenido del sidebar
3. `tailwind.config.js` - Agregado z-index personalizado (z-60)

## Notas de Implementación

- Se mantuvieron intactos todos los datos funcionales (stores, permisos, rutas)
- Se preservó la funcionalidad del selector de negocio
- El código es más limpio y mantenible al separar el contenido del sidebar
- La implementación es responsive-first con breakpoints claros
