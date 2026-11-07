import React from "react";
import { useAttackColors } from "./AttackDirection";
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const sans = '"Noto Sans SC", "Microsoft YaHei", Arial, sans-serif';
const mono = 'Consolas, "Courier New", monospace';
const sat = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (v: number) => {
  const x = sat(v);
  return x * x * (3 - 2 * x);
};
const between = (t: number, a: number, b: number) => sat((t - a) / (b - a));

const Atmosphere: React.FC<{ t: number; intensity?: number }> = ({
  t,
  intensity = 1,
}) => {
  const C = useAttackColors();
  return (
    <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 68%,${C.blue}24 0%,${C.bg} 58%,#01040a 100%)`,
        }}
      />
      <svg
        width="1920"
        height="1080"
        style={{ position: "absolute", opacity: 0.36 * intensity }}
      >
        <defs>
          <linearGradient id="story-grid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={C.blue} stopOpacity="0" />
            <stop offset="1" stopColor={C.cyan} stopOpacity=".5" />
          </linearGradient>
        </defs>
        {Array.from({ length: 23 }, (_, i) => (
          <line
            key={`v${i}`}
            x1={960 + (i - 11) * 34}
            y1="500"
            x2={960 + (i - 11) * 230}
            y2="1080"
            stroke="url(#story-grid)"
            strokeWidth="1"
          />
        ))}
        {Array.from({ length: 13 }, (_, i) => {
          const y = 530 + Math.pow((i + ((t * 0.18) % 1)) / 12, 1.8) * 600;
          return (
            <line
              key={`h${i}`}
              x1="0"
              y1={y}
              x2="1920"
              y2={y}
              stroke={C.line}
              strokeWidth="1"
            />
          );
        })}
        {Array.from({ length: 72 }, (_, i) => {
          const x = (i * 283.19) % 1920;
          const y = (i * 173.81) % 1000;
          const glow = 0.14 + 0.3 * (0.5 + 0.5 * Math.sin(t * 0.48 + i));
          return (
            <circle
              key={`p${i}`}
              cx={x + Math.sin(t * 0.2 + i) * 12}
              cy={y - ((t * 1.2) % 90)}
              r={i % 9 === 0 ? 2 : 1}
              fill={C.cyan}
              opacity={glow}
            />
          );
        })}
      </svg>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          right: 0,
          height: 2,
          background: C.cyan,
          opacity: 0.06,
          transform: `translateY(${(t * 65) % 1080}px)`,
        }}
      />
      <AbsoluteFill
        style={{
          boxShadow: "inset 0 0 220px 60px #01040bd9",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

const Corner: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const C = useAttackColors();
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        fontFamily: mono,
        fontSize: 18,
        letterSpacing: 3,
        color: C.muted,
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          background: C.cyan,
          boxShadow: `0 0 15px ${C.cyan}`,
        }}
      />
      {children}
    </div>
  );
};
const Panel: React.FC<{
  style?: React.CSSProperties;
  children: React.ReactNode;
  title: string;
  accent?: string;
}> = ({ style, children, title, accent: requestedColor }) => {
  const C = useAttackColors();
  const accent = requestedColor ?? C.cyan;
  return (
    <div
      style={{
        position: "absolute",
        background: `linear-gradient(135deg,${C.blue}15,${C.bg}ed)`,
        border: `1px solid ${accent}44`,
        boxShadow: "0 24px 80px #0007",
        overflow: "hidden",
        ...style,
      }}
    >
      <div
        style={{
          height: 48,
          borderBottom: `1px solid ${accent}33`,
          display: "flex",
          alignItems: "center",
          padding: "0 24px",
          gap: 9,
          fontSize: 16,
          fontFamily: mono,
          letterSpacing: 2,
          color: C.muted,
        }}
      >
        <span style={{ height: 6, width: 6, background: accent }} />
        {title}
        <span style={{ marginLeft: "auto", fontSize: 12, color: accent }}>
          ● LIVE
        </span>
      </div>
      {children}
    </div>
  );
};

