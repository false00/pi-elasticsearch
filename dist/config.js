import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export function configDir() {
  return process.env.PI_ELASTICSEARCH_CONFIG_DIR?.trim() || join(homedir(), ".config", "pi-elasticsearch");
}

export function envPath() {
  return join(configDir(), ".env");
}

export function parseEnvFile(path) {
  const content = readFileSync(path, "utf-8");
  const vars = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    vars[key] = value;
  }
  return vars;
}

function normalizeOptional(value) {
  if (value === undefined || value === null) return undefined;
  const trimmed = String(value).trim();
  return trimmed || undefined;
}

function parseBoolean(value, fallback) {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "boolean") return value;
  const normalized = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return fallback;
}

function parseInteger(value, fallback) {
  if (value === undefined || value === null || value === "") return fallback;
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function ensureDotEnvFile(discovered = {}) {
  const file = envPath();
  if (existsSync(file)) return file;

  try {
    mkdirSync(configDir(), { recursive: true });
    const lines = [
      "# pi-elasticsearch configuration — auto-created on first run",
      "# Fill in ELASTICSEARCH_URL or ELASTICSEARCH_CLOUD_ID plus credentials, then retry your tool.",
      "",
      "# --- Connection ---",
      `ELASTICSEARCH_URL=${discovered.url || "https://localhost:9200"}`,
      "# ELASTICSEARCH_CLOUD_ID=deployment-name:BASE64...",
      `ELASTICSEARCH_VERIFY_TLS=${discovered.verifyTls ?? true}`,
      "",
      "# --- Authentication ---",
      `ELASTICSEARCH_API_KEY=${discovered.apiKey || ""}`,
      "# ELASTICSEARCH_API_KEY_ID=",
      "# ELASTICSEARCH_API_KEY_SECRET=",
      "# ELASTICSEARCH_BEARER_TOKEN=",
      "# ELASTICSEARCH_USERNAME=elastic",
      "# ELASTICSEARCH_PASSWORD=",
      "",
      "# --- TLS ---",
      "# ELASTICSEARCH_CA_CERT_PATH=/path/to/http_ca.crt",
      "# ELASTICSEARCH_CA_FINGERPRINT=AA:BB:CC:DD:...",
      "",
      "# --- Timeouts ---",
      `ELASTICSEARCH_REQUEST_TIMEOUT_MS=${discovered.requestTimeoutMs || 30000}`,
      `ELASTICSEARCH_TOOL_TIMEOUT_MS=${discovered.toolTimeoutMs || 30000}`,
      "",
      "# --- Optional transport behavior ---",
      `ELASTICSEARCH_SNIFF_ON_START=${discovered.sniffOnStart ?? false}`,
      `ELASTICSEARCH_SNIFF_ON_CONNECTION_FAULT=${discovered.sniffOnConnectionFault ?? false}`,
      "# ELASTICSEARCH_SNIFF_INTERVAL_MS=60000",
    ];
    writeFileSync(file, `${lines.join("\n")}\n`, "utf-8");
  } catch {
    // convenience only
  }
  return file;
}

export function loadConfig(overrides = {}) {
  const file = envPath();
  const fileVars = existsSync(file) ? parseEnvFile(file) : {};

  const url = normalizeOptional(overrides.url)
    || normalizeOptional(fileVars.ELASTICSEARCH_URL)
    || normalizeOptional(process.env.ELASTICSEARCH_URL);

  const cloudId = normalizeOptional(overrides.cloudId)
    || normalizeOptional(fileVars.ELASTICSEARCH_CLOUD_ID)
    || normalizeOptional(process.env.ELASTICSEARCH_CLOUD_ID);

  const apiKey = normalizeOptional(overrides.apiKey)
    || normalizeOptional(fileVars.ELASTICSEARCH_API_KEY)
    || normalizeOptional(process.env.ELASTICSEARCH_API_KEY);

  const apiKeyId = normalizeOptional(overrides.apiKeyId)
    || normalizeOptional(fileVars.ELASTICSEARCH_API_KEY_ID)
    || normalizeOptional(process.env.ELASTICSEARCH_API_KEY_ID);

  const apiKeySecret = normalizeOptional(overrides.apiKeySecret)
    || normalizeOptional(fileVars.ELASTICSEARCH_API_KEY_SECRET)
    || normalizeOptional(process.env.ELASTICSEARCH_API_KEY_SECRET);

  const bearerToken = normalizeOptional(overrides.bearerToken)
    || normalizeOptional(fileVars.ELASTICSEARCH_BEARER_TOKEN)
    || normalizeOptional(process.env.ELASTICSEARCH_BEARER_TOKEN);

  const username = normalizeOptional(overrides.username)
    || normalizeOptional(fileVars.ELASTICSEARCH_USERNAME)
    || normalizeOptional(process.env.ELASTICSEARCH_USERNAME);

  const password = normalizeOptional(overrides.password)
    || normalizeOptional(fileVars.ELASTICSEARCH_PASSWORD)
    || normalizeOptional(process.env.ELASTICSEARCH_PASSWORD);

  const caCertPath = normalizeOptional(overrides.caCertPath)
    || normalizeOptional(fileVars.ELASTICSEARCH_CA_CERT_PATH)
    || normalizeOptional(process.env.ELASTICSEARCH_CA_CERT_PATH);

  const caFingerprint = normalizeOptional(overrides.caFingerprint)
    || normalizeOptional(fileVars.ELASTICSEARCH_CA_FINGERPRINT)
    || normalizeOptional(process.env.ELASTICSEARCH_CA_FINGERPRINT);

  const verifyTls = parseBoolean(
    overrides.verifyTls ?? fileVars.ELASTICSEARCH_VERIFY_TLS ?? process.env.ELASTICSEARCH_VERIFY_TLS,
    true,
  );

  const requestTimeoutMs = parseInteger(
    overrides.requestTimeoutMs ?? fileVars.ELASTICSEARCH_REQUEST_TIMEOUT_MS ?? process.env.ELASTICSEARCH_REQUEST_TIMEOUT_MS,
    30000,
  );

  const toolTimeoutMs = parseInteger(
    overrides.toolTimeoutMs ?? fileVars.ELASTICSEARCH_TOOL_TIMEOUT_MS ?? process.env.ELASTICSEARCH_TOOL_TIMEOUT_MS,
    30000,
  );

  const sniffOnStart = parseBoolean(
    overrides.sniffOnStart ?? fileVars.ELASTICSEARCH_SNIFF_ON_START ?? process.env.ELASTICSEARCH_SNIFF_ON_START,
    false,
  );

  const sniffOnConnectionFault = parseBoolean(
    overrides.sniffOnConnectionFault ?? fileVars.ELASTICSEARCH_SNIFF_ON_CONNECTION_FAULT ?? process.env.ELASTICSEARCH_SNIFF_ON_CONNECTION_FAULT,
    false,
  );

  const sniffIntervalMs = parseInteger(
    overrides.sniffIntervalMs ?? fileVars.ELASTICSEARCH_SNIFF_INTERVAL_MS ?? process.env.ELASTICSEARCH_SNIFF_INTERVAL_MS,
    undefined,
  );

  const resolved = {
    url,
    cloudId,
    apiKey,
    apiKeyId,
    apiKeySecret,
    bearerToken,
    username,
    password,
    caCertPath,
    caFingerprint,
    verifyTls,
    requestTimeoutMs,
    toolTimeoutMs,
    sniffOnStart,
    sniffOnConnectionFault,
    sniffIntervalMs,
  };

  ensureDotEnvFile(resolved);
  return resolved;
}
