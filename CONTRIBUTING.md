# Contributing to `@false00/pi-elasticsearch`

Thanks for contributing.

This package gives Pi broad Elasticsearch capabilities, so correctness, documentation accuracy, and operational clarity matter more than clever abstractions.

## Principles

- Prefer correctness over convenience
- Prefer explicit behavior over hidden magic
- Keep documentation in sync with runtime behavior
- Treat destructive operations with extra care
- Do not guess about Elasticsearch API behavior; verify it in code, the official client, or the specification repo

## Repository layout

```text
dist/        Runtime source of truth
docs/        Coverage, authentication, examples, compatibility, troubleshooting
tests/       Smoke, runtime, package, and optional live integration tests
scripts/     Audit helpers
.github/     CI workflow, issue templates, and repo automation
README.md    User-facing docs
AGENTS.md    Maintainer/agent operating guide
SECURITY.md  Vulnerability reporting and security policy
```

## Local development

Requirements:

- Node.js 22+
- A reachable Elasticsearch cluster if you want to run live integration tests
- A configured `~/.config/pi-elasticsearch/.env` or `PI_ELASTICSEARCH_CONFIG_DIR` override

Install dependencies:

```bash
npm install
```

Run the default suite:

```bash
npm test
```

Run focused suites:

```bash
npm run test:smoke
npm run test:runtime
npm run test:package
npm run audit:official-api
```

Run optional live suites:

```bash
ELASTICSEARCH_LIVE_TESTS=1 npm run test:auth
ELASTICSEARCH_LIVE_TESTS=1 npm run test:core
ELASTICSEARCH_LIVE_TESTS=1 npm run test:documents
ELASTICSEARCH_LIVE_TESTS=1 npm run test:search
ELASTICSEARCH_LIVE_TESTS=1 npm run test:indices
ELASTICSEARCH_LIVE_TESTS=1 npm run test:cluster
ELASTICSEARCH_LIVE_TESTS=1 npm run test:nodes
ELASTICSEARCH_LIVE_TESTS=1 npm run test:ingest
ELASTICSEARCH_LIVE_TESTS=1 npm run test:security
ELASTICSEARCH_LIVE_TESTS=1 npm run test:snapshot
ELASTICSEARCH_LIVE_TESTS=1 npm run test:tasks
ELASTICSEARCH_LIVE_TESTS=1 npm run test:sql-esql
ELASTICSEARCH_LIVE_TESTS=1 npm run test:transforms
ELASTICSEARCH_LIVE_TESTS=1 npm run test:raw-api
ELASTICSEARCH_LIVE_TESTS=1 npm run test:client-call
```

## Change checklist

Before opening a PR or handing work off for review:

1. Update runtime code in `dist/`
2. Update relevant tool descriptions in `dist/tools/*.js`
3. Update `README.md` for any user-visible behavior change
4. Update `AGENTS.md` if maintainer or agent expectations changed
5. Update or add tests
6. Run `npm test`
7. Run `npm run audit:official-api` if official-coverage claims or raw/client coverage behavior changed
8. Run `npm pack --dry-run` if packaging or metadata changed

## Tests

This project keeps non-live verification fast while still supporting optional real-cluster checks.

Expectations:

- New or changed features should include success and error-path tests when practical
- Tests that create resources must clean them up
- Package and trust-signal changes should include structural checks where practical
- Do not add tests that require unpublished secrets to be embedded in the repo

## Documentation style

Keep docs:

- concrete
- honest
- operationally useful
- aligned with shipped behavior

Avoid marketing claims you cannot verify.

## Security

Please read [SECURITY.md](SECURITY.md) before reporting vulnerabilities or making changes that affect credentials, auth, or destructive operations.

## Release policy

Maintainers do not commit, push, or publish from agent sessions unless the user explicitly asks for it.
