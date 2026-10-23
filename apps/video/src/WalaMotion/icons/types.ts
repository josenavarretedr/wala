import React from "react";
import { WALA_COLORS } from "../tokens";

export interface WalaIconProps extends React.SVGProps<SVGSVGElement> {
  /**
   * Tamaño del icono en píxeles (ancho y alto). Por defecto 64.
   */
  size?: number | string;

  /**
   * Color de trazo primario / tinta. Por defecto "#1A1A1A" (WALA inkPrimary).
   */
  color?: string;

  /**
   * Color de acento corporativo. Por defecto "#FF5C00" (WALA brandOrange).
   */
  accentColor?: string;

  /**
   * Grosor de línea para el trazo de estilo doodle / manual. Por defecto 3.5.
   */
  strokeWidth?: number;

  /**
   * Clases CSS opcionales.
   */
  className?: string;
}

export const DEFAULT_ICON_COLOR = WALA_COLORS?.inkPrimary || "#1A1A1A";
export const DEFAULT_ICON_ACCENT = WALA_COLORS?.brandOrange || "#FF5C00";
export const DEFAULT_STROKE_WIDTH = 3.5;
