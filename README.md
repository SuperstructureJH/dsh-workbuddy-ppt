# WorkBuddy PPT plugin

English | [中文](README.zh.md)

`dsh-workbuddy-ppt` is an installable DSH presentation bundle. Its default PPT mode ships a first-party Kimi-compatible authoring Skill, deterministic PPTD v2 checks, and an editable PowerPoint renderer in the npm package, so a fresh DSH profile can generate PPTX files without WorkBuddy, the Kimi service or runtime, SlideP, or the Tencent Docs SDK. An optional Slides mode uses locally authorized Tencent PPT Skill, SlideP, and Tencent Docs runtime artifacts for the separate JSX/template workflow. Both routes share governed workspace images, session storage, approval, audit, and final-file delivery preview.

```console
dsh plugin --profile web add dsh-workbuddy-ppt
```

## Documentation

- [Install and first run](docs/INSTALL.md)
- [Configuration reference](docs/CONFIGURATION.md)
- [Compatibility matrix](docs/COMPATIBILITY.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Verification and release gates](docs/VERIFICATION.md)
- [Changelog](CHANGELOG.md)
- [Security policy](SECURITY.md)
- [Contributing](CONTRIBUTING.md)

## Execution flow

Slides and PPT appear as separate, mutually exclusive actions below the shared New Session composer. Files keep using the shared attachment, paste, and drop paths. Each mode exposes only its own templates and retains a server-authoritative `selectedTemplateId`. PPT ships 44 unique MIT-licensed visual reference packs from [`open-kimi-ppt-skill`](THIRD_PARTY_NOTICES.md); each card embeds three preview pages, while `ppt_get_template_reference` returns the selected design guide and all six to eight readable reference pages. Slides ships the fully parsed 58-page “Data Analysis” and 58-page “Vitality Blue” templates. Their 116 source pages carry local previews, semantic indexes, and static SlideP JSX structure references. Clicking a selected card again or using the composer preview's remove button clears the selection while the chooser stays open; a rejected deselection keeps the loaded catalog and current selection visible and shows an inline error.

PPT scene generation follows a self-contained sequence:

1. The model loads the package-bundled `kimi-ppt` Skill, lists the PPT catalog, reads the selected template's complete visual reference pack, and authors one complete scene with page semantics and ordered editable text, shape, chart, and workspace-image elements measured in PowerPoint inches.
2. `ppt_scene_check` validates unique identities, page bounds, estimated text capacity, font size, unintended overlap, chart-series shape, and workspace image presence. Its `scene_hash` includes the normalized scene and admitted image SHA-256 values.
3. The model revises and rechecks until the result is `pass` or `warning`, then calls `ppt_scene_create` in the same turn with the exact scene and hash. The Host recomputes the hash before compilation, so changed scene content or image bytes invalidate the receipt.
4. The Host serializes the checked scene to `deck.pptd` and one `.page` file per slide, parses the serialized project through the shared PPTD engine, and rejects structural or resource errors. This makes PPTD the source consumed by the renderer rather than a parallel diagnostic export.
5. The shared renderer writes editable PowerPoint text, shapes, lines, tables, charts, and project-confined images without starting SlideP or Tencent Docs. The workspace delivery folder contains the PPTX, PPTD project, `PRESENTATION.scene.json`, and copied image resources. Scene-backed revisions are edited in the delivered PPTX and never pass through the registered-layout focused-update compatibility tool.

## Local PPTD CLI

The package ships `dsh-pptd`, a standalone command-line entry over the same converter, parser, checker, previewer, and renderer used by the PPT Web route:

```console
dsh-pptd convert <input>.pptx --output <project-directory> --json
dsh-pptd check <project> --page 1,3-5 --severity error,warning --level keep --json
dsh-pptd check <project> --level auto --json
dsh-pptd inspect <project> --json
dsh-pptd screenshot <project> --page 1-3 --output <screenshots> --scale 2 --json
dsh-pptd render <project> --output <output>.pptx --json
```

