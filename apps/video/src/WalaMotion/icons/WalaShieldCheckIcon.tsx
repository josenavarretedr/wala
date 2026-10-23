import React from "react";
import {
  WalaIconProps,
  DEFAULT_ICON_COLOR,
  DEFAULT_ICON_ACCENT,
  DEFAULT_STROKE_WIDTH,
} from "./types";

/**
 * 7. WalaShieldCheckIcon (Fila 2, Columna 3)
 * Escudo de protección y seguridad con silueta de usuario en naranja y sello de verificación en negro.
 */
export const WalaShieldCheckIcon: React.FC<WalaIconProps> = ({
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
      {/* Silueta de usuario dentro del escudo (Naranja) */}
      {/* Cabeza del usuario */}
      <circle
        cx="48"
        cy="36"
        r="7.5"
        stroke={accentColor}
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* Hombros / busto del usuario */}
      <path
        d="M 36 57 C 36 49 42 47 48 47 C 54 47 60 49 60 57"
        stroke={accentColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* Contorno orgánico del escudo de seguridad (Negro) */}
      <path
        d="M 28 24 C 38 23 44 25 48 25 C 52 25 58 23 68 24 C 70 36 68 50 59 62 M 48 76 C 36 68 26 50 28 24"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Círculo de verificación / Checkmark badge (Negro) */}
      <circle
        cx="72"
        cy="72"
        r="11"
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* Tilde / Checkmark */}
      <path
        d="M 66 72 L 70 76 L 78 67"
        stroke={color}
        strokeWidth={strokeWidth * 1.1}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
