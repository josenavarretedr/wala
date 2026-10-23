import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export interface WalaCardProductProps {
  description: string;
  price: number;
  stock: number | string;
  unit?: string;
  productType?: "MERCH" | "PRODUCT" | "RAW_MATERIAL";
  arrivalNotice?: string;
  isDoubtful?: boolean; // For the "ferretero que adivina"
  delayFrame?: number;
  saleDeductionFrame?: number; // Frame where -1 is subtracted
}

export const WalaCardProduct: React.FC<WalaCardProductProps> = ({
  description,
  price,
  stock,
  unit = "uni",
  productType = "MERCH",
  arrivalNotice,
  isDoubtful = false,
  delayFrame = 0,
  saleDeductionFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - delayFrame,
    fps,
    config: {
      damping: 12,
      stiffness: 110,
      mass: 0.85,
    },
  });

  const translateY = interpolate(entrance, [0, 1], [40, 0]);
  const scale = interpolate(entrance, [0, 1], [0.93, 1]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]);

  // If sale deduction frame is passed, animate stock subtraction
  const isSold = saleDeductionFrame ? frame >= saleDeductionFrame : false;
  const currentStock =
    typeof stock === "number" && isSold ? stock - 1 : stock;

  const salePillSpring = saleDeductionFrame
    ? spring({
        frame: frame - saleDeductionFrame,
        fps,
        config: { damping: 10, stiffness: 140 },
      })
    : 0;

  return (
    <div
      style={{
        transform: `translateY(${translateY}px) scale(${scale})`,
        opacity,
        background: isDoubtful ? "#FFF1F2" : "#FFFFFF",
        borderRadius: 22,
        border: `2px solid ${isDoubtful ? "#FECDD3" : "#E2E8F0"}`,
        padding: "24px 28px",
        boxShadow: isDoubtful
          ? "0 10px 25px -5px rgba(239, 68, 68, 0.08)"
          : "0 14px 30px -5px rgba(0, 0, 0, 0.06), 0 4px 10px -2px rgba(0, 0, 0, 0.03)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        width: "100%",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        position: "relative",
      }}
    >
      {/* Header: Description, Price and Arrow */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
          {/* Tag icon (from CardProduct.vue) */}
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: isDoubtful ? "#FFE4E6" : "#EFF6FF",
              color: isDoubtful ? "#E11D48" : "#2563EB",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.2"
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
          </div>

          <h3
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: isDoubtful ? "#9F1239" : "#0F172A",
              lineHeight: 1.25,
              margin: 0,
            }}
          >
            {description}
          </h3>
        </div>

        {/* Price & Arrow */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <span
            style={{
              fontSize: 30,
              fontWeight: 900,
              color: isDoubtful ? "#E11D48" : "#16A34A",
              letterSpacing: "-0.02em",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            S/ {price.toFixed(2)}
          </span>

          <svg
            width="22"
            height="22"
            fill="none"
            stroke={isDoubtful ? "#FDA4AF" : "#94A3B8"}
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Badges Bar (from CardProduct.vue) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        {/* Badge: Tipo de Producto */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 12px",
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 700,
            background: isDoubtful ? "#FFE4E6" : "#ECFDF5",
            color: isDoubtful ? "#9F1239" : "#047857",
            border: `1.5px solid ${isDoubtful ? "#FDA4AF" : "#A7F3D0"}`,
          }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.2"
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          <span>{productType === "MERCH" ? "Mercadería" : "Producto"}</span>
        </div>

        {/* Badge: Stock con cubo (cube) */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 14px",
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 800,
            background: isDoubtful ? "#FEE2E2" : "#EFF6FF",
            color: isDoubtful ? "#B91C1C" : "#1D4ED8",
            border: `1.5px solid ${isDoubtful ? "#F87171" : "#BFDBFE"}`,
          }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.2"
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <span>
            {isDoubtful ? `¿${currentStock}?` : `${currentStock} ${unit}`}
          </span>
        </div>

        {/* Optional arrival notice (+20 llegan mañana) */}
        {arrivalNotice && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 12px",
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 700,
              background: "#F5F3FF",
              color: "#6D28D9",
              border: "1.5px solid #DDD6FE",
            }}
          >
            <span>🚚 {arrivalNotice}</span>
          </div>
        )}

        {/* Status indicator: Confirmado vs En Duda */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 12px",
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 700,
            background: isDoubtful ? "#FEF2F2" : "#F0FDF4",
            color: isDoubtful ? "#DC2626" : "#15803D",
            border: `1.5px solid ${isDoubtful ? "#FECDD3" : "#BBF7D0"}`,
          }}
        >
          <span>{isDoubtful ? "⚠️ Stock por memoria" : "✓ 100% Claridad"}</span>
        </div>
      </div>

      {/* Sale deduction alert popover */}
      {saleDeductionFrame && frame >= saleDeductionFrame && (
        <div
          style={{
            position: "absolute",
            top: -14,
            right: 28,
            transform: `scale(${interpolate(salePillSpring, [0, 1], [0.6, 1])})`,
            opacity: interpolate(salePillSpring, [0, 1], [0, 1]),
            background: "#DC2626",
            color: "#FFFFFF",
            padding: "4px 14px",
            borderRadius: 9999,
            fontSize: 15,
            fontWeight: 800,
            boxShadow: "0 6px 16px rgba(220, 38, 38, 0.4)",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span>-1 Venta Registrada</span>
        </div>
      )}
    </div>
  );
};
