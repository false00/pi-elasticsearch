import { autoRun, liveTestsEnabled, loadExtension, parseToolText, runTool, suite } from "./helpers.mjs";

export async function run() {
  const s = suite("Nodes");
  if (!liveTestsEnabled()) {
    s.skip("live tests disabled (set ELASTICSEARCH_LIVE_TESTS=1)");
    return s.print();
  }

  const pi = await loadExtension();

  await s.test("nodes info returns a nodes object", async () => {
    const payload = parseToolText(await runTool(pi, "elasticsearch_nodes_info"));
    if (!payload?.nodes || typeof payload.nodes !== "object") throw new Error("Missing nodes object");
  });

  await s.test("nodes stats returns a nodes object", async () => {
    const payload = parseToolText(await runTool(pi, "elasticsearch_nodes_stats"));
    if (!payload?.nodes || typeof payload.nodes !== "object") throw new Error("Missing nodes object");
  });

  return s.print();
}

autoRun(run, import.meta.url);