`convert` creates an editable PPTD v2 project from PPTX. PPTX-to-PPTD conversion is intentionally diagnostic rather than lossless: the JSON receipt reports normalized and unsupported source features, and `--strict` publishes no project when either count is nonzero. `check --level auto` applies only deterministic repairs, including safe type conversion, invalid optional-value removal, and deletion of structurally unrecoverable optional nodes; changed page YAML is rewritten. Page selectors use one-based comma-separated values and ranges, while severity selectors accept severities or exact issue codes.

`screenshot` produces project-confined local previews through SVG and Sharp and remains a separate proof layer from the PPTX opened in PowerPoint or WPS. `render`, `package`, and `export` compile the selected PPTD pages into editable PPTX. File publication is atomic, existing outputs require `--force`, and `--json` returns machine-readable receipts. The loader confines every page, image, and generated artifact below the project or requested output root, enforces per-file and aggregate byte limits, and keeps network resources disabled.

The current editable subset covers text with common rich-text tags, solid fills, common shapes, straight lines, project-local images, themed native tables, native bar, column, line, area, scatter, bubble, pie, doughnut, radar, and mixed secondary-axis charts, plus an explicit vector fallback for custom SVG paths. The converter preserves native object order, common text runs, geometry, tables, chart data, chart orientation, and secondary-axis assignment; advanced OOXML styling can normalize into the supported PPTD model. Unsupported chart families and resource violations produce explicit diagnostics. The CLI does not execute or depend on an external presentation runtime.

Slides generation follows this sequence:

1. The system prompt requires `skill({"name":"tencent-pptx"})` in the active turn. `ppt_create` verifies the successful same-turn receipt; a direct `/tencent-pptx` user invocation produces the same receipt.
2. The plugin loads the complete Tencent PPT Skill from its runtime directory and appends the package-owned `ppt-template-fidelity` Skill. The supplemental Skill is also discoverable on its own. The model treats the template marked by `ppt_list_templates` as the composer selection and reads its pages on demand. It searches the workspace for another template file only when the active request explicitly attaches one. With reference material, the model runs `create-from-material` before `create-from-scratch`; without material, it starts with the latter.
3. When a built-in or uploaded source PPTX is used as a template, the Host retains each source page's title, layout family, content roles, chart/table/image features, normalized regions, shapes, fills, local text colors, foreground/background relationships, typography, connectors, primary visual, canvas share, and page-specific simplification guidance. The guidance permits copy and secondary-explanation compression while preserving the majority of the page's semantic layout landmarks. Raw shape count, empty Boxes, and repeated decoration do not contribute to fidelity. The generated static SlideP JSX reference carries those relationships. This index comes from actual source pages and is independent of PowerPoint Master.
4. The model first uses `ppt_get_template_pages` for the complete semantic catalog and simplification guidance, then reads detailed JSX references for the selected source pages. Every output page records its source page number, rationale, and simplification decision in `STORY.md` and `DESIGN.md`, then edits content inside the inherited page structure.
5. The model submits `STORY.md`, `DESIGN.md`, page summaries, source-page mappings, restricted SlideP JSX, and references to reviewed image files in one `ppt_create` call.
6. The Host verifies that every output page using a source-indexed template selects a valid source page and retains at least 55% of its weighted semantic layout landmarks in matching page areas. Landmarks come from source-page zones, are deduplicated by semantic family, color relationship, and coarse spatial cell, and weight primary charts/tables/images above text groups, major filled regions, and connectors. Filled shapes below 1% of the canvas, slide-sized backgrounds, empty Box padding, and repeated primitives are excluded. The Host separately preserves the selected template's major accent regions, requires light inverse text on dark fills, and keeps the selected page's primary chart, table, or image at 55% of its source canvas share. Literal numeric frames make the checks measurable; Flex-only components that cannot be related to inherited source positions are rejected. The Host then writes a session-derived project and checks every JSX page. Registered SlideP components, `span` rich-text runs inside `Text`, JSX Fragments, inline SVG, literal properties, and local `map` operations over literal arrays are accepted. A `span` outside `Text`, imports, arbitrary calls, events, spreads, external URLs, and escaping image paths are rejected.
7. The plugin starts `editor_sdk` and SlideP through `ctx.subprocess`, runs `slidep-validate` for every page, waits for the first synchronized save, and checks the PPTX ZIP signature.
8. A successful result retains an immutable private PPTX revision for opening, download, and audit use, then atomically publishes a non-hidden delivery folder directly below the active workspace. WorkBuddy delivery folders contain the final PPTX, `STORY.md`, `DESIGN.md`, `pages/`, and any `resources/images/`; native revisions contain the final PPTX. Existing workspace entries are preserved under a distinct generated folder name.
9. The PPT turn-tail delivery entry is ordered ahead of the generic produced-files entry for a Turn that completed `ppt_create` or `ppt_update_slide`. It reads the persisted final PPTX over the loopback RPC channel and renders that file locally in the browser, including file-derived thumbnails and charts. Browser ZIP limits bound parsing, Host paths and engine URLs remain private, and an explicitly labelled content-structure view is used only when the file exceeds the inline limit or local rendering fails. The same entry shows the final workspace PPTX with **Open presentation**, **Show in Finder**, and **Download PPTX** actions. WorkBuddy outputs are edited by opening the workspace PPTX; `ppt_update_slide` remains limited to the native compatibility renderer so a WorkBuddy page cannot be downgraded into another layout system.

