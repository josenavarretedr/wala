import React from "react";
import { spring, useVideoConfig } from "remotion";
import { HighlightBoxConfig } from "../types";

interface HighlightBoxProps {
  highlight?: HighlightBoxConfig;
  frameInBeat: number;
  baseWidth: number;
  baseHeight: number;
}

export const HighlightBox: React.FC<HighlightBoxProps> = ({
  highlight,
  frameInBeat,
  baseWidth,
  baseHeight,
}) => {
  const { fps } = useVideoConfig();

  if (!highlight) {
    return null;
  }

  // Dimensiones en píxeles del recuadro dentro del espacio del lienzo base
  const boxX = highlight.x * baseWidth;
  const boxY = highlight.y * baseHeight;
  const boxW = highlight.width * baseWidth;
  const boxH = highlight.height * baseHeight;

  const accentColor = highlight.accentColor || "#FF5C00";

  // Perímetro aproximado para la animación de trazo progresivo (strokeDashoffset)
  const perimeter = 2 * (boxW + boxH);

  // Entrada ágil con spring tras 6 frames de llegada de cámara
  const strokeSpring = spring({
    frame: Math.max(0, frameInBeat - 6),
    fps,
    config: { damping: 14, stiffness: 100, mass: 0.8 },
  });

  const strokeOffset = perimeter * (1 - strokeSpring);

  // Entrada de la etiqueta con ligero rebote (bouncy)
  const badgeSpring = spring({
    frame: Math.max(0, frameInBeat - 12),
    fps,
    config: { damping: 11, stiffness: 110, mass: 0.85 },
  });

  // Micro-respiración o pulso suave en el brillo
  const pulse = Math.sin((frameInBeat / fps) * Math.PI * 2) * 0.15 + 0.85;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: baseWidth,
        height: baseHeight,
        pointerEvents: "none",
      }}
    >
      <svg
        width={baseWidth}
        height={baseHeight}
        viewBox={`0 0 ${baseWidth} ${baseHeight}`}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      >
        <defs>
          <filter id={`glow-${highlight.label}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation="10"
              floodColor={accentColor}
              floodOpacity={0.65 * pulse}
            />
            <feDropShadow
              dx="0"
              dy="2"
              stdDeviation="3"
              floodColor={accentColor}
              floodOpacity={0.9}
            />
          </filter>
        </defs>

        {/* Halo exterior suave */}
        <rect
          x={boxX}
          y={boxY}
          width={boxW}
          height={boxH}
          rx={18}
          ry={18}
          fill="none"
          stroke={accentColor}
          strokeWidth={6}
          strokeOpacity={0.3 * strokeSpring}
          style={{ filter: `url(#glow-${highlight.label})` }}
        />

        {/* Trazo nítido animado con strokeDashoffset */}
        <rect
          x={boxX}
          y={boxY}
          width={boxW}
          height={boxH}
          rx={18}
          ry={18}
          fill={accentColor}
          fillOpacity={0.04 * strokeSpring}
          stroke={accentColor}
          strokeWidth={4.5}
          strokeDasharray={perimeter}
          strokeDashoffset={strokeOffset}
          strokeLinecap="round"
        />

        {/* Esquinas acentuadas tipo HUD en las 4 esquinas */}
        {strokeSpring > 0.85 && (
          <g opacity={strokeSpring}>
            {/* Esquina sup izq */}
            <path
              d={`M ${boxX - 4} ${boxY + 22} L ${boxX - 4} ${boxY - 4} L ${boxX + 22} ${boxY - 4}`}
              fill="none"
              stroke={accentColor}
              strokeWidth={3}
            />
            {/* Esquina sup der */}
            <path
              d={`M ${boxX + boxW + 4} ${boxY + 22} L ${boxX + boxW + 4} ${boxY - 4} L ${boxX + boxW - 22} ${boxY - 4}`}
              fill="none"
              stroke={accentColor}
              strokeWidth={3}
            />
            {/* Esquina inf izq */}
            <path
              d={`M ${boxX - 4} ${boxY + boxH - 22} L ${boxX - 4} ${boxY + boxH + 4} L ${boxX + 22} ${boxY + boxH + 4}`}
              fill="none"
              stroke={accentColor}
              strokeWidth={3}
            />
            {/* Esquina inf der */}
            <path
              d={`M ${boxX + boxW + 4} ${boxY + boxH - 22} L ${boxX + boxW + 4} ${boxY + boxH + 4} L ${boxX + boxW - 22} ${boxY + boxH + 4}`}
              fill="none"
              stroke={accentColor}
              strokeWidth={3}
            />
          </g>
        )}
      </svg>

      {/* Píldora de etiqueta flotante */}
      {highlight.label && badgeSpring > 0.05 && (
        <div
          style={{
            position: "absolute",
            left: boxX + 18,
            top: boxY - 22,
            transform: `scale(${badgeSpring})`,
            transformOrigin: "left center",
            backgroundColor: accentColor,
            color: "#FFFFFF",
            fontFamily: "'JetBrains Mono', 'Space Mono', monospace",
            fontSize: 14,
            fontWeight: 800,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            padding: "5px 14px",
            borderRadius: 999,
            border: "2px solid #FFFFFF",
            boxShadow: `0 6px 16px ${accentColor}66`,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              backgroundColor: "#FFFFFF",
              display: "inline-block",
            }}
          />
          {highlight.label}
        </div>
      )}
    </div>
  );
};
