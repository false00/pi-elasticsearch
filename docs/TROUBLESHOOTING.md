# Troubleshooting

## The extension loads but the first tool call fails

That is expected on fresh installs if the package has not been configured yet.

Update:

```text
~/.config/pi-elasticsearch/.env
```

and then retry.

## Connection errors

Check:

- `ELASTICSEARCH_URL`
- `ELASTICSEARCH_CLOUD_ID`
- `ELASTICSEARCH_VERIFY_TLS`
- network reachability
- whether your cluster is actually listening on the configured URL

## TLS or certificate failures

Review:

- `ELASTICSEARCH_VERIFY_TLS`
- `ELASTICSEARCH_CA_CERT_PATH`
- `ELASTICSEARCH_CA_FINGERPRINT`

## Authentication failures

Review:

- `ELASTICSEARCH_API_KEY`
- `ELASTICSEARCH_API_KEY_ID`
- `ELASTICSEARCH_API_KEY_SECRET`
- `ELASTICSEARCH_BEARER_TOKEN`
- `ELASTICSEARCH_USERNAME`
- `ELASTICSEARCH_PASSWORD`

## Permission failures

A valid credential can still fail with `authorization` errors if it lacks the required cluster or index privileges.

## Raw or client-call confusion

Use:

- `elasticsearch_client_call` when you know the official client target name
- `elasticsearch_api_call` when you want direct path/method control or raw-string payloads

## Advanced feature failures

Features such as connectors, watcher, ML, transforms, inference, snapshots, and some security operations may be unavailable because of:

- license tier
- deployment mode
- disabled modules
- missing privileges
- version differences
