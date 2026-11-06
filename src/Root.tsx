import React from "react";
import {
  AbsoluteFill,
  Audio,
  Composition,
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
import { IntroScene, FinaleScene, OutroScene } from "./scenes/StoryScenes";
import "./global.css";

export const CHAPTERS = [
  { title: "入口", from: 0, seconds: 10, component: IntroScene },
  { title: "Web", from: 10, seconds: 22, component: WebScene },
  { title: "Crypto", from: 32, seconds: 20, component: CryptoScene },
  { title: "Reverse", from: 52, seconds: 22, component: ReverseScene },
  { title: "Pwn", from: 74, seconds: 22, component: PwnScene },
  { title: "Misc", from: 96, seconds: 18, component: MiscScene },
  { title: "最后一次提交", from: 114, seconds: 26, component: FinaleScene },
  { title: "下一道题，一起解", from: 140, seconds: 10, component: OutroScene },
];

const ChapterTransition: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const fade = Math.max(0, 1 - frame / 7, (frame - duration + 7) / 7);
  return (
    <AbsoluteFill
      style={{
        background: "#020711",
        opacity: Math.min(0.72, fade * 0.72),
        pointerEvents: "none",
      }}
    />
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
        durationInFrames={seconds * 30}
      >
        <Scene />
        <ChapterTransition duration={seconds * 30} />
      </Sequence>
    ))}
    <Audio src={staticFile("soundtrack.wav")} />
  </AbsoluteFill>
);

const FilmCover: React.FC = () => (
  <AbsoluteFill
    style={{
      background: "radial-gradient(ellipse at 55% 42%, #0b294d, #020711 70%)",
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
      CAPTURE THE FLAG / AN ORIGINAL CODE FILM
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
      另有入口。
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
      src={staticFile("logo.png")}
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
  </>
);
