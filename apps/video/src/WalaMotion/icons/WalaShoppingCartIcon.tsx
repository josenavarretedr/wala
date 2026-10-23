import React from "react";
import {
  WalaIconProps,
  DEFAULT_ICON_COLOR,
  DEFAULT_ICON_ACCENT,
  DEFAULT_STROKE_WIDTH,
} from "./types";

/**
 * 19. WalaShoppingCartIcon (Fila 5, Columna 3)
 * Carrito de compras / ecommerce con rejilla metálica en naranja y estructura, ruedas y manillar en negro.
 */
export const WalaShoppingCartIcon: React.FC<WalaIconProps> = ({
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
      {/* Rejilla metálica interior del canasto (Naranja) */}
      {/* Alambres horizontales */}
      <path
        d="M 25 49 C 39 48 54 47.5 68 47"
        stroke={accentColor}
        strokeWidth={strokeWidth * 0.9}
        strokeLinecap="round"
      />
      <path
        d="M 28 57 C 40 56.5 52 56 65 55.5"
        stroke={accentColor}
        strokeWidth={strokeWidth * 0.9}
        strokeLinecap="round"
      />

      {/* Alambres verticales */}
      <path
        d="M 37 43 L 39 64"
        stroke={accentColor}
        strokeWidth={strokeWidth * 0.9}
        strokeLinecap="round"
      />
      <path
        d="M 48 42 L 50 64"
        stroke={accentColor}
        strokeWidth={strokeWidth * 0.9}
        strokeLinecap="round"
      />
      <path
        d="M 59 40 L 61 63"
        stroke={accentColor}
        strokeWidth={strokeWidth * 0.9}
        strokeLinecap="round"
      />

      {/* Manillar superior derecho (Negro) */}
      <path
        d="M 78 30 C 76 30 73 34 71 39"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* Estructura perimetral del canasto (Negro) */}
      <path
        d="M 71 39 L 23 42 C 22 42 22 44 23 46 L 29 65 L 67 64 L 71 39"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Barra de soporte / chasis inferior */}
      <path
        d="M 29 65 L 61 70"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* Rueda delantera izquierda (Negro) */}
      <circle
        cx="33"
        cy="79"
        r="6.5"
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
      />
      <circle cx="33" cy="79" r={strokeWidth * 0.6} fill={color} />

      {/* Rueda trasera derecha (Negro) */}
      <circle
        cx="63"
        cy="79"
        r="6.5"
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
      />
      <circle cx="63" cy="79" r={strokeWidth * 0.6} fill={color} />
    </svg>
  );
};
