export type QuadrantCategory =
  | "intro"
  | "ventas"
  | "pagos"
  | "compras"
  | "riesgos"
  | "outro";

export type EntitySide = "agricultor" | "cooperativa" | "both" | "none";

export interface CameraTarget {
  /** X coordinate in normalized 0..1 units (0 = left, 1 = right) */
  centerX: number;
  /** Y coordinate in normalized 0..1 units (0 = top, 1 = bottom) */
  centerY: number;
  /** Zoom scale multiplier (1.0 = full sheet view, 2.0 = close-up) */
  zoom: number;
}

export interface HighlightBoxConfig {
  /** Left in normalized 0..1 units */
  x: number;
  /** Top in normalized 0..1 units */
  y: number;
  /** Width in normalized 0..1 units */
  width: number;
  /** Height in normalized 0..1 units */
  height: number;
  /** Badge text displayed on top of the highlight */
  label: string;
  /** Primary accent color for the border glow */
  accentColor?: string;
}

export interface HudConfig {
  /** Chapter tag, e.g. "01 · CLIENTE Y VENTAS" */
  badge: string;
  /** Headline title */
  headline: string;
  /** Key takeaway sentence shown in the bottom card */
  takeaway: string;
  /** Active side badge label */
  sideLabel?: string;
}

export interface BeatConfig {
  id: string;
  title: string;
  category: QuadrantCategory;
  side: EntitySide;
  /** Duration in seconds - easy to adjust to match audio voiceovers */
  durationInSeconds: number;
  /** Camera framing target */
  target: CameraTarget;
  /** Animated highlight border (optional) */
  highlight?: HighlightBoxConfig;
  /** HUD and subtitles */
  hud: HudConfig;
}

export interface ComputedBeat extends BeatConfig {
  startFrame: number;
  endFrame: number;
  durationInFrames: number;
  index: number;
}
