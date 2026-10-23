import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "../components/Background";
import { TopBadge } from "../components/TopBadge";
import { WalaCardProduct } from "../components/WalaCardProduct";

export const FerreteriaScene2Case: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 1 (frames 0 - 450): El caos de buscar al fondo
  const chaosSpring = spring({ frame: frame - 15, fps, config: { damping: 12, stiffness: 110 } });

  // Phase 2 (frames 450+): El ferretero con claridad en 5 segundos
  const claritySpring = spring({ frame: frame - 430, fps, config: { damping: 11, stiffness: 120 } });

  // Final conclusion banner (frame 720+)
  const bannerSpring = spring({ frame: frame - 700, fps, config: { damping: 10, stiffness: 130 } });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#FDFBF7",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      <Background layout="FULL_MOTION" />
      <TopBadge text="CASO REAL • VALIDACIÓN EMOCIONAL" />

      {/* PHASE 1: El Ferretero que busca al fondo (Visible de frame 0 a 440) */}
      {frame < 445 && (
        <div
          style={{
            position: "absolute",
            top: 280,
            left: 50,
            right: 50,
            display: "flex",
            flexDirection: "column",
            gap: 28,
            opacity: interpolate(frame, [410, 440], [1, 0]),
            transform: `translateY(${interpolate(chaosSpring, [0, 1], [60, 0])}px)`,
          }}
        >
          {/* Customer Quote */}
          <div
            style={{
              background: "#F8FAFC",
              border: "1.5px solid #E2E8F0",
              borderRadius: 22,
              padding: "20px 24px",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <span style={{ fontSize: 32 }}>💬</span>
            <span style={{ fontSize: 24, fontWeight: 700, color: "#334155" }}>
              Cliente: "¿Tienes un tornillo o una broca?"
            </span>
          </div>

          {/* Response Bubble: Duda y búsqueda */}
          <div
            style={{
              background: "#FFF1F2",
              border: "2px solid #FDA4AF",
              borderRadius: 26,
              padding: "32px 36px",
              display: "flex",
              flexDirection: "column",
              gap: 16,
              boxShadow: "0 14px 30px rgba(244, 63, 94, 0.12)",
            }}
          >
            <div style={{ color: "#E11D48", fontSize: 20, fontWeight: 800, textTransform: "uppercase" }}>
              ❌ Respuesta del Ferretero por memoria:
            </div>
            <div
              style={{
                color: "#9F1239",
                fontSize: 38,
                fontWeight: 900,
                lineHeight: 1.3,
                fontStyle: "italic",
              }}
            >
              "Creo que me queda uno por ahí... déjame ver si lo tengo en el fondo."
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                color: "#BE123C",
                fontSize: 20,
                fontWeight: 700,
                padding: "8px 16px",
                borderRadius: 12,
                background: "#FFE4E6",
                width: "fit-content",
              }}
            >
              <span>⏳ 10 minutos perdidos buscando en cajas</span>
            </div>
          </div>

          <WalaCardProduct
            description="Tornillo Drywall 1 1/4 (Caja x 100)"
            price={18.5}
            stock="Stock desconocido"
            isDoubtful={true}
            delayFrame={60}
          />
        </div>
      )}

      {/* PHASE 2: El ferretero con WALA que responde en 5 segundos (Visible de frame 440 en adelante) */}
      {frame >= 440 && (
        <div
          style={{
            position: "absolute",
            top: 280,
            left: 50,
            right: 50,
            display: "flex",
            flexDirection: "column",
            gap: 28,
            transform: `translateY(${interpolate(claritySpring, [0, 1], [60, 0])}px)`,
            opacity: interpolate(claritySpring, [0, 1], [0, 1]),
          }}
        >
          {/* Header 5 Segundos */}
          <div
            style={{
              background: "#ECFDF5",
              border: "2px solid #6EE7B7",
              borderRadius: 26,
              padding: "26px 32px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              boxShadow: "0 10px 25px rgba(16, 185, 129, 0.15)",
            }}
          >
            <div>
              <div style={{ color: "#065F46", fontSize: 18, fontWeight: 800, textTransform: "uppercase" }}>
                ⚡ Respuesta en 5 segundos:
              </div>
              <div style={{ color: "#047857", fontSize: 36, fontWeight: 900, marginTop: 4 }}>
                "Sí, tengo 12 unidades y te llegan 20 mañana."
              </div>
            </div>
            <span style={{ fontSize: 44 }}>🎯</span>
          </div>

          {/* Card Confirmada */}
          <WalaCardProduct
            description="Broca para Concreto 1/2 Bosch"
            price={24.0}
            stock={12}
            unit="uni"
            arrivalNotice="20 llegan mañana"
            isDoubtful={false}
            delayFrame={450}
          />

          {/* Punchline final: NO ES MAGIA, ES CLARIDAD */}
          <div
            style={{
              transform: `scale(${interpolate(bannerSpring, [0, 1], [0.85, 1])})`,
              opacity: interpolate(bannerSpring, [0, 1], [0, 1]),
              background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
              borderRadius: 24,
              padding: "36px 40px",
              textAlign: "center",
              color: "#FFFFFF",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.25)",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div style={{ color: "#94A3B8", fontSize: 24, fontWeight: 600 }}>
              Esa pequeña diferencia no es por magia.
            </div>
            <div
              style={{
                color: "#10B981",
                fontSize: 54,
                fontWeight: 900,
                letterSpacing: "0.02em",
                textTransform: "uppercase",
              }}
            >
              ES POR UNA COSA: CLARIDAD.
            </div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
