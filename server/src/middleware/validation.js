import { body, param, query, validationResult } from "express-validator";

/**
 * Validation middleware that processes validation results
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details: {
          fields: errors.array().map((err) => ({
            field: err.param,
            message: err.msg,
          })),
        },
      },
    });
  }
  next();
};

/**
 * Auth validation rules
 */
export const validateSignup = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2-100 characters"),
  body("email")
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage(
      "Password must contain uppercase, lowercase, number, and special character (@$!%*?&)"
    ),
  body("phone")
    .optional()
    .trim()
    .matches(/^\+?\d{7,15}$/)
    .withMessage("Phone must be 7-15 digits"),
  handleValidationErrors,
];

export const validateLogin = [
  body("email")
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
];

export const validateResetPassword = [
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage(
      "Password must contain uppercase, lowercase, number, and special character"
    ),
  body("token").notEmpty().withMessage("Reset token is required"),
  handleValidationErrors,
];

/**
 * User validation rules
 */
export const validateUpdateProfile = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2-100 characters"),
  body("phone")
    .optional()
    .trim()
    .matches(/^\+?\d{7,15}$/)
    .withMessage("Phone must be 7-15 digits"),
  body("profilePicUrl")
    .optional()
    .trim()
    .isURL()
    .withMessage("Profile picture must be a valid URL"),
  handleValidationErrors,
];

export const validateUpdateLocation = [
  body("latitude")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be between -90 and 90"),
  body("longitude")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be between -180 and 180"),
  handleValidationErrors,
];

/**
 * Club validation rules
 */
export const validateCreateClub = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Club name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Club name must be between 2-100 characters"),
  body("slug")
    .trim()
    .toLowerCase()
    .matches(/^[a-z0-9-]+$/)
    .withMessage(
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters"),
  body("category")
    .optional()
    .isIn([
      "academic",
      "cultural",
      "sports",
      "technical",
      "professional",
      "hobby",
      "other",
    ])
    .withMessage("Invalid category"),
  handleValidationErrors,
];

/**
 * Event validation rules
 */
export const validateCreateEvent = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Event title is required")
    .isLength({ min: 3, max: 200 })
    .withMessage("Title must be between 3-200 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage("Description cannot exceed 5000 characters"),
  body("startAt")
    .isISO8601()
    .withMessage("Start time must be a valid ISO 8601 date"),
  body("endAt")
    .isISO8601()
    .withMessage("End time must be a valid ISO 8601 date"),
  body("capacity")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Capacity must be a non-negative integer"),
  body("isPaid").optional().isBoolean().withMessage("isPaid must be a boolean"),
  body("priceInPaise")
    .if(() => body("isPaid").value === true)
    .isInt({ min: 0 })
    .withMessage("Price must be a non-negative integer"),
  body("location.address")
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage("Location address must be at least 3 characters"),
  handleValidationErrors,
];

/**
 * Registration validation rules
 */
export const validateRegisterEvent = [
  body("userCoordinates")
    .optional()
    .custom((value) => {
      if (value && (!value.latitude || !value.longitude)) {
        throw new Error("Both latitude and longitude are required");
      }
      return true;
    }),
  handleValidationErrors,
];

/**
 * ID validation
 */
export const validateObjectId = (paramName = "id") => [
  param(paramName)
    .matches(/^[0-9a-fA-F]{24}$/)
    .withMessage(`Invalid ${paramName} format`),
  handleValidationErrors,
];
