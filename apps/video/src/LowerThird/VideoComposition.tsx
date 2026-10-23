import React from "react";
import { AbsoluteFill } from "remotion";
import { LowerThird } from "./LowerThird";
import { LowerThirdProps } from "./schema";

export const VideoComposition: React.FC<LowerThirdProps> = (props) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: props.transparentBackground ? "transparent" : "#0d1117",
        overflow: "hidden",
      }}
    >
      {/* Visual background gradient / subtle scenery when transparentBackground is false */}
      {!props.transparentBackground && (
        <AbsoluteFill>
          {/* Subtle ambient lighting */}
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              background:
                "radial-gradient(circle at 50% 30%, #1e293b 0%, #0f172a 60%, #020617 100%)",
            }}
          />

          {/* Soft decorative blur orbs */}
          <div
            style={{
              position: "absolute",
              width: 600,
              height: 600,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)",
              top: "10%",
              left: "15%",
              filter: "blur(60px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 500,
              height: 500,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(236, 72, 153, 0.12) 0%, transparent 70%)",
              bottom: "15%",
              right: "20%",
              filter: "blur(60px)",
            }}
          />

          {/* Grid pattern overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
              opacity: 0.8,
            }}
          />
        </AbsoluteFill>
      )}

      {/* The Animated Lower Third */}
      <LowerThird {...props} />
    </AbsoluteFill>
  );
};
