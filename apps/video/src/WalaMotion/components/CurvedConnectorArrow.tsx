import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { WALA_COLORS, WALA_SPRINGS } from "../tokens";

export interface CurvedConnectorArrowProps {
  delayFrame?: number;
}

export const CurvedConnectorArrow: React.FC<CurvedConnectorArrowProps> = ({
  delayFrame = 22,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - delayFrame,
    fps,
    config: WALA_SPRINGS.snappy,
  });

  const pathLength = interpolate(entrance, [0, 1], [0, 1]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]);

  return (
    <svg
      width="130"
      height="100"
      viewBox="0 0 130 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        opacity,
        overflow: "visible",
      }}
    >
      <path
        d="M 10 70 Q 60 5, 115 50"
        stroke={WALA_COLORS.brandOrange}
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
        strokeDasharray="200"
        strokeDashoffset={200 * (1 - pathLength)}
      />
      {pathLength > 0.85 && (
        <polygon
          points="115,50 102,40 106,56"
          fill={WALA_COLORS.brandOrange}
        />
      )}
    </svg>
  );
};
