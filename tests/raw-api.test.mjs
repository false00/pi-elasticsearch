import { createLiveClient, autoRun, liveTestsEnabled, loadExtension, parseToolText, randomIndex, runTool, suite } from "./helpers.mjs";

export async function run() {
  const s = suite("Raw API Coverage");
  if (!liveTestsEnabled()) {
    s.skip("live tests disabled (set ELASTICSEARCH_LIVE_TESTS=1)");
    return s.print();
  }

  const pi = await loadExtension();
  const client = createLiveClient();
  const index = randomIndex("pi-raw");

  try {
    await s.test("raw GET returns cluster health", async () => {
      const payload = parseToolText(await runTool(pi, "elasticsearch_api_call", {
        method: "GET",
        path: "/_cluster/health",
      }));
      if (!payload?.status) throw new Error("Missing cluster health status");
    });

    await s.test("raw PUT and HEAD work for index lifecycle", async () => {
      await runTool(pi, "elasticsearch_api_call", {
        method: "PUT",
        path: `/${index}`,
      });
      const head = parseToolText(await runTool(pi, "elasticsearch_api_call", {
        method: "HEAD",
        path: `/${index}`,
      }));
      if (head !== true && head?.body !== true && head?.statusCode !== 200) {
        throw new Error(`Unexpected HEAD payload: ${JSON.stringify(head)}`);
      }
    });
  } finally {
    try { await client.request({ method: "DELETE", path: `/${encodeURIComponent(index)}` }); } catch {}
  }

  return s.print();
}

autoRun(run, import.meta.url);
