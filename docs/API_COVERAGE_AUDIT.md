# Elasticsearch API coverage audit

This document records how `@false00/pi-elasticsearch` approaches broad Elasticsearch API coverage without turning the package into an unmaintainable one-tool-per-endpoint dump.

## Audit source

Official Elasticsearch specification OpenAPI document:

- `https://raw.githubusercontent.com/elastic/elasticsearch-specification/main/output/openapi/elasticsearch-openapi.json`

Audit date:

- 2026-06-17

Repository audit command:

```bash
npm run audit:official-api
```

## Official surface observed at audit time

From the official OpenAPI document published by the Elasticsearch specification repository:

- **575 routes**
- **833 route/method combinations**
- observed methods:
  - `GET`
  - `POST`
  - `PUT`
  - `DELETE`
  - `HEAD`

## Package coverage model

The package intentionally uses a **three-layer coverage strategy**.

### Layer 1: dedicated tools for common workflows

The bulk of day-to-day Elasticsearch work is exposed through dedicated tools such as:

- document CRUD
- search and count
- bulk indexing
- index administration
- cluster and node inspection
- ingest pipelines
- security primitives
- snapshots, ILM, SLM, tasks
- transforms, inference, connectors, ML, watcher

These tools are optimized for Pi:

- stable names
- agent-readable descriptions
- JSON outputs
- consistent error handling
- predictable parameter shapes

### Layer 2: universal official-client escape hatch

`elasticsearch_client_call` provides access to any callable official `@elastic/elasticsearch` target by dot-delimited path.

Examples:

- `search`
- `indices.create`
- `security.getUser`
- `transform.startTransform`

This gives broad reach across the official client surface without requiring hundreds of tiny dedicated wrappers.

### Layer 3: universal raw REST escape hatch

`elasticsearch_api_call` provides path-based raw REST access for:

- direct API experimentation
- long-tail endpoints
- raw-string bodies such as NDJSON or custom content types
- situations where path-oriented control is more natural than client-method dispatch

## Why this approach

A literal one-tool-per-route implementation for the full Elasticsearch API would create hundreds of narrow tools, increase maintenance cost, and make the package harder for Pi to use effectively.

The hybrid model keeps the package:

- ergonomic for common tasks
- broad for uncommon tasks
- resilient to future API growth
- easier to test and document

## Validation in this repository

Coverage is backed by:

- smoke and package tests for tool-surface and packaging behavior
- runtime tests for Pi tool semantics and deferred config errors
- optional live integration tests for common workflows
- an official OpenAPI audit script that reports the upstream route and method counts

## Caveat

This audit reflects the official Elasticsearch specification repository on the audit date above. Elasticsearch may add, remove, or change endpoints over time.

`elasticsearch_client_call` and `elasticsearch_api_call` are intended to reduce the maintenance gap when that happens.
