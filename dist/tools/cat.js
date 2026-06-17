import { Type } from "typebox";
import { buildTool, cleanUndefined } from "./shared.js";

function withJson(params) {
  return cleanUndefined({ ...params, format: "json" });
}

export function catTools(client) {
  return [
    buildTool(client, {
      name: "elasticsearch_cat_indices",
      label: "CAT Indices",
      description: "List indices in CAT format, returned as JSON for agent-friendly consumption.",
      parameters: Type.Object({
        index: Type.Optional(Type.String({ description: "Optional comma-separated index names or patterns" })),
        bytes: Type.Optional(Type.String({ description: "Optional byte unit such as b, kb, mb, or gb" })),
        s: Type.Optional(Type.String({ description: "Optional sort expression" })),
      }),
      progress: "Listing indices...",
      run: async ({ params }) => await client.clientCall("cat.indices", withJson(params)),
    }),
    buildTool(client, {
      name: "elasticsearch_cat_shards",
      label: "CAT Shards",
      description: "List shards in CAT format, returned as JSON.",
      parameters: Type.Object({
        index: Type.Optional(Type.String({ description: "Optional comma-separated index names or patterns" })),
        bytes: Type.Optional(Type.String({ description: "Optional byte unit such as b, kb, mb, or gb" })),
        s: Type.Optional(Type.String({ description: "Optional sort expression" })),
      }),
      progress: "Listing shards...",
      run: async ({ params }) => await client.clientCall("cat.shards", withJson(params)),
    }),
    buildTool(client, {
      name: "elasticsearch_cat_nodes",
      label: "CAT Nodes",
      description: "List nodes in CAT format, returned as JSON.",
      parameters: Type.Object({
        bytes: Type.Optional(Type.String({ description: "Optional byte unit such as b, kb, mb, or gb" })),
        s: Type.Optional(Type.String({ description: "Optional sort expression" })),
      }),
      progress: "Listing nodes...",
      run: async ({ params }) => await client.clientCall("cat.nodes", withJson(params)),
    }),
    buildTool(client, {
      name: "elasticsearch_cat_health",
      label: "CAT Health",
      description: "Show CAT health output as JSON.",
      parameters: Type.Object({}),
      progress: "Fetching CAT health...",
      run: async () => await client.clientCall("cat.health", { format: "json" }),
    }),
    buildTool(client, {
      name: "elasticsearch_cat_aliases",
      label: "CAT Aliases",
      description: "List aliases in CAT format, returned as JSON.",
      parameters: Type.Object({
        name: Type.Optional(Type.String({ description: "Optional alias name or pattern" })),
      }),
      progress: "Listing aliases...",
      run: async ({ params }) => await client.clientCall("cat.aliases", withJson(params)),
    }),
    buildTool(client, {
      name: "elasticsearch_cat_templates",
      label: "CAT Templates",
      description: "List templates in CAT format, returned as JSON.",
      parameters: Type.Object({
        name: Type.Optional(Type.String({ description: "Optional template name or pattern" })),
      }),
      progress: "Listing templates...",
      run: async ({ params }) => await client.clientCall("cat.templates", withJson(params)),
    }),
  ];
}
