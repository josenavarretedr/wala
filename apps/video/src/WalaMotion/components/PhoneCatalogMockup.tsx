import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { WALA_COLORS, WALA_FONTS, WALA_SPRINGS } from "../tokens";

export interface PhoneCatalogMockupProps {
  badgeText?: string;
  label?: string;
  delayFrame?: number;
}

export const PhoneCatalogMockup: React.FC<PhoneCatalogMockupProps> = ({
  badgeText = "LO VENDO SIN TENERLO",
  label = "CATÁLOGO DEL PROVEEDOR",
  delayFrame = 26,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - delayFrame,
    fps,
    config: WALA_SPRINGS.snappy,
  });

  const scale = interpolate(entrance, [0, 1], [0.65, 1]);
  const translateY = interpolate(entrance, [0, 1], [40, 0]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]);

  // Badge pop spring
  const badgeEntrance = spring({
    frame: frame - (delayFrame + 8),
    fps,
    config: WALA_SPRINGS.bouncy,
  });
  const badgeScale = interpolate(badgeEntrance, [0, 1], [0, 1]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        transform: `translateY(${translateY}px) scale(${scale})`,
        opacity,
      }}
    >
      {/* Orange Pill Badge floating above the phone */}
      <div
        style={{
          position: "absolute",
          top: -20,
          zIndex: 10,
          transform: `scale(${badgeScale})`,
          padding: "6px 16px",
          backgroundColor: WALA_COLORS.brandOrange,
          borderRadius: 9999,
          boxShadow: "0 6px 14px rgba(255, 92, 0, 0.35)",
        }}
      >
        <span
          style={{
            fontFamily: WALA_FONTS.mono,
            fontSize: 13,
            fontWeight: 800,
            color: "#FFFFFF",
            letterSpacing: "0.06em",
            whiteSpace: "nowrap",
          }}
        >
          {badgeText}
        </span>
      </div>

      {/* Phone Screen Mockup */}
      <div
        style={{
          width: 140,
          height: 230,
          backgroundColor: "#FFFFFF",
          border: `3px solid ${WALA_COLORS.inkPrimary}`,
          borderRadius: 28,
          boxShadow: "0 16px 32px rgba(0, 0, 0, 0.10)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "12px 10px",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {/* Dynamic Island / Notch */}
        <div
          style={{
            width: 36,
            height: 6,
            backgroundColor: WALA_COLORS.inkPrimary,
            borderRadius: 9999,
            marginBottom: 16,
          }}
        />

        {/* Catalog Item 1: Black Cube */}
        <div
          style={{
            width: "100%",
            height: 64,
            backgroundColor: "#F4F0E8",
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 10,
          }}
        >
          <svg width="34" height="34" viewBox="0 0 34 34">
            <polygon points="17,3 31,11 17,19 3,11" fill="#3F3F46" />
            <polygon points="3,11 17,19 17,31 3,23" fill="#18181B" />
            <polygon points="17,19 31,11 31,23 17,31" fill="#27272A" />
          </svg>
        </div>

        {/* Catalog Item 2: Orange Cube */}
        <div
          style={{
            width: "100%",
            height: 64,
            backgroundColor: "#FFF0EB",
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="34" height="34" viewBox="0 0 34 34">
            <polygon points="17,3 31,11 17,19 3,11" fill="#FFA366" />
            <polygon points="3,11 17,19 17,31 3,23" fill="#FF5C00" />
            <polygon points="17,19 31,11 31,23 17,31" fill="#E65300" />
          </svg>
        </div>
      </div>

      {/* Label under Phone */}
      <span
        style={{
          fontFamily: WALA_FONTS.mono,
          fontSize: 18,
          fontWeight: 700,
          color: WALA_COLORS.inkPrimary,
          letterSpacing: "0.08em",
          marginTop: 18,
          textTransform: "uppercase",
          textAlign: "center",
        }}
      >
        {label}
      </span>
    </div>
  );
};
