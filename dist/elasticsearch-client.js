import { readFileSync } from "node:fs";
import { Client } from "@elastic/elasticsearch";
import { ensureDotEnvFile, envPath, loadConfig } from "./config.js";
import { createToolError } from "./tool-runtime.js";

function normalizeTarget(target) {
  if (!target || typeof target !== "string") {
    throw createToolError("target is required", {
      status: 400,
      category: "validation",
      guidance: "Provide a dot-delimited official client target such as 'search', 'indices.create', or 'security.getUser'.",
      retryable: false,
    });
  }
  return target.split(".").map((part) => part.trim()).filter(Boolean);
}

function buildMissingConfigurationMessage() {
  const file = ensureDotEnvFile();
  return `Elasticsearch is not configured. Update ${file} with ELASTICSEARCH_URL or ELASTICSEARCH_CLOUD_ID plus credentials, then retry.`;
}

export class ElasticsearchClient {
  constructor(overrides = {}) {
    this.overrides = overrides;
    this.client = null;
    this.runtimeConfig = null;
    ensureDotEnvFile();
  }

  ensureInitialized() {
    if (this.client) return this.client;

    const cfg = loadConfig(this.overrides);
    this.runtimeConfig = cfg;

    if (!cfg.url && !cfg.cloudId) {
      throw createToolError(buildMissingConfigurationMessage(), {
        name: "ConfigurationError",
        category: "configuration",
        retryable: false,
      });
    }

    const options = {
      requestTimeout: cfg.requestTimeoutMs,
      sniffOnStart: cfg.sniffOnStart,
      sniffOnConnectionFault: cfg.sniffOnConnectionFault,
    };

    if (cfg.sniffIntervalMs !== undefined) {
      options.sniffInterval = cfg.sniffIntervalMs;
    }

    if (cfg.cloudId) {
      options.cloud = { id: cfg.cloudId };
    } else {
      options.node = cfg.url;
    }

    if (cfg.caFingerprint) {
      options.caFingerprint = cfg.caFingerprint;
    }

    if (!cfg.verifyTls || cfg.caCertPath) {
      options.tls = {
        ...(options.tls || {}),
        rejectUnauthorized: cfg.verifyTls,
      };
      if (cfg.caCertPath) {
        options.tls.ca = readFileSync(cfg.caCertPath, "utf-8");
      }
    }

    if (cfg.apiKeyId && cfg.apiKeySecret) {
      options.auth = { apiKey: { id: cfg.apiKeyId, api_key: cfg.apiKeySecret } };
    } else if (cfg.apiKey) {
      options.auth = { apiKey: cfg.apiKey };
    } else if (cfg.bearerToken) {
      options.auth = { bearer: cfg.bearerToken };
    } else if (cfg.username || cfg.password) {
      options.auth = {
        username: cfg.username || "",
        password: cfg.password || "",
      };
    }

    this.client = new Client(options);
    return this.client;
  }

  getEnvPath() {
    return envPath();
  }

  async request({ method, path, query, body, headers }) {
    const client = this.ensureInitialized();
    try {
      return await client.transport.request({
        method,
        path,
        querystring: query,
        body,
        headers,
      });
    } catch (error) {
      if (error && typeof error === "object") {
        error.endpoint = path;
        error.method = method;
      }
      throw error;
    }
  }

  async clientCall(target, params = {}) {
    const client = this.ensureInitialized();
    const parts = normalizeTarget(target);
    let parent = client;
    let current = client;

    for (const part of parts) {
      parent = current;
      current = current?.[part];
      if (current === undefined) {
        throw createToolError(`Unknown Elasticsearch client target '${target}'`, {
          status: 400,
          category: "validation",
          guidance: "Use a valid official client target such as 'search', 'indices.create', or 'security.getUser'.",
          retryable: false,
          target,
        });
      }
    }

    if (typeof current !== "function") {
      throw createToolError(`Target '${target}' is not callable`, {
        status: 400,
        category: "validation",
        guidance: "The provided target must resolve to an official client method.",
        retryable: false,
        target,
      });
    }

    try {
      return await current.call(parent, params);
    } catch (error) {
      if (error && typeof error === "object") {
        error.target = target;
      }
      throw error;
    }
  }
}

export function createClient(overrides = {}) {
  return new ElasticsearchClient(overrides);
}
