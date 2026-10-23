import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "../components/Background";
import { TopBadge } from "../components/TopBadge";
import { WalaMetricsInventory } from "../components/WalaMetricsInventory";
import { WalaCardProduct } from "../components/WalaCardProduct";
import { CaptionChunk, KineticCaptions } from "../components/KineticCaptions";

const SCENE_CAPTIONS: CaptionChunk[] = [
  {
    fromFrame: 0,
    toFrame: 250,
    text: "No necesitas un sistema complejo para empezar. Empieza simple:",
    highlightWords: ["complejo", "simple"],
  },
  {
    fromFrame: 250,
    toFrame: 500,
    text: "esta semana, anota los cinco productos que más vendes en tu ferretería.",
    highlightWords: ["cinco", "productos", "vendes", "ferretería"],
  },
  {
    fromFrame: 500,
    toFrame: 750,
    text: "Solo la cantidad inicial de cada uno.",
    highlightWords: ["cantidad", "inicial"],
  },
];

export const FerreteriaScene3AMetricas: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance springs
  const headerSpring = spring({ frame: frame - 10, fps, config: { damping: 12, stiffness: 120 } });
  const metricsSpring = spring({ frame: frame - 30, fps, config: { damping: 13, stiffness: 110 } });
  const cardSpring = spring({ frame: frame - 60, fps, config: { damping: 12, stiffness: 120 } });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#FDFBF7",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      <Background layout="FULL_MOTION" />
      <TopBadge text="PASO 1 • EMPIEZA SIMPLE" />

      {/* Action Header at top */}
      <div
        style={{
          position: "absolute",
          top: 280,
          left: 50,
          right: 50,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          transform: `translateY(${interpolate(headerSpring, [0, 1], [30, 0])}px)`,
          opacity: interpolate(headerSpring, [0, 1], [0, 1]),
          zIndex: 25,
        }}
      >
        <span style={{ color: "#475569", fontSize: 32, fontWeight: 700 }}>
          No necesitas un sistema complejo:
        </span>
        <div
          style={{
            background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
            color: "#FFFFFF",
            fontSize: 42,
            fontWeight: 900,
            padding: "12px 36px",
            borderRadius: 22,
            boxShadow: "0 12px 30px rgba(16, 185, 129, 0.3)",
            letterSpacing: "-0.01em",
          }}
        >
          ANOTA SOLO LOS 5 QUE MÁS VENDES
        </div>
      </div>

      {/* SINGLE HERO VISUAL COMPONENT: MetricsInventory Card from WALA */}
      <div
        style={{
          position: "absolute",
          top: 560,
          left: 50,
          right: 50,
          transform: `translateY(${interpolate(metricsSpring, [0, 1], [40, 0])}px)`,
          opacity: interpolate(metricsSpring, [0, 1], [0, 1]),
          zIndex: 30,
        }}
      >
        <WalaMetricsInventory merchValue={8450} merchCount={5} delayFrame={30} />
      </div>

      {/* SINGLE PRODUCT CARD AS THE EXAMPLE (Broca) */}
      <div
        style={{
          position: "absolute",
          top: 890,
          left: 50,
          right: 50,
          transform: `translateY(${interpolate(cardSpring, [0, 1], [40, 0])}px)`,
          opacity: interpolate(cardSpring, [0, 1], [0, 1]),
          zIndex: 30,
        }}
      >
        <WalaCardProduct
          description="Broca para Concreto 1/2 Bosch"
          price={24.0}
          stock={12}
          unit="uni"
          arrivalNotice="Stock inicial anotado"
          isDoubtful={false}
          delayFrame={60}
        />
      </div>

      {/* Kinetic Captions */}
      <KineticCaptions chunks={SCENE_CAPTIONS} bottomPosition={140} />
    </AbsoluteFill>
  );
};
