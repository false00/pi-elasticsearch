import { Type } from "typebox";
import { buildTool, jsonStringToValue, cleanUndefined } from "./shared.js";

export function snapshotTools(client) {
  return [
    buildTool(client, {
      name: "elasticsearch_snapshot_create_repository",
      label: "Create Snapshot Repository",
      description: "Create or update a snapshot repository.",
      parameters: Type.Object({
        repository: Type.String({ description: "Repository name" }),
        body: Type.String({ description: "Repository body as a JSON object string" }),
      }),
      progress: (params) => `Upserting snapshot repository ${params.repository}...`,
      run: async ({ params }) => await client.request({
        method: "PUT",
        path: `/_snapshot/${encodeURIComponent(params.repository)}`,
        body: jsonStringToValue(params.body, "body", { required: true, expect: "object" }),
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_snapshot_get_repository",
      label: "Get Snapshot Repository",
      description: "Get one or more snapshot repositories.",
      parameters: Type.Object({
        repository: Type.Optional(Type.String({ description: "Optional repository name or pattern" })),
      }),
      progress: "Fetching snapshot repository metadata...",
      run: async ({ params }) => await client.request({
        method: "GET",
        path: params.repository ? `/_snapshot/${encodeURIComponent(params.repository)}` : "/_snapshot",
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_snapshot_delete_repository",
      label: "Delete Snapshot Repository",
      description: "Delete a snapshot repository.",
      parameters: Type.Object({
        repository: Type.String({ description: "Repository name" }),
      }),
      progress: (params) => `Deleting snapshot repository ${params.repository}...`,
      run: async ({ params }) => await client.request({ method: "DELETE", path: `/_snapshot/${encodeURIComponent(params.repository)}` }),
    }),
    buildTool(client, {
      name: "elasticsearch_snapshot_create",
      label: "Create Snapshot",
      description: "Create a snapshot in a repository.",
      parameters: Type.Object({
        repository: Type.String({ description: "Repository name" }),
        snapshot: Type.String({ description: "Snapshot name" }),
        body: Type.Optional(Type.String({ description: "Optional snapshot body as a JSON object string" })),
        wait_for_completion: Type.Optional(Type.Boolean({ description: "Whether to wait for completion" })),
      }),
      progress: (params) => `Creating snapshot ${params.repository}/${params.snapshot}...`,
      run: async ({ params }) => await client.request({
        method: "PUT",
        path: `/_snapshot/${encodeURIComponent(params.repository)}/${encodeURIComponent(params.snapshot)}`,
        query: cleanUndefined({ wait_for_completion: params.wait_for_completion }),
        body: params.body ? jsonStringToValue(params.body, "body", { expect: "object" }) : undefined,
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_snapshot_get",
      label: "Get Snapshot",
      description: "Get one or more snapshots from a repository.",
      parameters: Type.Object({
        repository: Type.String({ description: "Repository name" }),
        snapshot: Type.Optional(Type.String({ description: "Optional snapshot name or pattern" })),
      }),
      progress: (params) => `Fetching snapshot metadata from ${params.repository}...`,
      run: async ({ params }) => await client.request({
        method: "GET",
        path: params.snapshot
          ? `/_snapshot/${encodeURIComponent(params.repository)}/${encodeURIComponent(params.snapshot)}`
          : `/_snapshot/${encodeURIComponent(params.repository)}`,
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_snapshot_status",
      label: "Get Snapshot Status",
      description: "Get status for one or more snapshots.",
      parameters: Type.Object({
        repository: Type.String({ description: "Repository name" }),
        snapshot: Type.Optional(Type.String({ description: "Optional snapshot name or pattern" })),
      }),
      progress: (params) => `Fetching snapshot status from ${params.repository}...`,
      run: async ({ params }) => await client.request({
        method: "GET",
        path: params.snapshot
          ? `/_snapshot/${encodeURIComponent(params.repository)}/${encodeURIComponent(params.snapshot)}/_status`
          : `/_snapshot/${encodeURIComponent(params.repository)}/_status`,
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_snapshot_restore",
      label: "Restore Snapshot",
      description: "Restore a snapshot into the cluster.",
      parameters: Type.Object({
        repository: Type.String({ description: "Repository name" }),
        snapshot: Type.String({ description: "Snapshot name" }),
        body: Type.Optional(Type.String({ description: "Optional restore body as a JSON object string" })),
        wait_for_completion: Type.Optional(Type.Boolean({ description: "Whether to wait for completion" })),
      }),
      progress: (params) => `Restoring snapshot ${params.repository}/${params.snapshot}...`,
      run: async ({ params }) => await client.request({
        method: "POST",
        path: `/_snapshot/${encodeURIComponent(params.repository)}/${encodeURIComponent(params.snapshot)}/_restore`,
        query: cleanUndefined({ wait_for_completion: params.wait_for_completion }),
        body: params.body ? jsonStringToValue(params.body, "body", { expect: "object" }) : undefined,
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_snapshot_delete",
      label: "Delete Snapshot",
      description: "Delete a snapshot from a repository.",
      parameters: Type.Object({
        repository: Type.String({ description: "Repository name" }),
        snapshot: Type.String({ description: "Snapshot name" }),
      }),
      progress: (params) => `Deleting snapshot ${params.repository}/${params.snapshot}...`,
      run: async ({ params }) => await client.request({
        method: "DELETE",
        path: `/_snapshot/${encodeURIComponent(params.repository)}/${encodeURIComponent(params.snapshot)}`,
      }),
    }),
  ];
}
