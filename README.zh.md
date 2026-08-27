# WorkBuddy PPT 插件

[English](README.md) | 中文

`dsh-workbuddy-ppt` 是可直接安装的 DSH 演示文稿插件。默认 PPT 模式把自研 Kimi-compatible 创作 Skill、PPTD v2 确定性检查和可编辑 PowerPoint 渲染器完整打进 npm 包；全新 DSH profile 无需 WorkBuddy、Kimi 服务或运行时、SlideP 或 Tencent Docs SDK 就能生成 PPTX。可选 Slides 模式使用操作者有权使用的 Tencent PPT Skill、SlideP 和 Tencent Docs 本地运行时，承担独立的 JSX 与模板工作流。两条链路共同使用受控工作区图片、会话存储、审批、审计和最终文件预览。

```console
dsh plugin --profile web add dsh-workbuddy-ppt
```

## 执行链路

Slides 与 PPT 作为两个互斥操作显示在共享 New Session 输入框下方，文件继续使用统一附件、粘贴和拖拽链路。每个模式只展示自己的模板，并保留服务端权威 `selectedTemplateId`。PPT 内置来自 [`open-kimi-ppt-skill`](THIRD_PARTY_NOTICES.md) 的 44 套不重复 MIT 许可视觉参考包；每张卡片内置 3 页预览，`ppt_get_template_reference` 会返回所选模板的设计说明和全部 6 至 8 页可读参考。Slides 内置完整解析的 58 页“数据分析”和 58 页“活力蓝色”，116 个源页均带本地预览、语义索引和静态 SlideP JSX 结构参考。再次点击已选卡片或点击输入框缩略图的取消按钮会清除选择，同时保持模板区展开；取消请求被拒绝时，已加载目录和当前选择继续显示，并在目录内展示错误。

PPT 场景生成执行自包含流程：

1. 模型加载包内 `kimi-ppt` Skill，列出 PPT 模板目录，完整读取所选模板的视觉参考包，再编写完整场景；页面同时包含语义回退信息和按 PowerPoint 英寸计量的顺序原生文本、图形、图表与工作区图片元素。
2. `ppt_scene_check` 检查唯一 ID、页面边界、文字容量估算、字号、非预期重叠、图表序列结构和工作区图片。返回的 `scene_hash` 同时覆盖标准化场景和已准入图片的 SHA-256。
3. 模型修正后重复检查，直到状态为 `pass` 或 `warning`，再在同一轮使用原场景和准确 hash 调用 `ppt_scene_create`。Host 会在编译前重新计算 hash；场景内容或图片字节变化都会让回执失效。
4. Host 把已检查场景序列化为 `deck.pptd` 和逐页 `.page` 文件，再通过共享 PPTD 引擎解析该项目；结构或资源错误会在渲染前被拒绝。PPTD 因此成为渲染器真正消费的源，而不是旁路诊断文件。
5. 共享渲染器不启动 SlideP 或 Tencent Docs，直接写入可编辑文本、图形、线条、表格、图表和项目内图片。工作区交付目录包含 PPTX、PPTD 项目、`PRESENTATION.scene.json` 和复制后的图片资源。场景型产出在交付 PPTX 中编辑，不进入登记版式的局部更新兼容工具。

## 本地 PPTD CLI

包内提供可独立使用的 `dsh-pptd` 命令行入口，与网页 PPT 模式共用同一套转换、解析、检查、预览和渲染核心：

```console
dsh-pptd convert <input>.pptx --output <project-directory> --json
dsh-pptd check <project> --page 1,3-5 --severity error,warning --level keep --json
dsh-pptd check <project> --level auto --json
dsh-pptd inspect <project> --json
dsh-pptd screenshot <project> --page 1-3 --output <screenshots> --scale 2 --json
dsh-pptd render <project> --output <output>.pptx --json
```

`convert` 从 PPTX 创建可编辑的 PPTD v2 项目。PPTX 到 PPTD 的转换以明确诊断为目标，不承诺无损：JSON 回执会返回发生归一化和暂不支持的源特性数量；任一数量不为零时，`--strict` 不发布项目。`check --level auto` 只执行确定性修复，包括安全类型转换、删除无效可选值和删除结构上无法恢复的可选节点；发生改动的页面 YAML 会整体重写。页码筛选使用从 1 开始的逗号列表或区间，诊断筛选支持严重级别和准确问题代码。

