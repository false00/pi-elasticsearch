import { Type } from "typebox";
import { buildTool } from "./shared.js";

export function coreTools(client) {
  return [
    buildTool(client, {
      name: "elasticsearch_ping",
      label: "Ping Elasticsearch",
      description: "Check whether the Elasticsearch cluster is reachable.",
      parameters: Type.Object({}),
      progress: "Pinging Elasticsearch...",
      run: async () => await client.clientCall("ping", {}),
    }),
    buildTool(client, {
      name: "elasticsearch_info",
      label: "Get Cluster Info",
      description: "Get basic cluster and version information from Elasticsearch.",
      parameters: Type.Object({}),
      progress: "Fetching cluster info...",
      run: async () => await client.clientCall("info", {}),
    }),
    buildTool(client, {
      name: "elasticsearch_health",
      label: "Get Cluster Health",
      description: "Get cluster health, optionally scoped to one or more indices.",
      parameters: Type.Object({
        index: Type.Optional(Type.String({ description: "Optional comma-separated index names or patterns" })),
        level: Type.Optional(Type.String({ description: "Optional detail level: cluster, indices, or shards" })),
        wait_for_status: Type.Optional(Type.String({ description: "Optional wait target: green, yellow, or red" })),
        timeout: Type.Optional(Type.String({ description: "Optional request timeout such as '30s'" })),
      }),
      progress: (params) => `Fetching cluster health${params.index ? ` for ${params.index}` : ""}...`,
      run: async ({ params }) => await client.request({
        method: "GET",
        path: params.index ? `/_cluster/health/${encodeURIComponent(params.index)}` : "/_cluster/health",
        query: {
          level: params.level,
          wait_for_status: params.wait_for_status,
          timeout: params.timeout,
        },
      }),
    }),
  ];
}
