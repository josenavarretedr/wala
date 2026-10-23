import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { WALA_COLORS, WALA_FONTS, WALA_SPRINGS } from "../tokens";

export interface TimelineStep {
  id: string;
  label: string;
}

export interface WalaTimelineStepperProps {
  steps?: TimelineStep[];
  activeStepIndex?: number;
  stepTransitionFrame?: number;
  delayFrame?: number;
}

const DEFAULT_STEPS: TimelineStep[] = [
  { id: "1", label: "PROVEEDOR" },
  { id: "2", label: "TIENDA" },
  { id: "3", label: "CREATIVOS" },
  { id: "4", label: "PUBLICIDAD" },
];

export const WalaTimelineStepper: React.FC<WalaTimelineStepperProps> = ({
  steps = DEFAULT_STEPS,
  activeStepIndex = 1,
  stepTransitionFrame = 40,
  delayFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - delayFrame,
    fps,
    config: WALA_SPRINGS.snappy,
  });

  const translateY = interpolate(entrance, [0, 1], [-40, 0]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]);

  // Dynamic progress line interpolation
  // Calculates how far the orange progress bar extends between steps
  const progressPercent = interpolate(
    frame,
    [stepTransitionFrame, stepTransitionFrame + 30],
    [0.15, (activeStepIndex / (steps.length - 1))],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  return (
    <div
      style={{
        position: "absolute",
        top: 240,
        left: 60,
        right: 60,
        transform: `translateY(${translateY}px)`,
        opacity,
        zIndex: 40,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "26px 40px 22px 40px",
          borderRadius: 9999,
          backgroundColor: WALA_COLORS.hudDarkBg,
          border: `1.5px solid ${WALA_COLORS.hudBorder}`,
          backdropFilter: "blur(20px)",
          boxShadow: "0 18px 45px rgba(0, 0, 0, 0.45)",
          position: "relative",
        }}
      >
        {/* Horizontal Node Track */}
        <div
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            height: 38,
          }}
        >
          {/* Background Inactive Line */}
          <div
            style={{
              position: "absolute",
              top: 17,
              left: 20,
              right: 20,
              height: 4,
              backgroundColor: WALA_COLORS.hudConnectorInactive,
              borderRadius: 2,
              zIndex: 1,
            }}
          />

          {/* Active Orange Connector Line */}
          <div
            style={{
              position: "absolute",
              top: 17,
              left: 20,
              width: `calc((100% - 40px) * ${progressPercent})`,
              height: 4,
              backgroundColor: WALA_COLORS.brandOrange,
              borderRadius: 2,
              zIndex: 2,
              boxShadow: `0 0 10px ${WALA_COLORS.brandOrange}`,
            }}
          />

          {/* Nodes */}
          {steps.map((step, index) => {
            const isCompleted = index < activeStepIndex;
            const isCurrent = index === activeStepIndex;

            return (
              <div
                key={step.id}
                style={{
                  position: "relative",
                  zIndex: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* Node Ring */}
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s ease",
                    border: isCompleted
                      ? `3px solid ${WALA_COLORS.brandOrange}`
                      : isCurrent
                      ? "3px solid #FFFFFF"
                      : "3px solid rgba(255, 255, 255, 0.8)",
                    backgroundColor: isCompleted
                      ? WALA_COLORS.brandOrange
                      : isCurrent
                      ? "#FFFFFF"
                      : "#18181B",
                    boxShadow: isCompleted
                      ? `0 0 12px ${WALA_COLORS.brandOrange}`
                      : isCurrent
                      ? "0 0 10px rgba(255, 255, 255, 0.7)"
                      : "none",
                  }}
                >
                  {isCompleted && (
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        backgroundColor: "#FFFFFF",
                      }}
                    />
                  )}
                  {isCurrent && (
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        backgroundColor: "#18181B",
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Labels Track */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            marginTop: 8,
          }}
        >
          {steps.map((step, index) => {
            const isCompleted = index < activeStepIndex;
            const isCurrent = index === activeStepIndex;

            return (
              <div
                key={`label-${step.id}`}
                style={{
                  width: 100,
                  textAlign: "center",
                  fontFamily: WALA_FONTS.mono,
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  color: isCompleted
                    ? WALA_COLORS.brandOrange
                    : isCurrent
                    ? "#FFFFFF"
                    : WALA_COLORS.hudTextMuted,
                  transform: "translateX(0)",
                }}
              >
                {step.label}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
