import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
} from "remotion";

export const VerisettPromo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene 1: Logo Intro (Frames 0 - 95 / 0s - 3.1s)
  const logoScale = spring({ frame, fps, config: { damping: 12, mass: 0.9 } });
  const logoOpacity = interpolate(frame, [0, 20, 75, 95], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pathDraw = interpolate(frame, [10, 55], [350, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Scene 2: Protocol Mechanics & Escrow Lock (Frames 90 - 245 / 3s - 8.1s)
  const cardScale = spring({ frame: frame - 90, fps, config: { damping: 14 } });
  const cardOpacity = interpolate(frame, [90, 110, 225, 245], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const progressWidth = interpolate(frame, [120, 205], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Scene 3: Coming Soon Call to Action (Frames 240 - 360 / 8s - 12s)
  const ctaScale = spring({ frame: frame - 240, fps, config: { damping: 12 } });
  const ctaOpacity = interpolate(frame, [240, 260], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Pulse animation for apex nodes
  const pulseR1 = interpolate(Math.sin((frame / 15) * Math.PI), [-1, 1], [4.5, 7.5]);
  const pulseR2 = interpolate(Math.sin(((frame + 10) / 15) * Math.PI), [-1, 1], [5, 8.5]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#080F1E",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        color: "#FFFFFF",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Ambient Glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 50% 50%, rgba(197, 155, 95, 0.18) 0%, rgba(2, 132, 199, 0.12) 35%, rgba(8, 15, 30, 0.95) 70%, #080F1E 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Grid Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          pointerEvents: "none",
        }}
      />

      {/* ============================================================ */}
      {/* SCENE 1: The Hook (Logo Reveal & Core Value Proposition) */}
      {/* ============================================================ */}
      {frame < 95 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            transform: `scale(${logoScale})`,
            opacity: logoOpacity,
            zIndex: 10,
          }}
        >
          {/* Crystalline Node SVG Logo */}
          <div
            style={{
              position: "relative",
              width: 140,
              height: 140,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            {/* Ambient Backlight Halo */}
            <div
              style={{
                position: "absolute",
                width: 160,
                height: 160,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(212, 175, 55, 0.4) 0%, transparent 70%)",
                filter: "blur(20px)",
              }}
            />

            <svg
              width="140"
              height="140"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ filter: "drop-shadow(0 0 18px rgba(197, 155, 95, 0.6))" }}
            >
              <defs>
                <linearGradient id="promo-gold-struts" x1="20" y1="25" x2="80" y2="78" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#C59B5F" />
                  <stop offset="50%" stopColor="#E6C875" />
                  <stop offset="100%" stopColor="#9E7A45" />
                </linearGradient>
              </defs>

              {/* Connecting Struts */}
              <path
                d="M20 25 L50 78 L80 25 M32 40 L68 40 M20 25 L40 50 L50 78 L60 50 L80 25 M35 25 L50 55 L65 25 M40 50 L60 50"
                stroke="url(#promo-gold-struts)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="350"
                strokeDashoffset={pathDraw}
              />

              {/* Pulsing Apex Nodes */}
              <circle cx="20" cy="25" r={pulseR1} fill="none" stroke="#D4AF37" strokeWidth="1.5" opacity="0.8" />
              <circle cx="80" cy="25" r={pulseR1} fill="none" stroke="#D4AF37" strokeWidth="1.5" opacity="0.8" />
              <circle cx="50" cy="78" r={pulseR2} fill="none" stroke="#C59B5F" strokeWidth="2" opacity="0.9" />

              {/* Verification Nodes */}
              <circle cx="20" cy="25" r="4.5" fill="#C59B5F" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="35" cy="25" r="3.5" fill="#D4AF37" stroke="#FFFFFF" strokeWidth="1.5" />
              <circle cx="80" cy="25" r="4.5" fill="#C59B5F" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="65" cy="25" r="3.5" fill="#D4AF37" stroke="#FFFFFF" strokeWidth="1.5" />
              <circle cx="32" cy="40" r="3.5" fill="#D4AF37" stroke="#FFFFFF" strokeWidth="1.5" />
              <circle cx="68" cy="40" r="3.5" fill="#D4AF37" stroke="#FFFFFF" strokeWidth="1.5" />
              <circle cx="40" cy="50" r="3.5" fill="#D4AF37" stroke="#FFFFFF" strokeWidth="1.5" />
              <circle cx="60" cy="50" r="3.5" fill="#D4AF37" stroke="#FFFFFF" strokeWidth="1.5" />
              <circle cx="50" cy="55" r="3.0" fill="#D4AF37" stroke="#FFFFFF" strokeWidth="1.5" />
              <circle cx="50" cy="78" r="5.5" fill="#9E7A45" stroke="#FFFFFF" strokeWidth="2" />
            </svg>
          </div>

          <h1
            style={{
              fontSize: 64,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              margin: 0,
              color: "#FFFFFF",
              textShadow: "0 4px 20px rgba(0,0,0,0.5)",
            }}
          >
            VERISETT{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #E6C875 0%, #C59B5F 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              AI
            </span>
          </h1>

          <p
            style={{
              fontSize: 20,
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#C59B5F",
              marginTop: 14,
              fontWeight: 600,
            }}
          >
            Settlement Rails for Autonomous Agents
          </p>
        </div>
      )}

      {/* ============================================================ */}
      {/* SCENE 2: The Core Product Showcase (Escrow Vault & Channel) */}
      {/* ============================================================ */}
      {frame >= 90 && frame < 245 && (
        <div
          style={{
            width: 760,
            borderRadius: 24,
            border: "1px solid rgba(197, 155, 95, 0.35)",
            backgroundColor: "rgba(11, 21, 40, 0.92)",
            padding: "36px 42px",
            boxShadow:
              "0 25px 60px -10px rgba(0, 0, 0, 0.7), 0 0 50px rgba(197, 155, 95, 0.15)",
            backdropFilter: "blur(20px)",
            transform: `scale(${cardScale})`,
            opacity: cardOpacity,
            zIndex: 10,
          }}
        >
          {/* Card Top Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid rgba(197, 155, 95, 0.2)",
              paddingBottom: 20,
              marginBottom: 24,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span
                style={{
                  display: "inline-block",
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: "#C59B5F",
                  boxShadow: "0 0 10px #C59B5F",
                }}
              />
              <span
                style={{
                  fontSize: 14,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: "#E6C875",
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  fontWeight: 700,
                }}
              >
                FastMCP Escrow Channel #089
              </span>
            </div>

            <span
              style={{
                fontSize: 12,
                fontFamily: "'JetBrains Mono', monospace",
                padding: "6px 14px",
                borderRadius: 999,
                backgroundColor: "rgba(16, 185, 129, 0.12)",
                color: "#34D399",
                border: "1px solid rgba(16, 185, 129, 0.35)",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              ● Active Consensus
            </span>
          </div>

          {/* Animated Verification Progress Bar */}
          <div style={{ marginBottom: 28 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 15,
                fontWeight: 600,
                marginBottom: 10,
              }}
            >
              <span style={{ color: "#94A3B8" }}>Cross-Agent Milestone Verification</span>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  color: "#E6C875",
                  fontWeight: 700,
                }}
              >
                {Math.round(progressWidth)}% Complete
              </span>
            </div>

            <div
              style={{
                width: "100%",
                height: 14,
                borderRadius: 999,
                backgroundColor: "rgba(2, 6, 23, 0.85)",
                border: "1px solid rgba(197, 155, 95, 0.3)",
                overflow: "hidden",
                padding: 2,
              }}
            >
              <div
                style={{
                  width: `${progressWidth}%`,
                  height: "100%",
                  borderRadius: 999,
                  background:
                    "linear-gradient(90deg, #9E7A45 0%, #C59B5F 50%, #E6C875 100%)",
                  boxShadow: "0 0 16px rgba(197, 155, 95, 0.7)",
                  transition: "width 0.1s linear",
                }}
              />
            </div>
          </div>

          {/* 3-Column Telemetry Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 16,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            <div
              style={{
                padding: 16,
                borderRadius: 14,
                backgroundColor: "rgba(2, 6, 23, 0.7)",
                border: "1px solid rgba(197, 155, 95, 0.2)",
              }}
            >
              <p style={{ margin: 0, fontSize: 11, color: "#64748B", textTransform: "uppercase" }}>
                Initiator
              </p>
              <p style={{ margin: "6px 0 0", fontSize: 13, color: "#F1F5F9", fontWeight: 700 }}>
                Agent_Executor_01
              </p>
            </div>

            <div
              style={{
                padding: 16,
                borderRadius: 14,
                backgroundColor: "rgba(2, 6, 23, 0.7)",
                border: "1px solid rgba(197, 155, 95, 0.2)",
              }}
            >
              <p style={{ margin: 0, fontSize: 11, color: "#64748B", textTransform: "uppercase" }}>
                Locked Deposit
              </p>
              <p style={{ margin: "6px 0 0", fontSize: 13, color: "#34D399", fontWeight: 700 }}>
                10,000 VRS Testnet
              </p>
            </div>

            <div
              style={{
                padding: 16,
                borderRadius: 14,
                backgroundColor: "rgba(2, 6, 23, 0.7)",
                border: "1px solid rgba(197, 155, 95, 0.2)",
              }}
            >
              <p style={{ margin: 0, fontSize: 11, color: "#64748B", textTransform: "uppercase" }}>
                Arbitration
              </p>
              <p style={{ margin: "6px 0 0", fontSize: 13, color: "#E6C875", fontWeight: 700 }}>
                Deterministic Rule
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SCENE 3: Coming Soon & Call To Action */}
      {/* ============================================================ */}
      {frame >= 240 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            transform: `scale(${ctaScale})`,
            opacity: ctaOpacity,
            zIndex: 10,
          }}
        >
          {/* Badge */}
          <div
            style={{
              padding: "8px 20px",
              borderRadius: 999,
              backgroundColor: "rgba(197, 155, 95, 0.14)",
              border: "1px solid rgba(197, 155, 95, 0.4)",
              color: "#E6C875",
              fontSize: 13,
              fontFamily: "'JetBrains Mono', monospace",
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              fontWeight: 700,
              marginBottom: 24,
            }}
          >
            Public Testnet Sandbox
          </div>

          <h2
            style={{
              fontSize: 76,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              margin: 0,
              color: "#FFFFFF",
              textShadow: "0 4px 30px rgba(0,0,0,0.6)",
            }}
          >
            Coming Soon.
          </h2>

          <p
            style={{
              fontSize: 22,
              color: "#94A3B8",
              maxWidth: 620,
              marginTop: 18,
              marginBottom: 32,
              lineHeight: 1.5,
              fontWeight: 500,
            }}
          >
            Zero-discretion programmatic escrow for Claude Desktop, Cursor &amp; FastMCP.
          </p>

          {/* URL Pill */}
          <div
            style={{
              padding: "14px 32px",
              borderRadius: 16,
              backgroundColor: "rgba(15, 23, 42, 0.8)",
              border: "1px solid rgba(197, 155, 95, 0.4)",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4), 0 0 25px rgba(197, 155, 95, 0.2)",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "#34D399",
                boxShadow: "0 0 8px #34D399",
              }}
            />
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 18,
                color: "#E6C875",
                letterSpacing: "0.08em",
                fontWeight: 700,
              }}
            >
              verisett-ai.vercel.app
            </span>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default VerisettPromo;
