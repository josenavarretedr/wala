import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { FerreteriaScene1Hook } from "./FerreteriaScene1Hook";
import { FerreteriaScene2ACaos } from "./FerreteriaScene2ACaos";
import { FerreteriaScene2BClaridad } from "./FerreteriaScene2BClaridad";
import { FerreteriaScene3AMetricas } from "./FerreteriaScene3AMetricas";
import { FerreteriaScene3BPuertaAbierta } from "./FerreteriaScene3BPuertaAbierta";

export const FerreteriaMasterVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#FDFBF7" }}>
      {/* 🎵 Dynamic Background Soundtrack with Transition Cuts & FX */}
      <Audio
        src={staticFile("ferreteria_soundtrack.wav")}
        volume={0.75}
      />

      {/* 0-5s (300 frames): Gancho Triple W */}
      <Sequence durationInFrames={300} name="01-Gancho-Triple-W">
        <FerreteriaScene1Hook />
      </Sequence>

      {/* 5-12.5s (450 frames): Caso Rápido Fase A - El Ferretero Tradicional */}
      <Sequence from={300} durationInFrames={450} name="02A-Caso-Caos">
        <FerreteriaScene2ACaos />
      </Sequence>

      {/* 12.5-20s (450 frames): Caso Rápido Fase B - El Ferretero con Claridad */}
      <Sequence from={750} durationInFrames={450} name="02B-Caso-Claridad">
        <FerreteriaScene2BClaridad />
      </Sequence>

      {/* 20-32.5s (750 frames): Valor Directo Fase A - Anota los 5 Productos */}
      <Sequence from={1200} durationInFrames={750} name="03A-Valor-Metricas">
        <FerreteriaScene3AMetricas />
      </Sequence>

      {/* 32.5-45s (750 frames): Valor Directo Fase B - La Puerta Abierta y la Acción */}
      <Sequence from={1950} durationInFrames={750} name="03B-Valor-Puerta-Abierta">
        <FerreteriaScene3BPuertaAbierta />
      </Sequence>
    </AbsoluteFill>
  );
};
