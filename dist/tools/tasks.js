import { Type } from "typebox";
import { buildTool, cleanUndefined } from "./shared.js";

export function taskTools(client) {
  return [
    buildTool(client, {
      name: "elasticsearch_list_tasks",
      label: "List Tasks",
      description: "List currently running or recently completed tasks.",
      parameters: Type.Object({
        actions: Type.Optional(Type.String({ description: "Optional comma-separated action filters" })),
        nodes: Type.Optional(Type.String({ description: "Optional comma-separated node filters" })),
        detailed: Type.Optional(Type.Boolean({ description: "Whether to include detailed task information" })),
        group_by: Type.Optional(Type.String({ description: "Optional grouping mode such as nodes, parents, or none" })),
      }),
      progress: "Listing tasks...",
      run: async ({ params }) => await client.request({
        method: "GET",
        path: "/_tasks",
        query: cleanUndefined({
          actions: params.actions,
          nodes: params.nodes,
          detailed: params.detailed,
          group_by: params.group_by,
        }),
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_get_task",
      label: "Get Task",
      description: "Get details for a specific task id.",
      parameters: Type.Object({
        task_id: Type.String({ description: "Task id" }),
      }),
      progress: (params) => `Fetching task ${params.task_id}...`,
      run: async ({ params }) => await client.request({ method: "GET", path: `/_tasks/${encodeURIComponent(params.task_id)}` }),
    }),
    buildTool(client, {
      name: "elasticsearch_cancel_task",
      label: "Cancel Task",
      description: "Cancel a running task by id.",
      parameters: Type.Object({
        task_id: Type.String({ description: "Task id" }),
      }),
      progress: (params) => `Cancelling task ${params.task_id}...`,
      run: async ({ params }) => await client.request({ method: "POST", path: `/_tasks/${encodeURIComponent(params.task_id)}/_cancel` }),
    }),
  ];
}
