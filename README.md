# @false00/pi-elasticsearch

[![CI](https://github.com/false00/pi-elasticsearch/actions/workflows/ci.yml/badge.svg)](https://github.com/false00/pi-elasticsearch/actions/workflows/ci.yml)
[![license](https://img.shields.io/github/license/false00/pi-elasticsearch.svg)](LICENSE)

Production-focused Elasticsearch automation for the Pi coding agent.

`@false00/pi-elasticsearch` exposes **142 Pi tools** for search, log investigations, document CRUD, bulk operations, indices, cluster administration, security, ingest, snapshots, lifecycle, tasks, SQL/ESQL, transforms, inference, connectors, ML, watcher, and universal API reach through both the official Elasticsearch JS client and raw REST access.

| Resource | Link |
|---|---|
| npm | [`@false00/pi-elasticsearch`](https://www.npmjs.com/package/@false00/pi-elasticsearch) |
| GitHub | [github.com/false00/pi-elasticsearch](https://github.com/false00/pi-elasticsearch) |
| License | [MIT](LICENSE) |
| Changelog | [CHANGELOG.md](CHANGELOG.md) |
| Security policy | [SECURITY.md](SECURITY.md) |
| Compatibility notes | [docs/COMPATIBILITY.md](docs/COMPATIBILITY.md) |
| Authentication guide | [docs/AUTHENTICATION.md](docs/AUTHENTICATION.md) |
| Coverage map | [docs/COVERAGE_MAP.md](docs/COVERAGE_MAP.md) |
| Examples | [docs/EXAMPLES.md](docs/EXAMPLES.md) |
| Troubleshooting | [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) |
| Contributing guide | [CONTRIBUTING.md](CONTRIBUTING.md) |

## Why this package

This package is aimed at people who want Pi to operate real Elasticsearch clusters without hand-writing REST calls every time.

What it emphasizes:

- **Broad day-to-day coverage** — 142 tools covering common Elasticsearch workflows
- **Hybrid coverage strategy** — dedicated tools for common work plus two universal escape hatches for the long tail
- **Pi-friendly first-run behavior** — the extension still loads on fresh installs and auto-creates `~/.config/pi-elasticsearch/.env`
- **Structured error handling** — tool failures are thrown back to Pi as real tool errors with categories and guidance
- **Operationally honest docs** — coverage claims are tied to an official OpenAPI audit script
- **Dist-first package hygiene** — committed runtime code, docs, tests, changelog, security policy, and package metadata

## Tool coverage

| Area | Tool count |
|---|---:|
| Core | 3 |
| Documents | 7 |
| Search + bulk + query-by-task | 17 |
| Log investigations | 3 |
| Indices + aliases + templates | 20 |
| Data streams | 5 |
| CAT | 6 |
| Cluster | 7 |
| Nodes | 4 |
| Ingest | 4 |
| Security | 10 |
| Snapshots | 8 |
| ILM + SLM | 8 |
| Tasks | 3 |
| Async search | 4 |
| SQL + ESQL | 4 |
| Transforms | 5 |
| Inference | 6 |
| Connectors | 5 |
| ML | 6 |
| Watcher | 4 |
| Universal REST coverage | 1 |
| Universal official-client coverage + helper | 2 |
| **Total** | **142** |

### Official API coverage audit

Against the official Elasticsearch specification OpenAPI document at:

- `https://raw.githubusercontent.com/elastic/elasticsearch-specification/main/output/openapi/elasticsearch-openapi.json`

The API surface audited on **2026-06-17** exposed:

- **575 routes**
- **833 route/method combinations**
- observed methods: **GET, POST, PUT, DELETE, HEAD**

This package covers common workflows with dedicated `elasticsearch_*` tools and covers the remainder of the official surface with:

- `elasticsearch_client_call` — generic access to any callable official `@elastic/elasticsearch` client method
- `elasticsearch_api_call` — generic raw REST access for any Elasticsearch API path

For details, see [docs/API_COVERAGE_AUDIT.md](docs/API_COVERAGE_AUDIT.md).

## Design philosophy

This package is intentionally a **thin-but-usable Elasticsearch wrapper** for Pi.

That means:

- dedicated tools exist for common operational workflows
- complex request bodies are often accepted as JSON strings instead of trying to model every field in every tool schema
- the official JS client and raw REST helper remain available so full usefulness does not depend on hundreds of ultra-narrow wrappers
- predictable behavior and maintainability are favored over hiding every Elasticsearch detail behind a custom abstraction layer

## Stability guarantees

Current guarantees:

- published tool names are treated as stable once released
- destructive operations are explicit in tool naming and docs
- the extension will continue to lazy-load configuration so fresh installs do not fail at extension load time
- `elasticsearch_client_call` and `elasticsearch_api_call` are the compatibility layer for long-tail API reach

## Install

Install into Pi as a package:

```bash
pi install npm:@false00/pi-elasticsearch
```

Use it for a single run without changing your settings:

```bash
pi -e npm:@false00/pi-elasticsearch
```

For local development from this repository:

```bash
pi -e .
```

## Quick start

Create or update `~/.config/pi-elasticsearch/.env`:

```env
ELASTICSEARCH_URL=https://localhost:9200
ELASTICSEARCH_API_KEY=
# or ELASTICSEARCH_USERNAME=elastic
# and ELASTICSEARCH_PASSWORD=...
```

Then ask Pi to operate Elasticsearch in plain English:

```text
Show cluster health
Search logs-* for error events in the last hour
Show the top services in logs-* for timeout errors today
Build a 5 minute timeline of error logs for checkout-service in the last 24 hours
Create an index template for app-* with one shard
Count documents in users where active is true
List running tasks
```

Pi will call tools like `elasticsearch_health`, `elasticsearch_search_logs`, `elasticsearch_logs_top_values`, `elasticsearch_logs_timeline`, `elasticsearch_put_index_template`, `elasticsearch_count`, and `elasticsearch_list_tasks` behind the scenes.

## Top tasks and example prompts

Common things users ask Pi to do with this package:

```text
Get cluster info
Create an index named products
Index a document into products with id 1
Search products for documents matching laptop
Investigate logs-* for 500 errors in the last 30 minutes
Show the top hosts for error logs in auth-service today
Build a 15 minute timeline for payment-service error logs over the last 24 hours
Update index settings for logs-* to set refresh_interval to 30s
Create a snapshot repository
Run an ingest pipeline simulation
List nodes and their stats
Create an API key
Call the official client target indices.putIndexTemplate with these params
Call /_cluster/health directly with the raw API tool
```

## Choosing dedicated tools vs universal tools

Use the package in this order:

1. **Dedicated `elasticsearch_*` tools first** for common workflows
2. Use **`elasticsearch_client_call`** when the official JS client supports something that does not yet have a dedicated wrapper
3. Use **`elasticsearch_api_call`** when you need direct REST access, raw-string bodies, or a path-oriented fallback

This keeps everyday use ergonomic while still preserving broad official reach.

## Operational docs

For setup help and examples, see:

- [docs/AUTHENTICATION.md](docs/AUTHENTICATION.md)
- [docs/COVERAGE_MAP.md](docs/COVERAGE_MAP.md)
- [docs/EXAMPLES.md](docs/EXAMPLES.md)
- [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)

## Trust, safety, and operating model

This is a **full-access cluster package**. Like any Pi extension, it can perform real changes if Pi is allowed to call its tools.

Important expectations:

- Destructive actions such as delete, reroute, lifecycle updates, security writes, and snapshot deletes are exposed as explicit tools
- Raw and official-client escape hatches can reach endpoints that do not have dedicated wrappers
- Tool failures are thrown back to Pi as **proper tool errors**, not fake success payloads
- The repo includes optional live integration tests, but CI-safe verification focuses on smoke, runtime, package, and official-audit checks
- Not every advanced Elasticsearch feature is guaranteed to be enabled in every cluster or license tier; for those cases, tool failures should be surfaced honestly

If you are evaluating the package for production use, review:

- [SECURITY.md](SECURITY.md)
- [AGENTS.md](AGENTS.md)
- [CHANGELOG.md](CHANGELOG.md)
- [docs/COMPATIBILITY.md](docs/COMPATIBILITY.md)
- [tests/](tests/) for behavioral coverage
- [docs/](docs/) for operator guidance

## Configuration

### Requirements

- Node.js 22+
- A Pi runtime with extension support
- A reachable Elasticsearch endpoint or Elastic Cloud deployment

### Connection settings

Create `~/.config/pi-elasticsearch/.env`:

```env
# --- Connection ---
ELASTICSEARCH_URL=https://localhost:9200
# ELASTICSEARCH_CLOUD_ID=deployment-name:BASE64...
ELASTICSEARCH_VERIFY_TLS=true

# --- Authentication ---
ELASTICSEARCH_API_KEY=
# ELASTICSEARCH_API_KEY_ID=
# ELASTICSEARCH_API_KEY_SECRET=
# ELASTICSEARCH_BEARER_TOKEN=
# ELASTICSEARCH_USERNAME=elastic
# ELASTICSEARCH_PASSWORD=

# --- TLS ---
# ELASTICSEARCH_CA_CERT_PATH=/path/to/http_ca.crt
# ELASTICSEARCH_CA_FINGERPRINT=AA:BB:CC:DD:...

# --- Timeouts ---
ELASTICSEARCH_REQUEST_TIMEOUT_MS=30000
ELASTICSEARCH_TOOL_TIMEOUT_MS=30000

# --- Optional transport behavior ---
ELASTICSEARCH_SNIFF_ON_START=false
ELASTICSEARCH_SNIFF_ON_CONNECTION_FAULT=false
# ELASTICSEARCH_SNIFF_INTERVAL_MS=60000
```

Values in `~/.config/pi-elasticsearch/.env` take precedence over environment variables.

### Configuration priority

1. `~/.config/pi-elasticsearch/.env`
2. constructor options when embedding the client directly
3. environment variables
4. built-in defaults

### Authentication modes

Supported auth modes:

- API key via `ELASTICSEARCH_API_KEY`
- API key object via `ELASTICSEARCH_API_KEY_ID` + `ELASTICSEARCH_API_KEY_SECRET`
- bearer token via `ELASTICSEARCH_BEARER_TOKEN`
- username/password via `ELASTICSEARCH_USERNAME` + `ELASTICSEARCH_PASSWORD`

See [docs/AUTHENTICATION.md](docs/AUTHENTICATION.md) for more detail.

## Runtime behavior

### Output model

- Dedicated tools return **JSON text** Pi can consume
- Long-running tools may emit **progress updates** via `onUpdate(...)`
- Complex request bodies are commonly accepted as JSON strings and parsed inside the tool implementation

### Error model

Tool failures are thrown back to Pi as proper tool errors. The error message body is JSON with fields such as:

- `error`
- `category`
- `guidance`
- `retryable`
- `endpoint`
- `method`
- `target`
- `httpStatus`

Standard categories:

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

## Tool catalog

The package groups tools into these files under `dist/tools/`:

- `core.js`
- `documents.js`
- `search.js`
- `logs.js`
- `indices.js`
- `data-streams.js`
- `cat.js`
- `cluster.js`
- `nodes.js`
- `ingest.js`
- `security.js`
- `snapshot.js`
- `lifecycle.js`
- `tasks.js`
- `async-search.js`
- `sql.js`
- `transforms.js`
- `inference.js`
- `connectors.js`
- `ml.js`
- `watcher.js`
- `raw.js`
- `client-call.js`

For a practical map of the dedicated surface, see [docs/COVERAGE_MAP.md](docs/COVERAGE_MAP.md).

## Repository layout

```text
dist/                     Runtime extension code committed directly to the repo
  index.js                Pi extension entrypoint
  elasticsearch-client.js Official client wrapper and transport helpers
  tool-runtime.js         Shared tool execution helpers
  tools/                  Domain tool definitions

docs/                     Coverage, auth, examples, compatibility, troubleshooting
scripts/                  Official API audit helper
tests/                    Smoke, runtime, package, and optional live suites
.github/                  CI workflow and repository automation

README.md                 User-facing package documentation
AGENTS.md                 Agent/maintainer guidance
CONTRIBUTING.md           Contributor workflow
SECURITY.md               Security and disclosure policy
CHANGELOG.md              Release history
```

## Compatibility

This repository is designed around:

- Node.js `>=22`
- `@elastic/elasticsearch` `9.x`
- Pi package loading through `pi.extensions`

See [docs/COMPATIBILITY.md](docs/COMPATIBILITY.md) for notes and caveats.

## Development

```bash
npm install
npm test
npm run test:smoke
npm run test:runtime
npm run test:package
npm run audit:official-api
npm pack --dry-run
```

Optional live suites require:

```bash
ELASTICSEARCH_LIVE_TESTS=1 npm run test:auth
```

and the other `test:*` live commands listed in [CONTRIBUTING.md](CONTRIBUTING.md).

## Publishing

```bash
npm test
npm pack --dry-run
npm publish --ignore-scripts
```

Versioning and release-discipline notes live in [AGENTS.md](AGENTS.md).

## Support and feedback

When reporting problems, include:

- package version
- Pi version
- Node.js version
- Elasticsearch version
- tool name
- auth mode
- relevant error message

## License

MIT — see [LICENSE](LICENSE).
