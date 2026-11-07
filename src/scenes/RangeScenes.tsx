import React from "react";
import { AbsoluteFill, Freeze, useCurrentFrame } from "remotion";
import { FinaleScene } from "./StoryScenes";
import evidence from "../data/range-evidence.json";

const R = "#ff4762",
  B = "#42c9ff",
  W = "#edf5ff",
  M = "#8398ac",
  G = "#70e5b5";
const mono = '"Cascadia Code", Consolas, monospace';
const sat = (v: number) => Math.max(0, Math.min(1, v));
const ease = (v: number) => {
  const p = sat(v);
  return p * p * p * (p * (p * 6 - 15) + 10);
};
const show = (t: number, start: number, duration = 0.45) =>
  ease((t - start) / duration);
const result = (id: string) => evidence.events.find((e) => e.id === id)!;

const Environment: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill style={{ background: "#03080f", color: W, overflow: "hidden" }}>
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at 8% 55%,#50101c35,transparent 52%),radial-gradient(ellipse at 92% 50%,#06466c40,transparent 52%)",
      }}
    />
    <AbsoluteFill
      style={{
        backgroundImage:
          "linear-gradient(#19314435 1px,transparent 1px),linear-gradient(90deg,#19314435 1px,transparent 1px)",
        backgroundSize: "72px 72px",
        opacity: 0.38,
        transform: `translateY(${(t * 2) % 72}px)`,
      }}
    />
    <div
      style={{
        position: "absolute",
        left: 76,
        right: 76,
        top: 55,
        borderTop: "1px solid #254357",
        opacity: 0.5,
      }}
    />
    <div
      style={{
        position: "absolute",
        left: 80,
        bottom: 37,
        color: M,
        font: `13px ${mono}`,
        letterSpacing: 2,
      }}
    >
      LOCAL RANGE / VERIFIED HTTP EVIDENCE
    </div>
    <div
      style={{
        position: "absolute",
        right: 80,
        bottom: 37,
        color: M,
        fontSize: 17,
        letterSpacing: 2,
      }}
    >
      剧情演示 · 授权靶场演练
    </div>
  </AbsoluteFill>
);

const Team: React.FC<{
  blue?: boolean;
  active?: boolean;
  children: React.ReactNode;
}> = ({ blue = false, active = true, children }) => (
  <div
    style={{
      display: "flex",
      gap: 16,
      alignItems: "center",
      color: blue ? B : R,
      opacity: active ? 1 : 0.5,
      font: `bold 21px ${mono}`,
      letterSpacing: 3,
    }}
  >
    <span
      style={{
        width: 10,
        height: 10,
        background: blue ? B : R,
        boxShadow: active ? `0 0 22px ${blue ? B : R}` : undefined,
      }}
    />
    {blue ? "BLUE TEAM" : "RED TEAM"}
    <span
      style={{
        fontSize: 19,
        fontFamily: '"Noto Sans SC"',
        letterSpacing: 3,
        color: W,
        fontWeight: 400,
      }}
    >
      {children}
    </span>
  </div>
);

