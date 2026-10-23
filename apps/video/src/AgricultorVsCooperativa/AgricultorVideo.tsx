import React, { useMemo } from "react";
import { Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CameraRig } from "./components/CameraRig";
import { HighlightBox } from "./components/HighlightBox";
import { InfographicHUD } from "./components/InfographicHUD";
import { VignetteOverlay } from "./components/VignetteOverlay";
import { findActiveBeat, getComputedTimeline } from "./timelineConfig";

export const AgricultorVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Dimensiones base del lienzo de la infografía (proporción nativa 571 x 1024 escalada a ancho 1080)
  const BASE_WIDTH = 1080;
  const BASE_HEIGHT = Math.round(1080 * (1024 / 571)); // 1937 px

  // Calcula timeline con frames acumulados
  const { beats } = useMemo(() => getComputedTimeline(fps), [fps]);

  // Obtiene el beat activo actual y el anterior para la transición
  const { current, prev, frameInBeat } = useMemo(
    () => findActiveBeat(frame, beats),
    [frame, beats]
  );

  return (
    <div
      style={{
        position: "relative",
        width: 1080,
        height: 1920,
        backgroundColor: "#18181B",
        overflow: "hidden",
      }}
    >
      {/* 1. Capa Cinemática de Cámara (Pan, Zoom, Tilt & Ken Burns) */}
      <CameraRig
        currentBeat={current}
        prevBeat={prev}
        frameInBeat={frameInBeat}
        baseWidth={BASE_WIDTH}
        baseHeight={BASE_HEIGHT}
      >
        {/* Lámina manuscrita original */}
        <Img
          src={staticFile("agricultor_vs_cooperativa.jpg")}
          style={{
            width: BASE_WIDTH,
            height: BASE_HEIGHT,
            display: "block",
            userSelect: "none",
          }}
        />

        {/* Recuadro animado tipo SVG stroke con brillo atado a la posición de la lámina */}
        <HighlightBox
          highlight={current.highlight}
          frameInBeat={frameInBeat}
          baseWidth={BASE_WIDTH}
          baseHeight={BASE_HEIGHT}
        />
      </CameraRig>

      {/* 2. Viñeteado cinematográfico y atenuación perimetral */}
      <VignetteOverlay intensity={current.category === "intro" ? 0.6 : 0.85} />

      {/* 3. Head-Up Display (Progreso superior, Stepper y Tarjeta inferior con resumen) */}
      <InfographicHUD
        currentBeat={current}
        frameInBeat={frameInBeat}
        totalBeats={beats.length}
      />
    </div>
  );
};
