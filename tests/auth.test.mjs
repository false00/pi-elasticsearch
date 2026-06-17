import { autoRun, liveTestsEnabled, loadExtension, parseToolText, runTool, suite } from "./helpers.mjs";

export async function run() {
  const s = suite("Auth & Connection");
  if (!liveTestsEnabled()) {
    s.skip("live tests disabled (set ELASTICSEARCH_LIVE_TESTS=1)");
    return s.print();
  }

  await s.test("cluster info can be fetched through the tool surface", async () => {
    const pi = await loadExtension();
    const payload = parseToolText(await runTool(pi, "elasticsearch_info"));
    if (!payload?.version?.number) throw new Error("Missing version.number");
  });

  await s.test("cluster health can be fetched through the tool surface", async () => {
    const pi = await loadExtension();
    const payload = parseToolText(await runTool(pi, "elasticsearch_health"));
    if (!payload?.status) throw new Error("Missing health status");
  });

  return s.print();
}

autoRun(run, import.meta.url);
