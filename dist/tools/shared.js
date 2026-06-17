import { createToolError, emitProgress, safeExecute, throwIfAborted } from "../tool-runtime.js";

export function buildTool(client, spec) {
  return {
    name: spec.name,
    label: spec.label,
    description: spec.description,
    parameters: spec.parameters,
    execute: safeExecute(async (params, signal, onUpdate) => {
      throwIfAborted(signal);
      if (spec.progress) {
        emitProgress(onUpdate, typeof spec.progress === "function" ? spec.progress(params) : spec.progress);
      }
      const result = await spec.run({ client, params, signal, onUpdate });
      return spec.transform ? spec.transform(result, params) : result;
    }),
  };
}

export function jsonStringToValue(input, fieldName, { required = false, expect = "any", defaultValue } = {}) {
  if (input === undefined || input === null || input === "") {
    if (required) {
      throw createToolError(`${fieldName} is required`, {
        status: 400,
        category: "validation",
        guidance: `Provide ${fieldName} as valid JSON${expect === "any" ? "" : ` (${expect})`}.`,
        retryable: false,
      });
    }
    return defaultValue;
  }

  let parsed;
  try {
    parsed = JSON.parse(input);
  } catch {
    throw createToolError(`${fieldName} must be valid JSON`, {
      status: 400,
      category: "validation",
      guidance: `The '${fieldName}' parameter must be a valid JSON string.`,
      retryable: false,
    });
  }

  if (expect === "object" && (!parsed || typeof parsed !== "object" || Array.isArray(parsed))) {
    throw createToolError(`${fieldName} must be a JSON object`, {
      status: 400,
      category: "validation",
      guidance: `The '${fieldName}' parameter must decode to a JSON object.`,
      retryable: false,
    });
  }

  if (expect === "array" && !Array.isArray(parsed)) {
    throw createToolError(`${fieldName} must be a JSON array`, {
      status: 400,
      category: "validation",
      guidance: `The '${fieldName}' parameter must decode to a JSON array.`,
      retryable: false,
    });
  }

  return parsed;
}

export function cleanUndefined(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined && value !== null && value !== ""));
}

export function buildPath(...segments) {
  const flat = segments.flat().filter((segment) => segment !== undefined && segment !== null && segment !== "");
  if (flat.length === 0) return "/";
  return `/${flat.map((segment) => encodeURIComponent(String(segment))).join("/")}`;
}

export function joinList(value) {
  if (value === undefined || value === null || value === "") return undefined;
  return Array.isArray(value) ? value.join(",") : String(value);
}

export function parseHeaders(input, fieldName = "headers") {
  const value = jsonStringToValue(input, fieldName, { defaultValue: {}, expect: "object" });
  return Object.fromEntries(Object.entries(value).map(([key, val]) => [key, String(val)]));
}

export function ndjsonStringFromJsonArray(input, fieldName) {
  const items = jsonStringToValue(input, fieldName, { required: true, expect: "array" });
  return `${items.map((item) => JSON.stringify(item)).join("\n")}\n`;
}
