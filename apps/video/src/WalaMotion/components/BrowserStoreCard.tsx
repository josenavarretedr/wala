import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { WALA_COLORS, WALA_FONTS, WALA_SPRINGS } from "../tokens";

export interface BrowserStoreCardProps {
  url?: string;
  price?: number | string;
  buttonText?: string;
  label?: string;
  delayFrame?: number;
}

export const BrowserStoreCard: React.FC<BrowserStoreCardProps> = ({
  url = "mitienda.com",
  price = "$25",
  buttonText = "COMPRAR",
  label = "MI TIENDA",
  delayFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - delayFrame,
    fps,
    config: WALA_SPRINGS.snappy,
  });

  const scale = interpolate(entrance, [0, 1], [0.6, 1]);
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
      }}
    >
      {/* Browser Window Mockup */}
      <div
        style={{
          width: 250,
          height: 210,
          backgroundColor: "#FFFFFF",
          border: `2.5px solid ${WALA_COLORS.inkPrimary}`,
          borderRadius: 20,
          boxShadow: "0 18px 36px rgba(0, 0, 0, 0.08)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
        }}
      >
        {/* Browser Top Chrome */}
        <div
          style={{
            height: 38,
            borderBottom: `2px solid ${WALA_COLORS.inkPrimary}`,
            display: "flex",
            alignItems: "center",
            padding: "0 14px",
            gap: 6,
            backgroundColor: "#FFFFFF",
          }}
        >
          {/* 3 Window Control Dots */}
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: WALA_COLORS.brandOrange,
            }}
          />
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: "#D1D1D6",
            }}
          />
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: "#D1D1D6",
            }}
          />

          {/* URL text */}
          <span
            style={{
              fontFamily: WALA_FONTS.mono,
              fontSize: 13,
              color: WALA_COLORS.inkSecondary,
              marginLeft: 10,
              letterSpacing: "0.04em",
            }}
          >
            {url}
          </span>
        </div>

        {/* Browser Body */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            justifyContent: "center",
            padding: "0 34px",
            gap: 12,
          }}
        >
          {/* Price */}
          <div
            style={{
              fontFamily: WALA_FONTS.mono,
              fontSize: 38,
              fontWeight: 800,
              color: WALA_COLORS.inkPrimary,
              letterSpacing: "-0.02em",
            }}
          >
            {price}
          </div>

          {/* Orange Buy Button Pill */}
          <div
            style={{
              padding: "7px 18px",
              backgroundColor: WALA_COLORS.brandOrange,
              borderRadius: 9999,
              color: "#FFFFFF",
              fontFamily: WALA_FONTS.mono,
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: "0.08em",
              boxShadow: "0 4px 10px rgba(255, 92, 0, 0.35)",
            }}
          >
            {buttonText}
          </div>
        </div>
      </div>

      {/* Label under card */}
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
