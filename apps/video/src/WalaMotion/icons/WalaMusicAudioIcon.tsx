import React from "react";
import {
  WalaIconProps,
  DEFAULT_ICON_COLOR,
  DEFAULT_ICON_ACCENT,
  DEFAULT_STROKE_WIDTH,
} from "./types";

/**
 * 24. WalaMusicAudioIcon (Fila 6, Columna 4)
 * Notas musicales (corcheas simples y enlazadas) en negro con destellos y cruces (+) en naranja.
 */
export const WalaMusicAudioIcon: React.FC<WalaIconProps> = ({
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
      {/* Destellos / cruces (+) de ritmo y melodía (Naranja) */}
      {/* Destello 1 (superior derecho) */}
      <path
        d="M 78 18 L 78 26 M 74 22 L 82 22"
        stroke={accentColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* Destello 2 (inferior izquierdo) */}
      <path
        d="M 24 72 L 24 80 M 20 76 L 28 76"
        stroke={accentColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* Corchea individual superior izquierda (Negro) */}
      {/* Cabeza de la nota */}
      <circle
        cx="34"
        cy="47"
        r={strokeWidth * 1.15}
        fill={color}
      />
      {/* Plica / plaste */}
      <path
        d="M 38 46 L 38 28"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* Corchete / bandera */}
      <path
        d="M 38 28 C 43 30 47 34 46 39"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* Par de corcheas enlazadas inferior derecho (Negro) */}
      {/* Cabeza nota izquierda */}
      <circle
        cx="53"
        cy="74"
        r={strokeWidth * 1.25}
        fill={color}
      />
      {/* Plica izquierda */}
      <path
        d="M 57 73 L 57 44"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* Cabeza nota derecha */}
      <circle
        cx="74"
        cy="69"
        r={strokeWidth * 1.25}
        fill={color}
      />
      {/* Plica derecha */}
      <path
        d="M 78 68 L 78 39"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* Barra de unión (Beam) */}
      <path
        d="M 56 44 L 79 39"
        stroke={color}
        strokeWidth={strokeWidth * 1.6}
        strokeLinecap="round"
      />
    </svg>
  );
};
