import React from "react";
import {
  WalaIconProps,
  DEFAULT_ICON_COLOR,
  DEFAULT_ICON_ACCENT,
  DEFAULT_STROKE_WIDTH,
} from "./types";

/**
 * 1. WalaClockIcon (Fila 1, Columna 1)
 * Reloj analógico estilo boceto manual con marcas horarias y manecilla minutera en color naranja de acento.
 */
export const WalaClockIcon: React.FC<WalaIconProps> = ({
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
      {/* Contorno orgánico del reloj */}
      <path
        d="M 50 14 C 71 13 87 28.5 86.5 50 C 86 71.5 70 86.5 50 86 C 29.5 85.5 13.5 70 14 50 C 14.5 29 30.5 14.5 50 14 Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Marcas horarias perimetrales */}
      {/* 12 h */}
      <path d="M 50 20 L 50 26" stroke={color} strokeWidth={strokeWidth * 0.9} strokeLinecap="round" />
      {/* 1 h */}
      <path d="M 66 24.5 L 63 29.5" stroke={color} strokeWidth={strokeWidth * 0.9} strokeLinecap="round" />
      {/* 2 h */}
      <path d="M 77 35.5 L 72 38.5" stroke={color} strokeWidth={strokeWidth * 0.9} strokeLinecap="round" />
      {/* 3 h */}
      <path d="M 80 50 L 74 50" stroke={color} strokeWidth={strokeWidth * 0.9} strokeLinecap="round" />
      {/* 4 h */}
      <path d="M 77 64.5 L 72 61.5" stroke={color} strokeWidth={strokeWidth * 0.9} strokeLinecap="round" />
      {/* 5 h */}
      <path d="M 66 75.5 L 63 70.5" stroke={color} strokeWidth={strokeWidth * 0.9} strokeLinecap="round" />
      {/* 6 h */}
      <path d="M 50 80 L 50 74" stroke={color} strokeWidth={strokeWidth * 0.9} strokeLinecap="round" />
      {/* 7 h */}
      <path d="M 34 75.5 L 37 70.5" stroke={color} strokeWidth={strokeWidth * 0.9} strokeLinecap="round" />
      {/* 8 h */}
      <path d="M 23 64.5 L 28 61.5" stroke={color} strokeWidth={strokeWidth * 0.9} strokeLinecap="round" />
      {/* 9 h */}
      <path d="M 20 50 L 26 50" stroke={color} strokeWidth={strokeWidth * 0.9} strokeLinecap="round" />
      {/* 10 h */}
      <path d="M 23 35.5 L 28 38.5" stroke={color} strokeWidth={strokeWidth * 0.9} strokeLinecap="round" />
      {/* 11 h */}
      <path d="M 34 24.5 L 37 29.5" stroke={color} strokeWidth={strokeWidth * 0.9} strokeLinecap="round" />

      {/* Manecilla horaria corta (Negra) hacia ~4:30 */}
      <path
        d="M 50 50 C 54 53 58 57 62 61"
        stroke={color}
        strokeWidth={strokeWidth * 1.1}
        strokeLinecap="round"
      />

      {/* Manecilla minutera larga con trazo curvo orgánico (Naranja corporativo) */}
      <path
        d="M 50 50 C 49 41 48 33 49 24"
        stroke={accentColor}
        strokeWidth={strokeWidth * 1.15}
        strokeLinecap="round"
      />

      {/* Punto de pivote central */}
      <circle cx="50" cy="50" r={strokeWidth * 0.7} fill={color} />
    </svg>
  );
};
