import React from "react";
import {
  WalaIconProps,
  DEFAULT_ICON_COLOR,
  DEFAULT_ICON_ACCENT,
  DEFAULT_STROKE_WIDTH,
} from "./types";

/**
 * 10. WalaDonutChartIcon (Fila 3, Columna 2)
 * Gráfico circular de dona / métricas de negocio con 4 sectores y el segmento superior destacado en naranja.
 */
export const WalaDonutChartIcon: React.FC<WalaIconProps> = ({
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
      {/* Sector superior derecho destacado (Naranja) */}
      <path
        d="M 54 15 C 69 16 82 28 85 43 L 68 46 C 66 38 59 31 53 30 Z"
        stroke={accentColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Sector inferior derecho (Negro) */}
      <path
        d="M 85 53 C 83 69 70 82 54 85 L 53 68 C 60 67 66 61 68 53 Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Sector inferior izquierdo (Negro) */}
      <path
        d="M 46 85 C 30 83 17 70 15 54 L 32 53 C 33 60 40 66 47 68 Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Sector superior izquierdo (Negro) */}
      <path
        d="M 15 46 C 17 30 29 17 46 15 L 47 32 C 39 33 33 39 32 47 Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
