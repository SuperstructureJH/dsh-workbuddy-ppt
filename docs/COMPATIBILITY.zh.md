# 兼容性矩阵

[English](COMPATIBILITY.md) | 中文

DSH 与本插件均处于预稳定阶段。部署时应锁定已经验证的完整版本组合，不能默认不同候选版本之间自动兼容。

## 运行时版本

| 表层 | 声明范围 | 当前证据 |
| --- | --- | --- |
| Node.js | `^22.19.0 || >=24.0.0` | 由 `package.json` 强制要求。 |
| DSH 服务 | `^0.1.1-rc.2` peers | 使用匹配 DSH 版本完成全新 profile 安装和 Web 启动。 |
| React | `^18.2.0` peer | 由包内 Web 客户端使用。 |
| 包管理器 | DSH 管理的 pnpm 链路 | `dsh plugin` 负责 profile 安装和 bundle 对账。 |

插件使用 Host、Session、Tool、Skill、subprocess、invariant 和 Web 客户端扩展点。DSH 升级改变这些约定时，即使依赖解析成功，也必须重新执行全新安装与运行时检查。

## 能力矩阵

| 能力 | 默认安装 | 额外依赖 | 验收状态 |
| --- | --- | --- | --- |
| PPT 场景校验和可编辑渲染 | 支持 | npm 依赖之外无额外依赖 | 已在 macOS 全新 Web profile 中验证。 |
| PPTD inspect/check/screenshot/render | 支持 | npm 依赖之外无额外依赖 | 已在 macOS 使用打包 CLI 验证。 |
| 包内视觉参考 | 支持 | 无 | 包内容与运行时读取检查通过。 |
| 工作区图片复用 | 支持 | 有效的工作区本地图片 | 路径、签名、字节和哈希检查通过。 |
| 生图 | 不提供 | 独立 DSH 生图工具和 Provider | 属于独立能力，本包不提供。 |
| Slides JSX/模板链路 | 默认不提供 | 已授权 Tencent Skill、SlideP 和 Tencent Docs 运行时 | 仅在发行流程记录的本地装配环境中验证。 |
| PowerPoint 打开编辑保存 | 外部能力 | Microsoft PowerPoint | 独立原生应用门禁，包测试不覆盖。 |
| WPS 打开编辑保存 | 外部能力 | WPS Office | 独立原生应用门禁，包测试不覆盖。 |
| 打包 DSH Desktop | 外部能力 | Desktop 内置 DSH 版本匹配 | 独立产品发行门禁。 |

## 平台状态

| 平台 | 默认 PPT 链路 | 可选 Slides 链路 |
| --- | --- | --- |
| macOS arm64 | 本地安装包和 Web 验收通过。 | 存在本地装配运行时验收；具体文件仍由操作者提供。 |
| macOS x64 | 本版本未运行。 | 未运行。 |
| Linux x64/arm64 | 本版本未运行。 | 需要兼容的操作者自备原生引擎，未运行。 |
| Windows x64/arm64 | 本版本未运行。 | 需要匹配的 `editor_sdk.exe`，未运行。 |

纯 JavaScript 依赖让默认链路具备跨平台设计基础。其他平台安装成功只能证明依赖解析；成功生成并检查 PPTX 才能证明运行时行为。原生 Office 验收继续作为后续门禁。

## 升级规则

每次升级 DSH 或 Node.js 时：

1. 把精确插件版本安装到全新 profile；
2. 确认 bundle 行与 Web 客户端加载；
3. 运行一个经过校验的 PPT 场景并发布到工作区；
4. 使用打包 CLI 检查一份已知 PPTD fixture；
5. 单独记录 PowerPoint/WPS 与打包 Desktop 状态。
