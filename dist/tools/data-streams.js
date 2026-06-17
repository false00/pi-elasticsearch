import { Type } from "typebox";
import { buildTool, jsonStringToValue } from "./shared.js";

export function dataStreamTools(client) {
  return [
    buildTool(client, {
      name: "elasticsearch_create_data_stream",
      label: "Create Data Stream",
      description: "Create a data stream.",
      parameters: Type.Object({
        name: Type.String({ description: "Data stream name" }),
      }),
      progress: (params) => `Creating data stream ${params.name}...`,
      run: async ({ params }) => await client.request({ method: "PUT", path: `/_data_stream/${encodeURIComponent(params.name)}` }),
    }),
    buildTool(client, {
      name: "elasticsearch_get_data_stream",
      label: "Get Data Streams",
      description: "Get one or more data streams.",
      parameters: Type.Object({
        name: Type.Optional(Type.String({ description: "Optional data stream name or pattern" })),
      }),
      progress: (params) => `Fetching data stream${params.name ? ` ${params.name}` : "s"}...`,
      run: async ({ params }) => await client.request({
        method: "GET",
        path: params.name ? `/_data_stream/${encodeURIComponent(params.name)}` : "/_data_stream",
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_delete_data_stream",
      label: "Delete Data Stream",
      description: "Delete one or more data streams.",
      parameters: Type.Object({
        name: Type.String({ description: "Data stream name or pattern" }),
      }),
      progress: (params) => `Deleting data stream ${params.name}...`,
      run: async ({ params }) => await client.request({ method: "DELETE", path: `/_data_stream/${encodeURIComponent(params.name)}` }),
    }),
    buildTool(client, {
      name: "elasticsearch_get_data_stream_settings",
      label: "Get Data Stream Settings",
      description: "Get settings for one or more data streams.",
      parameters: Type.Object({
        name: Type.String({ description: "Data stream name or pattern" }),
      }),
      progress: (params) => `Fetching data stream settings for ${params.name}...`,
      run: async ({ params }) => await client.request({ method: "GET", path: `/_data_stream/${encodeURIComponent(params.name)}/_settings` }),
    }),
    buildTool(client, {
      name: "elasticsearch_put_data_stream_settings",
      label: "Update Data Stream Settings",
      description: "Update settings for one or more data streams.",
      parameters: Type.Object({
        name: Type.String({ description: "Data stream name or pattern" }),
        settings: Type.String({ description: "Settings body as a JSON object string" }),
      }),
      progress: (params) => `Updating data stream settings for ${params.name}...`,
      run: async ({ params }) => await client.request({
        method: "PUT",
        path: `/_data_stream/${encodeURIComponent(params.name)}/_settings`,
        body: jsonStringToValue(params.settings, "settings", { required: true, expect: "object" }),
      }),
    }),
  ];
}