const ExecutionGraph: React.FC<{ t: number }> = ({ t }) => {
  const C = useAttackColors();
  // The path is 1110 SVG units long. Each node sits exactly on its route point;
  // a normalized pathLength keeps the traced line synchronized with node states.
  const progress = 485 / 1110 + (1 - 485 / 1110) * smooth((t - 12) / 3.3);
  const route = "M 70 85 H 250 V 170 H 470 V 85 H 685 V 170 H 925";
  const traceColor = t >= 12 ? C.cyan : C.red;
  const points = [
    { x: 70, y: 85, a: "INPUT", b: "buffer", at: 0 },
    { x: 250, y: 85, a: "CHECK", b: "offset", at: 180 / 1110 },
    { x: 470, y: 170, a: "RETURN", b: "saved rip", at: 485 / 1110 },
    { x: 685, y: 85, a: "TARGET", b: "verified", at: 785 / 1110 },
    { x: 925, y: 170, a: "OUTPUT", b: "flag", at: 1 },
  ];
  return (
    <svg
      width="1030"
      height="260"
      style={{ position: "absolute", left: 32, top: 67 }}
    >
      <defs>
        <filter id="exec-glow">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>
      <path d={route} stroke="#173e60" fill="none" strokeWidth="3" />
      <path
        d={route}
        pathLength={1}
        stroke={traceColor}
        fill="none"
        strokeWidth="11"
        strokeOpacity=".25"
        filter="url(#exec-glow)"
        strokeDasharray="1"
        strokeDashoffset={1 - progress}
      />
      <path
        d={route}
        pathLength={1}
        stroke={traceColor}
        fill="none"
        strokeWidth="3"
        strokeDasharray="1"
        strokeDashoffset={1 - progress}
      />
      {points.map((p) => (
        <g key={p.a}>
          <rect
            x={p.x - 40}
            y={p.y - 26}
            width="80"
            height="52"
            rx="4"
            fill="#071727"
            stroke={progress >= p.at ? C.cyan : C.line}
            strokeWidth="1.5"
          />
          <text
            x={p.x}
            y={p.y + 6}
            fill={progress >= p.at ? C.white : C.muted}
            fontFamily={mono}
            fontSize="14"
            textAnchor="middle"
          >
            {p.a}
          </text>
          <text
            x={p.x}
            y={p.y + 59}
            fill={C.muted}
            fontFamily={mono}
            fontSize="13"
            textAnchor="middle"
          >
            {p.b}
          </text>
          {progress >= p.at && (
            <circle cx={p.x + 36} cy={p.y - 22} r="3" fill={C.cyan} />
          )}
        </g>
      ))}
      {t < 12 && (
        <g opacity={0.5 + 0.2 * Math.sin(t * 3)}>
          <path
            d="M470 195 V235 H570"
            stroke={C.red}
            strokeDasharray="4 5"
            fill="none"
          />
          <text x="585" y="239" fill={C.red} fontFamily={mono} fontSize="16">
            BREAKPOINT HIT
          </text>
        </g>
      )}
    </svg>
  );
};

