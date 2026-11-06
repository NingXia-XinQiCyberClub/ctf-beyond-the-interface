# 素材来源与许可范围

本文件区分自有代码、程序生成媒体、品牌素材与第三方依赖。项目根目录的 MIT 许可证不替代单项素材或依赖自身的许可条件。

| 项目 | 来源 | 用途与授权范围 |
| --- | --- | --- |
| 俱乐部 Logo | 用户为本项目提供的“鑫启网安俱乐部”Logo；公开组织资料亦展示此标志 | 本片品牌署名使用。Logo 与相关品牌名称保留原有权利，不纳入本仓库 MIT 授权；复用工程时应替换，或另行取得品牌使用许可 |
| Noto Sans SC | [Google Fonts 字体服务](https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700)与 [Google Fonts 字体源](https://github.com/google/fonts/tree/main/ofl/notosanssc) | SIL Open Font License 1.1。使用官方生成的静态 400／700 字重子集；覆盖 `src` 字符与完整常用 ASCII，具体集合和下载地址记录于 `public/fonts/font-source.json`。分发时保留 OFL 文本和版权声明 |
| 二维界面、路径、图表、粒子与程序图形 | 本项目动画源代码生成 | 自有实现按项目 MIT 许可证发布；演示赛题与界面数据为本片编写 |
| 配乐与界面音效 | `scripts/generate-audio.mjs` 程序合成 | 没有第三方录音、音乐采样包或外部音频服务；生成脚本及其生成结果按项目发布许可使用 |
| 片尾二维码 | 根据俱乐部公开主页地址生成 | 二维码图形由项目生成；链接目标保留其各自内容权利 |
| Remotion | [remotion-dev/remotion](https://github.com/remotion-dev/remotion) | 保留 Remotion 自身许可证，使用条件以[官方现行条款](https://www.remotion.dev/docs/terms)为准。项目 MIT 许可不改变这些条件 |
| React 与其他 npm 依赖 | `package.json`、`package-lock.json` 所列上游包 | 各自许可证适用；安装后可在对应包的 LICENSE 文件中查看 |

## 字体分发

Noto Sans SC 的上游许可文本位于 [OFL.txt](https://github.com/google/fonts/blob/main/ofl/notosanssc/OFL.txt)，本项目将其与字体一起保留在 `public/fonts/`。对字体进行单独再分发时须继续遵守 OFL。字体名称、版权与许可不归入本项目的 MIT 代码版权。

本地文件 `NotoSansSC.ttf` 为静态 Regular 400，`NotoSansSC-Bold.ttf` 为静态 Bold 700，均为 Google Fonts 官方 `text=` 接口生成的字符子集，不是完整字符集或变量字体。资产脚本扫描 `src` 内 `.ts`、`.tsx`、`.css` 中的字符与完整常用 ASCII；新增字符时请求新的官方子集，并保留此前已有字形。已存在且覆盖当前源码的字体直接复用，无需重复下载。精确字符、官方 CSS 请求与字体下载 URL 记录于 `public/fonts/font-source.json`。

## 参考与创作记录

- 视觉方向参考了用户提供的 ACM 算法宣传片与用户确认的 CTF 黑客主题脚本。
- 参考视频链接：https://www.bilibili.com/video/BV1uraf6wEUf
- 参考视频原文件、画面和音轨不作为本仓库公开分发素材。
- 本项目实际采用 Codex 辅助开发；不将对 Opus 工作流的讨论描述为本片的实际生成工具。

## 演示数据

所有 Flag 统一使用 `flag{test}`。比赛、题目、对手、积分、一血与排名变化为剧情演示，不能作为俱乐部真实成绩引用。
