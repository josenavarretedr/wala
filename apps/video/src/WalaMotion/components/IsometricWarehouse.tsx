import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { WALA_COLORS, WALA_FONTS, WALA_SPRINGS } from "../tokens";

export interface IsometricWarehouseProps {
  label?: string;
  delayFrame?: number;
}

export const IsometricWarehouse: React.FC<IsometricWarehouseProps> = ({
  label = "PROVEEDOR",
  delayFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - delayFrame,
    fps,
    config: WALA_SPRINGS.bouncy,
  });

  const scale = interpolate(entrance, [0, 1], [0.5, 1]);
  const translateY = interpolate(entrance, [0, 1], [60, 0]);
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
      {/* 3D Isometric Warehouse Illustration */}
      <svg
        width="230"
        height="210"
        viewBox="0 0 230 210"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: "drop-shadow(0 14px 22px rgba(0, 0, 0, 0.12))",
        }}
      >
        {/* Ground shadow polygon */}
        <polygon
          points="115,190 220,135 115,80 10,135"
          fill="rgba(0, 0, 0, 0.06)"
        />

        {/* Left Wall (Dark Grey) */}
        <polygon
          points="20,118 115,172 115,86 20,32"
          fill="#1C1C20"
        />

        {/* Right Wall (Slightly lighter dark grey) */}
        <polygon
          points="115,172 210,118 210,32 115,86"
          fill="#2B2B32"
        />

        {/* Roof (Vibrant Orange Gable Plane) */}
        <polygon
          points="115,12 215,68 115,116 15,60"
          fill="#FF5C00"
        />

        {/* Roll-up Garage Shutter on Right Wall */}
        <polygon
          points="132,156 195,120 195,84 132,120"
          fill="#44444C"
        />
        {/* Shutter Horizontal Slats */}
        <line x1="132" y1="128" x2="195" y2="92" stroke="#2B2B32" strokeWidth="2.5" />
        <line x1="132" y1="136" x2="195" y2="100" stroke="#2B2B32" strokeWidth="2.5" />
        <line x1="132" y1="144" x2="195" y2="108" stroke="#2B2B32" strokeWidth="2.5" />
        <line x1="132" y1="152" x2="195" y2="116" stroke="#2B2B32" strokeWidth="2.5" />

        {/* Peach Window on Left Wall */}
        <polygon
          points="40,110 72,128 72,92 40,74"
          fill="#FDDBC7"
        />
        <line x1="56" y1="101" x2="56" y2="83" stroke="#D19C7F" strokeWidth="2" />
        <line x1="40" y1="92" x2="72" y2="110" stroke="#D19C7F" strokeWidth="2" />
      </svg>

      {/* Label under icon */}
      <span
        style={{
          fontFamily: WALA_FONTS.mono,
          fontSize: 26,
          fontWeight: 700,
          color: WALA_COLORS.inkPrimary,
          letterSpacing: "0.12em",
          marginTop: 24,
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
    </div>
  );
};
