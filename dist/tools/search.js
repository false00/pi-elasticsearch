import { Type } from "typebox";
import { buildTool, jsonStringToValue, cleanUndefined } from "./shared.js";

export function searchTools(client) {
  return [
    buildTool(client, {
      name: "elasticsearch_search",
      label: "Search Documents",
      description: "Run an Elasticsearch search request, optionally scoped to one or more indices.",
      parameters: Type.Object({
        index: Type.Optional(Type.String({ description: "Optional comma-separated index names or patterns" })),
        body: Type.Optional(Type.String({ description: "Optional search body as a JSON object string" })),
        q: Type.Optional(Type.String({ description: "Optional Lucene query string shortcut" })),
        from: Type.Optional(Type.Integer({ description: "Optional result offset" })),
        size: Type.Optional(Type.Integer({ description: "Optional page size" })),
        track_total_hits: Type.Optional(Type.Boolean({ description: "Whether to compute the full total hit count" })),
      }),
      progress: (params) => `Searching${params.index ? ` ${params.index}` : ""}...`,
      run: async ({ params }) => await client.request({
        method: "POST",
        path: params.index ? `/${encodeURIComponent(params.index)}/_search` : "/_search",
        query: cleanUndefined({
          q: params.q,
          from: params.from,
          size: params.size,
          track_total_hits: params.track_total_hits,
        }),
        body: params.body ? jsonStringToValue(params.body, "body", { expect: "object" }) : undefined,
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_msearch",
      label: "Multi Search",
      description: "Run multiple searches in one call using the official client search array format.",
      parameters: Type.Object({
        index: Type.Optional(Type.String({ description: "Optional default index name or pattern" })),
        searches: Type.String({ description: "JSON array in official msearch 'searches' format" }),
      }),
      progress: "Running multi-search...",
      run: async ({ params }) => await client.clientCall("msearch", cleanUndefined({
        index: params.index,
        searches: jsonStringToValue(params.searches, "searches", { required: true, expect: "array" }),
      })),
    }),
    buildTool(client, {
      name: "elasticsearch_count",
      label: "Count Documents",
      description: "Count documents that match a query.",
      parameters: Type.Object({
        index: Type.Optional(Type.String({ description: "Optional comma-separated index names or patterns" })),
        body: Type.Optional(Type.String({ description: "Optional count request body as a JSON object string" })),
        q: Type.Optional(Type.String({ description: "Optional Lucene query string shortcut" })),
      }),
      progress: (params) => `Counting documents${params.index ? ` in ${params.index}` : ""}...`,
      run: async ({ params }) => await client.request({
        method: "POST",
        path: params.index ? `/${encodeURIComponent(params.index)}/_count` : "/_count",
        query: cleanUndefined({ q: params.q }),
        body: params.body ? jsonStringToValue(params.body, "body", { expect: "object" }) : undefined,
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_explain",
      label: "Explain Match",
      description: "Explain why a specific document matches or does not match a query.",
      parameters: Type.Object({
        index: Type.String({ description: "Index name" }),
        id: Type.String({ description: "Document ID" }),
        body: Type.String({ description: "Explain request body as a JSON object string" }),
      }),
      progress: (params) => `Explaining match for document ${params.id} in ${params.index}...`,
      run: async ({ params }) => await client.request({
        method: "POST",
        path: `/${encodeURIComponent(params.index)}/_explain/${encodeURIComponent(params.id)}`,
        body: jsonStringToValue(params.body, "body", { required: true, expect: "object" }),
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_field_caps",
      label: "Field Capabilities",
      description: "Return field capability information across one or more indices.",
      parameters: Type.Object({
        index: Type.Optional(Type.String({ description: "Optional comma-separated index names or patterns" })),
        body: Type.String({ description: "Field caps request body as a JSON object string" }),
      }),
      progress: "Fetching field capabilities...",
      run: async ({ params }) => await client.request({
        method: "POST",
        path: params.index ? `/${encodeURIComponent(params.index)}/_field_caps` : "/_field_caps",
        body: jsonStringToValue(params.body, "body", { required: true, expect: "object" }),
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_terms_enum",
      label: "Terms Enum",
      description: "Enumerate terms from a field prefix using the terms enum API.",
      parameters: Type.Object({
        index: Type.Optional(Type.String({ description: "Optional index name or pattern" })),
        body: Type.String({ description: "Terms enum request body as a JSON object string" }),
      }),
      progress: "Enumerating field terms...",
      run: async ({ params }) => await client.request({
        method: "POST",
        path: params.index ? `/${encodeURIComponent(params.index)}/_terms_enum` : "/_terms_enum",
        body: jsonStringToValue(params.body, "body", { required: true, expect: "object" }),
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_open_point_in_time",
      label: "Open Point In Time",
      description: "Open a point-in-time reader for one or more indices.",
      parameters: Type.Object({
        index: Type.String({ description: "Comma-separated index names or patterns" }),
        keep_alive: Type.String({ description: "Keep-alive value such as '1m' or '5m'" }),
      }),
      progress: (params) => `Opening point in time for ${params.index}...`,
      run: async ({ params }) => await client.request({
        method: "POST",
        path: `/${encodeURIComponent(params.index)}/_pit`,
        query: { keep_alive: params.keep_alive },
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_close_point_in_time",
      label: "Close Point In Time",
      description: "Close a point-in-time reader by PIT id.",
      parameters: Type.Object({
        id: Type.String({ description: "Point-in-time id" }),
      }),
      progress: "Closing point in time...",
      run: async ({ params }) => await client.request({
        method: "DELETE",
        path: "/_pit",
        body: { id: params.id },
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_scroll",
      label: "Scroll Search Results",
      description: "Continue retrieving results from a previous scroll search.",
      parameters: Type.Object({
        scroll_id: Type.String({ description: "Scroll ID" }),
        scroll: Type.Optional(Type.String({ description: "Optional scroll keep-alive such as '1m'" })),
      }),
      progress: "Fetching next scroll page...",
      run: async ({ params }) => await client.request({
        method: "POST",
        path: "/_search/scroll",
        body: cleanUndefined({
          scroll_id: params.scroll_id,
          scroll: params.scroll,
        }),
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_clear_scroll",
      label: "Clear Scroll",
      description: "Clear one or more scroll IDs and release associated search context.",
      parameters: Type.Object({
        scroll_id: Type.String({ description: "Single scroll id or JSON array string if body mode is preferred via raw API" }),
      }),
      progress: "Clearing scroll context...",
      run: async ({ params }) => await client.request({
        method: "DELETE",
        path: "/_search/scroll",
        body: { scroll_id: [params.scroll_id] },
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_bulk",
      label: "Bulk Indexing",
      description: "Run bulk indexing, update, create, or delete operations using the official client operations array format.",
      parameters: Type.Object({
        operations: Type.String({ description: "JSON array in official bulk 'operations' format" }),
        index: Type.Optional(Type.String({ description: "Optional default index" })),
        refresh: Type.Optional(Type.String({ description: "Optional refresh policy: true, false, or wait_for" })),
        pipeline: Type.Optional(Type.String({ description: "Optional ingest pipeline name" })),
      }),
      progress: "Running bulk request...",
      run: async ({ params }) => await client.clientCall("bulk", cleanUndefined({
        index: params.index,
        refresh: params.refresh,
        pipeline: params.pipeline,
        operations: jsonStringToValue(params.operations, "operations", { required: true, expect: "array" }),
      })),
    }),
    buildTool(client, {
      name: "elasticsearch_reindex",
      label: "Reindex Documents",
      description: "Copy documents from a source index, alias, or data stream into a destination.",
      parameters: Type.Object({
        body: Type.String({ description: "Reindex request body as a JSON object string" }),
        wait_for_completion: Type.Optional(Type.Boolean({ description: "Whether to wait for completion" })),
        refresh: Type.Optional(Type.Boolean({ description: "Whether to refresh destination shards on completion" })),
      }),
      progress: "Running reindex operation...",
      run: async ({ params }) => await client.request({
        method: "POST",
        path: "/_reindex",
        query: cleanUndefined({
          wait_for_completion: params.wait_for_completion,
          refresh: params.refresh,
        }),
        body: jsonStringToValue(params.body, "body", { required: true, expect: "object" }),
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_update_by_query",
      label: "Update By Query",
      description: "Update documents that match a query in one or more indices.",
      parameters: Type.Object({
        index: Type.String({ description: "Index name or pattern" }),
        body: Type.String({ description: "Update-by-query body as a JSON object string" }),
        wait_for_completion: Type.Optional(Type.Boolean({ description: "Whether to wait for completion" })),
        conflicts: Type.Optional(Type.String({ description: "Conflict strategy such as 'abort' or 'proceed'" })),
      }),
      progress: (params) => `Running update_by_query on ${params.index}...`,
      run: async ({ params }) => await client.request({
        method: "POST",
        path: `/${encodeURIComponent(params.index)}/_update_by_query`,
        query: cleanUndefined({
          wait_for_completion: params.wait_for_completion,
          conflicts: params.conflicts,
        }),
        body: jsonStringToValue(params.body, "body", { required: true, expect: "object" }),
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_delete_by_query",
      label: "Delete By Query",
      description: "Delete documents that match a query in one or more indices.",
      parameters: Type.Object({
        index: Type.String({ description: "Index name or pattern" }),
        body: Type.String({ description: "Delete-by-query body as a JSON object string" }),
        wait_for_completion: Type.Optional(Type.Boolean({ description: "Whether to wait for completion" })),
        conflicts: Type.Optional(Type.String({ description: "Conflict strategy such as 'abort' or 'proceed'" })),
      }),
      progress: (params) => `Running delete_by_query on ${params.index}...`,
      run: async ({ params }) => await client.request({
        method: "POST",
        path: `/${encodeURIComponent(params.index)}/_delete_by_query`,
        query: cleanUndefined({
          wait_for_completion: params.wait_for_completion,
          conflicts: params.conflicts,
        }),
        body: jsonStringToValue(params.body, "body", { required: true, expect: "object" }),
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_reindex_rethrottle",
      label: "Rethrottle Reindex",
      description: "Change the throttling of a running reindex task.",
      parameters: Type.Object({
        task_id: Type.String({ description: "Task ID returned by a running reindex" }),
        requests_per_second: Type.Number({ description: "New throttle rate, or -1 to disable throttling" }),
      }),
      progress: "Rethrottling reindex task...",
      run: async ({ params }) => await client.request({
        method: "POST",
        path: `/_reindex/${encodeURIComponent(params.task_id)}/_rethrottle`,
        query: { requests_per_second: params.requests_per_second },
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_update_by_query_rethrottle",
      label: "Rethrottle Update By Query",
      description: "Change the throttling of a running update_by_query task.",
      parameters: Type.Object({
        task_id: Type.String({ description: "Task ID returned by a running update_by_query" }),
        requests_per_second: Type.Number({ description: "New throttle rate, or -1 to disable throttling" }),
      }),
      progress: "Rethrottling update_by_query task...",
      run: async ({ params }) => await client.request({
        method: "POST",
        path: `/_update_by_query/${encodeURIComponent(params.task_id)}/_rethrottle`,
        query: { requests_per_second: params.requests_per_second },
      }),
    }),
    buildTool(client, {
      name: "elasticsearch_delete_by_query_rethrottle",
      label: "Rethrottle Delete By Query",
      description: "Change the throttling of a running delete_by_query task.",
      parameters: Type.Object({
        task_id: Type.String({ description: "Task ID returned by a running delete_by_query" }),
        requests_per_second: Type.Number({ description: "New throttle rate, or -1 to disable throttling" }),
      }),
      progress: "Rethrottling delete_by_query task...",
      run: async ({ params }) => await client.request({
        method: "POST",
        path: `/_delete_by_query/${encodeURIComponent(params.task_id)}/_rethrottle`,
        query: { requests_per_second: params.requests_per_second },
      }),
    }),
  ];
}
