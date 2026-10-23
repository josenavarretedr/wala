import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { WALA_COLORS, WALA_FONTS, WALA_SPRINGS } from "../tokens";

export interface WalaDarkCapsuleProps {
  text?: string;
  delayFrame?: number;
}

export const WalaDarkCapsule: React.FC<WalaDarkCapsuleProps> = ({
  text = "IDEA N°1 · PARTE 1",
  delayFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - delayFrame,
    fps,
    config: WALA_SPRINGS.snappy,
  });

  const translateY = interpolate(entrance, [0, 1], [-35, 0]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]);

  return (
    <div
      style={{
        position: "absolute",
        top: 130,
        left: 60,
        transform: `translateY(${translateY}px)`,
        opacity,
        zIndex: 40,
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 14,
          padding: "16px 32px",
          borderRadius: 9999,
          backgroundColor: WALA_COLORS.hudDarkBg,
          border: `1.5px solid ${WALA_COLORS.hudBorder}`,
          backdropFilter: "blur(18px)",
          boxShadow: "0 12px 30px rgba(0, 0, 0, 0.35)",
        }}
      >
        {/* Orange LED indicator */}
        <span
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            backgroundColor: WALA_COLORS.brandOrange,
            boxShadow: `0 0 12px ${WALA_COLORS.brandOrange}`,
            flexShrink: 0,
          }}
        />

        <span
          style={{
            fontFamily: WALA_FONTS.mono,
            fontSize: 22,
            fontWeight: 700,
            color: WALA_COLORS.hudText,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {text}
        </span>
      </div>
    </div>
  );
};
