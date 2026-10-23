import React from "react";
import {
  WalaIconProps,
  DEFAULT_ICON_COLOR,
  DEFAULT_ICON_ACCENT,
  DEFAULT_STROKE_WIDTH,
} from "./types";

/**
 * 22. WalaGeometricShapesIcon (Fila 6, Columna 2)
 * Cuatro formas geométricas básicas: triángulo, círculo y cuadrado en negro, y estrella en naranja.
 */
export const WalaGeometricShapesIcon: React.FC<WalaIconProps> = ({
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
      {/* 1. Triángulo superior izquierdo (Negro) */}
      <path
        d="M 33 21 L 47 43 C 47.5 44 47 45 45.5 45 L 20.5 45 C 19 45 18.5 44 19 43 L 33 21 Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 2. Círculo superior derecho (Negro) */}
      <circle
        cx="68"
        cy="33"
        r="11.5"
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
      />

      {/* 3. Cuadrado inferior izquierdo (Negro) */}
      <path
        d="M 21 59 L 43 59 C 45 59 46 60 46 62 L 46 81 C 46 83 45 84 43 84 L 21 84 C 19 84 18 83 18 81 L 18 62 C 18 60 19 59 21 59 Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 4. Estrella de 5 puntas inferior derecha (Naranja) */}
      <path
        d="M 68 55 L 71.5 63.5 L 81 64 L 74 70 L 76.5 79.5 L 68 74.5 L 59.5 79.5 L 62 70 L 55 64 L 64.5 63.5 Z"
        stroke={accentColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
