import { createLiveClient, autoRun, liveTestsEnabled, loadExtension, parseToolText, randomIndex, runTool, suite } from "./helpers.mjs";

export async function run() {
  const s = suite("Log Investigations");
  if (!liveTestsEnabled()) {
    s.skip("live tests disabled (set ELASTICSEARCH_LIVE_TESTS=1)");
    return s.print();
  }

  const pi = await loadExtension();
  const client = createLiveClient();
  const index = randomIndex("pi-logs");

  try {
    await client.request({ method: "PUT", path: `/${encodeURIComponent(index)}` });
    await runTool(pi, "elasticsearch_bulk", {
      operations: JSON.stringify([
        { index: { _index: index, _id: "1" } },
        { "@timestamp": "2026-06-17T10:00:00Z", message: "checkout timeout", service: { name: "checkout-service" }, log: { level: "error" }, host: { name: "web-01" } },
        { index: { _index: index, _id: "2" } },
        { "@timestamp": "2026-06-17T10:03:00Z", message: "checkout retry succeeded", service: { name: "checkout-service" }, log: { level: "warn" }, host: { name: "web-01" } },
        { index: { _index: index, _id: "3" } },
        { "@timestamp": "2026-06-17T10:06:00Z", message: "auth invalid token", service: { name: "auth-service" }, log: { level: "error" }, host: { name: "api-02" } }
      ]),
      refresh: "wait_for",
    });

    await s.test("search_logs returns recent filtered events", async () => {
      const payload = parseToolText(await runTool(pi, "elasticsearch_search_logs", {
        index,
        query: "timeout",
        level: "error",
        start_time: "2026-06-17T09:00:00Z",
        end_time: "2026-06-17T11:00:00Z",
        size: 10,
      }));
      if (payload.hits_total < 1) throw new Error("Expected at least one matching log event");
      if (!payload.hits[0]?._source?.message?.includes("timeout")) throw new Error("Expected timeout event in results");
    });

    await s.test("logs_top_values aggregates common service values", async () => {
      const payload = parseToolText(await runTool(pi, "elasticsearch_logs_top_values", {
        index,
        field: "service.name",
        start_time: "2026-06-17T09:00:00Z",
        end_time: "2026-06-17T11:00:00Z",
        size: 5,
      }));
      if (!Array.isArray(payload.buckets) || payload.buckets.length === 0) throw new Error("Expected aggregation buckets");
    });

    await s.test("logs_timeline builds histogram buckets", async () => {
      const payload = parseToolText(await runTool(pi, "elasticsearch_logs_timeline", {
        index,
        interval: "1m",
        start_time: "2026-06-17T10:00:00Z",
        end_time: "2026-06-17T10:10:00Z",
      }));
      if (!Array.isArray(payload.buckets) || payload.buckets.length === 0) throw new Error("Expected timeline buckets");
    });
  } finally {
    try { await client.request({ method: "DELETE", path: `/${encodeURIComponent(index)}` }); } catch {}
  }

  return s.print();
}

autoRun(run, import.meta.url);
