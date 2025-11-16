import jwt from "jsonwebtoken";
import env from "../config/env.js";

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const [, token] = authHeader.split(" ");

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Authentication token missing",
      });
    }

    const payload = jwt.verify(token, env.auth.jwtSecret);

    if (payload.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        error: "Insufficient permissions",
      });
    }

    if (
      env.auth.enforceIpWhitelist &&
      env.auth.trustedIps.length > 0 &&
      !env.auth.trustedIps.includes(req.ip)
    ) {
      return res.status(403).json({
        success: false,
        error: "IP address not allowed",
      });
    }

    req.superAdmin = payload;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: "Invalid or expired token",
    });
  }
};
