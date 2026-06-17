# Coverage map

This file is a practical guide to the dedicated tool surface.

## Core

- `elasticsearch_ping`
- `elasticsearch_info`
- `elasticsearch_health`

## Documents

- `elasticsearch_get_document`
- `elasticsearch_document_exists`
- `elasticsearch_index_document`
- `elasticsearch_create_document`
- `elasticsearch_update_document`
- `elasticsearch_delete_document`
- `elasticsearch_mget_documents`

## Search and bulk

- `elasticsearch_search`
- `elasticsearch_msearch`
- `elasticsearch_count`
- `elasticsearch_explain`
- `elasticsearch_field_caps`
- `elasticsearch_terms_enum`
- `elasticsearch_open_point_in_time`
- `elasticsearch_close_point_in_time`
- `elasticsearch_scroll`
- `elasticsearch_clear_scroll`
- `elasticsearch_bulk`
- `elasticsearch_reindex`
- `elasticsearch_update_by_query`
- `elasticsearch_delete_by_query`
- `elasticsearch_reindex_rethrottle`
- `elasticsearch_update_by_query_rethrottle`
- `elasticsearch_delete_by_query_rethrottle`

## Log investigations

- `elasticsearch_search_logs`
- `elasticsearch_logs_top_values`
- `elasticsearch_logs_timeline`

## Index administration

- create, delete, exists, get
- settings get/put
- mapping get/put
- refresh, flush, stats
- alias create/get/delete
- composable index templates
- aliases batch update
- rollover
- resolve index

## Other domains

The repository also includes dedicated tools for:

- data streams
- CAT endpoints
- cluster admin
- node inspection
- ingest pipelines
- security
- snapshots
- ILM and SLM
- tasks
- async search
- SQL and ESQL
- transforms
- inference
- connectors
- ML
- watcher

## Universal coverage helpers

- `elasticsearch_client_call`
- `elasticsearch_client_targets`
- `elasticsearch_api_call`
