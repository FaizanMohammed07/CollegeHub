/**
 * Async handler wrapper for express route handlers
 * Catches errors and passes them to the error middleware
 * Eliminates need for try-catch in every controller
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
