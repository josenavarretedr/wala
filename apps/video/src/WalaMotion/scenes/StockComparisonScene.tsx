import React from "react";
import { AbsoluteFill } from "remotion";
import { WALA_COLORS } from "../tokens";
import { WalaPaperHeader } from "../components/WalaPaperHeader";
import { WalaKineticCallout } from "../components/WalaKineticCallout";
import { WireframeShelfWithZero } from "../components/WireframeShelfWithZero";
import { CurvedConnectorArrow } from "../components/CurvedConnectorArrow";
import { PhoneCatalogMockup } from "../components/PhoneCatalogMockup";
import { CashVoucherCard } from "../components/CashVoucherCard";

export interface StockComparisonSceneProps {
  ideaNumber?: string;
  sectionTitle?: string;
}

export const StockComparisonScene: React.FC<StockComparisonSceneProps> = ({
  ideaNumber = "IDEA N°1 · PARTE 1",
  sectionTitle = "¿POR QUÉ ESTA IDEA?",
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

      {/* 2. Top-Left Kinetic Callout */}
      <div
        style={{
          position: "absolute",
          top: 260,
          left: 60,
          zIndex: 20,
        }}
      >
        <WalaKineticCallout
          line1="¿por qué"
          line2="esta idea?"
          delayFrame={10}
        />
      </div>

      {/* 3. Center Upper Diagram: Shelf "0" -> Curved Arrow -> Phone Mockup */}
      <div
        style={{
          position: "absolute",
          top: 280,
          right: 120,
          display: "flex",
          alignItems: "center",
          gap: 10,
          zIndex: 20,
        }}
      >
        <WireframeShelfWithZero
          count="0"
          label="MI TIENDA"
          delayFrame={18}
        />

        <div style={{ transform: "translateY(-30px)" }}>
          <CurvedConnectorArrow delayFrame={26} />
        </div>

        <PhoneCatalogMockup
          badgeText="LO VENDO SIN TENERLO"
          label="CATÁLOGO DEL PROVEEDOR"
          delayFrame={32}
        />
      </div>

      {/* 4. Center Lower Comparison: Cash Voucher Tickets */}
      <div
        style={{
          position: "absolute",
          top: 980,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 70,
          zIndex: 20,
        }}
      >
        <CashVoucherCard
          label="MI PRUEBA"
          variant="single"
          delayFrame={42}
        />

        <CashVoucherCard
          label="NEGOCIO CON STOCK"
          variant="stacked"
          delayFrame={50}
        />
      </div>

      {/* 5. Speaker Safe Area Overlay Hint (Bottom 30% reserved for talking head) */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 480,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
