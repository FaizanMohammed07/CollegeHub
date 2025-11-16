import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import env from "./config/env.js";
import { connectDB } from "./config/db.js";
import { securityMiddleware } from "./middleware/security.js";
import { httpLogger } from "./utils/logger.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import logger from "./utils/logger.js";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import clubRoutes from "./routes/clubRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import registrationRoutes from "./routes/registrationRoutes.js";
import mapsRoutes from "./routes/mapsRoutes.js";
import revenueRoutes from "./routes/revenueRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";

const app = express();

// Connect to database
connectDB().catch((error) => {
  logger.error({ error }, "Failed to start server");
  process.exit(1);
});

// Logging middleware
app.use(httpLogger);

// Security and body parsing
securityMiddleware(app);

// Pre-flight support
app.options("*", cors());

// Cookie parser
app.use(cookieParser());

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is healthy" });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/clubs", clubRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/maps", mapsRoutes);
app.use("/api/revenue", revenueRoutes);
app.use("/api/search", searchRoutes);

// Documentation endpoint
app.get("/api/docs", (req, res) => {
  res.json({
    api: "College Hub API",
    version: "1.0.0",
    endpoints: {
      auth: [
        "POST /api/auth/signup",
        "POST /api/auth/login",
        "POST /api/auth/refresh",
        "POST /api/auth/logout",
        "POST /api/auth/forgot-password",
        "POST /api/auth/reset-password",
        "POST /api/auth/request-verification",
        "POST /api/auth/verify-email",
      ],
      users: [
        "GET /api/users/me",
        "PUT /api/users/me",
        "PUT /api/users/me/location",
        "GET /api/users/nearby",
        "GET /api/users/search",
        "GET /api/users/:id",
        "GET /api/users/:id/stats",
      ],
      clubs: [
        "POST /api/clubs",
        "GET /api/clubs/:id",
        "PUT /api/clubs/:id",
        "POST /api/clubs/:id/join",
        "POST /api/clubs/:id/leave",
        "GET /api/clubs/:id/members",
        "GET /api/clubs/college/:collegeId",
      ],
      events: [
        "POST /api/events",
        "GET /api/events",
        "GET /api/events/:id",
        "PUT /api/events/:id",
        "POST /api/events/:id/cancel",
        "POST /api/events/:id/register",
        "GET /api/events/:id/registrations",
        "POST /api/events/:id/checkin",
      ],
      registrations: [
        "GET /api/registrations",
        "PATCH /api/registrations/:id/status",
        "POST /api/registrations/:id/cancel",
        "POST /api/registrations/:id/request-eta",
        "POST /api/registrations/:id/qr-token",
      ],
      maps: [
        "POST /api/maps/geocode",
        "POST /api/maps/reverse-geocode",
        "POST /api/maps/route-estimate",
        "GET /api/maps/cache-stats",
      ],
    },
  });
});

// 404 handler (before error handler)
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

const PORT = env.app.port;

const server = app.listen(PORT, () => {
  logger.info({ PORT }, "Server started");
});

// Graceful shutdown
process.on("SIGINT", async () => {
  logger.info("Shutting down gracefully...");
  server.close(async () => {
    try {
      const mongoose = await import("mongoose");
      await mongoose.default.connection.close();
      logger.info("Database connection closed");
      process.exit(0);
    } catch (error) {
      logger.error({ error }, "Error during shutdown");
      process.exit(1);
    }
  });
});

process.on("SIGTERM", () => {
  logger.warn("SIGTERM received, shutting down");
  server.close();
});

export default app;
