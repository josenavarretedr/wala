import React from "react";
import {
  WalaIconProps,
  DEFAULT_ICON_COLOR,
  DEFAULT_ICON_ACCENT,
  DEFAULT_STROKE_WIDTH,
} from "./types";

/**
 * 6. WalaMapLocationIcon (Fila 2, Columna 2)
 * Mapa plegado en 3 partes con rutas/caminos en naranja y cubo isométrico (paquete logístico) encima en negro.
 */
export const WalaMapLocationIcon: React.FC<WalaIconProps> = ({
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
      {/* Rutas y caminos sobre el mapa plegado (Naranja) */}
      <path
        d="M 26 73 L 38 60 M 34 76 L 39 70"
        stroke={accentColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <path
        d="M 45 68 L 54 58 L 59 66"
        stroke={accentColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 67 72 L 77 56"
        stroke={accentColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* Contorno del mapa plegado estilo tríptico (Negro) */}
      {/* Borde inferior plegado */}
      <path
        d="M 20 80 L 40 72 L 60 80 L 80 72"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Laterales y pliegues verticales */}
      <path d="M 20 80 L 20 54" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M 40 72 L 40 48" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M 60 80 L 60 50" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M 80 72 L 80 46" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      {/* Borde superior plegado parcial */}
      <path
        d="M 20 54 L 33 49 M 67 52 L 80 46"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* Cubo isométrico 3D / Paquete flotando sobre el mapa (Negro) */}
      {/* Cara superior romboidal */}
      <path
        d="M 50 16 L 65 24 L 50 33 L 35 24 Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Cara lateral izquierda */}
      <path
        d="M 35 24 L 35 40 L 50 49 L 50 33"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Cara lateral derecha */}
      <path
        d="M 65 24 L 65 40 L 50 49"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
