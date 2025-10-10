import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "../routes/auth";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
// CORS: support comma-separated origins in CORS_ORIGIN env and trim trailing slashes
const rawCors = process.env.CORS_ORIGIN || "http://localhost:3000";
const allowedOrigins = rawCors
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean)
  .map((o) => o.replace(/\/$/, ""));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (no Origin header) like curl/health checks
      if (!origin) return callback(null, true);

      const normalized = origin.replace(/\/$/, "");

      // Allow localhost:3000 and localhost:5000 (for proxy)
      if (
        normalized === "http://localhost:3000" ||
        normalized === "http://localhost:5000"
      ) {
        return callback(null, true);
      }

      // Check against configured origins
      if (allowedOrigins.includes(normalized)) {
        return callback(null, true);
      }

      // For development, allow all localhost origins
      if (normalized.startsWith("http://localhost:")) {
        console.log(`✅ CORS allowing localhost origin: ${origin}`);
        return callback(null, true);
      }

      console.warn(`⚠️ CORS blocked origin: ${origin}`);
      // Don't throw error, just deny - this prevents 500 errors
      return callback(null, false);
    },
    credentials: true,
    optionsSuccessStatus: 204,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);