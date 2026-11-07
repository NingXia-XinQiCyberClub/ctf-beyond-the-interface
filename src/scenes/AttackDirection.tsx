import React, { createContext, useContext } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import cues from "../data/attack-cues.json";

const sat = (n: number) => Math.max(0, Math.min(1, n));
const smooth = (n: number) => {
  const p = sat(n);
  return p * p * (3 - 2 * p);
};
const mix = (a: string, b: string, amount: number) => {
  const rgb = [1, 3, 5].map((i) =>
    Math.round(
      parseInt(a.slice(i, i + 2), 16) * (1 - amount) +
        parseInt(b.slice(i, i + 2), 16) * amount,
    ),
  );
  return "#" + rgb.map((n) => n.toString(16).padStart(2, "0")).join("");
};
const cold = {
  bg: "#02060c",
  ink: "#edf7ff",
  white: "#edf7ff",
  muted: "#8da5b8",
  blue: "#287aff",
  cyan: "#32d8ff",
  line: "#1a3b50",
  red: "#ff3852",
  green: "#61edbf",
  gold: "#ffce77",
};
const hot = {
  ...cold,
  bg: "#0b0307",
  blue: "#f02645",
  cyan: "#ff5363",
  line: "#59202c",
  muted: "#bd99a5",
};
const SignalContext = createContext(cold);
export const useAttackColors = () => useContext(SignalContext);

export function attackHeat(time: number) {
  const phases = [
    [0, 2.8, 0],
    [2.8, 6, 0.45],
    [6, 10, 0.7],
    [10, 20.8, 0],
    [20.8, 27.6, 1],
    [27.6, 32, 0.45],
    [32, 40, 0.05],
    [40, 49.2, 0.95],
    [49.2, 52, 0.45],
    [52, 64.4, 0.1],
    [64.4, 69.6, 0.95],
    [69.6, 74, 0.45],
    [74, 80.8, 0.15],
    [80.8, 86.8, 1],
    [86.8, 88, 0.3],
    [88, 96, 1],
    [96, 100.8, 0],
    [100.8, 110.4, 0.65],
    [110.4, 114, 0.3],
    [114, 126, 0.3],
    [126, 135.6, 0.9],
    [135.6, 138.3, 0.35],
    [138.3, 150, 0],
  ];
  const index = phases.findIndex(([a, b]) => time >= a && time < b);
  if (index < 0) return 0;
  const [start, , target] = phases[index];
  const previous = index > 0 ? phases[index - 1][2] : 0;
  return previous + (target - previous) * smooth((time - start) / 0.38);
}

