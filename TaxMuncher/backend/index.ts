// ============================================================================
// 1. IMPORTS: Bring in the libraries we installed via npm
// ============================================================================
import { createClient } from "@supabase/supabase-js"; // Official Supabase SDK to interact with your database and auth
import cors from "cors"; // Middleware that allows your Expo frontend to talk to this backend without getting blocked
import dotenv from "dotenv"; // Loads secret variables from your .env file into process.env
import express from "express"; // Web framework that handles HTTP requests and API routes

// ============================================================================
// 2. CONFIGURATION & MIDDLEWARE: Prepare the server before handling routes
// ============================================================================

// Reads your .env file and makes SUPABASE_URL, SUPABASE_KEY, and PORT available
dotenv.config();

// Initializes the Express application instance
const app = express();

// Enables Cross-Origin Resource Sharing (CORS) so your mobile app can make requests to this server
app.use(cors());

// Tells Express to automatically parse incoming JSON data in request bodies (e.g., req.body)
app.use(express.json());

// ============================================================================
// 3. SUPABASE INITIALIZATION: Connect Node.js to your Supabase project
// ============================================================================

// Pull your Supabase credentials from the .env file.
// The "!" (non-null assertion) tells TypeScript we guarantee these values exist in .env.
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;

// Creates a single Supabase client instance that your routes can use to query data or check auth
const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================================================
// 4. API ROUTES: Define the endpoints your frontend or browser can call
// ============================================================================

/**
 * GET /api/health
 * A test route to verify the server is running and can reach Supabase.
 * - req (Request): Contains data sent BY the client (headers, params, body).
 * - res (Response): Used to send data or status codes BACK to the client.
 */
app.get("/api/health", async (req, res) => {
  try {
    // Pings Supabase Auth to verify the URL and API key are valid and reachable.
    // "await" pauses execution until Supabase responds.
    const { data, error } = await supabase.auth.getSession();

    // If Supabase returns an error (e.g., invalid key), jump straight to the catch block
    if (error) throw error;

    // Sends a 200 OK status (default) and a JSON object back to the browser/app
    res.json({
      status: "Connected to Supabase successfully!",
      supabaseUrl,
    });
  } catch (err: any) {
    // If anything inside the "try" block fails, return HTTP 500 (Internal Server Error)
    // along with the specific error message for easy debugging
    res.status(500).json({
      status: "Supabase connection failed",
      error: err.message,
    });
  }
});

// ============================================================================
// 5. START THE SERVER: Listen for incoming traffic
// ============================================================================

// Use the PORT defined in .env, or fall back to port 3000 if none is specified
const PORT = process.env.PORT || 3000;

// Starts the server and prints a confirmation message in your VS Code terminal
app.listen(PORT, () => {
  console.log(`Turmeric Backend running on http://localhost:${PORT}`);
});
