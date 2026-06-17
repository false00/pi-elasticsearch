import { autoRun, liveTestsEnabled, loadExtension, parseToolText, runTool, suite } from "./helpers.mjs";

export async function run() {
  const s = suite("Core Tools");
  if (!liveTestsEnabled()) {
    s.skip("live tests disabled (set ELASTICSEARCH_LIVE_TESTS=1)");
    return s.print();
  }

  const pi = await loadExtension();

  await s.test("ping returns a truthy result", async () => {
    const payload = parseToolText(await runTool(pi, "elasticsearch_ping"));
    if (payload !== true && payload?.body !== true) {
      throw new Error(`Unexpected ping payload: ${JSON.stringify(payload)}`);
    }
  });

  await s.test("info returns cluster name and version", async () => {
    const payload = parseToolText(await runTool(pi, "elasticsearch_info"));
    if (!payload?.cluster_name) throw new Error("Missing cluster_name");
    if (!payload?.version?.number) throw new Error("Missing version.number");
  });

  return s.print();
}

autoRun(run, import.meta.url);
