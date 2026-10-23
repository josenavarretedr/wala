import React from "react";
import { interpolate, spring, useVideoConfig } from "remotion";
import { ComputedBeat } from "../types";

interface CameraRigProps {
  currentBeat: ComputedBeat;
  prevBeat: ComputedBeat | null;
  frameInBeat: number;
  baseWidth: number;
  baseHeight: number;
  children: React.ReactNode;
}

export const CameraRig: React.FC<CameraRigProps> = ({
  currentBeat,
  prevBeat,
  frameInBeat,
  baseWidth,
  baseHeight,
  children,
}) => {
  const { fps, width: viewportW, height: viewportH } = useVideoConfig();

  // Transición suave al entrar en un nuevo beat usando física spring
  const transitionT = prevBeat
    ? spring({
        frame: frameInBeat,
        fps,
        config: { damping: 18, stiffness: 75, mass: 0.95 },
      })
    : 1;

  // Centro X e Y interpolados entre el beat anterior y el actual
  const fromCenterX = prevBeat ? prevBeat.target.centerX : currentBeat.target.centerX;
  const fromCenterY = prevBeat ? prevBeat.target.centerY : currentBeat.target.centerY;
  const fromZoom = prevBeat ? prevBeat.target.zoom : currentBeat.target.zoom;

  const targetCenterX = interpolate(
    transitionT,
    [0, 1],
    [fromCenterX, currentBeat.target.centerX]
  );
  const targetCenterY = interpolate(
    transitionT,
    [0, 1],
    [fromCenterY, currentBeat.target.centerY]
  );
  const baseZoom = interpolate(
    transitionT,
    [0, 1],
    [fromZoom, currentBeat.target.zoom]
  );

  // Efecto Ken Burns dinámico: sutil avance continuo (zoom 3.5%) y micro-deriva vertical
  const kenBurnsProgress = interpolate(
    frameInBeat,
    [0, currentBeat.durationInFrames],
    [0, 1],
    { extrapolateRight: "clamp" }
  );

  const kenBurnsZoom = 1.0 + kenBurnsProgress * 0.038;
  const kenBurnsDriftY = (kenBurnsProgress - 0.5) * 0.008;

  const finalZoom = baseZoom * kenBurnsZoom;
  const focalX = targetCenterX * baseWidth;
  const focalY = (targetCenterY + kenBurnsDriftY) * baseHeight;

  // Centrado en el viewport (540, 960 en 1080x1920)
  const screenCenterX = viewportW / 2;
  // Para intro/outro centramos en 0.50. Para cuadrantes, centramos en 0.435 para dar aire al HUD inferior
  const isOverview = currentBeat.category === "intro" || currentBeat.category === "outro";
  const screenCenterY = viewportH * (isOverview ? 0.5 : 0.435);

  const translateX = screenCenterX - focalX * finalZoom;
  const translateY = screenCenterY - focalY * finalZoom;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: viewportW,
        height: viewportH,
        overflow: "hidden",
        backgroundColor: "#EFECE6", // Tono papel cálido neutro de base
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: baseWidth,
          height: baseHeight,
          transformOrigin: "0 0",
          transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${finalZoom})`,
          willChange: "transform",
        }}
      >
        {children}
      </div>
    </div>
  );
};
