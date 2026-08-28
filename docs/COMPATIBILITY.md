# Compatibility matrix

English | [中文](COMPATIBILITY.zh.md)

DSH and this plugin are both pre-stable. Pin the complete version set used by a
verified deployment instead of assuming compatibility across release
candidates.

## Runtime versions

| Surface | Declared range | Current evidence |
| --- | --- | --- |
| Node.js | `^22.19.0 || >=24.0.0` | Required by `package.json`. |
| DSH services | `^0.1.1-rc.2` peers | Fresh-profile installation and Web boot passed with the matching DSH line. |
| React | `^18.2.0` peer | Used by the package Web client. |
| Package manager | DSH-managed pnpm path | `dsh plugin` owns profile installation and bundle reconciliation. |

The plugin consumes Host, session, tool, Skill, subprocess, invariant, and Web
client extension points. A DSH update that changes those contracts requires a
fresh installation and runtime check even when dependency resolution succeeds.

## Capability matrix

| Capability | Default install | Extra dependency | Acceptance status |
| --- | --- | --- | --- |
| PPT scene check and editable render | Yes | None beyond npm dependencies | Verified in a fresh Web profile on macOS. |
| PPTD inspect/check/screenshot/render | Yes | None beyond npm dependencies | Verified against the packaged CLI on macOS. |
| Bundled visual reference packs | Yes | None | Package-content and runtime-read checks passed. |
| Workspace image reuse | Yes | A valid local workspace image | Path, signature, byte, and hash checks passed. |
| Image generation | No | Separate DSH image tool and provider | Independent capability; not supplied by this package. |
| Slides JSX/template route | No | Authorized Tencent Skill, SlideP, and Tencent Docs runtime | Verified only in the staged local environment recorded by the release process. |
| PowerPoint edit-save-reopen | External | Microsoft PowerPoint | Separate native-app gate; not established by package tests. |
| WPS edit-save-reopen | External | WPS Office | Separate native-app gate; not established by package tests. |
| Packaged DSH Desktop | External | Matching Desktop-bundled DSH | Separate product-distribution gate. |

## Platform status

| Platform | Default PPT route | Optional Slides route |
| --- | --- | --- |
| macOS arm64 | Local package and Web acceptance passed. | Local staged runtime acceptance exists; exact artifacts remain operator-supplied. |
| macOS x64 | Not run for this release. | Not run. |
| Linux x64/arm64 | Not run for this release. | Requires a compatible operator-supplied native engine; not run. |
| Windows x64/arm64 | Not run for this release. | Requires a matching `editor_sdk.exe`; not run. |

Pure JavaScript dependencies make the default route portable in design. A
successful install on another platform proves dependency resolution, while a
generated and inspected PPTX proves runtime behavior. Native Office acceptance
remains a later gate.

## Upgrade rule

For each DSH or Node.js upgrade:

1. install the exact plugin version into a fresh profile;
2. confirm the bundle row and Web client load;
3. run one checked PPT scene through final workspace publication;
4. run the packaged CLI against a known PPTD fixture;
5. retain PowerPoint/WPS and packaged Desktop status as separate results.
