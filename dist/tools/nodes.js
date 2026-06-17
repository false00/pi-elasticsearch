import { Type } from "typebox";
import { buildTool } from "./shared.js";

export function nodeTools(client) {
  return [
    buildTool(client, {
      name: "elasticsearch_nodes_info",
      label: "Nodes Info",
      description: "Get information about cluster nodes, optionally scoped to node ids and metrics.",
      parameters: Type.Object({
        node_id: Type.Optional(Type.String({ description: "Optional comma-separated node ids" })),
        metric: Type.Optional(Type.String({ description: "Optional comma-separated metrics" })),
      }),
      progress: "Fetching node info...",
      run: async ({ params }) => {
        const suffix = [params.node_id, params.metric].filter(Boolean).map((v) => encodeURIComponent(v)).join("/");
        return await client.request({ method: "GET", path: suffix ? `/_nodes/${suffix}` : "/_nodes" });
      },
    }),
    buildTool(client, {
      name: "elasticsearch_nodes_stats",
      label: "Nodes Stats",
      description: "Get runtime statistics for cluster nodes.",
      parameters: Type.Object({
        node_id: Type.Optional(Type.String({ description: "Optional comma-separated node ids" })),
        metric: Type.Optional(Type.String({ description: "Optional comma-separated metrics" })),
      }),
      progress: "Fetching node stats...",
      run: async ({ params }) => {
        const base = params.node_id ? `/_nodes/${encodeURIComponent(params.node_id)}/stats` : "/_nodes/stats";
        return await client.request({ method: "GET", path: params.metric ? `${base}/${encodeURIComponent(params.metric)}` : base });
      },
    }),
    buildTool(client, {
      name: "elasticsearch_nodes_hot_threads",
      label: "Nodes Hot Threads",
      description: "Inspect hot threads for one or more nodes.",
      parameters: Type.Object({
        node_id: Type.Optional(Type.String({ description: "Optional comma-separated node ids" })),
        threads: Type.Optional(Type.Integer({ description: "Optional number of threads to return" })),
        type: Type.Optional(Type.String({ description: "Optional report type such as cpu, wait, or block" })),
      }),
      progress: "Fetching node hot threads...",
      run: async ({ params }) => await client.request({
        method: "GET",
        path: params.node_id ? `/_nodes/${encodeURIComponent(params.node_id)}/hot_threads` : "/_nodes/hot_threads",
        query: {
          threads: params.threads,
          type: params.type,
        },
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_nodes_usage",
      label: "Nodes Usage",
      description: "Get REST action usage stats for cluster nodes.",
      parameters: Type.Object({
        node_id: Type.Optional(Type.String({ description: "Optional comma-separated node ids" })),
      }),
      progress: "Fetching node usage stats...",
      run: async ({ params }) => await client.request({
        method: "GET",
        path: params.node_id ? `/_nodes/${encodeURIComponent(params.node_id)}/usage` : "/_nodes/usage",
      }),
    }),
  ];
}
