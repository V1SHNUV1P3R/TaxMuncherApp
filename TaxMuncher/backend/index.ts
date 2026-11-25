// ============================================================================
// 1. IMPORTS: Bring in the libraries we installed via npm
// ============================================================================
import { resolve } from "node:path";
import cors from "cors"; // Middleware that allows your Expo frontend to talk to this backend without getting blocked
import dotenv from "dotenv"; // Loads secret variables from your .env file into process.env
import express from "express"; // Web framework that handles HTTP requests and API routes

// ============================================================================
// 2. CONFIGURATION & MIDDLEWARE: Prepare the server before handling routes
// ============================================================================

// Reads your .env file and makes SUPABASE_URL, SUPABASE_KEY, and PORT available
dotenv.config({ path: resolve(__dirname, ".env") });

// Initializes the Express application instance
export const app = express();

// Enables Cross-Origin Resource Sharing (CORS) so your mobile app can make requests to this server
app.use(cors());

// Tells Express to automatically parse incoming JSON data in request bodies (e.g., req.body)
app.use(express.json());

// ============================================================================
// 3. API ROUTES: Define the endpoints your frontend or browser can call
// ============================================================================

/**
 * GET /api/health
 * A test route to verify the server is running and can reach Supabase.
 * - req (Request): Contains data sent BY the client (headers, params, body).
 * - res (Response): Used to send data or status codes BACK to the client.
 */
app.get("/api/health", async (_req, res) => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  const projectUrl = supabaseUrl && URL.parse(supabaseUrl);
  if (
    !projectUrl ||
    !["https:", "http:"].includes(projectUrl.protocol) ||
    !supabaseKey
  ) {
    res.status(503).json({
      status: "Supabase is not configured",
      error: "Set a valid SUPABASE_URL and SUPABASE_KEY in backend/.env.",
    });
    return;
  }

  try {
    const authSettingsUrl = new URL(projectUrl);
    authSettingsUrl.pathname =
      projectUrl.pathname.replace(/\/$/, "") + "/auth/v1/settings";
    const response = await fetch(authSettingsUrl, {
      headers: { apikey: supabaseKey },
      signal: AbortSignal.timeout(5000),
      redirect: "error",
    });
    await response.body?.cancel();
    if (!response.ok) {
      throw new Error(`Supabase Auth returned HTTP ${response.status}.`);
    }

    // Sends a 200 OK status (default) and a JSON object back to the browser/app
    res.json({
      status: "Connected to Supabase successfully!",
      supabaseUrl,
    });
  } catch (err) {
    // If anything inside the "try" block fails, return HTTP 500 (Internal Server Error)
    // along with the specific error message for easy debugging
    res.status(500).json({
      status: "Supabase connection failed",
      error:
        err instanceof Error ? err.message : "Supabase Auth is unavailable.",
    });
  }
});

// ============================================================================
// 4. START THE SERVER: Listen for incoming traffic
// ============================================================================

// Use the PORT defined in .env, or fall back to port 3000 if none is specified
const PORT = process.env.PORT || 3000;

// Starts the server and prints a confirmation message in your VS Code terminal
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`TaxMuncher backend running on http://localhost:${PORT}`);
  });
}
