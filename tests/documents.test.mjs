import { createLiveClient, autoRun, liveTestsEnabled, loadExtension, parseToolText, randomIndex, runTool, suite } from "./helpers.mjs";

export async function run() {
  const s = suite("Document CRUD");
  if (!liveTestsEnabled()) {
    s.skip("live tests disabled (set ELASTICSEARCH_LIVE_TESTS=1)");
    return s.print();
  }

  const pi = await loadExtension();
  const client = createLiveClient();
  const index = randomIndex("pi-docs");

  try {
    await runTool(pi, "elasticsearch_create_index", { index });

    await s.test("index and get a document", async () => {
      await runTool(pi, "elasticsearch_index_document", {
        index,
        id: "1",
        document: JSON.stringify({ title: "hello", status: "new" }),
        refresh: "wait_for",
      });

      const payload = parseToolText(await runTool(pi, "elasticsearch_get_document", { index, id: "1" }));
      if (payload?._source?.title !== "hello") throw new Error("Unexpected document source");
    });

    await s.test("update and delete a document", async () => {
      await runTool(pi, "elasticsearch_update_document", {
        index,
        id: "1",
        body: JSON.stringify({ doc: { status: "updated" } }),
        refresh: "wait_for",
      });

      const updated = parseToolText(await runTool(pi, "elasticsearch_get_document", { index, id: "1" }));
      if (updated?._source?.status !== "updated") throw new Error("Document was not updated");

      await runTool(pi, "elasticsearch_delete_document", { index, id: "1", refresh: "wait_for" });
      const exists = parseToolText(await runTool(pi, "elasticsearch_document_exists", { index, id: "1" }));
      if (exists !== false && exists?.body !== false) throw new Error("Document still exists after delete");
    });
  } finally {
    try { await client.request({ method: "DELETE", path: `/${encodeURIComponent(index)}` }); } catch {}
  }

  return s.print();
}

autoRun(run, import.meta.url);