// Shared cue data is also consumed by the audio generator. No wall-clock animation.
export const AttackStage: React.FC<{
  from: number;
  children: React.ReactNode;
}> = ({ from, children }) => {
  const frame = useCurrentFrame();
  const local = frame / cues.fps;
  const time = from + local;
  const heat = attackHeat(time);
  const palette = Object.fromEntries(
    Object.entries(cold).map(([key, value]) => {
      // Keep the intermediate hue luminous instead of averaging cyan/red to gray.
      const middle =
        key === "cyan" ? "#9b65ff" : key === "blue" ? "#8640ff" : undefined;
      return [
        key,
        middle
          ? heat < 0.5
            ? mix(value, middle, heat * 2)
            : mix(middle, hot[key as keyof typeof hot], (heat - 0.5) * 2)
          : mix(value, hot[key as keyof typeof hot], heat),
      ];
    }),
  ) as typeof cold;
  const beat = Math.exp(-((frame % 12) / 12) * 7);
  const event = [...cues.events]
    .reverse()
    .find(
      (cue) => time >= cue.time && time < cue.time + 0.55 && cue.time < 114,
    );
  const age = event ? time - event.time : 10;
  const hit = event ? Math.exp(-age * 12) * event.power : 0;
  const active = time >= 2.8 && time < 135.6;
  const stage = heat > 0.6 ? "EXPLOIT / EXECUTE" : "RECON / LOCK ON";
  const impulse = event && age < 0.18 ? (1 - age / 0.18) * 3 : 0;
  return (
    <SignalContext.Provider value={palette}>
      <AbsoluteFill style={{ overflow: "hidden", background: palette.bg }}>
        <AbsoluteFill
          style={{
            transform: `translate(${Math.sin(frame * 2.7) * impulse}px,${Math.cos(frame * 1.9) * impulse * 0.5}px) scale(${1 + hit * 0.009})`,
          }}
        >
          {children}
        </AbsoluteFill>
        {active && (
          <>
            <AbsoluteFill
              style={{
                pointerEvents: "none",
                boxShadow: `inset 0 0 ${100 + beat * 30}px ${15 + hit * 22}px ${palette.blue}${Math.round(
                  10 + heat * 12 + hit * 40,
                )
                  .toString(16)
                  .padStart(2, "0")}`,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 80,
                right: 80,
                top: 171,
                display: "flex",
                gap: 16,
                alignItems: "center",
                fontFamily: "Consolas, monospace",
                fontSize: 12,
                letterSpacing: 2.5,
                color: palette.cyan,
              }}
            >
              <span
                style={{
                  width: 22 + beat * 45,
                  height: 3,
                  background: palette.cyan,
                }}
              />
              <span>{stage}</span>
              <span style={{ opacity: 0.5 }}>
                // {String(Math.floor(local / 0.4)).padStart(3, "0")}
              </span>
              <span style={{ marginLeft: "auto", opacity: 0.55 }}>
                CTF RANGE / SESSION 0x02
              </span>
            </div>
            <div
              style={{
                position: "absolute",
                left: 80,
                right: 80,
                top: 987,
                height: 26,
                display: "flex",
                alignItems: "center",
                gap: 7,
                color: palette.cyan,
                font: "12px Consolas, monospace",
                letterSpacing: 2,
              }}
            >
              {Array.from({ length: 32 }, (_, i) => (
                <i
                  key={i}
                  style={{
                    width: 3,
                    height:
                      3 +
                      ((i * 7 + Math.floor(frame / 3)) % 9) *
                        (0.6 + beat * 1.1),
                    background: palette.cyan,
                    opacity: 0.25 + (i % 5) * 0.12,
                  }}
                />
              ))}
              <span style={{ marginLeft: 12 }}>
                {heat > 0.6 ? "ATTACK VECTOR ACTIVE" : "TRACING ATTACK SURFACE"}
              </span>
              <span style={{ marginLeft: "auto", color: palette.muted }}>
                PACKET STREAM / SESSION LIVE
              </span>
            </div>
          </>
        )}
        {event && (
          <>
            <AbsoluteFill
              style={{
                background: `linear-gradient(115deg,${palette.cyan}20,transparent 55%)`,
                opacity: hit,
              }}
            />
            <svg
              width="1920"
              height="1080"
              style={{
                position: "absolute",
                opacity: hit * 0.6,
                pointerEvents: "none",
              }}
            >
              <path
                d="M45 260V220H400M1520 220H1875V260M45 820V860H400M1520 860H1875V820"
                fill="none"
                stroke={palette.cyan}
                strokeWidth={3}
              />
              {[0, 1, 2].map((i) => (
                <path
                  key={i}
                  d={`M0 ${300 + i * 210}H1920`}
                  stroke={palette.cyan}
                  strokeWidth={2}
                  strokeDasharray={`${60 + i * 80} 200`}
                  strokeDashoffset={frame * 19}
                />
              ))}
            </svg>
            <div
              style={{
                position: "absolute",
                left: 100,
                top: 211,
                color: palette.cyan,
                font: "bold 24px Consolas, monospace",
                letterSpacing: 5,
                opacity: sat((0.5 - age) / 0.18),
                background: "#05070de8",
                padding: "10px 18px",
                borderLeft: `4px solid ${palette.cyan}`,
                transform: `translateX(${hit * -12}px)`,
              }}
            >
              {event.label}
            </div>
          </>
        )}
      </AbsoluteFill>
    </SignalContext.Provider>
  );
};

