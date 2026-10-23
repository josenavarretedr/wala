import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { WalaCardStandard } from "./WalaCardStandard";

interface WalaHistorialFeedProps {
  initialBalance: number;
  withdrawalAmount: number;
  currency?: string;
  isTalkingHead?: boolean;
}

export const WalaHistorialFeed: React.FC<WalaHistorialFeedProps> = ({
  initialBalance,
  withdrawalAmount,
  currency = "S/",
  isTalkingHead = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Feed container entrance spring
  const containerSpring = spring({
    frame: frame - 60,
    fps,
    config: {
      damping: 13,
      stiffness: 100,
    },
  });

  // Saldo animation: drops from initial to (initial - withdrawal) between frame 130 and 190
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

  // Floating breathing effect once cards settle
  const floatOffset = Math.sin((frame - 100) / 22) * 6;

  const containerTranslateY =
    interpolate(containerSpring, [0, 1], [120, 0]) +
    (frame > 100 ? floatOffset : 0);
  const containerOpacity = interpolate(containerSpring, [0, 1], [0, 1]);

  // Alert pill entrance spring at frame 170
  const alertSpring = spring({
    frame: frame - 175,
    fps,
    config: { damping: 11, stiffness: 120 },
  });

  const topPosition = isTalkingHead ? 540 : 700;

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
        transform: `translateY(${containerTranslateY}px)`,
        opacity: containerOpacity,
        zIndex: 30,
        padding: "0 50px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 960,
          background: "rgba(255, 255, 255, 0.88)",
          backdropFilter: "blur(20px)",
          borderRadius: 36,
          border: "2px solid rgba(226, 232, 240, 0.95)",
          boxShadow:
            "0 30px 70px -10px rgba(0, 0, 0, 0.12), 0 15px 30px -10px rgba(0, 0, 0, 0.06)",
          padding: "36px 40px",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        {/* Balance Header Banner */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingBottom: 20,
            borderBottom: "1.5px solid #F1F5F9",
          }}
        >
          <div>
            <div
              style={{
                color: "#64748B",
                fontSize: 20,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Caja Chica • Salón de Belleza
            </div>
            <div
              style={{
                color: currentBalance <= finalBalance ? "#DC2626" : "#047857",
                fontSize: 54,
                fontWeight: 900,
                letterSpacing: "-0.03em",
                fontVariantNumeric: "tabular-nums",
                marginTop: 4,
              }}
            >
              {currency} {currentBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div
            style={{
              padding: "10px 22px",
              borderRadius: 9999,
              background: frame > 160 ? "#FEE2E2" : "#ECFDF5",
              border: `1.5px solid ${frame > 160 ? "#F87171" : "#6EE7B7"}`,
              color: frame > 160 ? "#991B1B" : "#065F46",
              fontSize: 18,
              fontWeight: 800,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            {frame > 160 ? "⚠️ FUGA DETECTADA" : "✓ CAJA ACTIVA"}
          </div>
        </div>

        {/* Card 1: Cobro / Venta Normal (Entra en frame 70) */}
        <WalaCardStandard
          type="payment_in"
          title="Cobro • Tratamiento Capilar"
          subtitle="Venta #1042"
          amount={initialBalance}
          currency={currency}
          accountType="cash"
          statusBadge="Saldado"
          dateText="Hoy, 02:15 pm"
          delayFrame={70}
        />

        {/* Card 2: Retiro Personal (Entra en frame 125 con rebote de impacto) */}
        <WalaCardStandard
          type="payment_out"
          title="Retiro Personal • Supermercado"
          subtitle="Retiro sin registrar"
          amount={withdrawalAmount}
          currency={currency}
          accountType="cash"
          statusBadge="No Registrado"
          dateText="Hoy, 04:30 pm"
          delayFrame={125}
        />

        {/* Alert Footer Note */}
        <div
          style={{
            transform: `scale(${interpolate(alertSpring, [0, 1], [0.85, 1])})`,
            opacity: interpolate(alertSpring, [0, 1], [0, 1]),
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "18px 24px",
            background: "#FFFBEB",
            borderRadius: 18,
            border: "1.5px solid #FCD34D",
          }}
        >
          <span style={{ fontSize: 28 }}>⚡</span>
          <span
            style={{
              color: "#92400E",
              fontSize: 21,
              fontWeight: 700,
              lineHeight: 1.35,
            }}
          >
            Retirar dinero para gastos personales sin registrar maquilla la rentabilidad real de tu salón.
          </span>
        </div>
      </div>
    </div>
  );
};
