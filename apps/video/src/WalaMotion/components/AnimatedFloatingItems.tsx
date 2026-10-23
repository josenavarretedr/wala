import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

interface FloatingItem {
  icon: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  size: number;
  speed: number;
  phase: number;
  rotationSpeed: number;
}

const ITEMS: FloatingItem[] = [
  // Golden Coins escaping
  { icon: "🪙", startX: 470, startY: 620, endX: 720, endY: 280, size: 42, speed: 65, phase: 0, rotationSpeed: 4 },
  { icon: "🪙", startX: 490, startY: 630, endX: 680, endY: 340, size: 36, speed: 55, phase: 18, rotationSpeed: -5 },
  { icon: "🪙", startX: 460, startY: 610, endX: 760, endY: 240, size: 48, speed: 70, phase: 35, rotationSpeed: 6 },
  { icon: "🪙", startX: 510, startY: 640, endX: 800, endY: 310, size: 38, speed: 60, phase: 48, rotationSpeed: -4 },
  // Tools leaking out
  { icon: "🔨", startX: 480, startY: 610, endX: 740, endY: 200, size: 44, speed: 80, phase: 12, rotationSpeed: 3 },
  { icon: "🔧", startX: 500, startY: 625, endX: 700, endY: 260, size: 40, speed: 75, phase: 28, rotationSpeed: -6 },
  { icon: "🔩", startX: 465, startY: 635, endX: 660, endY: 380, size: 34, speed: 50, phase: 42, rotationSpeed: 8 },
  { icon: "📦", startX: 485, startY: 645, endX: 780, endY: 360, size: 46, speed: 85, phase: 5, rotationSpeed: 2 },
  // Golden sparkles
  { icon: "✨", startX: 475, startY: 600, endX: 650, endY: 290, size: 32, speed: 45, phase: 22, rotationSpeed: 5 },
  { icon: "✨", startX: 505, startY: 615, endX: 730, endY: 220, size: 34, speed: 50, phase: 40, rotationSpeed: -7 },
];

export const AnimatedFloatingItems: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 40,
        overflow: "hidden",
      }}
    >
      {ITEMS.map((item, index) => {
        // Progress of this particle in its loop [0, 1]
        const progress = ((frame + item.phase) % item.speed) / item.speed;

        // Current position along the curved trajectory
        const currentX = interpolate(progress, [0, 1], [item.startX, item.endX]);
        const currentY =
          interpolate(progress, [0, 1], [item.startY, item.endY]) -
          Math.sin(progress * Math.PI) * 45; // slight arch

        // Opacity: fade in at start, fade out at end
        const opacity = interpolate(
          progress,
          [0, 0.2, 0.8, 1],
          [0, 1, 0.9, 0]
        );

        // Scale: slight pop then settle
        const scale = interpolate(progress, [0, 0.2, 0.9, 1], [0.6, 1.1, 0.9, 0.7]);

        // Continuous rotation
        const rotation = (frame + item.phase) * item.rotationSpeed;

        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: currentX,
              top: currentY,
              fontSize: item.size,
              transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg)`,
              opacity,
              filter: "drop-shadow(0 6px 12px rgba(234, 179, 8, 0.45))",
            }}
          >
            {item.icon}
          </div>
        );
      })}
    </div>
  );
};
