# 制作说明

## 动画结构

主合成为BeyondTheInterface，1920×1080、30fps、4500帧。

每个章节通过Sequence挂载，章节组件内部使用从0开始的局部帧。

| 起始秒 | 时长 | 场景         |
| ------ | ---- | ------------ |
| 0      | 10   | IntroScene   |
| 10     | 22   | WebScene     |
| 32     | 20   | CryptoScene  |
| 52     | 22   | ReverseScene |
| 74     | 22   | PwnScene     |
| 96     | 18   | MiscScene    |
| 114    | 26   | FinaleScene  |
| 140    | 10   | OutroScene   |

画面采用React、SVG与CSS透视构建，所有运动由帧号决定。

无需额外三维软件、付费模型接口或在线素材服务参与渲染。

中文字体在合成开始前显式加载，400与700字重为当前源码字符的静态开源子集。

## 技术示意

- Web展示对象级访问授权缺失，读取者与对象所属者ID不同，响应返回内容与演示代码对应。
- Crypto使用小参数RSA：n=3233，p=61，q=53，e=17，d=2753，c=2790，m=65。
- Reverse局部校验使用0x41 XOR 0x2a = 0x6b，分支状态与比较结果同步。
- Pwn采用自建示意内存，不连接外部目标，偏移修正和执行流动画服务剧情。
- Misc用flag{test}的80位ASCII序列构造演示位平面并提取字符串。

## 音画同步

终局从全片114秒开始，倒计时显示26秒。

137.3秒点击提交；138.3秒Correct；138.8秒一血。

140秒开始Logo汇聚；145秒二维码达到完整不透明并静止保持至150秒。

## 复现

先执行npm ci、npm run assets、npm run audio，再运行npm run dev或npm run render。

可以通过REMOTION_BROWSER_EXECUTABLE或Remotion CLI的--browser-executable参数指定已安装的Chrome可执行文件。

受限或低内存环境可用--concurrency=2降低渲染并发。

scripts/render-qa.mjs使用Remotion渲染API输出代表帧、检查字体和生成封面。

默认CLI渲染不依赖额外的remotion.config.ts，以减少受限环境中的配置编译步骤。
