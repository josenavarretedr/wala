import React from "react";
import {
  WalaIconProps,
  DEFAULT_ICON_COLOR,
  DEFAULT_ICON_ACCENT,
  DEFAULT_STROKE_WIDTH,
} from "./types";

/**
 * 13. WalaBanknoteIcon (Fila 4, Columna 1)
 * Billete de dinero / efectivo con marco interior, corchetes y símbolo de dólar [$] en naranja.
 */
export const WalaBanknoteIcon: React.FC<WalaIconProps> = ({
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
      {/* Marco perimetral exterior del billete con onda estilo doodle (Negro) */}
      <path
        d="M 19 35 C 32 30 65 31 81 37 C 86 39 85 45 83 55 C 81 65 77 71 69 70 C 50 72 32 72 17 65 C 13 62 13 54 15 45 C 16 39 17 36 19 35 Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Marco interior del billete (Naranja) */}
      <path
        d="M 26 40 C 40 37 60 38 73 42 C 75 47 74 54 72 61 C 60 63 39 63 25 58 C 24 52 24 46 26 40 Z"
        stroke={accentColor}
        strokeWidth={strokeWidth * 0.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Corchete izquierdo '[' (Naranja) */}
      <path
        d="M 37 46 L 34 46 L 34 56 L 37 56"
        stroke={accentColor}
        strokeWidth={strokeWidth * 0.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Símbolo de dólar '$' central (Naranja) */}
      <path
        d="M 52 46 C 48.5 44.5 45.5 45.5 45.5 48 C 45.5 51 52.5 51 52.5 54 C 52.5 57 49 57.5 46 56"
        stroke={accentColor}
        strokeWidth={strokeWidth * 0.95}
        strokeLinecap="round"
      />
      <path
        d="M 49 42.5 L 49 59.5"
        stroke={accentColor}
        strokeWidth={strokeWidth * 0.95}
        strokeLinecap="round"
      />

      {/* Corchete derecho ']' (Naranja) */}
      <path
        d="M 61 46 L 64 46 L 64 56 L 61 56"
        stroke={accentColor}
        strokeWidth={strokeWidth * 0.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
