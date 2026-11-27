// ============================================================================
// 1. IMPORTS: Bring in the libraries we installed via npm
// ============================================================================
import { resolve } from "node:path";
import cors from "cors"; // Middleware that allows your Expo frontend to talk to this backend without getting blocked
import dotenv from "dotenv"; // Loads secret variables from your .env file into process.env
import express from "express"; // Web framework that handles HTTP requests and API routes
import multer from "multer";
import { rateLimit } from "express-rate-limit";
import { extractWithGemini } from "../utils/gemini";

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
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 1, fields: 0 },
}).single("image");

function receiptMimeType(image: Buffer) {
  if (image.subarray(0, 3).toString("hex") === "ffd8ff") return "image/jpeg";
  if (image.subarray(0, 8).toString("hex") === "89504e470d0a1a0a")
    return "image/png";
  if (
    image.toString("ascii", 0, 4) === "RIFF" &&
    image.toString("ascii", 8, 12) === "WEBP"
  )
    return "image/webp";
  if (
    image.toString("ascii", 4, 8) === "ftyp" &&
    ["heic", "heix", "hevc", "hevx"].includes(image.toString("ascii", 8, 12))
  )
    return "image/heic";
}

app.post(
  "/api/receipts/analyze",
  rateLimit({
    windowMs: 60_000,
    limit: 10,
    standardHeaders: "draft-8",
    message: { error: "Too many receipt requests. Try again in a minute." },
  }),
  async (req, res, next) => {
    const authorization = req.get("authorization") ?? "";
    if (!/^Bearer [\w.-]+$/i.test(authorization)) {
      res.status(401).json({ error: "Sign in to analyze receipts." });
      return;
    }
    try {
      const authUrl = new URL(
        `${process.env.SUPABASE_URL?.replace(/\/$/, "")}/auth/v1/user`,
      );
      const response = await fetch(authUrl, {
        headers: { apikey: process.env.SUPABASE_KEY ?? "", authorization },
        redirect: "error",
        signal: AbortSignal.timeout(5000),
      });
      await response.body?.cancel();
      if (!response.ok) {
        if (response.status !== 401 && response.status !== 403)
          throw new Error("Supabase Auth unavailable");
        res.status(401).json({ error: "Sign in again to analyze receipts." });
        return;
      }
    } catch {
      res
        .status(503)
        .json({ error: "Receipt sign-in verification is unavailable." });
      return;
    }
    next();
  },
  (req, res, next) => {
    upload(req, res, (error) => {
      if (error) {
        res.status(error.code === "LIMIT_FILE_SIZE" ? 413 : 400).json({
          error: "Upload one receipt image up to 8 MB.",
        });
        return;
      }
      next();
    });
  },
  async (req, res) => {
    const image = req.file?.buffer;
    if (!image?.length) {
      res.status(400).json({ error: "A receipt image is required." });
      return;
    }
    const mimeType = receiptMimeType(image);
    if (!mimeType) {
      res
        .status(415)
        .json({ error: "Choose a JPEG, PNG, WebP, or HEIC image." });
      return;
    }
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    const model = process.env.GEMINI_MODEL?.trim();
    if (!apiKey || !model) {
      res
        .status(503)
        .json({ error: "Receipt analysis is awaiting Gemini configuration." });
      return;
    }
    try {
      res.json(
        await extractWithGemini({
          apiKey,
          model,
          mimeType,
          data: image.toString("base64"),
        }),
      );
    } catch {
      res
        .status(502)
        .json({
          error:
            "Gemini could not analyze this receipt. Try again or enter its details manually.",
        });
    }
  },
);

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
