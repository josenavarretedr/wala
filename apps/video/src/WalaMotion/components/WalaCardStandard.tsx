import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export interface WalaCardProps {
  type: "payment_in" | "payment_out" | "expense";
  title: string;
  subtitle: string;
  amount: number;
  currency?: string;
  accountType?: "cash" | "digital";
  statusBadge?: string;
  dateText?: string;
  delayFrame?: number;
}

export const WalaCardStandard: React.FC<WalaCardProps> = ({
  type,
  title,
  subtitle,
  amount,
  currency = "S/",
  accountType = "cash",
  statusBadge,
  dateText = "Hoy, 04:30 pm",
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
      mass: 0.85,
    },
  });

  const translateY = interpolate(entrance, [0, 1], [60, 0]);
  const scale = interpolate(entrance, [0, 1], [0.92, 1]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]);

  const isIncome = type === "payment_in";

  // Palette mapped strictly from CardStandard.vue:
  // Income: bg-emerald-50, border-emerald-200, text-emerald-700
  // Expense/Payout: bg-rose-50, border-rose-200, text-rose-700
  const bg = isIncome ? "#ECFDF5" : "#FFF1F2";
  const border = isIncome ? "#A7F3D0" : "#FECDD3";
  const badgeBg = isIncome ? "#D1FAE5" : "#FFE4E6";
  const badgeBorder = isIncome ? "#6EE7B7" : "#FDA4AF";
  const badgeText = isIncome ? "#065F46" : "#9F1239";
  const amountColor = isIncome ? "#047857" : "#BE123C";
  const titleColor = isIncome ? "#047857" : "#BE123C";
  const subColor = isIncome ? "#059669" : "#E11D48";
  const borderTopDate = isIncome ? "#A7F3D0" : "#FECDD3";
  const dateColor = isIncome ? "#059669" : "#E11D48";

  return (
    <div
      style={{
        transform: `translateY(${translateY}px) scale(${scale})`,
        opacity,
        background: bg,
        borderRadius: 24,
        border: `2px solid ${border}`,
        padding: "28px 32px",
        boxShadow:
          "0 18px 35px -5px rgba(0, 0, 0, 0.08), 0 8px 15px -6px rgba(0, 0, 0, 0.04)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        width: "100%",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      {/* Header: Badges & Amount */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        {/* Left Badges */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Badge Tipo: Cobro o Retiro */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 14px",
              borderRadius: 10,
              fontSize: 18,
              fontWeight: 700,
              background: badgeBg,
              color: badgeText,
              border: `1.5px solid ${badgeBorder}`,
            }}
          >
            {isIncome ? (
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.4"
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            ) : (
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.4"
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            )}
            <span>{isIncome ? "Cobro" : "Retiro / Salida"}</span>
          </div>

          {/* Badge Método de Pago: Efectivo */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 14px",
              borderRadius: 10,
              fontSize: 18,
              fontWeight: 700,
              background: "#DCFCE7",
              color: "#15803D",
              border: "1.5px solid #BBF7D0",
            }}
          >
            {/* Coins icon */}
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="9" cy="9" r="6" strokeWidth="2.2" />
              <path strokeWidth="2.2" d="M15 9a6 6 0 11-6 6" />
            </svg>
            <span>{accountType === "cash" ? "Efectivo" : "Digital"}</span>
          </div>
        </div>

        {/* Right: Amount */}
        <div
          style={{
            fontSize: 38,
            fontWeight: 900,
            color: amountColor,
            letterSpacing: "-0.02em",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {isIncome ? "+" : "-"}{currency} {amount.toFixed(2)}
        </div>
      </div>

      {/* Main Content: Title, Reference & Status */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 22,
            fontWeight: 700,
            color: titleColor,
          }}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {title}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 18,
            color: subColor,
            fontWeight: 500,
          }}
        >
          <span>{subtitle}</span>
          {statusBadge && (
            <span
              style={{
                color: isIncome ? "#047857" : "#EA580C",
                fontWeight: 700,
              }}
            >
              • {statusBadge}
            </span>
          )}
        </div>
      </div>

      {/* Footer: Date with clock icon */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontSize: 17,
          color: dateColor,
          paddingTop: 12,
          borderTop: `1.5px solid ${borderTopDate}`,
          fontWeight: 500,
        }}
      >
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.2"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>{dateText}</span>
      </div>
    </div>
  );
};
