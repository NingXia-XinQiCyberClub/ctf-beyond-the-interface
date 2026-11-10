import React from "react";
import { AbsoluteFill, Freeze, useCurrentFrame } from "remotion";
import { FinaleScene } from "./StoryScenes";
import { RangeLaunch } from "./RangeOperations";
export { RangeScene } from "./RangeOperations";

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

const MailIcon: React.FC<{ size?: number }> = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <rect
      x="5"
      y="12"
      width="54"
      height="40"
      rx="5"
      stroke="currentColor"
      strokeWidth="3"
      fill="#11283e"
    />
    <path
      d="M7 16L32 35L57 16M7 49L24 33M57 49L40 33"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinejoin="round"
    />
  </svg>
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
          padding: "26px 30px 26px 110px",
          background: "#0a1827f5",
          border: "1px solid #3c637d",
          boxShadow: "0 20px 80px #0009",
          opacity: show(t, 0, 0.3) * (1 - opened),
          transform: `translateX(${(1 - show(t, 0, 0.6)) * 150}px)`,
        }}
      >
        <div style={{ position: "absolute", left: 28, top: 29, color: B }}>
          <MailIcon size={58} />
        </div>
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
          opacity: opened,
          transform: `translate(${-1920 * split}px, ${(1 - opened) * 50}px)`,
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
          <span
            style={{
              display: "inline-flex",
              verticalAlign: "middle",
              marginRight: 15,
              color: B,
            }}
          >
            <MailIcon size={24} />
          </span>
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
            <span>发件人　演练协调组</span>
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
              left: 1190,
              top: 638,
              width: 258,
              height: 76,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: enter ? "#137399" : "#115775",
              border: `1px solid ${B}`,
              padding: 0,
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
            JOINT CYBER EXERCISE
          </div>
          <svg
            style={{
              position: "absolute",
              left: 1320,
              top: 670,
              transform: `translate(${(1 - show(t, 4.8, 0.7)) * 120}px,${(1 - show(t, 4.8, 0.7)) * 85}px)`,
              opacity: show(t, 4.5, 0.3) * (1 - show(t, 6.25, 0.3)),
              overflow: "visible",
            }}
            width="32"
            height="40"
          >
            {t >= 5.5 && t < 6.1 && (
              <circle
                cx="1"
                cy="1"
                r={(t - 5.5) * 65}
                fill="none"
                stroke={B}
                strokeWidth="2"
                opacity={1 - (t - 5.5) / 0.6}
              />
            )}
            <path
              d="M1 1L1 29L9 22L15 36L21 33L15 20L28 20Z"
              fill={W}
              stroke="#03080f"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>
      {split > 0 && (
        <AbsoluteFill
          style={{ transform: `translateX(${1920 * (1 - split)}px)` }}
        >
          <RangeLaunch />
        </AbsoluteFill>
      )}
      {t >= 1 && t < 2.55 && (
        <svg
          width="32"
          height="40"
          style={{
            position: "absolute",
            left: 1530,
            top: 172,
            overflow: "visible",
            transform: `translate(${(1 - show(t, 1.05, 0.85)) * 150}px,${(1 - show(t, 1.05, 0.85)) * 110}px)`,
            opacity: show(t, 1, 0.2) * (1 - show(t, 2.25, 0.3)),
            pointerEvents: "none",
          }}
        >
          {t >= 2 && (
            <circle
              cx="1"
              cy="1"
              r={(t - 2) * 65}
              fill="none"
              stroke={B}
              strokeWidth="2"
              opacity={1 - (t - 2) / 0.55}
            />
          )}
          <path
            d="M1 1L1 29L9 22L15 36L21 33L15 20L28 20Z"
            fill={W}
            stroke="#03080f"
            strokeWidth="2"
          />
        </svg>
      )}
    </AbsoluteFill>
  );
};
