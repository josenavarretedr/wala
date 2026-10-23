import React from "react";
import { AbsoluteFill } from "remotion";
import { WALA_COLORS } from "../tokens";
import { WalaPaperHeader } from "../components/WalaPaperHeader";
import { WalaFlowTriad } from "../components/WalaFlowTriad";

export interface EditorialFlowTriadSceneProps {
  ideaNumber?: string;
  sectionTitle?: string;
  warehouseLabel?: string;
  storeLabel?: string;
  storePrice?: string;
  customerLabel?: string;
}

export const EditorialFlowTriadScene: React.FC<EditorialFlowTriadSceneProps> = ({
  ideaNumber = "IDEA N°1 · PARTE 1",
  sectionTitle = "¿QUÉ ES?",
  warehouseLabel = "PROVEEDOR",
  storeLabel = "MI TIENDA",
  storePrice = "$25",
  customerLabel = "CLIENTE",
}) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: WALA_COLORS.paperBg,
        overflow: "hidden",
      }}
    >
      {/* 1. Top Paper HUD Header */}
      <WalaPaperHeader
        ideaNumber={ideaNumber}
        sectionTitle={sectionTitle}
        budgetLabel="PRESUPUESTO"
        currentBudget={0}
        totalBudget={120}
      />

      {/* 2. Middle Flow Graphic (Centered vertically in visual field) */}
      <div
        style={{
          position: "absolute",
          top: "42%",
          left: 0,
          right: 0,
          transform: "translateY(-50%)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <WalaFlowTriad
          startFrame={15}
          staggerDelay={8}
          warehouseLabel={warehouseLabel}
          storeLabel={storeLabel}
          storePrice={storePrice}
          customerLabel={customerLabel}
        />
      </div>
    </AbsoluteFill>
  );
};
