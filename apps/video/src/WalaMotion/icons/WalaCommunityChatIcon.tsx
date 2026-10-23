import React from "react";
import {
  WalaIconProps,
  DEFAULT_ICON_COLOR,
  DEFAULT_ICON_ACCENT,
  DEFAULT_STROKE_WIDTH,
} from "./types";

/**
 * 12. WalaCommunityChatIcon (Fila 3, Columna 4)
 * Dos personas conversando (colaboración / comunidad) con globo de diálogo y líneas de charla en naranja.
 */
export const WalaCommunityChatIcon: React.FC<WalaIconProps> = ({
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
      {/* Líneas de conversación en el globo (Naranja) */}
      <path
        d="M 33 26 C 44 25.5 56 25.5 67 26"
        stroke={accentColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <path
        d="M 33 34 C 41 33.5 50 33.5 58 34"
        stroke={accentColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* Globo de diálogo superior (Negro) */}
      <path
        d="M 28 18 L 72 18 C 77 18 80 21 80 26 L 80 38 C 80 43 77 46 72 46 L 54 46 L 46 54 L 48 46 L 28 46 C 23 46 20 43 20 38 L 20 26 C 20 21 23 18 28 18 Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Persona izquierda (Negro) */}
      {/* Cabeza */}
      <circle
        cx="34"
        cy="60"
        r="7.5"
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* Hombros */}
      <path
        d="M 20 80 C 20 71 27 68 34 68 C 40 68 45 71 46 80"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* Persona derecha (Negro) */}
      {/* Cabeza */}
      <circle
        cx="70"
        cy="56"
        r="9"
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* Cabello / detalle */}
      <path
        d="M 64 51 C 67 48 74 50 78 54"
        stroke={color}
        strokeWidth={strokeWidth * 0.9}
        strokeLinecap="round"
      />
      {/* Hombros */}
      <path
        d="M 54 80 C 54 70 61 66 70 66 C 79 66 86 70 86 80"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
};
