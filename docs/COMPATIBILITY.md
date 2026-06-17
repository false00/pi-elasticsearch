# Compatibility notes

## Package assumptions

This repository is designed around:

- Node.js `>=22`
- `@elastic/elasticsearch` `9.x`
- Pi package loading through `pi.extensions`

## Elasticsearch compatibility

The package is implemented against the official JavaScript client and the official specification repository. It is intended to track modern Elasticsearch 9.x semantics closely, but exact endpoint availability still depends on:

- your Elasticsearch version
- your license tier
- enabled features/modules
- your user or API key privileges

## Test posture

- smoke, runtime, package, and audit tests are CI-safe without a live cluster
- live integration suites are optional and gated behind `ELASTICSEARCH_LIVE_TESTS=1`

## Caveat

Do not assume every advanced tool will be usable against every cluster. Features such as connectors, watcher, ML, transforms, inference, and snapshots may be restricted by privileges, deployment mode, or license capabilities.
