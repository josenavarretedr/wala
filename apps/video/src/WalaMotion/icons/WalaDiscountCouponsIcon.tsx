import React from "react";
import {
  WalaIconProps,
  DEFAULT_ICON_COLOR,
  DEFAULT_ICON_ACCENT,
  DEFAULT_STROKE_WIDTH,
} from "./types";

/**
 * 17. WalaDiscountCouponsIcon (Fila 5, Columna 1)
 * Cupones de descuento apilados con tarjetas de fondo en naranja y tarjeta frontal con '%' en negro.
 */
export const WalaDiscountCouponsIcon: React.FC<WalaIconProps> = ({
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
      {/* Primer cupón de fondo en la pila (Naranja) */}
      <path
        d="M 24 30 L 72 20 C 76 19 80 22 81 26 L 86 44"
        stroke={accentColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Segundo cupón intermedio en la pila (Naranja) */}
      <path
        d="M 21 40 L 74 29 C 78 28 82 31 83 35 L 87 52"
        stroke={accentColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Cupón frontal principal (Negro) */}
      <path
        d="M 24 45 L 78 55 C 82 56 84 60 83 64 L 74 81 C 73 85 69 88 65 87 L 16 75 C 12 74 10 70 11 66 L 18 49 C 19 45 22 43 26 44 Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Símbolo de porcentaje '%' en el cupón frontal (Negro) */}
      {/* Barra diagonal */}
      <path
        d="M 57 58 L 38 78"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* Círculo superior izquierdo */}
      <circle
        cx="41"
        cy="63"
        r={strokeWidth * 0.9}
        stroke={color}
        strokeWidth={strokeWidth * 0.85}
        fill="none"
      />
      {/* Círculo inferior derecho */}
      <circle
        cx="54"
        cy="74"
        r={strokeWidth * 0.9}
        stroke={color}
        strokeWidth={strokeWidth * 0.85}
        fill="none"
      />
    </svg>
  );
};
