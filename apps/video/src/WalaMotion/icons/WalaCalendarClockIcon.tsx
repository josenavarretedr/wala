import React from "react";
import {
  WalaIconProps,
  DEFAULT_ICON_COLOR,
  DEFAULT_ICON_ACCENT,
  DEFAULT_STROKE_WIDTH,
} from "./types";

/**
 * 2. WalaCalendarClockIcon (Fila 1, Columna 2)
 * Calendario con anillas superiores y puntos de fechas en naranja, y reloj en esquina inferior derecha.
 */
export const WalaCalendarClockIcon: React.FC<WalaIconProps> = ({
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
      {/* Anillas superiores del calendario (Naranja) */}
      <path
        d="M 36 28 C 36 17 44 17 44 28"
        stroke={accentColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <path
        d="M 62 28 C 62 17 70 17 70 28"
        stroke={accentColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* Cuerpo principal del calendario estilo doodle */}
      <path
        d="M 28 26 L 78 26 C 83 26 86 29 86 35 L 86 52 M 86 52 C 86 54 85 55 84 55 M 28 26 C 22 26 19 30 19 36 L 19 72 C 19 78 23 82 29 82 L 56 82"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Puntos de días en la cuadrícula (Naranja) */}
      {/* Fila 1 */}
      <circle cx="31" cy="40" r={strokeWidth * 0.8} fill={accentColor} />
      <circle cx="43" cy="40" r={strokeWidth * 0.8} fill={accentColor} />
      <circle cx="55" cy="40" r={strokeWidth * 0.8} fill={accentColor} />
      <circle cx="67" cy="40" r={strokeWidth * 0.8} fill={accentColor} />

      {/* Fila 2 */}
      <circle cx="31" cy="52" r={strokeWidth * 0.8} fill={accentColor} />
      <circle cx="43" cy="52" r={strokeWidth * 0.8} fill={accentColor} />
      <circle cx="55" cy="52" r={strokeWidth * 0.8} fill={accentColor} />

      {/* Fila 3 */}
      <circle cx="31" cy="64" r={strokeWidth * 0.8} fill={accentColor} />
      <circle cx="43" cy="64" r={strokeWidth * 0.8} fill={accentColor} />

      {/* Reloj inferior derecho superpuesto (Negro) */}
      <path
        d="M 72 56 C 81 56 88 63 88 72 C 88 81 81 88 72 88 C 63 88 56 81 56 72 C 56 63 63 56 72 56 Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Manecillas del reloj (9:00) */}
      <path
        d="M 72 72 L 72 63"
        stroke={color}
        strokeWidth={strokeWidth * 0.9}
        strokeLinecap="round"
      />
      <path
        d="M 72 72 L 64 72"
        stroke={color}
        strokeWidth={strokeWidth * 0.9}
        strokeLinecap="round"
      />
    </svg>
  );
};
