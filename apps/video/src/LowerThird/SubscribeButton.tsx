import React from "react";
import {
  interpolate,
  interpolateColors,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

interface SubscribeButtonProps {
  buttonText: string;
  subscribedText: string;
  clickFrame?: number;
}

export const SubscribeButton: React.FC<SubscribeButtonProps> = ({
  buttonText,
  subscribedText,
  clickFrame = 110,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Button click scale animation
  // It compresses at clickFrame, then bounces back up
  const isAfterClick = frame >= clickFrame;

  const clickProgress = spring({
    frame: frame - clickFrame,
    fps,
    config: {
      damping: 10,
      mass: 0.5,
      stiffness: 180,
    },
  });

  const buttonScale =
    frame < clickFrame
      ? 1
      : frame < clickFrame + 8
      ? interpolate(frame, [clickFrame, clickFrame + 4, clickFrame + 8], [1, 0.88, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : interpolate(clickProgress, [0, 1], [0.95, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

  // Ripple effect on click
  const rippleProgress = interpolate(
    frame,
    [clickFrame, clickFrame + 25],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const rippleOpacity = interpolate(
    frame,
    [clickFrame, clickFrame + 25],
    [0.4, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // Bell shake animation when subscribed
  const bellStartFrame = clickFrame + 12;
  const bellRotation =
    frame >= bellStartFrame && frame <= bellStartFrame + 30
      ? Math.sin((frame - bellStartFrame) * 0.8) *
        interpolate(frame, [bellStartFrame, bellStartFrame + 30], [18, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 0;

  // Background color transition from deep black to sleek dark gray
  const bgColor = interpolateColors(
    frame,
    [clickFrame, clickFrame + 6],
    ["#0f0f0f", "#272727"]
  );

  return (
    <div
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Click ripple burst */}
      {frame >= clickFrame && frame <= clickFrame + 25 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 9999,
            border: "2px solid rgba(0, 0, 0, 0.6)",
            transform: `scale(${1 + rippleProgress * 0.4})`,
            opacity: rippleOpacity,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Main Button */}
      <div
        style={{
          backgroundColor: bgColor,
          color: "#ffffff",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          fontWeight: 600,
          fontSize: 20,
          letterSpacing: "-0.01em",
          padding: "14px 28px",
          borderRadius: 9999,
          display: "flex",
          alignItems: "center",
          gap: 10,
          cursor: "pointer",
          transform: `scale(${buttonScale})`,
          transformOrigin: "center center",
          boxShadow: isAfterClick
            ? "0 4px 14px rgba(0, 0, 0, 0.18)"
            : "0 8px 20px rgba(0, 0, 0, 0.28)",
          userSelect: "none",
        }}
      >
        {isAfterClick ? (
          <>
            {/* Bell Icon */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              style={{
                transform: `rotate(${bellRotation}deg)`,
                transformOrigin: "top center",
              }}
            >
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" />
            </svg>
            <span>{subscribedText}</span>
          </>
        ) : (
          <span>{buttonText}</span>
        )}
      </div>
    </div>
  );
};
