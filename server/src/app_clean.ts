import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { sequelize } from "./models";
import authRoutes from "./routes/auth";
import studentRoutes from "./routes/students_new";
import teacherRoutes from "./routes/teachers_new";
import dashboardRoutes from "./routes/dashboard";
import departmentRoutes from "./routes/departments";
import courseRoutes from "./routes/courses_new";
import timetableRoutes from "./routes/timetable";
import attendanceRoutes from "./routes/attendance";
import uploadRoutes from "./routes/upload";
import analyticsRoutes from "./routes/analytics";
import sectionRoutes from "./routes/sections";
import savedTimetableRoutes from "./routes/savedTimetables";
import statsRoutes from "./routes/stats";
import batchRoutes from "./routes/batches";
import dataEntryRoutes from "./routes/dataEntry";
import studentEnrollmentRoutes from "./routes/studentEnrollment";
import smartAttendanceRoutes from "./routes/smartAttendance";
import smartTimetableRoutes from "./routes/smartTimetableRoutesSimple";
import notificationRoutes from "./routes/notifications";
import attendanceStatsRoutes from "./routes/attendanceStats";

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
// Increase payload limit for image uploads (class photos)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Attendance Management System API is running",
    timestamp: new Date().toISOString(),
  });
});

// AI Test route (No auth required) - for testing from frontend
app.post("/api/ai-generate-test", (req, res) => {
  console.log("🤖 AI Test Generation Route Hit!");
  console.log("Request body:", req.body);

  res.json({
    success: true,
    message: "AI timetable generation is working!",
    data: {
      solutions: [
        {
          id: "solution-1",
          name: "Teacher-Optimized Solution",
          quality: { overall_score: 95.5 },
          conflicts: [],
          optimization_goal: "teacher-focused",
          timetable_entries: [],
        },
        {
          id: "solution-2",
          name: "Student-Optimized Solution",
          quality: { overall_score: 92.8 },
          conflicts: [],
          optimization_goal: "student-focused",
          timetable_entries: [],
        },
      ],
      generation_summary: {
        total_generation_time_ms: 1250,
        solutions_generated: 2,
        best_score: 95.5,
      },
    },
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/api/auth", authRoutes);

// Smart timetable routes
app.use("/api/smart-timetable", smartTimetableRoutes);

app.use("/api/students", studentRoutes);
app.use("/api/teachers_new", teacherRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/sections", sectionRoutes);
app.use("/api/batches", batchRoutes);
app.use("/api/saved-timetables", savedTimetableRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/data-entry", dataEntryRoutes);
app.use("/api/student-enrollment", studentEnrollmentRoutes);
app.use("/api/smart-attendance", smartAttendanceRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/attendance", attendanceStatsRoutes); // Enhanced attendance stats

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong!" });
  }
);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Database connection and server start
async function connectDbWithRetry(maxRetries = 5) {
  let attempt = 0;
  const envSync = (process.env.DB_SYNC || "none").toLowerCase();
  let syncOptions: any = {};
  if (envSync === "alter") syncOptions = { alter: true };
  else if (envSync === "force") syncOptions = { force: true };
  else if (envSync === "none") syncOptions = {};

  while (attempt < maxRetries) {
    try {
      console.log(
        `🔄 Database connection attempt ${attempt + 1}/${maxRetries}...`
      );
      await sequelize.authenticate();
      console.log("✅ Database connection established successfully.");
      if (Object.keys(syncOptions).length > 0) {
        console.log(`🗄️  Syncing database with options:`, syncOptions);
        await sequelize.sync(syncOptions);
        console.log("✅ Database synchronized.");
      } else {
        console.log("ℹ️  Skipping sequelize.sync() (DB_SYNC=none).");
      }
      return; // success
    } catch (error: any) {
      attempt++;
      const delay = Math.min(10000, 2000 * attempt); // exponential backoff up to 10s
      console.error(
        `❌ DB connect attempt ${attempt}/${maxRetries} failed:`,
        error?.message || error
      );

      // Provide helpful error messages
      if (
        error?.message?.includes("ENOTFOUND") ||
        error?.message?.includes("ETIMEDOUT")
      ) {
        console.error("🔧 Possible fixes:");
        console.error("   1. Check your Supabase project is active");
        console.error("   2. Verify the DATABASE_URL in .env file");
        console.error("   3. Check your internet connection");
        console.error("   4. Try updating the Supabase connection string");
      }

      if (attempt >= maxRetries) {
        console.error("❌ Exhausted DB connection retries.");
        console.error(
          "⚠️  Server will start but database features may not work."
        );
        return;
      }
      console.log(`⏳ Retrying DB connection in ${delay / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

function startServer() {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📖 API Base URL: http://localhost:${PORT}/api`);
    if (
      (process as any).execArgv?.some((a: string) =>
        a.includes("--dns-result-order")
      )
    ) {
      console.log(
        `🌐 DNS result order: ${(process as any).execArgv.find((a: string) =>
          a.includes("--dns-result-order")
        )}`
      );
    }
  });

  // Kick off DB connection in the background with retries
  connectDbWithRetry();
}

startServer();
