import { autoRun, liveTestsEnabled, loadExtension, parseToolText, runTool, suite } from "./helpers.mjs";

export async function run() {
  const s = suite("Security");
  if (!liveTestsEnabled()) {
    s.skip("live tests disabled (set ELASTICSEARCH_LIVE_TESTS=1)");
    return s.print();
  }

  const pi = await loadExtension();

  await s.test("authenticate current user", async () => {
    const payload = parseToolText(await runTool(pi, "elasticsearch_security_authenticate"));
    if (!payload?.username) throw new Error("Missing authenticated username");
  });

  return s.print();
}

autoRun(run, import.meta.url);
