/**
 * Tokens de diseño oficiales para WALA Motion Design System en Remotion.
 * Centraliza colores, tipografías, dimensiones y físicas de resorte.
 */

export const WALA_COLORS = {
  // Modo Paper Editorial (Capturas 1 & 2)
  paperBg: "#F6F3EC",
  paperDivider: "rgba(0, 0, 0, 0.12)",
  paperDividerStrong: "rgba(0, 0, 0, 0.22)",
  inkPrimary: "#1A1A1A",
  inkSecondary: "#52525B",
  inkMuted: "#71717A",
  inkLight: "#A1A1AA",

  // Color de acento corporativo WALA
  brandOrange: "#FF5C00",
  brandOrangeHover: "#E65300",
  brandOrangeLight: "#FFF0EB",
  brandOrangeBorder: "rgba(255, 92, 0, 0.35)",

  // Modo On-Camera HUD (Captura 3)
  hudDarkBg: "rgba(24, 24, 27, 0.90)",
  hudDarkBgSolid: "#18181B",
  hudBorder: "rgba(255, 255, 255, 0.14)",
  hudText: "#FFFFFF",
  hudTextMuted: "rgba(255, 255, 255, 0.55)",
  hudConnectorInactive: "rgba(255, 255, 255, 0.24)",
  hudConnectorActive: "#FF5C00",

  // Tarjetas y Superficies
  cardBg: "#FFFFFF",
  cardBorder: "rgba(0, 0, 0, 0.12)",
  cardBorderHeavy: "#1A1A1A",
  cardShadow: "0 18px 38px -12px rgba(0, 0, 0, 0.08), 0 8px 16px -6px rgba(0, 0, 0, 0.04)",
  cardShadowSubtle: "0 10px 24px -8px rgba(0, 0, 0, 0.06)",

  // Paleta Isométrica (Objetos 3D de Captura 1)
  isometric: {
    warehouseRoof: "#FF5C00",
    warehouseWallLeft: "#1F1F23",
    warehouseWallRight: "#2D2D32",
    warehouseDoor: "#3F3F46",
    warehouseDoorShutter: "#52525B",
    warehouseWindow: "#FDDBC7",
    houseRoofLeft: "#18181B",
    houseRoofRight: "#27272A",
    houseWallLeft: "#F5F0E8",
    houseWallRight: "#E5DFD4",
    houseDoor: "#FF5C00",
    houseWindow: "#A8D4F0",
  },
} as const;

export const WALA_FONTS = {
  mono: "'JetBrains Mono', 'Space Mono', 'Courier New', monospace",
  display: "system-ui, -apple-system, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif",
  serif: "'Georgia', 'Cambria', 'Times New Roman', serif",
} as const;

export const WALA_SPRINGS = {
  // Para tarjetas de UI, ventanas y transiciones limpias
  snappy: {
    damping: 14,
    stiffness: 120,
    mass: 0.8,
  },
  // Para iconos isométricos, sellos y llamadas de atención
  bouncy: {
    damping: 10,
    stiffness: 90,
    mass: 0.9,
  },
  // Para barras continuas y líneas de progreso
  smooth: {
    damping: 20,
    stiffness: 80,
    mass: 1.0,
  },
  // Para balanceo suave y respiración flotante
  gentle: {
    damping: 16,
    stiffness: 100,
    mass: 0.9,
  },
} as const;

export const WALA_LAYOUT = {
  width: 1080,
  height: 1920,
  headerTop: 130,
  canvasCenterY: 760,
  // En tomas con presentador, no colocar elementos interactivos densos debajo de esta línea:
  speakerBoundaryY: 1340,
} as const;
