# 验证与发行门禁

[English](VERIFICATION.md) | 中文

验证应对应实际发生变化的表层。包内文件、运行中的 Host、生成的 PPTX 和通过原生 Office 应用验收的文档是不同证据。

## 证据层

| 层级 | 能证明 | 不能证明 |
| --- | --- | --- |
| 发行结构 | manifest、exports、包内 Skills、参考素材、许可和预期文件存在。 | 依赖可安装或插件可加载。 |
| 源码自动检查 | 源码约定、Host/Client 类型、聚焦行为和构建产物在源码工作区通过。 | 复制到公开仓库的 tarball 完整。 |
| 打包安装 | 精确 tarball 可安装到全新 DSH profile，并解析 peer 依赖。 | 某条链路能完成真实任务。 |
| 运行时生成 | 安装后的 Host 能加载 bundle、校验场景并发布 PPTX 和源项目。 | PowerPoint/WPS 原生行为。 |
| 渲染审阅 | 生成页面可以检查裁切、溢出、层级和素材错误。 | 原生应用保存后对象仍可编辑。 |
| 原生应用验收 | PowerPoint 或 WPS 能打开、编辑、保存、关闭并重新打开交付文件。 | 打包 Desktop 或其他操作系统。 |
| 公开发行 | npm、GitHub Release 和市场记录指向预期产物。 | 这些产物已经通过其他证据层。 |

## 发行结构检查

在本仓库中执行：

```console
git diff --check
node --check lib/index.js
node --check lib/client.js
node --check lib/bin.js
node --check scripts/stage-design-systems.mjs
node --check scripts/stage-workbuddy-runtime.mjs
npm pack --dry-run --json
```

审阅 `npm pack` 文件清单。清单必须包含 Host 与客户端入口、PPTD CLI、类型声明、bundle patch、装配脚本、包内 Skills、具有授权的模板参考、`LICENSE` 和 `THIRD_PARTY_NOTICES.md`。清单禁止包含凭据、本地运行时文件、会话状态、工作区文档和操作者设计系统源文件。

## 精确 tarball 安装

1. 创建临时空 DSH home。
2. 使用 `dsh plugin --profile web add <tarball>` 安装精确 tarball。
3. 确认 profile 依赖和 `dsh.profile.bundles` 条目。
4. 在空闲回环端口启动 Web，并要求返回 HTTP 200。
5. 确认安装包 Host 入口可由普通 Node 导入。
6. 执行一次场景校验/生成流程，检查发布的 PPTX 与 PPTD 源项目。

记录 tarball SHA-256、压缩与解压大小、DSH/Node 版本、端口和生成产物哈希。本地源码链接不能代替打包安装测试。

## 当前 0.1.1 证据

- 集成源码快照在发布前通过 25 个测试文件、133 项测试、Host 与 Client 类型检查，以及两端 bundle 构建。
- 固定的 0.1.1 tarball 通过全新安装检查与包内容审阅。
- 公开 GitHub Release 包含 44 套视觉参考和 332 张可读参考页，并附带第三方版权说明。
- npm `latest` 标签与 GitHub Release 独立核验，不能用其中一项推断另一项。
- 打包 DSH Desktop、Microsoft PowerPoint、WPS 和非 macOS 验收继续作为本版本的独立门禁。

## 发行清单

1. 冻结源码修订版并执行相关源码检查。
2. 构建 Host、客户端、CLI、类型声明、Skills、参考素材和版权说明。
3. 生成唯一 tarball，记录哈希和文件清单。
4. 把该 tarball 安装到全新 profile，并完成首次生成。
5. 更新双语 README、变更记录、兼容性和限制说明。
6. 把同一版本发布到 npm，并核验 registry tarball。
7. 从已验证修订版和产物创建 GitHub tag 与 Release。
8. 更新 dshmarket 记录，并要求结构检查和提交门禁通过。
9. 单独记录原生应用与打包 Desktop 结果。

失败门禁始终保持失败状态。修复归属层、在字节变化时重建精确产物，并重新执行消费该产物的下游检查。
