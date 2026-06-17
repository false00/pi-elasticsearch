const OPENAPI_URL = "https://raw.githubusercontent.com/elastic/elasticsearch-specification/main/output/openapi/elasticsearch-openapi.json";
const CACHED_OFFICIAL_SUMMARY = {
  routeCount: 575,
  methodCount: 833,
  methods: ["DELETE", "GET", "HEAD", "POST", "PUT"],
  auditedOn: "2026-06-17",
};

async function loadOfficialSpec() {
  const response = await fetch(OPENAPI_URL);
  if (!response.ok) {
    throw new Error(`Fetch failed with ${response.status} ${response.statusText}`);
  }
  return await response.json();
}

async function loadLocalTools() {
  const mod = await import(new URL("../dist/index.js", import.meta.url));
  const tools = [];
  await mod.default({
    registerTool(tool) {
      tools.push(tool);
    },
  });
  return tools;
}

function summarizeSpec(spec) {
  const paths = spec?.paths || {};
  const methods = new Set();
  const topNamespaces = new Map();
  let methodCount = 0;

  for (const [path, definition] of Object.entries(paths)) {
    const ops = Object.keys(definition || {})
      .filter((key) => ["get", "post", "put", "delete", "head", "patch", "options"].includes(key.toLowerCase()))
      .map((key) => key.toUpperCase());

    methodCount += ops.length;
    for (const method of ops) methods.add(method);

    const firstSegment = path.split("/").filter(Boolean)[0] || "/";
    topNamespaces.set(firstSegment, (topNamespaces.get(firstSegment) || 0) + ops.length);
  }

  return {
    routeCount: Object.keys(paths).length,
    methodCount,
    methods: [...methods].sort(),
    topNamespaces: [...topNamespaces.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20),
  };
}

function summarizeLocalTools(tools) {
  const names = tools.map((tool) => tool.name).sort();
  return {
    toolCount: names.length,
    rawCoverageTools: names.filter((name) => name === "elasticsearch_api_call"),
    clientCoverageTools: names.filter((name) => name === "elasticsearch_client_call" || name === "elasticsearch_client_targets"),
    prefixedOnly: names.every((name) => name.startsWith("elasticsearch_")),
  };
}

let official;
let sourceMode = "network";
let note;
try {
  official = summarizeSpec(await loadOfficialSpec());
} catch (error) {
  sourceMode = "cached";
  note = `Live fetch failed; using cached summary from ${CACHED_OFFICIAL_SUMMARY.auditedOn}. ${error.message}`;
  official = {
    routeCount: CACHED_OFFICIAL_SUMMARY.routeCount,
    methodCount: CACHED_OFFICIAL_SUMMARY.methodCount,
    methods: CACHED_OFFICIAL_SUMMARY.methods,
    topNamespaces: [],
  };
}

const local = summarizeLocalTools(await loadLocalTools());

console.log(JSON.stringify({
  source: OPENAPI_URL,
  sourceMode,
  auditedAt: new Date().toISOString(),
  official,
  local,
  interpretation: {
    dedicatedCoverage: "Dedicated elasticsearch_* tools cover common day-to-day workflows.",
    universalCoverage: "elasticsearch_client_call and elasticsearch_api_call provide broad practical reach across the remainder of the official API surface.",
  },
  ...(note ? { note } : {}),
}, null, 2));
