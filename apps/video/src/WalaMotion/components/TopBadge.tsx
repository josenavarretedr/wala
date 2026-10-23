import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

interface TopBadgeProps {
  text: string;
}

export const TopBadge: React.FC<TopBadgeProps> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const entrance = spring({
    frame,
    fps,
    config: {
      damping: 14,
      stiffness: 110,
    },
  });

  const translateY = interpolate(entrance, [0, 1], [-40, 0]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]);

  return (
    <div
      style={{
        position: "absolute",
        top: 140,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        transform: `translateY(${translateY}px)`,
        opacity,
        zIndex: 20,
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 28px",
          borderRadius: 9999,
          background: "rgba(255, 255, 255, 0.92)",
          border: "1.5px solid rgba(226, 232, 240, 0.9)",
          backdropFilter: "blur(16px)",
          boxShadow:
            "0 10px 25px -5px rgba(0, 0, 0, 0.06), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
        }}
      >
        {/* Glowing emerald indicator dot */}
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            backgroundColor: "#059669",
            boxShadow: "0 0 10px rgba(16, 185, 129, 0.6)",
            display: "inline-block",
          }}
        />
        <span
          style={{
            color: "#0F172A",
            fontSize: 22,
            fontWeight: 700,
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
