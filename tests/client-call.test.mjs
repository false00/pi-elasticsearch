import { autoRun, liveTestsEnabled, loadExtension, parseToolText, runTool, suite } from "./helpers.mjs";

export async function run() {
  const s = suite("Official Client Call Coverage");
  if (!liveTestsEnabled()) {
    s.skip("live tests disabled (set ELASTICSEARCH_LIVE_TESTS=1)");
    return s.print();
  }

  const pi = await loadExtension();

  await s.test("client call can reach root info target", async () => {
    const payload = parseToolText(await runTool(pi, "elasticsearch_client_call", {
      target: "info",
    }));
    if (!payload?.version?.number) throw new Error("Missing version.number");
  });

  await s.test("client call can reach namespaced cluster.health target", async () => {
    const payload = parseToolText(await runTool(pi, "elasticsearch_client_call", {
      target: "cluster.health",
    }));
    if (!payload?.status) throw new Error("Missing cluster health status");
  });

  return s.print();
}

autoRun(run, import.meta.url);
