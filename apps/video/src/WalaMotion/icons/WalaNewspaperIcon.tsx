import React from "react";
import {
  WalaIconProps,
  DEFAULT_ICON_COLOR,
  DEFAULT_ICON_ACCENT,
  DEFAULT_STROKE_WIDTH,
} from "./types";

/**
 * 21. WalaNewspaperIcon (Fila 6, Columna 1)
 * Periódico / artículo de prensa con titular y pliegues en negro y líneas de texto editorial en naranja.
 */
export const WalaNewspaperIcon: React.FC<WalaIconProps> = ({
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
      {/* Líneas de texto editorial del artículo (Naranja) */}
      <path
        d="M 27 53 C 41 52.5 56 52.5 71 53"
        stroke={accentColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <path
        d="M 27 61 C 41 60.5 56 60.5 71 61"
        stroke={accentColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <path
        d="M 27 69 C 37 68.5 48 68.5 58 69"
        stroke={accentColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* Contorno del periódico doblado estilo doodle (Negro) */}
      <path
        d="M 22 24 L 73 24 C 77 24 79 27 79 31 L 79 78 C 79 82 76 84 72 84 L 22 84 C 18 84 16 81 16 77 L 16 31 C 16 27 18 24 22 24 Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Pliegue / volumen de páginas en el lomo derecho */}
      <path
        d="M 79 31 L 84 36 L 84 78 L 79 83"
        stroke={color}
        strokeWidth={strokeWidth * 0.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Cuadro de titular / imagen en la parte superior (Negro) */}
      <path
        d="M 26 31 L 56 31 L 56 44 L 26 44 Z"
        stroke={color}
        strokeWidth={strokeWidth * 0.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Líneas cortas junto al titular (Negro) */}
      <path
        d="M 62 34 L 72 34 M 62 41 L 72 41"
        stroke={color}
        strokeWidth={strokeWidth * 0.9}
        strokeLinecap="round"
      />
    </svg>
  );
};
