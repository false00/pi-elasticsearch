import { liveTestsEnabled } from "./helpers.mjs";
import { run as smoke } from "./smoke.test.mjs";
import { run as runtime } from "./runtime.test.mjs";
import { run as pkg } from "./package.test.mjs";
import { run as auth } from "./auth.test.mjs";
import { run as core } from "./core.test.mjs";
import { run as documents } from "./documents.test.mjs";
import { run as search } from "./search.test.mjs";
import { run as logs } from "./logs.test.mjs";
import { run as indices } from "./indices.test.mjs";
import { run as cluster } from "./cluster.test.mjs";
import { run as nodes } from "./nodes.test.mjs";
import { run as ingest } from "./ingest.test.mjs";
import { run as security } from "./security.test.mjs";
import { run as snapshot } from "./snapshot.test.mjs";
import { run as tasks } from "./tasks.test.mjs";
import { run as sqlEsql } from "./sql-esql.test.mjs";
import { run as transforms } from "./transforms.test.mjs";
import { run as rawApi } from "./raw-api.test.mjs";
import { run as clientCall } from "./client-call.test.mjs";

const suites = [smoke, runtime, pkg];
if (liveTestsEnabled()) {
  suites.push(auth, core, documents, search, logs, indices, cluster, nodes, ingest, security, snapshot, tasks, sqlEsql, transforms, rawApi, clientCall);
}

let failed = 0;
for (const run of suites) {
  failed += await run();
}

if (failed > 0) process.exit(1);