`ppt_create` is the Slides route's complete-generation entry. It accepts the title, template, audience/purpose/objective, design preferences, STORY, DESIGN, ordered pages, per-page template references, and image assets. `ppt_scene_check` and `ppt_scene_create` own the PPT route. `ppt_list_templates` returns built-in and extracted templates for the active session and marks the authoritative Slides selection. `ppt_get_template_pages` returns each page's semantic index, simplification guidance, and semantic-layout landmark target first, then detailed JSX structure references for up to 12 selected source pages. Explicit browser callers retain native PptxGenJS generation, template extraction, content extraction, download, and reveal operations.

## Image and model responsibilities

DeepSeek Vision understands images; it does not generate them. Planning, code, and JSX can use Pro or a text-only model, visual interpretation can use a multimodal model, and image creation is supplied by a separately registered DSH image tool.

The Tencent Skill decides which pages need images, then invokes a real image-generation or image-search tool available in the active session and saves reviewed results in the workspace. `ppt_create.assets` accepts only workspace-confined PNG, JPEG, WebP, GIF, or SVG files, and the Host copies them under `resources/images/<file_name>`. Without an image tool, the Skill uses shapes, charts, typography, or inline SVG and leaves no image placeholders.

## Operator-staged design systems

An operator may supply three authorized Markdown bundles containing six Academic, six Promotion, and six Work styles. The package validates the complete 18-style set and registers a compact `ppt-design-systems` catalog plus one virtual `ppt-style-*` Skill per style. Both PPT and Slides load the catalog only when it is configured, then load exactly one selected style. This keeps the full library outside the fixed prompt and outside turns that do not generate presentations.

```console
pnpm --filter dsh-workbuddy-ppt stage:design-systems -- \
  --destination <absolute-design-system-root> \
  --academic <absolute-academic-markdown> \
  --promotion <absolute-promotion-markdown> \
  --work <absolute-work-markdown>
```

Set `pptDesignSystemRoot` to the destination or provide `DSH_PPT_DESIGN_SYSTEM_ROOT`. The root must be absolute and contain the staged `academic.md`, `promotion.md`, and `work.md`. The stager verifies category markers, six PART A and six PART B sections per category, unique slugs, and then writes a SHA-256 manifest through an atomic rename. It refuses an existing destination.

The style Skill supplies content hierarchy, composition, typography, color, image, chart, and page-rhythm decisions. Explicit user requirements and evidence remain authoritative. Renderer safety, editability, bounds, overflow, contrast, audit, and deterministic checks remain mandatory. A selected source-template page keeps its measured grouping, hierarchy, foreground/background relationships, and primary visual; the style fills compatible decisions instead of replacing that structure. The source bundles remain operator-provided local files and are not redistributed by this package.

