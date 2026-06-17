import { Type } from "typebox";
import { buildTool, jsonStringToValue } from "./shared.js";

export function ingestTools(client) {
  return [
    buildTool(client, {
      name: "elasticsearch_ingest_put_pipeline",
      label: "Put Ingest Pipeline",
      description: "Create or update an ingest pipeline.",
      parameters: Type.Object({
        id: Type.String({ description: "Pipeline id" }),
        body: Type.String({ description: "Pipeline body as a JSON object string" }),
      }),
      progress: (params) => `Upserting ingest pipeline ${params.id}...`,
      run: async ({ params }) => await client.request({
        method: "PUT",
        path: `/_ingest/pipeline/${encodeURIComponent(params.id)}`,
        body: jsonStringToValue(params.body, "body", { required: true, expect: "object" }),
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_ingest_get_pipeline",
      label: "Get Ingest Pipeline",
      description: "Get one or more ingest pipelines.",
      parameters: Type.Object({
        id: Type.Optional(Type.String({ description: "Optional pipeline id or pattern" })),
      }),
      progress: (params) => `Fetching ingest pipeline${params.id ? ` ${params.id}` : "s"}...`,
      run: async ({ params }) => await client.request({
        method: "GET",
        path: params.id ? `/_ingest/pipeline/${encodeURIComponent(params.id)}` : "/_ingest/pipeline",
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_ingest_delete_pipeline",
      label: "Delete Ingest Pipeline",
      description: "Delete an ingest pipeline.",
      parameters: Type.Object({
        id: Type.String({ description: "Pipeline id" }),
      }),
      progress: (params) => `Deleting ingest pipeline ${params.id}...`,
      run: async ({ params }) => await client.request({ method: "DELETE", path: `/_ingest/pipeline/${encodeURIComponent(params.id)}` }),
    }),
    buildTool(client, {
      name: "elasticsearch_ingest_simulate",
      label: "Simulate Ingest Pipeline",
      description: "Simulate an ingest pipeline using the official simulate request body.",
      parameters: Type.Object({
        id: Type.Optional(Type.String({ description: "Optional pipeline id" })),
        body: Type.String({ description: "Simulate request body as a JSON object string" }),
      }),
      progress: "Simulating ingest pipeline...",
      run: async ({ params }) => await client.request({
        method: "POST",
        path: params.id ? `/_ingest/pipeline/${encodeURIComponent(params.id)}/_simulate` : "/_ingest/pipeline/_simulate",
        body: jsonStringToValue(params.body, "body", { required: true, expect: "object" }),
      }),
    }),
  ];
}
