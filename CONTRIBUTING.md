# Contributing

English | [中文](CONTRIBUTING.zh.md)

Contributions should preserve the distinction between product intent,
implemented code, automated verification, public distribution, and real Office
application acceptance.

## Start with evidence

For a bug report, include:

- plugin, DSH, Node.js, and operating-system versions;
- installation source and selected `PPT` or `Slides` route;
- a minimal prompt or PPTD project with private content removed;
- the complete error receipt or bounded log excerpt;
- the expected and observed artifact state.

Do not attach credentials, private templates, customer documents, proprietary
runtime archives, or generated files that contain sensitive information.

## Repository layout

- `lib/` contains the prebuilt Host, Web client, PPTD, staging, and invariant
  distribution artifacts.
- `skills/` contains package-bundled model workflows and authorized visual
  references.
- `scripts/` contains plain-Node staging entrypoints.
- `cordis.patch.yml` is the installable DSH profile layer.
- `docs/` contains operator and maintainer guidance.

This repository is the public distribution snapshot. Runtime source changes are
built and verified in the WorkBuddy source workspace before the matching
prebuilt files are copied here. Avoid editing generated `lib/` files by hand.
Open an issue first for a runtime change so the source change, tests, build, and
distribution snapshot stay traceable.

## Change requirements

- Keep the default `PPT` route self-contained and usable without Tencent
  SlideP, `editor_sdk`, or local WorkBuddy state.
- Keep optional runtime files and credentials outside the package.
- Preserve workspace confinement, approval, audit, and atomic publication.
- Update English and Chinese documents together when behavior changes.
- Record user-visible distribution changes in the changelog.
- Add verification evidence at the layer affected by the change.

## Commit and pull-request scope

Each commit should own one reviewable behavior, document, verification change,
or release operation. Pull requests should state:

1. the problem and affected route;
2. the implementation or documentation change;
3. commands actually run and their outcomes;
4. unverified environments and native-application gates;
5. package, npm, GitHub Release, and marketplace effects.
