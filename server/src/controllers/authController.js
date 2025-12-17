import authService from "../services/authService.js";
import collegeRepository from "../repositories/collegeRepository.js";
import { AppError, ERROR_CODES } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Auth Controller
 * Thin controllers - all business logic delegated to services
 */

/**
 * POST /api/auth/signup
 */
export const signup = asyncHandler(async (req, res) => {
  const { name, email, password, phone, collegeId, collegeName } = req.body;

  let resolvedCollege = null;

  if (collegeId) {
    resolvedCollege = await collegeRepository.findById(collegeId);
    if (!resolvedCollege) {
      throw new AppError(
        ERROR_CODES.RESOURCE_NOT_FOUND,
        "College not found",
        404
      );
    }
  } else if (collegeName) {
    resolvedCollege = await collegeRepository.findOrCreateByName(collegeName);
  }

  if (!resolvedCollege) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      "College is required to create an account",
      400
    );
  }

  const result = await authService.signup(
    { name, email, password, phone },
    resolvedCollege._id
  );

  // Set secure HTTP-only cookies
  const accessTokenExpiry = 15; // minutes
  const refreshTokenExpiry = 7; // days

  res.cookie("accessToken", result.accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: accessTokenExpiry * 60 * 1000,
  });

  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: refreshTokenExpiry * 24 * 60 * 60 * 1000,
  });

  res.status(201).json({
    success: true,
    data: {
      user: result.user,
      message: "Signup successful",
    },
  });
});

/**
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await authService.login({ email, password });

  // Set secure HTTP-only cookies
  const accessTokenExpiry = parseInt(
    process.env.JWT_ACCESS_EXPIRY || "15m".match(/\d+/)[0]
  );
  const refreshTokenExpiry = parseInt(
    process.env.JWT_REFRESH_EXPIRY || "7d".match(/\d+/)[0]
  );

  res.cookie("accessToken", result.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    // sameSite: "strict",
    sameSite: "lax",

    maxAge: accessTokenExpiry * 60 * 1000, // Convert minutes to ms
  });

  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    // sameSite: "strict",
    sameSite: "lax",

    maxAge: refreshTokenExpiry * 24 * 60 * 60 * 1000, // Convert days to ms
  });

  res.status(200).json({
    success: true,
    data: {
      user: result.user,
      tokens: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        tokenType: result.tokenType,
      },
    },
  });
});

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token (from cookies only)
 */
export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Refresh token is required",
      },
    });
  }

  const result = await authService.refreshAccessToken(refreshToken);

  const accessTokenExpiryMinutes = parseInt(
    process.env.JWT_ACCESS_EXPIRY?.replace(/\D+/g, "") || "15",
    10
  );
  const refreshTokenExpiryDays = parseInt(
    process.env.JWT_REFRESH_EXPIRY?.replace(/\D+/g, "") || "7",
    10
  );

  res.cookie("accessToken", result.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: accessTokenExpiryMinutes * 60 * 1000,
  });

  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: refreshTokenExpiryDays * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    success: true,
    data: {
      message: "Token refreshed successfully",
      tokens: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        tokenType: result.tokenType,
      },
    },
  });
});

/**
 * POST /api/auth/logout
 */
export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.body.refreshToken || req.cookies.refreshToken;

  await authService.logout(req.user.userId, refreshToken);

  // Clear cookies
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  res.status(200).json({
    success: true,
    data: { message: "Logged out successfully" },
  });
});

/**
 * POST /api/auth/forgot-password
 * Request password reset token
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const result = await authService.requestPasswordReset(email);

  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  const result = await authService.resetPassword(token, password);

  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * POST /api/auth/request-verification
 * Request email verification
 */
export const requestEmailVerification = asyncHandler(async (req, res) => {
  const result = await authService.requestEmailVerification(req.user.userId);

  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * POST /api/auth/verify-email
 * Verify email with token
 */
export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;

  const result = await authService.verifyEmail(token);

  res.status(200).json({
    success: true,
    data: result,
  });
});
