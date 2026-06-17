import { Type } from "typebox";
import { buildTool, jsonStringToValue, cleanUndefined } from "./shared.js";

export function documentTools(client) {
  return [
    buildTool(client, {
      name: "elasticsearch_get_document",
      label: "Get Document",
      description: "Get a single document by index and id.",
      parameters: Type.Object({
        index: Type.String({ description: "Index name" }),
        id: Type.String({ description: "Document ID" }),
        routing: Type.Optional(Type.String({ description: "Optional custom routing value" })),
        source: Type.Optional(Type.Boolean({ description: "Whether to return _source" })),
      }),
      progress: (params) => `Fetching document ${params.id} from ${params.index}...`,
      run: async ({ params }) => await client.clientCall("get", cleanUndefined({
        index: params.index,
        id: params.id,
        routing: params.routing,
        _source: params.source,
      })),
    }),
    buildTool(client, {
      name: "elasticsearch_document_exists",
      label: "Check Document Existence",
      description: "Check whether a document exists by index and id.",
      parameters: Type.Object({
        index: Type.String({ description: "Index name" }),
        id: Type.String({ description: "Document ID" }),
        routing: Type.Optional(Type.String({ description: "Optional custom routing value" })),
      }),
      progress: (params) => `Checking whether document ${params.id} exists in ${params.index}...`,
      run: async ({ params }) => await client.clientCall("exists", cleanUndefined({
        index: params.index,
        id: params.id,
        routing: params.routing,
      })),
    }),
    buildTool(client, {
      name: "elasticsearch_index_document",
      label: "Index Document",
      description: "Create or replace a document using the index API. If no id is supplied, Elasticsearch will generate one.",
      parameters: Type.Object({
        index: Type.String({ description: "Index name" }),
        document: Type.String({ description: "Document body as a JSON object string" }),
        id: Type.Optional(Type.String({ description: "Optional document ID" })),
        refresh: Type.Optional(Type.String({ description: "Optional refresh policy: true, false, or wait_for" })),
        routing: Type.Optional(Type.String({ description: "Optional custom routing value" })),
      }),
      progress: (params) => `Indexing document into ${params.index}${params.id ? ` with id ${params.id}` : ""}...`,
      run: async ({ params }) => await client.clientCall("index", cleanUndefined({
        index: params.index,
        id: params.id,
        document: jsonStringToValue(params.document, "document", { required: true, expect: "object" }),
        refresh: params.refresh,
        routing: params.routing,
      })),
    }),
    buildTool(client, {
      name: "elasticsearch_create_document",
      label: "Create Document",
      description: "Create a document only if it does not already exist.",
      parameters: Type.Object({
        index: Type.String({ description: "Index name" }),
        id: Type.String({ description: "Document ID" }),
        document: Type.String({ description: "Document body as a JSON object string" }),
        refresh: Type.Optional(Type.String({ description: "Optional refresh policy: true, false, or wait_for" })),
        routing: Type.Optional(Type.String({ description: "Optional custom routing value" })),
      }),
      progress: (params) => `Creating document ${params.id} in ${params.index}...`,
      run: async ({ params }) => await client.clientCall("create", cleanUndefined({
        index: params.index,
        id: params.id,
        document: jsonStringToValue(params.document, "document", { required: true, expect: "object" }),
        refresh: params.refresh,
        routing: params.routing,
      })),
    }),
    buildTool(client, {
      name: "elasticsearch_update_document",
      label: "Update Document",
      description: "Partially update a document by id. Supports doc, script, upsert, and other official update body fields.",
      parameters: Type.Object({
        index: Type.String({ description: "Index name" }),
        id: Type.String({ description: "Document ID" }),
        body: Type.String({ description: "Update request body as a JSON object string" }),
        refresh: Type.Optional(Type.String({ description: "Optional refresh policy: true, false, or wait_for" })),
        routing: Type.Optional(Type.String({ description: "Optional custom routing value" })),
      }),
      progress: (params) => `Updating document ${params.id} in ${params.index}...`,
      run: async ({ params }) => await client.clientCall("update", cleanUndefined({
        index: params.index,
        id: params.id,
        ...jsonStringToValue(params.body, "body", { required: true, expect: "object" }),
        refresh: params.refresh,
        routing: params.routing,
      })),
    }),
    buildTool(client, {
      name: "elasticsearch_delete_document",
      label: "Delete Document",
      description: "Delete a single document by index and id.",
      parameters: Type.Object({
        index: Type.String({ description: "Index name" }),
        id: Type.String({ description: "Document ID" }),
        refresh: Type.Optional(Type.String({ description: "Optional refresh policy: true, false, or wait_for" })),
        routing: Type.Optional(Type.String({ description: "Optional custom routing value" })),
      }),
      progress: (params) => `Deleting document ${params.id} from ${params.index}...`,
      run: async ({ params }) => await client.clientCall("delete", cleanUndefined({
        index: params.index,
        id: params.id,
        refresh: params.refresh,
        routing: params.routing,
      })),
    }),
    buildTool(client, {
      name: "elasticsearch_mget_documents",
      label: "Multi Get Documents",
      description: "Fetch multiple documents in one request using the official mget API body.",
      parameters: Type.Object({
        index: Type.Optional(Type.String({ description: "Optional default index for IDs-only requests" })),
        body: Type.String({ description: "mget request body as a JSON object string" }),
      }),
      progress: "Fetching multiple documents...",
      run: async ({ params }) => await client.clientCall("mget", cleanUndefined({
        index: params.index,
        body: jsonStringToValue(params.body, "body", { required: true, expect: "object" }),
      })),
    }),
  ];
}
