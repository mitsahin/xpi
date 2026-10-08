# Dependency security notes

## node-forge (CVE-2026-85393 / GHSA-86w9-cpqp-85rv)

- **Pulled by:** Expo `@expo/cli` / `@expo/code-signing-certificates` (mobile toolchain only; not used by the API runtime).
- **npm latest:** `1.4.0` (still listed as vulnerable; no `first_patched_version` on the advisory).
- **Mitigation in this repo:** root `package.json` pins / overrides `node-forge` to upstream fix commit [`ceba344`](https://github.com/digitalbazaar/forge/commit/ceba34402e329f0365134f23fe19898756527d65) (`1.4.1-0`, open PR [digitalbazaar/forge#1152](https://github.com/digitalbazaar/forge/pull/1152)).
- **Follow-up:** when `node-forge` publishes a patched release on npm, switch the override to that version and remove `.trivyignore` entry for `CVE-2026-85393`.