## Optional Slides runtime

The open-source package does not redistribute WorkBuddy's SlideP dependency tree or the Tencent Docs native binary. An operator stages locally authorized artifacts into the plugin-owned runtime directory:

```console
pnpm --filter dsh-workbuddy-ppt bundle
pnpm --filter dsh-workbuddy-ppt stage:workbuddy-runtime -- \
  --destination <absolute-office-ppt-root>/runtime \
  --slidep <absolute-@tencent/slidep-package> \
  --editor-engine <absolute-@tencent/tencent-docs-ai-engine-package> \
  --skill-zip <absolute-tencent-pptx-skill.zip>
```

The bundle emits `lib/runtime-staging.js` and ships a plain Node wrapper at `scripts/stage-workbuddy-runtime.mjs`, so the same stager remains available from an installed plugin without `tsx`. The script verifies package identities, versions, entrypoints, the platform binary, and required Skill files. It copies into a sibling temporary directory and publishes with an atomic rename. An existing destination must contain the plugin-generated `manifest.json`; ordinary directories are never replaced. The manifest records the platform, versions, Skill hash, and local-supply notice.

The public npm package and default PPT mode do not require these artifacts. Install the bundle directly:

```console
dsh plugin --profile web add dsh-workbuddy-ppt
```

The bundle patch sets `root` to `dshHomePath('office-ppt')`; the optional Slides runtime is `<root>/runtime`. The base profile already provides the Skill Registry, `skill` tool, and local subprocess provider. `requireWorkbuddyRuntime: true` checks staged Tencent artifacts during plugin loading. The default PPT route remains available when those artifacts are absent; choosing Slides returns a precise staging error before its first render.

Deployment settings cover the optional runtime root, bundled WorkBuddy PPT Skill override, optional staged design-system root, Node executable, loopback port range, editor readiness/page validation/full render timeouts, process grace, diagnostic output limit, validation concurrency, explicit editor origins, and STORY, DESIGN, per-page JSX, per-image, and aggregate image ceilings. The standalone [configuration reference](docs/CONFIGURATION.md) lists every accepted field and default.

## Storage and security

Browser RPC has `loopback` authority. Callers cannot choose Office storage or delivery paths; the Host resolves the active Session workspace and derives private project, immutable revision, and visible delivery locations from Session, Deck, title, and revision identities. The service commits session state only after the complete delivery folder has been renamed into the workspace. Workspace images pass `realpath`, size, extension, and file-signature checks. Model writes enter the shared `tools/pre-execute` approval waterfall.

SlideP and `editor_sdk` start only through `ctx.subprocess`. The plugin owns process handles, deadlines, output bounds, termination, and joins; plugin disposal terminates all validators, renderers, and the shared Tencent Docs engine. The engine binds only to a loopback port selected from a bounded range. Delivery preview reads the persisted Deck projection and final file without exposing the engine URL to the browser. Skill text and runtime binaries never enter tool results, while PPTX bytes and Host storage keys stay outside model context.

## Verification

Focused tests cover real Loader composition, both mutually exclusive composer modes, scene receipt isolation, scene/image hashing, geometry and content findings, editable scene compilation, scene-source publication, the complete Tencent and template-fidelity Skill provider, the optional 18-style design-system provider and category validation, its four-dimension similarity review, same-turn Skill receipts, per-page semantic/code indexing and simplification guidance, extracted text-color relationships, inferred primary visuals, all 116 source references passing exact fidelity, 100 empty Boxes producing zero retained semantic landmarks, accepted meaningful landmark composition, rejected selected-template accent substitution, compact and detailed page reads, source-page selection, primary-visual sizing, tool approval, accepted `Text`-contained rich text, Fragment/map/SVG JSX, rejected executable JSX and misplaced `span`, workspace assets, atomic projects, complete visible delivery folders, collision-safe names, failed-publication rollback, persisted WorkBuddy evidence, canonical SlideP chart packaging, presentation turn-tail priority over the generic produced-files entry, the final public file name, final-PPTX browser rendering, explicitly labelled structure fallback, file/folder opening, download, native compatibility generation, and the template UI. Host and Client TypeScript projects are checked separately.

