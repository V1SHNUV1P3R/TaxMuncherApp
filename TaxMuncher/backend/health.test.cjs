// ============================================================================
// 1. IMPORTS: Built-in Node.js modules for testing (zero external packages needed)
// ============================================================================
const assert = require("node:assert/strict"); // Provides strict equality & pattern-matching checks
const { once } = require("node:events"); // Converts event emitters (like server "listening") into Promises we can await
const http = require("node:http"); // Built-in HTTP server used here to build a fake ("mock") Supabase server
const test = require("node:test"); // Node's built-in test runner

// ============================================================================
// 2. TEST CASE: Verify /api/health across healthy, failing, and bad-config states
// ============================================================================
test("health checks Supabase Auth and reports upstream failures", async (t) => {
  // Controls what HTTP status code our fake Supabase server will return (starts at 200 OK)
  let upstreamStatus = 200;

  // Stores a log of every incoming request our fake Supabase server receives so we can inspect them later
  const requests = [];

  // --------------------------------------------------------------------------
  // STEP A: Spin up a fake ("mock") Supabase server locally
  // --------------------------------------------------------------------------
  // Instead of hitting the real Supabase cloud during tests, we create a local HTTP server
  // that records incoming paths and API keys, then replies with whatever `upstreamStatus` is set to.
  const upstream = http.createServer((req, res) => {
    requests.push({ path: req.url, key: req.headers.apikey });
    res.writeHead(upstreamStatus).end();
  });

  // Listen on port `0`, which tells the OS to automatically assign any free random port
  upstream.listen(0, "127.0.0.1");
  await once(upstream, "listening"); // Pause until the fake server is ready to accept traffic
  t.after(() => upstream.close()); // Guarantee the fake server shuts down cleanly when the test ends

  // --------------------------------------------------------------------------
  // STEP B: Point your Express backend at the fake Supabase server and start it
  // --------------------------------------------------------------------------
  // Override environment variables BEFORE importing `./index.ts` so your app connects to our local mock
  process.env.SUPABASE_URL = `http://127.0.0.1:${upstream.address().port}`;
  process.env.SUPABASE_KEY = "local-test-key";

  // Import the Express `app` instance from your backend entry file and start it on another free port
  const { app } = require("./index.ts");
  const backend = app.listen(0, "127.0.0.1");
  await once(backend, "listening");
  t.after(() => backend.close()); // Clean up the backend server after the test finishes

  // Build the full local URL for your health check endpoint
  const healthUrl = `http://127.0.0.1:${backend.address().port}/api/health`;

  // --------------------------------------------------------------------------
  // SCENARIO 1: Healthy Connection (Upstream returns 200)
  // --------------------------------------------------------------------------
  const healthy = await fetch(healthUrl);
  assert.equal(healthy.status, 200); // Expect Express to return 200 OK
  // Expect the JSON body to confirm the configured Supabase URL
  assert.equal((await healthy.json()).supabaseUrl, process.env.SUPABASE_URL);

  // --------------------------------------------------------------------------
  // SCENARIO 2: Upstream Auth Failure (Upstream returns 401 Unauthorized)
  // --------------------------------------------------------------------------
  upstreamStatus = 401; // Flip the fake Supabase server to reject requests with a 401 error
  const unhealthy = await fetch(healthUrl);
  assert.equal(unhealthy.status, 500); // Expect Express to catch the failure and respond with HTTP 500
  assert.match((await unhealthy.json()).error, /401/); // Verify the error message mentions "401"

  // Confirm that during Scenarios 1 & 2, your backend hit the exact Supabase Auth settings endpoint
  // with the expected `apikey` header both times
  const expected = { path: "/auth/v1/settings", key: "local-test-key" };
  assert.deepEqual(requests, [expected, expected]);

  // --------------------------------------------------------------------------
  // SCENARIO 3: Invalid Configuration (Malformed SUPABASE_URL)
  // --------------------------------------------------------------------------
  process.env.SUPABASE_URL = "invalid URL"; // Simulate a broken/missing URL in .env
  const unconfigured = await fetch(healthUrl);
  assert.equal(unconfigured.status, 503); // Expect HTTP 503 (Service Unavailable)
  assert.equal(
    (await unconfigured.json()).status,
    "Supabase is not configured",
  );
});