`screenshot` 通过 SVG 与 Sharp 生成受项目路径约束的本地预览，与 PowerPoint 或 WPS 打开最终 PPTX 属于不同证据层。`render`、`package` 和 `export` 把选中的 PPTD 页面编译为可编辑 PPTX。文件采用原子发布，覆盖既有结果必须显式提供 `--force`，`--json` 返回机器可读回执。加载器把页面、图片和生成产物限制在项目或指定输出根目录内，执行单文件与总字节上限，并保持网络资源关闭。

当前可编辑子集覆盖常用富文本标签、纯色填充、常用图形、直线、项目内图片、带主题的原生表格，以及原生柱图、条形图、折线图、面积图、散点图、气泡图、饼图、环形图、雷达图、带次坐标轴的组合图，并为自定义 SVG 路径提供明确的矢量回退。转换器保留原生对象顺序、常见文本 run、几何信息、表格、图表数据、图表方向和次坐标轴归属；复杂 OOXML 样式会归一化为已支持的 PPTD 模型。暂不支持的图表类型和资源违规会返回明确诊断。CLI 不执行也不依赖外部演示文稿运行时。

Slides 生成执行以下流程：

1. 系统提示词要求模型在当前轮调用 `skill({"name":"tencent-pptx"})`。`ppt_create` 校验同轮成功回执；用户直接输入 `/tencent-pptx` 也会形成同轮回执。
2. 插件从自身 runtime 目录加载完整 Tencent PPT Skill，并自动附加包内的 `ppt-template-fidelity` Skill；后者也可以单独发现。模型把 `ppt_list_templates` 标记的模板作为输入框当前选择，并按需读取模板页。只有当前请求明确附带了其他模板文件时，模型才在工作区中查找它。存在参考材料时，模型先执行 `create-from-material`，再执行 `create-from-scratch`；没有材料时直接执行后者。
3. 内置或上传的源 PPTX 作为模板时，Host 为每个源页保留标题、版式族、内容角色、图表/表格/图片特征、标准化区域坐标、形状、填色、局部文字色、前景/背景关系、字体、连接线、主视觉、画布占比和逐页简化说明。简化说明允许压缩文案和辅助解释，同时保留过半语义版式锚点。原始 shape 数、空 Box 和重复装饰均不计入保真度。生成的静态 SlideP JSX 参考携带这些关系。这个索引来自实际源页，与 PowerPoint Master 无关。
4. 模型先用 `ppt_get_template_pages` 读取完整语义目录和逐页简化说明，再读取选中源页的详细 JSX 参考。每个输出页在 `STORY.md` 和 `DESIGN.md` 中记录源页编号、选择理由和简化方式，并在继承的页面结构内替换内容。
5. 模型一次性提交 `STORY.md`、`DESIGN.md`、逐页语义摘要、源页映射、受限 SlideP JSX 和经过检查的图片文件引用。
6. Host 校验每个源页索引模板的输出页面均引用有效源页，并在对应页面区域保留至少 55% 的加权语义版式锚点。锚点来自源页 zone，按语义类型、配色关系和粗粒度空间单元去重；主图表/表格/图片的权重高于文字分组、主要色块和连接线。画布占比低于 1% 的填色形状、整页背景、空 Box 补齐和重复 primitive 均不计分。Host 另行校验选中模板的主要标志色区域、深色填充区的浅色反白文字，以及主图表、主表格或主图片的源页画布占比。字面量数值区域让检查可计量；只有 Flex 尺寸而无法对应源页位置的组件会被拒绝。随后 Host 把项目写入会话派生目录，再逐页检查 JSX。允许登记的 SlideP 组件、`Text` 内的 `span` 富文本片段、JSX Fragment、内联 SVG、字面量属性和对字面量数组的局部 `map`；拒绝出现在 `Text` 外的 `span`、import、任意调用、事件、spread、外部 URL 和越界图片路径。
7. 插件通过 `ctx.subprocess` 启动受管的 `editor_sdk` 和 SlideP，先运行每页 `slidep-validate`，再等待首轮同步完成并校验 PPTX ZIP 头。
8. 成功结果先保留一份供打开、下载和审计使用的内部不可变 PPTX 修订版，再把非隐藏交付文件夹原子发布到活动工作区直属目录。WorkBuddy 交付文件夹包含最终 PPTX、`STORY.md`、`DESIGN.md`、`pages/` 和实际使用的 `resources/images/`；原生修订版交付最终 PPTX。工作区已有同名内容时，Host 使用新的产出目录并保留原内容。
9. 完成 `ppt_create` 或 `ppt_update_slide` 的对话轮次会优先使用 PPT 专用的尾部交付入口，并排在通用“生成文件”入口之前。该入口通过回环 RPC 读取持久化的最终 PPTX，并在浏览器本地渲染文件生成的缩略图和图表。浏览器 ZIP 限制约束解析规模；Host 路径和引擎 URL 不会暴露；文件超出内联限制或本地渲染失败时，界面使用明确标注的内容结构视图。交付卡同时展示工作区中的最终 PPTX，以及**打开 PPT**、**在 Finder 中显示**和**下载 PPTX**操作。WorkBuddy 结果通过打开工作区 PPTX 继续修改；`ppt_update_slide` 只服务原生兼容渲染器，避免把 WorkBuddy 页面降级成另一套版式。

