const assert = require("node:assert/strict");
const { once } = require("node:events");
const http = require("node:http");
const test = require("node:test");

test("health checks Supabase Auth and reports upstream failures", async (t) => {
  let upstreamStatus = 200;
  const requests = [];
  const upstream = http.createServer((req, res) => {
    requests.push({ path: req.url, key: req.headers.apikey });
    res.writeHead(upstreamStatus).end();
  });
  upstream.listen(0, "127.0.0.1");
  await once(upstream, "listening");
  t.after(() => upstream.close());

  process.env.SUPABASE_URL = `http://127.0.0.1:${upstream.address().port}`;
  process.env.SUPABASE_KEY = "local-test-key";
  const { app } = require("./index.ts");
  const backend = app.listen(0, "127.0.0.1");
  await once(backend, "listening");
  t.after(() => backend.close());
  const healthUrl = `http://127.0.0.1:${backend.address().port}/api/health`;

  const healthy = await fetch(healthUrl);
  assert.equal(healthy.status, 200);
  assert.equal((await healthy.json()).supabaseUrl, process.env.SUPABASE_URL);

  upstreamStatus = 401;
  const unhealthy = await fetch(healthUrl);
  assert.equal(unhealthy.status, 500);
  assert.match((await unhealthy.json()).error, /401/);
  const expected = { path: "/auth/v1/settings", key: "local-test-key" };
  assert.deepEqual(requests, [expected, expected]);

  process.env.SUPABASE_URL = "invalid URL";
  const unconfigured = await fetch(healthUrl);
  assert.equal(unconfigured.status, 503);
  assert.equal(
    (await unconfigured.json()).status,
    "Supabase is not configured",
  );
});
