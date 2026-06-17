import { Type } from "typebox";
import { buildTool, cleanUndefined, jsonStringToValue } from "./shared.js";

function buildStructuredLogQuery(params) {
  const filters = [];
  const must = [];

  const timeField = params.time_field || "@timestamp";
  if (params.start_time || params.end_time) {
    filters.push({
      range: {
        [timeField]: cleanUndefined({
          gte: params.start_time,
          lte: params.end_time,
        }),
      },
    });
  }

  const exactFilters = [
    [params.service_field || "service.name", params.service],
    [params.level_field || "log.level", params.level],
    [params.host_field || "host.name", params.host],
  ];

  for (const [field, value] of exactFilters) {
    if (value !== undefined && value !== null && value !== "") {
      filters.push({ term: { [field]: value } });
    }
  }

  if (params.query) {
    must.push({
      simple_query_string: {
        query: params.query,
        default_operator: "and",
      },
    });
  }

  if (params.filters) {
    const additional = jsonStringToValue(params.filters, "filters", { expect: "array", required: true });
    filters.push(...additional);
  }

  return {
    bool: cleanUndefined({
      must: must.length > 0 ? must : undefined,
      filter: filters.length > 0 ? filters : undefined,
    }),
  };
}

function buildSourceFilter(params) {
  const includes = params.include_fields
    ? jsonStringToValue(params.include_fields, "include_fields", { expect: "array", required: true })
    : undefined;
  const excludes = params.exclude_fields
    ? jsonStringToValue(params.exclude_fields, "exclude_fields", { expect: "array", required: true })
    : undefined;

  if (!includes && !excludes) return true;
  return cleanUndefined({ includes, excludes });
}

function summarizeHits(response, query) {
  const hits = response?.hits?.hits || [];
  return {
    query,
    took: response?.took,
    timed_out: response?.timed_out,
    hits_total: response?.hits?.total?.value ?? hits.length,
    returned_hits: hits.length,
    hits: hits.map((hit) => ({
      _index: hit._index,
      _id: hit._id,
      _score: hit._score,
      sort: hit.sort,
      _source: hit._source,
      fields: hit.fields,
    })),
  };
}

