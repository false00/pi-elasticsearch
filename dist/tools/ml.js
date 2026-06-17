import { Type } from "typebox";
import { buildTool, jsonStringToValue, cleanUndefined } from "./shared.js";

export function mlTools(client) {
  return [
    buildTool(client, {
      name: "elasticsearch_ml_put_job",
      label: "Put ML Job",
      description: "Create or update an anomaly detection job.",
      parameters: Type.Object({
        job_id: Type.String({ description: "ML job id" }),
        body: Type.String({ description: "Job body as a JSON object string" }),
      }),
      progress: (params) => `Upserting ML job ${params.job_id}...`,
      run: async ({ params }) => await client.request({
        method: "PUT",
        path: `/_ml/anomaly_detectors/${encodeURIComponent(params.job_id)}`,
        body: jsonStringToValue(params.body, "body", { required: true, expect: "object" }),
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_ml_get_jobs",
      label: "Get ML Jobs",
      description: "Get anomaly detection jobs.",
      parameters: Type.Object({
        job_id: Type.Optional(Type.String({ description: "Optional job id or pattern" })),
      }),
      progress: "Fetching ML jobs...",
      run: async ({ params }) => await client.request({
        method: "GET",
        path: params.job_id ? `/_ml/anomaly_detectors/${encodeURIComponent(params.job_id)}` : "/_ml/anomaly_detectors",
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_ml_delete_job",
      label: "Delete ML Job",
      description: "Delete an anomaly detection job.",
      parameters: Type.Object({
        job_id: Type.String({ description: "ML job id" }),
        force: Type.Optional(Type.Boolean({ description: "Whether to force delete" })),
      }),
      progress: (params) => `Deleting ML job ${params.job_id}...`,
      run: async ({ params }) => await client.request({
        method: "DELETE",
        path: `/_ml/anomaly_detectors/${encodeURIComponent(params.job_id)}`,
        query: cleanUndefined({ force: params.force }),
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_ml_open_job",
      label: "Open ML Job",
      description: "Open an anomaly detection job.",
      parameters: Type.Object({
        job_id: Type.String({ description: "ML job id" }),
      }),
      progress: (params) => `Opening ML job ${params.job_id}...`,
      run: async ({ params }) => await client.request({ method: "POST", path: `/_ml/anomaly_detectors/${encodeURIComponent(params.job_id)}/_open` }),
    }),
    buildTool(client, {
      name: "elasticsearch_ml_close_job",
      label: "Close ML Job",
      description: "Close an anomaly detection job.",
      parameters: Type.Object({
        job_id: Type.String({ description: "ML job id" }),
        force: Type.Optional(Type.Boolean({ description: "Whether to force close" })),
      }),
      progress: (params) => `Closing ML job ${params.job_id}...`,
      run: async ({ params }) => await client.request({
        method: "POST",
        path: `/_ml/anomaly_detectors/${encodeURIComponent(params.job_id)}/_close`,
        query: cleanUndefined({ force: params.force }),
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_ml_get_trained_models",
      label: "Get Trained Models",
      description: "Get trained ML models.",
      parameters: Type.Object({
        model_id: Type.Optional(Type.String({ description: "Optional trained model id or pattern" })),
      }),
      progress: "Fetching trained models...",
      run: async ({ params }) => await client.request({
        method: "GET",
        path: params.model_id ? `/_ml/trained_models/${encodeURIComponent(params.model_id)}` : "/_ml/trained_models",
      }),
    }),
  ];
}