`ppt_create` 是 Slides 链路的完整生成入口，接收标题、模板、受众/目的/目标、设计偏好、STORY、DESIGN、顺序页面、逐页模板引用和图片资产。`ppt_scene_check` 与 `ppt_scene_create` 归属 PPT 链路。`ppt_list_templates` 返回当前会话的内置或抽取模板，并标记输入框中的权威 Slides 选择；`ppt_get_template_pages` 先提供每页语义索引、简化说明和语义版式锚点保留目标，再按最多 12 个源页返回 JSX 结构参考。浏览器显式调用仍可使用原生 PptxGenJS 生成、模板抽取、内容抽取、下载和定位能力。

## 图片与模型分工

DeepSeek Vision 负责理解图片，不负责生成图片。文本规划、代码和 JSX 可以使用 Pro 或纯文本模型；视觉理解可以使用多模态模型；生图由当前 DSH 会话中独立注册的图片生成工具完成。

Tencent Skill 会先判断哪些页面需要图片，再调用真实可用的生图或图片检索工具，把结果保存到活动工作区。`ppt_create.assets` 只接受工作区内经过检查的 PNG、JPEG、WebP、GIF 或 SVG，Host 复制后统一通过 `resources/images/<file_name>` 引用。会话没有生图工具时，Skill 使用图形、图表、排版或内联 SVG 完成页面，不留下图片占位符。

## 操作者装配的设计系统

操作者可以提供三份有权使用的 Markdown 规范，分别包含 6 套 Academic、6 套 Promotion 和 6 套 Work 风格。插件校验完整的 18 套风格，注册一个精简的 `ppt-design-systems` 目录 Skill，并为每套风格注册一个虚拟 `ppt-style-*` Skill。配置存在时，PPT 与 Slides 都先读取目录，再按当前内容只加载一套风格。完整规范不会进入固定提示词，也不会进入非演示文稿轮次。

```console
pnpm --filter dsh-workbuddy-ppt stage:design-systems -- \
  --destination <absolute-design-system-root> \
  --academic <absolute-academic-markdown> \
  --promotion <absolute-promotion-markdown> \
  --work <absolute-work-markdown>
```

把 `pptDesignSystemRoot` 设为装配目标，也可以提供 `DSH_PPT_DESIGN_SYSTEM_ROOT`。根目录必须是绝对路径，并包含装配后的 `academic.md`、`promotion.md` 和 `work.md`。装配器核对类别标记、每类 6 个 PART A 与 6 个 PART B、小节 slug 唯一性，再通过原子重命名写入带 SHA-256 的 manifest。目标目录已经存在时，装配器会停止。

风格 Skill 负责内容层级、构图、排版、配色、图片、图表和页面节奏。用户明确要求、事实和证据保持最高优先级；渲染器的安全、可编辑性、边界、溢出、对比度、审计和确定性检查始终执行。页面使用源模板时，继续保持源页实测分组、层级、前景/背景关系和主视觉；风格只补充兼容决策，不替换源页结构。三份源规范始终是操作者提供的本地文件，本包不重新分发。

## 可选 Slides 运行时

