import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import evidence from "../data/range-evidence.json";

const RED = "#ff4762",
  BLUE = "#41caff",
  WHITE = "#edf5ff",
  MUTED = "#8a9eb3",
  GREEN = "#70e5b5";
const mono = '"Cascadia Code", Consolas, monospace';
const sat = (v: number) => Math.max(0, Math.min(1, v));
const ease = (v: number) => {
  const p = sat(v);
  return p * p * p * (p * (p * 6 - 15) + 10);
};
const progress = (t: number, start: number, d = 0.5) => ease((t - start) / d);
const response = (id: string) => evidence.events.find((e) => e.id === id)!;

type Line = {
  at: number;
  text: string;
  kind?: "command" | "result" | "muted" | "error";
};
const RED_ACCESS: Line[] = [
  { at: 2.1, text: "export PORTAL=http://portal.range.test", kind: "command" },
  { at: 3.1, text: 'curl -i "$PORTAL/api/records/202" \\', kind: "command" },
  { at: 3.7, text: '  -H "X-Range-User: alice"', kind: "command" },
  { at: 5.2, text: "HTTP/1.1 200 OK", kind: "result" },
  { at: 5.7, text: "owner: bob    identity: alice" },
  { at: 6.2, text: "record: 运维交接 / REQ-017" },
  { at: 7.0, text: "[+] object boundary crossed", kind: "result" },
];
const RED_TASK: Line[] = [
  { at: 14.0, text: "export OPS=http://ops.range.test", kind: "command" },
  { at: 14.35, text: 'curl -X POST "$OPS/ops/tasks" \\', kind: "command" },
  { at: 14.6, text: '  -H "X-Range-User: alice" \\', kind: "command" },
  { at: 15.1, text: '  -d \'{"action":"read_range_fixture",', kind: "command" },
  { at: 15.5, text: '       "target":"ops-01"}\'', kind: "command" },
  { at: 16.0, text: "HTTP/1.1 201 Created", kind: "result" },
  { at: 16.5, text: "task: TASK-042 → ops-01" },
  { at: 17.1, text: "file: range-evidence.txt" },
  { at: 17.7, text: "[+] RANGE_ACCESS_VERIFIED", kind: "result" },
];
const RED_RETRY: Line[] = [
  { at: 24.1, text: 'curl -i "$PORTAL/api/records/202" \\', kind: "command" },
  { at: 24.5, text: '  -H "X-Range-User: alice"', kind: "command" },
  { at: 25.0, text: "HTTP/1.1 403 Forbidden", kind: "error" },
  { at: 25.5, text: "source blocked / policy active", kind: "error" },
  { at: 26.1, text: 'curl -X POST "$OPS/ops/tasks"', kind: "command" },
  { at: 26.8, text: "HTTP/1.1 403 / node isolated", kind: "error" },
];
const BLUE_TRACE: Line[] = [
  {
    at: 10.0,
    text: "jq '.events[]|select(.id==\"REQ-017\")' \\",
    kind: "command",
  },
  { at: 10.4, text: "  range-evidence.json", kind: "command" },
  { at: 10.8, text: "identity: alice → object.owner: bob" },
  { at: 11.5, text: "status: 200 / authorization mismatch", kind: "result" },
  { at: 12.1, text: "trace: api-01 ← portal-01 ← XQ-017" },
  { at: 12.8, text: "[+] source session correlated", kind: "result" },
];
const BLUE_BLOCK: Line[] = [
  { at: 19.0, text: "export CTRL=http://control.range.test", kind: "command" },
  { at: 19.3, text: 'curl -X POST "$CTRL/control" \\', kind: "command" },
  { at: 19.5, text: '  -H "X-Range-Role: defender" \\', kind: "command" },
  {
    at: 20.0,
    text: '  -d \'{"blocked":true,"isolated":true}\'',
    kind: "command",
  },
  { at: 20.7, text: "HTTP/1.1 200 OK / policy applied", kind: "result" },
  { at: 21.2, text: "ops-01: ISOLATED", kind: "result" },
  { at: 21.8, text: "REQ-017 → REQ-018 → TASK-042" },
  { at: 22.5, text: "[+] attack path contained", kind: "result" },
];
const BLUE_FIX: Line[] = [
  { at: 29.1, text: 'curl -X POST "$CTRL/control" \\', kind: "command" },
  { at: 29.6, text: '  -H "X-Range-Role: defender" \\', kind: "command" },
  { at: 30.1, text: '  -d \'{"fixed":true,"blocked":false,', kind: "command" },
  { at: 30.5, text: '       "isolated":false}\'', kind: "command" },
  { at: 31.2, text: "[+] object ownership check enabled", kind: "result" },
  { at: 31.8, text: "[+] operations role check enabled", kind: "result" },
  { at: 34.0, text: "RETEST /api/records/202 → 403", kind: "result" },
  { at: 34.7, text: "RETEST /api/records/101 → 200", kind: "result" },
  { at: 35.4, text: "RETEST /ops/tasks → 403", kind: "result" },
  { at: 38.0, text: "[+] session closed / evidence saved", kind: "result" },
];

