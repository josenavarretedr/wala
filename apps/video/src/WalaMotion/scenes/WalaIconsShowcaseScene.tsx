import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { WALA_COLORS, WALA_FONTS, WALA_SPRINGS } from "../tokens";
import { WALA_ICONS_CATALOG, WalaIcon } from "../icons";

export const WalaIconsShowcaseScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animación del header
  const headerSpring = spring({
    frame,
    fps,
    config: WALA_SPRINGS.snappy,
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: WALA_COLORS.paperBg,
        fontFamily: WALA_FONTS.display,
        color: WALA_COLORS.inkPrimary,
        padding: "60px 48px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
      }}
    >
      {/* Header superior estilo WALA Editorial */}
      <div
        style={{
          transform: `translateY(${interpolate(headerSpring, [0, 1], [-40, 0])}px)`,
          opacity: headerSpring,
          marginBottom: 36,
          borderBottom: `2px solid ${WALA_COLORS.paperDividerStrong}`,
          paddingBottom: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: WALA_FONTS.mono,
                fontSize: 18,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: WALA_COLORS.brandOrange,
                fontWeight: 700,
                marginBottom: 6,
              }}
            >
              WALA MOTION DESIGN SYSTEM · ICONOS REACT
            </div>
            <h1
              style={{
                fontSize: 42,
                fontWeight: 800,
                margin: 0,
                color: WALA_COLORS.inkPrimary,
                letterSpacing: "-0.02em",
              }}
            >
              Set Oficial de 24 Iconos <span style={{ color: WALA_COLORS.brandOrange }}>Doodle</span>
            </h1>
          </div>
          <div
            style={{
              backgroundColor: WALA_COLORS.brandOrangeLight,
              border: `1.5px solid ${WALA_COLORS.brandOrangeBorder}`,
              borderRadius: 12,
              padding: "10px 18px",
              fontFamily: WALA_FONTS.mono,
              fontSize: 16,
              fontWeight: 700,
              color: WALA_COLORS.brandOrange,
            }}
          >
            24 / 24 COMPONENTES
          </div>
        </div>
      </div>

      {/* Grilla 6 Filas × 4 Columnas exacta a la referencia */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gridTemplateRows: "repeat(6, 1fr)",
          gap: "18px 18px",
          flex: 1,
        }}
      >
        {WALA_ICONS_CATALOG.map((item, index) => {
          const itemDelay = Math.floor(index * 2);
          const itemSpring = spring({
            frame: frame - itemDelay,
            fps,
            config: WALA_SPRINGS.bouncy,
          });

          const scale = interpolate(itemSpring, [0, 1], [0.75, 1]);
          const opacity = interpolate(itemSpring, [0, 1], [0, 1]);

          return (
            <div
              key={item.name}
              style={{
                transform: `scale(${scale})`,
                opacity,
                backgroundColor: WALA_COLORS.cardBg,
                borderRadius: 16,
                border: `1.5px solid ${WALA_COLORS.cardBorder}`,
                boxShadow: WALA_COLORS.cardShadowSubtle,
                padding: "16px 12px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                position: "relative",
              }}
            >
              {/* Badge con coordenada de fila/columna */}
              <div
                style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  fontFamily: WALA_FONTS.mono,
                  fontSize: 11,
                  fontWeight: 700,
                  color: WALA_COLORS.inkMuted,
                  backgroundColor: WALA_COLORS.paperBg,
                  borderRadius: 6,
                  padding: "2px 6px",
                }}
              >
                F{item.row}·C{item.col}
              </div>

              {/* Icono renderizado */}
              <div
                style={{
                  marginTop: 8,
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 90,
                  height: 90,
                }}
              >
                <WalaIcon
                  name={item.name}
                  size={84}
                  color={WALA_COLORS.inkPrimary}
                  accentColor={WALA_COLORS.brandOrange}
                  strokeWidth={3.5}
                />
              </div>

              {/* Etiqueta y nombre */}
              <div
                style={{
                  width: "100%",
                  textAlign: "center",
                  borderTop: `1px solid ${WALA_COLORS.paperDivider}`,
                  paddingTop: 8,
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: WALA_COLORS.inkPrimary,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {item.title}
                </div>
                <div
                  style={{
                    fontFamily: WALA_FONTS.mono,
                    fontSize: 11,
                    color: WALA_COLORS.brandOrange,
                    fontWeight: 600,
                    marginTop: 2,
                  }}
                >
                  &lt;{item.componentName} /&gt;
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
