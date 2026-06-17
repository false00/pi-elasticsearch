import { Type } from "typebox";
import { buildTool, jsonStringToValue, cleanUndefined } from "./shared.js";

export function transformTools(client) {
  return [
    buildTool(client, {
      name: "elasticsearch_transform_put",
      label: "Put Transform",
      description: "Create or update a transform.",
      parameters: Type.Object({
        id: Type.String({ description: "Transform id" }),
        body: Type.String({ description: "Transform body as a JSON object string" }),
      }),
      progress: (params) => `Upserting transform ${params.id}...`,
      run: async ({ params }) => await client.request({
        method: "PUT",
        path: `/_transform/${encodeURIComponent(params.id)}`,
        body: jsonStringToValue(params.body, "body", { required: true, expect: "object" }),
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_transform_get",
      label: "Get Transform",
      description: "Get one or more transforms.",
      parameters: Type.Object({
        id: Type.Optional(Type.String({ description: "Optional transform id or pattern" })),
      }),
      progress: "Fetching transform definitions...",
      run: async ({ params }) => await client.request({
        method: "GET",
        path: params.id ? `/_transform/${encodeURIComponent(params.id)}` : "/_transform",
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_transform_start",
      label: "Start Transform",
      description: "Start a stopped transform.",
      parameters: Type.Object({
        id: Type.String({ description: "Transform id" }),
      }),
      progress: (params) => `Starting transform ${params.id}...`,
      run: async ({ params }) => await client.request({ method: "POST", path: `/_transform/${encodeURIComponent(params.id)}/_start` }),
    }),
    buildTool(client, {
      name: "elasticsearch_transform_stop",
      label: "Stop Transform",
      description: "Stop a running transform.",
      parameters: Type.Object({
        id: Type.String({ description: "Transform id" }),
        wait_for_completion: Type.Optional(Type.Boolean({ description: "Whether to wait for completion" })),
        force: Type.Optional(Type.Boolean({ description: "Whether to force stop" })),
      }),
      progress: (params) => `Stopping transform ${params.id}...`,
      run: async ({ params }) => await client.request({
        method: "POST",
        path: `/_transform/${encodeURIComponent(params.id)}/_stop`,
        query: cleanUndefined({ wait_for_completion: params.wait_for_completion, force: params.force }),
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_transform_delete",
      label: "Delete Transform",
      description: "Delete a transform.",
      parameters: Type.Object({
        id: Type.String({ description: "Transform id" }),
        force: Type.Optional(Type.Boolean({ description: "Whether to force delete" })),
      }),
      progress: (params) => `Deleting transform ${params.id}...`,
      run: async ({ params }) => await client.request({
        method: "DELETE",
        path: `/_transform/${encodeURIComponent(params.id)}`,
        query: cleanUndefined({ force: params.force }),
      }),
    }),
  ];
}