开源包不重新分发 WorkBuddy 提供的 SlideP 依赖树或 Tencent Docs 原生二进制。操作者把有权使用的本地文件写入插件自有 runtime 目录：

```console
pnpm --filter dsh-workbuddy-ppt bundle
pnpm --filter dsh-workbuddy-ppt stage:workbuddy-runtime -- \
  --destination <absolute-office-ppt-root>/runtime \
  --slidep <absolute-@tencent/slidep-package> \
  --editor-engine <absolute-@tencent/tencent-docs-ai-engine-package> \
  --skill-zip <absolute-tencent-pptx-skill.zip>
```

构建结果包含 `lib/runtime-staging.js`，同时发布可由普通 Node 执行的 `scripts/stage-workbuddy-runtime.mjs`，因此安装后的插件无需 `tsx` 也能继续使用同一装配器。脚本核对包名、版本、入口、平台二进制和 Skill 必需文件，在同级临时目录中完成复制，再以原子重命名发布。已有目标必须带插件生成的 `manifest.json`；脚本拒绝覆盖普通目录。manifest 记录平台、版本、Skill 哈希和本地供应说明。

公开 npm 包与默认 PPT 模式不需要这些文件。直接把插件加入 DSH profile：

```console
dsh plugin --profile web add dsh-workbuddy-ppt
```

bundle patch 把 `root` 设为 `dshHomePath('office-ppt')`，可选 Slides runtime 位于 `<root>/runtime`。Base profile 已提供 Skill Registry、`skill` 工具和本地 subprocess provider。`requireWorkbuddyRuntime: true` 会在插件加载时检查 Tencent 运行时；未提供这些文件时，默认 PPT 路径仍可使用，选择 Slides 后会在首次渲染前得到明确的 staging 错误。

