import React from "react";
import { AbsoluteFill } from "remotion";
import action from "../data/ctf-action.json";

const R = "#ff4762",
  B = "#41caff",
  W = "#edf5ff",
  M = "#8398ac";
const ease = (x: number) => {
  x = Math.max(0, Math.min(1, x));
  return x * x * (3 - 2 * x);
};
const window = (t: number, a: number, b: number) =>
  ease((t - a) / 0.15) * (1 - ease((t - b + 0.18) / 0.18));
const mono = '"Cascadia Code", Consolas, monospace';

export function ctfCamera(from: number, time: number) {
  const s = action.shots.find((s) => s.from === from);
  if (!s) return { scale: 1, x: 960, y: 540 };
  const amount =
    ease((time - s.start) / (s.hold - s.start)) *
    (1 - ease((time - s.release) / (s.end - s.release)));
  // Bias the camera anchor down to keep the original bottom caption in frame.
  return { scale: 1 + (s.zoom - 1) * amount, x: s.x, y: Math.max(740, s.y) };
}

// Brief action inserts occupy the existing scene, before its main breakthrough.
// Original chapter timing and the 87.3–90 s submit/first-blood/rank sequence stay fixed.
export const CtfAction: React.FC<{ from: number; time: number }> = ({
  from,
  time: t,
}) => {
  const web = from === 10 && t >= 11 && t < 13.2;
  const crypto = from === 22 && t >= 22.7 && t < 24.7;
  const event = action.events.find((e) => t >= e.time && t < e.time + 0.56);
  const age = event ? t - event.time : 1;
  const hit = event?.kind === "deny" || event?.kind === "fracture";
  const color = hit ? R : B;
  return (
    <>
      {web && (
        <AbsoluteFill
          style={{
            background: "#02060c",
            opacity: window(t, 11, 13.2),
            fontFamily: mono,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 145,
              top: 235,
              color: M,
              fontSize: 17,
              letterSpacing: 4,
            }}
          >
            WEB / FIND ANOTHER WAY IN
          </div>
          <div
            style={{
              position: "absolute",
              left: 145,
              top: 280,
              color: W,
              fontSize: 43,
              fontWeight: 700,
              fontFamily: '"Noto Sans SC"',
            }}
          >
            {t < 12.5 ? "直入受阻。" : "换个入口，锁定对象。"}
          </div>
          <svg width="1920" height="1080" style={{ position: "absolute" }}>
            <path d="M290 520H1090" stroke="#244154" strokeWidth="3" />
            <path
              d="M660 520V735H1350"
              stroke={B}
              strokeWidth="3"
              fill="none"
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset={1 - ease((t - 12.5) / 0.5)}
            />
            <rect
              x="220"
              y="475"
              width="250"
              height="90"
              rx="6"
              fill="#081827"
              stroke={B}
            />
            <text x="345" y="530" fill={W} fontSize="24" textAnchor="middle">
              GET /admin
            </text>
            <rect
              x="1090"
              y="425"
              width="300"
              height="190"
              rx="6"
              fill="#1d0a14"
              stroke={R}
              strokeWidth="2"
            />
            <text x="1240" y="485" fill={M} fontSize="19" textAnchor="middle">
              ACCESS CONTROL
            </text>
            <text x="1240" y="555" fill={R} fontSize="52" textAnchor="middle">
              {t >= 11.8 ? "403" : "LOCKED"}
            </text>
            <path d="M1015 420V620" stroke={R} strokeWidth="5" />
            <rect
              x={
                t < 11.8
                  ? 470 + 525 * ease((t - 11.15) / 0.65)
                  : 995 - 150 * ease((t - 11.8) / 0.2)
              }
              y="513"
              width="25"
              height="14"
              fill={t < 11.8 ? B : R}
              opacity={t < 12.15 ? 1 : 0}
            />
            {t >= 11.8 && (
              <circle
                cx="1015"
                cy="520"
                r={20 + 120 * ease((t - 11.8) / 0.35)}
                fill="none"
                stroke={R}
                opacity={1 - ease((t - 11.8) / 0.4)}
              />
            )}
            <g opacity={ease((t - 12.5) / 0.15)}>
              <rect
                x="1085"
                y="690"
                width="500"
                height="90"
                rx="6"
                fill="#071d2a"
                stroke={B}
              />
              <text x="1335" y="745" fill={B} fontSize="27" textAnchor="middle">
                /api/notes/104 → 105
              </text>
            </g>
          </svg>
        </AbsoluteFill>
      )}
      {crypto && (
        <AbsoluteFill
          style={{
            background: "#02060c",
            opacity: window(t, 22.7, 24.7),
            fontFamily: mono,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 145,
              top: 235,
              color: M,
              fontSize: 17,
              letterSpacing: 4,
            }}
          >
            CRYPTO / SEARCH → ELIMINATE → FACTOR
          </div>
          <div
            style={{
              position: "absolute",
              left: 145,
              top: 285,
              color: W,
              fontSize: 43,
              fontWeight: 700,
              fontFamily: '"Noto Sans SC"',
            }}
          >
            排除错解，逼近因数。
          </div>
          <svg width="1920" height="1080" style={{ position: "absolute" }}>
            <circle
              cx="960"
              cy="570"
              r="180"
              fill="#07111e"
              stroke={t < 24.2 ? R : B}
              strokeWidth="3"
            />
            <text x="960" y="530" fill={M} fontSize="20" textAnchor="middle">
              MODULUS / n
            </text>
            <text x="960" y="630" fill={W} fontSize="92" textAnchor="middle">
              3233
            </text>
            {[
              ["47", 380],
              ["59", 1440],
            ].map(([n, x]) => (
              <g key={n} opacity={1 - ease((t - 24.2) / 0.3)}>
                <text
                  x={Number(x)}
                  y="585"
                  fill={R}
                  fontSize="63"
                  textAnchor="middle"
                >
                  {n}
                </text>
                <path
                  d={`M${Number(x) - 70} 605l140 -70`}
                  stroke={R}
                  strokeWidth="3"
                  opacity={ease((t - 23.5) / 0.12)}
                />
                <text
                  x={Number(x)}
                  y="660"
                  fill={M}
                  fontSize="18"
                  textAnchor="middle"
                >
                  REMAINDER ≠ 0
                </text>
              </g>
            ))}
            <text
              x="960"
              y="840"
              fill={B}
              fontSize="25"
              textAnchor="middle"
              opacity={ease((t - 24.2) / 0.12)}
            >
              FACTOR SEARCH / NARROWING…
            </text>
          </svg>
        </AbsoluteFill>
      )}
      {event && (
        <>
          <AbsoluteFill
            style={{
              pointerEvents: "none",
              boxShadow: `inset 0 0 120px ${35 * (1 - age / 0.56)}px ${color}35`,
              opacity: Math.exp(-age * 7),
            }}
          />
          {/* A short readable diagnostic, clear of the main diagram and chapter title. */}
          <div
            style={{
              position: "absolute",
              left: 100,
              top: 878,
              maxWidth: 1450,
              padding: "12px 20px",
              background: "#040911f5",
              borderLeft: `4px solid ${color}`,
              color,
              font: `bold 23px ${mono}`,
              letterSpacing: 2,
              opacity: window(t, event.time, event.time + 0.56),
              transform: `translateX(${-10 * (1 - ease(age / 0.12))}px)`,
            }}
          >
            {event.label}
          </div>
        </>
      )}
    </>
  );
};
