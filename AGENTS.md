# 项目约定

本项目是宁夏大学鑫启网安俱乐部的CTF黑客主题宣传片《表面之下》。

- 所有正式文案、队伍名、界面与片尾统一使用完整名称“鑫启网安俱乐部”，保持同一行。
- 主体为CTF与黑客视角，社团元素少量融入。五方向为Web、Crypto、Reverse、Pwn、Misc。
- 当前规格150秒、1920×1080、30fps、4500帧。第三版CTF悬念在64–90秒收束，90–98秒邀请邮件，98–140秒红蓝攻防演练。
- 当前制作第三版；用户已审定视频脚本并选定C《红蓝交锋》配乐，护网结尾采用修复复测、红蓝归一。见`docs/v3-storyboard.md`与`docs/v3-direction.md`；第二版历史说明保留。
- 最新为第三版修订v3.1：开场加Logo，邮件信封图标与指针定位；护网红蓝队各占独立全屏工作台，红左蓝右，切换只作水平平移。片内不显示“虚构”“剧情演示”等字样，工程保留实际来源记录。护网页面实现于`src/scenes/RangeOperations.tsx`。
- 用户已审查确认`public/logo.svg`，保留原始PNG对照；Logo本身不改色。
- 片尾口号已由用户选定为“见微知隙，破阵无声。”，二维码必须指向`https://ningxia-xinqicyberclub.github.io/`。
- 保留第一版最后Flag提交、排名上涨和落版结构。关键音画事件共用`src/data/attack-cues.json`。
- 源码直接位于项目根目录，使用React、Remotion、SVG与CSS逐帧动画。
- 重要文件：`docs/storyboard.md`、`docs/production-notes.md`、`prompts/creative-brief.md`、`PROJECT_STATUS.md`。
- 常用命令：`npm run assets`、`npm run audio`、`npm run typecheck`、`npm run dev`、`npm run render`。
- 第三版音乐来自本机ACE-Step 1.5，以用户选定C为参考生成延展与蓝方变奏；`scripts/mix-v3-audio.py`编排音乐与独立程序音效，输入在`public/music/`。提交、Correct、一血对应87.3、88.3、88.8秒。旧版程序配乐脚本及旧时间表保留供历史复现。
- `npm run range`仅在本机回环临时靶场验证HTTP请求，写入`src/data/range-evidence.json`；不访问真实企业，不发送片内邀请邮件。
- 所有Flag使用`flag{test}`，赛事、名次与一血是虚构演示，不得宣称真实成绩。
- 保留用户提供Logo的原造型和配色，遵守`ASSETS.md`中的独立素材许可。
- GitHub发布要求：组织公开源码仓库，MP4等发行附件放Release。本机发布入口是`outputs/publish-github.ps1`。
- 发布前先核验远端实际状态；本地准备和迁移不等于已经发布。
- Windows PowerShell 5.1读取JSON必须显式使用UTF-8，含中文的PowerShell脚本保留UTF-8 BOM。
- `node_modules/`、`build/`、`qa/`、`dist/`、`outputs/`、`release-assets/`、`references/`不进入源码Git历史。
- 参考原片只用于制作研究，GitHub源码不包含参考视频。

本次迁移保留了目标Project原有`.git`；原聊天目录仍作为备份保留。
