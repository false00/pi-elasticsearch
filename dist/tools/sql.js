import { Type } from "typebox";
import { buildTool, jsonStringToValue } from "./shared.js";

export function sqlTools(client) {
  return [
    buildTool(client, {
      name: "elasticsearch_sql_query",
      label: "Run SQL Query",
      description: "Run an Elasticsearch SQL query.",
      parameters: Type.Object({
        body: Type.String({ description: "SQL request body as a JSON object string" }),
      }),
      progress: "Running SQL query...",
      run: async ({ params }) => await client.request({
        method: "POST",
        path: "/_sql",
        body: jsonStringToValue(params.body, "body", { required: true, expect: "object" }),
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_sql_translate",
      label: "Translate SQL Query",
      description: "Translate a SQL query into the native Elasticsearch query DSL.",
      parameters: Type.Object({
        body: Type.String({ description: "SQL translate body as a JSON object string" }),
      }),
      progress: "Translating SQL query...",
      run: async ({ params }) => await client.request({
        method: "POST",
        path: "/_sql/translate",
        body: jsonStringToValue(params.body, "body", { required: true, expect: "object" }),
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_sql_clear_cursor",
      label: "Clear SQL Cursor",
      description: "Clear a server-side SQL cursor.",
      parameters: Type.Object({
        cursor: Type.String({ description: "SQL cursor value" }),
      }),
      progress: "Clearing SQL cursor...",
      run: async ({ params }) => await client.request({
        method: "POST",
        path: "/_sql/close",
        body: { cursor: params.cursor },
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_esql_query",
      label: "Run ESQL Query",
      description: "Run an Elasticsearch ESQL query.",
      parameters: Type.Object({
        body: Type.String({ description: "ESQL request body as a JSON object string" }),
      }),
      progress: "Running ESQL query...",
      run: async ({ params }) => await client.request({
        method: "POST",
        path: "/_query",
        body: jsonStringToValue(params.body, "body", { required: true, expect: "object" }),
      }),
    }),
  ];
}
