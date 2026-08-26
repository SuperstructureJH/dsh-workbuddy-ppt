# WorkBuddy PPT for DSH

[English](README.md) | 中文

`dsh-workbuddy-ppt` 在 DeepSeek Harness 中生成可编辑 PowerPoint 文件。npm 包内包含自研 `workbuddy-ppt` Skill、确定性的 PPTD v2 检查、原生对象 PPTX 渲染器和 Web 交付界面。

```console
dsh plugin --profile web add dsh-workbuddy-ppt
```

默认链路安装后直接可用，不依赖 WorkBuddy、Kimi、SlideP、Tencent Docs editor SDK 或其他本地 Office 运行时。

## 包内能力

- 包内 `workbuddy-ppt` Skill，负责编排和制作。
- `ppt_scene_check` 与 `ppt_scene_create`，使用确定性的场景和图片哈希。
- 可编辑的 PowerPoint 文字、形状、线条、表格、图表和项目内图片。
- PPTD v2 源项目，以及 `dsh-pptd` 检查、查看和渲染 CLI。
- 浏览器预览，并把最终 PPTX 与源项目交付到当前 DSH 工作区。

npm 压缩包约 2.5 MB，不重新分发 Tencent SlideP 或 `editor_sdk` 文件。

## 生成流程

1. DSH 加载包内 `workbuddy-ppt` Skill。
2. 模型生成完整场景并调用 `ppt_scene_check`。
3. 确定性 QA 通过后，模型携带一致的场景哈希调用 `ppt_scene_create`。
4. 插件序列化 PPTD v2，渲染 PowerPoint 原生对象，再把 PPTX 与源项目发布到工作区。

## PPTD CLI

```console
dsh-pptd inspect <project>/deck.pptd --json
dsh-pptd check <project>/deck.pptd --json
dsh-pptd render <project>/deck.pptd --output <output>.pptx --json
```

PPTD 页面和图片必须位于项目目录内，网络图片默认禁用。

## 可选腾讯 Slides 链路

独立的 JSX/模板链路可以使用操作者有权使用的 Tencent PPT Skill、SlideP 和 Tencent Docs 本地运行时。这些文件由操作者提供，默认 PPT 链路不需要它们。包内提供受控装配脚本，在写入配置的运行时目录前核对包名、版本、入口、Skill 必需文件和当前平台二进制。

## 验证状态

- Host 与 Client TypeScript 检查通过。
- PPT 插件与 WorkBuddy suite 共 22 个测试文件、103 项测试通过。
- 全新 DSH `web` profile 已完成 tarball 安装、插件 patch 组合、Web 宿主启动，并从通过检查的 PPTD 项目渲染原生可编辑对象，未发现溢出。
- Microsoft PowerPoint 或 WPS 的打开、编辑、保存、重开仍属于独立原生应用验收层。

使用 MIT License。
