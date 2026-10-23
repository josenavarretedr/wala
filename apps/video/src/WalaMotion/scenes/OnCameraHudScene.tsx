import React from "react";
import { AbsoluteFill, Video } from "remotion";
import { WalaDarkCapsule } from "../components/WalaDarkCapsule";
import { WalaTimelineStepper } from "../components/WalaTimelineStepper";

export interface OnCameraHudSceneProps {
  ideaText?: string;
  activeStepIndex?: number;
  videoSource?: string;
}

export const OnCameraHudScene: React.FC<OnCameraHudSceneProps> = ({
  ideaText = "IDEA N°1 · PARTE 1",
  activeStepIndex = 1,
  videoSource,
}) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#1C1C1E",
        overflow: "hidden",
      }}
    >
      {/* 1. Camera Background or Studio Backdrop */}
      {videoSource ? (
        <Video
          src={videoSource}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      ) : (
        /* Atmospheric Studio Gradient Background representing creator room */
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(circle at 50% 30%, #323238 0%, #18181B 65%, #0E0E10 100%)",
          }}
        >
          {/* Subtle warm studio light glow */}
          <div
            style={{
              position: "absolute",
              top: "20%",
              left: "15%",
              width: 700,
              height: 700,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255, 140, 60, 0.08) 0%, transparent 70%)",
              filter: "blur(50px)",
              pointerEvents: "none",
            }}
          />
        </AbsoluteFill>
      )}

      {/* 2. Top Dark Capsule Badge with Orange LED */}
      <WalaDarkCapsule
        text={ideaText}
        delayFrame={10}
      />

      {/* 3. Horizontal Timeline Stepper HUD */}
      <WalaTimelineStepper
        activeStepIndex={activeStepIndex}
        stepTransitionFrame={50}
        delayFrame={20}
      />
    </AbsoluteFill>
  );
};
