# Install and operate

English | [中文](INSTALL.zh.md)

## Requirements

- Node.js `^22.19.0` or `>=24.0.0`.
- A DSH Web installation compatible with the peer versions declared in
  `package.json`.
- A writable DSH profile and workspace.

The default `PPT` route needs no WorkBuddy installation, Tencent runtime, Kimi
service, Office application, or image-provider credential.

## Install

Install the latest npm release into the Web profile:

```console
dsh plugin --profile web add dsh-workbuddy-ppt
```

Pin a tested release when the surrounding DSH version is fixed:

```console
dsh plugin --profile web add dsh-workbuddy-ppt@<version>
```

Restart the DSH Web Host after the installer completes. A successful install
adds `dsh-workbuddy-ppt` to the profile dependencies and bundle list. Inspect
the installed dependency without changing the profile:

```console
dsh plugin --profile web list --depth 0
```

## First successful generation

1. Start DSH Web and create a fresh session.
2. Select **PPT** in the presentation entry.
3. Ask for a short editable deck with a title, audience, purpose, and required
   facts.
4. Confirm that the model runs `ppt_scene_check` before `ppt_scene_create`.
5. Open the published workspace folder and confirm that it contains the PPTX,
   PPTD project, `PRESENTATION.scene.json`, and any admitted image resources.

This proves the installed default route. It does not prove visual quality in
every template, packaged Desktop behavior, or PowerPoint/WPS edit-save-reopen.

## Upgrade

Use the same package name with the target version, then restart the Host:

```console
dsh plugin --profile web add dsh-workbuddy-ppt@<version>
```

Existing session artifacts remain in their workspaces. The active plugin code
and bundled Skills change for new turns after restart. Keep the prior package
version available when testing a DSH release candidate.

## Remove

```console
dsh plugin --profile web remove dsh-workbuddy-ppt
```

Restart the Host. Removal updates the profile composition; it does not delete
previously delivered PPTX files or workspace source projects.

## Common failures

### Peer dependency mismatch

Compare the installed DSH packages with `peerDependencies` in `package.json`.
Pin a compatible plugin release or upgrade the complete DSH profile together.

### PPT works and Slides reports a staging error

This is the expected default installation. **Slides** requires separately
authorized Tencent Skill, SlideP, and Tencent Docs runtime files. Continue with
**PPT**, or follow the operator staging procedure in the main README.

### Plugin is installed but the entry is missing

Confirm the profile is `web`, inspect the dependency list, and restart the same
Host that owns the Web port. A package in another profile or another DSH home
does not change the active process.

### Generation stops after checking

Read the structured findings from `ppt_scene_check`. Revise page bounds, text
capacity, overlaps, chart data, or workspace-image references, then check the
complete scene again before creation.
