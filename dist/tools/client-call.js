import { Type } from "typebox";
import { buildTool, jsonStringToValue } from "./shared.js";

const COMMON_TARGETS = {
  root: [
    "ping",
    "info",
    "search",
    "count",
    "get",
    "exists",
    "index",
    "create",
    "update",
    "delete",
    "mget",
    "msearch",
    "bulk",
    "scroll",
    "clearScroll",
    "openPointInTime",
    "closePointInTime",
    "reindex",
    "updateByQuery",
    "deleteByQuery",
    "fieldCaps",
    "termsEnum"
  ],
  namespaces: {
    indices: ["create", "delete", "exists", "get", "getSettings", "putSettings", "getMapping", "putMapping", "refresh", "flush", "stats", "putIndexTemplate", "getIndexTemplate", "deleteIndexTemplate", "rollover", "updateAliases"],
    cluster: ["health", "stats", "state", "pendingTasks", "getSettings", "putSettings", "allocationExplain", "reroute"],
    nodes: ["info", "stats", "hotThreads", "usage"],
    ingest: ["putPipeline", "getPipeline", "deletePipeline", "simulate"],
    security: ["authenticate", "getUser", "putUser", "deleteUser", "getRole", "putRole", "deleteRole", "createApiKey", "getApiKey", "invalidateApiKey"],
    snapshot: ["createRepository", "getRepository", "deleteRepository", "create", "get", "status", "restore", "delete"],
    ilm: ["getStatus", "putLifecycle", "getLifecycle", "deleteLifecycle"],
    slm: ["getStatus", "putLifecycle", "getLifecycle", "deleteLifecycle"],
    cat: ["indices", "shards", "nodes", "health", "aliases", "templates"],
    transform: ["putTransform", "getTransform", "startTransform", "stopTransform", "deleteTransform"],
    inference: ["put", "get", "delete", "completion", "textEmbedding", "rerank"],
    connector: ["put", "get", "delete", "list", "syncJobList"],
    ml: ["putJob", "getJobs", "deleteJob", "openJob", "closeJob", "getTrainedModels"],
    watcher: ["putWatch", "getWatch", "deleteWatch", "executeWatch"],
    asyncSearch: ["submit", "get", "status", "delete"],
    sql: ["query", "translate", "clearCursor"],
    esql: ["query"]
  }
};

export function clientCallTools(client) {
  return [
    buildTool(client, {
      name: "elasticsearch_client_call",
      label: "Call Official Elasticsearch JS Client Method",
      description: "Universal official-client escape hatch. Call any available @elastic/elasticsearch method by dot-delimited target such as 'search', 'indices.create', or 'security.getUser'.",
      parameters: Type.Object({
        target: Type.String({ description: "Dot-delimited official client target, for example 'search', 'indices.create', or 'security.getUser'" }),
        params: Type.Optional(Type.String({ description: "Optional client params as a JSON object string" })),
      }),
      progress: (params) => `Calling official client target ${params.target}...`,
      run: async ({ params }) => await client.clientCall(
        params.target,
        jsonStringToValue(params.params, "params", { defaultValue: {}, expect: "object" }),
      ),
    }),
    buildTool(client, {
      name: "elasticsearch_client_targets",
      label: "List Common Client Targets",
      description: "Return a curated map of common official client targets and namespaces to help with elasticsearch_client_call usage.",
      parameters: Type.Object({}),
      progress: "Listing common official client targets...",
      run: async () => COMMON_TARGETS,
    }),
  ];
}