export const FinaleScene: React.FC = () => {
  const C = useAttackColors();
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const remaining = Math.max(0, 26 - Math.floor(t));
  const passed = t >= 24.3;
  const checking = t >= 23.3 && !passed;
  const found = t >= 15.3;
  const flag = "flag{test}";
  const subtitle =
    t < 6
      ? "还有一道。"
      : t < 12
        ? "再验证一次。"
        : t < 18
          ? "线索，终于连通。"
          : t < 23.3
            ? "答案，就在这里。"
            : "";
  const code = [
    "// final validation",
    "const offset = 72;",
    "const target = resolve(symbol);",
    "assert(stack.alignment === 16);",
    "const payload = compose(offset, target);",
    "await challenge.send(payload);",
    found
      ? "// target reached · output verified"
      : "// breakpoint: validate address",
  ];
  return (
    <AbsoluteFill
      style={{ fontFamily: sans, color: C.white, overflow: "hidden" }}
    >
      <Atmosphere t={t + 64} />
      <div style={{ position: "absolute", left: 90, top: 65 }}>
        <Corner>FINAL CHALLENGE / PWN</Corner>
        <div
          style={{
            fontSize: 43,
            fontWeight: 700,
            marginTop: 18,
            letterSpacing: 3,
          }}
        >
          最后一次提交
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 745,
          top: 57,
          width: 430,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: mono,
            fontSize: 15,
            letterSpacing: 5,
            color: C.red,
            marginBottom: 6,
          }}
        >
          CONTEST ENDS IN
        </div>
        <div
          style={{
            fontFamily: mono,
            fontSize: 76,
            letterSpacing: 3,
            lineHeight: 1.1,
            color: passed ? C.green : C.white,
            textShadow: `0 0 ${20 + Math.sin(t * 5) * 5}px ${passed ? "#45efb744" : "#ff326644"}`,
          }}
        >
          00:00:{String(remaining).padStart(2, "0")}
        </div>
        <div style={{ height: 2, background: "#ff4e7229", marginTop: 17 }}>
          <div
            style={{
              height: "100%",
              width: `${(remaining / 26) * 100}%`,
              background: C.red,
              boxShadow: `0 0 14px ${C.red}`,
            }}
          />
        </div>
      </div>
      <div
        style={{ position: "absolute", right: 88, top: 82, textAlign: "right" }}
      >
        <div
          style={{
            fontFamily: mono,
            fontSize: 15,
            color: C.muted,
            letterSpacing: 4,
            marginBottom: 13,
          }}
        >
          TEAM / CONNECTED
        </div>
        <div style={{ fontSize: 27, letterSpacing: 2, whiteSpace: "nowrap" }}>
          鑫启网安俱乐部
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
          filter: passed ? "blur(3px)" : "none",
          opacity: passed ? 0.23 : 1,
        }}
      >
        <Panel
          title="RUNTIME / EXECUTION TRACE"
          style={{ left: 88, top: 230, width: 1110, height: 625 }}
        >
          <ExecutionGraph t={t} />
          <div
            style={{
              position: "absolute",
              left: 38,
              top: 342,
              width: 690,
              fontFamily: mono,
              fontSize: 24,
              lineHeight: 1.65,
            }}
          >
            {code.map((s, i) => (
              <div
                key={i}
                style={{
                  color:
                    i === 6
                      ? found
                        ? C.green
                        : C.red
                      : i === 3
                        ? C.cyan
                        : i === 0
                          ? C.muted
                          : C.white,
                  opacity: i < 2 || t > i * 0.6 ? 1 : 0.25,
                  background:
                    i === 3 && t > 6 && t < 12 ? "#1766ff20" : "transparent",
                }}
              >
                <span
                  style={{ color: "#31516e", marginRight: 25, fontSize: 19 }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                {s}
              </div>
            ))}
          </div>
          <div
            style={{
              position: "absolute",
              right: 26,
              top: 347,
              width: 286,
              borderLeft: `1px solid ${C.line}`,
              paddingLeft: 24,
              fontFamily: mono,
              fontSize: 19,
              lineHeight: 2,
            }}
          >
            <div
              style={{
                fontSize: 13,
                letterSpacing: 3,
                color: C.muted,
                marginBottom: 9,
              }}
            >
              REGISTERS / VERIFIED
            </div>
            <div style={{ color: C.cyan }}>
              RIP <span style={{ color: C.white }}>0x004012b6</span>
            </div>
            <div>
              RSP <span style={{ color: C.muted }}>0x7fff…e940</span>
            </div>
            <div>
              RBP <span style={{ color: C.muted }}>0x7fff…e990</span>
            </div>
            <div style={{ color: t >= 9 ? C.green : C.red }}>
              ALIGNMENT {t >= 9 ? "✓ 16" : "…"}
            </div>
            <div style={{ fontSize: 14, color: C.muted, marginTop: 20 }}>
              state:{" "}
              {found
                ? "TARGET_REACHED"
                : t >= 6
                  ? "REVALIDATING"
                  : "BREAKPOINT"}
            </div>
          </div>
        </Panel>
        <Panel
          title="CHALLENGE STATUS"
          style={{ left: 1230, top: 230, width: 600, height: 375 }}
        >
          {["WEB", "CRYPTO", "REVERSE", "MISC", "PWN"].map((x, i) => (
            <div
              key={x}
              style={{
                height: 60,
                display: "flex",
                alignItems: "center",
                borderBottom: `1px solid ${C.line}66`,
                padding: "0 25px",
                fontFamily: mono,
                fontSize: 23,
              }}
            >
              <span style={{ color: C.muted, fontSize: 15, marginRight: 20 }}>
                0{i + 1}
              </span>
              <span>{x}</span>
              <span
                style={{
                  marginLeft: "auto",
                  color: i === 4 ? C.red : C.green,
                  fontSize: 16,
                  letterSpacing: 2,
                }}
              >
                {i === 4 ? "IN PROGRESS" : "✓ SOLVED"}
              </span>
            </div>
          ))}
        </Panel>
        <Panel
          title="TEAM CHANNEL / LIVE"
          style={{ left: 1230, top: 637, width: 600, height: 218 }}
        >
          <div style={{ padding: "23px 27px", fontSize: 24, lineHeight: 1.8 }}>
            <div
              style={{
                color: C.cyan,
                fontFamily: mono,
                fontSize: 14,
                letterSpacing: 3,
              }}
            >
              ANALYST → TEAM
            </div>
            <div>
              {t < 6
                ? "偏移已确认。"
                : t < 12
                  ? "地址一致，再验证一次。"
                  : t < 18
                    ? "执行路径已到达目标。"
                    : "完整复制，准备提交。"}
            </div>
            <div
              style={{
                fontFamily: mono,
                fontSize: 15,
                color: C.muted,
                marginTop: 8,
              }}
            >
              evidence / shared / verified
            </div>
          </div>
        </Panel>
      </div>
      {found && !passed && (
        <div
          style={{
            position: "absolute",
            left: 165,
            top: 724 - 64 * smooth((t - 17.6) / 0.4),
            width: 1590,
            background: "#061b2cf5",
            border: `1px solid ${C.cyan}99`,
            boxShadow: "0 0 65px #007cff30",
            padding: "22px 30px",
            transform: `translateY(${20 * (1 - smooth((t - 15.3) / 0.35))}px)`,
            opacity: smooth((t - 15.3) / 0.25),
          }}
        >
          <div
            style={{
              fontFamily: mono,
              color: C.cyan,
              fontSize: 14,
              letterSpacing: 4,
              marginBottom: 13,
            }}
          >
            {t < 18 ? "TARGET OUTPUT / VERIFIED" : "SUBMIT FLAG / PWN"}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
            <div
              style={{
                fontFamily: mono,
                fontSize: 48,
                color: C.white,
                background: t >= 18 && t < 19 ? "#1266ff66" : "transparent",
                padding: "5px 12px",
                flex: 1,
              }}
            >
              {flag}
            </div>
            {t >= 18 && (
              <div
                style={{
                  padding: "17px 35px",
                  fontFamily: mono,
                  fontSize: 25,
                  border: `1px solid ${checking ? C.muted : C.cyan}`,
                  background: checking ? "#15283d" : "#076aa5",
                  color: C.white,
                  boxShadow:
                    !checking && t > 22 ? "0 0 25px #24d9ff55" : "none",
                }}
              >
                {checking ? "Checking…" : "SUBMIT →"}
              </div>
            )}
          </div>
          {t >= 18 && (
            <div style={{ height: 3, marginTop: 15, background: "#0d3554" }}>
              <div
                style={{
                  width: `${between(t, 18, 21) * 100}%`,
                  height: "100%",
                  background: C.cyan,
                }}
              />
            </div>
          )}
        </div>
      )}
      {!passed && (
        <div
          style={{
            position: "absolute",
            top: 930,
            width: "100%",
            textAlign: "center",
            fontSize: 36,
            fontWeight: 500,
            letterSpacing: 5,
            color: C.white,
            opacity: checking ? 0.5 : 1,
          }}
        >
          {checking ? "" : subtitle}
        </div>
      )}
      {passed && (
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(ellipse at 50% 44%,#123b3559,transparent 65%)",
            opacity: smooth((t - 24.3) / 0.12),
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 294,
              width: "100%",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: mono,
                fontSize: 17,
                letterSpacing: 9,
                color: C.green,
                marginBottom: 21,
              }}
            >
              FLAG VERIFIED / CHALLENGE COMPLETE
            </div>
            <div
              style={{
                fontFamily: mono,
                fontWeight: 800,
                fontSize: 164,
                letterSpacing: 8,
                lineHeight: 1.1,
                color: C.green,
                textShadow: "0 0 24px #55f0b466,0 0 80px #16bf8144",
                transform: `scale(${1 + 0.08 * (1 - smooth((t - 24.3) / 0.35))})`,
              }}
            >
              CORRECT
            </div>
            <div style={{ fontSize: 36, letterSpacing: 10, marginTop: 20 }}>
              Flag 验证通过
            </div>
          </div>
          {t >= 24.8 && (
            <div
              style={{
                position: "absolute",
                top: 620,
                width: "100%",
                textAlign: "center",
                fontFamily: mono,
                color: "#ffdc85",
                fontSize: 29,
                letterSpacing: 10,
                opacity: smooth((t - 24.8) / 0.15),
              }}
            >
              FIRST BLOOD
            </div>
          )}
          {t >= 25 && (
            <div
              style={{
                position: "absolute",
                top: 732,
                left: 445,
                width: 1030,
                padding: "22px 28px",
                background: "#092536eF",
                border: `1px solid ${C.cyan}66`,
                display: "flex",
                alignItems: "center",
                gap: 28,
                transform: `translateY(${50 * (1 - smooth((t - 25) / 0.5))}px)`,
                opacity: smooth((t - 25) / 0.2),
              }}
            >
              <span style={{ fontFamily: mono, color: C.cyan, fontSize: 38 }}>
                ↑ 01
              </span>
              <span style={{ fontSize: 35, whiteSpace: "nowrap" }}>
                鑫启网安俱乐部
              </span>
              <span
                style={{
                  marginLeft: "auto",
                  fontFamily: mono,
                  color: C.green,
                  fontSize: 30,
                }}
              >
                850 PTS
              </span>
            </div>
          )}
        </AbsoluteFill>
      )}
      <AbsoluteFill
        style={{
          background: "#dfffee",
          opacity: Math.max(0, 1 - (t - 24.3) / 0.14) * (t >= 24.3 ? 0.38 : 0),
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

export const OutroScene: React.FC = () => {
  const C = useAttackColors();
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const converge = smooth(t / 2.8);
  const settled = smooth((t - 2.3) / 0.8);
  const typeIn = smooth((t - 3) / 0.65);
  const origins = [
    { x: 0, y: 170 },
    { x: 1920, y: 150 },
    { x: 0, y: 940 },
    { x: 1920, y: 900 },
    { x: 960, y: 1080 },
  ];
  return (
    <AbsoluteFill
      style={{ fontFamily: sans, color: C.white, overflow: "hidden" }}
    >
      <Atmosphere t={t + 140} intensity={0.5} />
      <svg
        width="1920"
        height="1080"
        style={{ position: "absolute", opacity: 1 - settled }}
      >
        <defs>
          <filter id="outro-line-glow">
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>
        {origins.map((p, i) => {
          const x = p.x + (960 - p.x) * converge;
          const y = p.y + (290 - p.y) * converge;
          const route = `M${p.x} ${p.y} Q${(p.x + 960) / 2} ${p.y - 100} ${x} ${y}`;
          return (
            <g key={i}>
              <path
                d={route}
                stroke={C.cyan}
                fill="none"
                strokeWidth="12"
                opacity=".14"
                filter="url(#outro-line-glow)"
              />
              <path
                d={route}
                stroke={i % 2 ? "#42c9ff" : "#ff4762"}
                fill="none"
                strokeWidth="2"
              />
              <circle cx={x} cy={y} r="6" fill={C.white} />
              {Array.from({ length: 7 }, (_, j) => {
                const q = sat(converge - j * 0.045);
                return (
                  <rect
                    key={j}
                    x={p.x + (960 - p.x) * q - 3}
                    y={p.y + (290 - p.y) * q - 3}
                    width="6"
                    height="6"
                    fill={C.cyan}
                    opacity={1 - j * 0.12}
                  />
                );
              })}
            </g>
          );
        })}
      </svg>
      <div
        style={{
          position: "absolute",
          left: 680,
          top: 8,
          width: 560,
          height: 560,
          background: "radial-gradient(circle,#1463ff27,transparent 65%)",
          opacity: settled,
        }}
      />
      <Img
        src={staticFile("logo.svg")}
        style={{
          position: "absolute",
          left: 830,
          top: 160,
          width: 260,
          height: 260,
          objectFit: "contain",
          opacity: smooth((t - 1.8) / 1),
          transform: `scale(${0.78 + 0.22 * settled})`,
          filter: "drop-shadow(0 0 35px #138aff55)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 454,
          width: "100%",
          textAlign: "center",
          opacity: typeIn,
          transform: `translateY(${18 * (1 - typeIn)}px)`,
        }}
      >
        <div
          style={{
            fontSize: 27,
            letterSpacing: 14,
            color: C.muted,
            marginBottom: 23,
          }}
        >
          宁夏大学
        </div>
        <div
          style={{
            fontSize: 76,
            fontWeight: 700,
            letterSpacing: 6,
            whiteSpace: "nowrap",
            lineHeight: 1.3,
            textShadow: "0 0 35px #2180e32b",
          }}
        >
          鑫启网安俱乐部
        </div>
        <div
          style={{
            margin: "36px auto 0",
            width: 84,
            height: 2,
            background: C.cyan,
            boxShadow: `0 0 18px ${C.cyan}`,
          }}
        />
        <div
          style={{
            fontSize: 39,
            letterSpacing: 7,
            marginTop: 31,
            color: C.white,
          }}
        >
          见微知隙，破阵无声。
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          right: 132,
          top: 650,
          opacity: smooth((t - 4.7) / 0.3),
        }}
      >
        <div
          style={{
            background: "#fff",
            padding: 14,
            boxShadow: "0 0 45px #116bff20",
          }}
        >
          <Img
            src={staticFile("club-qr.png")}
            style={{
              display: "block",
              width: 210,
              height: 210,
              imageRendering: "pixelated",
            }}
          />
        </div>
        <div
          style={{
            textAlign: "center",
            fontSize: 18,
            letterSpacing: 3,
            color: C.muted,
            marginTop: 18,
          }}
        >
          了解我们 · 加入方式
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 110,
          bottom: 83,
          opacity: smooth((t - 4.5) / 0.5),
        }}
      >
        <Corner>CTF / RED TEAM / BLUE TEAM</Corner>
      </div>
      <div
        style={{
          position: "absolute",
          left: 110,
          bottom: 55,
          fontFamily: mono,
          fontSize: 13,
          letterSpacing: 3,
          color: "#385873",
          opacity: smooth((t - 4.5) / 0.5),
        }}
      >
        CURIOSITY / COLLABORATION / DISCOVERY
      </div>
      <div
        style={{
          position: "absolute",
          top: 935,
          width: 1000,
          left: 460,
          height: 1,
          background: "linear-gradient(90deg,transparent,#1d4868,transparent)",
          opacity: typeIn,
        }}
      />
    </AbsoluteFill>
  );
};
