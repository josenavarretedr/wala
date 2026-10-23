import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

interface CursorProps {
  clickFrame?: number;
}

export const Cursor: React.FC<CursorProps> = ({ clickFrame = 110 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animation timeline:
  // frame 70: Cursor starts moving toward the button
  // frame 105: Arrives at button
  // frame 110: Clicks!
  // frame 130: Starts moving away / fading out
  const startFrame = 70;
  const leaveFrame = 124;

  if (frame < startFrame || frame > leaveFrame + 20) {
    return null;
  }

  // Position interpolation
  // Moves from offset (X: +180, Y: +120) to button center (X: 0, Y: 0)
  const entryProgress = spring({
    frame: frame - startFrame,
    fps,
    config: {
      damping: 14,
      mass: 0.9,
      stiffness: 90,
    },
  });

  const exitProgress = spring({
    frame: frame - leaveFrame,
    fps,
    config: {
      damping: 14,
      mass: 0.9,
      stiffness: 90,
    },
  });

  const posX =
    frame < leaveFrame
      ? interpolate(entryProgress, [0, 1], [160, 0])
      : interpolate(exitProgress, [0, 1], [0, 200]);

  const posY =
    frame < leaveFrame
      ? interpolate(entryProgress, [0, 1], [120, 0])
      : interpolate(exitProgress, [0, 1], [0, 140]);

  // Click compression
  const clickScale =
    frame >= clickFrame && frame <= clickFrame + 8
      ? interpolate(frame, [clickFrame, clickFrame + 4, clickFrame + 8], [1, 0.78, 1])
      : 1;

  // Opacity
  const opacity =
    frame < leaveFrame
      ? interpolate(frame, [startFrame, startFrame + 15], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : interpolate(frame, [leaveFrame, leaveFrame + 15], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

  return (
    <div
      style={{
        position: "absolute",
        right: 74,
        bottom: 8,
        transform: `translate(${posX}px, ${posY}px) scale(${clickScale})`,
        opacity,
        pointerEvents: "none",
        zIndex: 50,
        filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.35))",
      }}
    >
      <svg
        width="34"
        height="34"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.63-4.63c.2-.2.47-.31.75-.31h6.06c.45 0 .67-.54.35-.85L5.5 3.21z"
          fill="#111111"
          stroke="#ffffff"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
