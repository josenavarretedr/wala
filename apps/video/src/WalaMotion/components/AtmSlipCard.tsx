import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

interface AtmSlipCardProps {
  businessType: string;
  initialBalance: number;
  withdrawalAmount: number;
  withdrawalConcept: string;
  alertMessage: string;
  isTalkingHead?: boolean;
}

export const AtmSlipCard: React.FC<AtmSlipCardProps> = ({
  businessType,
  initialBalance,
  withdrawalAmount,
  withdrawalConcept,
  alertMessage,
  isTalkingHead = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring starts at frame 85 (approx 1.4s)
  const cardSpring = spring({
    frame: frame - 85,
    fps,
    config: {
      damping: 12,
      stiffness: 100,
      mass: 0.9,
    },
  });

  // Ticket withdrawal slide out starts at frame 130
  const ticketSpring = spring({
    frame: frame - 130,
    fps,
    config: {
      damping: 13,
      stiffness: 90,
    },
  });

  // Animated counter: initialBalance dropping to (initialBalance - withdrawalAmount)
  const finalBalance = initialBalance - withdrawalAmount;
  const currentBalance = Math.round(
    interpolate(
      frame,
      [140, 200],
      [initialBalance, finalBalance],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }
    )
  );

  // Subtle floating breathing effect once card is settled
  const floatOffset = Math.sin((frame - 100) / 20) * 8;

  const cardTranslateY = interpolate(cardSpring, [0, 1], [150, 0]) + (frame > 110 ? floatOffset : 0);
  const cardScale = interpolate(cardSpring, [0, 1], [0.85, 1]);
  const cardOpacity = interpolate(cardSpring, [0, 1], [0, 1]);

  const ticketTranslateY = interpolate(ticketSpring, [0, 1], [-40, 0]);
  const ticketOpacity = interpolate(ticketSpring, [0, 1], [0, 1]);

  const topPosition = isTalkingHead ? 580 : 780;

  return (
    <div
      style={{
        position: "absolute",
        top: topPosition,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        transform: `translateY(${cardTranslateY}px) scale(${cardScale})`,
        opacity: cardOpacity,
        zIndex: 30,
      }}
    >
      <div
        style={{
          width: 920,
          background: "linear-gradient(160deg, rgba(21, 28, 44, 0.95) 0%, rgba(13, 17, 28, 0.98) 100%)",
          borderRadius: 36,
          border: "2px solid rgba(255, 255, 255, 0.12)",
          padding: "44px 48px",
          boxShadow:
            "0 30px 80px rgba(0, 0, 0, 0.8), 0 0 50px rgba(239, 68, 68, 0.18)",
          backdropFilter: "blur(24px)",
          display: "flex",
          flexDirection: "column",
          gap: 32,
        }}
      >
        {/* Card Header: ATM icon + Business + Alert Badge */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            paddingBottom: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* ATM icon SVG */}
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: 16,
                background: "rgba(239, 68, 68, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#EF4444"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <line x1="6" y1="8" x2="6" y2="8" />
                <line x1="10" y1="8" x2="10" y2="8" />
                <line x1="14" y1="8" x2="14" y2="8" />
                <line x1="18" y1="8" x2="18" y2="8" />
                <rect x="6" y="12" width="12" height="4" rx="1" />
              </svg>
            </div>
            <div>
              <div
                style={{
                  color: "#FFFFFF",
                  fontSize: 28,
                  fontWeight: 800,
                  letterSpacing: "-0.01em",
                }}
              >
                Caja Chica del Negocio
              </div>
              <div
                style={{
                  color: "#94A3B8",
                  fontSize: 20,
                  fontWeight: 500,
                }}
              >
                {businessType}
              </div>
            </div>
          </div>

          {/* Pulsing Warning Badge */}
          <div
            style={{
              padding: "8px 20px",
              borderRadius: 9999,
              background: "rgba(239, 68, 68, 0.18)",
              border: "1.5px solid #EF4444",
              color: "#F87171",
              fontSize: 18,
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              boxShadow: "0 0 16px rgba(239, 68, 68, 0.3)",
            }}
          >
            ⚠️ FUGA DE CAPITAL
          </div>
        </div>

        {/* Balance Display */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            background: "rgba(10, 14, 24, 0.6)",
            padding: "26px 32px",
            borderRadius: 24,
            border: "1px solid rgba(255, 255, 255, 0.05)",
          }}
        >
          <div>
            <div
              style={{
                color: "#64748B",
                fontSize: 20,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: 6,
              }}
            >
              Saldo Restante en Caja
            </div>
            <div
              style={{
                color: currentBalance <= finalBalance ? "#F87171" : "#10B981",
                fontSize: 60,
                fontWeight: 900,
                letterSpacing: "-0.03em",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              ${currentBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div
              style={{
                color: "#64748B",
                fontSize: 18,
                fontWeight: 500,
              }}
            >
              Saldo Inicial
            </div>
            <div
              style={{
                color: "#94A3B8",
                fontSize: 26,
                fontWeight: 700,
                textDecoration: frame > 160 ? "line-through" : "none",
              }}
            >
              ${initialBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Animated Withdrawal Ticket */}
        <div
          style={{
            transform: `translateY(${ticketTranslateY}px)`,
            opacity: ticketOpacity,
            background: "linear-gradient(135deg, rgba(239, 68, 68, 0.16) 0%, rgba(185, 28, 28, 0.22) 100%)",
            border: "1.5px dashed rgba(239, 68, 68, 0.6)",
            borderRadius: 22,
            padding: "24px 30px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                color: "#FCA5A5",
                fontSize: 22,
                fontWeight: 700,
              }}
            >
              <span>🔻 Retiro Personal Directo</span>
            </div>
            <div
              style={{
                color: "#E2E8F0",
                fontSize: 20,
                fontWeight: 500,
              }}
            >
              {withdrawalConcept}
            </div>
          </div>

          <div
            style={{
              color: "#EF4444",
              fontSize: 48,
              fontWeight: 900,
              letterSpacing: "-0.02em",
              textShadow: "0 0 20px rgba(239, 68, 68, 0.4)",
            }}
          >
            -${withdrawalAmount.toFixed(2)}
          </div>
        </div>

        {/* Footer Warning Note */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "16px 20px",
            background: "rgba(255, 255, 255, 0.03)",
            borderRadius: 16,
            borderLeft: "4px solid #EF4444",
          }}
        >
          <span style={{ fontSize: 24 }}>⚡</span>
          <span
            style={{
              color: "#CBD5E1",
              fontSize: 20,
              fontWeight: 600,
              lineHeight: 1.3,
            }}
          >
            {alertMessage}
          </span>
        </div>
      </div>
    </div>
  );
};
