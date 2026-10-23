import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "../components/Background";
import { TopBadge } from "../components/TopBadge";
import { WalaMetricsInventory } from "../components/WalaMetricsInventory";
import { WalaCardProduct } from "../components/WalaCardProduct";

export const FerreteriaScene3Value: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const headerSpring = spring({ frame: frame - 10, fps, config: { damping: 12, stiffness: 120 } });

  // Phase transition: Frame 0-600 shows the Top 5 products setup.
  // Frame 600-1500 shows the golden rule warning and action step.
  const phase2Spring = spring({ frame: frame - 680, fps, config: { damping: 11, stiffness: 110 } });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#FDFBF7",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      <Background layout="FULL_MOTION" />
      <TopBadge text="VALOR DIRECTO • PLAN DE ACCIÓN" />

      {/* PHASE A (frames 0 to 700): Empieza simple con los 5 productos clave */}
      {frame < 720 && (
        <div
          style={{
            position: "absolute",
            top: 260,
            left: 50,
            right: 50,
            display: "flex",
            flexDirection: "column",
            gap: 22,
            opacity: interpolate(frame, [670, 710], [1, 0]),
            transform: `translateY(${interpolate(headerSpring, [0, 1], [40, 0])}px)`,
          }}
        >
          {/* Action Step Headline */}
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
            <span style={{ color: "#475569", fontSize: 28, fontWeight: 700 }}>
              No necesitas un sistema complejo para empezar:
            </span>
            <div
              style={{
                background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                color: "#FFFFFF",
                fontSize: 38,
                fontWeight: 900,
                padding: "10px 28px",
                borderRadius: 18,
                boxShadow: "0 10px 25px rgba(16, 185, 129, 0.3)",
              }}
            >
              ANOTA LOS 5 PRODUCTOS MÁS VENDIDOS
            </div>
          </div>

          {/* Metrics bar from MetricsInventory.vue */}
          <WalaMetricsInventory merchValue={8450} merchCount={5} delayFrame={30} />

          {/* Product cards showing stock tracking */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <WalaCardProduct
              description="Broca para Concreto 1/2 Bosch"
              price={24.0}
              stock={12}
              unit="uni"
              delayFrame={50}
              saleDeductionFrame={250} // At frame 250, a sale is registered (-1)
            />

            <WalaCardProduct
              description="Tornillo Drywall 1 1/4 (Caja x 100)"
              price={18.5}
              stock={45}
              unit="cajas"
              delayFrame={75}
            />

            <WalaCardProduct
              description="Disco de Corte Metal 4 1/2 DeWalt"
              price={6.5}
              stock={80}
              unit="uni"
              delayFrame={100}
            />
          </div>
        </div>
      )}

      {/* PHASE B (frames 710 to 1500): La metáfora de la puerta abierta y el consejo */}
      {frame >= 710 && (
        <div
          style={{
            position: "absolute",
            top: 290,
            left: 50,
            right: 50,
            display: "flex",
            flexDirection: "column",
            gap: 28,
            transform: `translateY(${interpolate(phase2Spring, [0, 1], [60, 0])}px)`,
            opacity: interpolate(phase2Spring, [0, 1], [0, 1]),
          }}
        >
          {/* Puerta Abierta Metaphor Card */}
          <div
            style={{
              background: "#FFF1F2",
              border: "2px solid #FDA4AF",
              borderRadius: 28,
              padding: "36px 40px",
              display: "flex",
              flexDirection: "column",
              gap: 16,
              boxShadow: "0 18px 40px rgba(244, 63, 94, 0.15)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 38 }}>🚪</span>
              <span style={{ color: "#E11D48", fontSize: 22, fontWeight: 800, textTransform: "uppercase" }}>
                La Metáfora Ferretera:
              </span>
            </div>
            <div
              style={{
                color: "#9F1239",
                fontSize: 38,
                fontWeight: 900,
                lineHeight: 1.3,
              }}
            >
              "Creer que sabes tu stock por memoria es como dejar la puerta de tu local abierta."
            </div>
            <div
              style={{
                color: "#BE123C",
                fontSize: 22,
                fontWeight: 600,
                lineHeight: 1.4,
                borderTop: "1.5px solid #FECDD3",
                paddingTop: 16,
              }}
            >
              Lo que no registras se pierde en ventas que no haces o en productos que quedan olvidados en alguna caja.
            </div>
          </div>

          {/* Action Callout */}
          <div
            style={{
              background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
              borderRadius: 28,
              padding: "38px 42px",
              textAlign: "center",
              color: "#FFFFFF",
              boxShadow: "0 22px 50px rgba(0, 0, 0, 0.25)",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <div style={{ color: "#94A3B8", fontSize: 24, fontWeight: 600 }}>
              El único paso que debes dar hoy:
            </div>
            <div
              style={{
                color: "#34D399",
                fontSize: 46,
                fontWeight: 900,
                lineHeight: 1.25,
              }}
            >
              "Cada vez que vendas uno de esos 5, anótalo. Solo eso."
            </div>
            <div
              style={{
                display: "inline-block",
                margin: "10px auto 0",
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                padding: "8px 24px",
                borderRadius: 9999,
                fontSize: 20,
                fontWeight: 700,
                color: "#E2E8F0",
              }}
            >
              WALA te da la claridad en tu celular 📱
            </div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
