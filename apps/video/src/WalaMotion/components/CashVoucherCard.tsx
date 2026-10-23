import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { WALA_COLORS, WALA_FONTS, WALA_SPRINGS } from "../tokens";

export interface CashVoucherCardProps {
  label: string;
  variant?: "single" | "stacked";
  delayFrame?: number;
}

export const CashVoucherCard: React.FC<CashVoucherCardProps> = ({
  label,
  variant = "single",
  delayFrame = 35,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - delayFrame,
    fps,
    config: WALA_SPRINGS.bouncy,
  });

  const scale = interpolate(entrance, [0, 1], [0.7, 1]);
  const translateY = interpolate(entrance, [0, 1], [50, 0]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        transform: `translateY(${translateY}px) scale(${scale})`,
        opacity,
        position: "relative",
      }}
    >
      {/* Container for Stacked or Single Cards */}
      <div
        style={{
          width: 320,
          height: 170,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Background Card 2 for Stacked Variant */}
        {variant === "stacked" && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "#FAF7EE",
              border: "2px dashed #C8C2B3",
              borderRadius: 18,
              transform: "rotate(4deg) translate(8px, 6px)",
              zIndex: 1,
              boxShadow: "0 8px 16px rgba(0, 0, 0, 0.04)",
            }}
          />
        )}

        {/* Background Card 1 for Stacked Variant */}
        {variant === "stacked" && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "#FAF7EE",
              border: "2px dashed #C8C2B3",
              borderRadius: 18,
              transform: "rotate(-3deg) translate(-4px, -3px)",
              zIndex: 2,
              boxShadow: "0 8px 16px rgba(0, 0, 0, 0.04)",
            }}
          />
        )}

        {/* Foreground Ticket Card */}
        <div
          style={{
            position: "relative",
            zIndex: 3,
            width: "100%",
            height: "100%",
            backgroundColor: "#FDFBF7",
            border: "2.5px dashed #B8B0A0",
            borderRadius: 18,
            boxShadow: "0 14px 28px rgba(0, 0, 0, 0.07)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 24px",
            boxSizing: "border-box",
          }}
        >
          {/* Inner dashed frame */}
          <div
            style={{
              width: "100%",
              height: "100%",
              border: "1px dashed #E0D9CB",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
            }}
          >
            {/* Left Orange Dash Pair */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 4,
                  backgroundColor: WALA_COLORS.brandOrange,
                  borderRadius: 2,
                }}
              />
              <div
                style={{
                  width: 32,
                  height: 4,
                  backgroundColor: WALA_COLORS.brandOrange,
                  borderRadius: 2,
                }}
              />
            </div>

            {/* Central Orange $ Coin */}
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: "50%",
                backgroundColor: WALA_COLORS.brandOrange,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 6px 14px rgba(255, 92, 0, 0.35)",
              }}
            >
              <span
                style={{
                  fontFamily: WALA_FONTS.mono,
                  fontSize: 30,
                  fontWeight: 900,
                  color: "#FFFFFF",
                  lineHeight: 1,
                }}
              >
                $
              </span>
            </div>

            {/* Right Orange Dash Pair */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 4,
                  backgroundColor: WALA_COLORS.brandOrange,
                  borderRadius: 2,
                }}
              />
              <div
                style={{
                  width: 32,
                  height: 4,
                  backgroundColor: WALA_COLORS.brandOrange,
                  borderRadius: 2,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Label under Ticket */}
      <span
        style={{
          fontFamily: WALA_FONTS.mono,
          fontSize: 24,
          fontWeight: 700,
          color: WALA_COLORS.inkPrimary,
          letterSpacing: "0.12em",
          marginTop: 20,
          textTransform: "uppercase",
          textAlign: "center",
        }}
      >
        {label}
      </span>
    </div>
  );
};
