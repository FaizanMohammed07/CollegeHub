import { AppError, ERROR_CODES } from "../utils/AppError.js";
import logger from "../utils/logger.js";

/**
 * Global error handler middleware
 * Should be registered last in middleware chain
 */
export const errorHandler = (err, req, res, next) => {
  // Ensure we always have proper error structure
  let error = err;

  // Convert Mongoose validation errors
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
    error = new AppError(ERROR_CODES.VALIDATION_ERROR, messages, 400, {
      fields: Object.keys(err.errors),
    });
  }

  // Convert Mongoose duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    error = new AppError(
      ERROR_CODES.RESOURCE_ALREADY_EXISTS,
      `A resource with this ${field} already exists`,
      409,
      { field }
    );
  }

  // Convert JWT errors
  if (err.name === "JsonWebTokenError") {
    error = new AppError(
      ERROR_CODES.INVALID_TOKEN,
      "Invalid token format",
      401
    );
  }

  // Ensure error is AppError instance
  if (!(error instanceof AppError)) {
    logger.error({ error: err }, "Unhandled error");
    error = new AppError(
      ERROR_CODES.INTERNAL_SERVER_ERROR,
      "Internal server error occurred",
      500
    );
  }

  // Log error details
  logger.error(
    {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      details: error.details,
      path: req.path,
      method: req.method,
      userId: req.user?.userId,
    },
    "Error occurred"
  );

  // Send error response
  res.status(error.statusCode).json({
    success: false,
    error: {
      code: error.code,
      message: error.message,
      ...(error.details && { details: error.details }),
    },
  });
};

/**
 * 404 handler middleware
 * Should be registered before error handler
 */
export const notFoundHandler = (req, res, next) => {
  const error = new AppError(
    "NOT_FOUND",
    `Route ${req.method} ${req.path} not found`,
    404
  );
  next(error);
};