const Lock: React.FC<{
  x: number;
  y: number;
  color: string;
  open?: boolean;
  scale?: number;
}> = ({ x, y, color, open = false, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path
      d={open ? "M-10 0V-9a10 10 0 0 1 20-4" : "M-10 0V-10a10 10 0 0 1 20 0V0"}
      stroke={color}
      fill="none"
      strokeWidth="3"
    />
    <rect
      x="-16"
      y="0"
      width="32"
      height="25"
      rx="3"
      fill="#08121c"
      stroke={color}
      strokeWidth="2"
    />
    <circle cy="10" r="3" fill={color} />
  </g>
);

const Terminal: React.FC<{ blue: boolean; t: number }> = ({ blue, t }) => {
  const color = blue ? BLUE : RED;
  const lines = blue
    ? t < 19
      ? BLUE_TRACE
      : t < 29
        ? BLUE_BLOCK
        : BLUE_FIX
    : t < 14
      ? RED_ACCESS
      : t < 24
        ? RED_TASK
        : RED_RETRY;
  const start = blue
    ? t < 19
      ? 10
      : t < 29
        ? 19
        : 29
    : t < 14
      ? 2.0
      : t < 24
        ? 14
        : 24;
  const popup = progress(t, start, 0.42);
  return (
    <div
      style={{
        position: "absolute",
        left: 1200,
        top: 285,
        width: 635,
        height: 540,
        background: "#03080ff5",
        border: `1px solid ${color}88`,
        boxShadow: `0 24px 90px #0009,0 0 50px ${color}0c`,
        opacity: popup,
        transform: `translateY(${(1 - popup) * 46}px) scale(${0.97 + 0.03 * popup})`,
        transformOrigin: "center bottom",
      }}
    >
      <div
        style={{
          height: 48,
          padding: "15px 21px",
          borderBottom: `1px solid ${color}40`,
          font: `14px ${mono}`,
          letterSpacing: 2,
          color,
          display: "flex",
          alignItems: "center",
          gap: 9,
        }}
      >
        {[0, 1, 2].map((i) => (
          <i
            key={i}
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: i === 0 ? color : "#31404e",
            }}
          />
        ))}
        <span style={{ marginLeft: 10 }}>
          {blue ? "DEFENDER CONSOLE" : "ATTACK SHELL"}
        </span>
        <span style={{ marginLeft: "auto", color: MUTED, fontSize: 12 }}>
          XQ-017
        </span>
      </div>
      <div
        style={{ padding: "21px 22px", font: `19px ${mono}`, lineHeight: 1.55 }}
      >
        <div style={{ color: MUTED, fontSize: 14, marginBottom: 16 }}>
          xinqi@{blue ? "blue" : "red"}:~
        </div>
        {lines
          .filter((line) => t >= line.at)
          .map((line, i) => {
            const text =
              line.kind === "command"
                ? line.text.slice(0, Math.floor((t - line.at) * 95))
                : line.text;
            return (
              <div
                key={`${start}-${i}`}
                style={{
                  whiteSpace: "pre-wrap",
                  overflowWrap: "anywhere",
                  color:
                    line.kind === "command"
                      ? WHITE
                      : line.kind === "error"
                        ? RED
                        : line.kind === "result"
                          ? color
                          : MUTED,
                  marginTop: 5,
                  opacity: progress(t, line.at, 0.1),
                }}
              >
                {line.kind === "command" ? (
                  <span style={{ color }}>
                    {line.text.startsWith("  ") ? "> " : "$ "}
                  </span>
                ) : (
                  <span style={{ color: "#344b60" }}> </span>
                )}
                {text}
              </div>
            );
          })}
        <span
          style={{
            display: "inline-block",
            width: 9,
            height: 19,
            marginTop: 10,
            background: color,
            opacity: Math.floor(t * 2) % 2 ? 0.25 : 0.85,
          }}
        />
      </div>
    </div>
  );
};

