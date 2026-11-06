# v1.0.0 ·《表面之下》

原创程序动画第一版：一部以黑客视角展示 CTF 观察、推理与突破的 150 秒宣传片，少量融入宁夏大学“鑫启网安俱乐部”的品牌元素。

## 本版内容

- 1920×1080、30fps、150 秒，H.264 视频与 AAC 音频。
- Web、Crypto、Reverse、Pwn、Misc 五个方向的独立挑战演示。
- 终端开场、倒计时协作、最后提交、正确反馈与品牌片尾。
- 原创程序合成电子配乐和界面音效。
- 公开 React / Remotion 源工程、资产准备与音频生成脚本。

## 下载与复现

下载本 Release 中的 `beyond-the-interface-1080p.mp4`。源码位于：

https://github.com/NingXia-XinQiCyberClub/ctf-beyond-the-interface

使用 Node.js 22 或以上版本：

```sh
npm ci
npm run assets
npm run audio
npm run typecheck
npm run render
```

## 演示与许可说明

所有 Flag 均为 `flag{test}`。比赛、题目、对手、积分、一血和排名为剧情演示，不代表俱乐部的实际赛事成绩或获奖记录。

项目实际由 Codex 辅助开发。自有代码按 MIT 许可证发布；Logo 与名称保留俱乐部品牌权利，Noto Sans SC 字体按 OFL 使用，Remotion 及其他依赖遵守各自许可。详情见仓库的 `ASSETS.md`。

首次发布的附件、实际编码参数与检查结果以发布时核验为准。
