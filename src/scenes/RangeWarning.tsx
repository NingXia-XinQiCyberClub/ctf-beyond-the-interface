import React from "react";
import { AbsoluteFill } from "remotion";
import warnings from "../data/range-warnings.json";
const sat = (x: number) => Math.max(0, Math.min(1, x));
export function rangeImpact(time: number) {
  const e = warnings.events.find((e) => time >= e.time && time < e.time + 0.34);
  if (!e) return { x: 0, y: 0 };
  const age = time - e.time,
    envelope = (1 - age / 0.34) ** 2;
  return {
    x: Math.sin(age * 92) * e.strength * envelope,
    y: Math.sin(age * 121) * e.strength * 0.52 * envelope,
  };
}
export const RangeWarning: React.FC<{ time: number }> = ({ time }) => {
  const e = warnings.events.find(
    (e) => time >= e.time && time < e.time + warnings.duration,
  );
  if (!e) return null;
  const age = time - e.time,
    alpha = sat(age / 0.1) * sat((warnings.duration - age) / 0.2);
  const pulse = warnings.beeps.some((at) => age >= at && age < at + 0.09);
  const accent = e.team === "blue" ? "#ffbd58" : "#ff4762";
  return (
    <>
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          boxShadow: `inset 0 0 100px ${pulse ? 25 : 8}px ${accent}${pulse ? "23" : "08"}`,
          opacity: alpha,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 620,
          top: 265,
          width: 520,
          padding: "18px 24px",
          background: "#120b12f5",
          border: `1px solid ${accent}`,
          borderLeft: `5px solid ${accent}`,
          boxShadow: `0 10px 45px #0009,0 0 ${pulse ? 35 : 12}px ${accent}20`,
          opacity: alpha,
          transform: `translateY(${(1 - alpha) * -8}px)`,
          color: "#edf5ff",
          fontFamily: '"Cascadia Code",Consolas,monospace',
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 14,
            alignItems: "center",
            color: accent,
            fontSize: 25,
            fontWeight: 700,
            letterSpacing: 4,
          }}
        >
          <svg width="29" height="27" viewBox="0 0 30 28">
            <path
              d="M15 2L28 25H2Z"
              fill="none"
              stroke={accent}
              strokeWidth="2"
            />
            <path d="M15 9v7m0 3v2" stroke={accent} strokeWidth="2" />
          </svg>
          WARNING{" "}
          <span
            style={{
              marginLeft: "auto",
              width: 7,
              height: 7,
              borderRadius: 4,
              background: accent,
              opacity: pulse ? 1 : 0.3,
            }}
          />
        </div>
        <div style={{ marginTop: 10, fontSize: 18, letterSpacing: 2 }}>
          {e.title}
        </div>
        <div
          style={{
            marginTop: 9,
            fontSize: 18,
            color: "#b6becb",
            fontFamily: '"Noto Sans SC"',
          }}
        >
          {e.detail}
        </div>
      </div>
    </>
  );
};
