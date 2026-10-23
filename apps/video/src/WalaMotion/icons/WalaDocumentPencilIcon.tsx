import React from "react";
import {
  WalaIconProps,
  DEFAULT_ICON_COLOR,
  DEFAULT_ICON_ACCENT,
  DEFAULT_STROKE_WIDTH,
} from "./types";

/**
 * 3. WalaDocumentPencilIcon (Fila 1, Columna 3)
 * Hoja de documento con líneas de texto en naranja y lápiz/pluma escribiendo en ángulo.
 */
export const WalaDocumentPencilIcon: React.FC<WalaIconProps> = ({
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
      {/* Contorno de la hoja de papel estilo doodle (Negro) */}
      <path
        d="M 24 18 C 36 17 56 18 64 18 C 68 18 70 20 70 24 L 70 38 M 70 54 L 70 78 C 70 82 66 85 62 85 L 24 85 C 20 85 18 82 18 78 L 18 24 C 18 20 20 18 24 18 Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Líneas de texto manuscrito en el documento (Naranja) */}
      <path
        d="M 28 32 C 34 31 46 32 54 32"
        stroke={accentColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <path
        d="M 28 46 C 36 45.5 44 46 50 46"
        stroke={accentColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <path
        d="M 28 60 C 38 59 48 60 56 60"
        stroke={accentColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* Lápiz / Pluma escribiendo (Negro) */}
      {/* Extremo superior / borrador */}
      <path
        d="M 76 16 C 81 12 87 18 83 23"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* Cuerpo del lápiz inclinado */}
      <path
        d="M 76 16 L 62 30 L 72 40 L 83 23"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Punta cónica que escribe en el papel */}
      <path
        d="M 62 30 L 53 43 C 54 44 55 45 56 46 L 72 40"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Punta de grafito fina */}
      <path
        d="M 53 43 L 50 47"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
};