export const AttackIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const C = useAttackColors();
  const locked = t >= 2.8;
  const reveal = smooth((t - 6) / 0.35);
  const mapOpacity = smooth(t / 0.6) * (1 - reveal);
  const nodes = Array.from({ length: 16 }, (_, i) => {
    const angle = i * 2.39996;
    const radius = 190 + (i % 4) * 85;
    return {
      x: 1060 + Math.cos(angle) * radius,
      y: 528 + Math.sin(angle) * radius * 0.82,
    };
  });
  const scan = (t * 125) % 360;
  return (
    <AbsoluteFill
      style={{
        background: "#02060c",
        color: "#edf7ff",
        fontFamily: '"Noto Sans SC", sans-serif',
      }}
    >
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 60% 50%,${C.blue}22,transparent 65%)`,
        }}
      />
      <svg
        width="1920"
        height="1080"
        style={{ position: "absolute", opacity: mapOpacity }}
      >
        <defs>
          <radialGradient id="target-glow">
            <stop stopColor={C.blue} stopOpacity=".23" />
            <stop offset="1" stopColor={C.bg} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="1060" cy="528" r="455" fill="url(#target-glow)" />
        {[190, 275, 360, 445].map((r) => (
          <circle
            key={r}
            cx="1060"
            cy="528"
            r={r}
            fill="none"
            stroke={C.line}
            strokeDasharray={r === 445 ? "2 12" : undefined}
          />
        ))}
        <path d="M1060 60V995M590 528H1530" stroke={C.line} />
        <path
          d="M1060 528V84"
          stroke={C.cyan}
          strokeOpacity=".65"
          transform={`rotate(${scan} 1060 528)`}
        />
        {nodes.map((node, i) => {
          const q = (t * (locked ? 1.8 : 0.8) + i * 0.13) % 1;
          const chosen = locked && i % 3 === 0;
          return (
            <g key={i} opacity={smooth((t - i * 0.08) / 0.35)}>
              <path
                d={`M${node.x} ${node.y}L1060 528`}
                stroke={chosen ? C.cyan : C.line}
                strokeWidth={chosen ? 2 : 1}
              />
              <rect
                x={node.x - 7}
                y={node.y - 7}
                width="14"
                height="14"
                fill={chosen ? C.cyan : "#071b2d"}
                stroke={C.cyan}
                transform={`rotate(45 ${node.x} ${node.y})`}
              />
              <circle
                cx={node.x + (1060 - node.x) * q}
                cy={node.y + (528 - node.y) * q}
                r={chosen ? 3 : 1.5}
                fill={C.cyan}
              />
              <text
                x={node.x + 18}
                y={node.y + 5}
                fill={chosen ? C.ink : "#5b7b94"}
                fontSize="13"
                fontFamily="Consolas, monospace"
              >
                {["HTTP", "RSA", "ELF", "STACK", "LSB"][i % 5]}:
                {[8080, 443, 31337, 9001][i % 4]}
              </text>
            </g>
          );
        })}
        <rect
          x="1002"
          y="470"
          width="116"
          height="116"
          rx="2"
          fill="#050a12"
          stroke={C.cyan}
          strokeWidth="2"
        />
        <path
          d={
            locked
              ? "M1040 520V495a21 21 0 0 1 42-2M1033 520h54v40h-54z"
              : "M1040 520V501a20 20 0 0 1 40 0v19M1033 520h54v40h-54z"
          }
          fill="none"
          stroke={C.cyan}
          strokeWidth="4"
        />
        {locked && (
          <text
            x="1060"
            y="637"
            textAnchor="middle"
            fontFamily="Consolas, monospace"
            fontSize="19"
            fill={C.cyan}
            letterSpacing="4"
          >
            TARGET LOCKED
          </text>
        )}
      </svg>
      <div
        style={{
          position: "absolute",
          left: 110,
          top: 265,
          width: 520,
          opacity: 1 - reveal,
        }}
      >
        <div
          style={{
            font: "15px Consolas, monospace",
            letterSpacing: 5,
            color: C.muted,
            marginBottom: 28,
          }}
        >
          OPERATOR / XINQI
        </div>
        <div style={{ font: "bold 45px Consolas, monospace", lineHeight: 1.3 }}>
          <span style={{ color: C.cyan }}>root@ctf</span>
          <br />
          ~# {"init --attack".slice(0, Math.floor(Math.max(0, t - 0.4) * 9))}
          <span style={{ opacity: frame % 24 < 15 ? 1 : 0 }}>_</span>
        </div>
        <div
          style={{
            marginTop: 40,
            font: "18px Consolas, monospace",
            lineHeight: 2.3,
            color: C.muted,
          }}
        >
          {[
            [0.8, "[+] enumerate attack surface"],
            [1.6, "[+] fingerprint services"],
            [2.8, "[!] weak boundary detected"],
            [4, "[+] arm five attack vectors"],
          ].map(([start, text]) => (
            <div
              key={String(start)}
              style={{
                opacity: t >= Number(start) ? 1 : 0,
                color: Number(start) >= 2.8 ? C.cyan : C.muted,
              }}
            >
              {String(text)}
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", inset: 0, opacity: reveal }}>
        <div
          style={{
            position: "absolute",
            top: 275,
            left: 120,
            font: "16px Consolas, monospace",
            color: C.cyan,
            letterSpacing: 8,
          }}
        >
          FIVE VECTORS / ONE FLAG
        </div>
        <div
          style={{
            position: "absolute",
            left: 110,
            top: 336,
            fontSize: 108,
            fontWeight: 700,
            letterSpacing: 12,
            lineHeight: 1.25,
          }}
        >
          表面之下<span style={{ color: C.cyan }}>。</span>
        </div>
        <div
          style={{
            position: "absolute",
            left: 120,
            top: 500,
            fontSize: 36,
            letterSpacing: 8,
            color: C.muted,
          }}
        >
          锁定边界，打开突破口。
        </div>
        <div
          style={{
            position: "absolute",
            left: 120,
            right: 120,
            top: 647,
            display: "flex",
            gap: 22,
          }}
        >
          {["WEB", "CRYPTO", "REVERSE", "PWN", "MISC"].map((label, i) => {
            const p = smooth((t - 6.4 - i * 0.4) / 0.2);
            return (
              <div
                key={label}
                style={{
                  flex: 1,
                  borderTop: `2px solid ${i === 0 ? C.cyan : C.line}`,
                  background: `linear-gradient(150deg,${C.blue}18,transparent)`,
                  padding: "22px 18px",
                  opacity: p,
                  transform: `translateY(${(1 - p) * 24}px)`,
                }}
              >
                <div
                  style={{
                    font: "13px Consolas, monospace",
                    color: C.muted,
                    letterSpacing: 3,
                  }}
                >
                  0{i + 1} / ARMED
                </div>
                <div
                  style={{
                    font: "bold 31px Consolas, monospace",
                    marginTop: 24,
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    marginTop: 14,
                    font: "12px Consolas, monospace",
                    color: C.cyan,
                  }}
                >
                  ATTACK VECTOR READY
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 110,
          top: 67,
          font: "16px Consolas, monospace",
          color: C.cyan,
          letterSpacing: 5,
        }}
      >
        BEYOND THE INTERFACE / 02
      </div>
      <div
        style={{
          position: "absolute",
          right: 110,
          top: 67,
          font: "14px Consolas, monospace",
          color: C.muted,
          letterSpacing: 3,
        }}
      >
        CTF OPERATION / XINQI
      </div>
    </AbsoluteFill>
  );
};

export const ExploitArtifacts: React.FC<{
  kind: "web" | "crypto" | "pwn";
  t: number;
}> = ({ kind, t }) => {
  const C = useAttackColors();
  const beat = Math.exp(-((Math.round(t * 30) % 12) / 12) * 7);
  if (kind === "web") {
    const alpha = smooth((t - 10.8) / 0.3) * (1 - smooth((t - 16.8) / 0.4));
    const split = smooth((t - 15.6) / 0.4);
    return (
      <svg
        width="1400"
        height="900"
        style={{ position: "absolute", opacity: alpha, pointerEvents: "none" }}
      >
        <path
          d={`M810 ${230 - split * 55}V440l-14 15 28 15-28 15 14 15V${730 + split * 55}`}
          stroke={C.cyan}
          strokeWidth="2"
          strokeDasharray="9 7"
          fill="none"
          opacity=".7"
        />
        <text
          x="820"
          y="245"
          fontSize="12"
          fill={C.cyan}
          fontFamily="Consolas, monospace"
          letterSpacing="3"
        >
          AUTH BOUNDARY
        </text>
        {Array.from({ length: 8 }, (_, i) => {
          const q = ((t - 10.8) * 0.7 + i / 8) % 1;
          return (
            <g key={i}>
              <path
                d={`M${780 + q * 360} 555h${12 + beat * 20}`}
                stroke={C.cyan}
                strokeWidth={2 + beat}
                opacity={0.3 + q * 0.5}
              />
              <path
                d={`M${800 + q * 360} 551l6 4-6 4`}
                stroke={C.cyan}
                fill="none"
              />
            </g>
          );
        })}
        {Array.from({ length: 9 }, (_, i) => (
          <rect
            key={i}
            x={803 + (i % 2 ? -1 : 1) * split * (25 + i * 8)}
            y={430 + i * 10 - split * (i - 4) * 20}
            width="5"
            height="8"
            fill={C.cyan}
            opacity={1 - split * 0.8}
          />
        ))}
      </svg>
    );
  }
  if (kind === "crypto") {
    const split = smooth((t - 8) / 0.4);
    const alpha = smooth((t - 7.6) / 0.3) * (1 - smooth((t - 12) / 0.4));
    return (
      <svg
        width="1380"
        height="900"
        style={{ position: "absolute", opacity: alpha, pointerEvents: "none" }}
      >
        {Array.from({ length: 16 }, (_, i) => {
          const a = (i / 16) * Math.PI * 2;
          const r = 238 + split * (15 + (i % 3) * 8) + beat * 3;
          const x = 690 + Math.cos(a) * r,
            y = 475 + Math.sin(a) * r;
          return (
            <path
              key={i}
              d={`M${x - Math.sin(a) * 16} ${y + Math.cos(a) * 16}l${Math.sin(a) * 32} ${-Math.cos(a) * 32}`}
              stroke={C.cyan}
              strokeWidth={i % 4 ? 2 : 4}
            />
          );
        })}
        <text
          x="690"
          y="785"
          textAnchor="middle"
          fill={C.cyan}
          fontSize="17"
          letterSpacing="4"
          fontFamily="Consolas, monospace"
        >
          WEAK MODULUS / KEY SPACE COMPROMISED
        </text>
      </svg>
    );
  }
  const alpha = smooth((t - 14) / 0.25) * (1 - smooth((t - 21) / 0.4));
  return (
    <svg
      width="1400"
      height="900"
      style={{ position: "absolute", opacity: alpha, pointerEvents: "none" }}
    >
      <rect
        x="124"
        y="729"
        width="669"
        height="56"
        fill={`${C.cyan}12`}
        stroke={C.cyan}
        strokeWidth={2 + beat}
      />
      <path
        d="M780 752H850V548H1297"
        stroke={C.cyan}
        strokeWidth="2"
        strokeDasharray="6 6"
        strokeDashoffset={-t * 110}
        fill="none"
      />
      <text
        x="925"
        y="560"
        fontSize="13"
        fill={C.cyan}
        fontFamily="Consolas, monospace"
        letterSpacing="2"
      >
        RETURN ADDRESS / CONTROLLED
      </text>
      <rect
        x={130 + (((t - 14) * 280) % 650)}
        y="731"
        width="4"
        height="52"
        fill={C.cyan}
        opacity=".85"
      />
    </svg>
  );
};
