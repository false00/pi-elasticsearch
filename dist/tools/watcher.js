import { Type } from "typebox";
import { buildTool, jsonStringToValue } from "./shared.js";

export function watcherTools(client) {
  return [
    buildTool(client, {
      name: "elasticsearch_watcher_put_watch",
      label: "Put Watch",
      description: "Create or update a Watcher watch.",
      parameters: Type.Object({
        id: Type.String({ description: "Watch id" }),
        body: Type.String({ description: "Watch body as a JSON object string" }),
      }),
      progress: (params) => `Upserting watch ${params.id}...`,
      run: async ({ params }) => await client.request({
        method: "PUT",
        path: `/_watcher/watch/${encodeURIComponent(params.id)}`,
        body: jsonStringToValue(params.body, "body", { required: true, expect: "object" }),
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_watcher_get_watch",
      label: "Get Watch",
      description: "Get a watch by id.",
      parameters: Type.Object({
        id: Type.String({ description: "Watch id" }),
      }),
      progress: (params) => `Fetching watch ${params.id}...`,
      run: async ({ params }) => await client.request({ method: "GET", path: `/_watcher/watch/${encodeURIComponent(params.id)}` }),
    }),
    buildTool(client, {
      name: "elasticsearch_watcher_delete_watch",
      label: "Delete Watch",
      description: "Delete a watch by id.",
      parameters: Type.Object({
        id: Type.String({ description: "Watch id" }),
      }),
      progress: (params) => `Deleting watch ${params.id}...`,
      run: async ({ params }) => await client.request({ method: "DELETE", path: `/_watcher/watch/${encodeURIComponent(params.id)}` }),
    }),
    buildTool(client, {
      name: "elasticsearch_watcher_execute_watch",
      label: "Execute Watch",
      description: "Execute a watch by id, or execute an inline watch request body when no id is supplied.",
      parameters: Type.Object({
        id: Type.Optional(Type.String({ description: "Optional watch id" })),
        body: Type.Optional(Type.String({ description: "Optional execute-watch body as a JSON object string" })),
      }),
      progress: "Executing watch...",
      run: async ({ params }) => await client.request({
        method: "POST",
        path: params.id ? `/_watcher/watch/${encodeURIComponent(params.id)}/_execute` : "/_watcher/watch/_execute",
        body: params.body ? jsonStringToValue(params.body, "body", { expect: "object" }) : undefined,
      }),
    }),
  ];
}