export const InvitationScene: React.FC = () => {
  const t = useCurrentFrame() / 30;
  const opened = show(t, 2, 0.5),
    enter = show(t, 5.5, 0.3),
    split = show(t, 7, 0.75);
  return (
    <AbsoluteFill style={{ color: W, overflow: "hidden" }}>
      <Freeze frame={779}>
        <FinaleScene />
      </Freeze>
      <AbsoluteFill
        style={{ background: "#020810", opacity: 0.3 + opened * 0.65 }}
      />
      <div
        style={{
          position: "absolute",
          right: 92,
          top: 82,
          width: 690,
          padding: "26px 30px",
          background: "#0a1827f5",
          border: "1px solid #3c637d",
          boxShadow: "0 20px 80px #0009",
          opacity: show(t, 0, 0.3) * (1 - opened),
          transform: `translateX(${(1 - show(t, 0, 0.6)) * 150}px)`,
        }}
      >
        <div
          style={{
            font: `15px ${mono}`,
            color: B,
            letterSpacing: 3,
            marginBottom: 12,
          }}
        >
          NEW MESSAGE / 演练协调组
        </div>
        <div style={{ fontSize: 29 }}>护网行动·联合攻防演练邀请</div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 210,
          top: 153,
          width: 1500,
          height: 752,
          background: "#0a1420",
          border: "1px solid #365168",
          boxShadow: "0 35px 150px #000a",
          opacity: opened * (1 - split),
          transform: `translateY(${(1 - opened) * 50}px) scale(${1 - enter * 0.015})`,
        }}
      >
        <div
          style={{
            height: 61,
            padding: "18px 36px",
            font: `16px ${mono}`,
            color: M,
            borderBottom: "1px solid #263c4f",
            letterSpacing: 3,
          }}
        >
          INBOX / INVITATION <span style={{ float: "right" }}>01 / UNREAD</span>
        </div>
        <div style={{ padding: "35px 52px" }}>
          <div style={{ color: B, font: `14px ${mono}`, letterSpacing: 4 }}>
            NEXT CHAPTER / JOINT EXERCISE
          </div>
          <div
            style={{
              fontSize: 46,
              fontWeight: 700,
              letterSpacing: 3,
              marginTop: 15,
            }}
          >
            护网行动·联合攻防演练邀请
          </div>
          <div
            style={{
              display: "flex",
              gap: 52,
              color: M,
              fontSize: 22,
              marginTop: 24,
              paddingBottom: 24,
              borderBottom: "1px solid #283c50",
            }}
          >
            <span>发件人　演练协调组（虚构）</span>
            <span>
              收件人　
              <span style={{ color: W, whiteSpace: "nowrap" }}>
                鑫启网安俱乐部
              </span>
            </span>
          </div>
          <div
            style={{
              fontSize: 30,
              lineHeight: 1.9,
              marginTop: 27,
              letterSpacing: 1,
            }}
          >
            现邀请贵团队参加本次联合攻防演练。
            <br />
            在授权环境内，开展渗透验证、监测响应与复盘。
          </div>
          <div style={{ display: "flex", gap: 26, marginTop: 25 }}>
            {[false, true].map((blue) => (
              <div
                key={String(blue)}
                style={{
                  flex: 1,
                  borderLeft: `3px solid ${blue ? B : R}`,
                  background: `${blue ? B : R}0a`,
                  padding: "17px 23px",
                }}
              >
                <Team blue={blue}>{blue ? "监测 · 响应" : "渗透 · 验证"}</Team>
              </div>
            ))}
          </div>
          <div
            style={{
              position: "absolute",
              right: 52,
              bottom: 37,
              background: enter ? "#137399" : "#115775",
              border: `1px solid ${B}`,
              padding: "17px 34px",
              fontSize: 28,
              boxShadow: enter ? `0 0 35px ${B}44` : undefined,
            }}
          >
            进入演练　→
          </div>
          <div
            style={{
              position: "absolute",
              left: 52,
              bottom: 56,
              fontSize: 17,
              color: M,
            }}
          >
            剧情演示邮件 · 授权靶场演练
          </div>
          <svg
            style={{
              position: "absolute",
              left: 1248,
              top: 614,
              transform: `translate(${(1 - show(t, 4.8, 0.7)) * 120}px,${(1 - show(t, 4.8, 0.7)) * 85}px)`,
              opacity: show(t, 4.5, 0.3),
            }}
            width="35"
            height="45"
          >
            <path
              d="M2 2L29 25 18 27 25 42 18 45 11 30 2 39Z"
              fill={W}
              stroke="#03080f"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>
      {split > 0 && (
        <AbsoluteFill style={{ background: "#03080f", opacity: split }}>
          <Environment t={t} />
          <div
            style={{
              position: "absolute",
              left: 100,
              top: 185,
              transform: `translateX(${(1 - split) * 250}px)`,
            }}
          >
            <Team>渗透验证</Team>
          </div>
          <div
            style={{
              position: "absolute",
              left: 1050,
              top: 185,
              transform: `translateX(${-(1 - split) * 250}px)`,
            }}
          >
            <Team blue>监测响应</Team>
          </div>
          <svg width="1920" height="1080" style={{ position: "absolute" }}>
            {[R, B].map((color, i) => (
              <path
                key={color}
                d={`M960 550L${i ? 1620 : 300} 550V760`}
                stroke={color}
                strokeWidth="2"
                strokeDasharray="1200"
                strokeDashoffset={1200 * (1 - split)}
                fill="none"
              />
            ))}
          </svg>
          <div
            style={{
              position: "absolute",
              top: 405,
              width: "100%",
              textAlign: "center",
              fontSize: 63,
              letterSpacing: 12,
              opacity: split,
            }}
          >
            从赛场，走向现场。
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

const Window: React.FC<{
  x: number;
  color: string;
  title: string;
  active?: boolean;
  children: React.ReactNode;
}> = ({ x, color, title, active = true, children }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: 271,
      width: 836,
      height: 371,
      border: `1px solid ${color}${active ? "88" : "30"}`,
      background: "#07121ef5",
      boxShadow: active ? `0 18px 80px ${color}0c` : undefined,
      opacity: active ? 1 : 0.62,
      transition: undefined,
    }}
  >
    <div
      style={{
        height: 45,
        borderBottom: `1px solid ${color}30`,
        padding: "13px 20px",
        color,
        font: `14px ${mono}`,
        letterSpacing: 2,
      }}
    >
      <span
        style={{
          display: "inline-block",
          width: 6,
          height: 6,
          background: color,
          marginRight: 12,
        }}
      />
      {title}
    </div>
    <div style={{ padding: "23px 28px" }}>{children}</div>
  </div>
);

