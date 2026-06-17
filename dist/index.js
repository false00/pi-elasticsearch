import { ElasticsearchClient } from "./elasticsearch-client.js";
import { coreTools } from "./tools/core.js";
import { documentTools } from "./tools/documents.js";
import { searchTools } from "./tools/search.js";
import { logTools } from "./tools/logs.js";
import { indexTools } from "./tools/indices.js";
import { dataStreamTools } from "./tools/data-streams.js";
import { catTools } from "./tools/cat.js";
import { clusterTools } from "./tools/cluster.js";
import { nodeTools } from "./tools/nodes.js";
import { ingestTools } from "./tools/ingest.js";
import { securityTools } from "./tools/security.js";
import { snapshotTools } from "./tools/snapshot.js";
import { lifecycleTools } from "./tools/lifecycle.js";
import { taskTools } from "./tools/tasks.js";
import { asyncSearchTools } from "./tools/async-search.js";
import { sqlTools } from "./tools/sql.js";
import { transformTools } from "./tools/transforms.js";
import { inferenceTools } from "./tools/inference.js";
import { connectorTools } from "./tools/connectors.js";
import { mlTools } from "./tools/ml.js";
import { watcherTools } from "./tools/watcher.js";
import { rawApiTools } from "./tools/raw.js";
import { clientCallTools } from "./tools/client-call.js";

export default function elasticsearchExtension(pi) {
  const client = new ElasticsearchClient();
  const groups = [
    coreTools(client),
    documentTools(client),
    searchTools(client),
    logTools(client),
    indexTools(client),
    dataStreamTools(client),
    catTools(client),
    clusterTools(client),
    nodeTools(client),
    ingestTools(client),
    securityTools(client),
    snapshotTools(client),
    lifecycleTools(client),
    taskTools(client),
    asyncSearchTools(client),
    sqlTools(client),
    transformTools(client),
    inferenceTools(client),
    connectorTools(client),
    mlTools(client),
    watcherTools(client),
    rawApiTools(client),
    clientCallTools(client),
  ];

  for (const tools of groups) {
    for (const tool of tools) {
      pi.registerTool(tool);
    }
  }
}
