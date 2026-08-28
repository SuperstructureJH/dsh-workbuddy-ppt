# 变更记录

[English](CHANGELOG.md) | 中文

本文记录公开发行内容。GitHub Release、npm 发布、市场收录和原生 Office 验收是相互独立的发布门禁。

## 0.1.1 - 2026-08-27

- 加入 44 套不重复的 Kimi-compatible 视觉参考包，包含完整设计说明和 332 张可读参考页。
- 为 `dsh-pptd` 加入 PPTD 转换、检查、确定性校验、本地截图、可编辑渲染、打包和导出命令。
- 转换回执会明确报告被归一化和暂不支持的 PPTX 特性，并提供 strict 模式。
- 原生图表新增面积图、散点图、气泡图、雷达图和带次坐标轴的组合图覆盖。
- 补充 MIT 模板参考来源的第三方版权说明。
- 发布对应的 GitHub Release；npm 发布继续作为单独验证的发行操作。

## 0.1.0 - 2026-08-27

- 首次发布 npm 包和 GitHub Release。
- 交付可安装的 `dsh.bundle` patch、Web 客户端、Host 插件、`workbuddy-ppt` Skill、确定性 PPTD 校验和可编辑 PPTX 渲染器。
- 在全新 DSH Web profile 中完成安装，并生成通过校验的原生对象 PPTX。
- 腾讯 SlideP 与 `editor_sdk` 保持在公开包之外。
