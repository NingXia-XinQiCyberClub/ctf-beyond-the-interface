import React from "react";
import { useAttackColors, ExploitArtifacts } from "./AttackDirection";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

// All animation is a pure function of the local frame. No live browser clocks,
// random generators, network requests or external assets are used.

const SANS = '"Noto Sans SC", "Microsoft YaHei", sans-serif';
const MONO = '"Cascadia Code", Consolas, monospace';
const clamp = (v: number) => Math.min(1, Math.max(0, v));
const p = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const ease = (v: number) => {
  const x = clamp(v);
  return x * x * (3 - 2 * x);
};
const lerp = (a: number, b: number, v: number) => a + (b - a) * v;
const appear = (t: number, a: number, d = 0.5) => ease(p(t, a, a + d));
const windowAlpha = (t: number, a: number, b: number) =>
  appear(t, a) * (1 - ease(p(t, b - 0.45, b)));
const pulse = (t: number, speed = 2) => 0.5 + 0.5 * Math.sin(t * speed);
const textSlice = (s: string, t: number, start: number, rate = 26) =>
  s.slice(0, Math.max(0, Math.floor((t - start) * rate)));

const Glow: React.FC<{
  color?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ color: requestedColor, children, style }) => {
  const C = useAttackColors();
  const color = requestedColor ?? C.cyan;
  return (
    <span style={{ color, textShadow: `0 0 20px ${color}66`, ...style }}>
      {children}
    </span>
  );
};

const Backdrop: React.FC<{ t: number; accent?: string }> = ({
  t,
  accent: requestedColor,
}) => {
  const C = useAttackColors();
  const accent = requestedColor ?? C.blue;
  return (
    <AbsoluteFill
      style={{
        background: C.bg,
        overflow: "hidden",
        fontFamily: SANS,
        color: C.ink,
      }}
    >
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at ${38 + Math.sin(t * 0.12) * 5}% 44%, ${accent}26, transparent 56%), radial-gradient(ellipse at 82% 12%, #07487955, transparent 47%)`,
        }}
      />
      <AbsoluteFill
        style={{
          opacity: 0.19,
          backgroundImage:
            "linear-gradient(#234664 1px,transparent 1px),linear-gradient(90deg,#234664 1px,transparent 1px)",
          backgroundSize: "80px 80px",
          transform: `perspective(950px) rotateX(61deg) scale(1.5) translateY(${120 + t * 2}px)`,
          transformOrigin: "center bottom",
        }}
      />
      <svg
        width="1920"
        height="1080"
        style={{ position: "absolute", inset: 0, opacity: 0.26 }}
      >
        {Array.from({ length: 34 }, (_, i) => {
          const x = (i * 419 + 137) % 1920;
          const y = (i * 233 + 47) % 1080;
          return (
            <g key={i} opacity={0.25 + 0.45 * pulse(t * 0.5 + i)}>
              <circle cx={x} cy={y} r={i % 5 === 0 ? 2.1 : 1} fill={C.cyan} />
              <path
                d={`M${x - 7},${y}h14M${x},${y - 7}v14`}
                stroke={C.blue}
                strokeWidth={0.5}
              />
            </g>
          );
        })}
        <path d="M64 196H1856 M64 970H1856" stroke={C.line} />
        <path
          d="M64 196v22M1856 196v22M64 948v22M1856 948v22"
          stroke={C.cyan}
          strokeWidth="2"
        />
      </svg>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg,#01040c44 0%,transparent 28%,transparent 65%,#01040c99 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 64,
          bottom: 38,
          color: "#486276",
          fontSize: 14,
          fontFamily: MONO,
          letterSpacing: 3,
        }}
      >
        CTF / CHALLENGE ENVIRONMENT
      </div>
      <div
        style={{
          position: "absolute",
          right: 64,
          bottom: 38,
          color: "#486276",
          fontSize: 14,
          fontFamily: MONO,
          letterSpacing: 3,
        }}
      >
        RECON · EXPLOIT · CAPTURE
      </div>
    </AbsoluteFill>
  );
};

const Header: React.FC<{
  n: string;
  title: string;
  sub: string;
  t: number;
  status?: string;
}> = ({ n, title, sub, t, status = "ATTACK VECTOR ACTIVE" }) => {
  const C = useAttackColors();
  return (
    <div
      style={{
        position: "absolute",
        left: 78,
        top: 59,
        right: 78,
        display: "flex",
        alignItems: "center",
        opacity: appear(t, 0, 0.6),
        transform: `translateY(${(1 - appear(t, 0, 0.6)) * 12}px)`,
      }}
    >
      <div
        style={{
          fontFamily: MONO,
          color: C.cyan,
          fontSize: 22,
          letterSpacing: 4,
          marginRight: 28,
        }}
      >
        {n}
      </div>
      <div>
        <div
          style={{
            fontSize: 43,
            fontWeight: 650,
            letterSpacing: 2,
            lineHeight: 1.2,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 15,
            fontFamily: MONO,
            color: C.muted,
            letterSpacing: 4,
            marginTop: 10,
          }}
        >
          {sub}
        </div>
      </div>
      <div
        style={{
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontFamily: MONO,
          color: C.muted,
          fontSize: 14,
          letterSpacing: 2,
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: C.cyan,
            boxShadow: `0 0 14px ${C.cyan}`,
            opacity: 0.4 + 0.6 * pulse(t * 3),
          }}
        />
        {status}
      </div>
    </div>
  );
};

const Caption: React.FC<{
  text: string;
  t: number;
  start?: number;
  end?: number;
}> = ({ text, t, start = 4, end = 100 }) => {
  const C = useAttackColors();
  return (
    <div
      style={{
        position: "absolute",
        bottom: 118,
        left: 80,
        right: 80,
        textAlign: "center",
        fontFamily: SANS,
        opacity: windowAlpha(t, start, end),
        transform: `translateY(${(1 - appear(t, start)) * 12}px)`,
      }}
    >
      <div style={{ display: "inline-flex", gap: 22, alignItems: "center" }}>
        <span style={{ width: 40, height: 1, background: C.blue }} />
        <span
          style={{
            fontSize: 28,
            letterSpacing: 4,
            fontWeight: 500,
            textShadow: "0 2px 20px #000",
          }}
        >
          {text}
        </span>
        <span style={{ width: 40, height: 1, background: C.blue }} />
      </div>
    </div>
  );
};

