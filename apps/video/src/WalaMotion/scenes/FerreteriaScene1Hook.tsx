import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "../components/Background";
import { TopBadge } from "../components/TopBadge";
import { CaptionChunk, KineticCaptions } from "../components/KineticCaptions";

const SCENE_CAPTIONS: CaptionChunk[] = [
  {
    fromFrame: 0,
    toFrame: 140,
    text: "La diferencia entre el ferretero...",
    highlightWords: ["diferencia", "ferretero"],
  },
  {
    fromFrame: 140,
    toFrame: 300,
    text: "...que adivina su stock y el que siempre sabe qué vender.",
    highlightWords: ["adivina", "stock", "sabe", "vender"],
  },
];

export const FerreteriaScene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance springs
  const line1Spring = spring({ frame: frame - 8, fps, config: { damping: 12, stiffness: 120 } });
  const redHighlightSpring = spring({ frame: frame - 22, fps, config: { damping: 11, stiffness: 140 } });
  const vsSpring = spring({ frame: frame - 40, fps, config: { damping: 12, stiffness: 130 } });
  const greenHighlightSpring = spring({ frame: frame - 55, fps, config: { damping: 10, stiffness: 150 } });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#FDFBF7",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      <Background layout="FULL_MOTION" />
      <TopBadge text="WALA • GESTIÓN FERRETERA" />

      {/* Kinetic Headline - Focused in Center */}
      <div
        style={{
          position: "absolute",
          top: 450,
          left: 60,
          right: 60,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 26,
          zIndex: 25,
        }}
      >
        <div
          style={{
            transform: `translateY(${interpolate(line1Spring, [0, 1], [30, 0])}px)`,
            opacity: interpolate(line1Spring, [0, 1], [0, 1]),
            color: "#334155",
            fontSize: 48,
            fontWeight: 700,
            letterSpacing: "-0.02em",
          }}
        >
          La diferencia entre el ferretero que
        </div>

        {/* "¿ADIVINA SU STOCK?" */}
        <div
          style={{
            transform: `scale(${interpolate(redHighlightSpring, [0, 1], [0.8, 1])})`,
            opacity: interpolate(redHighlightSpring, [0, 1], [0, 1]),
            padding: "16px 40px",
            borderRadius: 24,
            background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
            color: "#FFFFFF",
            fontSize: 58,
            fontWeight: 900,
            letterSpacing: "-0.01em",
            textTransform: "uppercase",
            boxShadow:
              "0 20px 45px rgba(239, 68, 68, 0.4), 0 4px 15px rgba(239, 68, 68, 0.25)",
          }}
        >
          ADIVINA SU STOCK
        </div>

        {/* "VS" Divider pill */}
        <div
          style={{
            transform: `scale(${interpolate(vsSpring, [0, 1], [0.5, 1])})`,
            opacity: interpolate(vsSpring, [0, 1], [0, 1]),
            color: "#64748B",
            fontSize: 26,
            fontWeight: 800,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          — VS —
        </div>

        {/* "...y el que siempre sabe QUÉ VENDER" */}
        <div
          style={{
            transform: `scale(${interpolate(greenHighlightSpring, [0, 1], [0.85, 1])})`,
            opacity: interpolate(greenHighlightSpring, [0, 1], [0, 1]),
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <span style={{ color: "#1E293B", fontSize: 46, fontWeight: 700 }}>
            y el que siempre sabe
          </span>
          <span
            style={{
              padding: "16px 38px",
              borderRadius: 24,
              background: "rgba(236, 253, 245, 0.98)",
              border: "3px solid #059669",
              color: "#065F46",
              fontSize: 56,
              fontWeight: 900,
              boxShadow: "0 16px 40px rgba(5, 150, 105, 0.22)",
            }}
          >
            QUÉ VENDER
          </span>
        </div>
      </div>

      {/* Kinetic Captions */}
      <KineticCaptions chunks={SCENE_CAPTIONS} bottomPosition={140} />
    </AbsoluteFill>
  );
};
