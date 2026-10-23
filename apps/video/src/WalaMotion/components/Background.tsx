import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, Video } from "remotion";

interface BackgroundProps {
  layout: "FULL_MOTION" | "TALKING_HEAD";
  videoSource?: string;
}

export const Background: React.FC<BackgroundProps> = ({
  layout,
  videoSource,
}) => {
  const frame = useCurrentFrame();

  if (layout === "TALKING_HEAD" && videoSource) {
    return (
      <AbsoluteFill style={{ backgroundColor: "#F8FAFC" }}>
        <Video
          src={videoSource}
          style={{
            width: "100%",
            height: "100%",
          }}
        />
        {/* Soft light scrim */}
        <AbsoluteFill
          style={{
            background:
              "linear-gradient(180deg, rgba(255, 255, 255, 0.88) 0%, rgba(255, 255, 255, 0.45) 45%, rgba(255, 255, 255, 0.85) 100%)",
            pointerEvents: "none",
          }}
        />
      </AbsoluteFill>
    );
  }

  // Very subtle zoom in bg wall for cinematic polish (1.0 to 1.04 over 5 seconds)
  const bgScale = interpolate(frame, [0, 300], [1, 1.04], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#FDFBF7",
        overflow: "hidden",
      }}
    >
      {/* WALA Wall Doodle Pattern Background */}
      <div
        style={{
          position: "absolute",
          inset: -40,
          transform: `scale(${bgScale})`,
        }}
      >
        <Img
          src={staticFile("bg_wall.png")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.95,
          }}
        />
      </div>

      {/* Soft warm radial gradient overlay to give studio lighting */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 35%, rgba(255, 255, 255, 0.4) 0%, rgba(245, 240, 230, 0.3) 60%, rgba(230, 224, 212, 0.6) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
