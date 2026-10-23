import React from "react";
import {
  WalaIconProps,
  DEFAULT_ICON_COLOR,
  DEFAULT_ICON_ACCENT,
  DEFAULT_STROKE_WIDTH,
} from "./types";

/**
 * 4. WalaTextFrameIcon (Fila 1, Columna 4)
 * Marco delimitador de texto / caja tipográfica con nodos de anclaje en naranja y letra T con líneas de texto en negro.
 */
export const WalaTextFrameIcon: React.FC<WalaIconProps> = ({
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
      {/* 4 nodos circulares en las esquinas (Naranja) */}
      <circle cx="20" cy="20" r="5" stroke={accentColor} strokeWidth={strokeWidth} fill="none" />
      <circle cx="80" cy="20" r="5" stroke={accentColor} strokeWidth={strokeWidth} fill="none" />
      <circle cx="20" cy="80" r="5" stroke={accentColor} strokeWidth={strokeWidth} fill="none" />
      <circle cx="80" cy="80" r="5" stroke={accentColor} strokeWidth={strokeWidth} fill="none" />

      {/* Líneas perimetrales del marco de selección (Naranja) */}
      <path d="M 26 20 C 44 19 56 19 74 20" stroke={accentColor} strokeWidth={strokeWidth * 0.9} strokeLinecap="round" />
      <path d="M 26 80 C 44 80.5 56 80 74 80" stroke={accentColor} strokeWidth={strokeWidth * 0.9} strokeLinecap="round" />
      <path d="M 20 26 C 19 44 19.5 56 20 74" stroke={accentColor} strokeWidth={strokeWidth * 0.9} strokeLinecap="round" />
      <path d="M 80 26 C 80.5 44 80 56 80 74" stroke={accentColor} strokeWidth={strokeWidth * 0.9} strokeLinecap="round" />

      {/* Letra tipográfica 'T' en el interior (Negro) */}
      <path
        d="M 36 38 L 52 38 M 44 38 L 44 51"
        stroke={color}
        strokeWidth={strokeWidth * 1.1}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Línea corta a la derecha de la T (Negro) */}
      <path
        d="M 58 44 C 62 43.5 66 44 70 44"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* Líneas de texto inferiores (Negro) */}
      <path
        d="M 33 59 C 45 58 57 58.5 69 59"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <path
        d="M 33 69 C 44 68 54 68.5 65 69"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
};
