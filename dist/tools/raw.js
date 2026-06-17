import { Type } from "typebox";
import { createToolError } from "../tool-runtime.js";
import { buildTool, jsonStringToValue, parseHeaders } from "./shared.js";

const ALLOWED_METHODS = new Set(["GET", "POST", "PUT", "DELETE", "HEAD"]);

function normalizePath(path) {
  if (!path || typeof path !== "string") {
    throw createToolError("path is required", {
      status: 400,
      category: "validation",
      guidance: "Provide an Elasticsearch API path such as '/_cluster/health' or '/my-index/_search'.",
      retryable: false,
    });
  }
  if (/^https?:\/\//i.test(path)) {
    throw createToolError("path must be an API path, not a full URL", {
      status: 400,
      category: "validation",
      guidance: "Use a path under the Elasticsearch server root, not a full URL.",
      retryable: false,
    });
  }
  return path.startsWith("/") ? path : `/${path}`;
}

export function rawApiTools(client) {
  return [
    buildTool(client, {
      name: "elasticsearch_api_call",
      label: "Call Elasticsearch REST API",
      description: "Universal raw REST API tool for Elasticsearch. Supports GET, POST, PUT, DELETE, and HEAD with JSON or raw-string bodies.",
      parameters: Type.Object({
        method: Type.String({ description: "HTTP method: GET, POST, PUT, DELETE, or HEAD" }),
        path: Type.String({ description: "Elasticsearch API path, absolute or relative. Example: '/_cluster/health' or 'my-index/_search'" }),
        query: Type.Optional(Type.String({ description: "Optional query-string parameters as a JSON object string" })),
        body_json: Type.Optional(Type.String({ description: "Optional request body as a JSON string that decodes to any valid JSON value" })),
        body: Type.Optional(Type.String({ description: "Optional raw request body string. Useful for NDJSON or plain-text endpoints." })),
        headers: Type.Optional(Type.String({ description: "Optional HTTP headers as a JSON object string" })),
        content_type: Type.Optional(Type.String({ description: "Optional Content-Type override such as 'application/x-ndjson'" })),
      }),
      progress: (params) => `Calling ${String(params.method || "GET").toUpperCase()} ${params.path}...`,
      run: async ({ params }) => {
        const method = String(params.method || "").toUpperCase();
        if (!ALLOWED_METHODS.has(method)) {
          throw createToolError(`Unsupported method '${params.method}'`, {
            status: 400,
            category: "validation",
            guidance: "Use one of: GET, POST, PUT, DELETE, HEAD.",
            retryable: false,
          });
        }

        if (params.body !== undefined && params.body_json !== undefined) {
          throw createToolError("body and body_json are mutually exclusive", {
            status: 400,
            category: "validation",
            guidance: "Use body_json for structured JSON requests or body for raw string payloads, but not both.",
            retryable: false,
          });
        }

        const headers = parseHeaders(params.headers);
        if (params.content_type) {
          headers["content-type"] = params.content_type;
        }

        return await client.request({
          method,
          path: normalizePath(params.path),
          query: jsonStringToValue(params.query, "query", { defaultValue: {}, expect: "object" }),
          body: params.body !== undefined
            ? params.body
            : jsonStringToValue(params.body_json, "body_json", { defaultValue: undefined }),
          headers,
        });
      },
    }),
  ];
}