const LogLine: React.FC<{
  time: string;
  color?: string;
  children: React.ReactNode;
}> = ({ time, color = M, children }) => (
  <div
    style={{
      display: "flex",
      gap: 17,
      marginTop: 14,
      fontSize: 21,
      lineHeight: 1.45,
    }}
  >
    <span style={{ fontFamily: mono, fontSize: 17, color: M, paddingTop: 3 }}>
      {time}
    </span>
    <span style={{ color }}>{children}</span>
  </div>
);

const Topology: React.FC<{ t: number }> = ({ t }) => {
  const block = t >= 24,
    close = t >= 38,
    red = t >= 4 && t < 29,
    blue = t >= 10;
  const nodes = [
    { x: 290, name: "业务门户", id: "portal-01" },
    { x: 720, name: "业务 API", id: "api-01" },
    { x: 1150, name: "运维节点", id: "ops-01" },
    { x: 1580, name: "文件服务", id: "files-01" },
  ];
  const progress = sat((t - 4) / 3),
    extended = sat((t - 14) / 3);
  const converge = show(t, 40, 2);
  return (
    <svg
      width="1920"
      height="1080"
      style={{ position: "absolute", inset: 0, opacity: 1 - converge }}
    >
      <path d="M290 765H1580" stroke="#294355" strokeWidth="2" />
      {red && (
        <path
          d={`M290 765H${t < 14 ? 290 + 430 * progress : 720 + 860 * extended}`}
          stroke={R}
          strokeWidth="4"
          opacity={block ? 0.15 : 0.9}
          strokeDasharray={block ? "8 12" : undefined}
        />
      )}
      {blue && (
        <path
          d="M720 765H1580"
          stroke={B}
          strokeWidth="2"
          strokeDasharray="14 12"
          strokeDashoffset={-t * 35}
          opacity={block ? 0.85 : 0.3}
        />
      )}
      {nodes.map((n, i) => {
        const hot =
            red &&
            !block &&
            (i <= 1 || (i === 2 && t >= 14) || (i === 3 && t >= 16)),
          safe = blue && (block || i === 1),
          color = safe ? B : hot ? R : M;
        const isolation = i === 2 && t >= 21 && t < 34;
        return (
          <g key={n.id} opacity={show(t, i * 0.18)}>
            {isolation && (
              <rect
                x={n.x - 104}
                y="695"
                width="208"
                height="155"
                rx="10"
                fill={`${B}08`}
                stroke={B}
                strokeDasharray="7 6"
              />
            )}
            <rect
              x={n.x - 83}
              y="725"
              width="166"
              height="82"
              rx="4"
              fill="#081522"
              stroke={color}
              strokeWidth="2"
            />
            <path
              d={`M${n.x - 22} 750h44v23h-44zM${n.x - 14} 782h28`}
              stroke={color}
              strokeWidth="2"
              fill="none"
            />
            <text
              x={n.x}
              y="875"
              fill={W}
              textAnchor="middle"
              fontSize="26"
              fontFamily="Noto Sans SC"
            >
              {n.name}
            </text>
            <text
              x={n.x}
              y="906"
              fill={color}
              textAnchor="middle"
              fontSize="16"
              fontFamily={mono}
            >
              {n.id}
            </text>
            {isolation && (
              <text
                x={n.x}
                y="714"
                fill={B}
                textAnchor="middle"
                fontSize="12"
                fontFamily={mono}
              >
                ISOLATED
              </text>
            )}
          </g>
        );
      })}
      {red &&
        !block &&
        [0, 1, 2].map((i) => {
          const x = 290 + ((t * 0.35 + i / 3) % 1) * (t < 14 ? 430 : 1290);
          return (
            <path
              key={i}
              d={`M${x - 9} 756l12 9-12 9`}
              stroke={R}
              fill="none"
              strokeWidth="3"
            />
          );
        })}
      {block && t < 29 && (
        <g>
          <path d="M940 724V807" stroke={B} strokeWidth="7" />
          <circle
            cx="940"
            cy="765"
            r={18 + 12 * Math.exp(-(t - 24) * 2)}
            stroke={B}
            fill="#081b2a"
            strokeWidth="2"
          />
          <text x="940" y="773" textAnchor="middle" fill={B} fontSize="23">
            ×
          </text>
        </g>
      )}
      <text
        x="95"
        y="700"
        fill={M}
        fontFamily={mono}
        fontSize="13"
        letterSpacing="3"
      >
        SHARED TOPOLOGY / SAME EVENT CHAIN
      </text>
      {close && (
        <text
          x="1770"
          y="700"
          fill={G}
          textAnchor="end"
          fontFamily={mono}
          fontSize="16"
        >
          SESSION CLOSED
        </text>
      )}
    </svg>
  );
};

