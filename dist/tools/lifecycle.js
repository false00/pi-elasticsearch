import { Type } from "typebox";
import { buildTool, jsonStringToValue } from "./shared.js";

export function lifecycleTools(client) {
  return [
    buildTool(client, {
      name: "elasticsearch_ilm_get_status",
      label: "Get ILM Status",
      description: "Get Index Lifecycle Management status.",
      parameters: Type.Object({}),
      progress: "Fetching ILM status...",
      run: async () => await client.request({ method: "GET", path: "/_ilm/status" }),
    }),
    buildTool(client, {
      name: "elasticsearch_ilm_put_lifecycle",
      label: "Put ILM Policy",
      description: "Create or update an ILM policy.",
      parameters: Type.Object({
        name: Type.String({ description: "ILM policy name" }),
        body: Type.String({ description: "ILM policy body as a JSON object string" }),
      }),
      progress: (params) => `Upserting ILM policy ${params.name}...`,
      run: async ({ params }) => await client.request({
        method: "PUT",
        path: `/_ilm/policy/${encodeURIComponent(params.name)}`,
        body: jsonStringToValue(params.body, "body", { required: true, expect: "object" }),
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_ilm_get_lifecycle",
      label: "Get ILM Policy",
      description: "Get one or more ILM policies.",
      parameters: Type.Object({
        name: Type.Optional(Type.String({ description: "Optional ILM policy name or pattern" })),
      }),
      progress: "Fetching ILM policies...",
      run: async ({ params }) => await client.request({
        method: "GET",
        path: params.name ? `/_ilm/policy/${encodeURIComponent(params.name)}` : "/_ilm/policy",
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_ilm_delete_lifecycle",
      label: "Delete ILM Policy",
      description: "Delete an ILM policy.",
      parameters: Type.Object({
        name: Type.String({ description: "ILM policy name" }),
      }),
      progress: (params) => `Deleting ILM policy ${params.name}...`,
      run: async ({ params }) => await client.request({ method: "DELETE", path: `/_ilm/policy/${encodeURIComponent(params.name)}` }),
    }),
    buildTool(client, {
      name: "elasticsearch_slm_get_status",
      label: "Get SLM Status",
      description: "Get Snapshot Lifecycle Management status.",
      parameters: Type.Object({}),
      progress: "Fetching SLM status...",
      run: async () => await client.request({ method: "GET", path: "/_slm/status" }),
    }),
    buildTool(client, {
      name: "elasticsearch_slm_put_lifecycle",
      label: "Put SLM Policy",
      description: "Create or update an SLM policy.",
      parameters: Type.Object({
        name: Type.String({ description: "SLM policy name" }),
        body: Type.String({ description: "SLM policy body as a JSON object string" }),
      }),
      progress: (params) => `Upserting SLM policy ${params.name}...`,
      run: async ({ params }) => await client.request({
        method: "PUT",
        path: `/_slm/policy/${encodeURIComponent(params.name)}`,
        body: jsonStringToValue(params.body, "body", { required: true, expect: "object" }),
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_slm_get_lifecycle",
      label: "Get SLM Policy",
      description: "Get one or more SLM policies.",
      parameters: Type.Object({
        name: Type.Optional(Type.String({ description: "Optional SLM policy name or pattern" })),
      }),
      progress: "Fetching SLM policies...",
      run: async ({ params }) => await client.request({
        method: "GET",
        path: params.name ? `/_slm/policy/${encodeURIComponent(params.name)}` : "/_slm/policy",
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_slm_delete_lifecycle",
      label: "Delete SLM Policy",
      description: "Delete an SLM policy.",
      parameters: Type.Object({
        name: Type.String({ description: "SLM policy name" }),
      }),
      progress: (params) => `Deleting SLM policy ${params.name}...`,
      run: async ({ params }) => await client.request({ method: "DELETE", path: `/_slm/policy/${encodeURIComponent(params.name)}` }),
    }),
  ];
}
