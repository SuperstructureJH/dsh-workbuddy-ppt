# 配置参考

[English](CONFIGURATION.md) | 中文

可安装 bundle 在 `cordis.patch.yml` 中提供以下安全默认配置：

```yaml
- insert:
    - id: workbuddy-ppt
      name: dsh-workbuddy-ppt
      config:
        root: !!js dshHomePath('office-ppt')
```

DSH patch 层会替换目标行的完整 `config`。操作者覆盖配置时必须保留 `root` 以及自己负责的全部非默认值。

## 核心存储与输入限制

| 配置项 | 默认值 | 用途 |
| --- | ---: | --- |
| `root` | schema 必填；由 bundle 提供 | 状态、修订版、运行时和审计的绝对根目录。 |
| `maxUploadBytes` | 32 MiB | 单个浏览器上传文件的最大解码字节数。 |
| `maxZipEntries` | 4,000 | OOXML 压缩包的最大成员数。 |
| `maxZipEntryBytes` | 4 MiB | 单个压缩成员的最大展开字节数。 |
| `maxUncompressedBytes` | 256 MiB | 压缩包全部成员的最大展开字节数。 |
| `maxSlides` | 40 | 单份生成演示文稿的最大页数。 |
| `maxDecksPerSession` | 50 | 单个会话持久化演示文稿的最大数量。 |
| `maxTemplatesPerSession` | 20 | 单个会话抽取模板的最大数量。 |
| `maxActivities` | 200 | 会话保留的近期活动记录数量。 |

## 可选 Slides 运行时

| 配置项 | 默认值 | 用途 |
| --- | ---: | --- |
| `workbuddyRuntimeRoot` | `<root>/runtime` | 已装配腾讯运行时的绝对根目录。 |
| `requireWorkbuddyRuntime` | `false` | 插件加载时校验已装配运行时。 |
| `workbuddyNodeExecutable` | `node` | 可信 SlideP 入口使用的 Node 可执行文件。 |
| `workbuddyPreferredPort` | `39099` | 首个候选回环编辑器端口。 |
| `workbuddyPortScanAttempts` | `100` | 连续探测的回环端口数量。 |
| `workbuddyReadinessTimeoutMs` | `60000` | Tencent Docs 就绪时限。 |
| `workbuddyValidationTimeoutMs` | `30000` | 单页 SlideP 校验时限。 |
| `workbuddyRenderTimeoutMs` | `180000` | 完整首轮同步渲染时限。 |
| `workbuddySubprocessGraceMs` | `2000` | SIGTERM 后升级终止信号前的宽限。 |
| `workbuddyOutputMaxBytes` | 4 MiB | 单个进程保留的诊断输出上限。 |
| `workbuddyValidationConcurrency` | `4` | 并行页面校验数量，最大值为 `16`。 |
| `workbuddyEditorCorsOrigins` | `[]` | `editor_sdk` 明确接受的浏览器来源。 |

## 模型生成内容与图片

| 配置项 | 默认值 | 用途 |
| --- | ---: | --- |
| `workbuddyMaxJsxBytesPerPage` | 256 KiB | 单个 JSX 页面的最大 UTF-8 字节数。 |
| `workbuddyMaxStoryBytes` | 256 KiB | `STORY.md` 最大字节数。 |
| `workbuddyMaxDesignBytes` | 256 KiB | `DESIGN.md` 最大字节数。 |
| `workbuddyMaxAssetBytes` | 16 MiB | 单张已审核图片的最大复制字节数。 |
| `workbuddyMaxTotalAssetBytes` | 128 MiB | 全部已审核图片的最大复制字节数。 |

## Skill 与设计系统根目录

| 配置项 | 默认值 | 用途 |
| --- | --- | --- |
| `workbuddyPptSkillRoot` | 包内 Skill | WorkBuddy PPT Skill 的绝对覆盖目录。 |
| `kimiPptSkillRoot` | 包内 Skill | Kimi-compatible Skill 的绝对覆盖目录。 |
| `pptDesignSystemRoot` | 未设置 | 已装配设计系统的绝对根目录。 |

配置项未提供时，`DSH_KIMI_PPT_SKILL_ROOT` 可以指定 Kimi-compatible Skill 覆盖目录。Skill 与设计系统覆盖目录属于操作者信任输入，应放在模型不可写的工作区之外。

## 覆盖配置示例

```yaml
- id: workbuddy-ppt
  name: dsh-workbuddy-ppt
  config:
    root: !!js dshHomePath('office-ppt')
    maxSlides: 24
    maxUploadBytes: 16777216
    workbuddyValidationConcurrency: 2
    workbuddyRenderTimeoutMs: 240000
```

调整这些上限不会扩大文件系统或网络权限。路径校验、回环 RPC、审批和子进程治理继续生效。
