import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { WALA_COLORS, WALA_FONTS, WALA_SPRINGS } from "../tokens";

export interface WalaKineticCalloutProps {
  line1?: string;
  line2?: string;
  delayFrame?: number;
}

export const WalaKineticCallout: React.FC<WalaKineticCalloutProps> = ({
  line1 = "¿por qué",
  line2 = "esta idea?",
  delayFrame = 10,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - delayFrame,
    fps,
    config: WALA_SPRINGS.bouncy,
  });

  const scale = interpolate(entrance, [0, 1], [0.8, 1]);
  const translateY = interpolate(entrance, [0, 1], [-20, 0]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        transform: `translateY(${translateY}px) scale(${scale})`,
        opacity,
        lineHeight: 1.05,
      }}
    >
      <span
        style={{
          fontFamily: WALA_FONTS.display,
          fontSize: 62,
          fontWeight: 900,
          color: WALA_COLORS.inkPrimary,
          letterSpacing: "-0.03em",
        }}
      >
        {line1}
      </span>
      <span
        style={{
          fontFamily: WALA_FONTS.display,
          fontSize: 62,
          fontWeight: 900,
          fontStyle: "italic",
          color: WALA_COLORS.brandOrange,
          letterSpacing: "-0.03em",
        }}
      >
        {line2}
      </span>
    </div>
  );
};
