import React from "react";
import {
  WalaIconProps,
  DEFAULT_ICON_COLOR,
  DEFAULT_ICON_ACCENT,
  DEFAULT_STROKE_WIDTH,
} from "./types";

/**
 * 23. WalaPhotoGalleryIcon (Fila 6, Columna 3)
 * Marcos de fotos apilados / galería de medios con foto trasera en naranja y foto frontal con paisaje en negro.
 */
export const WalaPhotoGalleryIcon: React.FC<WalaIconProps> = ({
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
      {/* Marco de fotografía trasero (Naranja) */}
      <path
        d="M 44 24 L 80 28 C 84 28 86 31 86 35 L 80 68 C 79 72 76 74 72 73 L 66 72"
        stroke={accentColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 44 24 L 41 37"
        stroke={accentColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* Marco de fotografía frontal principal (Negro) */}
      <path
        d="M 23 38 L 65 32 C 69 31 72 34 71 38 L 66 75 C 65 79 62 82 58 81 L 18 75 C 14 74 12 71 13 67 L 18 44 C 19 40 21 38 23 38 Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Recuadro interior de la imagen (Negro) */}
      <path
        d="M 24 43 L 62 38 L 57 66 L 20 70 Z"
        stroke={color}
        strokeWidth={strokeWidth * 0.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Dibujo de paisaje: sol / luna */}
      <circle
        cx="32"
        cy="50"
        r={strokeWidth * 0.75}
        fill={color}
      />

      {/* Dibujo de paisaje: siluetas de montañas */}
      <path
        d="M 22 66 L 33 54 L 43 64 L 50 58 L 56 63"
        stroke={color}
        strokeWidth={strokeWidth * 0.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
