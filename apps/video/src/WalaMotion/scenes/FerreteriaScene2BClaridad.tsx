import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "../components/Background";
import { TopBadge } from "../components/TopBadge";
import { CaptionChunk, KineticCaptions } from "../components/KineticCaptions";

const SCENE_CAPTIONS: CaptionChunk[] = [
  {
    fromFrame: 0,
    toFrame: 200,
    text: "Y luego está el que en cinco segundos te dice:",
    highlightWords: ["cinco", "segundos"],
  },
  {
    fromFrame: 200,
    toFrame: 350,
    text: "'Sí, tengo 12 unidades y te llegan 20 más mañana'.",
    highlightWords: ["12", "unidades", "20", "mañana"],
  },
  {
    fromFrame: 350,
    toFrame: 450,
    text: "Esa pequeña diferencia no es por magia: es por claridad.",
    highlightWords: ["magia", "claridad"],
  },
];

export const FerreteriaScene2BClaridad: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring for image hero
  const imageSpring = spring({
    frame: frame - 10,
    fps,
    config: { damping: 13, stiffness: 110 },
  });

  // Entrance for 5-second headline
  const headlineSpring = spring({
    frame: frame - 25,
    fps,
    config: { damping: 12, stiffness: 120 },
  });

  // Floating breathing effect
  const floatOffset = Math.sin(frame / 20) * 8;

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
      <TopBadge text="CASO REAL • RESPUESTA EN 5 SEGUNDOS" />

      {/* Headline banner at top */}
      <div
        style={{
          position: "absolute",
          top: 250,
          left: 50,
          right: 50,
          textAlign: "center",
          transform: `translateY(${interpolate(headlineSpring, [0, 1], [30, 0])}px)`,
          opacity: interpolate(headlineSpring, [0, 1], [0, 1]),
          zIndex: 25,
        }}
      >
        <div
          style={{
            background: "#ECFDF5",
            border: "2px solid #6EE7B7",
            borderRadius: 24,
            padding: "22px 32px",
            boxShadow: "0 14px 30px rgba(16, 185, 129, 0.12)",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div style={{ color: "#065F46", fontSize: 19, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Respuesta en 5 segundos con WALA:
          </div>
          <div
            style={{
              color: "#047857",
              fontSize: 32,
              fontWeight: 900,
              lineHeight: 1.3,
            }}
          >
            "Sí, tengo 12 unidades y te llegan 20 mañana."
          </div>
        </div>
      </div>

      {/* SINGLE HERO VISUAL: 3D Illustration of organized owner with smartphone */}
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
              "0 25px 60px rgba(0, 0, 0, 0.15), 0 10px 25px rgba(16, 185, 129, 0.15)",
            position: "relative",
          }}
        >
          <Img
            src={staticFile("hardware_organized.jpg")}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />

          {/* Badge over image */}
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
            }}
          >
            <span style={{ fontSize: 26 }}>📱</span>
            <span style={{ fontSize: 21, fontWeight: 700, color: "#34D399" }}>
              Stock en el celular • Control en tiempo real
            </span>
          </div>
        </div>
      </div>

      {/* Kinetic Captions */}
      <KineticCaptions chunks={SCENE_CAPTIONS} bottomPosition={140} />
    </AbsoluteFill>
  );
};
