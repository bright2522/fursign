import assert from "node:assert/strict";
import test from "node:test";

async function requestWorker(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
}

test("server-renders the finished Fursign entry page", async () => {
  const response = await requestWorker();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /Fursign/);
  assert.match(html, /ออกแบบห้อง/);
  assert.match(html, /ออกแบบเลย/);
  assert.doesNotMatch(html, /codex-preview|Building your site|Your site is taking shape/);
});

test("outbound redirect only accepts the merchant allowlist", async () => {
  const allowed = await requestWorker("/out?url=https%3A%2F%2Fexample.com%2Ffursign%2F1&click_id=test");
  assert.equal(allowed.status, 302);
  assert.equal(allowed.headers.get("location"), "https://example.com/fursign/1");
  const blocked = await requestWorker("/out?url=https%3A%2F%2Fevil.example%2F");
  assert.equal(blocked.status, 400);
});
