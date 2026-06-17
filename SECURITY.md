# Security policy for `@false00/pi-elasticsearch`

## Scope

This package can read and modify real Elasticsearch clusters through Pi. Treat it as production-impacting automation software.

## Expectations

- Review the source before installing from third parties
- Store credentials in `~/.config/pi-elasticsearch/.env` with restrictive permissions when possible
- Prefer API keys over long-lived username/password credentials when your environment allows it
- Grant only the minimum cluster and index privileges needed for the tasks Pi must perform
- Be careful with destructive tools such as delete, reroute, lifecycle updates, snapshot deletes, and security changes

## Reporting vulnerabilities

If you discover a security issue in this package, please report it privately to the maintainer instead of opening a public issue first.

Include:

- affected package version
- Pi version
- Node.js version
- Elasticsearch version
- reproduction steps
- whether the issue exposes credentials, over-broad permissions, or unauthorized cluster actions

## Hardening notes

- The extension lazily initializes its client so fresh installs do not fail at extension load time
- Tool failures are thrown back to Pi as real tool errors instead of fake success payloads
- Raw and client-escape-hatch tools are intentionally explicit because they can reach destructive endpoints
- This repository should never contain real API keys, passwords, bearer tokens, CA private keys, or customer cluster URLs unless explicitly intended for public disclosure
