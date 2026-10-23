---
name: remotion-wala-style
description: Especificación técnica y guía de Motion Design programático para videos de WALA en Remotion
version: 1.0.0
---

# Skill: Remotion WALA Motion Design System

Esta skill define la especificación técnica, tokens y arquetipos visuales para replicar y generar videos en Remotion con la **identidad visual oficial de WALA**.

Permite transformar conceptos de negocio (proveedores, inventario, flujo de caja, presupuestos) en animaciones deterministas de alto impacto para formatos verticales (9:16).

---

## 1. Las 5 Dimensiones Técnicas de WALA

### 1.1 Física y Dinámica de Movimiento (`spring`)
En WALA nunca se usan animaciones CSS (`transition`, `keyframes` infinitos, ni `setTimeout`). Todo el movimiento se calcula determinísticamente cuadro a cuadro:
* **Entrada de tarjetas y ventanas UI (`snappy`):**
  * `config: { damping: 14, stiffness: 120, mass: 0.8 }`
  * Sensación: Frenado ágil y preciso con mínima oscilación (estilo software de alta gama / Linear).
* **Iconos isométricos, sellos y llamadas de atención (`bouncy`):**
  * `config: { damping: 10, stiffness: 90, mass: 0.9 }`
  * Sensación: Rebote físico perceptible que captura la atención visual de inmediato.
* **Transiciones de barras, líneas de progreso y fondos (`smooth`):**
  * `config: { damping: 20, stiffness: 80, mass: 1.0 }` o interpolaciones lineales/ease.

### 1.2 Tipografía y Cinética
* **Fuente Principal de Datos y HUD:** Familias Monospace (`JetBrains Mono`, `Space Mono`, `Courier New`, monospace genérico).
  * `text-transform: uppercase`, `letter-spacing: 0.08em` a `0.12em`.
  * Números con `fontVariantNumeric: "tabular-nums"` para evitar temblor visual en contadores dinámicos.
* **Titulares de Gancho:** Tipografía display de alto peso (Sans-serif pesada o Serif condensada) combinando:
  * Primera parte en color tinta oscuro `#1A1A1A`.
  * Remate en cursiva itálica con acento corporativo naranja `#FF5C00`.

### 1.3 Composición Espacial y Capas (Formato 9:16 - 1080 × 1920)
* **Zona Superior (Y: 0 a 340px) - Header HUD:**
  * Indicador de tema (`IDEA Nº1 · PARTE 1`), pregunta activa (`¿QUÉ ES?`) y contador de presupuesto/progreso (`$0 / $120`).
* **Zona Central (Y: 340px a 1350px) - Canvas Gráfico Principal:**
  * Diagramas de flujo (Proveedor → Tienda → Cliente), comparativas de stock, ventanas de producto y tickets troquelados.
* **Zona Inferior (Y: 1350px a 1920px) - Speaker Safe Zone:**
  * En escenas con presentador en cámara ("talking head"), este tercio inferior se reserva libre de gráficos densos para la silueta del creador.

### 1.4 Dos Modos de Identidad Visual
1. **Modo Paper Editorial (Canvas cálido):**
   * Fondo: `#F6F3EC` (papel crema técnico).
   * Líneas divisorias: `rgba(0, 0, 0, 0.12)`.
   * Texto primario: `#1A1A1A`.
   * Texto secundario: `#737373`.
   * Acento corporativo: `#FF5C00`.
2. **Modo On-Camera Dark HUD (Overlay sobre video):**
   * Píldoras y cápsulas flotantes: `rgba(24, 24, 27, 0.90)` con `backdrop-filter: blur(16px)`.
   * Borde sutil: `1px solid rgba(255, 255, 255, 0.14)`.
   * Línea de conexión inactiva: `rgba(255, 255, 255, 0.25)`.
   * Nodos activos y conectores: `#FF5C00`.

### 1.5 Ritmo y Escalonado (*Staggering*)
* Delay estándar entre elementos contiguos: **6 a 8 frames** (a 60 FPS = ~100-130 ms).
* Duración estándar de tarjetas o módulos en pantalla: **2.5 a 5 segundos** por bloque conceptual.

---

## 2. Ficha Técnica Oficial WALA