const Panel: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  tag?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  accent?: string;
}> = ({
  x,
  y,
  w,
  h,
  title,
  tag = "LIVE",
  children,
  style,
  accent: requestedColor,
}) => {
  const C = useAttackColors();
  const accent = requestedColor ?? C.cyan;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        background: `linear-gradient(135deg,${C.blue}18,${C.bg}f5)`,
        border: `1px solid ${C.line}`,
        boxShadow: "0 18px 75px #0008,inset 0 1px 0 #70baff0c",
        borderRadius: 8,
        overflow: "hidden",
        ...style,
      }}
    >
      <div
        style={{
          height: 42,
          borderBottom: `1px solid ${C.line}`,
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          fontFamily: MONO,
          fontSize: 13,
          letterSpacing: 1.4,
          color: "#99aebf",
          background: C.bg,
        }}
      >
        <span style={{ display: "flex", gap: 5, marginRight: 13 }}>
          {["#fc6477", "#ffd17a", "#43dbb0"].map((c) => (
            <i
              key={c}
              style={{
                display: "block",
                width: 5,
                height: 5,
                borderRadius: 10,
                background: c,
                opacity: 0.8,
              }}
            />
          ))}
        </span>
        {title}
        <span style={{ marginLeft: "auto", color: accent, fontSize: 11 }}>
          {tag}
        </span>
      </div>
      {children}
    </div>
  );
};

const Code: React.FC<{
  lines: string[];
  active: number;
  t: number;
  title?: string;
  accent?: string;
}> = ({
  lines,
  active,
  t,
  title = "SOURCE / TRACE",
  accent: requestedColor,
}) => {
  const C = useAttackColors();
  const accent = requestedColor ?? C.cyan;
  return (
    <Panel
      x={1410}
      y={242}
      w={435}
      h={598}
      title={title}
      tag="OPERATOR"
      accent={accent}
      style={{
        opacity: appear(t, 1.3),
        transform: `translateX(${(1 - appear(t, 1.3)) * 25}px)`,
      }}
    >
      <div
        style={{
          padding: "27px 17px",
          fontFamily: MONO,
          fontSize: 17,
          lineHeight: 2.0,
        }}
      >
        {lines.map((line, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              whiteSpace: "pre",
              background: i === active ? `${accent}14` : "transparent",
              borderLeft: `2px solid ${i === active ? accent : "transparent"}`,
              paddingLeft: 9,
              color:
                i === active
                  ? C.ink
                  : line.trim().startsWith("//")
                    ? "#52798d"
                    : "#92a9c2",
            }}
          >
            <span
              style={{
                color: "#344e66",
                width: 34,
                flexShrink: 0,
                fontSize: 12,
                paddingTop: 4,
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span>{line}</span>
          </div>
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 24,
          left: 27,
          right: 27,
          borderTop: "1px solid #183146",
          paddingTop: 16,
          fontFamily: MONO,
          fontSize: 12,
          color: "#5c8198",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>LOCAL CHALLENGE</span>
        <span>UTF-8 / LF</span>
      </div>
    </Panel>
  );
};

const Success: React.FC<{
  t: number;
  start: number;
  label?: string;
  flag?: string;
  x?: number;
  y?: number;
  w?: number;
}> = ({ t, start, label = "CORRECT", flag, x = 240, y = 380, w = 1040 }) => {
  const C = useAttackColors();
  const a = appear(t, start, 0.65);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        textAlign: "center",
        opacity: a,
        transform: `translateY(${(1 - a) * 26}px) scale(${0.96 + 0.04 * a + 0.008 * Math.sin(Math.max(0, t - start) * 0.8)})`,
      }}
    >
      <div
        style={{
          fontFamily: MONO,
          fontSize: 14,
          letterSpacing: 5,
          color: C.green,
          marginBottom: 22,
        }}
      >
        CHALLENGE VERIFIED
      </div>
      <div
        style={{
          fontSize: 76,
          fontFamily: MONO,
          fontWeight: 700,
          letterSpacing: 8,
          color: C.green,
          textShadow: `0 0 40px ${C.green}55`,
        }}
      >
        {label}
      </div>
      {flag && (
        <div
          style={{
            marginTop: 29,
            fontFamily: MONO,
            fontSize: 27,
            color: C.ink,
            padding: "15px 10px",
            borderTop: "1px solid #61edbf33",
            borderBottom: "1px solid #61edbf33",
          }}
        >
          {flag}
        </div>
      )}
      <div
        style={{
          marginTop: 24,
          color: "#84a499",
          fontSize: 14,
          letterSpacing: 3,
        }}
      >
        FLAG 验证通过
      </div>
    </div>
  );
};

const routePoint = (pts: [number, number][], q: number): [number, number] => {
  const lengths = pts
    .slice(1)
    .map((v, i) => Math.hypot(v[0] - pts[i][0], v[1] - pts[i][1]));
  let d = clamp(q) * lengths.reduce((a, b) => a + b, 0);
  for (let i = 0; i < lengths.length; i++) {
    if (d <= lengths[i])
      return [
        lerp(pts[i][0], pts[i + 1][0], d / lengths[i]),
        lerp(pts[i][1], pts[i + 1][1], d / lengths[i]),
      ];
    d -= lengths[i];
  }
  return pts[pts.length - 1];
};

