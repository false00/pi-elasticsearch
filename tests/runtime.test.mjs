import { autoRun, loadExtension, suite, withTempElasticsearchConfig } from "./helpers.mjs";

export async function run() {
  const s = suite("Runtime");

  await s.test("missing configuration is deferred until tool execution with actionable guidance", async () => {
    await withTempElasticsearchConfig(async () => {
      const pi = await loadExtension();
      const infoTool = pi.tools.find((tool) => tool.name === "elasticsearch_info");
      if (!infoTool) throw new Error("Expected elasticsearch_info tool to be registered");

      let thrown;
      try {
        await infoTool.execute("tool-1", {}, undefined, undefined, {});
      } catch (error) {
        thrown = error;
      }

      if (!thrown) throw new Error("Expected tool execution to fail");
      const payload = JSON.parse(thrown.message);
      if (payload.category !== "network" && payload.category !== "configuration") {
        throw new Error(`Expected configuration or network category, got ${payload.category}`);
      }
    }, {
      envContents: [
        "ELASTICSEARCH_URL=",
        "ELASTICSEARCH_CLOUD_ID=",
        "ELASTICSEARCH_API_KEY=",
      ].join("\n"),
    });
  });

  await s.test("tool timeout throws structured Pi tool error", async () => {
    const previous = process.env.ELASTICSEARCH_TOOL_TIMEOUT_MS;
    process.env.ELASTICSEARCH_TOOL_TIMEOUT_MS = "1000";
    try {
      const { safeExecute } = await import("../dist/tool-runtime.js");
      const execute = safeExecute(async () => {
        await new Promise((resolve) => setTimeout(resolve, 1100));
        return { ok: true };
      });

      let thrown;
      try {
        await execute("timeout-test", {}, null, null);
      } catch (error) {
        thrown = error;
      }

      if (!thrown) throw new Error("Expected timeout error");
      const payload = JSON.parse(thrown.message);
      if (payload.category !== "timeout") throw new Error(`Expected timeout category, got ${payload.category}`);
      if (payload.httpStatus !== 408) throw new Error(`Expected 408 status, got ${payload.httpStatus}`);
    } finally {
      if (previous === undefined) delete process.env.ELASTICSEARCH_TOOL_TIMEOUT_MS;
      else process.env.ELASTICSEARCH_TOOL_TIMEOUT_MS = previous;
    }
  });

  return s.print();
}

autoRun(run, import.meta.url);
