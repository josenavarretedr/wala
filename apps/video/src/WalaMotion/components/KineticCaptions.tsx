import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export interface CaptionChunk {
  fromFrame: number;
  toFrame: number;
  text: string;
  highlightWords?: string[];
}

interface KineticCaptionsProps {
  chunks: CaptionChunk[];
  bottomPosition?: number;
}

export const KineticCaptions: React.FC<KineticCaptionsProps> = ({
  chunks,
  bottomPosition = 90,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Find active chunk
  const activeChunk = chunks.find(
    (c) => frame >= c.fromFrame && frame < c.toFrame
  );

  if (!activeChunk) {
    return null;
  }

  // Animation pop on chunk change
  const chunkLocalFrame = frame - activeChunk.fromFrame;
  const popSpring = spring({
    frame: chunkLocalFrame,
    fps,
    config: { damping: 12, stiffness: 140 },
  });

  const scale = interpolate(popSpring, [0, 1], [0.92, 1]);
  const opacity = interpolate(popSpring, [0, 1], [0, 1]);

  const words = activeChunk.text.split(" ");

  return (
    <div
      style={{
        position: "absolute",
        bottom: bottomPosition,
        left: 40,
        right: 40,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 50,
        pointerEvents: "none",
        transform: `scale(${scale})`,
        opacity,
      }}
    >
      <div
        style={{
          background: "rgba(15, 23, 42, 0.92)",
          backdropFilter: "blur(16px)",
          border: "2px solid rgba(255, 255, 255, 0.18)",
          borderRadius: 24,
          padding: "16px 28px",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "8px 12px",
          maxWidth: 960,
          boxShadow:
            "0 20px 40px rgba(0, 0, 0, 0.3), 0 0 30px rgba(16, 185, 129, 0.2)",
          textAlign: "center",
        }}
      >
        {words.map((word, i) => {
          // Clean punctuation for matching highlight
          const clean = word.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, "");
          const isHighlighted = activeChunk.highlightWords?.some(
            (hw) => hw.toLowerCase() === clean
          );

          return (
            <span
              key={i}
              style={{
                fontSize: 32,
                fontWeight: isHighlighted ? 900 : 700,
                color: isHighlighted ? "#34D399" : "#FFFFFF",
                textShadow: isHighlighted
                  ? "0 0 16px rgba(52, 211, 153, 0.6)"
                  : "0 2px 4px rgba(0, 0, 0, 0.4)",
                letterSpacing: "-0.01em",
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    </div>
  );
};
