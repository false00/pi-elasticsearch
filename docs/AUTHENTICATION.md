# Authentication guide

`@false00/pi-elasticsearch` supports the common Elasticsearch client authentication modes.

## Configuration file

Create or update:

```text
~/.config/pi-elasticsearch/.env
```

## Supported auth modes

### API key string

```env
ELASTICSEARCH_URL=https://localhost:9200
ELASTICSEARCH_API_KEY=base64EncodedKeyOrApiKeyString
```

### API key id + secret

```env
ELASTICSEARCH_URL=https://localhost:9200
ELASTICSEARCH_API_KEY_ID=abc123
ELASTICSEARCH_API_KEY_SECRET=def456
```

### Bearer token

```env
ELASTICSEARCH_URL=https://localhost:9200
ELASTICSEARCH_BEARER_TOKEN=token-value
```

### Username + password

```env
ELASTICSEARCH_URL=https://localhost:9200
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=changeme
```

## Elastic Cloud

If you use Elastic Cloud, you can configure a Cloud ID instead of a direct URL:

```env
ELASTICSEARCH_CLOUD_ID=deployment-name:BASE64...
ELASTICSEARCH_API_KEY=...
```

## TLS options

```env
ELASTICSEARCH_VERIFY_TLS=true
# ELASTICSEARCH_CA_CERT_PATH=/path/to/http_ca.crt
# ELASTICSEARCH_CA_FINGERPRINT=AA:BB:CC:DD:...
```

Use `ELASTICSEARCH_VERIFY_TLS=false` only when you understand the trust implications.

## Priority order

1. `~/.config/pi-elasticsearch/.env`
2. constructor overrides
3. environment variables
4. built-in defaults

## Recommendation

Prefer API keys over username/password where possible, and grant only the minimum privileges Pi needs for the tasks you intend to automate.
