import { createLiveClient, autoRun, liveTestsEnabled, loadExtension, parseToolText, randomIndex, runTool, suite } from "./helpers.mjs";

export async function run() {
  const s = suite("SQL / ESQL");
  if (!liveTestsEnabled()) {
    s.skip("live tests disabled (set ELASTICSEARCH_LIVE_TESTS=1)");
    return s.print();
  }

  const pi = await loadExtension();
  const client = createLiveClient();
  const index = randomIndex("pi-sql");

  try {
    await client.request({ method: "PUT", path: `/${encodeURIComponent(index)}` });

    await s.test("sql translate returns a query plan", async () => {
      const payload = parseToolText(await runTool(pi, "elasticsearch_sql_translate", {
        body: JSON.stringify({ query: `SELECT * FROM \"${index}\"` }),
      }));
      if (!payload?.size && !payload?.query) throw new Error("Unexpected SQL translate payload");
    });

    await s.test("esql query endpoint accepts a trivial row expression when supported", async () => {
      const payload = parseToolText(await runTool(pi, "elasticsearch_esql_query", {
        body: JSON.stringify({ query: "ROW a = 1" }),
      }));
      if (!payload || typeof payload !== "object") throw new Error("Unexpected ESQL payload");
    });
  } finally {
    try { await client.request({ method: "DELETE", path: `/${encodeURIComponent(index)}` }); } catch {}
  }

  return s.print();
}

autoRun(run, import.meta.url);
