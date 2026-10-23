import React from "react";
import {
  WalaIconProps,
  DEFAULT_ICON_COLOR,
  DEFAULT_ICON_ACCENT,
  DEFAULT_STROKE_WIDTH,
} from "./types";

/**
 * 9. WalaFreelancerIcon (Fila 3, Columna 1)
 * Desarrollador / Freelancer trabajando en laptop con símbolos de dinero ($ $) en naranja flotando.
 */
export const WalaFreelancerIcon: React.FC<WalaIconProps> = ({
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
      {/* Símbolos de dinero ($) flotando arriba a la izquierda (Naranja) */}
      {/* Primer signo $ (más grande a la izquierda) */}
      <path
        d="M 28 26 C 24 24 20 25 20 28 C 20 32 28 32 28 36 C 28 40 24 41 20 39"
        stroke={accentColor}
        strokeWidth={strokeWidth * 0.9}
        strokeLinecap="round"
      />
      <path
        d="M 24 21 L 24 43"
        stroke={accentColor}
        strokeWidth={strokeWidth * 0.9}
        strokeLinecap="round"
      />

      {/* Segundo signo $ (más pequeño arriba al centro) */}
      <path
        d="M 45 19 C 42 17.5 39 18 39 20.5 C 39 23.5 45 23.5 45 26.5 C 45 29.5 42 30 39 28.5"
        stroke={accentColor}
        strokeWidth={strokeWidth * 0.85}
        strokeLinecap="round"
      />
      <path
        d="M 42 15 L 42 32"
        stroke={accentColor}
        strokeWidth={strokeWidth * 0.85}
        strokeLinecap="round"
      />

      {/* Persona sonriente (Negro) */}
      {/* Cabeza */}
      <circle
        cx="70"
        cy="34"
        r="10"
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* Rostro feliz: ojos y sonrisa */}
      <circle cx="67" cy="33" r={strokeWidth * 0.6} fill={color} />
      <circle cx="73" cy="33" r={strokeWidth * 0.6} fill={color} />
      <path
        d="M 66 38 C 68 41 72 41 74 38"
        stroke={color}
        strokeWidth={strokeWidth * 0.8}
        strokeLinecap="round"
      />

      {/* Cuerpo y hombros */}
      <path
        d="M 58 68 C 57 55 64 48 72 48 C 80 48 86 54 85 68"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* Laptop abierta en el escritorio (Negro) */}
      {/* Pantalla de la laptop inclinada */}
      <path
        d="M 18 47 L 44 47 L 46 68 L 22 68 Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Base / teclado y mesa */}
      <path
        d="M 18 68 L 54 68"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* Brazo del usuario escribiendo en el teclado */}
      <path
        d="M 60 58 C 55 62 50 67 46 68"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
};
