import { Type } from "typebox";
import { buildTool, jsonStringToValue, cleanUndefined } from "./shared.js";

export function indexTools(client) {
  return [
    buildTool(client, {
      name: "elasticsearch_create_index",
      label: "Create Index",
      description: "Create an index with optional settings, mappings, aliases, and other create-index body fields.",
      parameters: Type.Object({
        index: Type.String({ description: "Index name" }),
        body: Type.Optional(Type.String({ description: "Optional create-index body as a JSON object string" })),
        wait_for_active_shards: Type.Optional(Type.String({ description: "Optional wait_for_active_shards value" })),
        timeout: Type.Optional(Type.String({ description: "Optional timeout such as '30s'" })),
      }),
      progress: (params) => `Creating index ${params.index}...`,
      run: async ({ params }) => await client.request({
        method: "PUT",
        path: `/${encodeURIComponent(params.index)}`,
        query: cleanUndefined({
          wait_for_active_shards: params.wait_for_active_shards,
          timeout: params.timeout,
        }),
        body: params.body ? jsonStringToValue(params.body, "body", { expect: "object" }) : undefined,
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_delete_index",
      label: "Delete Index",
      description: "Delete one or more indices.",
      parameters: Type.Object({
        index: Type.String({ description: "Comma-separated index names or patterns" }),
      }),
      progress: (params) => `Deleting index ${params.index}...`,
      run: async ({ params }) => await client.request({
        method: "DELETE",
        path: `/${encodeURIComponent(params.index)}`,
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_index_exists",
      label: "Check Index Existence",
      description: "Check whether one or more indices exist.",
      parameters: Type.Object({
        index: Type.String({ description: "Comma-separated index names or patterns" }),
      }),
      progress: (params) => `Checking whether index ${params.index} exists...`,
      run: async ({ params }) => await client.clientCall("indices.exists", { index: params.index }),
    }),
    buildTool(client, {
      name: "elasticsearch_get_indices",
      label: "Get Index Definitions",
      description: "Get index definitions including settings, mappings, and aliases.",
      parameters: Type.Object({
        index: Type.String({ description: "Comma-separated index names or patterns" }),
      }),
      progress: (params) => `Fetching index definitions for ${params.index}...`,
      run: async ({ params }) => await client.request({ method: "GET", path: `/${encodeURIComponent(params.index)}` }),
    }),
    buildTool(client, {
      name: "elasticsearch_get_index_settings",
      label: "Get Index Settings",
      description: "Get settings for one or more indices.",
      parameters: Type.Object({
        index: Type.String({ description: "Comma-separated index names or patterns" }),
      }),
      progress: (params) => `Fetching settings for ${params.index}...`,
      run: async ({ params }) => await client.request({ method: "GET", path: `/${encodeURIComponent(params.index)}/_settings` }),
    }),
    buildTool(client, {
      name: "elasticsearch_put_index_settings",
      label: "Update Index Settings",
      description: "Update dynamic settings on one or more indices.",
      parameters: Type.Object({
        index: Type.String({ description: "Comma-separated index names or patterns" }),
        settings: Type.String({ description: "Settings body as a JSON object string" }),
      }),
      progress: (params) => `Updating settings for ${params.index}...`,
      run: async ({ params }) => await client.request({
        method: "PUT",
        path: `/${encodeURIComponent(params.index)}/_settings`,
        body: jsonStringToValue(params.settings, "settings", { required: true, expect: "object" }),
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_get_index_mapping",
      label: "Get Index Mappings",
      description: "Get mappings for one or more indices.",
      parameters: Type.Object({
        index: Type.String({ description: "Comma-separated index names or patterns" }),
      }),
      progress: (params) => `Fetching mappings for ${params.index}...`,
      run: async ({ params }) => await client.request({ method: "GET", path: `/${encodeURIComponent(params.index)}/_mapping` }),
    }),
    buildTool(client, {
      name: "elasticsearch_put_index_mapping",
      label: "Update Index Mappings",
      description: "Update mappings for one or more indices.",
      parameters: Type.Object({
        index: Type.String({ description: "Comma-separated index names or patterns" }),
        mapping: Type.String({ description: "Mapping body as a JSON object string" }),
      }),
      progress: (params) => `Updating mappings for ${params.index}...`,
      run: async ({ params }) => await client.request({
        method: "PUT",
        path: `/${encodeURIComponent(params.index)}/_mapping`,
        body: jsonStringToValue(params.mapping, "mapping", { required: true, expect: "object" }),
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_refresh_indices",
      label: "Refresh Indices",
      description: "Refresh one or more indices so recent operations become visible to search.",
      parameters: Type.Object({
        index: Type.Optional(Type.String({ description: "Optional comma-separated index names or patterns" })),
      }),
      progress: (params) => `Refreshing indices${params.index ? ` ${params.index}` : ""}...`,
      run: async ({ params }) => await client.request({
        method: "POST",
        path: params.index ? `/${encodeURIComponent(params.index)}/_refresh` : "/_refresh",
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_flush_indices",
      label: "Flush Indices",
      description: "Flush one or more indices.",
      parameters: Type.Object({
        index: Type.Optional(Type.String({ description: "Optional comma-separated index names or patterns" })),
      }),
      progress: (params) => `Flushing indices${params.index ? ` ${params.index}` : ""}...`,
      run: async ({ params }) => await client.request({
        method: "POST",
        path: params.index ? `/${encodeURIComponent(params.index)}/_flush` : "/_flush",
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_get_index_stats",
      label: "Get Index Stats",
      description: "Get statistics for one or more indices.",
      parameters: Type.Object({
        index: Type.Optional(Type.String({ description: "Optional comma-separated index names or patterns" })),
      }),
      progress: (params) => `Fetching index stats${params.index ? ` for ${params.index}` : ""}...`,
      run: async ({ params }) => await client.request({
        method: "GET",
        path: params.index ? `/${encodeURIComponent(params.index)}/_stats` : "/_stats",
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_put_alias",
      label: "Create Alias",
      description: "Create or update an alias for an index.",
      parameters: Type.Object({
        index: Type.String({ description: "Target index name" }),
        alias: Type.String({ description: "Alias name" }),
        body: Type.Optional(Type.String({ description: "Optional alias body as a JSON object string" })),
      }),
      progress: (params) => `Creating alias ${params.alias} for ${params.index}...`,
      run: async ({ params }) => await client.request({
        method: "PUT",
        path: `/${encodeURIComponent(params.index)}/_alias/${encodeURIComponent(params.alias)}`,
        body: params.body ? jsonStringToValue(params.body, "body", { expect: "object" }) : undefined,
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_get_alias",
      label: "Get Alias",
      description: "Get alias definitions for one or more aliases.",
      parameters: Type.Object({
        alias: Type.String({ description: "Alias name or pattern" }),
      }),
      progress: (params) => `Fetching alias ${params.alias}...`,
      run: async ({ params }) => await client.request({ method: "GET", path: `/_alias/${encodeURIComponent(params.alias)}` }),
    }),
    buildTool(client, {
      name: "elasticsearch_delete_alias",
      label: "Delete Alias",
      description: "Delete an alias from one or more indices.",
      parameters: Type.Object({
        index: Type.String({ description: "Index name or pattern" }),
        alias: Type.String({ description: "Alias name or pattern" }),
      }),
      progress: (params) => `Deleting alias ${params.alias} from ${params.index}...`,
      run: async ({ params }) => await client.request({
        method: "DELETE",
        path: `/${encodeURIComponent(params.index)}/_alias/${encodeURIComponent(params.alias)}`,
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_put_index_template",
      label: "Put Index Template",
      description: "Create or update a composable index template.",
      parameters: Type.Object({
        name: Type.String({ description: "Template name" }),
        body: Type.String({ description: "Template body as a JSON object string" }),
      }),
      progress: (params) => `Upserting index template ${params.name}...`,
      run: async ({ params }) => await client.request({
        method: "PUT",
        path: `/_index_template/${encodeURIComponent(params.name)}`,
        body: jsonStringToValue(params.body, "body", { required: true, expect: "object" }),
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_get_index_template",
      label: "Get Index Template",
      description: "Get one or more composable index templates.",
      parameters: Type.Object({
        name: Type.Optional(Type.String({ description: "Optional template name or pattern" })),
      }),
      progress: (params) => `Fetching index template${params.name ? ` ${params.name}` : "s"}...`,
      run: async ({ params }) => await client.request({
        method: "GET",
        path: params.name ? `/_index_template/${encodeURIComponent(params.name)}` : "/_index_template",
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_delete_index_template",
      label: "Delete Index Template",
      description: "Delete a composable index template.",
      parameters: Type.Object({
        name: Type.String({ description: "Template name" }),
      }),
      progress: (params) => `Deleting index template ${params.name}...`,
      run: async ({ params }) => await client.request({ method: "DELETE", path: `/_index_template/${encodeURIComponent(params.name)}` }),
    }),
    buildTool(client, {
      name: "elasticsearch_update_aliases",
      label: "Update Aliases",
      description: "Run a batch alias update request using the official aliases request body.",
      parameters: Type.Object({
        body: Type.String({ description: "Aliases request body as a JSON object string" }),
      }),
      progress: "Updating aliases...",
      run: async ({ params }) => await client.request({
        method: "POST",
        path: "/_aliases",
        body: jsonStringToValue(params.body, "body", { required: true, expect: "object" }),
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_rollover",
      label: "Rollover Alias or Data Stream",
      description: "Rollover an alias or data stream to a new backing index.",
      parameters: Type.Object({
        alias: Type.String({ description: "Alias or data stream name" }),
        new_index: Type.Optional(Type.String({ description: "Optional new index name" })),
        body: Type.Optional(Type.String({ description: "Optional rollover body as a JSON object string" })),
      }),
      progress: (params) => `Rolling over ${params.alias}...`,
      run: async ({ params }) => await client.request({
        method: "POST",
        path: params.new_index
          ? `/${encodeURIComponent(params.alias)}/_rollover/${encodeURIComponent(params.new_index)}`
          : `/${encodeURIComponent(params.alias)}/_rollover`,
        body: params.body ? jsonStringToValue(params.body, "body", { expect: "object" }) : undefined,
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_resolve_index",
      label: "Resolve Index Names",
      description: "Resolve aliases, data streams, and concrete indices for a name or pattern.",
      parameters: Type.Object({
        name: Type.String({ description: "Name, alias, or pattern to resolve" }),
      }),
      progress: (params) => `Resolving ${params.name}...`,
      run: async ({ params }) => await client.request({ method: "GET", path: `/_resolve/index/${encodeURIComponent(params.name)}` }),
    }),
  ];
}