export const RangeScene: React.FC = () => {
  const t = useCurrentFrame() / 30;
  const attack = (t >= 4 && t < 10) || (t >= 14 && t < 19);
  const defend = (t >= 10 && t < 14) || (t >= 19 && t < 29);
  const review = t >= 29,
    retest = t >= 34,
    closed = t >= 38;
  const phase =
    t < 4
      ? 0
      : t < 10
        ? 1
        : t < 14
          ? 2
          : t < 19
            ? 3
            : t < 24
              ? 4
              : t < 29
                ? 5
                : t < 34
                  ? 6
                  : t < 38
                    ? 7
                    : 8;
  const titles = [
    "同一张网络，两种视角。",
    "改写对象，试探边界。",
    "循迹而至，锁定异常。",
    "沿权限缺口，继续深入。",
    "关联事件，切断链路。",
    "路径被拒，业务仍在。",
    "以攻验防，以证复盘。",
    "补齐边界，再验一次。",
    "演练结束，证据归档。",
  ];
  const resolve = show(t, 40, 2);
  const phaseStart = [0, 4, 10, 14, 19, 24, 29, 34, 38][phase];
  const perspective = 1 - show(t, phaseStart, 0.5);
  return (
    <AbsoluteFill style={{ color: W, overflow: "hidden" }}>
      <Environment t={t} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 1 - resolve,
          transform: `translateX(${(attack ? -1 : defend ? 1 : 0) * perspective * 12}px) scale(${1 - resolve * 0.035 + perspective * 0.008})`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 90,
            top: 85,
            color: M,
            font: `15px ${mono}`,
            letterSpacing: 5,
          }}
        >
          CHAPTER 02 / JOINT CYBER EXERCISE
        </div>
        <div
          style={{
            position: "absolute",
            left: 88,
            top: 123,
            fontSize: 49,
            fontWeight: 700,
            letterSpacing: 4,
          }}
        >
          {titles[phase]}
        </div>
        <div
          style={{
            position: "absolute",
            right: 90,
            top: 90,
            color: B,
            fontSize: 19,
            border: `1px solid ${B}50`,
            padding: "12px 18px",
            letterSpacing: 3,
          }}
        >
          授权靶场演练
        </div>
        <div style={{ position: "absolute", left: 100, top: 218 }}>
          <Team active={!defend}>渗透验证</Team>
        </div>
        <div style={{ position: "absolute", left: 1010, top: 218 }}>
          <Team blue active={!attack}>
            监测响应
          </Team>
        </div>
        <Window
          x={88}
          color={R}
          active={!defend}
          title={
            review
              ? "RED TEAM / EVIDENCE & RETEST"
              : t < 14
                ? "portal.range.test / BUSINESS API"
                : "RED TEAM / OPERATIONS TASK"
          }
        >
          {!review && t < 14 ? (
            <>
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  color: M,
                  fontSize: 16,
                  marginBottom: 21,
                }}
              >
                <span style={{ color: W }}>业务门户</span>
                <span> / 项目记录 / 当前身份 alice</span>
                <span style={{ marginLeft: "auto", color: R }}>
                  {t < 4 ? "BASE-001" : "REQ-017"}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  alignItems: "center",
                  fontFamily: mono,
                  fontSize: 27,
                }}
              >
                <span style={{ color: R }}>GET</span>
                <span>
                  /api/records/
                  <span
                    style={{
                      background: t >= 4 ? `${R}28` : undefined,
                      color: t >= 4 ? R : W,
                      padding: "3px 8px",
                    }}
                  >
                    {t < 4 ? "101" : "202"}
                  </span>
                </span>
              </div>
              <div
                style={{
                  marginTop: 24,
                  padding: "20px 23px",
                  background: "#0e1d2a",
                  borderLeft: `3px solid ${t >= 4 ? R : B}`,
                  display: "flex",
                  gap: 60,
                  fontSize: 25,
                }}
              >
                <div>
                  <div style={{ color: M, fontSize: 16, marginBottom: 10 }}>
                    访问身份
                  </div>
                  alice
                </div>
                <div>
                  <div style={{ color: M, fontSize: 16, marginBottom: 10 }}>
                    对象所属
                  </div>
                  {t < 4 ? "alice" : "bob"}
                </div>
                <div style={{ marginLeft: "auto", color: t >= 4 ? R : G }}>
                  {t >= 4
                    ? result("REQ-017").status
                    : result("BASE-001").status}{" "}
                  OK
                </div>
              </div>
              <div
                style={{ fontSize: 21, marginTop: 19, color: t >= 4 ? R : M }}
              >
                {t < 4
                  ? "正常业务基线 / 门户联调"
                  : "身份未变，对象跨越；授权检查缺失。"}
              </div>
              <div style={{ color: M, fontSize: 17, marginTop: 12 }}>
                返回业务记录：
                {String(
                  (t < 4 ? result("BASE-001") : result("REQ-017")).response
                    .project,
                )}
              </div>
            </>
          ) : !review ? (
            <>
              <div style={{ font: `16px ${mono}`, color: M }}>
                REQ-017 → REQ-018 → TASK-042
              </div>
              <div style={{ fontSize: 28, marginTop: 21 }}>
                运维任务　
                <span style={{ color: R, fontFamily: mono }}>TASK-042</span>
              </div>
              <LogLine time="TARGET" color={W}>
                ops-01 → files-01
              </LogLine>
              <LogLine time="ACTION" color={W}>
                读取内置演练证明文件
              </LogLine>
              <div
                style={{
                  marginTop: 24,
                  borderLeft: `3px solid ${t >= 24 ? B : R}`,
                  padding: "13px 20px",
                  background: "#14202b",
                  font: `22px ${mono}`,
                  color: t >= 24 ? B : R,
                }}
              >
                {t >= 24
                  ? `${result("RETEST-BLOCK").status} / REQUEST DENIED`
                  : t >= 16
                    ? `${result("REQ-018").status} / PROOF VERIFIED`
                    : "TASK ACCEPTED / PROCESSING…"}
              </div>
            </>
          ) : (
            <>
              <div style={{ font: `15px ${mono}`, color: M }}>
                EVIDENCE CHAIN / REQ-017 → TASK-042
              </div>
              <LogLine time="01" color={W}>
                对象授权缺失 → 补齐所属者检查
              </LogLine>
              <LogLine time="02" color={W}>
                运维角色缺失 → 限制任务创建权限
              </LogLine>
              <div style={{ display: "flex", gap: 13, marginTop: 28 }}>
                {(retest
                  ? [
                      ["越界访问", result("RETEST-OBJECT").status, R],
                      ["合法业务", result("RETEST-LEGAL").status, G],
                    ]
                  : [
                      ["证据编号", "E-017", R],
                      ["关联任务", "TASK-042", R],
                    ]
                ).map(([label, value, color]) => (
                  <div
                    key={String(label)}
                    style={{
                      flex: 1,
                      padding: "15px 20px",
                      border: `1px solid ${color}50`,
                      background: `${color}08`,
                    }}
                  >
                    <div style={{ fontSize: 16, color: M }}>{label}</div>
                    <div
                      style={{
                        font: `bold 34px ${mono}`,
                        color: String(color),
                        marginTop: 8,
                      }}
                    >
                      {value}
                    </div>
                  </div>
                ))}
              </div>
              {retest && (
                <div style={{ fontSize: 16, color: M, marginTop: 16 }}>
                  已撤临时来源封禁；403来自应用授权检查。
                </div>
              )}
            </>
          )}
        </Window>
        <Window
          x={996}
          color={B}
          active={!attack}
          title={
            review
              ? "BLUE TEAM / FIX VALIDATION"
              : "BLUE TEAM / SECURITY OPERATIONS"
          }
        >
          {t < 10 ? (
            <>
              <div style={{ fontSize: 29 }}>业务基线 / 正常运行</div>
              <LogLine time="API" color={B}>
                身份、对象、来源持续关联
              </LogLine>
              <LogLine time="OPS" color={M}>
                运维任务审计 · 事件链待触发
              </LogLine>
              <svg width="750" height="83" style={{ marginTop: 26 }}>
                <path
                  d={`M0 55 ${Array.from({ length: 40 }, (_, i) => `L${i * 19} ${45 - Math.sin(i * 0.8 + t) * 8 - (i % 9 === 0 ? 22 : 0)}`).join(" ")}`}
                  stroke={B}
                  strokeWidth="2"
                  fill="none"
                />
                <path d="M0 75H750" stroke="#254255" />
              </svg>
            </>
          ) : t < 19 ? (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  fontSize: 27,
                  color: B,
                }}
              >
                异常对象访问{" "}
                <span
                  style={{
                    font: `15px ${mono}`,
                    border: `1px solid ${B}66`,
                    padding: "8px 12px",
                  }}
                >
                  REQ-017
                </span>
              </div>
              <LogLine time="USER" color={W}>
                alice → 对象所属 bob
              </LogLine>
              <LogLine time="TRACE" color={W}>
                api-01 / 同一会话 / 跨身份请求
              </LogLine>
              <div
                style={{
                  marginTop: 26,
                  padding: "17px 20px",
                  background: `${B}0b`,
                  borderLeft: `3px solid ${B}`,
                  fontSize: 22,
                }}
              >
                {t < 14 ? "对象所属与访问身份不一致" : "关联异常任务 TASK-042"}
                <br />
                <span style={{ fontSize: 16, color: M }}>
                  {t < 14
                    ? "REQ-017 / 异常会话持续跟踪"
                    : "REQ-017 → REQ-018 → ops-01"}
                </span>
              </div>
            </>
          ) : t < 29 ? (
            <>
              <LogLine time="LINK" color={W}>
                请求、任务与运维节点已关联
              </LogLine>
              <LogLine time="POLICY" color={B}>
                {t < 20.4 ? "下发临时阻断策略…" : "✓ 入口策略生效"}
              </LogLine>
              <LogLine time="ISOLATE" color={B}>
                {t < 21 ? "确认受影响节点…" : "✓ ops-01 进入隔离"}
              </LogLine>
              <div
                style={{
                  marginTop: 27,
                  font: `bold 30px ${mono}`,
                  color: t >= 24 ? G : B,
                }}
              >
                {t >= 24 ? "ATTACK PATH CONTAINED" : "RESPONSE IN PROGRESS"}
              </div>
            </>
          ) : (
            <>
              <LogLine time="AUTH" color={B}>
                对象所属者检查已生效
              </LogLine>
              <LogLine time="ROLE" color={B}>
                运维接口角色检查已生效
              </LogLine>
              <LogLine time="RETEST" color={retest ? G : M}>
                {retest
                  ? "越界访问拒绝 / 合法业务成功"
                  : "临时封禁撤回，准备应用层复测"}
              </LogLine>
              <div
                style={{
                  marginTop: 23,
                  font: `bold 28px ${mono}`,
                  color: closed ? G : B,
                }}
              >
                {closed
                  ? "EXERCISE COMPLETE"
                  : retest
                    ? "FIX VERIFIED / BUSINESS HEALTHY"
                    : "JOINT REVIEW / REMEDIATION"}
              </div>
              {closed && (
                <div style={{ marginTop: 13, color: M, fontSize: 17 }}>
                  临时测试任务已撤除 · 审计证据已归档
                </div>
              )}
            </>
          )}
        </Window>
        <Topology t={t} />
        <div
          style={{
            position: "absolute",
            left: 88,
            right: 88,
            top: 951,
            display: "flex",
            gap: 8,
          }}
        >
          {[
            "建立基线",
            "入口验证",
            "事件发现",
            "任务关联",
            "阻断隔离",
            "修复复测",
            "归档收束",
          ].map((label, i) => {
            const starts = [0, 4, 10, 14, 19, 29, 38];
            return (
              <div
                key={label}
                style={{
                  flex: 1,
                  borderTop: `2px solid ${t >= starts[i] ? (i === 1 || i === 3 ? R : B) : "#1d3345"}`,
                  paddingTop: 12,
                  fontSize: 17,
                  color: t >= starts[i] ? W : M,
                }}
              >
                {String(i + 1).padStart(2, "0")}　{label}
              </div>
            );
          })}
        </div>
      </div>
      {resolve > 0 && (
        <svg width="1920" height="1080" style={{ position: "absolute" }}>
          {[R, B].map((color, i) => (
            <g key={color}>
              <path
                d={`M${i ? 1830 : 90} 765 Q${i ? 1500 : 420} 765 960 ${765 - 475 * resolve}`}
                stroke={color}
                strokeWidth="3"
                fill="none"
                opacity={1 - resolve * 0.3}
              />
              <circle
                cx={960 + (i ? 1 : -1) * 800 * (1 - resolve)}
                cy={765 - 475 * resolve}
                r="6"
                fill={color}
              />
            </g>
          ))}
        </svg>
      )}
    </AbsoluteFill>
  );
};
