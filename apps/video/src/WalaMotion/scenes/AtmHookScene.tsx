import React from "react";
import { AbsoluteFill } from "remotion";
import { Background } from "../components/Background";
import { TopBadge } from "../components/TopBadge";
import { KineticHeadline } from "../components/KineticHeadline";
import { WalaHistorialFeed } from "../components/WalaHistorialFeed";
import { WalaAtmHookProps } from "../types";

export const AtmHookScene: React.FC<WalaAtmHookProps> = (props) => {
  const isTalkingHead = props.layout === "TALKING_HEAD";

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#FDFBF7",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      {/* L0: Background with bg_wall.png pattern */}
      <Background layout={props.layout} videoSource={props.videoSource} />

      {/* L1: Top Branding Pill */}
      <TopBadge text={props.tagText} />

      {/* L2: Kinetic Headline */}
      <KineticHeadline
        part1={props.headlinePart1}
        highlight1={props.highlightSalón}
        part2={props.headlinePart2}
        highlight2={props.highlightCajero}
        isTalkingHead={isTalkingHead}
      />

      {/* L3: WALA CardStandard Feed */}
      <WalaHistorialFeed
        initialBalance={props.initialBalance}
        withdrawalAmount={props.withdrawalAmount}
        currency="S/"
        isTalkingHead={isTalkingHead}
      />
    </AbsoluteFill>
  );
};

