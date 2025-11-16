import { verifyAccessToken, extractTokenFromHeader } from "../utils/jwt.js";
import revocationService from "../services/revocationService.js";
import { AppError, ERROR_CODES } from "../utils/AppError.js";
import logger from "../utils/logger.js";

/**
 * Authentication middleware
 * Verifies JWT access token and populates req.user
 */
export const authenticate = (req, res, next) => {
  try {
    // Prefer cookie over header (most secure for HttpOnly)
    let token = req.cookies?.accessToken;

    // Fallback to Authorization header if no cookie
    if (!token) {
      const authHeader = req.headers.authorization;
      token = extractTokenFromHeader(authHeader);
    }

    if (!token) {
      throw new AppError(
        ERROR_CODES.UNAUTHORIZED,
        "Authentication token is required",
        401
      );
    }

    // Check revocation list
    if (revocationService.isRevoked(token)) {
      throw new AppError(
        ERROR_CODES.TOKEN_REVOKED,
        "Token has been revoked",
        401
      );
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    req.user = {
      userId: decoded.userId,
      token,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      });
    }

    if (error.message === "ACCESS_TOKEN_EXPIRED") {
      return res.status(401).json({
        success: false,
        error: {
          code: ERROR_CODES.EXPIRED_TOKEN,
          message: "Access token has expired",
        },
      });
    }

    if (error.message === "INVALID_ACCESS_TOKEN") {
      return res.status(401).json({
        success: false,
        error: {
          code: ERROR_CODES.INVALID_TOKEN,
          message: "Invalid access token",
        },
      });
    }

    logger.error({ error }, "Authentication error");
    return res.status(401).json({
      success: false,
      error: {
        code: ERROR_CODES.UNAUTHORIZED,
        message: "Authentication failed",
      },
    });
  }
};

/**
 * Authorization middleware
 * Checks if user has required role
 */
export const authorize = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError(
          ERROR_CODES.UNAUTHORIZED,
          "User not authenticated",
          401
        );
      }

      // Get user to check role
      const User = (await import("../schemas/User.js")).default;
      const user = await User.findById(req.user.userId);

      if (!user) {
        throw new AppError(ERROR_CODES.USER_NOT_FOUND, "User not found", 404);
      }

      if (user.blocked) {
        throw new AppError(
          ERROR_CODES.USER_BLOCKED,
          "User account is blocked",
          403
        );
      }

      if (!allowedRoles.includes(user.role)) {
        throw new AppError(
          ERROR_CODES.INSUFFICIENT_ROLE,
          `This action requires one of the following roles: ${allowedRoles.join(
            ", "
          )}`,
          403
        );
      }

      req.user.role = user.role;
      req.user.userDoc = user;

      next();
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        });
      }

      logger.error({ error }, "Authorization error");
      return res.status(500).json({
        success: false,
        error: {
          code: ERROR_CODES.INTERNAL_SERVER_ERROR,
          message: "Authorization check failed",
        },
      });
    }
  };
};

/**
 * Optional authentication middleware
 * If token exists, populate req.user; otherwise continue
 */
export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (token && !revocationService.isRevoked(token)) {
      try {
        const decoded = verifyAccessToken(token);
        req.user = {
          userId: decoded.userId,
          token,
        };
      } catch (error) {
        // Ignore token errors, user is optional
      }
    }

    next();
  } catch (error) {
    next();
  }
};
