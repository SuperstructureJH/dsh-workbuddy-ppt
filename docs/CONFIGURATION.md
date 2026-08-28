# Configuration reference

English | [中文](CONFIGURATION.zh.md)

The installable bundle provides a safe default row in `cordis.patch.yml`:

```yaml
- insert:
    - id: workbuddy-ppt
      name: dsh-workbuddy-ppt
      config:
        root: !!js dshHomePath('office-ppt')
```

DSH patch layers replace a row's complete `config`. An operator override must
retain `root` and every non-default value it owns.

## Core storage and input limits

| Key | Default | Purpose |
| --- | ---: | --- |
| `root` | required by schema; supplied by bundle | Absolute state, revision, runtime, and audit root. |
| `maxUploadBytes` | 32 MiB | Maximum decoded bytes for one browser upload. |
| `maxZipEntries` | 4,000 | Maximum OOXML archive member count. |
| `maxZipEntryBytes` | 4 MiB | Maximum expanded bytes for one archive member. |
| `maxUncompressedBytes` | 256 MiB | Maximum aggregate expanded archive bytes. |
| `maxSlides` | 40 | Maximum slides in one generated presentation. |
| `maxDecksPerSession` | 50 | Maximum persisted presentations in one session. |
| `maxTemplatesPerSession` | 20 | Maximum extracted templates in one session. |
| `maxActivities` | 200 | Maximum retained recent activity records. |

## Optional Slides runtime

| Key | Default | Purpose |
| --- | ---: | --- |
| `workbuddyRuntimeRoot` | `<root>/runtime` | Absolute staged Tencent runtime root. |
| `requireWorkbuddyRuntime` | `false` | Validate staged runtime during plugin loading. |
| `workbuddyNodeExecutable` | `node` | Node executable for trusted SlideP entrypoints. |
| `workbuddyPreferredPort` | `39099` | First loopback editor port considered. |
| `workbuddyPortScanAttempts` | `100` | Consecutive loopback ports considered. |
| `workbuddyReadinessTimeoutMs` | `60000` | Tencent Docs readiness deadline. |
| `workbuddyValidationTimeoutMs` | `30000` | Per-page SlideP validation deadline. |
| `workbuddyRenderTimeoutMs` | `180000` | Complete first-sync render deadline. |
| `workbuddySubprocessGraceMs` | `2000` | SIGTERM grace before escalation. |
| `workbuddyOutputMaxBytes` | 4 MiB | Retained diagnostic-output ceiling per process. |
| `workbuddyValidationConcurrency` | `4` | Concurrent page validators; maximum `16`. |
| `workbuddyEditorCorsOrigins` | `[]` | Explicit browser origins accepted by `editor_sdk`. |

## Model-authored content and assets

| Key | Default | Purpose |
| --- | ---: | --- |
| `workbuddyMaxJsxBytesPerPage` | 256 KiB | Maximum UTF-8 bytes in one JSX page. |
| `workbuddyMaxStoryBytes` | 256 KiB | Maximum bytes in `STORY.md`. |
| `workbuddyMaxDesignBytes` | 256 KiB | Maximum bytes in `DESIGN.md`. |
| `workbuddyMaxAssetBytes` | 16 MiB | Maximum bytes copied from one reviewed image. |
| `workbuddyMaxTotalAssetBytes` | 128 MiB | Maximum aggregate copied image bytes. |

## Skill and design roots

| Key | Default | Purpose |
| --- | --- | --- |
| `workbuddyPptSkillRoot` | package-bundled Skill | Absolute WorkBuddy PPT Skill override. |
| `kimiPptSkillRoot` | package-bundled Skill | Absolute Kimi-compatible Skill override. |
| `pptDesignSystemRoot` | unset | Absolute staged design-system root. |

`DSH_KIMI_PPT_SKILL_ROOT` supplies the Kimi-compatible Skill override when the
configuration field is absent. Skill and design overrides are trusted operator
inputs. Keep them outside model-writable workspaces.

## Example override

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

Changing these limits does not expand filesystem or network authority. Path
validation, loopback RPC, approval, and subprocess governance remain active.
