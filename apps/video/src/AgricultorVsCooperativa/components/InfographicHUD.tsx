import React from "react";
import { interpolate, spring, useVideoConfig } from "remotion";
import { ComputedBeat } from "../types";

interface InfographicHUDProps {
  currentBeat: ComputedBeat;
  frameInBeat: number;
  totalBeats: number;
}

export const InfographicHUD: React.FC<InfographicHUDProps> = ({
  currentBeat,
  frameInBeat,
}) => {
  const { fps } = useVideoConfig();

  // Animación de entrada de la tarjeta inferior (slide-up con resorte snappy)
  const cardSpring = spring({
    frame: frameInBeat,
    fps,
    config: { damping: 15, stiffness: 110, mass: 0.8 },
  });

  const cardTranslateY = interpolate(cardSpring, [0, 1], [40, 0]);
  const cardOpacity = interpolate(cardSpring, [0, 1], [0, 1]);

  // Color representativo del lado activo
  const sideColor =
    currentBeat.side === "cooperativa"
      ? "#10B981"
      : currentBeat.side === "agricultor"
      ? "#FF5C00"
      : "#3B82F6";

  const sideIcon =
    currentBeat.side === "cooperativa"
      ? "🏢"
      : currentBeat.side === "agricultor"
      ? "👨‍🌾"
      : "⚖️";

  // Mapeo de progreso de los 4 cuadrantes principales (1: Ventas, 2: Pagos, 3: Compras, 4: Riesgos)
  const categories = ["ventas", "pagos", "compras", "riesgos"];
  const currentCategoryIndex = categories.indexOf(currentBeat.category);

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 20,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "60px 44px 100px 44px",
      }}
    >
      {/* ============================================================== */}
      {/* 1. TOP BAR HUD: Stepper, Categoría y Badge de Entidad         */}
      {/* ============================================================== */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {/* Píldora superior con acento */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Badge del Cuadrante / Capítulo */}
          <div
            style={{
              backgroundColor: "rgba(24, 24, 27, 0.92)",
              backdropFilter: "blur(12px)",
              color: "#FFFFFF",
              fontFamily: "'JetBrains Mono', 'Space Mono', monospace",
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.08em",
              padding: "7px 18px",
              borderRadius: 999,
              border: "1px solid rgba(255, 255, 255, 0.15)",
              boxShadow: "0 8px 20px rgba(0, 0, 0, 0.25)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: sideColor,
                boxShadow: `0 0 8px ${sideColor}`,
              }}
            />
            {currentBeat.hud.badge}
          </div>

          {/* Badge del Lado Activo (Agricultor vs Cooperativa) */}
          {currentBeat.hud.sideLabel && (
            <div
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.92)",
                backdropFilter: "blur(8px)",
                border: `1.5px solid ${sideColor}`,
                color: "#18181B",
                fontFamily: "'JetBrains Mono', 'Space Mono', monospace",
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: "0.05em",
                padding: "6px 14px",
                borderRadius: 999,
                display: "flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
              }}
            >
              <span>{sideIcon}</span>
              <span>{currentBeat.hud.sideLabel}</span>
            </div>
          )}
        </div>

        {/* 4 Segmentos de Progreso Visual */}
        <div
          style={{
            display: "flex",
            gap: 6,
            width: "100%",
            height: 4,
            marginTop: 4,
          }}
        >
          {categories.map((cat, idx) => {
            const isCompleted = currentCategoryIndex > idx;
            const isCurrent = currentCategoryIndex === idx;
            return (
              <div
                key={cat}
                style={{
                  flex: 1,
                  height: "100%",
                  borderRadius: 2,
                  backgroundColor: isCompleted
                    ? "#18181B"
                    : isCurrent
                    ? sideColor
                    : "rgba(0, 0, 0, 0.15)",
                }}
              />
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. BOTTOM CARD: Resumen Clave y Takeaway Editorial             */}
      {/* ============================================================== */}
      <div
        style={{
          transform: `translateY(${cardTranslateY}px)`,
          opacity: cardOpacity,
          backgroundColor: "#FFFFFF",
          borderRadius: 24,
          padding: "26px 30px",
          border: "2px solid #18181B",
          boxShadow:
            "0 20px 40px -10px rgba(0, 0, 0, 0.22), 0 8px 16px -4px rgba(0, 0, 0, 0.10)",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          marginBottom: 40,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontSize: 24,
              fontWeight: 800,
              color: "#18181B",
              letterSpacing: "-0.02em",
            }}
          >
            {currentBeat.hud.headline}
          </div>

          <div
            style={{
              fontSize: 12,
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 700,
              color: sideColor,
              backgroundColor: `${sideColor}15`,
              padding: "4px 10px",
              borderRadius: 6,
            }}
          >
            {Math.round(currentBeat.durationInSeconds)}s
          </div>
        </div>

        <div
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize: 17,
            lineHeight: 1.45,
            color: "#4B5563",
            fontWeight: 500,
          }}
        >
          {currentBeat.hud.takeaway}
        </div>
      </div>
    </div>
  );
};