The runtime acceptance command reads STORY, DESIGN, every page, and every image from an existing WorkBuddy project, then runs them through `OfficePptService`, managed subprocesses, page-level SlideP validation, and the Tencent Docs engine before checking the OOXML slide count:

```console
pnpm --filter dsh-workbuddy-ppt accept:workbuddy-runtime -- \
  --runtime <absolute-runtime-root> \
  --project <absolute-workbuddy-project> \
  --destination <absolute-acceptance-output-root>
```

This command verifies the plugin service and real local engine. A live model decomposing new material, a separately installed image tool producing assets, packaged DSH Desktop installation, Microsoft PowerPoint open-edit-save acceptance, and native-engine compatibility on other platforms remain separate acceptance layers.

The curated-template acceptance identifies either catalog template by the supplied PPTX SHA-256, then checks all 58 page indexes, the static JSX gate, and native compatibility output:

```console
pnpm --filter dsh-workbuddy-ppt accept:curated-template -- \
  <absolute-acceptance-output-root> \
  <absolute-58-page-catalog-pptx>
```

## Model Experience

### Tencent PPT project generation

#### What the model sees

The model sees six presentation tool schemas and two stable routing sections. The PPT section requires check then create for a declarative scene. The Slides section names the selected template, and `ppt_list_templates` confirms the server-owned selection; the complete `tencent-pptx` Skill enters context only after the turn's `skill` call. Both create tools return the Deck ID, page count, revision, visible file name and workspace directory, SHA-256, workflow, story arc, layout count, QA status, and renderer.

#### Token effect

Fixed tool schemas and the short routing section occupy the reusable prefix. The larger Tencent Skill, selected design style, selected template-page code, STORY, DESIGN, and final JSX appear only during PPT generation turns. The other seventeen design styles stay out of context. Template rows, the full page catalog, and generation results remain compact.

#### KV Cache effect

The request prefix stays stable while the plugin version, tool schemas, and routing section stay unchanged. Skill content and tool traces append after that prefix, so deck generation does not rewrite earlier prompt tokens.

## Known Limitations and Deferred Work

- PPT mode contains 44 unique Kimi-compatible visual reference packs with six to eight pages each. Slides contains the fully indexed 58-page “Data Analysis” and 58-page “Vitality Blue” templates. Session-owned uploads remain available, while an upload with either Slides source SHA-256 is deduplicated. The indexes retain reusable region structures and component skeletons; pixel-level reconstruction of arbitrary PowerPoint Masters, animations, and complex drawings remains a separate capability. The native renderer provides compatibility output and focused revision; the WorkBuddy renderer handles Tencent Skill free-form pages, images, charts, and inline SVG. Both renderers use the same final PPTX for their read-only delivery preview.
- Host content extraction accepts PPTX, DOCX, Markdown, and UTF-8 text, returns at most the configured page count, and reports truncation. PDF extraction, arbitrary PowerPoint master or animation cloning, and open-source redistribution of WorkBuddy native artifacts remain deferred.
- The clean-room PPTD renderer targets the documented v2 model and the element families exercised by the supplied real project. Custom SVG paths use an explicit vector fallback, while arbitrary icon fidelity, advanced image crops, gradients, candlestick, waterfall, heatmap, treemap, sunburst, Sankey charts, and lossless bidirectional PPTX conversion remain outside the verified subset. Kimi-native parity remains a separate comparison because the proprietary renderer is unavailable.
- Design-system Markdown supplies production guidance, not fonts, source photography, icons, or measured template-page assets. Loading a style does not prove visual similarity, live-model compliance, or PowerPoint/WPS edit-save-reopen acceptance; those remain separate verification layers.
