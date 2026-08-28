# 安装与运行

[English](INSTALL.md) | 中文

## 环境要求

- Node.js `^22.19.0` 或 `>=24.0.0`。
- DSH Web 安装版本与 `package.json` 声明的 peer 版本兼容。
- DSH profile 和工作区可写。

默认 `PPT` 链路不需要 WorkBuddy、腾讯运行时、Kimi 服务、Office 应用或图片 Provider 凭据。

## 安装

把 npm 最新版本加入 Web profile：

```console
dsh plugin --profile web add dsh-workbuddy-ppt
```

DSH 版本固定时，应锁定已经验证的插件版本：

```console
dsh plugin --profile web add dsh-workbuddy-ppt@<version>
```

安装完成后重启 DSH Web Host。成功安装会把 `dsh-workbuddy-ppt` 写入 profile 的依赖和 bundle 列表。以下命令只读检查已安装依赖：

```console
dsh plugin --profile web list --depth 0
```

## 首次成功生成

1. 启动 DSH Web 并创建新会话。
2. 在演示文稿入口选择 **PPT**。
3. 请求一份简短可编辑演示文稿，并提供标题、受众、用途和必须保留的事实。
4. 确认模型先运行 `ppt_scene_check`，再运行 `ppt_scene_create`。
5. 打开已发布的工作区目录，确认其中包含 PPTX、PPTD 项目、`PRESENTATION.scene.json` 和实际准入的图片资源。

这项结果证明安装后的默认链路可执行。它不证明所有模板的视觉质量、打包 Desktop 行为或 PowerPoint/WPS 打开编辑保存。

## 升级

使用同一包名和目标版本，然后重启 Host：

```console
dsh plugin --profile web add dsh-workbuddy-ppt@<version>
```

已有会话产物继续保留在原工作区。重启后的新轮次使用新的插件代码和包内 Skills。测试 DSH 候选版本时应保留已验证的旧插件版本，便于回退比较。

## 卸载

```console
dsh plugin --profile web remove dsh-workbuddy-ppt
```

随后重启 Host。卸载会更新 profile 组合，不会删除已经交付的 PPTX 或工作区源项目。

## 常见问题

### Peer dependency 不匹配

把当前 DSH 包版本与 `package.json` 的 `peerDependencies` 对照。选择兼容的插件版本，或整体升级同一个 DSH profile。

### PPT 可用，Slides 返回装配错误

这是默认安装的预期状态。**Slides** 需要另行授权并装配 Tencent Skill、SlideP 和 Tencent Docs 运行时文件。可以继续使用 **PPT**，也可以按主 README 的操作者装配流程准备可选运行时。

### 插件已安装，但界面没有入口

确认目标 profile 是 `web`，检查依赖列表，并重启实际占用 Web 端口的同一个 Host。其他 profile 或其他 DSH home 中的安装不会改变当前进程。

### 校验后没有进入生成

读取 `ppt_scene_check` 的结构化诊断，修正页面边界、文本容量、重叠、图表数据或工作区图片引用，再对完整场景重新校验并生成。
