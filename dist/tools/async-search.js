import { Type } from "typebox";
import { buildTool, jsonStringToValue, cleanUndefined } from "./shared.js";

export function asyncSearchTools(client) {
  return [
    buildTool(client, {
      name: "elasticsearch_async_search_submit",
      label: "Submit Async Search",
      description: "Submit an async search request.",
      parameters: Type.Object({
        index: Type.Optional(Type.String({ description: "Optional comma-separated index names or patterns" })),
        body: Type.String({ description: "Async search body as a JSON object string" }),
        wait_for_completion_timeout: Type.Optional(Type.String({ description: "Optional completion wait such as '1s'" })),
        keep_on_completion: Type.Optional(Type.Boolean({ description: "Whether to keep results when the search completes quickly" })),
        keep_alive: Type.Optional(Type.String({ description: "Optional retention value such as '5m'" })),
      }),
      progress: "Submitting async search...",
      run: async ({ params }) => await client.request({
        method: "POST",
        path: params.index ? `/${encodeURIComponent(params.index)}/_async_search` : "/_async_search",
        query: cleanUndefined({
          wait_for_completion_timeout: params.wait_for_completion_timeout,
          keep_on_completion: params.keep_on_completion,
          keep_alive: params.keep_alive,
        }),
        body: jsonStringToValue(params.body, "body", { required: true, expect: "object" }),
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_async_search_get",
      label: "Get Async Search",
      description: "Get the current result of an async search by id.",
      parameters: Type.Object({
        id: Type.String({ description: "Async search id" }),
      }),
      progress: "Fetching async search result...",
      run: async ({ params }) => await client.request({ method: "GET", path: `/_async_search/${encodeURIComponent(params.id)}` }),
    }),
    buildTool(client, {
      name: "elasticsearch_async_search_status",
      label: "Get Async Search Status",
      description: "Get status information for an async search by id.",
      parameters: Type.Object({
        id: Type.String({ description: "Async search id" }),
      }),
      progress: "Fetching async search status...",
      run: async ({ params }) => await client.request({ method: "GET", path: `/_async_search/status/${encodeURIComponent(params.id)}` }),
    }),
    buildTool(client, {
      name: "elasticsearch_async_search_delete",
      label: "Delete Async Search",
      description: "Delete a stored async search by id.",
      parameters: Type.Object({
        id: Type.String({ description: "Async search id" }),
      }),
      progress: "Deleting async search...",
      run: async ({ params }) => await client.request({ method: "DELETE", path: `/_async_search/${encodeURIComponent(params.id)}` }),
    }),
  ];
}
