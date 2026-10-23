import React from "react";
import {
  WalaIconProps,
  DEFAULT_ICON_COLOR,
  DEFAULT_ICON_ACCENT,
  DEFAULT_STROKE_WIDTH,
} from "./types";

/**
 * 5. WalaRobotChatIcon (Fila 2, Columna 1)
 * Robot / Chatbot asistente inteligente con antena, rostro sonriente y globo de diálogo con texto en naranja.
 */
export const WalaRobotChatIcon: React.FC<WalaIconProps> = ({
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
      {/* Antena del robot (Negro) */}
      <path d="M 38 40 L 38 31" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <circle cx="38" cy="27" r={strokeWidth * 0.9} fill={color} />

      {/* Cabeza cuadrada redondeada del robot (Negro) */}
      <path
        d="M 23 46 C 23 40 28 40 38 40 L 44 40 C 54 40 59 40 59 46 L 59 66 C 59 72 54 72 44 72 L 38 72 C 28 72 23 72 23 66 Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Orejas laterales del robot */}
      <path d="M 23 53 L 20 53 M 23 59 L 20 59" stroke={color} strokeWidth={strokeWidth * 0.8} strokeLinecap="round" />
      <path d="M 59 53 L 62 53 M 59 59 L 62 59" stroke={color} strokeWidth={strokeWidth * 0.8} strokeLinecap="round" />

      {/* Ojos del robot */}
      <circle cx="33" cy="52" r={strokeWidth * 0.7} fill={color} />
      <circle cx="49" cy="52" r={strokeWidth * 0.7} fill={color} />

      {/* Sonrisa del robot */}
      <path
        d="M 33 60 C 37 64 45 64 49 60"
        stroke={color}
        strokeWidth={strokeWidth * 0.9}
        strokeLinecap="round"
      />

      {/* Globo de diálogo superior (Negro) */}
      <path
        d="M 52 20 C 52 16 57 16 66 16 L 76 16 C 85 16 90 16 90 20 L 90 32 C 90 36 85 36 76 36 L 68 36 L 62 44 L 63 36 C 57 36 52 36 52 32 Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Líneas de conversación en el globo (Naranja) */}
      <path
        d="M 59 24 C 65 23.5 73 23.5 81 24"
        stroke={accentColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <path
        d="M 59 30 C 64 29.5 70 29.5 75 30"
        stroke={accentColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
};
