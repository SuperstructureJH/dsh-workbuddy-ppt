# Security policy

English | [中文](SECURITY.zh.md)

## Supported release

Security fixes target the latest GitHub release. DSH is in developer preview,
so reports must include the exact plugin version, DSH version, Node.js version,
operating system, route (`PPT` or `Slides`), and installation source.

## Report a vulnerability

Use GitHub private vulnerability reporting when it is available for this
repository. Otherwise, open an issue that contains only a short impact summary
and a request for a private channel. Never place API keys, credentials, private
documents, customer data, local paths, or working exploit payloads in a public
issue.

Useful reports include:

- the affected entrypoint or tool;
- the minimum reproducible request with sensitive values removed;
- the expected policy or confinement decision;
- the observed filesystem, network, subprocess, or browser effect;
- whether the result reproduces in the default `PPT` route, optional `Slides`
  route, or both.

## Security model

The default `PPT` route uses the package-owned PPTD parser and renderer. It
confines project pages, images, and outputs to validated local roots, disables
network images, and routes model writes through DSH approval and audit.

The optional `Slides` route starts operator-supplied SlideP and Tencent Docs
runtime files through the governed DSH subprocess service. Those files are not
distributed by this repository. Operators are responsible for their license,
provenance, platform compatibility, and local authorization.

The plugin does not accept provider credentials through presentation tool
arguments. Image generation and external model credentials belong to their own
DSH providers and credential services. Remove secrets and document contents
before sharing diagnostics.

## Out of scope

- Vulnerabilities in an unmodified third-party runtime should be reported to
  its owner, with this repository copied only when the plugin integration adds
  the exposure.
- Model output quality, unsupported PPTX fidelity, and visual preference are
  product issues unless they create a policy, confinement, or data-exposure
  failure.
- Denial-of-service reports must demonstrate a path that bypasses documented
  byte, count, timeout, or subprocess limits.
