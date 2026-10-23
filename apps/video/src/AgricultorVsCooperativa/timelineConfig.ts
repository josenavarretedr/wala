import { BeatConfig, ComputedBeat } from "./types";

/**
 * CONFIGURACIÓN DE LÍNEA DE TIEMPO
 *
 * Puedes modificar los segundos de cada bloque en `durationInSeconds`
 * para sincronizarlo exactamente con el audio o voz en off.
 */
export const timelineBeats: BeatConfig[] = [
  // -------------------------------------------------------------
  // 0. INTRO GENERAL
  // -------------------------------------------------------------
  {
    id: "intro_general",
    title: "Vista General y Título",
    category: "intro",
    side: "both",
    durationInSeconds: 3.5,
    target: {
      centerX: 0.5,
      centerY: 0.42,
      zoom: 1.18,
    },
    hud: {
      badge: "MODELOS AGRÍCOLAS",
      headline: "AGRICULTOR vs COOPERATIVA",
      takeaway: "¿Cuáles son las diferencias críticas en ventas, pagos, compras y riesgo?",
      sideLabel: "COMPARATIVA",
    },
  },

  // -------------------------------------------------------------
  // 1. CLIENTE Y VENTAS
  // -------------------------------------------------------------
  {
    id: "ventas_agricultor",
    title: "Ventas: Agricultor Independiente",
    category: "ventas",
    side: "agricultor",
    durationInSeconds: 4.0,
    target: {
      centerX: 0.27,
      centerY: 0.272,
      zoom: 2.15,
    },
    highlight: {
      x: 0.045,
      y: 0.150,
      width: 0.445,
      height: 0.244,
      label: "AGRICULTOR · MERCADO LOCAL",
      accentColor: "#FF5C00",
    },
    hud: {
      badge: "01 · CLIENTE Y VENTAS",
      headline: "Venta Directa B2C",
      takeaway: "Comercialización directa al menudeo en plazas y ferias locales, con volumen limitado.",
      sideLabel: "AGRICULTOR INDEPENDIENTE",
    },
  },
  {
    id: "ventas_cooperativa",
    title: "Ventas: Cooperativa Agroindustrial",
    category: "ventas",
    side: "cooperativa",
    durationInSeconds: 4.0,
    target: {
      centerX: 0.73,
      centerY: 0.272,
      zoom: 2.15,
    },
    highlight: {
      x: 0.505,
      y: 0.150,
      width: 0.445,
      height: 0.244,
      label: "COOPERATIVA · B2B Y EXPORTACIÓN",
      accentColor: "#10B981",
    },
    hud: {
      badge: "01 · CLIENTE Y VENTAS",
      headline: "Consolidación a Gran Escala",
      takeaway: "Centro de acopio que reúne la cosecha para abastecer grandes industrias y barcos de exportación.",
      sideLabel: "COOPERATIVA AGROINDUSTRIAL",
    },
  },

  // -------------------------------------------------------------
  // 2. PAGOS Y PROVEEDORES
  // -------------------------------------------------------------
  {
    id: "pagos_agricultor",
    title: "Pagos: Agricultor Independiente",
    category: "pagos",
    side: "agricultor",
    durationInSeconds: 4.0,
    target: {
      centerX: 0.27,
      centerY: 0.485,
      zoom: 2.20,
    },
    highlight: {
      x: 0.045,
      y: 0.395,
      width: 0.445,
      height: 0.180,
      label: "AGRICULTOR · CUENTAS POR PAGAR",
      accentColor: "#FF5C00",
    },
    hud: {
      badge: "02 · PAGOS Y PROVEEDORES",
      headline: "Cuentas por Pagar Individuales",
      takeaway: "Trato directo y aislado con proveedores de fertilizantes y semillas, con plazos inflexibles.",
      sideLabel: "AGRICULTOR INDEPENDIENTE",
    },
  },
  {
    id: "pagos_cooperativa",
    title: "Pagos: Cooperativa Agroindustrial",
    category: "pagos",
    side: "cooperativa",
    durationInSeconds: 4.0,
    target: {
      centerX: 0.73,
      centerY: 0.485,
      zoom: 2.20,
    },
    highlight: {
      x: 0.505,
      y: 0.395,
      width: 0.445,
      height: 0.180,
      label: "COOPERATIVA · LIQUIDACIÓN A SOCIOS",
      accentColor: "#10B981",
    },
    hud: {
      badge: "02 · PAGOS Y PROVEEDORES",
      headline: "Gestión Mixta y Liquidaciones",
      takeaway: "Administración centralizada: negociación con proveedores y pagos transparentes por entrega a cada socio.",
      sideLabel: "COOPERATIVA AGROINDUSTRIAL",
    },
  },

  // -------------------------------------------------------------
  // 3. COMPRAS E INSUMOS
  // -------------------------------------------------------------
  {
    id: "compras_agricultor",
    title: "Compras: Agricultor Independiente",
    category: "compras",
    side: "agricultor",
    durationInSeconds: 4.0,
    target: {
      centerX: 0.27,
      centerY: 0.650,
      zoom: 2.25,
    },
    highlight: {
      x: 0.045,
      y: 0.575,
      width: 0.445,
      height: 0.155,
      label: "AGRICULTOR · PRECIO MINORISTA",
      accentColor: "#FF5C00",
    },
    hud: {
      badge: "03 · COMPRAS E INSUMOS",
      headline: "Insumos al por Menor",
      takeaway: "Compra individual de sacos de fertilizante a precios minoristas altos sin poder de negociación.",
      sideLabel: "AGRICULTOR INDEPENDIENTE",
    },
  },
  {
    id: "compras_cooperativa",
    title: "Compras: Cooperativa Agroindustrial",
    category: "compras",
    side: "cooperativa",
    durationInSeconds: 4.0,
    target: {
      centerX: 0.73,
      centerY: 0.650,
      zoom: 2.25,
    },
    highlight: {
      x: 0.505,
      y: 0.575,
      width: 0.445,
      height: 0.155,
      label: "COOPERATIVA · PRECIO MAYORISTA",
      accentColor: "#10B981",
    },
    hud: {
      badge: "03 · COMPRAS E INSUMOS",
      headline: "Compras Colectivas al por Mayor",
      takeaway: "Economías de escala: camiones enteros de insumos con tarifas preferenciales para toda la comunidad.",
      sideLabel: "COOPERATIVA AGROINDUSTRIAL",
    },
  },

  // -------------------------------------------------------------
  // 4. RIESGO Y DECISIONES
  // -------------------------------------------------------------
  {
    id: "riesgos_agricultor",
    title: "Riesgos: Agricultor Independiente",
    category: "riesgos",
    side: "agricultor",
    durationInSeconds: 4.0,
    target: {
      centerX: 0.27,
      centerY: 0.835,
      zoom: 2.20,
    },
    highlight: {
      x: 0.045,
      y: 0.730,
      width: 0.445,
      height: 0.215,
      label: "AGRICULTOR · RIESGO INDIVIDUAL",
      accentColor: "#EF4444",
    },
    hud: {
      badge: "04 · RIESGO Y DECISIONES",
      headline: "Riesgo Individual Total",
      takeaway: "Toma decisiones solo. Asume en soledad el impacto de plagas, sequías, granizadas y caídas de precio.",
      sideLabel: "AGRICULTOR INDEPENDIENTE",
    },
  },
  {
    id: "riesgos_cooperativa",
    title: "Riesgos: Cooperativa Agroindustrial",
    category: "riesgos",
    side: "cooperativa",
    durationInSeconds: 4.0,
    target: {
      centerX: 0.73,
      centerY: 0.835,
      zoom: 2.20,
    },
    highlight: {
      x: 0.505,
      y: 0.730,
      width: 0.445,
      height: 0.215,
      label: "COOPERATIVA · RIESGO COMPARTIDO",
      accentColor: "#10B981",
    },
    hud: {
      badge: "04 · RIESGO Y DECISIONES",
      headline: "Decisiones Democráticas y Respaldo",
      takeaway: "Consejo administrativo (1 socio, 1 voto). Fondos de contingencia y diversificación que amortiguan pérdidas.",
      sideLabel: "COOPERATIVA AGROINDUSTRIAL",
    },
  },

  // -------------------------------------------------------------
  // 5. OUTRO / SÍNTESIS
  // -------------------------------------------------------------
  {
    id: "outro_sintesis",
    title: "Resumen y Conclusión",
    category: "outro",
    side: "both",
    durationInSeconds: 4.5,
    target: {
      centerX: 0.5,
      centerY: 0.5,
      zoom: 1.05,
    },
    hud: {
      badge: "SÍNTESIS FINAL",
      headline: "El Poder de la Asociatividad",
      takeaway: "De competir en soledad a cooperar para conquistar mercados globales sostenibles.",
      sideLabel: "MODELO DE NEGOCIO",
    },
  },
];

