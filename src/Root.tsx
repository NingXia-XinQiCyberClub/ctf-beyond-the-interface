import React from "react";
import {
  AbsoluteFill,
  Audio,
  Composition,
  Freeze,
  Img,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import {
  WebScene,
  CryptoScene,
  ReverseScene,
  PwnScene,
  MiscScene,
} from "./scenes/ChallengeScenes";
import { FinaleScene, OutroScene } from "./scenes/StoryScenes";
import "./global.css";
import { AttackIntro, AttackStage } from "./scenes/AttackDirection";

export const CHAPTERS = [
  { title: "入口", from: 0, seconds: 10, component: AttackIntro },
  { title: "Web", from: 10, seconds: 22, component: WebScene },
  { title: "Crypto", from: 32, seconds: 20, component: CryptoScene },
  { title: "Reverse", from: 52, seconds: 22, component: ReverseScene },
  { title: "Pwn", from: 74, seconds: 22, component: PwnScene },
  { title: "Misc", from: 96, seconds: 18, component: MiscScene },
  { title: "最后一次提交", from: 114, seconds: 26, component: FinaleScene },
  {
    title: "见微知隙，破阵无声",
    from: 140,
    seconds: 10,
    component: OutroScene,
  },
];

const ChapterTransition: React.FC<{
  duration: number;
  first: boolean;
  children: React.ReactNode;
}> = ({ duration, first, children }) => {
  const frame = useCurrentFrame();
  const p = Math.min(1, frame / 14);
  const ease = p * p * p * (p * (p * 6 - 15) + 10);
  const edge = -20 + ease * 140;
  return (
    <AbsoluteFill
      style={{
        // Incoming scene wipes over a held outgoing frame; no time is removed
        // from either scene, so the finale's existing submission timing survives.
        maskImage:
          first || p === 1
            ? undefined
            : `linear-gradient(105deg,#000 ${edge - 8}%,transparent ${edge + 8}%)`,
        transform: first
          ? undefined
          : `translateX(${(1 - ease) * 22}px) scale(${1 + (1 - ease) * 0.012})`,
        opacity: first ? Math.min(1, frame / 10) : 1,
      }}
    >
      <Freeze frame={duration - 1} active={frame >= duration}>
        {children}
      </Freeze>
    </AbsoluteFill>
  );
};

const Film: React.FC = () => (
  <AbsoluteFill
    style={{ fontFamily: '"Noto Sans SC", sans-serif', background: "#020711" }}
  >
    {CHAPTERS.map(({ title, from, seconds, component: Scene }) => (
      <Sequence
        key={title}
        name={title}
        from={from * 30}
        durationInFrames={seconds * 30 + (from < 140 ? 14 : 0)}
      >
        <ChapterTransition duration={seconds * 30} first={from === 0}>
          <AttackStage from={from}>
            <Scene />
          </AttackStage>
        </ChapterTransition>
      </Sequence>
    ))}
    <Audio src={staticFile("soundtrack.wav")} />
  </AbsoluteFill>
);

const FilmCover: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        "radial-gradient(ellipse at 80% 30%, #66162c55, transparent 60%), radial-gradient(ellipse at 25% 70%, #0b294d, #020711 70%)",
      color: "#e9f7ff",
      fontFamily: '"Noto Sans SC", sans-serif',
      justifyContent: "center",
      paddingLeft: 155,
    }}
  >
    <div
      style={{
        position: "absolute",
        right: 90,
        top: 125,
        width: 820,
        height: 820,
        border: "1px solid #1573d755",
        transform: "rotate(45deg)",
        boxShadow: "0 0 180px #0a5fe62a inset",
      }}
    />
    <div
      style={{
        fontSize: 21,
        letterSpacing: 9,
        color: "#39cbff",
        marginBottom: 42,
        fontFamily: "Consolas, monospace",
      }}
    >
      CAPTURE THE FLAG / OFFENSIVE CUT 02
    </div>
    <div
      style={{
        fontSize: 132,
        fontWeight: 800,
        letterSpacing: 16,
        lineHeight: 1.25,
      }}
    >
      表面之下
    </div>
    <div
      style={{
        fontSize: 35,
        letterSpacing: 7,
        color: "#8eb5d8",
        marginTop: 36,
      }}
    >
      锁定边界，打开突破口。
    </div>
    <div
      style={{
        fontSize: 24,
        letterSpacing: 2,
        color: "#a8c6df",
        marginTop: 95,
      }}
    >
      宁夏大学 · 鑫启网安俱乐部
    </div>
    <Img
      src={staticFile("logo.svg")}
      style={{
        position: "absolute",
        right: 235,
        top: 315,
        width: 400,
        height: 400,
        objectFit: "contain",
        filter: "drop-shadow(0 0 40px #157aff77)",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: 155,
        bottom: 85,
        color: "#39769d",
        fontFamily: "Consolas, monospace",
        fontSize: 17,
        letterSpacing: 5,
      }}
    >
      WEB / CRYPTO / REVERSE / PWN / MISC
    </div>
  </AbsoluteFill>
);

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="BeyondTheInterface"
      component={Film}
      durationInFrames={4500}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="FilmCover"
      component={FilmCover}
      durationInFrames={1}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="LogoProof"
      component={LogoProof}
      durationInFrames={1}
      fps={30}
      width={1680}
      height={980}
    />
  </>
);

const LogoProof: React.FC = () => (
  <AbsoluteFill
    style={{
      background: "#f0f3f8",
      fontFamily: '"Noto Sans SC", sans-serif',
      color: "#182440",
      padding: 60,
    }}
  >
    <div style={{ fontSize: 38, fontWeight: 700 }}>
      鑫启网安俱乐部 · Logo 矢量化审查
    </div>
    <div style={{ marginTop: 12, fontSize: 20, color: "#57677d" }}>
      保留原有造型与配色 · SVG 使用几何路径与渐变 · 原始 PNG 保留
    </div>
    <div style={{ display: "flex", gap: 40, marginTop: 38 }}>
      {[
        ["用户原图 / PNG · 512 × 512", "logo.png"],
        ["矢量重绘 / SVG · 无限缩放", "logo.svg"],
      ].map(([label, file]) => (
        <div key={file} style={{ flex: 1 }}>
          <div style={{ padding: "22px 0", fontSize: 23 }}>{label}</div>
          <div
            style={{
              height: 570,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#fff",
              backgroundImage:
                "linear-gradient(45deg,#e8ecf3 25%,transparent 25%),linear-gradient(-45deg,#e8ecf3 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e8ecf3 75%),linear-gradient(-45deg,transparent 75%,#e8ecf3 75%)",
              backgroundSize: "32px 32px",
              backgroundPosition: "0 0,0 16px,16px -16px,-16px 0",
            }}
          >
            <Img
              src={staticFile(file)}
              style={{ width: 512, height: 512, objectFit: "contain" }}
            />
          </div>
        </div>
      ))}
    </div>
    <div style={{ marginTop: 35, fontSize: 21, color: "#57677d" }}>
      审查重点：双折线比例 / 中央菱形 / 青蓝交叉翼 /
      透明留白。矢量版清理了原图边缘的浅色杂边。
    </div>
  </AbsoluteFill>
);
