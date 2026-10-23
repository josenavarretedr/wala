import React from "react";
import { Img, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Cursor } from "./Cursor";
import { LowerThirdProps } from "./schema";
import { SubscribeButton } from "./SubscribeButton";

export const LowerThird: React.FC<LowerThirdProps> = ({
  channelName,
  handle,
  subscriberCount,
  avatarUrl,
  buttonText,
  subscribedText,
  verified,
  showCursor,
  backgroundColor,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // 1. Entrance animation (Slide in from bottom center)
  const introStartFrame = 12;
  const slideInSpring = spring({
    frame: frame - introStartFrame,
    fps,
    config: {
      damping: 14,
      mass: 0.85,
      stiffness: 95,
    },
  });

  const translateYIntro = interpolate(slideInSpring, [0, 1], [180, 0]);
  const introOpacity = interpolate(
    frame,
    [introStartFrame, introStartFrame + 12],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // 2. Exit animation: Smooth fade out at the end of the video
  // Total 300 frames. Fades out smoothly between frame 265 and 295
  const fadeOutStart = durationInFrames - 35;
  const fadeOutEnd = durationInFrames - 5;
  const exitOpacity = interpolate(
    frame,
    [fadeOutStart, fadeOutEnd],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // Combined opacity
  const opacity = introOpacity * exitOpacity;

  // Gentle floating/breath effect for realism
  const breathe = Math.sin(frame / 20) * 1.5;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      {/* Lower Third Container placed at bottom center */}
      <div
        style={{
          position: "absolute",
          bottom: 90,
          left: "50%",
          transform: `translateX(-50%) translateY(${translateYIntro + breathe}px)`,
          opacity,
          zIndex: 30,
        }}
      >
        {/* Main White Lower Third Card */}
        <div
          style={{
            position: "relative",
            backgroundColor: backgroundColor || "#ffffff",
            padding: "16px 28px 16px 20px",
            borderRadius: 50,
            display: "flex",
            alignItems: "center",
            gap: 20,
            boxShadow:
              "0 20px 45px -10px rgba(0, 0, 0, 0.22), 0 10px 20px -5px rgba(0, 0, 0, 0.12)",
            border: "1px solid rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(12px)",
          }}
        >
          {/* Channel Avatar */}
          <div
            style={{
              position: "relative",
              width: 68,
              height: 68,
              borderRadius: "50%",
              overflow: "hidden",
              flexShrink: 0,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              border: "3px solid #ffffff",
              backgroundColor: "#f0f0f0",
            }}
          >
            <Img
              src={avatarUrl}
              alt={channelName}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>

          {/* Channel Info: Name, Handle & Subscribers */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              marginRight: 16,
              minWidth: 220,
            }}
          >
            {/* Channel Name with Verified Badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: "#0f0f0f",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.2,
                }}
              >
                {channelName}
              </span>

              {verified && (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="#606060"
                  style={{ display: "inline-block", flexShrink: 0 }}
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              )}
            </div>

            {/* Handle & Subscriber Count */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 3,
                fontSize: 15,
                color: "#606060",
                fontWeight: 500,
              }}
            >
              <span>{handle}</span>
              <span style={{ opacity: 0.5 }}>•</span>
              <span style={{ fontWeight: 600, color: "#454545" }}>
                {subscriberCount}
              </span>
            </div>
          </div>

          {/* Black Subscribe Button with Click Animation */}
          <div style={{ position: "relative" }}>
            <SubscribeButton
              buttonText={buttonText}
              subscribedText={subscribedText}
              clickFrame={110}
            />

            {/* Optional Cursor clicking on the button */}
            {showCursor && <Cursor clickFrame={110} />}
          </div>
        </div>
      </div>
    </div>
  );
};
