# Verification and release gates

English | [中文](VERIFICATION.zh.md)

Verification follows the surface that changed. A package file, a running Host,
a generated PPTX, and a document accepted by a native Office application are
different evidence.

## Evidence layers

| Layer | Proves | Does not prove |
| --- | --- | --- |
| Distribution structure | Manifest, exports, bundled Skills, references, license, and expected files are present. | Dependencies install or the plugin loads. |
| Automated source checks | Source contracts, Host/Client types, focused behavior, and build output pass in the source workspace. | The copied public tarball is complete. |
| Packed installation | The exact tarball installs in a fresh DSH profile and resolves its peers. | A route completes a real task. |
| Runtime generation | The installed Host loads the bundle, checks a scene, and publishes a PPTX and source project. | Native PowerPoint/WPS behavior. |
| Render review | Every generated page can be inspected for clipping, overflow, hierarchy, and asset errors. | Objects remain editable after a native-app save. |
| Native-app acceptance | PowerPoint or WPS opens, edits, saves, closes, and reopens the delivered file. | Packaged Desktop or another operating system. |
| Public distribution | npm, GitHub Release, and marketplace records point to intended artifacts. | Those artifacts passed another evidence layer. |

## Distribution checks

Run from this repository:

```console
git diff --check
node --check lib/index.js
node --check lib/client.js
node --check lib/bin.js
node --check scripts/stage-design-systems.mjs
node --check scripts/stage-workbuddy-runtime.mjs
npm pack --dry-run --json
```

Review the `npm pack` file list. It must contain the Host and client entries,
PPTD CLI, type declarations, bundle patch, staging scripts, package-owned
Skills, authorized template references, `LICENSE`, and
`THIRD_PARTY_NOTICES.md`. It must contain no credentials, local runtime files,
session state, workspace documents, or operator design-system sources.

## Exact tarball installation

1. Create a temporary, empty DSH home.
2. Install the exact tarball with `dsh plugin --profile web add <tarball>`.
3. Confirm the profile dependency and `dsh.profile.bundles` entry.
4. Boot Web on an unused loopback port and require HTTP 200.
5. Confirm the installed package Host entry imports under plain Node.
6. Run one scene check/create flow and inspect the published PPTX and PPTD
   source.

Record the tarball SHA-256, packed and unpacked sizes, DSH/Node versions, port,
and generated artifact hashes. A local source link is not a packed-install test.

## Current 0.1.1 evidence

- The integrated source snapshot passed 25 test files and 133 tests, Host and
  Client type checks, and both bundle builds before publication.
- The fixed 0.1.1 tarball passed a fresh installation check and package-content
  review.
- The public GitHub release contains 44 visual reference packs and 332 readable
  reference pages with third-party attribution.
- The npm `latest` tag and the GitHub release are verified independently; one
  must never be inferred from the other.
- Packaged DSH Desktop, Microsoft PowerPoint, WPS, and non-macOS acceptance
  remain separate gates for this release.

## Release checklist

1. Freeze the source revision and run relevant source checks.
2. Build Host, client, CLI, declarations, Skills, references, and notices.
3. Produce one tarball and record its hashes and file list.
4. Install that tarball into a fresh profile and complete first generation.
5. Update the bilingual README, changelog, compatibility, and limitations.
6. Publish the same version to npm and verify the registry tarball.
7. Create the GitHub tag and Release from the verified revision and artifact.
8. Update the dshmarket record and require its structure and submission gates.
9. Record native-app and packaged-Desktop results separately.

Never rewrite a failed gate as success. Fix the owning layer, rebuild the exact
artifact when its bytes change, and repeat the downstream checks that consume
it.
