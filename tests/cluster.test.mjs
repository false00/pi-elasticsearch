import { autoRun, liveTestsEnabled, loadExtension, parseToolText, runTool, suite } from "./helpers.mjs";

export async function run() {
  const s = suite("Cluster");
  if (!liveTestsEnabled()) {
    s.skip("live tests disabled (set ELASTICSEARCH_LIVE_TESTS=1)");
    return s.print();
  }

  const pi = await loadExtension();

  await s.test("cluster stats returns cluster name", async () => {
    const payload = parseToolText(await runTool(pi, "elasticsearch_cluster_stats"));
    if (!payload?.cluster_name) throw new Error("Missing cluster_name");
  });

  await s.test("cluster settings returns persistent/transient objects", async () => {
    const payload = parseToolText(await runTool(pi, "elasticsearch_cluster_get_settings"));
    if (!payload || typeof payload !== "object") throw new Error("Expected object payload");
    if (!("persistent" in payload) || !("transient" in payload)) throw new Error("Missing persistent/transient settings keys");
  });

  return s.print();
}

autoRun(run, import.meta.url);
