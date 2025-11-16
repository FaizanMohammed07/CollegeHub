import helmet from "helmet";
import cors from "cors";
import express from "express";

/**
 * Security middleware
 */
export const securityMiddleware = (app) => {
  // Helmet for various HTTP headers
  app.use(
    helmet({
      crossOriginResourcePolicy: false,
      crossOriginOpenerPolicy: false,
      contentSecurityPolicy: false,
    })
  );

  // CORS configuration
  const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
    : [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
      ];
  console.log("Allowed CORS Origins:", corsOrigins);
  const corsOptions = {
    origin: function (origin, callback) {
      // Allow requests with no origin (Postman, Thunder Client)
      if (!origin) return callback(null, true);

      if (corsOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("❌ BLOCKED ORIGIN:", origin);
      return callback(new Error("CORS not allowed"));
    },
    origin: corsOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
  };
  app.use(cors(corsOptions));

  // Body parser limits
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb", extended: true }));

  // Prevent MIME type sniffing
  app.disable("x-powered-by");
};

/**
 * Rate limiting middleware for login endpoint
 */
export const createRateLimiter = (windowMs, maxRequests) => {
  const requests = new Map();

  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    if (!requests.has(key)) {
      requests.set(key, []);
    }

    const userRequests = requests.get(key);
    const recentRequests = userRequests.filter(
      (timestamp) => now - timestamp < windowMs
    );

    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: {
          code: "RATE_LIMITED",
          message: `Too many requests. Please try again later.`,
          details: {
            retryAfter: Math.ceil((recentRequests[0] + windowMs - now) / 1000),
          },
        },
      });
    }

    recentRequests.push(now);
    requests.set(key, recentRequests);

    next();
  };
};
