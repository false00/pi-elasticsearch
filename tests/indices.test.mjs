import { createLiveClient, autoRun, liveTestsEnabled, loadExtension, parseToolText, randomIndex, runTool, suite } from "./helpers.mjs";

export async function run() {
  const s = suite("Indices");
  if (!liveTestsEnabled()) {
    s.skip("live tests disabled (set ELASTICSEARCH_LIVE_TESTS=1)");
    return s.print();
  }

  const pi = await loadExtension();
  const client = createLiveClient();
  const index = randomIndex("pi-indices");

  try {
    await s.test("create index and inspect settings/mappings", async () => {
      await runTool(pi, "elasticsearch_create_index", {
        index,
        body: JSON.stringify({ settings: { number_of_shards: 1, number_of_replicas: 0 } }),
      });

      const settings = parseToolText(await runTool(pi, "elasticsearch_get_index_settings", { index }));
      if (!settings[index]) throw new Error("Missing index settings response");

      await runTool(pi, "elasticsearch_put_index_mapping", {
        index,
        mapping: JSON.stringify({ properties: { message: { type: "text" } } }),
      });

      const mapping = parseToolText(await runTool(pi, "elasticsearch_get_index_mapping", { index }));
      if (!mapping[index]?.mappings?.properties?.message) throw new Error("Missing message mapping");
    });

    await s.test("update settings and fetch stats", async () => {
      await runTool(pi, "elasticsearch_put_index_settings", {
        index,
        settings: JSON.stringify({ index: { refresh_interval: "30s" } }),
      });
      const stats = parseToolText(await runTool(pi, "elasticsearch_get_index_stats", { index }));
      if (!stats?._all && !stats?.indices?.[index]) throw new Error("Unexpected stats payload");
    });
  } finally {
    try { await client.request({ method: "DELETE", path: `/${encodeURIComponent(index)}` }); } catch {}
  }

  return s.print();
}

autoRun(run, import.meta.url);
