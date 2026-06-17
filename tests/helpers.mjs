import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { ElasticsearchClient } from "../dist/elasticsearch-client.js";

export function createFakePi() {
  const tools = [];
  const commands = [];
  const events = new Map();
  let shutdownHandler;

  return {
    tools,
    commands,
    events,
    get shutdownHandler() {
      return shutdownHandler;
    },
    registerTool(tool) {
      tools.push(tool);
    },
    registerCommand(name, options) {
      commands.push({ name, ...options });
    },
    on(event, handler) {
      const handlers = events.get(event) ?? [];
      handlers.push(handler);
      events.set(event, handlers);
    },
    onShutdown(handler) {
      shutdownHandler = handler;
    },
  };
}

const CONFIG_ENV_KEYS = [
  "PI_ELASTICSEARCH_CONFIG_DIR",
  "ELASTICSEARCH_URL",
  "ELASTICSEARCH_CLOUD_ID",
  "ELASTICSEARCH_VERIFY_TLS",
  "ELASTICSEARCH_API_KEY",
  "ELASTICSEARCH_API_KEY_ID",
  "ELASTICSEARCH_API_KEY_SECRET",
  "ELASTICSEARCH_BEARER_TOKEN",
  "ELASTICSEARCH_USERNAME",
  "ELASTICSEARCH_PASSWORD",
  "ELASTICSEARCH_CA_CERT_PATH",
  "ELASTICSEARCH_CA_FINGERPRINT",
  "ELASTICSEARCH_REQUEST_TIMEOUT_MS",
  "ELASTICSEARCH_TOOL_TIMEOUT_MS",
  "ELASTICSEARCH_SNIFF_ON_START",
  "ELASTICSEARCH_SNIFF_ON_CONNECTION_FAULT",
  "ELASTICSEARCH_SNIFF_INTERVAL_MS",
];

export async function withTempElasticsearchConfig(run, { envContents } = {}) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "pi-elasticsearch-test-"));
  const previous = new Map(CONFIG_ENV_KEYS.map((key) => [key, process.env[key]]));

  for (const key of CONFIG_ENV_KEYS) delete process.env[key];
  process.env.PI_ELASTICSEARCH_CONFIG_DIR = tempDir;

  if (envContents !== undefined) {
    await fs.writeFile(path.join(tempDir, ".env"), envContents, "utf8");
  }

  try {
    return await run({
      tempDir,
      envPath: path.join(tempDir, ".env"),
    });
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
    for (const [key, value] of previous) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

export async function readFileOrEmpty(filePath) {
  return await fs.readFile(filePath, "utf8");
}

export function autoRun(runFn, metaUrl) {
  const url = metaUrl.replace(/\\/g, "/");
  const arg = process.argv[1]?.replace(/\\/g, "/");
  if (arg && url.endsWith(arg.split("/").pop())) {
    runFn().then((failed) => { if (failed > 0) process.exit(1); });
  }
}

export function suite(name) {
  return {
    name,
    passed: 0,
    failed: 0,
    skipped: 0,
    async test(description, fn) {
      try {
        await fn();
        this.passed++;
        console.log(`  ✓ ${description}`);
      } catch (err) {
        this.failed++;
        console.log(`  ✗ ${description}: ${err.message}`);
      }
    },
    skip(description) {
      this.skipped++;
      console.log(`  - ${description}`);
    },
    print() {
      console.log(`\n${this.name}: ${this.passed} passed, ${this.failed} failed, ${this.skipped} skipped`);
      return this.failed;
    },
  };
}

export function liveTestsEnabled() {
  return process.env.ELASTICSEARCH_LIVE_TESTS === "1";
}

export function createLiveClient() {
  return new ElasticsearchClient();
}

export async function loadExtension() {
  const { default: extension } = await import("../dist/index.js");
  const pi = createFakePi();
  await extension(pi);
  return pi;
}

export async function getTool(pi, name) {
  const tool = pi.tools.find((entry) => entry.name === name);
  if (!tool) throw new Error(`Missing tool ${name}`);
  return tool;
}

export async function runTool(pi, name, params = {}) {
  const tool = await getTool(pi, name);
  return await tool.execute(name, params, null, null, {});
}

export function parseToolText(result) {
  return JSON.parse(result.content[0].text);
}

export function randomIndex(prefix = "pi-es") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
