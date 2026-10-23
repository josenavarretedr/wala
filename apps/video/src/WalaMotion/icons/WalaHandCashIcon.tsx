import React from "react";
import {
  WalaIconProps,
  DEFAULT_ICON_COLOR,
  DEFAULT_ICON_ACCENT,
  DEFAULT_STROKE_WIDTH,
} from "./types";

/**
 * 15. WalaHandCashIcon (Fila 4, Columna 3)
 * Mano entregando o recibiendo fajo de billetes con símbolo de dólar en naranja y mano en negro.
 */
export const WalaHandCashIcon: React.FC<WalaIconProps> = ({
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
      {/* Billetes de dinero en la mano (Naranja) */}
      {/* Billete trasero */}
      <path
        d="M 40 40 L 48 23 C 58 24 70 26 77 28 L 72 45"
        stroke={accentColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Billete frontal */}
      <path
        d="M 46 44 L 54 27 C 64 29 76 31 82 33 L 75 51"
        stroke={accentColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Símbolo de dólar ($) en el billete frontal (Naranja) */}
      <path
        d="M 68 37 C 66 35.5 63 36 63 38 C 63 41 68 41 68 43.5 C 68 46 65 46.5 63 45.5"
        stroke={accentColor}
        strokeWidth={strokeWidth * 0.85}
        strokeLinecap="round"
      />
      <path
        d="M 65.5 34 L 65.5 48"
        stroke={accentColor}
        strokeWidth={strokeWidth * 0.85}
        strokeLinecap="round"
      />

      {/* Mano sosteniendo los billetes estilo doodle (Negro) */}
      {/* Pulgar levantado / abrazando */}
      <path
        d="M 22 66 C 30 66 36 64 42 56 C 44 54 48 55 49 59 C 50 63 48 66 45 68"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Dedos doblados sujetando el fajo */}
      {/* Dedo índice */}
      <path
        d="M 46 64 L 64 64 C 68 64 70 67 67 70 L 61 71"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* Dedo medio */}
      <path
        d="M 61 71 C 65 71 67 74 65 76 L 58 77"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* Dedo anular / meñique */}
      <path
        d="M 58 77 C 62 77 63 80 61 82 L 52 82"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* Muñeca y base de la mano */}
      <path
        d="M 52 82 C 40 82 32 80 22 75"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
};
