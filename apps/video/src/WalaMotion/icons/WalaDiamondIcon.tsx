import React from "react";
import {
  WalaIconProps,
  DEFAULT_ICON_COLOR,
  DEFAULT_ICON_ACCENT,
  DEFAULT_STROKE_WIDTH,
} from "./types";

/**
 * 14. WalaDiamondIcon (Fila 4, Columna 2)
 * Diamante tallado de calidad/joya con destellos radiales de brillo en naranja y cuerpo facetado en negro.
 */
export const WalaDiamondIcon: React.FC<WalaIconProps> = ({
  size = 64,
  color = DEFAULT_ICON_COLOR,
  accentColor = DEFAULT_ICON_ACCENT,
  strokeWidth = DEFAULT_STROKE_WIDTH,
  className,
  style,
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle", ...style }}
      {...props}
    >
      {/* 6 destellos de brillo radial alrededor del diamante (Naranja) */}
      <path d="M 50 22 L 50 30" stroke={accentColor} strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M 23 31 L 30 37" stroke={accentColor} strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M 77 31 L 70 37" stroke={accentColor} strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M 23 69 L 30 64" stroke={accentColor} strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M 77 69 L 70 64" stroke={accentColor} strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M 50 86 L 50 94" stroke={accentColor} strokeWidth={strokeWidth} strokeLinecap="round" />

      {/* Contorno exterior del diamante (Negro) */}
      <path
        d="M 37 40 L 63 40 L 78 50 L 50 80 L 22 50 Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Cintura horizontal */}
      <path
        d="M 22 50 L 78 50"
        stroke={color}
        strokeWidth={strokeWidth * 0.9}
        strokeLinecap="round"
      />

      {/* Facetas de la corona superior */}
      <path
        d="M 37 40 L 45 50 M 63 40 L 55 50"
        stroke={color}
        strokeWidth={strokeWidth * 0.9}
        strokeLinecap="round"
      />

      {/* Facetas del pabellón inferior convergentes al vértice */}
      <path
        d="M 45 50 L 50 80 L 55 50"
        stroke={color}
        strokeWidth={strokeWidth * 0.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
