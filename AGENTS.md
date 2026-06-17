# `@false00/pi-elasticsearch` maintainer guide

This file is the operating manual for agents and maintainers working on `@false00/pi-elasticsearch`.

## Mission

Keep this package reliable, honest, and operationally useful for real Elasticsearch work.

The package exists to give the Pi coding agent broad Elasticsearch coverage with predictable runtime behavior, practical first-run configuration, and a maintainable path to official API reach.

## Repository map

- `dist/` — source of truth for runtime code; there is no separate `src/` tree
- `dist/index.js` — default-exported Pi extension entrypoint
- `dist/elasticsearch-client.js` — official client wrapper, lazy config/init, and transport helpers
- `dist/tool-runtime.js` — shared execution helpers such as `safeExecute`, `emitProgress`, and structured thrown errors
- `dist/tool-settings.js` — tool timeout resolution
- `dist/tools/` — domain-specific tool definitions
- `docs/` — bundled operator documentation and coverage notes
- `tests/` — smoke, runtime, package, and optional live integration tests
- `scripts/audit-official-api.mjs` — official API audit helper against the Elasticsearch specification repo
- `.github/` — CI workflows, security scanning, templates, and repository automation

## Project facts

- The project is **pure JavaScript**.
- `dist/` is **committed directly**.
- There is **no build step** and no `tsconfig.json`.
- The package is intended for **Pi package installation via npm**.
- The entrypoint must remain registered in `package.json` under `pi.extensions`.
- Broad official coverage is achieved by a combination of dedicated `elasticsearch_*` tools, `elasticsearch_client_call`, and `elasticsearch_api_call`.
- The currently supported Node.js floor is **22+**.

## Pi package conventions

Follow current Pi package guidance:

- Keep the `pi-package` keyword in `package.json`.
- Preserve `pi.extensions` so Pi can load the package root directly.
- Use the Pi-preferred `typebox` package name consistently in runtime imports.
- If package metadata changes, make sure `npm pack --dry-run` still includes the expected runtime files and top-level docs.
- Tool failures must be **thrown** from `execute()` so Pi marks them as `isError: true`.
- Partial updates must use the standard Pi `onUpdate({ content: [...] })` shape.

## Coding standards

- Prefer small, explicit helpers over clever abstractions.
- Preserve stable tool names; all tools must remain prefixed with `elasticsearch_`.
- Keep tool descriptions concise and agent-readable.
- Do not silently broaden destructive behavior.
- Prefer official client or REST semantics over speculative wrapper magic.
- Never fabricate Elasticsearch API paths, response behavior, or feature support.

## Runtime guarantees

Maintain these behavioral guarantees:

- The extension should still load even when credentials are missing.
- `~/.config/pi-elasticsearch/.env` should be created automatically on first use when missing.
- Runtime failures surface as proper Pi tool errors with standardized categories:
  - `configuration`
  - `validation`
  - `authentication`
  - `authorization`
  - `not_found`
  - `conflict`
  - `rate_limit`
  - `timeout`
  - `network`
  - `server_error`
  - `unknown`
- Dedicated tools should return JSON text output Pi can consume.
- Long-running tools may emit progress updates while running.
- `elasticsearch_client_call` and `elasticsearch_api_call` are the compatibility layer for long-tail official coverage.

## Documentation policy

Documentation must match code.

Whenever you change a tool parameter, default value, output format, auth guidance, or runtime behavior, update all affected docs:

1. The tool `description` in `dist/tools/<domain>.js`
2. `README.md`
3. `AGENTS.md` if the change affects maintainer or agent expectations
4. `CONTRIBUTING.md` or `SECURITY.md` if contributor or trust processes changed
5. the relevant docs under `docs/`

Before finishing, grep for stale references:

- old parameter names
- old defaults
- outdated `.env` guidance
- outdated coverage counts
- removed or renamed files

## Testing policy

Every code change should be backed by tests appropriate to the behavior being touched.

Current suites:

- `tests/smoke.test.mjs` — extension import, tool-surface checks, and fresh-install config template behavior
- `tests/runtime.test.mjs` — deferred configuration failures and Pi runtime semantics
- `tests/package.test.mjs` — metadata, published files, trust docs, and README structure
- `tests/auth.test.mjs` — optional live auth/connectivity checks
- `tests/core.test.mjs` — optional live core API checks
- `tests/documents.test.mjs` — optional live document CRUD checks
- `tests/search.test.mjs` — optional live search/bulk/reindex-adjacent checks
- `tests/indices.test.mjs` — optional live index administration checks
- `tests/cluster.test.mjs` — optional live cluster administration checks
- `tests/nodes.test.mjs` — optional live node inspection checks
- `tests/ingest.test.mjs` — optional live ingest checks
- `tests/security.test.mjs` — optional live security checks
- `tests/snapshot.test.mjs` — optional live snapshot checks
- `tests/tasks.test.mjs` — optional live task checks
- `tests/sql-esql.test.mjs` — optional live SQL/ESQL checks
- `tests/transforms.test.mjs` — optional live transform checks
- `tests/raw-api.test.mjs` — optional live raw REST coverage checks
- `tests/client-call.test.mjs` — optional live official-client coverage checks
- `scripts/audit-official-api.mjs` — official OpenAPI coverage audit

Expectations:

- Live tests should be gated so CI can run without a cluster.
- New features should include both success-path and failure-path coverage when practical.
- New dedicated tools should have at least smoke or package-surface coverage, plus live tests when the behavior is straightforward to verify.
- Run `npm test` before considering work complete.
- Run `npm run test:smoke` for a fast non-live sanity check.
- Run `npm run audit:official-api` when changing official-coverage claims or the raw/client escape hatches.

## Security and trust posture

Treat this package as infrastructure/search automation software, not a toy integration.

- Do not weaken auth handling for convenience.
- Do not log secrets in code, tests, or documentation.
- Prefer explicit errors over silent fallback unless a documented fallback already exists.
- Keep destructive operations obvious in tool naming and docs.
- If behavior is uncertain, say so and inspect code or upstream docs instead of guessing.

## Release discipline

- Never commit without explicit user approval.
- Never push or publish without explicit user approval.
- Do not skip npm versions.
- Dry-run with `npm pack --dry-run` before publish.
- Publish with `npm publish --ignore-scripts`.
- If npm requires browser auth / 2FA / OTP, stop and ask the user to complete the publish manually instead of trying to work around the prompt.
- When handing off manual publish, give the user a single copy-paste one-liner.
- Preferred one-liner after the user has reviewed the release state:
  ```bash
  v=$(node -p "require('./package.json').version"); git rev-parse "v$v" >/dev/null 2>&1 || git tag "v$v"; npm publish --ignore-scripts && git push origin master --tags
  ```
- Push tags only after a successful publish when the user has asked for release work.

## Release checklist

When asked to prepare a release:

1. Run `npm test`
2. Run `npm run test:smoke`
3. Run `npm run test:package`
4. Run `npm run audit:official-api`
5. Run `npm pack --dry-run`
6. Verify `package.json` metadata is current
7. Verify README and AGENTS reflect shipped behavior
8. Check whether the current version is already published before bumping
9. Verify GitHub workflows still reflect the intended trust and security posture
10. If npm browser auth / 2FA blocks automation, stop and hand the user the publish one-liner instead of retrying interactively
11. Only commit, tag, push, or publish with explicit user approval
