import { autoRun, liveTestsEnabled, loadExtension, parseToolText, runTool, suite } from "./helpers.mjs";

export async function run() {
  const s = suite("Transforms");
  if (!liveTestsEnabled()) {
    s.skip("live tests disabled (set ELASTICSEARCH_LIVE_TESTS=1)");
    return s.print();
  }

  const pi = await loadExtension();

  await s.test("get transforms returns a payload", async () => {
    const payload = parseToolText(await runTool(pi, "elasticsearch_transform_get"));
    if (!payload || typeof payload !== "object") throw new Error("Expected object payload");
  });

  return s.print();
}

autoRun(run, import.meta.url);
