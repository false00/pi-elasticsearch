import { createLiveClient, autoRun, liveTestsEnabled, loadExtension, parseToolText, randomIndex, runTool, suite } from "./helpers.mjs";

export async function run() {
  const s = suite("Search");
  if (!liveTestsEnabled()) {
    s.skip("live tests disabled (set ELASTICSEARCH_LIVE_TESTS=1)");
    return s.print();
  }

  const pi = await loadExtension();
  const client = createLiveClient();
  const index = randomIndex("pi-search");

  try {
    await runTool(pi, "elasticsearch_create_index", { index });
    await runTool(pi, "elasticsearch_bulk", {
      operations: JSON.stringify([
        { index: { _index: index, _id: "1" } },
        { title: "laptop", kind: "device" },
        { index: { _index: index, _id: "2" } },
        { title: "chair", kind: "furniture" },
        { index: { _index: index, _id: "3" } },
        { title: "gaming laptop", kind: "device" }
      ]),
      refresh: "wait_for",
    });

    await s.test("search returns matching documents", async () => {
      const payload = parseToolText(await runTool(pi, "elasticsearch_search", {
        index,
        body: JSON.stringify({ query: { match: { title: "laptop" } } }),
      }));
      const total = payload?.hits?.total?.value ?? payload?.hits?.hits?.length;
      if (!total || total < 2) throw new Error(`Expected at least 2 hits, got ${JSON.stringify(payload?.hits?.total)}`);
    });

    await s.test("count returns correct document count", async () => {
      const payload = parseToolText(await runTool(pi, "elasticsearch_count", {
        index,
        body: JSON.stringify({ query: { term: { kind: "device" } } }),
      }));
      if (payload?.count !== 2) throw new Error(`Expected count 2, got ${payload?.count}`);
    });
  } finally {
    try { await client.request({ method: "DELETE", path: `/${encodeURIComponent(index)}` }); } catch {}
  }

  return s.print();
}

autoRun(run, import.meta.url);
