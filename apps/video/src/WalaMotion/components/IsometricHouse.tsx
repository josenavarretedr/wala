import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { WALA_COLORS, WALA_FONTS, WALA_SPRINGS } from "../tokens";

export interface IsometricHouseProps {
  label?: string;
  delayFrame?: number;
}

export const IsometricHouse: React.FC<IsometricHouseProps> = ({
  label = "CLIENTE",
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
      {/* 3D Isometric House Illustration */}
      <svg
        width="230"
        height="210"
        viewBox="0 0 230 210"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: "drop-shadow(0 14px 22px rgba(0, 0, 0, 0.10))",
        }}
      >
        {/* Ground shadow polygon */}
        <polygon
          points="115,190 215,138 115,86 15,138"
          fill="rgba(0, 0, 0, 0.06)"
        />

        {/* Left Wall (Cream/Bone) */}
        <polygon
          points="25,125 115,178 115,95 25,48"
          fill="#F5F0E8"
        />

        {/* Right Wall (Slightly darker beige) */}
        <polygon
          points="115,178 205,125 205,48 115,95"
          fill="#E5DFD4"
        />

        {/* Roof Left Slope (Dark Charcoal) */}
        <polygon
          points="115,15 25,48 115,95"
          fill="#1A1A1E"
        />

        {/* Roof Right Slope (Dark Slate) */}
        <polygon
          points="115,15 115,95 205,48"
          fill="#2B2B32"
        />

        {/* Light Blue Window on Left Wall */}
        <polygon
          points="45,116 75,133 75,102 45,86"
          fill="#A8D4F0"
        />
        <line x1="60" y1="109" x2="60" y2="94" stroke="#7BAFD4" strokeWidth="2" />
        <line x1="45" y1="101" x2="75" y2="118" stroke="#7BAFD4" strokeWidth="2" />

        {/* Vibrant Orange Door on Right Wall */}
        <polygon
          points="145,160 178,141 178,102 145,122"
          fill="#FF5C00"
        />
        {/* Door Knob */}
        <circle cx="152" cy="138" r="2.5" fill="#FFFFFF" />
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
