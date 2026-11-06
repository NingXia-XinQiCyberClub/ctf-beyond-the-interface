# 《表面之下》

**CTF 黑客主题程序动画宣传片 · 鑫启网安俱乐部 · 宁夏大学**

从网页响应中的异常，到密文、控制流、内存和隐藏像素，本片以五条解题线展示 CTF 的观察、推理与突破，最后在倒计时中完成一次 Flag 提交。

影片规格为 **150 秒、1920 × 1080、30fps**，使用 React 与 Remotion 编写确定性的逐帧动画，配有原创程序合成电子音乐与界面音效。

源码与制作说明由本项目管理，MP4 和完整资产包通过 GitHub Releases 分发。

![《表面之下》封面](public/cover.jpg)

[下载 MP4](https://github.com/NingXia-XinQiCyberClub/ctf-beyond-the-interface/releases/latest/download/beyond-the-interface-1080p.mp4) · [查看 Releases](https://github.com/NingXia-XinQiCyberClub/ctf-beyond-the-interface/releases)

## 内容说明

影片包含 Web、Crypto、Reverse、Pwn、Misc 五个方向，以虚构 CTF 比赛串联。比赛名称、题目、对手、积分、排名变化与一血通知均为剧情演示，不代表俱乐部的实际参赛成绩或获奖记录。**片中 Flag 统一为演示值 `flag{test}`。**

影片中的系统、请求、密文和内存视图是为视觉叙事编写的演示内容；技术画面突出发现线索、提出假设与验证结果的过程。全部正式署名和队伍标识统一使用完整名称 **“鑫启网安俱乐部”**。

项目由 Codex 辅助开发，包含人工确定的主题、品牌要求与制作脚本，以及 AI 辅助编写的动画、音频生成代码和发布文档。项目不宣称由 Claude Opus 生成。

## 本地运行

准备 Node.js **22 或以上版本**、npm 与 Git。首次安装依赖和准备资产需要联网；本地预览和视频渲染使用 Chromium，首次运行时 Remotion 可能需要下载对应浏览器或渲染组件。

```sh
git clone https://github.com/NingXia-XinQiCyberClub/ctf-beyond-the-interface.git
cd ctf-beyond-the-interface
npm ci
npm run assets
npm run audio
npm run dev
```

`npm run assets` 准备开源中文字体和片尾二维码；俱乐部 Logo 已包含于工程。`npm run audio` 使用固定随机种子合成 150 秒原创音轨。浏览器打开 Remotion Studio 后，选择 `BeyondTheInterface` 预览完整影片。

## 检查与导出

```sh
npm run typecheck
npm run render
```

完整视频输出到：

```text
dist/beyond-the-interface-1080p.mp4
```

渲染使用 H.264、AAC 音频与 `yuv420p` 像素格式。耗时取决于处理器、内存、并发设置和 Chromium 性能。

另有低分辨率预览与封面命令：

```sh
npm run preview
npm run cover
```

`npm run preview` 输出 `dist/preview-720p.mp4`。依赖目录、渲染缓存和构建输出不进入源码历史，MP4 保存在 Releases。

## 影片结构

| 时间        | 章节     | 内容                          |
| ----------- | -------- | ----------------------------- |
| 00:00–00:10 | 入口     | 终端启动、Logo 几何与五道挑战 |
| 00:10–00:32 | Web      | 请求、响应与对象访问异常      |
| 00:32–00:52 | Crypto   | 弱参数关系与密文恢复          |
| 00:52–01:14 | Reverse  | 控制流跟踪与校验逻辑          |
| 01:14–01:36 | Pwn      | 内存观察、失败与断点悬念      |
| 01:36–01:54 | Misc     | 像素位平面与隐藏信息          |
| 01:54–02:20 | 最后提交 | 队伍协作、倒计时与正确结果    |
| 02:20–02:30 | 落版     | Logo、完整名称与公开主页入口  |

## 目录

```text
.
├── src/                      # Remotion composition 与动画场景
│   └── scenes/               # 技术章节、开场、终局与片尾
├── public/                   # 本地使用的品牌、字体、二维码与合成音轨
├── scripts/                  # 资产准备与原创音轨生成脚本
├── docs/                     # 制作脚本、音频说明与发行说明
├── prompts/                  # 创作方向与制作提示记录
├── .github/workflows/        # 安装、资产准备与类型检查
├── ASSETS.md                 # 素材来源与各自授权
├── CHANGELOG.md
└── LICENSE                   # 项目自有代码的 MIT 许可证
```

## 素材与许可证

- 项目自有动画代码、生成脚本与程序图形按 [MIT License](LICENSE) 发布。
- Logo 与“鑫启网安俱乐部”名称属于俱乐部品牌素材，**不随代码以 MIT 许可授权**。
- Noto Sans SC 字体遵循其 SIL Open Font License，保留相应许可证与版权声明。
- 配乐与音效由仓库脚本程序合成，没有第三方音乐录音或采样包。
- Remotion 及其他依赖保留自身许可证。**本项目的 MIT 许可证不改变 Remotion 的许可条件**；安装和使用以 [Remotion 官方现行条款](https://www.remotion.dev/docs/terms) 为准。

各项来源及适用范围见 [ASSETS.md](ASSETS.md)。如复用源工程，请替换品牌素材并保留第三方授权文件。

## 俱乐部

- [GitHub 组织](https://github.com/NingXia-XinQiCyberClub)
- [公开主页与加入方式](https://ningxia-xinqicyberclub.github.io/)
- [CTF 入门资料](https://github.com/NingXia-XinQiCyberClub/guide)

项目中的教学和挑战演示面向 CTF 与授权实验环境。对内容或实现的改进可通过 Issue 或 Pull Request 提出。
