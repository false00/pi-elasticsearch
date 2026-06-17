import { Type } from "typebox";
import { buildTool, jsonStringToValue } from "./shared.js";

function inferencePath(taskType, inferenceId) {
  return taskType
    ? `/_inference/${encodeURIComponent(taskType)}/${encodeURIComponent(inferenceId)}`
    : `/_inference/${encodeURIComponent(inferenceId)}`;
}

export function inferenceTools(client) {
  return [
    buildTool(client, {
      name: "elasticsearch_inference_put",
      label: "Put Inference Endpoint",
      description: "Create or update an inference endpoint definition.",
      parameters: Type.Object({
        inference_id: Type.String({ description: "Inference endpoint id" }),
        task_type: Type.Optional(Type.String({ description: "Optional task type such as completion, text_embedding, rerank, or sparse_embedding" })),
        body: Type.String({ description: "Inference endpoint body as a JSON object string" }),
      }),
      progress: (params) => `Upserting inference endpoint ${params.inference_id}...`,
      run: async ({ params }) => await client.request({
        method: "PUT",
        path: inferencePath(params.task_type, params.inference_id),
        body: jsonStringToValue(params.body, "body", { required: true, expect: "object" }),
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_inference_get",
      label: "Get Inference Endpoints",
      description: "Get inference endpoint definitions.",
      parameters: Type.Object({
        inference_id: Type.Optional(Type.String({ description: "Optional inference endpoint id" })),
        task_type: Type.Optional(Type.String({ description: "Optional task type filter" })),
      }),
      progress: "Fetching inference endpoint definitions...",
      run: async ({ params }) => {
        let path = "/_inference";
        if (params.task_type && !params.inference_id) path = `/_inference/${encodeURIComponent(params.task_type)}/_all`;
        else if (params.inference_id) path = inferencePath(params.task_type, params.inference_id);
        return await client.request({ method: "GET", path });
      },
    }),
    buildTool(client, {
      name: "elasticsearch_inference_delete",
      label: "Delete Inference Endpoint",
      description: "Delete an inference endpoint definition.",
      parameters: Type.Object({
        inference_id: Type.String({ description: "Inference endpoint id" }),
        task_type: Type.Optional(Type.String({ description: "Optional task type" })),
      }),
      progress: (params) => `Deleting inference endpoint ${params.inference_id}...`,
      run: async ({ params }) => await client.request({ method: "DELETE", path: inferencePath(params.task_type, params.inference_id) }),
    }),
    buildTool(client, {
      name: "elasticsearch_inference_completion",
      label: "Run Inference Completion",
      description: "Run a completion inference request against an inference endpoint.",
      parameters: Type.Object({
        inference_id: Type.String({ description: "Inference endpoint id" }),
        body: Type.String({ description: "Completion request body as a JSON object string" }),
      }),
      progress: "Running completion inference...",
      run: async ({ params }) => await client.request({
        method: "POST",
        path: `/_inference/completion/${encodeURIComponent(params.inference_id)}`,
        body: jsonStringToValue(params.body, "body", { required: true, expect: "object" }),
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_inference_text_embedding",
      label: "Run Text Embedding Inference",
      description: "Generate text embeddings via an inference endpoint.",
      parameters: Type.Object({
        inference_id: Type.String({ description: "Inference endpoint id" }),
        body: Type.String({ description: "Text embedding request body as a JSON object string" }),
      }),
      progress: "Running text embedding inference...",
      run: async ({ params }) => await client.request({
        method: "POST",
        path: `/_inference/text_embedding/${encodeURIComponent(params.inference_id)}`,
        body: jsonStringToValue(params.body, "body", { required: true, expect: "object" }),
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_inference_rerank",
      label: "Run Rerank Inference",
      description: "Run a reranking inference request against an inference endpoint.",
      parameters: Type.Object({
        inference_id: Type.String({ description: "Inference endpoint id" }),
        body: Type.String({ description: "Rerank request body as a JSON object string" }),
      }),
      progress: "Running rerank inference...",
      run: async ({ params }) => await client.request({
        method: "POST",
        path: `/_inference/rerank/${encodeURIComponent(params.inference_id)}`,
        body: jsonStringToValue(params.body, "body", { required: true, expect: "object" }),
      }),
    }),
  ];
}
