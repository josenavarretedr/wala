import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "../components/Background";
import { TopBadge } from "../components/TopBadge";
import { AnimatedFloatingItems } from "../components/AnimatedFloatingItems";
import { CaptionChunk, KineticCaptions } from "../components/KineticCaptions";

const SCENE_CAPTIONS: CaptionChunk[] = [
  {
    fromFrame: 0,
    toFrame: 260,
    text: "Porque en la ferretería, creer que sabes tu stock por memoria...",
    highlightWords: ["ferretería", "stock", "memoria"],
  },
  {
    fromFrame: 260,
    toFrame: 520,
    text: "...es como dejar la puerta abierta: lo que no registras, se pierde en ventas.",
    highlightWords: ["puerta", "abierta", "pierde", "ventas"],
  },
  {
    fromFrame: 520,
    toFrame: 750,
    text: "Y cada vez que vendas uno de esos cinco, anótalo. Solo eso.",
    highlightWords: ["vendas", "anótalo", "solo"],
  },
];

export const FerreteriaScene3BPuertaAbierta: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring for image hero
  const imageSpring = spring({
    frame: frame - 10,
    fps,
    config: { damping: 13, stiffness: 110 },
  });

  // Entrance for headline quote
  const quoteSpring = spring({
    frame: frame - 25,
    fps,
    config: { damping: 12, stiffness: 120 },
  });

  // Floating breathing effect
  const floatOffset = Math.sin(frame / 20) * 6;

  const imageScale = interpolate(imageSpring, [0, 1], [0.88, 1]);
  const imageTranslateY = interpolate(imageSpring, [0, 1], [50, 0]) + floatOffset;
  const imageOpacity = interpolate(imageSpring, [0, 1], [0, 1]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#FDFBF7",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      <Background layout="FULL_MOTION" />
      <TopBadge text="REGLA DE ORO • FERRETERÍA WALA" />

      {/* Quote at top */}
      <div
        style={{
          position: "absolute",
          top: 240,
          left: 50,
          right: 50,
          textAlign: "center",
          transform: `translateY(${interpolate(quoteSpring, [0, 1], [30, 0])}px)`,
          opacity: interpolate(quoteSpring, [0, 1], [0, 1]),
          zIndex: 25,
        }}
      >
        <div
          style={{
            background: "#FFF1F2",
            border: "2px solid #FDA4AF",
            borderRadius: 24,
            padding: "22px 30px",
            boxShadow: "0 14px 30px rgba(244, 63, 94, 0.12)",
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <div style={{ color: "#E11D48", fontSize: 19, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            🚪 La Metáfora Ferretera:
          </div>
          <div
            style={{
              color: "#9F1239",
              fontSize: 32,
              fontWeight: 900,
              lineHeight: 1.3,
            }}
          >
            "Creer que sabes tu stock por memoria es como dejar la puerta de tu negocio abierta."
          </div>
        </div>
      </div>

      {/* SINGLE HERO VISUAL: 3D Store with 'Ferretería WALA' sign and Animated Flying Items */}
      <div
        style={{
          position: "absolute",
          top: 480,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          transform: `translateY(${imageTranslateY}px) scale(${imageScale})`,
          opacity: imageOpacity,
          zIndex: 30,
        }}
      >
        <div
          style={{
            width: 720,
            height: 720,
            borderRadius: 36,
            overflow: "hidden",
            border: "4px solid #FFFFFF",
            boxShadow:
              "0 25px 60px rgba(0, 0, 0, 0.16), 0 10px 25px rgba(244, 63, 94, 0.15)",
            position: "relative",
          }}
        >
          {/* Real 3D Store Image with 'Ferretería WALA' on the sign */}
          <Img
            src={staticFile("hardware_wala_store.jpg")}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />

          {/* ACTIVE ANIMATED PARTICLES: Coins and tools flying out the open doorway */}
          <AnimatedFloatingItems />

          {/* Warning badge over image */}
          <div
            style={{
              position: "absolute",
              bottom: 24,
              left: 24,
              right: 24,
              background: "rgba(15, 23, 42, 0.9)",
              backdropFilter: "blur(12px)",
              padding: "16px 24px",
              borderRadius: 20,
              display: "flex",
              alignItems: "center",
              gap: 12,
              color: "#FFFFFF",
              zIndex: 45,
            }}
          >
            <span style={{ fontSize: 26 }}>⚠️</span>
            <span style={{ fontSize: 21, fontWeight: 700, color: "#FCA5A5" }}>
              Fuga activa: herramientas y monedas perdiéndose
            </span>
          </div>
        </div>
      </div>

      {/* Kinetic Captions at Bottom */}
      <KineticCaptions chunks={SCENE_CAPTIONS} bottomPosition={140} />
    </AbsoluteFill>
  );
};