export const WebScene: React.FC = () => {
  const C = useAttackColors();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const overview = 1 - appear(t, 5, 0.7),
    compare = windowAlpha(t, 4.5, 10.8),
    flow = windowAlpha(t, 10, 17.4),
    result = appear(t, 17.6);
  const packet = routePoint(
    [
      [200, 555],
      [460, 555],
      [460, 470],
      [760, 470],
      [760, 555],
      [1220, 555],
    ],
    p(t, 10.8, 15.6),
  );
  return (
    <AbsoluteFill style={{ fontFamily: SANS, color: C.ink }}>
      <Backdrop t={t} />
      <Header
        n="01"
        title="Web"
        sub="BROKEN ACCESS CONTROL / 越过授权边界"
        t={t}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: overview,
          transform: `perspective(1500px) rotateY(${-10 - ease(p(t, 0, 5)) * 7}deg) rotateX(5deg) translateX(${-30 * p(t, 0, 5)}px)`,
          transformOrigin: "700px 520px",
        }}
      >
        {[2, 1, 0].map((layer) => (
          <Panel
            key={layer}
            x={210 + layer * 73}
            y={273 - layer * 25}
            w={1020}
            h={505}
            title={
              layer === 0
                ? "CHALLENGE PORTAL / NOTES"
                : layer === 1
                  ? "HTTP / RESPONSE"
                  : "APPLICATION / DATA"
            }
            tag={layer === 0 ? "SESSION 17" : "INSPECT"}
            style={{
              transform: `translateZ(${-layer * 90}px)`,
              opacity: layer === 0 ? 1 : 0.45,
            }}
          >
            {layer === 0 ? (
              <div style={{ padding: "36px 46px" }}>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 13,
                    color: C.cyan,
                    letterSpacing: 4,
                    marginBottom: 14,
                  }}
                >
                  CTF / TARGET APPLICATION
                </div>
                <div
                  style={{ fontSize: 40, fontWeight: 600, marginBottom: 16 }}
                >
                  页面背后，目标已锁定。
                </div>
                <div style={{ fontSize: 18, color: C.muted, marginBottom: 28 }}>
                  截获请求。改变对象。直达边界之后。
                </div>
                {[104, 103, 102].map((id, i) => (
                  <div
                    key={id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      height: 65,
                      borderTop: "1px solid #1b3348",
                      gap: 21,
                      color: i === 0 ? C.ink : "#7f96ab",
                    }}
                  >
                    <span
                      style={{ fontFamily: MONO, color: C.cyan, fontSize: 14 }}
                    >
                      #{id}
                    </span>
                    <span style={{ fontSize: 20 }}>
                      Research note /{" "}
                      {["请求与响应", "会话与身份", "资源与边界"][i]}
                    </span>
                    <span
                      style={{
                        marginLeft: "auto",
                        fontFamily: MONO,
                        fontSize: 12,
                        color: C.muted,
                      }}
                    >
                      PUBLIC ↗
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  padding: 40,
                  fontFamily: MONO,
                  color: "#5589b2",
                  fontSize: 20,
                  lineHeight: 2.2,
                }}
              >
                {layer === 1 ? (
                  <>
                    <div>HTTP/1.1 200 OK</div>
                    <div>content-type: application/json</div>
                    <div>{"{ id: 104, owner: 17 }"}</div>
                  </>
                ) : (
                  <>
                    <div>router /api/notes/:id</div>
                    <div>session.reader = 17</div>
                    <div>db.notes.findById(id)</div>
                  </>
                )}
              </div>
            )}
          </Panel>
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: compare,
          transform: `translateY(${(1 - appear(t, 4.5)) * 28}px)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 115,
            top: 236,
            fontSize: 15,
            letterSpacing: 4,
            fontFamily: MONO,
            color: C.cyan,
          }}
        >
          MUTATE THE REQUEST. CROSS THE BOUNDARY.
        </div>
        {[104, 105].map((id, i) => (
          <Panel
            key={id}
            x={120 + i * 640}
            y={300}
            w={590}
            h={385}
            title={`REQUEST / OBJECT ${id}`}
            tag={i === 0 ? "BASELINE" : "ANOMALY"}
            accent={i ? C.red : C.cyan}
          >
            <div
              style={{
                padding: 30,
                fontFamily: MONO,
                fontSize: 22,
                lineHeight: 2.1,
              }}
            >
              <div>
                <span style={{ color: C.green }}>GET</span> /api/notes/
                <Glow color={i ? C.red : C.cyan}>{id}</Glow>
              </div>
              <div style={{ fontSize: 17, color: C.muted }}>
                session.reader: 17
              </div>
              <div
                style={{
                  marginTop: 20,
                  borderTop: "1px solid #23435b",
                  paddingTop: 18,
                  color: C.green,
                }}
              >
                200 OK
              </div>
              <div style={{ color: C.muted, fontSize: 18 }}>
                owner:{" "}
                <span style={{ color: i ? C.red : C.ink }}>{i ? 23 : 17}</span>
              </div>
              <div style={{ fontSize: 18 }}>
                visibility:{" "}
                <Glow color={i ? C.red : C.cyan}>
                  {i ? "private" : "public"}
                </Glow>
              </div>
            </div>
          </Panel>
        ))}
        <div
          style={{
            position: "absolute",
            left: 120,
            top: 735,
            width: 1230,
            textAlign: "center",
            fontFamily: MONO,
            fontSize: 23,
            color: C.red,
            opacity: appear(t, 7),
          }}
        >
          IDENTITY ≠ OWNERSHIP{" "}
          <span style={{ color: C.muted, fontSize: 17, marginLeft: 24 }}>
            授权检查缺失
          </span>
        </div>
      </div>
      <div style={{ position: "absolute", inset: 0, opacity: flow }}>
        <svg
          width="1400"
          height="900"
          style={{ position: "absolute", left: 0, top: 0 }}
        >
          <defs>
            <filter id="web-glow">
              <feGaussianBlur stdDeviation="5" />
            </filter>
          </defs>
          <path
            d="M200 555H460V470H760V555H1220"
            fill="none"
            stroke={C.line}
            strokeWidth="3"
          />
          <path
            d="M200 555H460V470H760V555H1220"
            fill="none"
            stroke={C.cyan}
            strokeWidth="3"
            pathLength="1"
            strokeDasharray="1"
            strokeDashoffset={1 - p(t, 10.8, 15.6)}
          />
          <circle
            cx={packet[0]}
            cy={packet[1]}
            r="13"
            fill={C.cyan}
            filter="url(#web-glow)"
          />
          <circle cx={packet[0]} cy={packet[1]} r="5" fill="white" />
        </svg>
        {[
          {
            x: 145,
            y: 350,
            w: 265,
            title: "ROUTER",
            name: "/api/notes/:id",
            sub: "解析对象编号",
          },
          {
            x: 490,
            y: 290,
            w: 300,
            title: "AUTHORIZATION",
            name: "owner check",
            sub: "missing",
            bad: true,
          },
          {
            x: 910,
            y: 350,
            w: 350,
            title: "DATA OBJECT",
            name: "note #105",
            sub: "private / owner 23",
          },
        ].map((v, i) => (
          <Panel
            key={v.title}
            x={v.x}
            y={v.y}
            w={v.w}
            h={178}
            title={v.title}
            tag={v.bad ? "GAP" : "TRACE"}
            accent={v.bad ? C.red : C.cyan}
          >
            <div
              style={{
                padding: "25px 20px",
                fontFamily: MONO,
                fontSize: 23,
                color: v.bad ? C.red : C.ink,
              }}
            >
              {v.name}
              <div
                style={{
                  fontSize: 16,
                  color: v.bad ? C.red : C.muted,
                  marginTop: 18,
                }}
              >
                {v.sub}
              </div>
            </div>
          </Panel>
        ))}
        <Panel
          x={245}
          y={665}
          w={940}
          h={100}
          title="RESPONSE BODY"
          tag="RETURNED"
        >
          <div
            style={{
              padding: "13px 22px",
              fontFamily: MONO,
              fontSize: 22,
              color: C.green,
            }}
          >
            {textSlice("flag{test}", t, 15.6, 22)}
          </div>
        </Panel>
      </div>
      <ExploitArtifacts kind="web" t={t} />
      <Code
        t={t}
        active={t < 5 ? 0 : t < 10 ? 2 : t < 16 ? 4 : 5}
        title="APPLICATION / NOTES"
        lines={[
          'app.get("/api/notes/:id",',
          "  async (req, res) => {",
          "  const { id } = req.params;",
          "  const note = db.find(id);",
          "  // missing owner check",
          "  return res.json(note);",
          "});",
          "",
          "reader.id = 17",
          "note.owner = 23",
        ]}
      />
      <div style={{ opacity: result }}>
        <Success t={t} start={17.6} flag="flag{test}" />
      </div>
      <Caption t={t} start={5.2} end={16.9} text="改写请求，越过边界。" />
    </AbsoluteFill>
  );
};

export const CryptoScene: React.FC = () => {
  const C = useAttackColors();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const matrix = 1 - appear(t, 5, 0.8),
    factor = windowAlpha(t, 4.6, 12.5),
    decrypt = windowAlpha(t, 12, 17.6);
  return (
    <AbsoluteFill style={{ fontFamily: SANS, color: C.ink }}>
      <Backdrop t={t} accent={C.blue} />
      <Header n="02" title="Crypto" sub="BREAK THE CIPHER / 击穿弱参数" t={t} />
      <svg
        width="1380"
        height="850"
        style={{
          position: "absolute",
          left: 0,
          top: 20,
          opacity: matrix,
          transform: `perspective(1600px) rotateY(${4 - Math.sin(t * 0.4) * 3}deg) scale(${1 + 0.02 * t})`,
        }}
      >
        <defs>
          <radialGradient id="cipher-fade">
            <stop offset="0%" stopColor="#173d6c" />
            <stop offset="100%" stopColor="#07101d" />
          </radialGradient>
        </defs>
        {Array.from({ length: 10 }, (_, row) =>
          Array.from({ length: 20 }, (_, col) => {
            const val = (((row * 7919 + col * 173 + 37) * 31337) % 65535)
              .toString(16)
              .toUpperCase()
              .padStart(4, "0");
            const bright = (row + col * 3) % 11 === 0;
            return (
              <text
                key={`${row}-${col}`}
                x={100 + col * 61}
                y={280 + row * 43}
                fontFamily={MONO}
                fontSize={17}
                fill={bright ? C.cyan : "#254668"}
                opacity={bright ? 0.9 : 0.25 + 0.3 * pulse(t + row + col)}
              >
                {val}
              </text>
            );
          }),
        )}
        <rect
          x="367"
          y="351"
          width="610"
          height="180"
          rx="5"
          fill="#071321ee"
          stroke="#2c83c8"
        />
        <text
          x="405"
          y="403"
          fill={C.cyan}
          fontSize="16"
          fontFamily={MONO}
          letterSpacing="4"
        >
          RSA / INTERCEPTED PARAMETERS
        </text>
        <text x="405" y="462" fill={C.ink} fontSize="42" fontFamily={MONO}>
          n = 3233
        </text>
        <text x="405" y="501" fill={C.muted} fontSize="21" fontFamily={MONO}>
          e = 17 c = 2790
        </text>
      </svg>
      <div style={{ position: "absolute", inset: 0, opacity: factor }}>
        <div
          style={{
            position: "absolute",
            left: 160,
            top: 250,
            fontFamily: MONO,
            fontSize: 14,
            color: C.muted,
            letterSpacing: 3,
          }}
        >
          RSA / 小参数示意
        </div>
        <svg
          width="1380"
          height="850"
          style={{ position: "absolute", left: 0, top: 0 }}
        >
          <circle
            cx="690"
            cy="475"
            r="210"
            fill="none"
            stroke="#1b385f"
            strokeWidth="1"
          />
          <circle
            cx="690"
            cy="475"
            r="228"
            fill="none"
            stroke={C.blue}
            strokeWidth="2"
            strokeDasharray="2 16"
            transform={`rotate(${t * 6} 690 475)`}
          />
          <circle
            cx="690"
            cy="475"
            r="250"
            fill="none"
            stroke="#173252"
            strokeDasharray="160 280"
            transform={`rotate(${-t * 8} 690 475)`}
          />
          <path d="M260 475H480M900 475H1120" stroke={C.blue} strokeWidth="1" />
          <circle cx="260" cy="475" r="5" fill={C.cyan} />
          <circle cx="1120" cy="475" r="5" fill={C.cyan} />
        </svg>
        <div
          style={{
            position: "absolute",
            left: 440,
            top: 388,
            width: 500,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 15,
              color: C.muted,
              fontFamily: MONO,
              letterSpacing: 5,
            }}
          >
            MODULUS
          </div>
          <div
            style={{
              fontSize: 100,
              fontWeight: 600,
              fontFamily: MONO,
              letterSpacing: 5,
              marginTop: 12,
            }}
          >
            3233
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            left: 115,
            top: 407,
            width: 260,
            textAlign: "center",
            transform: `translateX(${(1 - ease(p(t, 5.8, 8))) * -70}px)`,
            opacity: appear(t, 5.5),
          }}
        >
          <div
            style={{
              fontSize: 15,
              fontFamily: MONO,
              color: C.muted,
              letterSpacing: 3,
            }}
          >
            FACTOR / p
          </div>
          <Glow style={{ fontSize: 78, fontFamily: MONO }}>61</Glow>
        </div>
        <div
          style={{
            position: "absolute",
            left: 1000,
            top: 407,
            width: 260,
            textAlign: "center",
            transform: `translateX(${(1 - ease(p(t, 5.8, 8))) * 70}px)`,
            opacity: appear(t, 5.5),
          }}
        >
          <div
            style={{
              fontSize: 15,
              fontFamily: MONO,
              color: C.muted,
              letterSpacing: 3,
            }}
          >
            FACTOR / q
          </div>
          <Glow style={{ fontSize: 78, fontFamily: MONO }}>53</Glow>
        </div>
        <div
          style={{
            position: "absolute",
            left: 300,
            top: 700,
            width: 780,
            textAlign: "center",
            fontFamily: MONO,
            opacity: appear(t, 8.5),
          }}
        >
          <div style={{ fontSize: 28, color: C.cyan }}>61 × 53 = 3233</div>
          <div style={{ fontSize: 21, color: C.muted, marginTop: 15 }}>
            φ(n) = 3120{" "}
            <span style={{ color: C.green, marginLeft: 40 }}>d = 2753</span>
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", inset: 0, opacity: decrypt }}>
        <div
          style={{
            position: "absolute",
            left: 150,
            top: 262,
            fontFamily: MONO,
            color: C.cyan,
            fontSize: 16,
            letterSpacing: 4,
          }}
        >
          CIPHERTEXT → PLAINTEXT → MEANING
        </div>
        {[
          { x: 130, value: "2790", label: "CIPHERTEXT" },
          { x: 570, value: "65", label: "PLAINTEXT" },
          { x: 1010, value: "A", label: "ASCII" },
        ].map((v, i) => (
          <div
            key={v.label}
            style={{
              position: "absolute",
              left: v.x,
              top: 350,
              width: 300,
              height: 240,
              border: "1px solid #224d72",
              background: "linear-gradient(135deg,#0d2036,#060f1c)",
              textAlign: "center",
              opacity: appear(t, 12 + i * 0.9),
              transform: `translateY(${(1 - appear(t, 12 + i * 0.9)) * 30}px)`,
            }}
          >
            <div
              style={{
                marginTop: 38,
                fontFamily: MONO,
                fontSize: 14,
                letterSpacing: 3,
                color: C.muted,
              }}
            >
              {v.label}
            </div>
            <div
              style={{
                marginTop: 27,
                fontFamily: MONO,
                fontSize: 85,
                color: i === 2 ? C.green : C.ink,
                textShadow: i === 2 ? `0 0 30px ${C.green}55` : "none",
              }}
            >
              {v.value}
            </div>
          </div>
        ))}
        {[465, 905].map((x, i) => (
          <div
            key={x}
            style={{
              position: "absolute",
              left: x,
              top: 442,
              color: C.cyan,
              fontSize: 38,
              opacity: appear(t, 12.7 + i * 0.9),
            }}
          >
            →
          </div>
        ))}
        <div
          style={{
            position: "absolute",
            left: 180,
            top: 660,
            width: 1080,
            textAlign: "center",
            fontFamily: MONO,
            fontSize: 26,
            color: C.muted,
            opacity: appear(t, 14.5),
          }}
        >
          2790<span style={{ fontSize: 17, verticalAlign: "super" }}>2753</span>{" "}
          mod 3233 = <Glow>65</Glow>
        </div>
        <div
          style={{
            position: "absolute",
            left: 180,
            top: 720,
            width: 1080,
            textAlign: "center",
            fontSize: 15,
            color: "#537c96",
            fontFamily: MONO,
            letterSpacing: 3,
          }}
        >
          SINGLE-BLOCK DEMONSTRATION / 数据块逐一还原
        </div>
      </div>
      <ExploitArtifacts kind="crypto" t={t} />
      <Code
        t={t}
        title="RSA / PARAMETER TRACE"
        active={t < 5 ? 0 : t < 8 ? 2 : t < 12 ? 4 : t < 15 ? 6 : 8}
        lines={[
          "n, e = 3233, 17",
          "c = 2790",
          "p, q = 61, 53",
          "phi = (p-1) * (q-1)",
          "d = 2753",
          "",
          "m = pow(c, d, n)",
          "# m = 65",
          "chr(m)  # A",
        ]}
        accent={C.cyan}
      />
      <Caption t={t} start={5.5} end={16.8} text="拆开模数，夺回密钥。" />
      <div style={{ opacity: appear(t, 17) }}>
        <div
          style={{
            position: "absolute",
            left: 100,
            top: 220,
            width: 1260,
            height: 620,
            background: "radial-gradient(ellipse,#07192aee,#030711f5)",
          }}
        />
        <Success t={t} start={17.2} label="DECRYPTED" />
        <div
          style={{
            position: "absolute",
            left: 400,
            top: 658,
            width: 700,
            textAlign: "center",
            fontSize: 18,
            fontFamily: MONO,
            color: C.green,
            opacity: appear(t, 18.3),
          }}
        >
          CORRECT / CRYPTO CHALLENGE COMPLETE
        </div>
      </div>
    </AbsoluteFill>
  );
};

type GraphNode = {
  id: string;
  x: number;
  y: number;
  w: number;
  title: string;
  detail: string;
};
const GRAPH: GraphNode[] = [
  {
    id: "entry",
    x: 115,
    y: 365,
    w: 200,
    title: "main()",
    detail: "read input",
  },
  {
    id: "parse",
    x: 390,
    y: 365,
    w: 220,
    title: "normalize()",
    detail: "bytes → state",
  },
  {
    id: "check",
    x: 700,
    y: 325,
    w: 260,
    title: "verify()",
    detail: "compare / branch",
  },
  {
    id: "pass",
    x: 1080,
    y: 270,
    w: 230,
    title: "success()",
    detail: "return flag",
  },
  {
    id: "fail",
    x: 730,
    y: 620,
    w: 240,
    title: "fail()",
    detail: "invalid input",
  },
  {
    id: "exit",
    x: 1090,
    y: 620,
    w: 220,
    title: "exit()",
    detail: "status = 1",
  },
];

export const ReverseScene: React.FC = () => {
  const C = useAttackColors();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const graphAlpha = appear(t, 3.5),
    program = 1 - appear(t, 4.1),
    verified = appear(t, 17.6);
  const failPath: [number, number][] = [
    [215, 405],
    [500, 405],
    [830, 405],
    [830, 660],
    [1200, 660],
  ];
  const passPath: [number, number][] = [
    [215, 405],
    [500, 405],
    [830, 405],
    [830, 310],
    [1190, 310],
  ];
  const successPath = t >= 12.4;
  const trace = routePoint(
    successPath ? passPath : failPath,
    p(t, successPath ? 12.4 : 5, successPath ? 17 : 10.3),
  );
  return (
    <AbsoluteFill style={{ fontFamily: SANS, color: C.ink }}>
      <Backdrop t={t} />
      <Header
        n="03"
        title="Reverse"
        sub="UNLOCK THE BRANCH / 突破校验分支"
        t={t}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: graphAlpha * (1 - verified),
          transform: `translateX(${-15 * p(t, 5, 17)}px) scale(${1 + 0.018 * p(t, 5, 17)})`,
          transformOrigin: "760px 450px",
        }}
      >
        <svg
          width="1400"
          height="900"
          style={{ position: "absolute", inset: 0 }}
        >
          <defs>
            <filter id="rev-glow">
              <feGaussianBlur stdDeviation="7" />
            </filter>
          </defs>
          <path
            d="M215 405H830V310H1190M830 405V660H1200"
            fill="none"
            stroke="#23435e"
            strokeWidth="3"
          />
          <path
            d={successPath ? "M215 405H830V310H1190" : "M215 405H830V660H1200"}
            fill="none"
            stroke={successPath ? C.cyan : C.red}
            strokeWidth="3"
            pathLength="1"
            strokeDasharray="1"
            strokeDashoffset={
              1 - p(t, successPath ? 12.4 : 5, successPath ? 17 : 10.3)
            }
          />
          <circle
            cx={trace[0]}
            cy={trace[1]}
            r="17"
            fill={successPath ? C.cyan : C.red}
            filter="url(#rev-glow)"
          />
          <circle cx={trace[0]} cy={trace[1]} r="5" fill="white" />
          <text
            x="885"
            y="284"
            fill={successPath ? C.green : "#4b6d84"}
            fontSize="14"
            fontFamily={MONO}
          >
            TRUE / ZF=1
          </text>
          <text
            x="855"
            y="555"
            fill={!successPath ? C.red : "#4b6d84"}
            fontSize="14"
            fontFamily={MONO}
          >
            FALSE / ZF=0
          </text>
        </svg>
        {GRAPH.map((v, i) => {
          const on =
            v.id === "check" ||
            (successPath ? v.id === "pass" : v.id === "fail");
          return (
            <div
              key={v.id}
              style={{
                position: "absolute",
                left: v.x,
                top: v.y,
                width: v.w,
                height: 100,
                padding: "19px 21px",
                boxSizing: "border-box",
                background: on ? `${C.blue}20` : C.bg,
                border: `1px solid ${on ? (v.id === "fail" ? C.red : C.cyan) : "#24445d"}`,
                borderRadius: 5,
                boxShadow: on
                  ? `0 0 32px ${v.id === "fail" ? C.red : C.cyan}13`
                  : "none",
                opacity: appear(t, 3.6 + i * 0.12),
              }}
            >
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 22,
                  color: on ? C.ink : "#93aabc",
                }}
              >
                {v.title}
              </div>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 13,
                  color: C.muted,
                  marginTop: 10,
                }}
              >
                {v.detail}
              </div>
            </div>
          );
        })}
        <div
          style={{
            position: "absolute",
            left: 180,
            top: 220,
            color: C.muted,
            fontFamily: MONO,
            fontSize: 14,
            letterSpacing: 4,
          }}
        >
          CONTROL FLOW GRAPH / LOCAL BRANCH
        </div>
        <div
          style={{
            position: "absolute",
            left: 235,
            top: 755,
            width: 950,
            textAlign: "center",
            fontFamily: MONO,
            fontSize: 25,
            opacity: appear(t, 12.6),
          }}
        >
          <span style={{ color: C.cyan }}>0x41</span>
          <span style={{ color: C.muted, margin: "0 30px" }}>XOR 0x2a</span>
          <span>→</span>
          <Glow color={C.green} style={{ marginLeft: 30 }}>
            0x6b
          </Glow>
          <span style={{ color: C.muted, fontSize: 17, marginLeft: 28 }}>
            {t < 16 ? "CANDIDATE INPUT" : "COMPARE MATCH"}
          </span>
        </div>
      </div>
      <Panel
        x={280}
        y={315}
        w={880}
        h={390}
        title="CHALLENGE / VERIFY INPUT"
        tag="RUNNING"
        style={{
          opacity: program,
          transform: `scale(${1 + 0.08 * p(t, 0, 4)})`,
        }}
      >
        <div style={{ padding: 50, fontFamily: MONO, fontSize: 25 }}>
          <div style={{ color: C.muted, fontSize: 17 }}>Enter your key:</div>
          <div
            style={{
              marginTop: 28,
              border: "1px solid #2b455c",
              padding: 17,
              color: C.cyan,
            }}
          >
            ********
          </div>
          <div
            style={{
              marginTop: 37,
              color: C.red,
              fontSize: 36,
              opacity: appear(t, 1.2),
            }}
          >
            Invalid input
          </div>
        </div>
      </Panel>
      <Code
        t={t}
        title="DISASSEMBLY / VERIFY"
        active={t < 5 ? 0 : t < 11 ? 4 : t < 14 ? 2 : t < 17 ? 3 : 6}
        lines={[
          "verify:",
          "  movzx eax, [rdi]",
          "  xor eax, 0x2a",
          "  cmp eax, 0x6b",
          "  jne fail",
          "  ...",
          "  jmp success",
          "",
          t < 12.4 ? "eax: 0x00 → 0x2a" : "eax: 0x41 → 0x6b",
          t < 12.4 ? "ZF:  0 / mismatch" : "ZF:  1 / match",
        ]}
      />
      <Caption t={t} start={5.2} end={17.5} text="看穿分支，打开通路。" />
      <div style={{ opacity: verified }}>
        <Success t={t} start={17.6} label="PATH VERIFIED" />
        <div
          style={{
            position: "absolute",
            left: 300,
            top: 665,
            width: 950,
            textAlign: "center",
            fontFamily: MONO,
            fontSize: 18,
            color: C.green,
            opacity: appear(t, 19),
          }}
        >
          CORRECT / REVERSE CHALLENGE COMPLETE
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const PwnScene: React.FC = () => {
  const C = useAttackColors();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const failed = t >= 6.8 && t < 13;
  const repair = appear(t, 14);
  const breakpoint = appear(t, 19.2);
  return (
    <AbsoluteFill style={{ fontFamily: SANS, color: C.ink }}>
      <Backdrop t={t} accent={failed ? "#7e163b" : C.blue} />
      <Header
        n="04"
        title="Pwn"
        sub="TAKE THE CONTROL FLOW / 夺取执行流"
        t={t}
        status={
          t > 19
            ? "BREAKPOINT HIT"
            : failed
              ? "PROCESS INTERRUPTED"
              : "DEBUG SESSION ACTIVE"
        }
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          transform: `perspective(1800px) rotateY(${-4 + 2 * p(t, 0, 22)}deg)`,
          transformOrigin: "750px 540px",
          opacity: appear(t, 0.2),
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 135,
            top: 232,
            whiteSpace: "nowrap",
            fontFamily: MONO,
            fontSize: 14,
            color: C.muted,
            letterSpacing: 3,
          }}
        >
          STACK LAYOUT / 模拟栈布局
        </div>
        <svg
          width="1380"
          height="900"
          style={{ position: "absolute", left: 0, top: 0 }}
        >
          <path
            d="M95 287V817M83 801l12 16 12-16"
            fill="none"
            stroke="#397ba0"
          />
          <text
            x="57"
            y="555"
            transform="rotate(-90 57 555)"
            fontFamily={MONO}
            fontSize="13"
            fill="#5f879f"
            letterSpacing="4"
          >
            HIGHER ADDRESS
          </text>
          <path
            d="M780 760H860V473H1000"
            fill="none"
            stroke={failed ? C.red : C.cyan}
            strokeWidth="2"
            strokeDasharray="7 9"
          />
          <circle
            cx={lerp(780, 1000, p(t, 14, 18))}
            cy={lerp(760, 473, p(t, 14, 18))}
            r="5"
            fill={C.cyan}
            opacity={repair}
          />
        </svg>
        {Array.from({ length: 10 }, (_, i) => {
          const ret = i === 9;
          const rbp = i === 8;
          const offset = i * 8;
          const active = i < 8 ? i <= Math.floor(p(t, 1, 5) * 8) : t > 4;
          const error = failed && i >= 8;
          const val =
            i < 8
              ? Array.from({ length: 8 }, (_, j) =>
                  (65 + ((i + j) % 6)).toString(16),
                ).join(" ")
              : rbp
                ? "00 dd ff ff ff 7f 00 00"
                : repair
                  ? "90 12 40 00 00 00 00 00"
                  : "?? ?? ?? ?? ?? ?? ?? ??";
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 130 + i * 0.8,
                top: 285 + i * 50,
                width: 650,
                height: 44,
                display: "flex",
                alignItems: "center",
                fontFamily: MONO,
                background: error
                  ? "#431427"
                  : ret
                    ? "#10334c"
                    : active
                      ? "#0b1d2d"
                      : "#08121f",
                border: `1px solid ${error ? C.red : ret ? C.cyan : "#21415a"}`,
                boxShadow: ret ? `0 0 32px ${C.cyan}1c` : "none",
                transform: `translateX(${error ? Math.sin(t * 60) * 3 : 0}px)`,
              }}
            >
              <span
                style={{
                  width: 86,
                  paddingLeft: 15,
                  color: error ? C.red : C.muted,
                  fontSize: 13,
                }}
              >
                +0x{offset.toString(16).padStart(2, "0")}
              </span>
              <span
                style={{
                  color: active ? C.ink : "#2f4c62",
                  fontSize: 18,
                  letterSpacing: 1,
                }}
              >
                {active ? val : "00 00 00 00 00 00 00 00"}
              </span>
              <span
                style={{
                  marginLeft: "auto",
                  marginRight: 17,
                  fontSize: 12,
                  color: ret ? C.cyan : C.muted,
                }}
              >
                {ret ? "SAVED RIP" : rbp ? "SAVED RBP" : `BUFFER ${i}`}
              </span>
            </div>
          );
        })}
        <Panel
          x={905}
          y={282}
          w={410}
          h={256}
          title="REGISTERS / x86-64"
          tag={failed ? "STOP" : "DEBUG"}
          accent={failed ? C.red : C.cyan}
        >
          <div
            style={{
              padding: "24px 24px",
              fontFamily: MONO,
              fontSize: 19,
              lineHeight: 2.3,
            }}
          >
            <div>
              <span style={{ color: C.muted }}>RSP </span>0x7fffffffdc00
            </div>
            <div>
              <span style={{ color: C.muted }}>RBP </span>0x7fffffffdc40
            </div>
            <div>
              <span style={{ color: C.muted }}>RIP </span>
              <Glow color={failed ? C.red : C.cyan}>
                {failed ? "0x414141414141" : "0x000000401290"}
              </Glow>
            </div>
          </div>
        </Panel>
        <Panel
          x={905}
          y={575}
          w={410}
          h={195}
          title="OFFSET / REASSESS"
          tag={repair ? "VERIFIED" : "OBSERVE"}
        >
          <div style={{ padding: "22px 24px", fontFamily: MONO }}>
            <div style={{ fontSize: 16, color: C.muted }}>
              BUFFER → RETURN ADDRESS
            </div>
            <div style={{ marginTop: 20, fontSize: 31 }}>
              <span
                style={{
                  color: failed ? C.red : C.muted,
                  textDecoration: repair ? "line-through" : "none",
                }}
              >
                0x40
              </span>
              <span style={{ margin: "0 18px", color: C.muted }}>→</span>
              <Glow color={repair ? C.cyan : "#32536a"}>0x48</Glow>
            </div>
          </div>
        </Panel>
      </div>
      <ExploitArtifacts kind="pwn" t={t} />
      <Code
        t={t}
        title="GDB / PROCESS TRACE"
        active={t < 6 ? 1 : t < 13 ? 4 : t < 19 ? 6 : 8}
        accent={failed ? C.red : C.cyan}
        lines={[
          "gdb ./challenge",
          "(gdb) run",
          "input: [buffer data]",
          "",
          t >= 6.8 ? "Program received SIGSEGV" : "",
          t >= 8 ? "(gdb) info registers" : "",
          t >= 12 ? "(gdb) examine stack" : "",
          t >= 14 ? "offset = 0x48" : "",
          t >= 18 ? "(gdb) break *verify" : "",
          t >= 19.2 ? "Breakpoint 1, verify()" : "",
        ]}
      />
      <div
        style={{
          position: "absolute",
          left: 260,
          top: 815,
          width: 950,
          textAlign: "center",
          fontFamily: MONO,
          fontSize: 16,
          letterSpacing: 3,
          color: failed ? C.red : C.cyan,
          opacity: t > 6 ? 1 : 0,
        }}
      >
        {t > 19
          ? "BREAKPOINT HIT / 关键地址待确认"
          : failed
            ? "PROCESS EXITED / CHECK THE EVIDENCE"
            : t > 13
              ? "OFFSET VERIFIED / RUN AGAIN"
              : "INPUT RECEIVED"}
      </div>
      <Caption t={t} start={6.5} end={18.8} text="崩溃之后，重写执行方向。" />
      <div
        style={{
          position: "absolute",
          left: 390,
          top: 895,
          width: 700,
          textAlign: "center",
          opacity: breakpoint,
          color: C.gold,
          fontFamily: MONO,
          fontSize: 15,
          letterSpacing: 3,
        }}
      >
        CHALLENGE OPEN · 尚未提交
      </div>
    </AbsoluteFill>
  );
};

const HIDDEN = "flag{test}";
const BITS = Array.from(HIDDEN).flatMap((c) =>
  c.charCodeAt(0).toString(2).padStart(8, "0").split("").map(Number),
);
const pixelColor = (x: number, y: number, bit: number) => {
  const mountain = 11 + Math.sin(x * 0.21) * 2 + Math.cos(x * 0.48) * 1.5;
  const land = y > mountain;
  const r = land ? 8 + Math.floor(y * 0.7) : 18 + Math.floor(y * 2.1);
  const g = land ? 31 + Math.floor(x * 0.3) : 46 + Math.floor(y * 3.1);
  const b = land ? 51 + Math.floor(x * 0.8) : 90 + Math.floor(y * 3.2);
  return `rgb(${r - (r % 2)},${g - (g % 2)},${b - (b % 2) + bit})`;
};

export const MiscScene: React.FC = () => {
  const C = useAttackColors();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const bitplane = ease(p(t, 4.8, 8.8));
  const done = appear(t, 14.4);
  return (
    <AbsoluteFill style={{ fontFamily: SANS, color: C.ink }}>
      <Backdrop t={t} />
      <Header
        n="05"
        title="Misc"
        sub="STRIP THE SURFACE / 提取隐藏通道"
        t={t}
      />
      <div style={{ position: "absolute", inset: 0, opacity: 1 - done }}>
        <Panel
          x={130}
          y={262}
          w={1170}
          h={540}
          title={
            bitplane > 0.5
              ? "IMAGE / BLUE CHANNEL · LEAST SIGNIFICANT BIT"
              : "EVIDENCE / landscape.png"
          }
          tag={bitplane > 0.5 ? "EXTRACT" : "VIEW"}
        >
          <svg
            width="1170"
            height="498"
            viewBox="0 0 1170 498"
            style={{ position: "absolute", top: 42, left: 0 }}
          >
            <defs>
              <clipPath id="misc-pixels">
                <rect x="105" y="7" width="960" height="480" rx="2" />
              </clipPath>
              <linearGradient id="misc-sky" x1="0" y1="0" x2="0" y2="1">
                <stop stopColor="#122d5a" />
                <stop offset="1" stopColor="#467490" />
              </linearGradient>
            </defs>
            <g
              clipPath="url(#misc-pixels)"
              transform={`translate(${585 * (1 - (1 + 0.05 * p(t, 0, 5)))},${245 * (1 - (1 + 0.05 * p(t, 0, 5)))}) scale(${1 + 0.05 * p(t, 0, 5)})`}
            >
              {Array.from({ length: 800 }, (_, i) => {
                const x = i % 40,
                  y = Math.floor(i / 40),
                  bit = BITS[i % BITS.length];
                return (
                  <rect
                    key={i}
                    x={105 + x * 24}
                    y={7 + y * 24}
                    width={24}
                    height={24}
                    fill={
                      bitplane > 0.5
                        ? bit
                          ? `rgba(129,228,255,${0.35 + 0.65 * bitplane})`
                          : "#07111d"
                        : pixelColor(x, y, bit)
                    }
                    stroke={t > 3 ? "#25415b" : "none"}
                    strokeWidth={bitplane > 0.5 ? 0.5 : 0.16}
                    opacity={1}
                  />
                );
              })}
              <g opacity={1 - bitplane}>
                <circle cx="850" cy="90" r="31" fill="#c0e5f8" />
                <path
                  d="M105 450L270 225L390 370L540 195L720 430L870 320L1065 455V487H105Z"
                  fill="#0d2338"
                />
                <path
                  d="M105 470Q340 395 600 455T1065 435V487H105Z"
                  fill="#081625"
                />
              </g>
            </g>
            <path
              d={`M${105 + p(t, 4.5, 10.3) * 960} 7V487`}
              stroke={C.cyan}
              strokeWidth="2"
              opacity={windowAlpha(t, 4.5, 10.3)}
            />
            <rect
              x="105"
              y="7"
              width="960"
              height="480"
              fill="none"
              stroke="#396482"
            />
          </svg>
        </Panel>
        <div
          style={{
            position: "absolute",
            left: 155,
            top: 826,
            fontFamily: MONO,
            fontSize: 19,
            color: C.cyan,
            letterSpacing: 2,
            opacity: appear(t, 8.8),
          }}
        >
          {textSlice(
            "01100110 01101100 01100001 01100111 01111011",
            t,
            8.8,
            24,
          )}
        </div>
        <div
          style={{
            position: "absolute",
            left: 195,
            top: 355,
            width: 1020,
            height: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: appear(t, 11.1),
            background:
              "radial-gradient(ellipse,#040e1af5 10%,#040e1acc 62%,transparent 75%)",
            fontFamily: MONO,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 14,
                color: C.muted,
                letterSpacing: 4,
                marginBottom: 28,
              }}
            >
              BYTES RESTORED / UTF-8
            </div>
            <Glow style={{ fontSize: 36 }}>
              {textSlice(HIDDEN, t, 11.2, 13)}
            </Glow>
          </div>
        </div>
      </div>
      <Code
        t={t}
        title="IMAGE / LSB EXTRACTION"
        active={t < 5 ? 0 : t < 9 ? 3 : t < 11 ? 4 : t < 13 ? 7 : 8}
        lines={[
          'image = open("landscape.png")',
          "channel = image.blue",
          "",
          "bits = channel & 1",
          "stream = bits.flatten()",
          "",
          "# group every 8 bits",
          "message = decode(stream[:80])",
          "print(message)",
          "",
          "# hidden data restored",
        ]}
      />
      <Caption t={t} start={5.1} end={14.2} text="剥开像素，让隐藏通道开口。" />
      <div style={{ opacity: done }}>
        <Success t={t} start={14.4} flag={HIDDEN} />
      </div>
    </AbsoluteFill>
  );
};
