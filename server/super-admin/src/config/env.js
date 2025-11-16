import "dotenv/config";

const number = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const bool = (value, fallback = false) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.toLowerCase();
    if (["true", "1", "yes"].includes(normalized)) return true;
    if (["false", "0", "no"].includes(normalized)) return false;
  }
  return fallback;
};

const list = (value, fallback = []) => {
  if (!value) return fallback;
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  app: {
    port: number(process.env.SUPER_ADMIN_PORT, 4600),
    name: process.env.SUPER_ADMIN_APP_NAME || "CollegeHub Super Admin",
  },
  auth: {
    email: process.env.SUPER_ADMIN_EMAIL,
    password: process.env.SUPER_ADMIN_PASSWORD,
    jwtSecret: process.env.SUPER_ADMIN_JWT_SECRET || "super-admin-secret",
    jwtExpiresIn: process.env.SUPER_ADMIN_JWT_EXPIRES_IN || "1d",
    trustedIps: list(process.env.SUPER_ADMIN_TRUSTED_IPS),
    enforceIpWhitelist: bool(process.env.SUPER_ADMIN_ENFORCE_IP, false),
  },
  db: {
    uri: process.env.MONGODB_URI,
  },
  cors: {
    origins: list(process.env.CORS_ORIGINS, ["http://localhost:5176"]),
  },
  rateLimit: {
    windowMs: number(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    max: number(process.env.RATE_LIMIT_MAX, 200),
  },
  mail: {
    from: process.env.MAIL_FROM || "CollegeHub <collegehub@app>",
    host: process.env.SMTP_HOST,
    port: number(process.env.SMTP_PORT, 587),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    secure: bool(process.env.SMTP_SECURE, false),
  },
};

if (!env.db.uri) {
  throw new Error("MONGODB_URI must be provided for super admin service");
}

if (!env.auth.email || !env.auth.password) {
  throw new Error(
    "SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD must be configured"
  );
}

export default env;