/**
 * Procesa la lista de beats calculando frames de inicio, fin y duración total.
 */
export const getComputedTimeline = (fps: number = 60) => {
  let accumulatedFrames = 0;

  const beats: ComputedBeat[] = timelineBeats.map((beat, index) => {
    const durationInFrames = Math.round(beat.durationInSeconds * fps);
    const startFrame = accumulatedFrames;
    const endFrame = startFrame + durationInFrames;
    accumulatedFrames = endFrame;

    return {
      ...beat,
      startFrame,
      endFrame,
      durationInFrames,
      index,
    };
  });

  return {
    beats,
    totalFrames: accumulatedFrames,
    totalSeconds: accumulatedFrames / fps,
  };
};

/**
 * Obtiene el beat activo, anterior y siguiente para un frame dado.
 */
export const findActiveBeat = (frame: number, beats: ComputedBeat[]) => {
  const current =
    beats.find((b) => frame >= b.startFrame && frame < b.endFrame) ??
    beats[beats.length - 1];

  const prev = current.index > 0 ? beats[current.index - 1] : null;
  const next =
    current.index < beats.length - 1 ? beats[current.index + 1] : null;

  const frameInBeat = frame - current.startFrame;
  const progressInBeat = Math.min(
    1,
    Math.max(0, frameInBeat / current.durationInFrames)
  );

  return {
    current,
    prev,
    next,
    frameInBeat,
    progressInBeat,
  };
};
