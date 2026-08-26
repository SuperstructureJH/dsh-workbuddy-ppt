# WorkBuddy PPT for DSH

English | [中文](README.zh.md)

`dsh-workbuddy-ppt` generates editable PowerPoint files inside DeepSeek Harness. The npm package includes the first-party `workbuddy-ppt` Skill, deterministic PPTD v2 checks, a native-object PPTX renderer, and the Web delivery surface.

```console
dsh plugin --profile web add dsh-workbuddy-ppt
```

The default route works immediately after installation. It does not require WorkBuddy, Kimi, SlideP, the Tencent Docs editor SDK, or another local Office runtime.

## What ships

- A package-bundled `workbuddy-ppt` Skill for planning and authoring.
- `ppt_scene_check` and `ppt_scene_create` with deterministic scene and image hashing.
- Editable PowerPoint text, shapes, lines, tables, charts, and project-confined images.
- PPTD v2 source projects and the `dsh-pptd` check, inspect, and render CLI.
- Browser preview plus the final PPTX and source project in the active DSH workspace.

The compressed npm tarball is approximately 2.5 MB. Tencent SlideP and `editor_sdk` artifacts are not redistributed in it.

## Generation flow

1. DSH loads the bundled `workbuddy-ppt` Skill.
2. The model authors a complete scene and calls `ppt_scene_check`.
3. After deterministic QA passes, the model calls `ppt_scene_create` with the matching scene hash.
4. The plugin serializes PPTD v2, renders native PowerPoint objects, and publishes the PPTX plus its source project to the workspace.

## PPTD CLI

```console
dsh-pptd inspect <project>/deck.pptd --json
dsh-pptd check <project>/deck.pptd --json
dsh-pptd render <project>/deck.pptd --output <output>.pptx --json
```

PPTD pages and images must stay below the project directory. Network images are disabled.

## Optional Tencent Slides route

The package can use locally authorized Tencent PPT Skill, SlideP, and Tencent Docs runtime artifacts for the separate JSX/template route. These files are operator-supplied and are never required by the default PPT route. The package includes trusted staging scripts that validate identities, versions, entrypoints, required Skill files, and the platform binary before installing those artifacts under the configured plugin runtime root.

## Verification

- Host and Client TypeScript checks pass.
- 22 focused test files and 103 tests pass across the PPT plugin and WorkBuddy suite.
- A fresh DSH `web` profile installs the tarball, composes the plugin patch, boots the Web host, and renders a checked PPTD project with editable native objects and no overflow.
- Microsoft PowerPoint or WPS edit-save-reopen remains a separate native-app acceptance gate.

Licensed under MIT.