主要部署配置包括可选运行时根目录、包内 WorkBuddy PPT Skill 覆盖路径、可选的本地设计系统根目录、Node 可执行文件、回环端口范围、引擎就绪/逐页验证/完整渲染超时、子进程终止宽限、诊断输出上限、验证并发、显式编辑器来源，以及 STORY、DESIGN、单页 JSX、单图和图片总量上限。完整字段由[配置目录](../../../docs/config-catalog.zh.md#dsh-workbuddy-ppt)生成。

## 存储与安全

浏览器 RPC 只允许 `loopback`。调用方不能选择 Office 存储或交付路径；Host 读取活动 Session 的工作区，并依据 Session、Deck、标题和修订版生成内部项目、不可变修订版和可见交付位置。完整交付文件夹重命名进入工作区后，服务才提交会话状态。工作区图片先经 `realpath` 检查，随后检查大小、扩展名和文件签名。模型写操作进入共享 `tools/pre-execute` 审批流水线。

SlideP 和 `editor_sdk` 只通过 `ctx.subprocess` 启动。插件拥有进程句柄、超时、输出上限、终止和等待逻辑；插件卸载时会终止全部页面验证器、渲染器和共享 Tencent Docs 引擎。引擎只绑定回环端口，端口由有界范围探测得出。交付预览读取持久化 Deck 投影与最终文件，并且不向浏览器暴露引擎地址。Skill 内容和运行时二进制均不进入模型工具结果，PPTX 字节和宿主存储键也保持在模型上下文之外。

## 验证

聚焦测试覆盖真实 Loader 组合、两个互斥输入模式、场景回执隔离、场景/图片哈希、几何与内容诊断、PPTD 解析、项目路径限制、结构诊断、可编辑渲染、场景与 PPTD 源文件发布、完整 Tencent 与模板保真 Skill provider、可选的 18 风格设计系统 provider 与类别校验、四维相似性 review、同轮 Skill 回执、逐页模板语义/代码索引和简化说明、抽取文字配色、主视觉推断、116 个源页参考全部通过精确保真、100 个空 Box 得到 0 个有效语义锚点并被拒绝、有意义的锚点构图被接受、选中模板标志色替换被拒绝、目录和详细页读取、源页映射、主视觉尺寸、工具审批、`Text` 内富文本、Fragment/map/SVG JSX、可执行 JSX 与错误位置 `span` 的拒绝、工作区资产约束、项目原子写入、完整可见交付文件夹、同名目录避让、发布失败回滚、WorkBuddy 证据持久化、SlideP 图表规范化打包、演示文稿交付入口相对通用“生成文件”入口的优先级、最终公开文件名、基于最终 PPTX 的浏览器渲染、明确标注的内容结构回退、文件/文件夹打开、下载、原生兼容生成和模板 UI。Host 与 Client TypeScript 项目均单独检查。

运行时验收脚本从现有 WorkBuddy 项目读取 STORY、DESIGN、全部页面和图片，经 `OfficePptService`、受管 subprocess、逐页 SlideP 校验和 Tencent Docs 引擎生成 PPTX，并核对 OOXML 实际页数：

```console
pnpm --filter dsh-workbuddy-ppt accept:workbuddy-runtime -- \
  --runtime <absolute-runtime-root> \
  --project <absolute-workbuddy-project> \
  --destination <absolute-acceptance-output-root>
```

运行时命令验证插件服务层和真实本地引擎。新资料经过真实模型完成材料拆解、外部生图工具实际生成图片、打包后 DSH Desktop 安装、Microsoft PowerPoint 打开编辑保存，以及不同平台的原生引擎兼容性属于独立验收层。

源模板验收命令按用户提供 PPTX 的 SHA-256 识别两套目录模板中的对应项，并核对 58 个逐页索引、静态 JSX 门禁和原生兼容输出：

```console
pnpm --filter dsh-workbuddy-ppt accept:curated-template -- \
  <absolute-acceptance-output-root> \
  <absolute-58-page-catalog-pptx>
```

## 模型体验

### Tencent PPT 项目生成

#### 模型可见内容

模型看到六个演示文稿工具 schema 和两段稳定路由提示。PPT 路由要求声明式场景先检查再生成；Slides 路由携带选中模板，`ppt_list_templates` 确认服务端权威选择，完整 `tencent-pptx` Skill 只在当轮调用 `skill` 后进入上下文。两个生成工具都返回 Deck ID、页数、修订版、可见文件名与工作区目录、SHA-256、工作流、叙事、版式数量、QA 和渲染器。

#### Token 影响

固定工具 schema 与短路由提示进入可复用前缀。较长的 Tencent Skill、选中的设计风格、所选模板页代码、STORY、DESIGN 和最终 JSX 只在 PPT 生成轮次出现；其余 17 套风格不进入上下文。模板列表、完整逐页目录和生成结果保持精简。

#### KV Cache 影响

插件版本、工具 schema 和短路由提示不变时，请求前缀稳定。Skill 内容与工具轨迹追加在该前缀之后，生成和修订不会改写更早的提示词 token。

## 已知限制与暂缓事项

- PPT 模式包含 44 套不重复的 Kimi-compatible 视觉参考包，每套含 6 至 8 页。Slides 包含“数据分析”和“活力蓝色”两套 58 页完整逐页模板；用户上传的自定义模板继续保留在各自会话，同一源文件按 SHA-256 与两套 Slides 源模板去重。索引保留可复用区域结构和组件骨架；任意 PowerPoint Master、动画及复杂绘图的像素级复刻仍需独立能力。原生渲染器适合兼容输出和单页修订；WorkBuddy 渲染器负责 Tencent Skill 的自由页面、图片、图表和内联 SVG。两类渲染器都通过同一份最终 PPTX 提供只读交付预览。
- Host 内容抽取接受 PPTX、DOCX、Markdown 和 UTF-8 文本，一次最多返回配置的页数并报告截断。PDF 抽取、任意 PowerPoint 母版/动画复刻和 WorkBuddy 原生二进制的开源再分发仍属暂缓事项。
- 自研 PPTD 渲染器以文档化 v2 模型和当前真实项目使用到的元素族为目标。自定义 SVG 路径使用明确的矢量回退；任意图标保真、高级图片裁剪、渐变、K 线图、瀑布图、热力图、矩形树图、旭日图、桑基图和 PPTX 无损双向转换仍未进入已验证子集。私有 Kimi 渲染器当前不可用，Kimi 原生一致性继续作为独立对比层。
- 设计系统 Markdown 提供制作规则，不包含字体文件、源图片、图标或源模板页的实测资产。加载风格不代表已经证明视觉相似度、真实模型遵循效果或 PowerPoint/WPS 打开编辑保存；这些属于独立验收层。
