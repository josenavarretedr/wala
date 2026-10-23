import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { WALA_COLORS, WALA_FONTS, WALA_SPRINGS } from "../tokens";

export interface WireframeShelfWithZeroProps {
  label?: string;
  count?: number | string;
  delayFrame?: number;
}

export const WireframeShelfWithZero: React.FC<WireframeShelfWithZeroProps> = ({
  label = "MI TIENDA",
  count = "0",
  delayFrame = 18,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - delayFrame,
    fps,
    config: WALA_SPRINGS.bouncy,
  });

  const scale = interpolate(entrance, [0, 1], [0.6, 1]);
  const translateY = interpolate(entrance, [0, 1], [40, 0]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        transform: `translateY(${translateY}px) scale(${scale})`,
        opacity,
      }}
    >
      {/* Giant Orange Zero */}
      <div
        style={{
          fontFamily: WALA_FONTS.mono,
          fontSize: 68,
          fontWeight: 900,
          color: WALA_COLORS.brandOrange,
          lineHeight: 1,
          marginBottom: 6,
          filter: "drop-shadow(0 4px 12px rgba(255, 92, 0, 0.25))",
        }}
      >
        {count}
      </div>

      {/* Wireframe Shelf SVG */}
      <svg
        width="150"
        height="170"
        viewBox="0 0 150 170"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Top Shelf Plane */}
        <polygon
          points="75,10 140,42 75,74 10,42"
          stroke="#1A1A1A"
          strokeWidth="3.5"
          fill="none"
        />
        {/* Top diagonal brace */}
        <line x1="10" y1="42" x2="140" y2="42" stroke="#1A1A1A" strokeWidth="2.5" />
        <line x1="75" y1="10" x2="75" y2="74" stroke="#1A1A1A" strokeWidth="2.5" />

        {/* 4 Vertical corner posts */}
        <line x1="10" y1="42" x2="10" y2="150" stroke="#1A1A1A" strokeWidth="3.5" />
        <line x1="140" y1="42" x2="140" y2="150" stroke="#1A1A1A" strokeWidth="3.5" />
        <line x1="75" y1="74" x2="75" y2="168" stroke="#1A1A1A" strokeWidth="3.5" />
        <line x1="75" y1="10" x2="75" y2="105" stroke="#1A1A1A" strokeWidth="2" strokeDasharray="4 4" />

        {/* Middle Shelf Plane */}
        <polygon
          points="75,80 140,112 75,144 10,112"
          stroke="#1A1A1A"
          strokeWidth="3"
          fill="none"
        />

        {/* Cross Bracing X on front faces */}
        <line x1="10" y1="42" x2="75" y2="144" stroke="#1A1A1A" strokeWidth="2" strokeOpacity="0.4" />
        <line x1="10" y1="112" x2="75" y2="74" stroke="#1A1A1A" strokeWidth="2" strokeOpacity="0.4" />
        <line x1="75" y1="74" x2="140" y2="150" stroke="#1A1A1A" strokeWidth="2" strokeOpacity="0.4" />
        <line x1="75" y1="144" x2="140" y2="112" stroke="#1A1A1A" strokeWidth="2" strokeOpacity="0.4" />
      </svg>

      {/* Label under shelf */}
      <span
        style={{
          fontFamily: WALA_FONTS.mono,
          fontSize: 18,
          fontWeight: 700,
          color: WALA_COLORS.inkPrimary,
          letterSpacing: "0.1em",
          marginTop: 14,
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
    </div>
  );
};