```yaml
ESTILO_VISUAL_WALA_REMOTION:
  paleta_colores:
    fondo_paper: "#F6F3EC"
    fondo_dark_hud: "rgba(24, 24, 27, 0.90)"
    borde_dark_hud: "rgba(255, 255, 255, 0.14)"
    linea_divisoria_paper: "rgba(0, 0, 0, 0.12)"
    texto_tinta: "#1A1A1A"
    texto_secundario: "#737373"
    acento_naranja: "#FF5C00"
    superficie_tarjeta_blanca: "#FFFFFF"
    sombra_tarjeta: "0 14px 34px -10px rgba(0, 0, 0, 0.08), 0 4px 10px -4px rgba(0, 0, 0, 0.04)"

  tipografia:
    fuente_mono: "JetBrains Mono, Space Mono, 'Courier New', monospace"
    fuente_display: "system-ui, -apple-system, 'SF Pro Display', sans-serif"
    tracking_hud: "0.1em"

  fisica_animacion:
    snappy:
      damping: 14
      stiffness: 120
      mass: 0.8
    bouncy:
      damping: 10
      stiffness: 90
      mass: 0.9
    stagger_delay_frames: 8

  componentes_arquetipo:
    - WalaPaperHeader: Barra superior con título de bloque, tema y presupuesto animado.
    - WalaTimelineStepper: HUD horizontal oscuro con pasos conectados e indicador de avance.
    - IsometricWarehouse: Bodega de proveedor con techo naranja y persiana.
    - BrowserStoreCard: Ventana web blanca con precio y botón de compra naranja.
    - IsometricHouse: Vivienda del cliente con puerta naranja.
    - CashVoucherCard: Tickets troquelados con moneda $ y variantes simple/pila.
```

---

## 3. Relación con la App Web (`../../web/`)

La aplicación web WALA (`apps/web`) está construida en Vue 3 y maneja la base de datos operativa del negocio.
Para trasladar componentes de la web a video:
1. **No importar archivos `.vue`:** El motor de Remotion es React nativo.
2. **Replicar conceptos de dominio:** Usar los modelos de negocio de WALA (proveedor, orden de compra, catálogo, inventario en 0, flujo de caja).
3. **Usar los componentes de `src/WalaMotion/components/`:** Son los equivalentes visuales optimizados para video 9:16.
4. **Mockups con capturas reales:** Si se requiere mostrar una pantalla real de la plataforma WALA, embeber la captura de pantalla (`.png`) dentro del componente `BrowserStoreCard` o `PhoneCatalogMockup`.

---

## 4. Prompt Maestro para Claude / Agentes de IA

Cuando solicites a un agente la creación de una nueva escena o componente de video para WALA, utiliza este prompt:

```markdown
Actúa como un Desarrollador Senior de Remotion especializado en el WALA Motion Design System.

Crea un componente de escena en Remotion (`.tsx`) para representar [insertar concepto, ej: "el error de mezclar la caja personal con el inventario"].

Especificaciones técnicas obligatorias:
1. Resolución: 1080x1920 (9:16) a 60 fps.
2. Tokens: Importa los colores y resortes desde `src/WalaMotion/tokens.ts` (fondo `#F6F3EC`, acento `#FF5C00`, tipografía monospace tabular-nums).
3. Animaciones: 100% deterministas usando `useCurrentFrame()`, `useVideoConfig()`, `spring()` y `interpolate()`. Prohibido usar transiciones CSS o timers.
4. Escalonado (Stagger): Aplica delays de 6-8 frames entre elementos que ingresan secuencialmente.
5. Props tipadas con Zod y exportadas limpiamente para Remotion Studio.
```

---

## 5. Checklist de Verificación para Escenas WALA

- [ ] ¿El fondo utiliza `#F6F3EC` en modo paper o `#18181B` en modo dark HUD?
- [ ] ¿Los números usan `tabular-nums` y se animan con `Math.round(interpolate(...))` sin oscilación decimal?
- [ ] ¿El layout respeta los 1080×1920 y deja la zona inferior libre si hay un presentador?
- [ ] ¿Cada elemento animado tiene su propio offset de entrada (`frame - delayFrame`)?
- [ ] ¿El componente compila limpiamente sin advertencias de TypeScript?
