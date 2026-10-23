import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "../../components/Background";
import { TopBadge } from "../../components/TopBadge";
import { CaptionChunk, KineticCaptions } from "../../components/KineticCaptions";
import { WALA_COLORS, WALA_FONTS, WALA_SPRINGS } from "../../tokens";
import { ClockIcon, DonutChartIcon, MapLocationIcon, ShieldCheckIcon } from "../../icons";

const CAPTIONS_SCENE_2: CaptionChunk[] = [
  {
    fromFrame: 0,
    toFrame: 220,
    text: "Uno cree que sabe qué tiene en el almacén porque lo siente o lo ve.",
    highlightWords: ["cree", "almacén", "siente", "ve"],
  },
  {
    fromFrame: 220,
    toFrame: 450,
    text: "El primero, vive con la duda de si tiene suficiente para el fin de semana.",
    highlightWords: ["primero,", "duda", "suficiente", "fin", "semana"],
  },
  {
    fromFrame: 450,
    toFrame: 680,
    text: "El otro sabe exactamente cuánto le queda de cada producto importante, sin adivinar.",
    highlightWords: ["sabe", "exactamente", "cuánto", "importante,", "sin", "adivinar"],
  },
  {
    fromFrame: 680,
    toFrame: 900,
    text: "El segundo tipo de bodeguero, toma decisiones tranquilo.",
    highlightWords: ["segundo", "toma", "decisiones", "tranquilo."],
  },
];

