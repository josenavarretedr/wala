import React from "react";
import {
  WalaIconProps,
  DEFAULT_ICON_COLOR,
  DEFAULT_ICON_ACCENT,
  DEFAULT_STROKE_WIDTH,
} from "./types";

/**
 * 8. WalaSmartwatchIcon (Fila 2, Columna 4)
 * Reloj inteligente / smartwatch con sobre de correo en pantalla y franjas de acento en naranja.
 */
export const WalaSmartwatchIcon: React.FC<WalaIconProps> = ({
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
      {/* Franjas horizontales de acento en la pantalla (Naranja) */}
      <path
        d="M 33 36 C 44 35.5 56 35.5 67 36"
        stroke={accentColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <path
        d="M 33 68 C 44 68.5 56 68.5 67 68"
        stroke={accentColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* Correa superior del reloj (Negro) */}
      <path
        d="M 36 30 L 36 20 C 36 18 38 17 40 17 L 60 17 C 62 17 64 18 64 20 L 64 30"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Correa inferior del reloj (Negro) */}
      <path
        d="M 36 74 L 36 84 C 36 86 38 87 40 87 L 60 87 C 62 87 64 86 64 84 L 64 74"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Caja del smartwatch con bisel estilo 3D (Negro) */}
      <path
        d="M 28 30 L 72 30 C 76 30 78 33 78 37 L 78 67 C 78 71 76 74 72 74 L 28 74 C 24 74 22 71 22 67 L 22 37 C 22 33 24 30 28 30 Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Bisel / Corona 3D en el borde derecho (Negro) */}
      <path
        d="M 78 37 L 85 41 L 85 63 L 78 67 M 85 48 L 88 48 L 88 56 L 85 56"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Sobre de notificación de mensaje en el centro (Negro) */}
      <path
        d="M 35 44 L 65 44 C 67 44 68 45 68 47 L 68 59 C 68 61 67 62 65 62 L 35 62 C 33 62 32 61 32 59 L 32 47 C 32 45 33 44 35 44 Z"
        stroke={color}
        strokeWidth={strokeWidth * 0.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Solapa del sobre */}
      <path
        d="M 33 45 L 50 54 L 67 45"
        stroke={color}
        strokeWidth={strokeWidth * 0.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
