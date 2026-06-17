import { Type } from "typebox";
import { buildTool, jsonStringToValue, cleanUndefined } from "./shared.js";

export function connectorTools(client) {
  return [
    buildTool(client, {
      name: "elasticsearch_connector_put",
      label: "Put Connector",
      description: "Create or update an Elasticsearch connector.",
      parameters: Type.Object({
        connector_id: Type.Optional(Type.String({ description: "Optional connector id" })),
        body: Type.String({ description: "Connector body as a JSON object string" }),
      }),
      progress: "Upserting connector...",
      run: async ({ params }) => await client.request({
        method: "PUT",
        path: params.connector_id ? `/_connector/${encodeURIComponent(params.connector_id)}` : "/_connector",
        body: jsonStringToValue(params.body, "body", { required: true, expect: "object" }),
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_connector_get",
      label: "Get Connector",
      description: "Get a connector by id.",
      parameters: Type.Object({
        connector_id: Type.String({ description: "Connector id" }),
      }),
      progress: (params) => `Fetching connector ${params.connector_id}...`,
      run: async ({ params }) => await client.request({ method: "GET", path: `/_connector/${encodeURIComponent(params.connector_id)}` }),
    }),
    buildTool(client, {
      name: "elasticsearch_connector_delete",
      label: "Delete Connector",
      description: "Delete a connector by id.",
      parameters: Type.Object({
        connector_id: Type.String({ description: "Connector id" }),
      }),
      progress: (params) => `Deleting connector ${params.connector_id}...`,
      run: async ({ params }) => await client.request({ method: "DELETE", path: `/_connector/${encodeURIComponent(params.connector_id)}` }),
    }),
    buildTool(client, {
      name: "elasticsearch_connector_list",
      label: "List Connectors",
      description: "List connectors.",
      parameters: Type.Object({
        from: Type.Optional(Type.Integer({ description: "Optional result offset" })),
        size: Type.Optional(Type.Integer({ description: "Optional page size" })),
        index_name: Type.Optional(Type.String({ description: "Optional index_name filter" })),
        connector_name: Type.Optional(Type.String({ description: "Optional connector_name filter" })),
        service_type: Type.Optional(Type.String({ description: "Optional service_type filter" })),
      }),
      progress: "Listing connectors...",
      run: async ({ params }) => await client.request({
        method: "GET",
        path: "/_connector",
        query: cleanUndefined({
          from: params.from,
          size: params.size,
          index_name: params.index_name,
          connector_name: params.connector_name,
          service_type: params.service_type,
        }),
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_connector_sync_job_list",
      label: "List Connector Sync Jobs",
      description: "List sync jobs for connectors.",
      parameters: Type.Object({
        connector_id: Type.Optional(Type.String({ description: "Optional connector id filter" })),
        status: Type.Optional(Type.String({ description: "Optional status filter" })),
        from: Type.Optional(Type.Integer({ description: "Optional result offset" })),
        size: Type.Optional(Type.Integer({ description: "Optional page size" })),
      }),
      progress: "Listing connector sync jobs...",
      run: async ({ params }) => await client.request({
        method: "GET",
        path: "/_connector/_sync_job",
        query: cleanUndefined({
          connector_id: params.connector_id,
          status: params.status,
          from: params.from,
          size: params.size,
        }),
      }),
    }),
  ];
}
