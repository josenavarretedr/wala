import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "../../components/Background";
import { TopBadge } from "../../components/TopBadge";
import { CaptionChunk, KineticCaptions } from "../../components/KineticCaptions";
import { WALA_COLORS, WALA_FONTS, WALA_SPRINGS } from "../../tokens";
import { RobotChatIcon, SaleBadgeIcon, GiftTagIcon } from "../../icons";

const CAPTIONS_SCENE_5: CaptionChunk[] = [
  {
    fromFrame: 0,
    toFrame: 150,
    text: "Para que no pierdas de vista tus productos más importantes, WALA lo resuelve gratis.",
    highlightWords: ["WALA", "resuelve", "gratis."],
  },
  {
    fromFrame: 150,
    toFrame: 300,
    text: "Registra tu stock inicial en un minuto. Está en el link de mi perfil. Es gratis.",
    highlightWords: ["stock", "minuto.", "link", "perfil.", "gratis."],
  },
];

export const BodegaScene5CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame: frame - 6, fps, config: WALA_SPRINGS.snappy });
  const cardSpring = spring({ frame: frame - 18, fps, config: WALA_SPRINGS.bouncy });
  const ctaBtnSpring = spring({ frame: frame - 40, fps, config: WALA_SPRINGS.bouncy });
  const cursorSpring = spring({ frame: frame - 65, fps, config: WALA_SPRINGS.snappy });

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Background layout="FULL_MOTION" />

      {/* TopBadge en Y: 140 */}
      <TopBadge text="WALA • 100% GRATIS" />

      {/* ==================================================================== */}
      {/* TERCIO SUPERIOR (Y: 230 – 520 px): Titular de Cierre */}
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
        <div
          style={{
            fontFamily: WALA_FONTS.mono,
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: "0.15em",
            color: WALA_COLORS.brandOrange,
            textTransform: "uppercase",
          }}
        >
          [ 05 / 05 · SOLUCIÓN INMEDIATA ]
        </div>

        <h1
          style={{
            fontFamily: WALA_FONTS.display,
            fontSize: 62,
            fontWeight: 900,
            lineHeight: 1.1,
            textAlign: "center",
            color: WALA_COLORS.inkPrimary,
            letterSpacing: "-0.02em",
            margin: "20px 0 0 0",
            maxWidth: 960,
            transform: `translateY(${interpolate(titleSpring, [0, 1], [30, 0])}px)`,
            opacity: titleSpring,
          }}
        >
          REGISTRA TU STOCK EN{" "}
          <span
            style={{
              color: "#FFFFFF",
              backgroundColor: WALA_COLORS.brandOrange,
              padding: "4px 18px",
              borderRadius: 14,
            }}
          >
            1 MINUTO
          </span>
        </h1>
      </div>

      {/* ==================================================================== */}
      {/* TERCIO MEDIO (Y: 520 – 1280 px): Tarjeta Móvil WALA con Iconos Doodle */}
      {/* ==================================================================== */}
      <div
        style={{
          position: "absolute",
          top: 520,
          left: 60,
          right: 60,
          height: 680,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 20,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 780,
            backgroundColor: "#FFFFFF",
            borderRadius: 32,
            border: `3px solid ${WALA_COLORS.brandOrangeBorder}`,
            boxShadow: "0 28px 60px -15px rgba(255, 92, 0, 0.22), 0 0 0 1px rgba(0,0,0,0.06)",
            padding: "40px 44px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            transform: `scale(${interpolate(cardSpring, [0, 1], [0.85, 1])})`,
            opacity: cardSpring,
            position: "relative",
          }}
        >
          {/* Badge superior */}
          <div
            style={{
              backgroundColor: WALA_COLORS.brandOrangeLight,
              color: WALA_COLORS.brandOrange,
              fontFamily: WALA_FONTS.mono,
              fontSize: 16,
              fontWeight: 800,
              padding: "8px 22px",
              borderRadius: 20,
              marginBottom: 24,
            }}
          >
            SISTEMA PARA BODEGAS WALA
          </div>

          {/* Fila de Iconos WALA */}
          <div style={{ display: "flex", gap: 36, alignItems: "center", marginBottom: 28 }}>
            <RobotChatIcon size={72} accentColor={WALA_COLORS.brandOrange} />
            <SaleBadgeIcon size={76} accentColor={WALA_COLORS.brandOrange} />
            <GiftTagIcon size={72} accentColor={WALA_COLORS.brandOrange} />
          </div>

          <div
            style={{
              fontFamily: WALA_FONTS.display,
              fontSize: 34,
              fontWeight: 900,
              color: WALA_COLORS.inkPrimary,
              textAlign: "center",
              lineHeight: 1.2,
            }}
          >
            Controla tus ventas y stock sin cuadernos complicados
          </div>

          <div
            style={{
              fontFamily: WALA_FONTS.mono,
              fontSize: 20,
              color: WALA_COLORS.inkMuted,
              marginTop: 12,
              textAlign: "center",
            }}
          >
            Disponible directamente desde tu celular
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* TERCIO INFERIOR (Y: 1280 – 1920 px): Botón CTA de Alta Conversión */}
      {/* ==================================================================== */}
      <div
        style={{
          position: "absolute",
          top: 1300,
          left: 50,
          right: 50,
          zIndex: 25,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            transform: `scale(${interpolate(ctaBtnSpring, [0, 1], [0.85, 1])})`,
            opacity: ctaBtnSpring,
            backgroundColor: WALA_COLORS.brandOrange,
            padding: "24px 50px",
            borderRadius: 24,
            display: "flex",
            alignItems: "center",
            gap: 20,
            boxShadow: "0 20px 45px rgba(255, 92, 0, 0.45)",
            position: "relative",
          }}
        >
          <span
            style={{
              fontFamily: WALA_FONTS.display,
              fontSize: 42,
              fontWeight: 900,
              color: "#FFFFFF",
              letterSpacing: "-0.01em",
            }}
          >
            LINK EN MI PERFIL
          </span>
          <span
            style={{
              backgroundColor: "#FFFFFF",
              color: WALA_COLORS.brandOrange,
              fontFamily: WALA_FONTS.mono,
              fontSize: 20,
              fontWeight: 900,
              padding: "8px 16px",
              borderRadius: 14,
            }}
          >
            GRATIS
          </span>

          {/* Cursor animado haciendo clic */}
          <div
            style={{
              position: "absolute",
              right: -15,
              bottom: -25,
              fontSize: 50,
              transform: `translate(${interpolate(cursorSpring, [0, 1], [30, 0])}px, ${interpolate(cursorSpring, [0, 1], [30, 0])}px)`,
              opacity: cursorSpring,
            }}
          >
            👆
          </div>
        </div>
      </div>

      <KineticCaptions chunks={CAPTIONS_SCENE_5} bottomPosition={90} />
    </AbsoluteFill>
  );
};
