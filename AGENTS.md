# 项目约定

本项目是宁夏大学鑫启网安俱乐部的CTF黑客主题宣传片《表面之下》。

- 所有正式文案、队伍名、界面与片尾统一使用完整名称“鑫启网安俱乐部”，保持同一行。
- 主体为CTF与黑客视角，社团元素少量融入。五方向为Web、Crypto、Reverse、Pwn、Misc。
- 当前成片150秒、1920×1080、30fps、4500帧。Pwn悬念在最后26秒收束。
- 当前制作第二版；进攻视觉、蓝紫红状态、150 BPM配乐与14帧扫描转场见`docs/v2-direction.md`。
- 用户已审查确认`public/logo.svg`，保留原始PNG对照；Logo本身不改色。
- 片尾口号已由用户选定为“见微知隙，破阵无声。”，二维码必须指向`https://ningxia-xinqicyberclub.github.io/`。
- 保留第一版最后Flag提交、排名上涨和落版结构。关键音画事件共用`src/data/attack-cues.json`。
- 源码直接位于项目根目录，使用React、Remotion、SVG与CSS逐帧动画。
- 重要文件：`docs/storyboard.md`、`docs/production-notes.md`、`prompts/creative-brief.md`、`PROJECT_STATUS.md`。
- 常用命令：`npm run assets`、`npm run audio`、`npm run typecheck`、`npm run dev`、`npm run render`。
- 音乐和音效由`scripts/generate-audio.mjs`原创合成；提交、Correct、一血对应全片137.3、138.3、138.8秒。
- 所有Flag使用`flag{test}`，赛事、名次与一血是虚构演示，不得宣称真实成绩。
- 保留用户提供Logo的原造型和配色，遵守`ASSETS.md`中的独立素材许可。
- GitHub发布要求：组织公开源码仓库，MP4等发行附件放Release。本机发布入口是`outputs/publish-github.ps1`。
- 发布前先核验远端实际状态；本地准备和迁移不等于已经发布。
- Windows PowerShell 5.1读取JSON必须显式使用UTF-8，含中文的PowerShell脚本保留UTF-8 BOM。
- `node_modules/`、`build/`、`qa/`、`dist/`、`outputs/`、`release-assets/`、`references/`不进入源码Git历史。
- 参考原片只用于制作研究，GitHub源码不包含参考视频。

本次迁移保留了目标Project原有`.git`；原聊天目录仍作为备份保留。
