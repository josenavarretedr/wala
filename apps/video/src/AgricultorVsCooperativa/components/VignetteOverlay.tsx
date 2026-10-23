import React from "react";

interface VignetteOverlayProps {
  intensity?: number;
}

export const VignetteOverlay: React.FC<VignetteOverlayProps> = ({
  intensity = 1.0,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 10,
        opacity: intensity,
      }}
    >
      {/* 1. Viñeta radial para centrar la mirada en el cuadrante activo */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          mixBlendMode: "multiply",
          background:
            "radial-gradient(circle at 50% 45%, rgba(255, 255, 255, 0) 35%, rgba(24, 24, 27, 0.25) 72%, rgba(15, 23, 42, 0.65) 100%)",
        }}
      />

      {/* 2. Gradiente suave superior para contrastar el HUD */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: 220,
          background:
            "linear-gradient(to bottom, rgba(15, 23, 42, 0.65) 0%, rgba(15, 23, 42, 0.20) 65%, transparent 100%)",
        }}
      />

      {/* 3. Gradiente sutil inferior para dar soporte a la tarjeta de resumen */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: 380,
          background:
            "linear-gradient(to top, rgba(15, 23, 42, 0.70) 0%, rgba(15, 23, 42, 0.22) 65%, transparent 100%)",
        }}
      />
    </div>
  );
};