export function logTools(client) {
  return [
    buildTool(client, {
      name: "elasticsearch_search_logs",
      label: "Search Logs",
      description: "Search log data with time bounds, common service/level/host filters, and recent-first sorting. Good for interactive investigations.",
      promptSnippet: "Investigate logs with a time-bounded search over log indices, filtering by service, level, host, and free-text query.",
      promptGuidelines: [
        "Use elasticsearch_search_logs first for log investigations. Prefer a bounded time range and a small result size before broadening the search.",
        "If the user asks about errors, incidents, spikes, or suspicious events in logs, start with elasticsearch_search_logs sorted by newest events.",
      ],
      parameters: Type.Object({
        index: Type.String({ description: "Comma-separated log index names or patterns, such as 'logs-*' or 'filebeat-*'" }),
        query: Type.Optional(Type.String({ description: "Optional free-text or Lucene-style query string" })),
        start_time: Type.Optional(Type.String({ description: "Optional start time, such as an ISO timestamp or date math like 'now-1h'" })),
        end_time: Type.Optional(Type.String({ description: "Optional end time, such as an ISO timestamp or date math like 'now'" })),
        time_field: Type.Optional(Type.String({ description: "Time field to bound and sort on, default '@timestamp'" })),
        service: Type.Optional(Type.String({ description: "Optional exact service filter" })),
        service_field: Type.Optional(Type.String({ description: "Service field name, default 'service.name'" })),
        level: Type.Optional(Type.String({ description: "Optional exact log level filter" })),
        level_field: Type.Optional(Type.String({ description: "Level field name, default 'log.level'" })),
        host: Type.Optional(Type.String({ description: "Optional exact host filter" })),
        host_field: Type.Optional(Type.String({ description: "Host field name, default 'host.name'" })),
        filters: Type.Optional(Type.String({ description: "Optional JSON array of additional Elasticsearch filter clauses" })),
        include_fields: Type.Optional(Type.String({ description: "Optional JSON array of _source fields to include" })),
        exclude_fields: Type.Optional(Type.String({ description: "Optional JSON array of _source fields to exclude" })),
        size: Type.Optional(Type.Integer({ description: "Number of log events to return, default 50" })),
        sort_order: Type.Optional(Type.String({ description: "Sort order for time_field: desc or asc. Default desc" })),
      }),
      progress: (params) => `Searching logs in ${params.index}...`,
      run: async ({ params }) => {
        const timeField = params.time_field || "@timestamp";
        const query = buildStructuredLogQuery(params);
        const requestBody = {
          size: params.size ?? 50,
          sort: [{ [timeField]: { order: params.sort_order || "desc", unmapped_type: "date" } }],
          query,
          _source: buildSourceFilter(params),
        };
        const response = await client.request({
          method: "POST",
          path: `/${encodeURIComponent(params.index)}/_search`,
          body: requestBody,
        });
        return summarizeHits(response, requestBody.query);
      },
    }),
    buildTool(client, {
      name: "elasticsearch_logs_top_values",
      label: "Top Log Field Values",
      description: "Aggregate the most common values of a log field within a time range and optional investigation filters.",
      promptSnippet: "Summarize logs by the most common values of a field like service.name, host.name, log.level, event.dataset, or error.type.",
      promptGuidelines: [
        "Use elasticsearch_logs_top_values to answer questions like 'which services are noisy?', 'which hosts have the most errors?', or 'what levels appear most often?'.",
      ],
      parameters: Type.Object({
        index: Type.String({ description: "Comma-separated log index names or patterns" }),
        field: Type.String({ description: "Field to aggregate, such as 'service.name', 'host.name', or 'log.level'" }),
        query: Type.Optional(Type.String({ description: "Optional free-text or Lucene-style query string" })),
        start_time: Type.Optional(Type.String({ description: "Optional start time" })),
        end_time: Type.Optional(Type.String({ description: "Optional end time" })),
        time_field: Type.Optional(Type.String({ description: "Time field, default '@timestamp'" })),
        service: Type.Optional(Type.String({ description: "Optional exact service filter" })),
        level: Type.Optional(Type.String({ description: "Optional exact log level filter" })),
        host: Type.Optional(Type.String({ description: "Optional exact host filter" })),
        filters: Type.Optional(Type.String({ description: "Optional JSON array of additional Elasticsearch filter clauses" })),
        size: Type.Optional(Type.Integer({ description: "Number of buckets to return, default 10" })),
      }),
      progress: (params) => `Aggregating top values for ${params.field} in ${params.index}...`,
      run: async ({ params }) => {
        const makeBody = (field) => ({
          size: 0,
          query: buildStructuredLogQuery(params),
          aggs: {
            top_values: {
              terms: {
                field,
                size: params.size ?? 10,
              },
            },
          },
        });

        let fieldUsed = params.field;
        let requestBody = makeBody(fieldUsed);
        let response;

        try {
          response = await client.request({
            method: "POST",
            path: `/${encodeURIComponent(params.index)}/_search`,
            body: requestBody,
          });
        } catch (error) {
          if (!String(params.field).endsWith(".keyword")) {
            fieldUsed = `${params.field}.keyword`;
            requestBody = makeBody(fieldUsed);
            response = await client.request({
              method: "POST",
              path: `/${encodeURIComponent(params.index)}/_search`,
              body: requestBody,
            });
          } else {
            throw error;
          }
        }

        return {
          query: requestBody.query,
          field: params.field,
          field_used: fieldUsed,
          took: response?.took,
          buckets: response?.aggregations?.top_values?.buckets || [],
        };
      },
    }),
    buildTool(client, {
      name: "elasticsearch_logs_timeline",
      label: "Log Timeline",
      description: "Build a date-histogram timeline of log volume for an investigation window and filters.",
      promptSnippet: "Build a log volume timeline to answer questions about spikes, bursts, or changes over time.",
      promptGuidelines: [
        "Use elasticsearch_logs_timeline when the user asks when an incident started, whether errors spiked, or how activity changed over time.",
      ],
      parameters: Type.Object({
        index: Type.String({ description: "Comma-separated log index names or patterns" }),
        interval: Type.String({ description: "Histogram interval, such as '1m', '5m', '1h', or '1d'" }),
        query: Type.Optional(Type.String({ description: "Optional free-text or Lucene-style query string" })),
        start_time: Type.Optional(Type.String({ description: "Optional start time" })),
        end_time: Type.Optional(Type.String({ description: "Optional end time" })),
        time_field: Type.Optional(Type.String({ description: "Time field, default '@timestamp'" })),
        service: Type.Optional(Type.String({ description: "Optional exact service filter" })),
        level: Type.Optional(Type.String({ description: "Optional exact log level filter" })),
        host: Type.Optional(Type.String({ description: "Optional exact host filter" })),
        filters: Type.Optional(Type.String({ description: "Optional JSON array of additional Elasticsearch filter clauses" })),
        min_doc_count: Type.Optional(Type.Integer({ description: "Minimum document count per bucket, default 0" })),
      }),
      progress: (params) => `Building log timeline for ${params.index}...`,
      run: async ({ params }) => {
        const timeField = params.time_field || "@timestamp";
        const requestBody = {
          size: 0,
          query: buildStructuredLogQuery(params),
          aggs: {
            timeline: {
              date_histogram: {
                field: timeField,
                fixed_interval: params.interval,
                min_doc_count: params.min_doc_count ?? 0,
              },
            },
          },
        };
        const response = await client.request({
          method: "POST",
          path: `/${encodeURIComponent(params.index)}/_search`,
          body: requestBody,
        });
        return {
          query: requestBody.query,
          interval: params.interval,
          time_field: timeField,
          took: response?.took,
          buckets: response?.aggregations?.timeline?.buckets || [],
        };
      },
    }),
  ];
}
