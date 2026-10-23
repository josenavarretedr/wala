import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "../../components/Background";
import { TopBadge } from "../../components/TopBadge";
import { CaptionChunk, KineticCaptions } from "../../components/KineticCaptions";
import { WALA_COLORS, WALA_FONTS, WALA_SPRINGS } from "../../tokens";
import { ClockIcon, ShieldCheckIcon } from "../../icons";

const CAPTIONS_SCENE_1: CaptionChunk[] = [
  {
    fromFrame: 0,
    toFrame: 150,
    text: "Hemos visto dos tipos de dueños de bodega.",
    highlightWords: ["dos", "tipos", "dueños", "bodega"],
  },
  {
    fromFrame: 150,
    toFrame: 300,
    text: "¿Cuál de los dos eres tú?",
    highlightWords: ["¿Cuál", "eres", "tú?"],
  },
];

export const BodegaScene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance springs
  const badgeSpring = spring({ frame: frame - 4, fps, config: WALA_SPRINGS.snappy });
  const titleSpring = spring({ frame: frame - 12, fps, config: WALA_SPRINGS.snappy });
  const cardASpring = spring({ frame: frame - 25, fps, config: WALA_SPRINGS.bouncy });
  const cardBSpring = spring({ frame: frame - 40, fps, config: WALA_SPRINGS.bouncy });
  const vsSpring = spring({ frame: frame - 55, fps, config: WALA_SPRINGS.bouncy });
  const hookSpring = spring({ frame: frame - 145, fps, config: WALA_SPRINGS.bouncy });

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* 1. Fondo Oficial bg_wall.png con movimiento sutil */}
      <Background layout="FULL_MOTION" />

      {/* TopBadge en Y: 140 */}
      <TopBadge text="WALA • DILEMA BODEGUERO" />

      {/* ==================================================================== */}
      {/* TERCIO SUPERIOR (Y: 230 – 640 px): HUD y Titular de Alto Impacto */}
      {/* ==================================================================== */}
      <div
        style={{
          position: "absolute",
          top: 230,
          left: 0,
          right: 0,
          padding: "0 50px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 20,
        }}
      >
        {/* Fase del guión */}
        <div
          style={{
            fontFamily: WALA_FONTS.mono,
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: "0.15em",
            color: WALA_COLORS.brandOrange,
            textTransform: "uppercase",
            opacity: badgeSpring,
          }}
        >
          [ 01 / 05 · GANCHO TRIPLE W ]
        </div>

        {/* Titular Tipográfico Denso */}
        <h1
          style={{
            fontFamily: WALA_FONTS.display,
            fontSize: 66,
            fontWeight: 900,
            lineHeight: 1.08,
            textAlign: "center",
            color: WALA_COLORS.inkPrimary,
            letterSpacing: "-0.03em",
            margin: "20px 0 0 0",
            maxWidth: 960,
            transform: `translateY(${interpolate(titleSpring, [0, 1], [30, 0])}px)`,
            opacity: titleSpring,
          }}
        >
          HEMOS VISTO{" "}
          <span
            style={{
              color: "#FFFFFF",
              backgroundColor: WALA_COLORS.brandOrange,
              padding: "4px 18px",
              borderRadius: 14,
              display: "inline-block",
            }}
          >
            DOS TIPOS
          </span>{" "}
          DE DUEÑOS DE BODEGA
        </h1>
      </div>

      {/* ==================================================================== */}
      {/* TERCIO MEDIO (Y: 640 – 1280 px): Comparativa A vs B con Iconos WALA */}
      {/* ==================================================================== */}
      <div
        style={{
          position: "absolute",
          top: 640,
          left: 50,
          right: 50,
          height: 600,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 20,
        }}
      >
        {/* Tarjeta A: El que Adivina */}
        <div
          style={{
            width: 440,
            backgroundColor: "#FFFFFF",
            borderRadius: 28,
            border: `2px solid ${WALA_COLORS.paperDividerStrong}`,
            boxShadow: WALA_COLORS.cardShadow,
            padding: "36px 28px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            transform: `scale(${interpolate(cardASpring, [0, 1], [0.8, 1])}) rotate(-1.5deg)`,
            opacity: cardASpring,
          }}
        >
          <div
            style={{
              backgroundColor: "#FEE2E2",
              color: "#DC2626",
              fontFamily: WALA_FONTS.mono,
              fontSize: 16,
              fontWeight: 800,
              padding: "6px 16px",
              borderRadius: 20,
              marginBottom: 20,
            }}
          >
            TIPO 1 · LA DUDA
          </div>

          <ClockIcon size={110} accentColor={WALA_COLORS.brandOrange} strokeWidth={3.8} />

          <div
            style={{
              fontFamily: WALA_FONTS.display,
              fontSize: 32,
              fontWeight: 800,
              color: WALA_COLORS.inkPrimary,
              marginTop: 18,
              lineHeight: 1.15,
            }}
          >
            El que <span style={{ color: "#DC2626" }}>adivina</span> o "siente"
          </div>
          <div
            style={{
              fontFamily: WALA_FONTS.mono,
              fontSize: 18,
              color: WALA_COLORS.inkMuted,
              marginTop: 10,
            }}
          >
            Incertidumbre constante
          </div>
        </div>

        {/* Badge Central VS */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            transform: `translateX(-50%) scale(${interpolate(vsSpring, [0, 1], [0, 1])})`,
            opacity: vsSpring,
            zIndex: 30,
            backgroundColor: WALA_COLORS.brandOrange,
            color: "#FFFFFF",
            width: 76,
            height: 76,
            borderRadius: 38,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: WALA_FONTS.mono,
            fontSize: 28,
            fontWeight: 900,
            boxShadow: "0 10px 25px rgba(255, 92, 0, 0.45)",
          }}
        >
          VS
        </div>

        {/* Tarjeta B: El que Sabe */}
        <div
          style={{
            width: 440,
            backgroundColor: "#FFFFFF",
            borderRadius: 28,
            border: `2.5px solid ${WALA_COLORS.brandOrangeBorder}`,
            boxShadow: "0 18px 40px -10px rgba(255, 92, 0, 0.15)",
            padding: "36px 28px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            transform: `scale(${interpolate(cardBSpring, [0, 1], [0.8, 1])}) rotate(1.5deg)`,
            opacity: cardBSpring,
          }}
        >
          <div
            style={{
              backgroundColor: WALA_COLORS.brandOrangeLight,
              color: WALA_COLORS.brandOrange,
              fontFamily: WALA_FONTS.mono,
              fontSize: 16,
              fontWeight: 800,
              padding: "6px 16px",
              borderRadius: 20,
              marginBottom: 20,
            }}
          >
            TIPO 2 · CLARIDAD
          </div>

          <ShieldCheckIcon size={110} accentColor={WALA_COLORS.brandOrange} strokeWidth={3.8} />

          <div
            style={{
              fontFamily: WALA_FONTS.display,
              fontSize: 32,
              fontWeight: 800,
              color: WALA_COLORS.inkPrimary,
              marginTop: 18,
              lineHeight: 1.15,
            }}
          >
            El que <span style={{ color: WALA_COLORS.brandOrange }}>sabe</span> con certeza
          </div>
          <div
            style={{
              fontFamily: WALA_FONTS.mono,
              fontSize: 18,
              color: WALA_COLORS.inkMuted,
              marginTop: 10,
            }}
          >
            Decisiones con calma
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* TERCIO INFERIOR (Y: 1280 – 1920 px): Pregunta de Cierre & Subtítulos */}
      {/* ==================================================================== */}
      <div
        style={{
          position: "absolute",
          top: 1300,
          left: 50,
          right: 50,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 25,
        }}
      >
        <div
          style={{
            transform: `scale(${interpolate(hookSpring, [0, 1], [0.85, 1])})`,
            opacity: hookSpring,
            backgroundColor: "#18181B",
            padding: "24px 44px",
            borderRadius: 24,
            display: "flex",
            alignItems: "center",
            gap: 20,
            boxShadow: "0 16px 36px rgba(0, 0, 0, 0.25)",
            border: "1.5px solid rgba(255, 255, 255, 0.15)",
          }}
        >
          <span
            style={{
              fontFamily: WALA_FONTS.display,
              fontSize: 48,
              fontWeight: 900,
              color: "#FFFFFF",
              letterSpacing: "-0.01em",
            }}
          >
            ¿CUÁL DE LOS DOS ERES TÚ?
          </span>
          <span style={{ fontSize: 44 }}>🤔</span>
        </div>
      </div>

      {/* Subtítulos cinéticos integrados al pie */}
      <KineticCaptions chunks={CAPTIONS_SCENE_1} bottomPosition={90} />
    </AbsoluteFill>
  );
};