export const BodegaScene2Caso: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Switch between Phase A (Caos, frames 0-450) and Phase B (Claridad, frames 450-900)
  const isPhaseA = frame < 450;
  const localFrame = isPhaseA ? frame : frame - 450;

  // Spring animations for transitions
  const cardSpring = spring({ frame: localFrame - 6, fps, config: WALA_SPRINGS.snappy });
  const badgeSpring = spring({ frame: localFrame - 15, fps, config: WALA_SPRINGS.bouncy });
  const dataSpring = spring({ frame: localFrame - 25, fps, config: WALA_SPRINGS.snappy });

  // Camera scale for illustration (1.0 to 1.05)
  const imgScale = interpolate(localFrame, [0, 450], [1.0, 1.06], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Background layout="FULL_MOTION" />

      {/* TopBadge en Y: 140 */}
      <TopBadge text="WALA • COMPARATIVA REAL" />

      {/* ==================================================================== */}
      {/* TERCIO SUPERIOR (Y: 230 – 600 px): Estado del Caso y Titulares */}
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
            color: isPhaseA ? "#DC2626" : WALA_COLORS.brandOrange,
            textTransform: "uppercase",
          }}
        >
          {isPhaseA ? "[ 02A · CASO DE CAOS & DUDA ]" : "[ 02B · CASO DE CONTROL & CERTEZA ]"}
        </div>

        {/* Titular Dinámico de Alto Impacto */}
        <h1
          style={{
            fontFamily: WALA_FONTS.display,
            fontSize: 60,
            fontWeight: 900,
            lineHeight: 1.1,
            textAlign: "center",
            color: WALA_COLORS.inkPrimary,
            letterSpacing: "-0.02em",
            margin: "20px 0 0 0",
            maxWidth: 980,
          }}
        >
          {isPhaseA ? (
            <>
              VIVE CON LA{" "}
              <span style={{ color: "#FFFFFF", backgroundColor: "#DC2626", padding: "4px 16px", borderRadius: 12 }}>
                DUDA
              </span>{" "}
              DEL FIN DE SEMANA
            </>
          ) : (
            <>
              SABE{" "}
              <span style={{ color: "#FFFFFF", backgroundColor: WALA_COLORS.brandOrange, padding: "4px 16px", borderRadius: 12 }}>
                EXACTAMENTE
              </span>{" "}
              CUÁNTO LE QUEDA
            </>
          )}
        </h1>
      </div>

      {/* ==================================================================== */}
      {/* TERCIO MEDIO (Y: 640 – 1280 px): Ilustración 9:16 sin marcos ni texto */}
      {/* ==================================================================== */}
      <div
        style={{
          position: "absolute",
          top: 580,
          left: 60,
          right: 60,
          height: 720,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 20,
        }}
      >
        <div
          style={{
            width: 480,
            height: 680,
            borderRadius: 28,
            overflow: "hidden",
            boxShadow: "0 24px 50px -12px rgba(0, 0, 0, 0.22), 0 0 0 2px rgba(0, 0, 0, 0.08)",
            position: "relative",
            backgroundColor: "#FFFFFF",
            transform: `scale(${interpolate(cardSpring, [0, 1], [0.88, 1])})`,
            opacity: cardSpring,
          }}
        >
          {/* Ilustración pura en 9:16 */}
          <Img
            src={staticFile(isPhaseA ? "bodega_caos.jpg" : "bodega_control.jpg")}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: `scale(${imgScale})`,
            }}
          />

          {/* Badge Flotante con Icono WALA */}
          <div
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              backgroundColor: isPhaseA ? "rgba(220, 38, 38, 0.95)" : "rgba(255, 92, 0, 0.95)",
              color: "#FFFFFF",
              padding: "10px 16px",
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              gap: 10,
              boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
              transform: `scale(${interpolate(badgeSpring, [0, 1], [0.7, 1])})`,
              opacity: badgeSpring,
            }}
          >
            {isPhaseA ? (
              <ClockIcon size={32} color="#FFFFFF" accentColor="#FEE2E2" strokeWidth={3.8} />
            ) : (
              <ShieldCheckIcon size={32} color="#FFFFFF" accentColor="#FFF0EB" strokeWidth={3.8} />
            )}
            <span style={{ fontFamily: WALA_FONTS.mono, fontSize: 15, fontWeight: 800 }}>
              {isPhaseA ? "GESTIÓN A CIEGAS" : "CONTROL TOTAL"}
            </span>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* TERCIO INFERIOR (Y: 1280 – 1920 px): Ficha de Datos Tabulares & Captions */}
      {/* ==================================================================== */}
      <div
        style={{
          position: "absolute",
          top: 1320,
          left: 60,
          right: 60,
          zIndex: 25,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 880,
            backgroundColor: "#FFFFFF",
            borderRadius: 22,
            border: `2px solid ${isPhaseA ? "rgba(220, 38, 38, 0.3)" : WALA_COLORS.brandOrangeBorder}`,
            boxShadow: WALA_COLORS.cardShadow,
            padding: "24px 32px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            transform: `translateY(${interpolate(dataSpring, [0, 1], [25, 0])}px)`,
            opacity: dataSpring,
          }}
        >
          {isPhaseA ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <MapLocationIcon size={52} accentColor="#DC2626" />
                <div>
                  <div style={{ fontFamily: WALA_FONTS.display, fontSize: 26, fontWeight: 800, color: WALA_COLORS.inkPrimary }}>
                    ¿QUÉ PASA CON EL STOCK?
                  </div>
                  <div style={{ fontFamily: WALA_FONTS.mono, fontSize: 16, color: "#DC2626", fontWeight: 700 }}>
                    "Creo que queda arroz... no estoy seguro"
                  </div>
                </div>
              </div>
              <div
                style={{
                  backgroundColor: "#FEE2E2",
                  color: "#DC2626",
                  fontFamily: WALA_FONTS.mono,
                  fontSize: 16,
                  fontWeight: 900,
                  padding: "10px 18px",
                  borderRadius: 12,
                }}
              >
                RIESGO ALTO
              </div>
            </>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <DonutChartIcon size={52} accentColor={WALA_COLORS.brandOrange} />
                <div>
                  <div style={{ fontFamily: WALA_FONTS.display, fontSize: 26, fontWeight: 800, color: WALA_COLORS.inkPrimary }}>
                    STOCK PRECISO EN TIEMPO REAL
                  </div>
                  <div style={{ fontFamily: WALA_FONTS.mono, fontSize: 16, color: WALA_COLORS.brandOrange, fontWeight: 700 }}>
                    ARROZ: 24 UDS · ACEITE: 18 UDS · LECHE: 36 UDS
                  </div>
                </div>
              </div>
              <div
                style={{
                  backgroundColor: WALA_COLORS.brandOrangeLight,
                  color: WALA_COLORS.brandOrange,
                  fontFamily: WALA_FONTS.mono,
                  fontSize: 16,
                  fontWeight: 900,
                  padding: "10px 18px",
                  borderRadius: 12,
                }}
              >
                TRANQUILIDAD ✓
              </div>
            </>
          )}
        </div>
      </div>

      {/* Subtítulos cinéticos */}
      <KineticCaptions chunks={CAPTIONS_SCENE_2} bottomPosition={90} />
    </AbsoluteFill>
  );
};
