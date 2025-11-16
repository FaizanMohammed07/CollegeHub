import jwt from "jsonwebtoken";
import logger from "./logger.js";

/**
 * JWT utility functions for token generation, validation, and rotation
 */

export const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRY || "15m",
    algorithm: "HS256",
  });
};

export const generateRefreshToken = (userId) => {
  return jwt.sign({ userId, type: "refresh" }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRY || "7d",
    algorithm: "HS256",
  });
};

export const generateResetPasswordToken = (userId, email) => {
  return jwt.sign(
    { userId, email, type: "password-reset" },
    process.env.JWT_RESET_PASSWORD_SECRET,
    {
      expiresIn: process.env.JWT_RESET_PASSWORD_EXPIRY || "30m",
      algorithm: "HS256",
    }
  );
};

export const generateVerificationToken = (userId, email) => {
  return jwt.sign(
    { userId, email, type: "email-verification" },
    process.env.JWT_VERIFICATION_SECRET,
    {
      expiresIn: process.env.JWT_VERIFICATION_EXPIRY || "24h",
      algorithm: "HS256",
    }
  );
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
      algorithms: ["HS256"],
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("ACCESS_TOKEN_EXPIRED");
    }
    if (error.name === "JsonWebTokenError") {
      throw new Error("INVALID_ACCESS_TOKEN");
    }
    throw error;
  }
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
      algorithms: ["HS256"],
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("REFRESH_TOKEN_EXPIRED");
    }
    if (error.name === "JsonWebTokenError") {
      throw new Error("INVALID_REFRESH_TOKEN");
    }
    throw error;
  }
};

/**
 * Verify reset password token
 */
export const verifyResetPasswordToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_RESET_PASSWORD_SECRET, {
      algorithms: ["HS256"],
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("RESET_TOKEN_EXPIRED");
    }
    throw error;
  }
};

/**
 * Verify email verification token
 */
export const verifyVerificationToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_VERIFICATION_SECRET, {
      algorithms: ["HS256"],
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("VERIFICATION_TOKEN_EXPIRED");
    }
    throw error;
  }
};

/**
 * Extract token from authorization header
 */
export const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
};

/**
 * Generate QR token for check-in (signed with secret)
 */
export const generateQRToken = (registrationId, eventId) => {
  return jwt.sign(
    {
      registrationId,
      eventId,
      type: "qr-checkin",
      issuedAt: new Date().toISOString(),
    },
    process.env.QR_SIGN_SECRET || "default-qr-secret",
    {
      expiresIn: "24h",
      algorithm: "HS256",
    }
  );
};

/**
 * Verify QR token
 */
export const verifyQRToken = (token) => {
  try {
    return jwt.verify(
      token,
      process.env.QR_SIGN_SECRET || "default-qr-secret",
      {
        algorithms: ["HS256"],
      }
    );
  } catch (error) {
    logger.error({ error }, "QR token verification failed");
    throw new Error("INVALID_QR_TOKEN");
  }
};
