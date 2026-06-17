# Examples

## Cluster info

```text
Show cluster health
Get cluster stats
List nodes and their stats
```

## Document CRUD

```text
Create an index named demo-products
Index a document into demo-products with id 1 and body {"name":"Laptop","price":999}
Get document 1 from demo-products
Delete document 1 from demo-products
```

## Search

```text
Search demo-products for documents matching laptop
Count documents in logs-* where service.name is api
Open a point in time for logs-* for 1 minute
```

## Log investigations

```text
Search logs-* for error events in the last hour
Show the top services in logs-* for timeout errors today
Build a 5 minute timeline of warning and error logs for checkout-service in the last 24 hours
```

## Indices and templates

```text
Create an index template named logs-template for logs-* with one shard
Get index settings for logs-2026.06.17
Refresh indices logs-*
```

## Ingest

```text
Create an ingest pipeline named lowercase-message
Simulate an ingest pipeline with one sample document
```

## Security

```text
Authenticate the current user
Create an API key with these privileges
Get user elastic
```

## Universal coverage

```text
Call the official client target indices.putIndexTemplate with these params ...
Call the raw Elasticsearch API path /_cluster/health with method GET
```
