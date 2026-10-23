import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { BodegaScene1Hook } from "./BodegaScene1Hook";
import { BodegaScene2Caso } from "./BodegaScene2Caso";
import { BodegaScene3Valor } from "./BodegaScene3Valor";
import { BodegaScene4Accion } from "./BodegaScene4Accion";
import { BodegaScene5CTA } from "./BodegaScene5CTA";

/**
 * Master Video 100% Full Motion Graphics para Bodegas WALA (60s / 3600 frames @ 60 FPS).
 * Formato vertical móvil 9:16 (1080 × 1920).
 * Composición por regla de tercios y fondo oficial bg_wall.png.
 */
export const BodegaFullMotionMaster: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#FDFBF7" }} durationInFrames={2578}>
      {/* 🎵 Pista de audio sincronizada a 60s con transiciones rítmicas */}
      <Audio src={staticFile("bodega_soundtrack.wav")} volume={0.8} />

      {/* [0-5s] (300 frames): Escena 1 - Gancho Triple W */}
      <Sequence durationInFrames={300} name="01-Gancho-Dilema">
        <BodegaScene1Hook />
      </Sequence>

      {/* [5-20s] (900 frames): Escena 2 - Caso A/B Caos vs Claridad */}
      <Sequence from={300} durationInFrames={251} name="02-Caso-Comparativa">
        <BodegaScene2Caso />
      </Sequence>

      {/* [20-45s] (1500 frames): Escena 3 - Valor Directo (La Caja Abierta) */}
      <Sequence from={555} durationInFrames={511} name="03-Valor-Caja-Abierta">
        <BodegaScene3Valor />
      </Sequence>

      {/* [45-55s] (600 frames): Escena 4 - Micro-Acción (Top 5 Productos) */}
      <Sequence from={1064} durationInFrames={600} name="04-Micro-Accion">
        <BodegaScene4Accion />
      </Sequence>

      {/* [55-60s] (300 frames): Escena 5 - CTA TOFU WALA Gratis */}
      <Sequence from={1672} durationInFrames={300} name="05-CTA-WALA">
        <BodegaScene5CTA />
      </Sequence>
    </AbsoluteFill>
  );
};
