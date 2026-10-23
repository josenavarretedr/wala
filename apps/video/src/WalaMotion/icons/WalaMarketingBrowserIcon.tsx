import React from "react";
import {
  WalaIconProps,
  DEFAULT_ICON_COLOR,
  DEFAULT_ICON_ACCENT,
  DEFAULT_STROKE_WIDTH,
} from "./types";

/**
 * 11. WalaMarketingBrowserIcon (Fila 3, Columna 3)
 * Navegador web con puntos de control y ondas sonoras en naranja, y megáfono de marketing en negro.
 */
export const WalaMarketingBrowserIcon: React.FC<WalaIconProps> = ({
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
      {/* 3 puntos de control de la ventana del navegador (Naranja) */}
      <circle cx="27" cy="28" r={strokeWidth * 0.7} fill={accentColor} />
      <circle cx="34" cy="28" r={strokeWidth * 0.7} fill={accentColor} />
      <circle cx="41" cy="28" r={strokeWidth * 0.7} fill={accentColor} />

      {/* Ondas sonoras de difusión / rayos de marketing (Naranja) */}
      <path
        d="M 73 45 L 83 39"
        stroke={accentColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <path
        d="M 77 56 L 86 56"
        stroke={accentColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <path
        d="M 73 68 L 83 74"
        stroke={accentColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* Ventana del navegador estilo doodle (Negro) */}
      <path
        d="M 24 20 L 76 20 C 81 20 84 23 84 28 L 84 66 C 84 71 81 74 76 74 L 24 74 C 19 74 16 71 16 66 L 16 28 C 16 23 19 20 24 20 Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Barra de título del navegador (Negro) */}
      <path
        d="M 16 35 L 84 35"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* Megáfono / Bocina de difusión (Negro) */}
      {/* Campana / salida del megáfono */}
      <path
        d="M 64 47 C 69 49 71 53 71 58 C 71 63 68 67 63 69"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* Cuerpo cónico */}
      <path
        d="M 64 47 L 46 54 L 46 63 L 63 69"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Boquilla trasera */}
      <path
        d="M 46 54 C 43 54 41 56 41 58.5 C 41 61 43 63 46 63"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* Mango del megáfono */}
      <path
        d="M 48 63 L 45 72"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
};
