import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "../../components/Background";
import { TopBadge } from "../../components/TopBadge";
import { CaptionChunk, KineticCaptions } from "../../components/KineticCaptions";
import { WALA_COLORS, WALA_FONTS, WALA_SPRINGS } from "../../tokens";
import { DocumentPencilIcon } from "../../icons";

const CAPTIONS_SCENE_4: CaptionChunk[] = [
  {
    fromFrame: 0,
    toFrame: 180,
    text: "Empieza hoy. Elige tus 5 productos que más vendes.",
    highlightWords: ["Empieza", "hoy.", "5", "productos", "más", "vendes."],
  },
  {
    fromFrame: 180,
    toFrame: 380,
    text: "Cuenta cuántas unidades tienes ahora mismo y anótalo. Solo eso.",
    highlightWords: ["Cuenta", "unidades", "ahora", "anótalo.", "Solo", "eso."],
  },
  {
    fromFrame: 380,
    toFrame: 600,
    text: "Es el primer paso para dejar de adivinar y empezar a tener tranquilidad.",
    highlightWords: ["primer", "paso", "dejar", "adivinar", "tranquilidad."],
  },
];

const CHECKLIST_ITEMS = [
  { name: "1. ARROZ EXTRA 5KG", qty: "15 UDS", delay: 80 },
  { name: "2. ACEITE VEGETAL 1L", qty: "8 UDS", delay: 140 },
  { name: "3. LECHE EVAPORADA", qty: "24 UDS", delay: 200 },
  { name: "4. AZÚCAR RUBIA", qty: "18 UDS", delay: 260 },
  { name: "5. FIDEOS ESPAGUETI", qty: "30 UDS", delay: 320 },
];

export const BodegaScene4Accion: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame: frame - 8, fps, config: WALA_SPRINGS.snappy });
  const imgSpring = spring({ frame: frame - 20, fps, config: WALA_SPRINGS.snappy });

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Background layout="FULL_MOTION" />

      {/* TopBadge en Y: 140 */}
      <TopBadge text="WALA • PASO A PASO" />

      {/* ==================================================================== */}
      {/* TERCIO SUPERIOR (Y: 230 – 540 px): Titular de Micro-Acción Inmediata */}
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
          [ 04 / 05 · MICRO-ACCIÓN DE HOY ]
        </div>

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
            maxWidth: 960,
            transform: `translateY(${interpolate(titleSpring, [0, 1], [30, 0])}px)`,
            opacity: titleSpring,
          }}
        >
          ELIGE TUS{" "}
          <span
            style={{
              color: "#FFFFFF",
              backgroundColor: WALA_COLORS.brandOrange,
              padding: "4px 18px",
              borderRadius: 14,
            }}
          >
            5 PRODUCTOS
          </span>{" "}
          Y CUÉNTALOS AHORA
        </h1>
      </div>

      {/* ==================================================================== */}
      {/* TERCIO MEDIO (Y: 540 – 1180 px): Ilustración 9:16 de Conteo de Productos */}
      {/* ==================================================================== */}
      <div
        style={{
          position: "absolute",
          top: 530,
          left: 50,
          right: 50,
          height: 640,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 20,
        }}
      >
        <div
          style={{
            width: 440,
            height: 620,
            borderRadius: 26,
            overflow: "hidden",
            boxShadow: "0 22px 48px -10px rgba(0, 0, 0, 0.22), 0 0 0 2px rgba(0, 0, 0, 0.08)",
            position: "relative",
            backgroundColor: "#FFFFFF",
            transform: `scale(${interpolate(imgSpring, [0, 1], [0.88, 1])})`,
            opacity: imgSpring,
          }}
        >
          <Img
            src={staticFile("bodega_conteo_accion.jpg")}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />

          <div
            style={{
              position: "absolute",
              bottom: 16,
              left: 16,
              right: 16,
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(8px)",
              padding: "12px 18px",
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              gap: 12,
              border: `1.5px solid ${WALA_COLORS.brandOrangeBorder}`,
            }}
          >
            <DocumentPencilIcon size={36} accentColor={WALA_COLORS.brandOrange} />
            <span style={{ fontFamily: WALA_FONTS.mono, fontSize: 15, fontWeight: 800, color: WALA_COLORS.inkPrimary }}>
              SOLO 5 PRODUCTOS CLAVE
            </span>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* TERCIO INFERIOR (Y: 1180 – 1920 px): Checklist Interactivo Paso a Paso */}
      {/* ==================================================================== */}
      <div
        style={{
          position: "absolute",
          top: 1200,
          left: 60,
          right: 60,
          zIndex: 25,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          alignItems: "center",
        }}
      >
        {CHECKLIST_ITEMS.map((item) => {
          const itemSpring = spring({
            frame: frame - item.delay,
            fps,
            config: WALA_SPRINGS.bouncy,
          });

          return (
            <div
              key={item.name}
              style={{
                width: "100%",
                maxWidth: 820,
                backgroundColor: "#FFFFFF",
                borderRadius: 14,
                border: `1.5px solid ${WALA_COLORS.paperDividerStrong}`,
                boxShadow: WALA_COLORS.cardShadowSubtle,
                padding: "10px 22px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                transform: `translateX(${interpolate(itemSpring, [0, 1], [-40, 0])}px)`,
                opacity: itemSpring,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 7,
                    backgroundColor: WALA_COLORS.brandOrange,
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 15,
                    fontWeight: 900,
                  }}
                >
                  ✓
                </div>
                <span style={{ fontFamily: WALA_FONTS.mono, fontSize: 17, fontWeight: 800, color: WALA_COLORS.inkPrimary }}>
                  {item.name}
                </span>
              </div>

              <div
                style={{
                  backgroundColor: WALA_COLORS.brandOrangeLight,
                  color: WALA_COLORS.brandOrange,
                  fontFamily: WALA_FONTS.mono,
                  fontSize: 16,
                  fontWeight: 900,
                  padding: "4px 14px",
                  borderRadius: 10,
                }}
              >
                {item.qty}
              </div>
            </div>
          );
        })}
      </div>

      <KineticCaptions chunks={CAPTIONS_SCENE_4} bottomPosition={90} />
    </AbsoluteFill>
  );
};
