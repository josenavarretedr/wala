import React from "react";
import {
  WalaIconProps,
  DEFAULT_ICON_COLOR,
  DEFAULT_ICON_ACCENT,
  DEFAULT_STROKE_WIDTH,
} from "./types";

/**
 * 18. WalaSaleBadgeIcon (Fila 5, Columna 2)
 * Sello de oferta tipo explosión / estrella con texto "SALE" en naranja y contorno dentado en negro.
 */
export const WalaSaleBadgeIcon: React.FC<WalaIconProps> = ({
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
      {/* Contorno dentado de explosión / estrella tipo sticker (Negro) */}
      <path
        d="M 50 16 L 56 24 L 66 19 L 69 28 L 79 26 L 80 36 L 89 39 L 85 49 L 91 56 L 84 63 L 87 73 L 77 76 L 76 86 L 66 85 L 62 93 L 53 88 L 47 93 L 42 85 L 32 86 L 31 76 L 21 73 L 24 63 L 17 56 L 23 49 L 19 39 L 28 36 L 29 26 L 39 28 L 42 19 Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Texto "SALE" estilo tipográfico manual (Naranja) */}
      {/* S */}
      <path
        d="M 36 46.5 C 32 45 28 46.5 28 49 C 28 52 36 52 36 55.5 C 36 59 31.5 59.5 28 58"
        stroke={accentColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* A */}
      <path
        d="M 39 58 L 44 45.5 L 49 58"
        stroke={accentColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 40.5 54 L 47.5 54"
        stroke={accentColor}
        strokeWidth={strokeWidth * 0.9}
        strokeLinecap="round"
      />

      {/* L */}
      <path
        d="M 54 45.5 L 54 58 L 61 58"
        stroke={accentColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* E */}
      <path
        d="M 66 45.5 L 66 58 L 73 58"
        stroke={accentColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 66 45.5 L 73 45.5"
        stroke={accentColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <path
        d="M 66 52 L 71 52"
        stroke={accentColor}
        strokeWidth={strokeWidth * 0.9}
        strokeLinecap="round"
      />
    </svg>
  );
};
