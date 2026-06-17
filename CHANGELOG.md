# Changelog

## Unreleased

- Added dedicated log-investigation tools for time-bounded log searches, top-value aggregations, and timelines
- Added log-oriented prompt snippets and guidance so Pi can drive Elasticsearch investigations more effectively

## 0.1.0 - 2026-06-17

- Added a dist-first Pi package scaffold for Elasticsearch
- Added 139 `elasticsearch_*` tools spanning core operations, documents, search, indices, cluster admin, security, lifecycle, snapshots, transforms, inference, connectors, ML, watcher, and universal coverage helpers
- Added lazy config loading with auto-created `~/.config/pi-elasticsearch/.env`
- Added structured Pi tool errors, progress updates, package tests, runtime tests, smoke tests, optional live integration tests, and an official OpenAPI audit script