const Chain: React.FC<{ blue: boolean; t: number }> = ({ blue, t }) => {
  const color = blue ? BLUE : RED,
    blocked = t >= 24,
    fixed = t >= 31.8;
  const nodes = [
    { x: 220, y: 540, name: "业务门户", id: "portal-01", active: 1.8 },
    { x: 500, y: 540, name: "业务 API", id: "api-01", active: 6 },
    { x: 780, y: 540, name: "运维节点", id: "ops-01", active: 16 },
    { x: 1060, y: 540, name: "文件服务", id: "files-01", active: 17.7 },
  ];
  const edges = [
    { a: 220, b: 500, start: 4, end: 6, breach: 5.2, label: "对象授权边界" },
    { a: 500, b: 780, start: 14, end: 16, breach: 15.1, label: "运维角色边界" },
    {
      a: 780,
      b: 1060,
      start: 16,
      end: 18,
      breach: 16.9,
      label: "内部访问链路",
    },
  ];
  return (
    <svg
      width="1190"
      height="820"
      style={{ position: "absolute", left: 0, top: 70, overflow: "visible" }}
    >
      <defs>
        <filter id={`glow-${blue}`}>
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      <path d="M220 325V540" stroke="#2c3a4a" strokeWidth="2" />
      <path
        d="M220 325V540"
        stroke={color}
        strokeWidth="3"
        pathLength={1}
        strokeDasharray="1"
        strokeDashoffset={1 - progress(t, 0.6, 1.2)}
      />
      <g transform="translate(220 304)">
        <circle r="42" fill="#09121f" stroke={color} strokeWidth="2" />
        <path
          d="M-19 9v-20h38V9zM-10 19h20"
          fill="none"
          stroke={color}
          strokeWidth="2"
        />
        <text x="67" y="0" fontSize="20" fill={WHITE}>
          会话 XQ-017
        </text>
        <text x="67" y="29" fontSize="13" fill={color} fontFamily={mono}>
          {blue
            ? t >= 12.8
              ? "SOURCE CORRELATED"
              : "TRACING SESSION"
            : "OPERATOR / XINQI"}
        </text>
      </g>
      {edges.map((edge, i) => {
        const x = (edge.a + edge.b) / 2,
          p =
            t < edge.breach
              ? 0.5 * progress(t, edge.start, edge.breach - edge.start)
              : 0.5 + 0.5 * progress(t, edge.breach, edge.end - edge.breach),
          burst = progress(t, edge.breach, 0.45),
          broken = t >= edge.breach;
        const harden = i < 2 ? progress(t, 29.6 + i * 0.7, 0.65) : 0,
          block =
            i === 1 && (blue || t >= 24) && !(blue && harden > 0)
              ? progress(t, blue ? 20.5 : 24, 0.65)
              : 0;
        return (
          <g key={i}>
            <path
              d={`M${edge.a} 540H${edge.b}`}
              stroke="#293b4d"
              strokeWidth="2"
            />
            <path
              d={`M${edge.a} 540H${edge.b}`}
              stroke={color}
              strokeWidth="4"
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset={1 - p}
              opacity={blocked && !blue ? 0.25 : 1}
            />
            <text x={x} y="648" textAnchor="middle" fill={MUTED} fontSize="17">
              {edge.label}
            </text>
            {!blue &&
              burst < 1 &&
              Array.from({ length: 8 }, (_, j) => {
                const sign = j % 2 ? 1 : -1;
                return (
                  <path
                    key={j}
                    d={`M${x + sign * burst * (30 + j * 5)} ${508 + j * 8 + sign * burst * 25}v7`}
                    stroke={broken ? RED : "#8d6170"}
                    strokeWidth="4"
                    opacity={1 - burst}
                    transform={`rotate(${sign * burst * 45} ${x} 540)`}
                  />
                );
              })}
            {!blue && broken && t < edge.breach + 0.65 && (
              <g opacity={1 - progress(t, edge.breach, 0.65)}>
                <circle
                  cx={x}
                  cy="540"
                  r={20 + burst * 65}
                  fill="none"
                  stroke={RED}
                  strokeWidth="2"
                />
                {Array.from({ length: 8 }, (_, j) => {
                  const a = (j * Math.PI) / 4;
                  return (
                    <path
                      key={j}
                      d={`M${x + Math.cos(a) * (20 + burst * 45)} ${540 + Math.sin(a) * (20 + burst * 45)}l${Math.cos(a) * 14} ${Math.sin(a) * 14}`}
                      stroke={RED}
                      strokeWidth="2"
                    />
                  );
                })}
              </g>
            )}
            {!blue && broken && !blocked && (
              <text
                x={x}
                y="486"
                textAnchor="middle"
                fill={RED}
                fontSize="13"
                fontFamily={mono}
              >
                BOUNDARY CROSSED
              </text>
            )}
            {blue && harden > 0 && (
              <g opacity={harden}>
                <path
                  d={`M${x - 35} 500L${x} 484L${x + 35} 500V546Q${x} 578 ${x - 35} 546Z`}
                  fill="#081b2d"
                  stroke={BLUE}
                  strokeWidth="2"
                />
                <Lock x={x} y={517} color={BLUE} scale={0.65} />
                <text
                  x={x}
                  y="602"
                  textAnchor="middle"
                  fill={BLUE}
                  fontSize="13"
                  fontFamily={mono}
                >
                  HARDENED
                </text>
              </g>
            )}
            {block > 0 && (
              <g opacity={block}>
                <path
                  d={`M${x} ${540 - 67 * block}V${540 + 67 * block}`}
                  stroke={BLUE}
                  strokeWidth="6"
                />
                <circle
                  cx={x}
                  cy="540"
                  r={21 + 7 * Math.sin(t * 4)}
                  stroke={BLUE}
                  fill="#072035"
                  strokeWidth="2"
                />
                <text
                  x={x}
                  y="548"
                  textAnchor="middle"
                  fontSize="25"
                  fill={BLUE}
                >
                  ×
                </text>
              </g>
            )}
            {!blocked &&
              p > 0.2 &&
              [0, 1, 2].map((j) => {
                const q = (t * 0.65 + j / 3) % 1;
                return (
                  <circle
                    key={j}
                    cx={edge.a + (edge.b - edge.a) * q}
                    cy="540"
                    r="4"
                    fill={color}
                    opacity={q <= p ? 0.9 : 0}
                  />
                );
              })}
          </g>
        );
      })}
      {((blue && t >= 19 && t < 24) || (!blue && t >= 24 && t < 28)) &&
        [0, 1, 2, 3].map((i) => {
          const q = (t * 0.8 + i / 4) % 1,
            x = 500 + Math.min(q / 0.8, 1) * 140;
          return (
            <g key={`blocked-packet-${i}`}>
              <circle
                cx={x}
                cy="540"
                r="4"
                fill={RED}
                opacity={q < 0.8 ? 1 : 0}
              />
              {q >= 0.8 && (
                <g opacity={1 - (q - 0.8) / 0.2}>
                  <circle
                    cx="640"
                    cy="540"
                    r={10 + (q - 0.8) * 150}
                    stroke={BLUE}
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d={`M${640 + (q - 0.8) * 80} ${540 - (q - 0.8) * 100}l8 -4M${640 + (q - 0.8) * 80} ${540 + (q - 0.8) * 100}l8 4`}
                    stroke={RED}
                    strokeWidth="2"
                  />
                </g>
              )}
            </g>
          );
        })}
      {nodes.map((node, i) => {
        const active = t >= node.active,
          detected = blue && t >= 10 && i === 1,
          isolated = blue && i === 2 && t >= 21 && t < 31.8;
        const appear = progress(t, i * 0.12, 0.5),
          grow = progress(t, 21, 0.55);
        return (
          <g key={node.id} opacity={appear}>
            {isolated && (
              <rect
                x={node.x - 112 * grow}
                y={540 - 79 * grow}
                width={224 * grow}
                height={158 * grow}
                rx="10"
                fill={`${BLUE}09`}
                stroke={BLUE}
                strokeWidth="2"
                strokeDasharray="8 7"
                strokeDashoffset={-t * 15}
              />
            )}
            {detected && t < 14 && (
              <circle
                cx={node.x}
                cy="540"
                r={67 + (((t - 10) * 55) % 90)}
                stroke={BLUE}
                strokeWidth="2"
                opacity={1 - (((t - 10) * 55) % 90) / 90}
                fill="none"
              />
            )}
            <rect
              x={node.x - 80}
              y="500"
              width="160"
              height="80"
              rx="5"
              fill={active ? "#111725" : "#08101b"}
              stroke={active ? color : "#395064"}
              strokeWidth={active ? 2 : 1}
            />
            <path
              d={`M${node.x - 23} 520h46v25h-46zM${node.x - 14} 556h28`}
              stroke={active ? color : MUTED}
              strokeWidth="2"
              fill="none"
            />
            <text
              x={node.x}
              y="688"
              textAnchor="middle"
              fill={WHITE}
              fontSize="25"
            >
              {node.name}
            </text>
            <text
              x={node.x}
              y="720"
              textAnchor="middle"
              fill={color}
              fontSize="15"
              fontFamily={mono}
            >
              {node.id}
            </text>
            <text
              x={node.x}
              y="473"
              textAnchor="middle"
              fill={isolated ? BLUE : fixed ? GREEN : color}
              fontSize="13"
              fontFamily={mono}
            >
              {isolated
                ? "ISOLATED"
                : fixed
                  ? "VERIFIED"
                  : active
                    ? blue
                      ? "MONITORED"
                      : "ACCESS CONFIRMED"
                    : "DISCOVERED"}
            </text>
          </g>
        );
      })}
      {blue && t >= 10 && t < 14 && (
        <>
          <path
            d="M500 540H220V325"
            stroke={BLUE}
            strokeWidth="4"
            fill="none"
            pathLength={1}
            strokeDasharray="1"
            strokeDashoffset={1 - progress(t, 10.5, 2.0)}
          />
          <circle
            cx={220}
            cy={540 - 215 * progress(t, 11.4, 1.2)}
            r="6"
            fill={BLUE}
          />
          <text x="365" y="407" fontSize="17" fill={BLUE}>
            请求 → 身份 → 源会话
          </text>
        </>
      )}
      {blocked && (
        <g opacity={progress(t, 24, 0.4)}>
          <rect
            x="376"
            y="353"
            width="530"
            height="64"
            rx="3"
            fill={blue ? "#072134" : "#220b13"}
            stroke={blue ? BLUE : RED}
          />
          <text
            x="641"
            y="394"
            textAnchor="middle"
            fontFamily={mono}
            fontSize="25"
            fill={blue ? BLUE : RED}
          >
            {fixed
              ? t >= 34
                ? "AUTHORIZATION VERIFIED"
                : "AUTHORIZATION HARDENED"
              : "403 / ATTACK PATH BLOCKED"}
          </text>
        </g>
      )}
    </svg>
  );
};

