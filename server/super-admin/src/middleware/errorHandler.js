import logger from "../utils/logger.js";

export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
};

export const errorHandler = (err, req, res, next) => {
  logger.error({ error: err }, "Super admin error");
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    error: err.message || "Internal server error",
    details: err.details,
  });
};
