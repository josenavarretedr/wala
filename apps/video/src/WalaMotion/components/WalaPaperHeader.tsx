import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { WALA_COLORS, WALA_FONTS, WALA_SPRINGS } from "../tokens";

export interface WalaPaperHeaderProps {
  ideaNumber?: string;
  sectionTitle?: string;
  budgetLabel?: string;
  currentBudget?: number;
  totalBudget?: number;
  entranceDelayFrame?: number;
  budgetCountFrame?: number;
}

export const WalaPaperHeader: React.FC<WalaPaperHeaderProps> = ({
  ideaNumber = "IDEA N°1 · PARTE 1",
  sectionTitle = "¿QUÉ ES?",
  budgetLabel = "PRESUPUESTO",
  currentBudget = 0,
  totalBudget = 120,
  entranceDelayFrame = 0,
  budgetCountFrame = 30,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - entranceDelayFrame,
    fps,
    config: WALA_SPRINGS.snappy,
  });

  const translateY = interpolate(entrance, [0, 1], [-30, 0]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]);

  // Animated budget counter if currentBudget > 0
  const animatedBudget = Math.round(
    interpolate(
      frame,
      [budgetCountFrame, budgetCountFrame + 30],
      [0, currentBudget],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }
    )
  );

  return (
    <div
      style={{
        position: "absolute",
        top: 100,
        left: 60,
        right: 60,
        transform: `translateY(${translateY}px)`,
        opacity,
        fontFamily: WALA_FONTS.mono,
        zIndex: 30,
      }}
    >
      {/* Top row: Idea number & current section */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 22,
          fontWeight: 700,
          color: WALA_COLORS.inkPrimary,
          letterSpacing: "0.08em",
          paddingBottom: 16,
        }}
      >
        <span>{ideaNumber}</span>
        <span>{sectionTitle}</span>
      </div>

      {/* Horizontal divider rule */}
      <div
        style={{
          width: "100%",
          height: 3,
          backgroundColor: WALA_COLORS.paperDividerStrong,
          borderRadius: 2,
        }}
      />

      {/* Sub row: Budget label and counter */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 20,
          fontWeight: 600,
          color: WALA_COLORS.inkPrimary,
          letterSpacing: "0.06em",
          paddingTop: 16,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        <span>{budgetLabel}</span>
        <span>
          ${animatedBudget} / ${totalBudget}
        </span>
      </div>
    </div>
  );
};
