import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "../../components/Background";
import { TopBadge } from "../../components/TopBadge";
import { CaptionChunk, KineticCaptions } from "../../components/KineticCaptions";
import { WALA_COLORS, WALA_FONTS, WALA_SPRINGS } from "../../tokens";
import { BanknoteIcon, HandCashIcon, ShoppingCartIcon } from "../../icons";

const CAPTIONS_SCENE_3: CaptionChunk[] = [
  {
    fromFrame: 0,
    toFrame: 280,
    text: "Si te sientes más identificado con el primer tipo, no estás solo.",
    highlightWords: ["identificado", "primer", "tipo,", "no", "estás", "solo."],
  },
  {
    fromFrame: 280,
    toFrame: 560,
    text: "Pero hay un detalle clave que te está costando dinero.",
    highlightWords: ["detalle", "clave", "costando", "dinero."],
  },
  {
    fromFrame: 560,
    toFrame: 920,
    text: "No tener el stock de tus 5 productos más vendidos es como dejar la caja registradora abierta.",
    highlightWords: ["stock", "5", "productos", "caja", "registradora", "abierta."],
  },
  {
    fromFrame: 920,
    toFrame: 1220,
    text: "Y no contar el dinero: estás perdiendo control sin darte cuenta, y eso genera estrés.",
    highlightWords: ["no", "contar", "perdiendo", "control", "estrés."],
  },
  {
    fromFrame: 1220,
    toFrame: 1500,
    text: "El que tiene claridad sabe que no puede confiar solo en la memoria.",
    highlightWords: ["claridad", "no", "puede", "confiar", "memoria."],
  },
];

