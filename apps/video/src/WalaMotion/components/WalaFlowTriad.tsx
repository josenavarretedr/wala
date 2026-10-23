import React from "react";
import { IsometricWarehouse } from "./IsometricWarehouse";
import { BrowserStoreCard } from "./BrowserStoreCard";
import { IsometricHouse } from "./IsometricHouse";

export interface WalaFlowTriadProps {
  startFrame?: number;
  staggerDelay?: number;
  warehouseLabel?: string;
  storeLabel?: string;
  storePrice?: string;
  customerLabel?: string;
}

export const WalaFlowTriad: React.FC<WalaFlowTriadProps> = ({
  startFrame = 15,
  staggerDelay = 8,
  warehouseLabel = "PROVEEDOR",
  storeLabel = "MI TIENDA",
  storePrice = "$25",
  customerLabel = "CLIENTE",
}) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        width: "100%",
        padding: "0 60px",
        boxSizing: "border-box",
      }}
    >
      {/* 1. Proveedor (Almacén) */}
      <IsometricWarehouse
        label={warehouseLabel}
        delayFrame={startFrame}
      />

      {/* 2. Mi Tienda (Browser Card) */}
      <BrowserStoreCard
        label={storeLabel}
        price={storePrice}
        delayFrame={startFrame + staggerDelay}
      />

      {/* 3. Cliente (Casa) */}
      <IsometricHouse
        label={customerLabel}
        delayFrame={startFrame + staggerDelay * 2}
      />
    </div>
  );
};
