import { autoRun, loadExtension, readFileOrEmpty, suite, withTempElasticsearchConfig } from "./helpers.mjs";

export async function run() {
  const s = suite("Smoke");

  await s.test("extension loads without live credentials and registers expected tool surface", async () => {
    await withTempElasticsearchConfig(async ({ envPath }) => {
      const pi = await loadExtension();
      if (pi.tools.length < 130) throw new Error(`Expected broad tool surface, got ${pi.tools.length}`);

      const names = new Set(pi.tools.map((tool) => tool.name));
      for (const required of [
        "elasticsearch_info",
        "elasticsearch_search",
        "elasticsearch_create_index",
        "elasticsearch_security_authenticate",
        "elasticsearch_client_call",
        "elasticsearch_api_call",
      ]) {
        if (!names.has(required)) throw new Error(`Missing required tool: ${required}`);
      }

      const envContents = await readFileOrEmpty(envPath);
      if (!envContents.includes("ELASTICSEARCH_URL=")) throw new Error("Expected template ELASTICSEARCH_URL entry");
      if (!envContents.includes("ELASTICSEARCH_API_KEY=")) throw new Error("Expected template ELASTICSEARCH_API_KEY entry");
    });
  });

  await s.test("all registered tools use elasticsearch_ prefix", async () => {
    await withTempElasticsearchConfig(async () => {
      const pi = await loadExtension();
      const bad = pi.tools.map((tool) => tool.name).filter((name) => !name.startsWith("elasticsearch_"));
      if (bad.length > 0) throw new Error(`Unexpected non-prefixed tools: ${bad.join(", ")}`);
    });
  });

  return s.print();
}

autoRun(run, import.meta.url);
