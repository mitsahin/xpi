# Dependency security notes

## node-forge (CVE-2026-85393 / GHSA-86w9-cpqp-85rv)

- **Pulled by:** Expo `@expo/cli` / `@expo/code-signing-certificates` (mobile toolchain only; not used by the API runtime).
- **npm latest:** `1.4.0` (still listed as vulnerable; no `first_patched_version` on the advisory).
- **Mitigation in this repo:** root `package.json` pins / overrides `node-forge` to upstream fix commit [`ceba344`](https://github.com/digitalbazaar/forge/commit/ceba34402e329f0365134f23fe19898756527d65) (`1.4.1-0`, open PR [digitalbazaar/forge#1152](https://github.com/digitalbazaar/forge/pull/1152)).
- **Follow-up:** when `node-forge` publishes a patched release on npm, switch the override to that version and remove the `.trivyignore` entry for `CVE-2026-85393`.

## deepmerge-ts (CVE-2026-40345 / GHSA-ggr8-5vv4-36mx)

- **Pulled by:** Prisma `@prisma/config` (CLI / migrate tooling; not application request path).
- **Mitigation in this repo:** root `overrides` pin `deepmerge-ts` to `8.0.2` (first fixed line is `>=8.0.0`).
- **Follow-up:** drop the override once Prisma depends on `deepmerge-ts` `>=8`.

## braces (CVE-2026-93687 / GHSA-vfj7-8cjw-p6xm)

- **Pulled by:** Expo Metro → `micromatch` → `braces` (mobile bundler toolchain only; not used by the API runtime).
- **npm latest:** `3.0.3` (advisory lists no patched release; all versions through `3.0.3` affected).
- **Mitigation in this repo:** root override maps `braces` to [`@dieub/braces-depth-guard@3.0.3-pn.3`](https://www.npmjs.com/package/@dieub/braces-depth-guard) — a MIT-licensed depth-guard backport derived from [micromatch/braces#72](https://github.com/micromatch/braces/pull/72) that rejects nesting beyond 100 levels instead of stack-overflowing.
- **Accepted residual scanner risk:** Trivy/Sourcery may still match `CVE-2026-93687` on the `3.0.3*` version string even though the depth-guard code is installed. `.trivyignore` lists `CVE-2026-93687` / `GHSA-vfj7-8cjw-p6xm` with this justification so CI does not fail solely on that unblockable advisory match.
- **Risk acceptance:** exploit requires feeding deeply nested brace patterns into the Metro/micromatch path; end-user lesson traffic does not reach this code. Track [micromatch/braces#70](https://github.com/micromatch/braces/issues/70) and remove the ignore + switch to upstream when a patched `braces` ships.
