# Architecture

English | [中文](ARCHITECTURE.zh.md)

`dsh-workbuddy-ppt` is one installable DSH bundle with two explicit execution
routes. The routes share product infrastructure and retain separate authoring
and rendering contracts.

## Package composition

```text
dsh.bundle patch
  -> Host plugin
     -> session-owned OfficePptService and storage
     -> governed presentation tools
     -> bundled Skills and template references
     -> optional managed Slides runtime
  -> Web client
     -> PPT / Slides composer modes
     -> template selection
     -> final-file preview and delivery actions
  -> dsh-pptd CLI
     -> convert / inspect / check / screenshot / render
```

The package layer contributes configuration and registrations. DSH continues to
own sessions, workspaces, approvals, audit, credentials, subprocess policy, and
browser/Host transport.

## Default PPT route

```text
request and materials
  -> bundled Kimi-compatible Skill
  -> complete declarative scene
  -> ppt_scene_check
  -> exact scene_hash receipt
  -> ppt_scene_create
  -> serialized PPTD v2 project
  -> shared parser and checker
  -> native editable PPTX renderer
  -> atomic workspace delivery
```

The receipt covers normalized scene data and admitted image hashes. Creation
recomputes it in the same turn. A changed scene or changed image invalidates the
receipt. PPTD is the renderer input and retained source artifact, so the check
and render paths cannot silently consume different projects.

The renderer creates editable text, shapes, lines, tables, charts, and confined
images. It does not start SlideP, Tencent Docs, or another presentation service.

## Optional Slides route

```text
request and materials
  -> same-turn Tencent PPT Skill receipt
  -> selected template semantic index
  -> STORY + DESIGN + restricted JSX pages
  -> template-fidelity and code checks
  -> managed SlideP page validation
  -> managed Tencent Docs first-sync render
  -> immutable revision and atomic workspace delivery
```

The optional runtime is operator-supplied and staged below the plugin root. DSH
starts its processes through the governed subprocess service, binds the editor
to loopback, bounds diagnostics and deadlines, and joins termination during
plugin disposal.

## Shared state and delivery

- The active DSH session resolves the workspace; callers do not choose storage
  or delivery roots.
- Private project state and immutable revisions remain distinct from the visible
  workspace delivery folder.
- Workspace images pass real-path, extension, signature, size, and hash checks.
- The service publishes session state only after the complete delivery folder
  reaches its final name.
- Browser preview reads the persisted final PPTX over loopback RPC. It does not
  receive engine addresses, Host storage keys, or local runtime paths.

## Extension boundaries

- Image generation stays in a separate DSH provider and tool. This package
  consumes the resulting workspace asset.
- Visual understanding stays in the selected conversation model.
- Design-system documents remain operator-staged local inputs.
- PowerPoint and WPS remain downstream native-application acceptance targets.
- A new renderer must consume the checked intermediate representation and
  publish through the same session, policy, audit, and delivery services.
