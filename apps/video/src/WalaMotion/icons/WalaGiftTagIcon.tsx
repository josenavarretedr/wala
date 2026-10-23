import React from "react";
import {
  WalaIconProps,
  DEFAULT_ICON_COLOR,
  DEFAULT_ICON_ACCENT,
  DEFAULT_STROKE_WIDTH,
} from "./types";

/**
 * 20. WalaGiftTagIcon (Fila 5, Columna 4)
 * Caja de regalo con lazo en negro y etiqueta colgante de precio / promoción en naranja.
 */
export const WalaGiftTagIcon: React.FC<WalaIconProps> = ({
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
      {/* Hilo / cuerda de la etiqueta colgante (Naranja) */}
      <path
        d="M 52 35 C 64 40 70 48 74 54"
        stroke={accentColor}
        strokeWidth={strokeWidth * 0.9}
        strokeLinecap="round"
      />

      {/* Etiqueta de precio / regalo en ángulo (Naranja) */}
      <path
        d="M 74 54 L 84 64 L 75 79 L 65 69 Z"
        stroke={accentColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Orificio troquelado de la etiqueta */}
      <circle
        cx="74"
        cy="61"
        r={strokeWidth * 0.65}
        stroke={accentColor}
        strokeWidth={strokeWidth * 0.8}
        fill="none"
      />

      {/* Lazo / moño superior de la caja de regalo (Negro) */}
      {/* Bucle izquierdo del lazo */}
      <path
        d="M 50 34 C 44 26 36 28 42 34 C 46 38 50 35 50 34"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Bucle derecho del lazo */}
      <path
        d="M 50 34 C 56 26 64 28 58 34 C 54 38 50 35 50 34"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Cara superior de la caja de regalo (Negro) */}
      <path
        d="M 33 38 L 51 34 L 71 42 L 51 47 Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Cara frontal izquierda de la caja */}
      <path
        d="M 33 38 L 33 67 L 51 76 L 51 47"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Cara frontal derecha de la caja */}
      <path
        d="M 51 47 L 51 76 L 71 67 L 71 42"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Cinta de regalo vertical envolviendo el paquete */}
      <path
        d="M 42 41 L 42 71"
        stroke={color}
        strokeWidth={strokeWidth * 0.9}
        strokeLinecap="round"
      />
      <path
        d="M 61 44 L 61 71"
        stroke={color}
        strokeWidth={strokeWidth * 0.9}
        strokeLinecap="round"
      />
    </svg>
  );
};
