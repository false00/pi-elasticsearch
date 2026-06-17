import { resolveToolTimeoutMs } from "./tool-settings.js";

export function createToolError(message, extras = {}) {
  const error = new Error(message);
  error.name = extras.name || "ElasticsearchError";
  if (extras.status !== undefined) error.status = extras.status;
  if (extras.category) error.category = extras.category;
  if (extras.guidance) error.guidance = extras.guidance;
  if (extras.retryable !== undefined) error.retryable = extras.retryable;
  if (extras.endpoint) error.endpoint = extras.endpoint;
  if (extras.method) error.method = extras.method;
  if (extras.target) error.target = extras.target;
  return error;
}

export function throwIfAborted(signal) {
  if (signal?.aborted) {
    throw new DOMException("The operation was aborted", "AbortError");
  }
}

export function emitProgress(onUpdate, msg) {
  if (typeof onUpdate !== "function") return;
  try {
    onUpdate({
      content: [{ type: "text", text: msg }],
      details: { status: msg },
    });
  } catch {
    // noop
  }
}

async function runWithToolTimeout(fn, timeoutMs) {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    return await fn();
  }

  let timer;
  try {
    return await Promise.race([
      Promise.resolve().then(fn),
      new Promise((_, reject) => {
        timer = setTimeout(() => {
          reject(createToolError(`Tool timed out after ${timeoutMs}ms`, {
            status: 408,
            category: "timeout",
            retryable: true,
          }));
        }, timeoutMs);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

function inferCategory(err) {
  if (err?.category) return err.category;
  const status = err?.status ?? err?.statusCode ?? err?.meta?.statusCode;
  const name = String(err?.name || "");
  const message = String(err?.message || err || "");
  const lower = message.toLowerCase();

  if (name === "ConfigurationError" || lower.includes("not configured") || lower.includes("cloud id") || lower.includes("elasticsearch_url")) return "configuration";
  if (status === 400 || name === "SerializationError" || lower.includes("invalid") || lower.includes("must be valid json")) return "validation";
  if (status === 401) return "authentication";
  if (status === 403) return "authorization";
  if (status === 404) return "not_found";
  if (status === 409) return "conflict";
  if (status === 429) return "rate_limit";
  if (name === "TimeoutError" || lower.includes("timeout") || lower.includes("timed out") || lower.includes("aborted")) return "timeout";
  if (name === "ConnectionError" || name === "NoLivingConnectionsError" || lower.includes("econn") || lower.includes("enotfound") || lower.includes("network") || lower.includes("socket") || lower.includes("certificate")) return "network";
  if (typeof status === "number" && status >= 500) return "server_error";
  return "unknown";
}

function inferGuidance(category) {
  return {
    configuration: "Update ~/.config/pi-elasticsearch/.env with ELASTICSEARCH_URL or ELASTICSEARCH_CLOUD_ID and the appropriate credentials, then retry.",
    validation: "Check parameter types, JSON strings, and request shape.",
    authentication: "Verify ELASTICSEARCH_API_KEY, ELASTICSEARCH_USERNAME/ELASTICSEARCH_PASSWORD, or ELASTICSEARCH_BEARER_TOKEN.",
    authorization: "The current credentials are valid but lack sufficient cluster or index privileges for this operation.",
    not_found: "The requested index, document, snapshot, user, or endpoint resource does not exist.",
    conflict: "The request conflicted with current cluster state. Check versioning, resource existence, or concurrent operations.",
    rate_limit: "The cluster or upstream gateway rate-limited the request. Retry with backoff.",
    timeout: "The request or tool timed out. Retry with a narrower scope or increase ELASTICSEARCH_REQUEST_TIMEOUT_MS / ELASTICSEARCH_TOOL_TIMEOUT_MS.",
    network: "Pi could not reach Elasticsearch. Verify ELASTICSEARCH_URL, TLS settings, and network connectivity.",
    server_error: "Elasticsearch returned a server-side failure. Check cluster health, logs, and the request body.",
    unknown: "Unexpected error. Retry the request and inspect the returned message for transport details.",
  }[category];
}

function unwrapMessage(err) {
  if (!err) return "Unknown error";
  if (typeof err === "string") return err;
  if (err.meta?.body?.error) {
    if (typeof err.meta.body.error === "string") return err.meta.body.error;
    if (err.meta.body.error.reason) return err.meta.body.error.reason;
    if (err.meta.body.error.type) return `${err.meta.body.error.type}: ${err.meta.body.error.reason || "request failed"}`;
  }
  return err.message || String(err);
}

function toToolError(err) {
  if (err?.name === "AbortError") return err;
  if (err?.message && err?.details && err?.name === "ElasticsearchToolError") return err;

  const category = inferCategory(err);
  const status = err?.status ?? err?.statusCode ?? err?.meta?.statusCode;
  const retryable = typeof err?.retryable === "boolean"
    ? err.retryable
    : category === "timeout" || category === "network" || category === "server_error" || category === "rate_limit";

  const details = {
    error: unwrapMessage(err),
    category,
    guidance: err?.guidance || inferGuidance(category),
    retryable,
  };

  if (err?.endpoint) details.endpoint = err.endpoint;
  if (err?.method) details.method = err.method;
  if (err?.target) details.target = err.target;
  if (status) details.httpStatus = status;

  const wrapped = new Error(JSON.stringify(details, null, 2));
  wrapped.name = "ElasticsearchToolError";
  wrapped.category = category;
  wrapped.retryable = retryable;
  wrapped.details = details;
  wrapped.cause = err;
  if (status) wrapped.status = status;
  if (err?.endpoint) wrapped.endpoint = err.endpoint;
  if (err?.method) wrapped.method = err.method;
  if (err?.target) wrapped.target = err.target;
  return wrapped;
}

export function safeExecute(fn) {
  return async (_toolCallId, params, signal, onUpdate, _ctx) => {
    try {
      throwIfAborted(signal);
      const raw = await runWithToolTimeout(() => fn(params, signal, onUpdate), resolveToolTimeoutMs());
      const hasExtras = raw && typeof raw === "object" && !Array.isArray(raw) && "_data" in raw;
      const result = hasExtras ? raw._data : raw;
      const notes = hasExtras && Array.isArray(raw._notes) ? raw._notes : [];
      const content = [{ type: "text", text: JSON.stringify(result, null, 2) }];
      for (const note of notes) {
        content.push({ type: "text", text: note });
      }
      return { content };
    } catch (err) {
      if (err?.name === "AbortError") throw err;
      throw toToolError(err);
    }
  };
}
