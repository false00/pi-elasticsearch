# Changelog

## Unreleased

## 0.1.2 - 2026-10-21

- Updated `@elastic/elasticsearch` to 9.5.1 and `typebox` to 1.4.2
- Refreshed the lockfile to `@elastic/transport` 9.4.1 and `undici` 7.30.1, resolving the open `undici` security advisories
- Refreshed the Pi peer dependency lockfile to 1.3.0, clearing npm audit findings for its `undici` and `brace-expansion` dependencies

## 0.1.1 - 2026-08-12

- Added dedicated log-investigation tools for time-bounded log searches, top-value aggregations, and timelines
- Added log-oriented prompt snippets and guidance so Pi can drive Elasticsearch investigations more effectively
- Updated `@elastic/elasticsearch` to 9.5.0 and `typebox` to 1.3.13
- Refreshed the Pi peer dependency lockfile to 0.84.1, clearing npm audit findings

## 0.1.0 - 2026-06-17

- Added a dist-first Pi package scaffold for Elasticsearch
- Added 139 `elasticsearch_*` tools spanning core operations, documents, search, indices, cluster admin, security, lifecycle, snapshots, transforms, inference, connectors, ML, watcher, and universal coverage helpers
- Added lazy config loading with auto-created `~/.config/pi-elasticsearch/.env`
- Added structured Pi tool errors, progress updates, package tests, runtime tests, smoke tests, optional live integration tests, and an official OpenAPI audit script
