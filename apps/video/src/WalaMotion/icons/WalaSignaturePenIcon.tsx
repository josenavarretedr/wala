import React from "react";
import {
  WalaIconProps,
  DEFAULT_ICON_COLOR,
  DEFAULT_ICON_ACCENT,
  DEFAULT_STROKE_WIDTH,
} from "./types";

/**
 * 16. WalaSignaturePenIcon (Fila 4, Columna 4)
 * Pluma estilográfica / firma de contratos con trazo fluido manuscrito en naranja y plumín en negro.
 */
export const WalaSignaturePenIcon: React.FC<WalaIconProps> = ({
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
      {/* Trazo fluido de firma caligráfica (Naranja) */}
      <path
        d="M 52 64 C 44 68 36 78 28 74 C 23 71 25 62 30 62 C 37 62 43 75 54 75 C 65 75 75 70 82 73"
        stroke={accentColor}
        strokeWidth={strokeWidth * 1.1}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Mango superior de la pluma (Negro) */}
      <path
        d="M 72 20 L 88 32"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <path
        d="M 70 24 L 76 29 M 84 35 L 78 40"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* Hombros y cuerpo del plumín estilográfico (Negro) */}
      <path
        d="M 64 33 L 78 43 L 68 53 L 52 64 L 56 46 Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Orificio de respiración del plumín */}
      <circle
        cx="61"
        cy="49"
        r={strokeWidth * 0.7}
        fill={color}
      />

      {/* Ranura central divisoria de los gavilanes hasta la punta */}
      <path
        d="M 61 49 L 52 64"
        stroke={color}
        strokeWidth={strokeWidth * 0.9}
        strokeLinecap="round"
      />
    </svg>
  );
};
