import { autoRun, liveTestsEnabled, loadExtension, parseToolText, randomIndex, runTool, suite } from "./helpers.mjs";

export async function run() {
  const s = suite("Ingest");
  if (!liveTestsEnabled()) {
    s.skip("live tests disabled (set ELASTICSEARCH_LIVE_TESTS=1)");
    return s.print();
  }

  const pi = await loadExtension();
  const pipelineId = randomIndex("pi-pipeline");

  try {
    await s.test("put and get pipeline", async () => {
      await runTool(pi, "elasticsearch_ingest_put_pipeline", {
        id: pipelineId,
        body: JSON.stringify({ description: "test", processors: [{ set: { field: "ingested", value: true } }] }),
      });
      const payload = parseToolText(await runTool(pi, "elasticsearch_ingest_get_pipeline", { id: pipelineId }));
      if (!payload?.[pipelineId]) throw new Error("Pipeline not found");
    });

    await s.test("simulate pipeline", async () => {
      const payload = parseToolText(await runTool(pi, "elasticsearch_ingest_simulate", {
        id: pipelineId,
        body: JSON.stringify({ docs: [{ _source: { message: "hello" } }] }),
      }));
      if (!Array.isArray(payload?.docs)) throw new Error("Missing simulated docs");
    });
  } finally {
    try { await runTool(pi, "elasticsearch_ingest_delete_pipeline", { id: pipelineId }); } catch {}
  }

  return s.print();
}

autoRun(run, import.meta.url);