const ReportPage: React.FC<{ blue: boolean; t: number }> = ({ blue, t }) => {
  const color = blue ? BLUE : RED,
    local = t - (blue ? 38 : 35),
    finished = local >= 2.45;
  const sections = blue
    ? [
        ["01", "告警研判与溯源", "关联请求、身份、异常任务与源会话 XQ-017"],
        ["02", "防守处置与加固", "入口阻断、节点隔离、对象授权与运维角色检查"],
        [
          "03",
          "修复验证与归档",
          "异常访问 403 · 合法业务 200 · 临时任务已撤除",
        ],
      ]
    : [
        ["01", "入口与攻击链", "业务门户 → 业务 API → 运维节点 → 文件服务"],
        ["02", "证据与影响", "REQ-017 / TASK-042 · 跨身份访问与任务权限缺口"],
        ["03", "修复建议", "补齐对象授权；限制运维角色；修复后复测"],
      ];
  return (
    <AbsoluteFill
      style={{ background: blue ? "#030a12" : "#0b050b", color: WHITE }}
    >
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 25% 55%,${color}12,transparent 65%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 90,
          top: 65,
          font: `15px ${mono}`,
          letterSpacing: 4,
          color,
        }}
      >
        CHAPTER 02 / {blue ? "BLUE TEAM" : "RED TEAM"} / REPORT WRITING
      </div>
      <div
        style={{
          position: "absolute",
          right: 83,
          top: 55,
          display: "flex",
          alignItems: "center",
          gap: 15,
        }}
      >
        <Img src={staticFile("logo.svg")} style={{ width: 65, height: 65 }} />
        <span style={{ fontSize: 21, whiteSpace: "nowrap" }}>
          鑫启网安俱乐部
        </span>
      </div>
      <div
        style={{
          position: "absolute",
          left: 88,
          top: 125,
          fontSize: 52,
          fontWeight: 700,
          letterSpacing: 4,
        }}
      >
        {finished
          ? blue
            ? "蓝队报告，撰写完成。"
            : "红队报告，撰写完成。"
          : blue
            ? "撰写防守处置报告。"
            : "撰写渗透测试报告。"}
      </div>
      <div
        style={{
          position: "absolute",
          left: 90,
          top: 230,
          width: 1740,
          height: 665,
          border: `1px solid ${color}66`,
          background: "#06101af2",
          boxShadow: "0 24px 80px #0007",
        }}
      >
        <div
          style={{
            height: 58,
            borderBottom: `1px solid ${color}30`,
            display: "flex",
            alignItems: "center",
            padding: "0 30px",
            gap: 16,
            color,
            font: `17px ${mono}`,
            letterSpacing: 2,
          }}
        >
          <span style={{ width: 8, height: 8, background: color }} />
          {blue ? "blue-team-report.md" : "red-team-report.md"}
          <span style={{ marginLeft: "auto", color: finished ? GREEN : MUTED }}>
            {finished ? "SAVED" : "WRITING…"}
          </span>
        </div>
        <div style={{ position: "absolute", left: 42, top: 95, width: 1115 }}>
          {sections.map(([index, title, body], i) => {
            const p = progress(local, 0.65 + i * 0.38, 0.4),
              typed = body.slice(
                0,
                Math.floor(Math.max(0, local - 0.65 - i * 0.38) * 100),
              );
            return (
              <div
                key={index}
                style={{
                  height: 145,
                  opacity: p,
                  transform: `translateY(${(1 - p) * 12}px)`,
                  borderBottom: "1px solid #193045",
                  padding: "13px 0",
                }}
              >
                <div style={{ fontSize: 24, color, letterSpacing: 2 }}>
                  <span style={{ fontFamily: mono, marginRight: 21 }}>
                    {index}
                  </span>
                  {title}
                </div>
                <div
                  style={{
                    fontSize: 27,
                    color: WHITE,
                    lineHeight: 1.5,
                    marginTop: 20,
                    letterSpacing: 1,
                  }}
                >
                  {typed}
                  <span style={{ opacity: p < 1 ? 1 : 0, color }}>▌</span>
                </div>
              </div>
            );
          })}
        </div>
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 58,
            bottom: 0,
            width: 452,
            borderLeft: `1px solid ${color}30`,
            padding: "45px 33px",
          }}
        >
          <svg width="68" height="84" viewBox="0 0 68 84">
            <path
              d="M12 3H44L63 22V79H12Z M44 3V22H63"
              fill={`${color}0d`}
              stroke={color}
              strokeWidth="2"
            />
            <path
              d="M23 37H52M23 48H52M23 59H43"
              stroke={color}
              strokeWidth="2"
            />
            {finished && (
              <circle cx="50" cy="65" r="17" fill="#0d3028" stroke={GREEN} />
            )}
            {finished && (
              <path
                d="M42 65L48 71L59 58"
                stroke={GREEN}
                strokeWidth="3"
                fill="none"
              />
            )}
          </svg>
          <div
            style={{
              marginTop: 28,
              fontSize: 29,
              color: finished ? GREEN : color,
              fontWeight: 700,
            }}
          >
            {finished ? "报告已完成" : "整理证据，编写结论"}
          </div>
          <div style={{ font: `15px ${mono}`, color: MUTED, marginTop: 14 }}>
            SESSION XQ-017 / LOCAL ARCHIVE
          </div>
          <div style={{ height: 5, background: "#1c2d3e", marginTop: 38 }}>
            <div
              style={{
                height: "100%",
                width: `${progress(local, 0.55, 1.9) * 100}%`,
                background: finished ? GREEN : color,
              }}
            />
          </div>
          <div
            style={{
              marginTop: 18,
              font: `20px ${mono}`,
              color: finished ? GREEN : color,
            }}
          >
            {Math.round(progress(local, 0.55, 1.9) * 100)}%
          </div>
          <div
            style={{
              fontSize: 22,
              lineHeight: 2.1,
              marginTop: 38,
              color: MUTED,
            }}
          >
            {blue ? "处置措施 04 / 复测项目 03" : "发现问题 02 / 修复建议 02"}
            <br />
            {blue ? "研判 · 响应 · 加固 · 复测" : "发现 · 证据 · 影响 · 建议"}
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            left: 42,
            bottom: 30,
            font: `16px ${mono}`,
            letterSpacing: 3,
            color: finished ? GREEN : MUTED,
          }}
        >
          {finished
            ? "REPORT COMPLETE / EVIDENCE ATTACHED"
            : "COLLECTING EVIDENCE / DOCUMENTING FINDINGS"}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const OperationPage: React.FC<{ blue: boolean; t: number }> = ({ blue, t }) => {
  if ((blue && t >= 38) || (!blue && t >= 35))
    return <ReportPage blue={blue} t={t} />;
  const color = blue ? BLUE : RED,
    phase =
      t < 10
        ? 0
        : t < 14
          ? 1
          : t < 19
            ? 2
            : t < 24
              ? 3
              : t < 29
                ? 4
                : t < 34
                  ? 5
                  : t < 38
                    ? 6
                    : 7;
  const title = blue
    ? t < 19
      ? "循迹溯源，锁定异常。"
      : t < 29
        ? "加固边界，切断攻击。"
        : t < 34
          ? "修复权限，重建防线。"
          : t < 38
            ? "复测通过，业务如常。"
            : "演练结束，证据归档。"
    : t < 14
      ? "锁定入口，沿链深入。"
      : t < 24
        ? "越过边界，抵达目标。"
        : "重试原路，验证防线。";
  const milestones = blue
    ? ["事件发现", "会话溯源", "策略阻断", "节点隔离", "授权加固", "修复复测"]
    : ["入口侦察", "对象访问", "边界突破", "任务执行", "目标验证", "路径复测"];
  const times = blue
    ? [10, 12, 20.7, 21.2, 31.2, 34]
    : [0, 4, 5.2, 16, 17.7, 24];
  return (
    <AbsoluteFill
      style={{
        background: blue ? "#030a12" : "#0b050b",
        color: WHITE,
        overflow: "hidden",
      }}
    >
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 25% 54%,${color}14,transparent 65%)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${color}0b 1px,transparent 1px),linear-gradient(90deg,${color}0b 1px,transparent 1px)`,
          backgroundSize: "80px 80px",
          opacity: 0.6,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 90,
          top: 65,
          font: `15px ${mono}`,
          letterSpacing: 4,
          color,
        }}
      >
        CHAPTER 02 / {blue ? "DEFENSIVE OPERATIONS" : "OFFENSIVE OPERATIONS"}
      </div>
      <div
        style={{
          position: "absolute",
          left: 88,
          top: 111,
          display: "flex",
          alignItems: "center",
          gap: 22,
        }}
      >
        <span
          style={{
            font: `bold 26px ${mono}`,
            color,
            padding: "9px 14px",
            border: `1px solid ${color}66`,
          }}
        >
          {blue ? "BLUE TEAM" : "RED TEAM"}
        </span>
        <span style={{ fontSize: 21, color: MUTED, letterSpacing: 3 }}>
          {blue ? "监测 · 加固 · 阻断 · 溯源" : "侦察 · 突破 · 执行 · 验证"}
        </span>
      </div>
      <div
        style={{
          position: "absolute",
          left: 88,
          top: 177,
          fontSize: 52,
          fontWeight: 700,
          letterSpacing: 4,
        }}
      >
        {title}
      </div>
      <div
        style={{
          position: "absolute",
          right: 83,
          top: 55,
          display: "flex",
          alignItems: "center",
          gap: 15,
        }}
      >
        <Img src={staticFile("logo.svg")} style={{ width: 65, height: 65 }} />
        <span style={{ fontSize: 21, whiteSpace: "nowrap" }}>
          鑫启网安俱乐部
        </span>
      </div>
      <div
        style={{
          position: "absolute",
          left: 91,
          top: 283,
          font: `14px ${mono}`,
          letterSpacing: 3,
          color: MUTED,
        }}
      >
        {blue
          ? "DEFENSE MAP / CORRELATE & CONTAIN"
          : "ATTACK CHAIN / REQ-017 → TASK-042"}
      </div>
      <Chain blue={blue} t={t} />
      <Terminal blue={blue} t={t} />
      <div
        style={{
          position: "absolute",
          left: 90,
          top: 854,
          width: 1745,
          height: 65,
          display: "flex",
          gap: 17,
        }}
      >
        {(t >= 34
          ? [
              ["越界访问", String(response("RETEST-OBJECT").status), color],
              ["合法业务", String(response("RETEST-LEGAL").status), GREEN],
              ["运维接口", String(response("RETEST-ROLE").status), color],
            ]
          : blue
            ? [
                ["事件关联", "REQ-017 → TASK-042", color],
                [
                  "防守状态",
                  t >= 21
                    ? "隔离已生效"
                    : t >= 10
                      ? "源会话已定位"
                      : "基线监测",
                  color,
                ],
                [
                  "处置阶段",
                  t >= 29
                    ? "应用层授权修复"
                    : t >= 19
                      ? "阻断与隔离"
                      : "请求与身份关联",
                  color,
                ],
              ]
            : [
                ["访问身份", "alice → bob", color],
                [
                  "攻击位置",
                  t >= 16 ? "ops-01 → files-01" : "portal-01 → api-01",
                  color,
                ],
                [
                  "请求结果",
                  t >= 25
                    ? "403 / DENIED"
                    : t >= 16
                      ? "201 / TASK CREATED"
                      : t >= 5.2
                        ? "200 / OBJECT READ"
                        : "ENUMERATING",
                  color,
                ],
              ]
        ).map(([label, value, tint]) => (
          <div
            key={label}
            style={{
              flex: 1,
              background: `${tint}07`,
              borderLeft: `2px solid ${tint}`,
              padding: "10px 18px",
              display: "flex",
              alignItems: "center",
              gap: 22,
            }}
          >
            <span style={{ fontSize: 17, color: MUTED }}>{label}</span>
            <span style={{ font: `21px ${mono}`, color: tint }}>{value}</span>
          </div>
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          left: 90,
          right: 90,
          top: 958,
          display: "flex",
          gap: 14,
        }}
      >
        {milestones.map((label, i) => (
          <div
            key={label}
            style={{
              flex: 1,
              borderTop: `2px solid ${t >= times[i] ? color : "#263445"}`,
              paddingTop: 12,
              color: t >= times[i] ? WHITE : MUTED,
              fontSize: 19,
            }}
          >
            <span style={{ fontFamily: mono, color, marginRight: 14 }}>
              0{i + 1}
            </span>
            {label}
          </div>
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          right: 90,
          bottom: 26,
          color: MUTED,
          font: `12px ${mono}`,
          letterSpacing: 3,
        }}
      >
        SESSION XQ-017 / {String(phase + 1).padStart(2, "0")}
      </div>
      {t >= 38 && (
        <div
          style={{
            position: "absolute",
            left: 90,
            top: 814,
            color: GREEN,
            font: `14px ${mono}`,
            letterSpacing: 3,
          }}
        >
          EXERCISE COMPLETE / SESSION CLOSED / EVIDENCE SAVED
        </div>
      )}
    </AbsoluteFill>
  );
};

export const RangeLaunch: React.FC = () => <OperationPage blue={false} t={0} />;

export function cameraPosition(t: number) {
  let camera = 0;
  for (const [at, target] of [
    [10, 1],
    [14, 0],
    [19, 1],
    [24, 0],
    [29, 1],
    [35, 0],
    [38, 1],
  ]) {
    if (t < at) break;
    camera = camera + (target - camera) * progress(t, at, 0.6);
  }
  return camera;
}

export const RangeScene: React.FC = () => {
  const t = useCurrentFrame() / 30,
    camera = cameraPosition(t);
  if (t >= 41) return <AbsoluteFill style={{ background: "#000" }} />;
  return (
    <AbsoluteFill style={{ background: "#03080f", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          width: 3840,
          height: 1080,
          display: "flex",
          transform: `translateX(${-1920 * camera}px)`,
        }}
      >
        {[false, true].map((blue) => (
          <div
            key={String(blue)}
            style={{
              position: "absolute",
              left: blue ? 1920 : 0,
              width: 1920,
              height: 1080,
            }}
          >
            <OperationPage blue={blue} t={t} />
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
