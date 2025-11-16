import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import env from "./config/env.js";
import { connectDB } from "./config/db.js";
import logger from "./utils/logger.js";
import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import collegeRoutes from "./routes/collegeRoutes.js";
import clubRoutes from "./routes/clubRoutes.js";
import verificationRoutes from "./routes/verificationRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import collaborationRoutes from "./routes/collaborationRoutes.js";
import securityRoutes from "./routes/securityRoutes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const app = express();

await connectDB();

app.use(
  cors({
    origin: env.cors.origins,
    credentials: true,
  })
);
app.use(helmet());
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());
app.use(
  rateLimit({
    windowMs: env.rateLimit.windowMs,
    max: env.rateLimit.max,
  })
);

app.get("/health", (req, res) => {
  res.json({ success: true, service: "super-admin", status: "ok" });
});

app.use("/api/super-admin/auth", authRoutes);
app.use("/api/super-admin/dashboard", dashboardRoutes);
app.use("/api/super-admin/colleges", collegeRoutes);
app.use("/api/super-admin/clubs", clubRoutes);
app.use("/api/super-admin/verification", verificationRoutes);
app.use("/api/super-admin/events", eventRoutes);
app.use("/api/super-admin/users", userRoutes);
app.use("/api/super-admin/posts", announcementRoutes);
app.use("/api/super-admin/reports", reportRoutes);
app.use("/api/super-admin/analytics", analyticsRoutes);
app.use("/api/super-admin/settings", settingsRoutes);
app.use("/api/super-admin/notifications", notificationRoutes);
app.use("/api/super-admin/collaborations", collaborationRoutes);
app.use("/api/super-admin/security", securityRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.app.port, () => {
  logger.info({ port: env.app.port }, "Super admin service running");
});
