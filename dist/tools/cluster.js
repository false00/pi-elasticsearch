import { Type } from "typebox";
import { buildTool, jsonStringToValue, cleanUndefined } from "./shared.js";

export function clusterTools(client) {
  return [
    buildTool(client, {
      name: "elasticsearch_cluster_stats",
      label: "Cluster Stats",
      description: "Get cluster-wide statistics.",
      parameters: Type.Object({}),
      progress: "Fetching cluster stats...",
      run: async () => await client.request({ method: "GET", path: "/_cluster/stats" }),
    }),
    buildTool(client, {
      name: "elasticsearch_cluster_state",
      label: "Cluster State",
      description: "Get cluster state information, optionally scoped by metric and index.",
      parameters: Type.Object({
        metric: Type.Optional(Type.String({ description: "Optional comma-separated state metrics" })),
        index: Type.Optional(Type.String({ description: "Optional comma-separated index names or patterns" })),
      }),
      progress: "Fetching cluster state...",
      run: async ({ params }) => {
        const suffix = [params.metric, params.index].filter(Boolean).map((v) => encodeURIComponent(v)).join("/");
        return await client.request({ method: "GET", path: suffix ? `/_cluster/state/${suffix}` : "/_cluster/state" });
      },
    }),
    buildTool(client, {
      name: "elasticsearch_cluster_pending_tasks",
      label: "Cluster Pending Tasks",
      description: "List pending cluster tasks.",
      parameters: Type.Object({}),
      progress: "Fetching pending cluster tasks...",
      run: async () => await client.request({ method: "GET", path: "/_cluster/pending_tasks" }),
    }),
    buildTool(client, {
      name: "elasticsearch_cluster_get_settings",
      label: "Get Cluster Settings",
      description: "Get cluster settings.",
      parameters: Type.Object({}),
      progress: "Fetching cluster settings...",
      run: async () => await client.request({ method: "GET", path: "/_cluster/settings" }),
    }),
    buildTool(client, {
      name: "elasticsearch_cluster_put_settings",
      label: "Update Cluster Settings",
      description: "Update persistent or transient cluster settings.",
      parameters: Type.Object({
        body: Type.String({ description: "Cluster settings body as a JSON object string" }),
      }),
      progress: "Updating cluster settings...",
      run: async ({ params }) => await client.request({
        method: "PUT",
        path: "/_cluster/settings",
        body: jsonStringToValue(params.body, "body", { required: true, expect: "object" }),
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_cluster_allocation_explain",
      label: "Cluster Allocation Explain",
      description: "Explain shard allocation decisions, optionally with a request body.",
      parameters: Type.Object({
        body: Type.Optional(Type.String({ description: "Optional allocation-explain body as a JSON object string" })),
      }),
      progress: "Explaining shard allocation...",
      run: async ({ params }) => await client.request({
        method: params.body ? "POST" : "GET",
        path: "/_cluster/allocation/explain",
        body: params.body ? jsonStringToValue(params.body, "body", { expect: "object" }) : undefined,
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_cluster_reroute",
      label: "Cluster Reroute",
      description: "Run a cluster reroute request with commands and reroute options.",
      parameters: Type.Object({
        body: Type.String({ description: "Cluster reroute body as a JSON object string" }),
        dry_run: Type.Optional(Type.Boolean({ description: "Whether to simulate the reroute only" })),
        explain: Type.Optional(Type.Boolean({ description: "Whether to return explanations" })),
      }),
      progress: "Running cluster reroute...",
      run: async ({ params }) => await client.request({
        method: "POST",
        path: "/_cluster/reroute",
        query: cleanUndefined({ dry_run: params.dry_run, explain: params.explain }),
        body: jsonStringToValue(params.body, "body", { required: true, expect: "object" }),
      }),
    }),
  ];
}
