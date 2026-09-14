import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(ellipse at center, #1C2638 0%, #0B1528 70%, #060B14 100%)",
          color: "#FFFFFF",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle decorative gold circle glow in background */}
        <div
          style={{
            position: "absolute",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(212, 175, 55, 0.12) 0%, rgba(197, 155, 95, 0) 70%)",
            filter: "blur(60px)",
          }}
        />

        {/* Central Brand Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "120px",
            height: "120px",
            borderRadius: "28px",
            background: "linear-gradient(135deg, #1C1A17 0%, #0D0E12 100%)",
            border: "2.5px solid #D4AF37",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(212, 175, 55, 0.2)",
            marginBottom: "32px",
          }}
        >
          <svg
            width="72"
            height="72"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 4L34 12V28L20 36L6 28V12L20 4Z"
              stroke="#D4AF37"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path
              d="M20 14L26 18V24L20 27L14 24V18L20 14Z"
              fill="#C59B5F"
            />
            <circle cx="20" cy="20.5" r="2.5" fill="#FFFFFF" />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "64px",
            fontWeight: "800",
            letterSpacing: "-0.02em",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            marginBottom: "16px",
          }}
        >
          <span>VERISETT</span>
          <span style={{ color: "#D4AF37" }}>AI</span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "24px",
            color: "#A0AEC0",
            fontWeight: "400",
            letterSpacing: "0.02em",
            textAlign: "center",
            maxWidth: "800px",
            lineHeight: "1.4",
            marginBottom: "36px",
          }}
        >
          Deterministic Escrow &amp; Programmatic Settlement for Autonomous Multi-Agent Workflows
        </div>

        {/* Bottom Feature Badges */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              padding: "8px 18px",
              borderRadius: "9999px",
              background: "rgba(212, 175, 55, 0.12)",
              border: "1px solid rgba(212, 175, 55, 0.35)",
              color: "#E2C875",
              fontSize: "13px",
              fontWeight: "600",
              letterSpacing: "0.08em",
            }}
          >
            FASTMCP v2.4 PROTOCOL
          </div>
          <div
            style={{
              padding: "8px 18px",
              borderRadius: "9999px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#E2E8F0",
              fontSize: "13px",
              fontWeight: "600",
              letterSpacing: "0.08em",
            }}
          >
            NON-CUSTODIAL TESTNET
          </div>
          <div
            style={{
              padding: "8px 18px",
              borderRadius: "9999px",
              background: "rgba(16, 185, 129, 0.12)",
              border: "1px solid rgba(16, 185, 129, 0.35)",
              color: "#34D399",
              fontSize: "13px",
              fontWeight: "600",
              letterSpacing: "0.08em",
            }}
          >
            0% COUNTERPARTY RISK
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
