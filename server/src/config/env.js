const number = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const bool = (value, fallback = false) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (["true", "1", "yes"].includes(value.toLowerCase())) return true;
    if (["false", "0", "no"].includes(value.toLowerCase())) return false;
  }
  return fallback;
};

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  app: {
    name: process.env.APP_NAME || "CollegeHub",
    port: number(process.env.PORT, 4000),
    url: process.env.APP_URL || "http://localhost:4000",
  },
  db: {
    uri: process.env.MONGODB_URI,
    testUri: process.env.MONGODB_TEST_URI,
    debug: bool(process.env.MONGODB_DEBUG, false),
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || "dev-access-secret",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "dev-refresh-secret",
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },
  security: {
    corsOrigins: (process.env.CORS_ORIGINS || "http://localhost:5174").split(
      ","
    ),
    helmet: {
      contentSecurityPolicy: bool(process.env.CSP_ENABLED, false),
    },
    rateLimit: {
      windowMs: number(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
      max: number(process.env.RATE_LIMIT_MAX, 100),
    },
  },
  mail: {
    from: process.env.MAIL_FROM || "no-reply@collegehub.app",
    apiKey: process.env.MAIL_API_KEY,
    provider: process.env.MAIL_PROVIDER || "sendgrid",
  },
  maps: {
    provider: process.env.MAPS_PROVIDER || "mapbox",
    primaryKey: process.env.MAPS_PRIMARY_KEY,
    secondaryKey: process.env.MAPS_SECONDARY_KEY,
    cacheTtl: number(process.env.MAPS_CACHE_TTL, 5 * 60 * 1000),
  },
};

export default env;