export const BodegaScene3Valor: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame: frame - 10, fps, config: WALA_SPRINGS.snappy });
  const imgSpring = spring({ frame: frame - 20, fps, config: WALA_SPRINGS.snappy });
  const note1Spring = spring({ frame: frame - 45, fps, config: WALA_SPRINGS.bouncy });
  const note2Spring = spring({ frame: frame - 65, fps, config: WALA_SPRINGS.bouncy });
  const alertCardSpring = spring({ frame: frame - 90, fps, config: WALA_SPRINGS.bouncy });

  // Floating cash animation
  const floatY1 = Math.sin(frame * 0.08) * 12;
  const floatY2 = Math.cos(frame * 0.07) * 10;

  // Zoom camera on cash register
  const imgScale = interpolate(frame, [0, 1500], [1.0, 1.08], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Background layout="FULL_MOTION" />

      {/* TopBadge en Y: 140 */}
      <TopBadge text="WALA • EL DETALLE CLAVE" />

      {/* ==================================================================== */}
      {/* TERCIO SUPERIOR (Y: 230 – 600 px): Titular Editorial Denso */}
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
            color: "#DC2626",
            textTransform: "uppercase",
          }}
        >
          [ 03 / 05 · METÁFORA DE CONTROL FINANCIERO ]
        </div>

        <h1
          style={{
            fontFamily: WALA_FONTS.display,
            fontSize: 58,
            fontWeight: 900,
            lineHeight: 1.1,
            textAlign: "center",
            color: WALA_COLORS.inkPrimary,
            letterSpacing: "-0.02em",
            margin: "20px 0 0 0",
            maxWidth: 980,
            transform: `translateY(${interpolate(titleSpring, [0, 1], [30, 0])}px)`,
            opacity: titleSpring,
          }}
        >
          NO CONTAR STOCK ES COMO DEJAR LA{" "}
          <span
            style={{
              color: "#FFFFFF",
              backgroundColor: "#DC2626",
              padding: "4px 18px",
              borderRadius: 14,
            }}
          >
            CAJA ABIERTA
          </span>
        </h1>
      </div>

      {/* ==================================================================== */}
      {/* TERCIO MEDIO (Y: 640 – 1280 px): Ilustración 9:16 + Iconos de Dinero */}
      {/* ==================================================================== */}
      <div
        style={{
          position: "absolute",
          top: 560,
          left: 50,
          right: 50,
          height: 720,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 20,
        }}
      >
        <div
          style={{
            width: 470,
            height: 690,
            borderRadius: 28,
            overflow: "hidden",
            boxShadow: "0 26px 54px -12px rgba(0, 0, 0, 0.25), 0 0 0 2px rgba(0, 0, 0, 0.08)",
            position: "relative",
            backgroundColor: "#FFFFFF",
            transform: `scale(${interpolate(imgSpring, [0, 1], [0.85, 1])})`,
            opacity: imgSpring,
          }}
        >
          <Img
            src={staticFile("bodega_caja_abierta.jpg")}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: `scale(${imgScale})`,
            }}
          />
        </div>

        {/* Icono Flotante 1: Billete de Dinero */}
        <div
          style={{
            position: "absolute",
            left: 70,
            top: 140,
            transform: `translateY(${floatY1}px) scale(${interpolate(note1Spring, [0, 1], [0, 1])}) rotate(-12deg)`,
            opacity: note1Spring,
            backgroundColor: "#FFFFFF",
            padding: 14,
            borderRadius: 20,
            boxShadow: "0 12px 28px rgba(0,0,0,0.14)",
            border: `2px solid ${WALA_COLORS.brandOrangeBorder}`,
          }}
        >
          <BanknoteIcon size={76} accentColor={WALA_COLORS.brandOrange} strokeWidth={3.8} />
        </div>

        {/* Icono Flotante 2: Mano con Efectivo */}
        <div
          style={{
            position: "absolute",
            right: 70,
            bottom: 120,
            transform: `translateY(${floatY2}px) scale(${interpolate(note2Spring, [0, 1], [0, 1])}) rotate(10deg)`,
            opacity: note2Spring,
            backgroundColor: "#FFFFFF",
            padding: 14,
            borderRadius: 20,
            boxShadow: "0 12px 28px rgba(0,0,0,0.14)",
            border: `2px solid ${WALA_COLORS.brandOrangeBorder}`,
          }}
        >
          <HandCashIcon size={76} accentColor={WALA_COLORS.brandOrange} strokeWidth={3.8} />
        </div>
      </div>

      {/* ==================================================================== */}
      {/* TERCIO INFERIOR (Y: 1280 – 1920 px): Alerta de Pérdida de Control & Captions */}
      {/* ==================================================================== */}
      <div
        style={{
          position: "absolute",
          top: 1310,
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
            width: "100%",
            maxWidth: 900,
            backgroundColor: "#FFFFFF",
            borderRadius: 22,
            border: "2.5px solid #FCA5A5",
            boxShadow: "0 18px 40px -10px rgba(220, 38, 38, 0.18)",
            padding: "24px 32px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            transform: `scale(${interpolate(alertCardSpring, [0, 1], [0.88, 1])})`,
            opacity: alertCardSpring,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <ShoppingCartIcon size={56} accentColor={WALA_COLORS.brandOrange} />
            <div>
              <div style={{ fontFamily: WALA_FONTS.display, fontSize: 26, fontWeight: 900, color: WALA_COLORS.inkPrimary }}>
                TUS 5 PRODUCTOS MÁS VENDIDOS
              </div>
              <div style={{ fontFamily: WALA_FONTS.mono, fontSize: 16, color: "#DC2626", fontWeight: 700, marginTop: 4 }}>
                REPRESENTAN HASTA EL 80% DE TUS VENTAS DIARIAS
              </div>
            </div>
          </div>
          <div
            style={{
              backgroundColor: "#DC2626",
              color: "#FFFFFF",
              fontFamily: WALA_FONTS.mono,
              fontSize: 16,
              fontWeight: 900,
              padding: "12px 20px",
              borderRadius: 14,
              letterSpacing: "0.05em",
            }}
          >
            NO ADIVINES
          </div>
        </div>
      </div>

      <KineticCaptions chunks={CAPTIONS_SCENE_3} bottomPosition={90} />
    </AbsoluteFill>
  );
};
