import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export interface InventoryMetricItem {
  title: string;
  value: number;
  count: number;
  type: "raw" | "product" | "merch" | "service";
}

interface WalaMetricsInventoryProps {
  merchValue: number;
  merchCount: number;
  delayFrame?: number;
}

export const WalaMetricsInventory: React.FC<WalaMetricsInventoryProps> = ({
  merchValue,
  merchCount,
  delayFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - delayFrame,
    fps,
    config: {
      damping: 12,
      stiffness: 110,
    },
  });

  const translateY = interpolate(entrance, [0, 1], [30, 0]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]);

  // Animated value counting up
  const animatedValue = interpolate(
    frame - delayFrame,
    [10, 45],
    [0, merchValue],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  return (
    <div
      style={{
        transform: `translateY(${translateY}px)`,
        opacity,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      {/* Metrics Section Header (from MetricsInventory.vue) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          color: "#475569",
          fontSize: 18,
          fontWeight: 800,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        <svg
          width="22"
          height="22"
          fill="none"
          stroke="#2563EB"
          strokeWidth="2.2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <span>Valorización de Inventario • WALA</span>
      </div>

      {/* Grid of Metric Cards (replica of MetricsInventory.vue) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
        }}
      >
        {/* Card: Mercaderías en Stock */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 20,
            border: "1.5px solid #E2E8F0",
            borderLeft: "6px solid #10B981",
            padding: "20px 22px",
            boxShadow:
              "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.02)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: 14,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#64748B",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Mercaderías
              </span>
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 900,
                  color: "#0F172A",
                  marginTop: 4,
                  letterSpacing: "-0.02em",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                S/ {animatedValue.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            {/* Shopping bag icon */}
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "#ECFDF5",
                border: "1px solid #A7F3D0",
                color: "#059669",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.2"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
          </div>

          <div
            style={{
              borderTop: "1px solid #F1F5F9",
              paddingTop: 10,
              display: "flex",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#047857",
                background: "#ECFDF5",
                padding: "3px 10px",
                borderRadius: 8,
                border: "1px solid #A7F3D0",
              }}
            >
              {merchCount} productos activos
            </span>
          </div>
        </div>

        {/* Card: Rotación y Control de Stock */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 20,
            border: "1.5px solid #E2E8F0",
            borderLeft: "6px solid #3B82F6",
            padding: "20px 22px",
            boxShadow:
              "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.02)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: 14,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#64748B",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Control de Stock
              </span>
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 900,
                  color: "#1E3A8A",
                  marginTop: 4,
                  letterSpacing: "-0.02em",
                }}
              >
                100% Precisión
              </div>
            </div>

            {/* Check/Target icon */}
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "#EFF6FF",
                border: "1px solid #BFDBFE",
                color: "#2563EB",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          <div
            style={{
              borderTop: "1px solid #F1F5F9",
              paddingTop: 10,
              display: "flex",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#1D4ED8",
                background: "#EFF6FF",
                padding: "3px 10px",
                borderRadius: 8,
                border: "1px solid #BFDBFE",
              }}
            >
              Cero ventas perdidas
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
