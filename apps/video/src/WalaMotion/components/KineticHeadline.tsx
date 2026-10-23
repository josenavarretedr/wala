import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

interface KineticHeadlineProps {
  part1: string;
  highlight1: string;
  part2: string;
  highlight2: string;
  isTalkingHead?: boolean;
}

export const KineticHeadline: React.FC<KineticHeadlineProps> = ({
  part1,
  highlight1,
  part2,
  highlight2,
  isTalkingHead = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Word/Line 1 stagger entrance (starts at frame 10)
  const line1Spring = spring({
    frame: frame - 10,
    fps,
    config: { damping: 12, stiffness: 120 },
  });

  // Highlight 1 entrance (starts at frame 25)
  const salonSpring = spring({
    frame: frame - 25,
    fps,
    config: { damping: 11, stiffness: 130 },
  });

  // Highlight 2 (CAJERO PERSONAL) impact entrance (starts at frame 50)
  const cajeroSpring = spring({
    frame: frame - 50,
    fps,
    config: { damping: 10, stiffness: 160 },
  });

  const topPosition = isTalkingHead ? 260 : 330;

  return (
    <div
      style={{
        position: "absolute",
        top: topPosition,
        left: 50,
        right: 50,
        textAlign: "center",
        zIndex: 25,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
      }}
    >
      {/* "¿Conoces esa sensación de que..." */}
      <div
        style={{
          transform: `translateY(${interpolate(line1Spring, [0, 1], [30, 0])}px)`,
          opacity: interpolate(line1Spring, [0, 1], [0, 1]),
          color: "#334155",
          fontSize: 46,
          fontWeight: 600,
          letterSpacing: "-0.02em",
          lineHeight: 1.25,
        }}
      >
        {part1}
      </div>

      {/* "...tu salón de belleza..." */}
      <div
        style={{
          transform: `scale(${interpolate(salonSpring, [0, 1], [0.85, 1])}) translateY(${interpolate(
            salonSpring,
            [0, 1],
            [25, 0]
          )}px)`,
          opacity: interpolate(salonSpring, [0, 1], [0, 1]),
          display: "inline-block",
          padding: "10px 28px",
          borderRadius: 20,
          background: "rgba(236, 253, 245, 0.95)",
          border: "2px solid #059669",
          color: "#065F46",
          fontSize: 54,
          fontWeight: 800,
          letterSpacing: "-0.02em",
          boxShadow: "0 8px 24px rgba(5, 150, 105, 0.15)",
        }}
      >
        {highlight1}
      </div>

      {/* "...es TU CAJERO PERSONAL?" */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            transform: `translateY(${interpolate(cajeroSpring, [0, 1], [20, 0])}px)`,
            opacity: interpolate(cajeroSpring, [0, 1], [0, 1]),
            color: "#1E293B",
            fontSize: 48,
            fontWeight: 700,
          }}
        >
          {part2}
        </span>

        <span
          style={{
            transform: `scale(${interpolate(cajeroSpring, [0, 1], [0.75, 1])})`,
            opacity: interpolate(cajeroSpring, [0, 1], [0, 1]),
            padding: "12px 32px",
            borderRadius: 22,
            background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
            color: "#FFFFFF",
            fontSize: 54,
            fontWeight: 900,
            letterSpacing: "-0.01em",
            textTransform: "uppercase",
            boxShadow:
              "0 18px 40px rgba(239, 68, 68, 0.35), 0 4px 12px rgba(239, 68, 68, 0.2)",
          }}
        >
          {highlight2}
        </span>
      </div>
    </div>
  );
};
